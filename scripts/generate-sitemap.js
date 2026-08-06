import { writeFile } from "node:fs/promises";
import { author, categoryMeta, escapeXml, getTagMap, loadPosts, siteUrl, slugifyTag } from "./site-helpers.js";

const posts = await loadPosts();
const tagMap = getTagMap(posts);

const staticPaths = [
  { path: "/", lastmod: latestUpdated(posts), priority: "1.0", changefreq: "weekly" },
  { path: "/about/", priority: "0.6", changefreq: "monthly" },
  { path: "/contact/", priority: "0.5", changefreq: "monthly" },
  { path: "/upload/", priority: "0.4", changefreq: "monthly" },
  { path: "/report/", priority: "0.4", changefreq: "monthly" },
  { path: "/policy/editorial/", priority: "0.5", changefreq: "monthly" },
  { path: "/policy/privacy/", priority: "0.5", changefreq: "monthly" },
  { path: "/policy/terms/", priority: "0.5", changefreq: "monthly" },
  { path: author.path, priority: "0.7", changefreq: "weekly", lastmod: latestUpdated(posts) },
];

const categoryPaths = Object.keys(categoryMeta)
  .filter((category) => posts.some((post) => post.category === category))
  .map((category) => ({
    path: `/category/${category}/`,
    priority: "0.7",
    changefreq: "weekly",
    lastmod: latestUpdated(posts.filter((post) => post.category === category)),
  }));

const tagPaths = [...tagMap.entries()]
  .filter(([, list]) => list.length >= 2)
  .map(([tag, list]) => ({
    path: `/tag/${slugifyTag(tag)}/`,
    priority: "0.6",
    changefreq: "weekly",
    lastmod: latestUpdated(list),
  }));

const postPaths = posts.map((post) => ({
  path: post.path,
  priority: "0.8",
  changefreq: "monthly",
  lastmod: post.updatedAt || post.publishedAt,
}));

const urls = [...staticPaths, ...categoryPaths, ...tagPaths, ...postPaths];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(renderUrl).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

User-agent: Mediapartners-Google
Allow: /

User-agent: AdsBot-Google
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

await writeFile("public/sitemap.xml", sitemap, "utf8");
await writeFile("public/robots.txt", robots, "utf8");
console.log(`Generated sitemap and robots.txt for ${urls.length} URLs`);

function renderUrl(url) {
  return `  <url>
    <loc>${escapeXml(encodeURI(`${siteUrl}${url.path}`))}</loc>
    <lastmod>${new Date(url.lastmod || latestUpdated(posts)).toISOString().slice(0, 10)}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
}

function latestUpdated(items) {
  return items
    .map((item) => item.updatedAt || item.publishedAt)
    .sort((a, b) => new Date(b) - new Date(a))[0];
}
