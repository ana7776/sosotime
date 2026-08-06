import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const posts = JSON.parse(readFileSync("public/data/posts.json", "utf8")).filter((post) => post.status === "published");
const htmlFiles = [];
const errors = [];
const bannedWords = ["큐레이션", "출처", "원문", "미리보기", "제보"];

walk("public");

for (const post of posts) {
  const bodyLength = post.body.reduce((sum, section) => sum + section.paragraphs.reduce((acc, paragraph) => acc + paragraph.length, 0), 0);
  if (bodyLength < 1200) errors.push(`본문 길이 부족: ${post.slug} (${bodyLength})`);
  if (!Array.isArray(post.body) || post.body.length < 4) errors.push(`섹션 수 부족: ${post.slug}`);
}

for (const file of htmlFiles) {
  if (file.endsWith("naverc7c0e732650944fa27af2716d6a5a94c.html")) continue;

  const html = readFileSync(file, "utf8");
  const h1Count = countMatches(html, /<h1\b/gi);
  if (h1Count !== 1) errors.push(`H1 개수 오류: ${file} (${h1Count})`);

  for (const word of bannedWords) {
    if (html.includes(word)) errors.push(`금지 문구 발견: ${file} (${word})`);
  }

  if (html.includes("?category=")) errors.push(`카테고리 쿼리 링크 잔존: ${file}`);
  if (!html.includes('href="/rss.xml"')) errors.push(`RSS 링크 누락: ${file}`);
  if (!html.includes("/policy/privacy/") || !html.includes("/contact/")) errors.push(`필수 하단 링크 누락: ${file}`);
}

const ads = existsSync("public/ads.txt") ? readFileSync("public/ads.txt", "utf8").trim() : "";
if (ads !== "google.com, pub-5804969457082424, DIRECT, f08c47fec0942fa0") {
  errors.push("ads.txt 내용이 기대값과 다릅니다.");
}

const sitemap = existsSync("public/sitemap.xml") ? readFileSync("public/sitemap.xml", "utf8") : "";
const locCount = countMatches(sitemap, /<loc>/g);
const lastmodCount = countMatches(sitemap, /<lastmod>/g);
if (locCount !== lastmodCount) errors.push(`sitemap lastmod 개수 불일치: loc=${locCount}, lastmod=${lastmodCount}`);

const robots = existsSync("public/robots.txt") ? readFileSync("public/robots.txt", "utf8") : "";
if (robots.includes("Disallow: /*?")) errors.push("robots.txt에 쿼리 차단 규칙이 남아 있습니다.");

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
