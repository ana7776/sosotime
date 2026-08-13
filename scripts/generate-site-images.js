import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const outputDir = "public/assets/site";
const brand = "#1f6f5b";
const brandDark = "#164e42";
const ink = "#20242a";
const bg = "#f4f6f8";
const soft = "#eaf5f1";

await mkdir(outputDir, { recursive: true });

const faviconSvg = `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="52" fill="${brand}" />
  <text x="128" y="158" text-anchor="middle" font-family="Arial, 'Malgun Gothic', sans-serif" font-weight="800" font-size="104" fill="#ffffff">소소</text>
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

function outlinedText(x, y, tspans, { fontSize = 90, anchor = "middle", weight = 900, spacing = -2 } = {}) {
  const attrs = `x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, 'Noto Sans KR', sans-serif" font-weight="${weight}" font-size="${fontSize}" letter-spacing="${spacing}"`;
  const plain = tspans.map((t) => `<tspan>${t.text}</tspan>`).join("");
  const colored = tspans.map((t) => `<tspan fill="${t.color}">${t.text}</tspan>`).join("");
  return `<text ${attrs} fill="#1a1a1a" stroke="#1a1a1a" stroke-width="15" stroke-linejoin="round">${plain}</text>
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

function buildComicBanner() {
  const width = 1200;
  const height = 630;
  const cx = 600;
  const cy = 224;
  const faceR = 150;

  const sunburst = buildSunburst(cx, cy, 60, 900, 28, "#ffc700", "#ffa700");
  const stars = [
    star(1080, 78, 24, "#ffffff", 10),
    star(52, 430, 18, "#ffffff", -12),
    star(1130, 380, 16, "#ffffff", 20),
  ].join("");

  const spike = (angleDeg, len) => {
    const a = (angleDeg * Math.PI) / 180;
    const baseX = cx + Math.cos(a) * (faceR - 6);
    const baseY = cy + Math.sin(a) * (faceR - 6);
    const tipX = cx + Math.cos(a) * (faceR + len);
    const tipY = cy + Math.sin(a) * (faceR + len);
    const spreadA = a - 0.05;
    const spreadB = a + 0.05;
    const sideX = cx + Math.cos(spreadA) * (faceR + len * 0.55);
    const sideY = cy + Math.sin(spreadA) * (faceR + len * 0.55);
    const side2X = cx + Math.cos(spreadB) * (faceR + len * 0.55);
    const side2Y = cy + Math.sin(spreadB) * (faceR + len * 0.55);
    return `<path d="M ${baseX.toFixed(1)} ${baseY.toFixed(1)} L ${sideX.toFixed(1)} ${sideY.toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${side2X.toFixed(1)} ${side2Y.toFixed(1)} Z" fill="#1a1a1a" />`;
  };
  const spikes = [-140, -158, -175, 165].map((deg) => spike(deg, 46)).join("");

  const face = `<g>
    ${spikes}
    <circle cx="${cx}" cy="${cy}" r="${faceR}" fill="#ffffff" stroke="#1a1a1a" stroke-width="11" />
    <path d="M ${cx - 82} ${cy - 17} L ${cx - 47} ${cy - 53} L ${cx - 13} ${cy - 17}" stroke="#1a1a1a" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M ${cx + 13} ${cy - 17} L ${cx + 47} ${cy - 53} L ${cx + 82} ${cy - 17}" stroke="#1a1a1a" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <ellipse cx="${cx}" cy="${cy + 58}" rx="86" ry="50" fill="#141414" />
    <ellipse cx="${cx}" cy="${cy + 55}" rx="74" ry="42" fill="#e6273f" />
    <clipPath id="mouthClip"><ellipse cx="${cx}" cy="${cy + 55}" rx="74" ry="42" /></clipPath>
    <g clip-path="url(#mouthClip)">
      <rect x="${cx - 78}" y="${cy + 14}" width="156" height="20" fill="#ffffff" />
      <ellipse cx="${cx}" cy="${cy + 88}" rx="42" ry="20" fill="#ff8fa3" />
    </g>
  </g>`;

  const wordmark = outlinedText(
    cx,
    412,
    [
      { text: "SOSO", color: "#ffffff" },
      { text: "TIME", color: "#ffe000" },
      { text: ".COM", color: "#ffffff" },
    ],
    { fontSize: 84, spacing: -2 },
  );

  const taglineBar = `<g>
    <rect x="190" y="446" width="820" height="84" rx="18" fill="#141414" />
    <text x="${cx}" y="502" text-anchor="middle" xml:space="preserve" font-family="Arial, 'Noto Sans KR', sans-serif" font-weight="800" font-size="46" letter-spacing="-1"><tspan fill="#ffffff">웃다가 </tspan><tspan fill="#ffe000">시간 순삭!</tspan></text>
  </g>`;

  const pills = [
    hashtagPill(345, 552, "#꿀잼", "#2ea3e8", "#ffffff"),
    hashtagPill(555, 552, "#유머", "#ffffff", "#1a1a1a"),
    hashtagPill(760, 552, "#웃긴글", "#ffe000", "#1a1a1a"),
    hashtagPill(975, 552, "#공감", "#ff8fc0", "#1a1a1a"),
  ].join("");

  const bubbles = [
    speechBubble(40, 34, 250, 108, 130, "left", [
      { text: "빵빵 터지는", color: "#1a1a1a" },
      { text: "유머 맛집!", color: "#e6273f" },
    ]),
    speechBubble(910, 34, 250, 108, 995, "right", [
      { text: "오늘도", color: "#1a1a1a" },
      { text: "피식피식!", color: "#e6273f" },
    ]),
    speechBubble(420, 20, 112, 60, 462, "left", [{ text: "ㅋㅋㅋ", color: "#1a1a1a" }]),
  ].join("");

  const emojis = [laughEmoji(108, 290, 60, { crying: true }), laughEmoji(1092, 270, 56)].join("");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#ffb703" />
    <clipPath id="frame"><rect width="${width}" height="${height}" /></clipPath>
    <g clip-path="url(#frame)">${sunburst}</g>
    ${stars}
    ${bubbles}
    ${emojis}
    ${face}
    ${wordmark}
    ${taglineBar}
    ${pills}
  </svg>`;
}
