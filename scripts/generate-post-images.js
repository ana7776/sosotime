import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const postsFile = "public/data/posts.json";
const outputDir = "public/assets/posts";
const posts = JSON.parse(await readFile(postsFile, "utf8"));

const categoryStyles = {
  funny: { label: "유머", bg: "#f8efe7", ink: "#34251d", accent: "#c4492d" },
  empathy: { label: "공감", bg: "#eaf5f1", ink: "#1f332e", accent: "#1f6f5b" },
  issue: { label: "이슈", bg: "#eef2f8", ink: "#222b3a", accent: "#3b5b92" },
  life: { label: "생활", bg: "#f6f3e8", ink: "#302b1f", accent: "#8a6f2a" },
  info: { label: "정보", bg: "#edf5fb", ink: "#1f2e37", accent: "#2d6f8f" }
};

const categoryIcons = {
  funny: (cx, cy, r, color, opacity) => `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${r * 0.07}" opacity="${opacity}" />
    <circle cx="${cx - r * 0.36}" cy="${cy - r * 0.18}" r="${r * 0.09}" fill="${color}" opacity="${opacity}" />
    <circle cx="${cx + r * 0.36}" cy="${cy - r * 0.18}" r="${r * 0.09}" fill="${color}" opacity="${opacity}" />
    <path d="M ${cx - r * 0.42} ${cy + r * 0.16} Q ${cx} ${cy + r * 0.62} ${cx + r * 0.42} ${cy + r * 0.16}" fill="none" stroke="${color}" stroke-width="${r * 0.07}" stroke-linecap="round" opacity="${opacity}" />
  `,
  empathy: (cx, cy, r, color, opacity) => `
    <path d="M ${cx} ${cy + r * 0.55}
      C ${cx - r * 0.95} ${cy - r * 0.05}, ${cx - r * 0.55} ${cy - r * 0.95}, ${cx} ${cy - r * 0.35}
      C ${cx + r * 0.55} ${cy - r * 0.95}, ${cx + r * 0.95} ${cy - r * 0.05}, ${cx} ${cy + r * 0.55} Z"
      fill="none" stroke="${color}" stroke-width="${r * 0.09}" stroke-linejoin="round" opacity="${opacity}" />
  `,
  issue: (cx, cy, r, color, opacity) => `
    <rect x="${cx - r * 0.85}" y="${cy - r * 0.7}" width="${r * 1.7}" height="${r * 1.15}" rx="${r * 0.28}" fill="none" stroke="${color}" stroke-width="${r * 0.08}" opacity="${opacity}" />
    <path d="M ${cx - r * 0.25} ${cy + r * 0.45} L ${cx - r * 0.4} ${cy + r * 0.85} L ${cx + r * 0.05} ${cy + r * 0.45} Z" fill="${color}" opacity="${opacity}" />
    <line x1="${cx}" y1="${cy - r * 0.4}" x2="${cx}" y2="${cy - r * 0.02}" stroke="${color}" stroke-width="${r * 0.09}" stroke-linecap="round" opacity="${opacity}" />
    <circle cx="${cx}" cy="${cy + r * 0.22}" r="${r * 0.055}" fill="${color}" opacity="${opacity}" />
  `,
  life: (cx, cy, r, color, opacity) => `
    <path d="M ${cx - r * 0.9} ${cy + r * 0.1} L ${cx} ${cy - r * 0.65} L ${cx + r * 0.9} ${cy + r * 0.1}"
      fill="none" stroke="${color}" stroke-width="${r * 0.09}" stroke-linejoin="round" stroke-linecap="round" opacity="${opacity}" />
    <rect x="${cx - r * 0.6}" y="${cy + r * 0.05}" width="${r * 1.2}" height="${r * 0.72}" fill="none" stroke="${color}" stroke-width="${r * 0.08}" opacity="${opacity}" />
    <rect x="${cx - r * 0.16}" y="${cy + r * 0.36}" width="${r * 0.32}" height="${r * 0.41}" fill="${color}" opacity="${opacity}" />
  `,
  info: (cx, cy, r, color, opacity) => `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${r * 0.08}" opacity="${opacity}" />
    <circle cx="${cx}" cy="${cy - r * 0.42}" r="${r * 0.1}" fill="${color}" opacity="${opacity}" />
    <line x1="${cx}" y1="${cy - r * 0.12}" x2="${cx}" y2="${cy + r * 0.48}" stroke="${color}" stroke-width="${r * 0.1}" stroke-linecap="round" opacity="${opacity}" />
  `,
};

