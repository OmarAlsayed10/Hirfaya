import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { readFile } from "node:fs/promises";

// og:image and canonical need an absolute URL. Injecting them here rather than
// via %VITE_SITE_URL% in index.html means an unset domain omits the tags
// instead of shipping a literal placeholder as the value.
const absoluteUrlTags = (mode: string) => ({
  name: "absolute-url-tags",
  transformIndexHtml: () => {
    const site = (loadEnv(mode, process.cwd(), "VITE_").VITE_SITE_URL ?? "").replace(/\/+$/, "");
    if (!site) return [];
    return [
      { tag: "link", attrs: { rel: "canonical", href: `${site}/` }, injectTo: "head" as const },
      { tag: "meta", attrs: { property: "og:url", content: `${site}/` }, injectTo: "head" as const },
      {
        tag: "meta",
        attrs: { property: "og:image", content: `${site}/logo3.PNG` },
        injectTo: "head" as const,
      },
    ];
  },
});

// @react-pdf/textkit reorders a bidi line by walking reordered character indices and
// pulling each glyph out of whichever run happens to hold it, then dropping it into the
// run currently being rebuilt. A run carries the font, so on a line that mixes weights or
// scripts the glyphs land under the wrong one: half a word turns bold, and a lone Arabic
// letter between Latin words comes out as an unrelated Latin glyph. The index arithmetic
// also collapses ligatures by glyph id, losing letters. Upstream 6.3.0 is identical, so
// there is nothing to upgrade to.
//
// The Unicode reordering algorithm never moves a glyph between runs. Runs already carry a
// uniform bidi level, so reversing the glyphs inside each right-to-left run and then
// reversing runs by descending level (rule L2) is both correct and index-free.
const TEXTKIT_REORDER_ANCHOR = `const reorderLine = (line) => {
    const levels = getBidiLevels$1(line.runs);
    const direction = line.runs[0]?.attributes.direction;
    const level = direction === 'rtl' ? 1 : 0;
    const end = length$1(line) - 1;
    const paragraphs = [{ start: 0, end, level }];
    const embeddingLevels = { paragraphs, levels };
    const segments = bidi$2.getReorderSegments(line.string, embeddingLevels);
    // No need for bidi reordering
    if (segments.length === 0)
        return line;
    const indices = getReorderedIndices(line.string, segments);
    const updatedString = bidi$2.getReorderedString(line.string, embeddingLevels);
    const updatedRuns = line.runs.map((run) => {
        const selectedIndices = indices.slice(run.start, run.end);
        const updatedGlyphs = [];
        const updatedPositions = [];
        const addedGlyphs = new Set();
        for (let i = 0; i < selectedIndices.length; i += 1) {
            const index = selectedIndices[i];
            const glyph = getItemAtIndex(line.runs, 'glyphs', index);
            if (addedGlyphs.has(glyph.id))
                continue;
            updatedGlyphs.push(glyph);
            updatedPositions.push(getItemAtIndex(line.runs, 'positions', index));
            if (glyph.isLigature) {
                addedGlyphs.add(glyph.id);
            }
        }
        return {
            ...run,
            glyphs: updatedGlyphs,
            positions: updatedPositions,
        };
    });
    return {
        box: line.box,
        runs: updatedRuns,
        string: updatedString,
    };
};`;

const TEXTKIT_REORDER_REPLACEMENT = `const runBidiLevel = (run) => run.attributes?.bidiLevel || 0;
const reverseRunGlyphs = (run) => ({
    ...run,
    glyphs: (run.glyphs || []).slice().reverse(),
    positions: (run.positions || []).slice().reverse(),
});
const reorderRunsByLevel = (runs) => {
    const levels = runs.map(runBidiLevel);
    const highest = Math.max(...levels);
    let lowestOdd = highest + 1;
    for (const value of levels) {
        if (value % 2 === 1 && value < lowestOdd)
            lowestOdd = value;
    }
    const ordered = runs.slice();
    for (let level = highest; level >= lowestOdd; level -= 1) {
        let index = 0;
        while (index < ordered.length) {
            if (runBidiLevel(ordered[index]) < level) {
                index += 1;
                continue;
            }
            let last = index;
            while (last + 1 < ordered.length && runBidiLevel(ordered[last + 1]) >= level)
                last += 1;
            const segment = ordered.slice(index, last + 1).reverse();
            for (let offset = 0; offset < segment.length; offset += 1)
                ordered[index + offset] = segment[offset];
            index = last + 1;
        }
    }
    return ordered;
};
const reorderLine = (line) => {
    if (!line.runs.some((run) => runBidiLevel(run) % 2 === 1))
        return line;
    const direction = line.runs[0]?.attributes.direction;
    const paragraphs = [{ start: 0, end: length$1(line) - 1, level: direction === 'rtl' ? 1 : 0 }];
    const embeddingLevels = { paragraphs, levels: getBidiLevels$1(line.runs) };
    const visualRuns = line.runs.map((run) => (runBidiLevel(run) % 2 === 1 ? reverseRunGlyphs(run) : run));
    return {
        box: line.box,
        runs: reorderRunsByLevel(visualRuns),
        string: bidi$2.getReorderedString(line.string, embeddingLevels),
    };
};`;

