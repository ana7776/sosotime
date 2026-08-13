import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { buildMascot } from "./lib/mascot.js";

const outputDir = "public/assets/site";

await mkdir(outputDir, { recursive: true });

const faviconSvg = `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="56" fill="#ffc700" />
  ${buildMascot(128, 132, 92)}
</svg>`;

await writeFile(`${outputDir}/favicon.svg`, faviconSvg, "utf8");

const faviconBuffer = Buffer.from(faviconSvg);
await sharp(faviconBuffer).resize(32, 32).png().toFile(`${outputDir}/favicon-32.png`);
await sharp(faviconBuffer).resize(16, 16).png().toFile(`${outputDir}/favicon-16.png`);
await sharp(faviconBuffer).resize(180, 180).png().toFile(`${outputDir}/apple-touch-icon.png`);

const ogSvg = buildComicBanner();

await sharp(Buffer.from(ogSvg)).webp({ quality: 90 }).toFile(`${outputDir}/og-image.webp`);

console.log("Generated site favicon and OG image assets");

function buildSunburst(cx, cy, rInner, rOuter, count, colorA, colorB) {
  const wedges = [];
  const step = (Math.PI * 2) / count;
  for (let i = 0; i < count; i += 1) {
    const a0 = i * step;
    const a1 = a0 + step;
    const points = [
      [cx + Math.cos(a0) * rInner, cy + Math.sin(a0) * rInner],
      [cx + Math.cos(a0) * rOuter, cy + Math.sin(a0) * rOuter],
      [cx + Math.cos(a1) * rOuter, cy + Math.sin(a1) * rOuter],
      [cx + Math.cos(a1) * rInner, cy + Math.sin(a1) * rInner],
    ]
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
    wedges.push(`<polygon points="${points}" fill="${i % 2 === 0 ? colorA : colorB}" />`);
  }
  return `<g>${wedges.join("")}</g>`;
}

function star(cx, cy, size, fill, rotate = 0) {
  return `<path transform="rotate(${rotate} ${cx} ${cy})" d="M ${cx} ${cy - size} L ${cx + size * 0.22} ${cy - size * 0.22} L ${cx + size} ${cy} L ${cx + size * 0.22} ${cy + size * 0.22} L ${cx} ${cy + size} L ${cx - size * 0.22} ${cy + size * 0.22} L ${cx - size} ${cy} L ${cx - size * 0.22} ${cy - size * 0.22} Z" fill="${fill}" />`;
}

function laughEmoji(cx, cy, r, { crying = false } = {}) {
  const eye = (ex, dir) =>
    `<path d="M ${ex - 16} ${cy - 4} L ${ex} ${cy - 22} L ${ex + 16} ${cy - 4}" stroke="#1a1a1a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
  const tear = crying
    ? `<path d="M ${cx - r * 0.72} ${cy + r * 0.1} q -18 22 0 40 q 18 -18 0 -40 Z" fill="#4fb8e8" stroke="#1a1a1a" stroke-width="4" />`
    : "";
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffcc33" stroke="#1a1a1a" stroke-width="6" />
    ${eye(cx - r * 0.38)}
    ${eye(cx + r * 0.38)}
    <ellipse cx="${cx}" cy="${cy + r * 0.32}" rx="${r * 0.42}" ry="${r * 0.3}" fill="#1a1a1a" />
    <ellipse cx="${cx}" cy="${cy + r * 0.26}" rx="${r * 0.34}" ry="${r * 0.22}" fill="#ff3b4e" />
    <rect x="${cx - r * 0.3}" y="${cy + r * 0.08}" width="${r * 0.6}" height="${r * 0.14}" rx="4" fill="#ffffff" />
    ${tear}
  </g>`;
}

function speechBubble(x, y, w, h, tailX, tailSide, lines, { fill = "#ffffff", stroke = "#1a1a1a" } = {}) {
  const tailY = y + h;
  const tail =
    tailSide === "left"
      ? `M ${tailX} ${tailY} L ${tailX - 16} ${tailY + 34} L ${tailX + 34} ${tailY} Z`
      : `M ${tailX} ${tailY} L ${tailX + 16} ${tailY + 34} L ${tailX - 34} ${tailY} Z`;
  const lineHeight = 30;
  const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2 + 10;
  const text = lines
    .map(
      (line, i) =>
        `<text x="${x + w / 2}" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Arial, 'Noto Sans KR', sans-serif" font-weight="800" font-size="25" fill="${line.color || "#1a1a1a"}">${line.text}</text>`,
    )
    .join("");
  return `<g>
    <path d="${tail}" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round" />
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${fill}" stroke="${stroke}" stroke-width="5" />
    ${text}
  </g>`;
}

