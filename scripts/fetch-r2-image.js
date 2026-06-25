import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const [, , imageUrl, slugArg] = process.argv;
const bucket = process.env.R2_BUCKET || "harusoso-images";
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || "";
const tmpDir = join(process.cwd(), ".tmp", "images");

if (!imageUrl || !slugArg) {
  console.error("Usage: npm run image:fetch -- <source-image-url> <post-slug>");
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(imageUrl);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only http and https image URLs are supported.");
  }
} catch (error) {
  console.error(`Invalid image URL: ${error.message}`);
  process.exit(1);
}

const slug = slugArg.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
if (!slug) {
  console.error("Post slug must contain at least one letter or number.");
  process.exit(1);
}

const now = new Date();
const yyyy = String(now.getUTCFullYear());
const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
const key = `curated/${yyyy}/${mm}/${slug}.webp`;
const outputFile = join(tmpDir, `${slug}.webp`);

const response = await fetch(parsedUrl, {
  headers: {
    "User-Agent": "harusoso-image-review/0.1 (+https://harusoso.pages.dev)"
  }
});

if (!response.ok) {
  console.error(`Image download failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const contentType = response.headers.get("content-type") || "";
if (!contentType.startsWith("image/")) {
  console.error(`Source URL did not return an image content type: ${contentType || "unknown"}`);
  process.exit(1);
}

const inputBuffer = Buffer.from(await response.arrayBuffer());
await mkdir(tmpDir, { recursive: true });

await sharp(inputBuffer)
  .rotate()
  .resize({ width: 1200, height: 675, fit: "inside", withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(outputFile);

const wrangler = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
const uploadArgs = [
  "r2",
  "object",
  "put",
  `${bucket}/${key}`,
  "--file",
  outputFile,
  "--content-type",
  "image/webp"
];

const code = await new Promise((resolve) => {
  const child = spawn(wrangler, uploadArgs, { stdio: "inherit", shell: false });
  child.on("error", async (error) => {
    console.error(`Failed to run Wrangler: ${error.message}`);
    console.error("Install or authenticate Wrangler, then retry: npm install -g wrangler && wrangler login");
    resolve(1);
  });
  child.on("close", resolve);
});

if (code !== 0) process.exit(code);

const publicUrl = publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, "")}/${key}` : null;
await writeFile(
  join(tmpDir, `${slug}.json`),
  `${JSON.stringify({ sourceUrl: imageUrl, bucket, key, publicUrl, localWebp: outputFile }, null, 2)}\n`,
  "utf8"
);

if (process.env.KEEP_IMAGE_TMP !== "1") {
  await rm(outputFile, { force: true });
}

console.log(JSON.stringify({ sourceUrl: imageUrl, bucket, key, publicUrl }, null, 2));