// NFD is there so a font can compose Latin accents itself. Applied to Arabic it splits
// أ إ آ ؤ ئ into a bare letter plus a combining hamza that Cairo cannot position, which
// litters the text with stray marks. Every Arabic font draws these precomposed.
const TEXTKIT_DECOMPOSE_ANCHOR = `            const runString = isCustomFont(run)
                ? rawString.normalize('NFD')
                : rawString;`;

const TEXTKIT_DECOMPOSE_REPLACEMENT = `            const runString = isCustomFont(run)
                ? rawString.normalize('NFD').replace(/[\\u0627\\u0648\\u064A\\u06D5\\u06C1\\u06D2][\\u0653-\\u0655]/g, (pair) => pair.normalize('NFC'))
                : rawString;`;

const patchTextkitBidi = (code: string) =>
  code
    .replace(TEXTKIT_REORDER_ANCHOR, TEXTKIT_REORDER_REPLACEMENT)
    .replace(TEXTKIT_DECOMPOSE_ANCHOR, TEXTKIT_DECOMPOSE_REPLACEMENT);

// @react-pdf/render converts glyph advances from points into the 1000-unit text space it
// writes to the PDF, but leaves xOffset and yOffset in points. _renderGlyphs then scales
// them by fontSize/1000, so every offset lands at a thousandth of its size — effectively
// discarded, while the matching advance reduction still applies. A glyph that a font tucks
// towards its neighbour therefore stays put and overruns the character after it. Arabic
// fonts kern this way constantly, which is what glued Arabic words together.
const RENDER_OFFSET_ANCHOR = `        xOffset: pos.xOffset,
        yOffset: pos.yOffset,`;
const scaleGlyphOffsets = (code: string) =>
  code.replace(
    RENDER_OFFSET_ANCHOR,
    `        xOffset: pos.xOffset * scale,
        yOffset: pos.yOffset * scale,`,
  );

// direction is an inherited property in CSS, but @react-pdf/layout leaves it out of the
// inheritable list, so `direction: 'rtl'` on a Page never reaches its Text nodes. The bidi
// engine then reads the default 'ltr' and resolves an Arabic sentence as a left-to-right
// paragraph, which leaves embedded Latin at level 0 and stops the run order from being
// reversed at all. Inheriting it also gives Arabic text its right alignment for free.
const LAYOUT_INHERIT_ANCHOR = `const BASE_INHERITABLE_PROPERTIES = [
    'color',`;
const inheritDirection = (code: string) =>
  code.replace(
    LAYOUT_INHERIT_ANCHOR,
    `const BASE_INHERITABLE_PROPERTIES = [
    'direction',
    'color',`,
  );

// Each of these packages ships a single lib bundle, so a file that matches the package but
// comes out unchanged means an upgrade moved the code these patches anchor to. Failing the
// build is the point: silently shipping unpatched Arabic is what this all exists to stop.
const REACT_PDF_PATCHES: [string, (code: string) => string][] = [
  ["@react-pdf/layout", inheritDirection],
  ["@react-pdf/textkit", patchTextkitBidi],
  ["@react-pdf/render", scaleGlyphOffsets],
];

// The trailing slash matters: @react-pdf/renderer contains @react-pdf/render.
const patchReactPdf = (code: string, id: string) => {
  const path = id.replace(/\\/g, "/");
  const match = REACT_PDF_PATCHES.find(([name]) => path.includes(`${name}/`));
  if (!match) return code;
  const patched = match[1](code);
  if (patched === code) {
    throw new Error(
      `Arabic PDF patch for ${match[0]} no longer applies. Re-anchor it in vite.config.ts against the upgraded source before shipping.`,
    );
  }
  return patched;
};

// The production build goes through rollup, so a normal Vite transform covers it.
const patchReactPdfArabic = () => ({
  name: "patch-react-pdf-arabic",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    const patched = patchReactPdf(code, id);
    return patched === code ? null : { code: patched, map: null };
  },
});

// Dev serves these from the esbuild dep pre-bundle, which rollup plugins never see.
// Excluding them from optimizeDeps is not an option: they pull CJS dependencies that then
// fail to interop. Patch them inside the pre-bundle instead.
const patchReactPdfInDepScan = {
  name: "patch-react-pdf-arabic-esbuild",
  setup(build: {
    onLoad: (
      options: { filter: RegExp },
      callback: (args: { path: string }) => Promise<{ contents: string; loader: "js" } | null>,
    ) => void;
  }) {
    build.onLoad({ filter: /@react-pdf[\\/](textkit|render|layout)[\\/].*\.js$/ }, async ({ path }) => {
      const source = await readFile(path, "utf8");
      const patched = patchReactPdf(source, path.replace(/\\/g, "/"));
      return patched === source ? null : { contents: patched, loader: "js" as const };
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), absoluteUrlTags(mode), patchReactPdfArabic()],
  optimizeDeps: {
    esbuildOptions: { plugins: [patchReactPdfInDepScan] },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
}));
