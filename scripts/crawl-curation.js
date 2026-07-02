const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const sourceUrl = readArg("--source") || readArg("--url") || "https://example.com/post/123";
const sourceImageUrl = readArg("--image") || "https://example.com/image.jpg";
const title = readArg("--title") || "수집한 원문 제목";
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
  sourceName: "크롤링 후보",
  sourceUrl,
  originalTitle: title,
  extractedSignals: {
    views: 12000,
    likes: 430,
    comments: 57
  },
  draft: {
    board: "오늘의 유머베스트",
    title: "오늘 커뮤니티에서 반응 좋았던 유머 글",
    summary: "원문 전체를 복제하지 않고 상황, 반응 포인트, 읽고 남는 점을 자체 문장으로 정리합니다.",
    curatorComment: "왜 사람들이 웃거나 공감했는지 독자 기준으로 짧게 붙입니다."
  },
  imageReview: {
    status: "needs-review",
    reason: "원본 사이트 이미지 사용 가능 여부 확인 후 approved로 변경",
    sourceImageUrl,
    targetFormat: "webp",
    uploadTarget: "r2",
    r2Bucket: "sosotime-images",
    r2KeyExample: `curated/2026/07/${slug}.webp`,
    publicUrlExample: `https://images.sosotime.com/curated/2026/07/${slug}.webp`,
    commandExample: `npm run image:fetch -- "${sourceImageUrl}" "${slug}"`
  },
  status: "review"
};

if (args.has("--dry-run")) {
  console.log(JSON.stringify({ sourcePolicy, sampleQueueItem }, null, 2));
} else {
  console.log(JSON.stringify({ sourcePolicy, sampleQueueItem }, null, 2));
  console.log("\nNext: review the source and image rights, then run the commandExample to convert to WebP and upload to R2.");
}

function readArg(name) {
  const index = rawArgs.indexOf(name);
  if (index === -1) return "";
  return rawArgs[index + 1] || "";
}
