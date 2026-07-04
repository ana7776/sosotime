const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);

const sourceUrl = readArg("--source") || readArg("--url") || "https://example.com/post/123";
const sourceImageUrl = readArg("--image") || "https://example.com/image.jpg";
const title = readArg("--title") || "오늘 커뮤니티에서 반응이 좋았던 생활 유머";
const slug = readArg("--slug") || "today-humor-best-sample";

const sourcePolicy = {
  storeBody: false,
  storeComments: false,
  storeImagesByDefault: false,
  requireReviewBeforePublish: true,
  imageUploadFormat: "webp",
  allowedImageMode: "source-site-permission-or-own-license",
  imageStorage: "cloudflare-r2",
  imagePipeline: "approved-source-url-to-webp-r2"
};

const sampleQueueItem = {
  sourceName: "수동 검토 후보",
  sourceUrl,
  originalTitle: title,
  extractedSignals: {
    views: 12000,
    likes: 430,
    comments: 57
  },
  draft: {
    board: "오늘의 유머 큐레이션",
    title: "오늘 커뮤니티에서 반응이 좋았던 생활 유머",
    summary: "원문 전체를 복제하지 않고 상황, 반응, 확인할 지점을 자체 문장으로 정리합니다.",
    curatorComment: "왜 사람들이 웃거나 공감했는지 독자 기준으로 짧게 붙입니다."
  },
  imageReview: {
    status: "needs-review",
    reason: "원본 사이트 이미지 사용 가능 여부를 확인한 뒤 approved로 변경합니다.",
    sourceImageUrl,
    targetFormat: "webp",
    uploadTarget: "r2",
    r2Bucket: "sosotime-images",
    r2KeyExample: `curated/2026/07/${slug}.webp`,
    publicUrlExample: `https://images.sosotime.com/curated/2026/07/${slug}.webp`,
    dryRunCommand: `npm run image:fetch -- "${sourceImageUrl}" "${slug}" --dry-run`,
    uploadCommand: `npm run image:fetch -- "${sourceImageUrl}" "${slug}"`
  },
  status: "review"
};

console.log(JSON.stringify({ sourcePolicy, sampleQueueItem }, null, 2));

if (!args.has("--dry-run")) {
  console.log("\nNext: review the source and image rights, then run imageReview.uploadCommand.");
}

function readArg(name) {
  const index = rawArgs.indexOf(name);
  if (index === -1) return "";
  return rawArgs[index + 1] || "";
}
