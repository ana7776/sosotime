import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const siteUrl = (process.env.SITE_URL || "https://sosotime.com").replace(/\/$/, "");
const posts = JSON.parse(readFileSync("public/data/posts.json", "utf8")).filter((post) => post.status === "published");
const htmlFiles = [];
const errors = [];

walk("public");

for (const post of posts) {
  if (!/^\/posts\/[^0-9][^/]*\/$/.test(post.path)) {
    errors.push(`Post URL should use a title slug: ${post.id} ${post.path}`);
  }

  const textFields = [
    post.title,
    post.description,
    post.summary,
    post.curatorComment,
    ...(post.tags || []),
    ...(post.body || []).flatMap((section) => [section.heading, ...(section.paragraphs || [])]),
  ];

  if (textFields.some(hasBrokenPlaceholderText)) {
    errors.push(`Post appears to contain broken placeholder text: ${post.id} ${post.path}`);
  }

  if (!Array.isArray(post.body) || post.body.length < 4) {
    errors.push(`Post should have at least 4 body sections: ${post.id} ${post.path}`);
  }
}

for (const file of htmlFiles) {
  if (file.endsWith("naverc7c0e732650944fa27af2716d6a5a94c.html")) continue;

  const html = readFileSync(file, "utf8");
  const h1Count = countMatches(html, /<h1\b/gi);
  if (h1Count !== 1) errors.push(`${file} should contain exactly one h1, found ${h1Count}`);

  if (!html.includes("/policy/privacy") || !html.includes("/contact")) {
    errors.push(`${file} is missing required footer links`);
  }

  const headings = [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
  for (let index = 1; index < headings.length; index += 1) {
    if (headings[index] - headings[index - 1] > 1) {
      errors.push(`${file} skips heading levels: ${headings.join(" > ")}`);
      break;
    }
  }
}

const robots = existsSync("public/robots.txt") ? readFileSync("public/robots.txt", "utf8") : "";
if (!/User-agent:\s*Googlebot/i.test(robots) || !robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
  errors.push("robots.txt should allow Googlebot and reference sitemap.xml");
}

const sitemap = existsSync("public/sitemap.xml") ? readFileSync("public/sitemap.xml", "utf8") : "";
for (const post of posts) {
  const loc = encodeURI(`${siteUrl}${post.path}`);
  if (!sitemap.includes(loc)) errors.push(`sitemap.xml is missing ${post.path}`);
}

const categoryCounts = posts.reduce((counts, post) => {
  counts[post.category] = (counts[post.category] || 0) + 1;
  return counts;
}, {});

for (const [category, count] of Object.entries(categoryCounts)) {
  if (count <= 0) errors.push(`Empty category should not be exposed: ${category}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`SEO validation passed for ${posts.length} posts and ${htmlFiles.length} HTML files`);

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith(".html")) htmlFiles.push(target);
  }
}

function countMatches(value, regex) {
  return [...value.matchAll(regex)].length;
}

function hasBrokenPlaceholderText(value) {
  if (typeof value !== "string") return false;
  const questionMarks = countMatches(value, /\?/g);
  const hangul = countMatches(value, /[가-힣]/g);
  return questionMarks >= 3 && hangul === 0;
}
