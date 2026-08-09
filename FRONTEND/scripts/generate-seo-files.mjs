import { mkdir, writeFile } from "node:fs/promises";

// robots.txt and sitemap.xml need absolute URLs, and public/ is copied verbatim
// without env substitution, so they are written at build time instead.
const site = (process.env.VITE_SITE_URL ?? "").replace(/\/+$/, "");

if (!site) {
  console.warn("VITE_SITE_URL is not set — skipping robots.txt and sitemap.xml.");
  process.exit(0);
}

const apiBase = (process.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

// Public, indexable routes only. Anything behind ProtectedRoute is useless to a
// crawler and is excluded in robots.txt below.
const routes = [
  ["/", "1.0"],
  ["/pricing", "0.9"],
  ["/templates", "0.8"],
  ["/Blogs", "0.8"],
  ["/cv-analysis", "0.8"],
  ["/grammarCheck", "0.7"],
  ["/help", "0.5"],
  ["/terms", "0.3"],
  ["/privacy", "0.3"],
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([path, priority]) => `  <url><loc>${site}${path}</loc><priority>${priority}</priority></url>`).join("\n")}
</urlset>
`;

// Blog posts live in the DB, so the API serves that sitemap. Google accepts a
// cross-host sitemap when it is declared in robots.txt.
const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /settings
Disallow: /builder
Disallow: /getStart
Disallow: /onboarding
Disallow: /create
Disallow: /documents
Disallow: /career-match
Disallow: /job-radar
Disallow: /applications
Disallow: /roadmap
Disallow: /chatbot
Disallow: /payment-check
Disallow: /buy-credits
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /auth

Sitemap: ${site}/sitemap.xml
${apiBase ? `Sitemap: ${apiBase}/blogs/sitemap.xml\n` : ""}`;

await mkdir("public", { recursive: true });
await writeFile("public/sitemap.xml", sitemap);
await writeFile("public/robots.txt", robots);
console.log(`Wrote public/robots.txt and public/sitemap.xml for ${site}`);
