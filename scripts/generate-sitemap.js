import { readFile, writeFile } from "node:fs/promises";

const siteUrl = process.env.SITE_URL || "https://harusoso.pages.dev";
const posts = JSON.parse(await readFile("public/data/posts.json", "utf8"));
const staticPaths = ["/", "/contact.html", "/policy/privacy.html", "/policy/terms.html"];

const urls = [
  ...staticPaths.map((path) => ({ loc: `${siteUrl}${path}`, priority: path === "/" ? "1.0" : "0.5" })),
  ...posts.map((post) => ({ loc: `${siteUrl}/?post=${post.slug}`, priority: "0.7" }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url.loc}</loc><priority>${url.priority}</priority></url>`).join("\n")}
</urlset>
`;

await writeFile("public/sitemap.xml", sitemap, "utf8");
console.log(`Generated sitemap for ${urls.length} URLs`);
