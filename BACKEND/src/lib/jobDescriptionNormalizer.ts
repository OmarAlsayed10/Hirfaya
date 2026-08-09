export type JobDescriptionSourceFormat = "plain" | "html";

export interface NormalizedJobDescription {
  plainText: string;
  sourceFormat: JobDescriptionSourceFormat;
}

const MAX_DESCRIPTION_LENGTH = 20_000;

const MOJIBAKE_REPAIRS: Array<[RegExp, string]> = [
  [/\u00e2\u0080\u0098/g, "\u2018"],
  [/\u00e2\u0080\u0099/g, "\u2019"],
  [/\u00e2\u20ac\u2122/g, "\u2019"],
  [/\u00e2\u0080\u009c/g, "\u201c"],
  [/\u00e2\u0080\u009d/g, "\u201d"],
  [/\u00e2\u0080\u0093/g, "\u2013"],
  [/\u00e2\u0080\u0094/g, "\u2014"],
  [/\u00e2\u0080\u00a2/g, "\u2022"],
  [/\u00e2\u0080\u00a6/g, "\u2026"],
  [/\u00c2\u00a0/g, " "],
  [/\u00c2\u00b7/g, "\u00b7"],
  [/\u00e2\u0084\u00a2/g, "\u2122"],
  [/\u00c2\u00ae/g, "\u00ae"],
  [/\u00c2\u00a9/g, "\u00a9"],
];

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", apos: "'", gt: ">", ldquo: "\u201c", lsquo: "\u2018", lt: "<", mdash: "\u2014",
  nbsp: " ", ndash: "\u2013", quot: '"', rdquo: "\u201d", rsquo: "\u2019",
};

const HTML_TAG_NAMES = new Set([
  "a", "address", "article", "aside", "b", "blockquote", "br", "div", "dl", "dt", "dd", "em", "fieldset", "figcaption", "figure", "footer", "form", "header", "hr", "i", "li", "main", "nav", "ol", "p", "pre", "script", "section", "span", "strong", "style", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul", "h1", "h2", "h3", "h4", "h5", "h6",
]);
const BLOCK_TAG_NAMES = new Set([
  "address", "article", "aside", "blockquote", "div", "dl", "dt", "dd", "fieldset", "figcaption", "figure", "footer", "form", "header", "hr", "main", "nav", "ol", "p", "pre", "section", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul", "h1", "h2", "h3", "h4", "h5", "h6",
]);
const ACTIVE_CONTENT_TAGS = new Set(["script", "style"]);

interface HtmlToken {
  end: number;
  isClosing: boolean;
  name: string;
}

export function normalizeJobDescription(raw: string): NormalizedJobDescription {
  const decodedDescription = decodeEntities(repairJobDescriptionMojibake(raw));
  const sourceFormat = containsRecognizedHtmlTag(decodedDescription) ? "html" : "plain";
  const sourceText = sourceFormat === "html" ? stripMarkup(decodedDescription) : decodedDescription;
  const plainText = normalizeWhitespace(sourceText);

  return { plainText: limitCodePoints(plainText), sourceFormat };
}

export function repairJobDescriptionMojibake(text: string): string {
  return MOJIBAKE_REPAIRS.reduce(
    (repairedText, [pattern, replacement]) => repairedText.replace(pattern, replacement),
    text,
  );
}

function normalizeWhitespace(description: string): string {
  return description
    .replace(/\r\n?/g, "\n")
    .replace(/[\u00a0\u200b]/g, " ")
    .replace(/[\u00ad\ufeff]/g, "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function limitCodePoints(description: string): string {
  return Array.from(description).slice(0, MAX_DESCRIPTION_LENGTH).join("");
}

function containsRecognizedHtmlTag(description: string): boolean {
  for (let index = 0; index < description.length; index++) {
    if (description[index] === "<" && readHtmlToken(description, index)) return true;
  }
  return false;
}

function stripMarkup(description: string): string {
  let plainText = "";
  for (let index = 0; index < description.length;) {
    const token = description[index] === "<" ? readHtmlToken(description, index) : null;
    if (!token) {
      plainText += description[index++];
      continue;
    }
    if (!token.isClosing && ACTIVE_CONTENT_TAGS.has(token.name)) {
      const closingTag = new RegExp(`<\\s*/\\s*${token.name}\\s*>`, "i");
      const closingMatch = closingTag.exec(description.slice(token.end));
      if (!closingMatch) break;
      index = token.end + closingMatch.index + closingMatch[0].length;
      continue;
    }
    plainText += token.name === "br" || BLOCK_TAG_NAMES.has(token.name)
      ? "\n"
      : token.name === "li" && !token.isClosing ? "\n- " : "";
    index = token.end;
  }
  return plainText;
}

function readHtmlToken(description: string, start: number): HtmlToken | null {
  const end = description.indexOf(">", start + 1);
  if (end === -1) return null;
  const match = /^<\s*(\/?)\s*([a-z][a-z0-9]*)\b[^>]*>$/i.exec(description.slice(start, end + 1));
  if (!match || !HTML_TAG_NAMES.has(match[2].toLowerCase())) return null;
  return { end: end + 1, isClosing: match[1] === "/", name: match[2].toLowerCase() };
}

function decodeEntities(description: string): string {
  return description.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, token: string) => {
    const namedEntity = NAMED_ENTITIES[token.toLowerCase()];
    if (namedEntity) return namedEntity;

    const codePoint = token.startsWith("#x") || token.startsWith("#X")
      ? Number.parseInt(token.slice(2), 16)
      : Number.parseInt(token.slice(1), 10);

    return isSafeTextCodePoint(codePoint) ? String.fromCodePoint(codePoint) : "";
  });
}

function isSafeTextCodePoint(codePoint: number): boolean {
  return Number.isInteger(codePoint) && codePoint <= 0x10ffff && codePoint !== 0
    && !(codePoint >= 0xd800 && codePoint <= 0xdfff) && !(codePoint >= 0x7f && codePoint <= 0x9f);
}
