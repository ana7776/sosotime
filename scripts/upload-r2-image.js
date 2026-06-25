import { access, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { spawn } from "node:child_process";

const [, , inputFile, slugArg] = process.argv;
const bucket = process.env.R2_BUCKET || "harusoso-images";
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || "";

if (!inputFile || !slugArg) {
  console.error("Usage: npm run image:upload -- <local-image.webp> <post-slug>");
  process.exit(1);
}

const filePath = resolve(inputFile);
const slug = slugArg.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const now = new Date();
const yyyy = String(now.getUTCFullYear());
const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
const key = `curated/${yyyy}/${mm}/${slug}.webp`;

if (extname(filePath).toLowerCase() !== ".webp") {
  console.error("Only .webp files are accepted for R2 uploads.");
  process.exit(1);
}

try {
  await access(filePath);
  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) throw new Error("Input path is not a file.");
} catch (error) {
  console.error(`Cannot read image file: ${error.message}`);
  process.exit(1);
}

const wrangler = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
const args = [
  "r2",
  "object",
  "put",
  `${bucket}/${key}`,
  "--file",
  filePath,
  "--content-type",
  "image/webp"
];

const child = spawn(wrangler, args, { stdio: "inherit", shell: false });

child.on("error", (error) => {
  console.error(`Failed to run Wrangler: ${error.message}`);
  console.error("Install or authenticate Wrangler, then retry: npm install -g wrangler && wrangler login");
  process.exit(1);
});

child.on("close", (code) => {
  if (code !== 0) process.exit(code);

  const publicUrl = publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, "")}/${key}` : null;
  console.log(JSON.stringify({ bucket, key, publicUrl }, null, 2));
});