function outlinedText(x, y, tspans, { fontSize = 90, anchor = "middle", weight = 900, spacing = -2, strokeWidth } = {}) {
  const sw = strokeWidth ?? Math.max(3, Math.round(fontSize * 0.13));
  const attrs = `x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, 'Noto Sans KR', sans-serif" font-weight="${weight}" font-size="${fontSize}" letter-spacing="${spacing}"`;
  const plain = tspans.map((t) => `<tspan>${t.text}</tspan>`).join("");
  const colored = tspans.map((t) => `<tspan fill="${t.color}">${t.text}</tspan>`).join("");
  return `<text ${attrs} fill="#1a1a1a" stroke="#1a1a1a" stroke-width="${sw}" stroke-linejoin="round">${plain}</text>
    <text ${attrs}>${colored}</text>`;
}

function hashtagPill(cx, y, text, fill, textColor) {
  const w = text.length * 24 + 56;
  const x = cx - w / 2;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="60" rx="30" fill="${fill}" stroke="#1a1a1a" stroke-width="4" />
    <text x="${cx}" y="${y + 40}" text-anchor="middle" font-family="Arial, 'Noto Sans KR', sans-serif" font-weight="800" font-size="27" fill="${textColor}">${text}</text>
  </g>`;
}

function underline(cx, y, width, thickness, color) {
  const x1 = cx - width / 2;
  const x2 = cx + width / 2;
  const dip = thickness * 1.6;
  return `<path d="M ${x1.toFixed(1)} ${y.toFixed(1)} Q ${cx.toFixed(1)} ${(y + dip).toFixed(1)} ${x2.toFixed(1)} ${(y - dip * 0.3).toFixed(1)}" stroke="${color}" stroke-width="${thickness}" fill="none" stroke-linecap="round" />`;
}

function buildComicBanner() {
  const width = 1200;
  const height = 630;
  const cx = 600;
  const cy = 214;
  const faceR = 132;

  const sunburst = buildSunburst(cx, cy, 60, 900, 28, "#ffc700", "#ffa700");
  const stars = [
    star(1080, 78, 24, "#ffffff", 10),
    star(52, 430, 18, "#ffffff", -12),
    star(1130, 380, 16, "#ffffff", 20),
  ].join("");

  const mascot = buildMascot(cx, cy, faceR, { cheer: true });

  const wordmark = outlinedText(
    cx,
    404,
    [
      { text: "SOSO", color: "#ffffff" },
      { text: "TIME", color: "#ffe000" },
      { text: ".COM", color: "#ffffff" },
    ],
    { fontSize: 84, spacing: -2 },
  );

  const taglineLine1 = outlinedText(cx, 452, [{ text: "오늘도 웃다가", color: "#1a1a1a" }], { fontSize: 38, weight: 800, spacing: -1 });
  const taglineLine2 = outlinedText(cx, 522, [{ text: "시간 순삭!", color: "#ff5a3c" }], { fontSize: 62, weight: 900, spacing: -1 });
  const tagline = `<g>
    ${taglineLine1}
    ${underline(cx, 466, 300, 5, "#1a1a1a")}
    ${taglineLine2}
    ${underline(cx, 540, 340, 9, "#ff5a3c")}
  </g>`;

  const pills = [
    hashtagPill(345, 556, "#유머", "#ff7a1a", "#ffffff"),
    hashtagPill(545, 556, "#웃긴글", "#ffffff", "#1a1a1a"),
    hashtagPill(760, 556, "#공감", "#ffe000", "#1a1a1a"),
    hashtagPill(960, 556, "#꿀잼", "#ffffff", "#1a1a1a"),
  ].join("");

  const bubbles = [
    speechBubble(40, 30, 240, 108, 130, "left", [
      { text: "ㅋㅋㅋ 너무", color: "#1a1a1a" },
      { text: "웃겨!", color: "#e6273f" },
    ]),
    speechBubble(918, 30, 242, 108, 998, "right", [
      { text: "오늘도", color: "#1a1a1a" },
      { text: "꿀잼 보장!", color: "#e6273f" },
    ]),
    speechBubble(420, 14, 112, 58, 462, "left", [{ text: "ㅋㅋㅋ", color: "#1a1a1a" }]),
  ].join("");

  const emojis = [laughEmoji(102, 280, 58, { crying: true }), laughEmoji(1096, 260, 54)].join("");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#ffb703" />
    <clipPath id="frame"><rect width="${width}" height="${height}" /></clipPath>
    <g clip-path="url(#frame)">${sunburst}</g>
    ${stars}
    ${bubbles}
    ${emojis}
    ${mascot}
    ${wordmark}
    ${tagline}
    ${pills}
  </svg>`;
}
