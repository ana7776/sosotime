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

const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <style>
    .mark { font: 800 64px Arial, 'Malgun Gothic', sans-serif; fill: #ffffff; }
    .wordmark { font: 800 92px Arial, 'Malgun Gothic', sans-serif; fill: ${ink}; }
    .tagline { font: 600 34px Arial, 'Malgun Gothic', sans-serif; fill: #52616d; }
  </style>
  <rect width="1200" height="630" fill="${bg}" />
  <rect x="60" y="60" width="1080" height="510" rx="32" fill="${soft}" />
  <rect x="120" y="150" width="140" height="140" rx="30" fill="${brand}" />
  <text x="190" y="240" text-anchor="middle" class="mark">소소</text>
  <text x="290" y="245" class="wordmark">소소타임</text>
  <text x="124" y="360" class="tagline">생활 속 웃음과 공감을 직접 쓰는 글</text>
  <rect x="120" y="430" width="960" height="4" fill="${brandDark}" opacity="0.25" />
</svg>`;

await sharp(Buffer.from(ogSvg)).webp({ quality: 88 }).toFile(`${outputDir}/og-image.webp`);

console.log("Generated site favicon and OG image assets");