await mkdir(outputDir, { recursive: true });

let changed = false;
for (const post of posts) {
  const style = categoryStyles[post.category] || categoryStyles.info;
  const imagePath = `/assets/posts/post-${String(post.id).padStart(2, "0")}.webp`;
  const svg = renderSvg(post, style);
  await sharp(Buffer.from(svg)).webp({ quality: 86 }).toFile(`public${imagePath}`);

  if (post.image !== imagePath) {
    post.image = imagePath;
    changed = true;
  }
}

if (changed) {
  await writeFile(postsFile, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
}

console.log(`Generated ${posts.length} local post images`);

function renderSvg(post, style) {
  const titleLines = wrapText(post.title, 18, 3);
  const tags = post.tags.slice(0, 3).map((tag) => `#${tag}`).join("   ");
  const titleSvg = titleLines
    .map((line, index) => `<text x="86" y="${278 + index * 78}" class="title">${escapeXml(line)}</text>`)
    .join("");

  const drawIcon = categoryIcons[post.category] || categoryIcons.info;
  const seed = post.id % 5;
  const blobX = 880 + seed * 22;
  const blobY = 150 + ((post.id * 37) % 90);
  const blobR = 210 + (seed % 3) * 24;

  return `<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
  <style>
    .brand { font: 700 34px Arial, 'Malgun Gothic', sans-serif; fill: ${style.accent}; letter-spacing: 0; }
    .label { font: 800 28px Arial, 'Malgun Gothic', sans-serif; fill: #ffffff; letter-spacing: 0; }
    .title { font: 800 58px Arial, 'Malgun Gothic', sans-serif; fill: ${style.ink}; letter-spacing: 0; }
    .tags { font: 600 27px Arial, 'Malgun Gothic', sans-serif; fill: #52616d; letter-spacing: 0; }
    .caption { font: 600 25px Arial, 'Malgun Gothic', sans-serif; fill: #52616d; letter-spacing: 0; }
  </style>
  <rect width="1200" height="675" fill="${style.bg}" />
  <circle cx="${blobX}" cy="${blobY}" r="${blobR}" fill="${style.accent}" opacity="0.08" />
  <circle cx="${blobX - blobR * 0.6}" cy="${blobY + blobR * 0.9}" r="${blobR * 0.45}" fill="${style.accent}" opacity="0.06" />
  <rect x="46" y="46" width="1108" height="583" rx="28" fill="#ffffff" opacity="0.72" />
  ${drawIcon(960, 300, 150, style.accent, 0.12)}
  <rect x="86" y="92" width="146" height="56" rx="12" fill="${style.accent}" />
  <text x="159" y="130" text-anchor="middle" class="label">${escapeXml(style.label)}</text>
  <text x="260" y="131" class="brand">소소타임</text>
  ${titleSvg}
  <text x="86" y="548" class="tags">${escapeXml(tags)}</text>
  <text x="86" y="595" class="caption">생활 속 장면을 직접 쓴 글</text>
  <rect x="1036" y="496" width="74" height="74" rx="16" fill="${style.accent}" opacity="0.95" />
  ${drawIcon(1073, 533, 26, "#ffffff", 1)}
</svg>`;
}

function wrapText(value, limit, maxLines) {
  const words = value.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (Array.from(next).length > limit && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  if (lines.length > maxLines) lines.length = maxLines;
  return lines;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
