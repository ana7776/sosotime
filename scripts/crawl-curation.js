const args = new Set(process.argv.slice(2));

const sourcePolicy = {
  storeBody: false,
  storeComments: false,
  storeImagesByDefault: false,
  requireReviewBeforePublish: true,
  imageUploadFormat: "webp",
  allowedImageMode: "permission-or-own-license",
  imageStorage: "cloudflare-r2",
  imagePipeline: "approved-source-url-to-webp-r2"
};

const sampleQueueItem = {
  sourceName: "예시 커뮤니티",
  sourceUrl: "https://example.com/post/123",
  originalTitle: "수집한 원문 제목",
  extractedSignals: {
    views: 12000,
    likes: 430,
    comments: 57
  },
  draft: {
    title: "오늘 커뮤니티에서 반응 좋았던 공감 사연",
    summary: "원문 전체를 복제하지 않고 상황, 반응 포인트, 맥락을 자체 문장으로 정리합니다.",
    curatorComment: "왜 사람들이 반응했는지 짧은 코멘트를 붙여 사이트의 입자 가치를 만듭니다."
  },
  imageReview: {
    status: "approved",
    reason: "사용 허가 또는 자체 사용 가능 라이선스 확인",
    sourceImageUrl: "https://example.com/image.jpg",
    targetFormat: "webp",
    uploadTarget: "r2",
    r2Bucket: "harusoso-images",
    r2KeyExample: "curated/2026/06/post-123.webp",
    publicUrlExample: "https://images.harusoso.example/curated/2026/06/post-123.webp",
    commandExample: "npm run image:fetch -- https://example.com/image.jpg post-123"
  },
  status: "review"
};

if (args.has("--dry-run")) {
  console.log(JSON.stringify({ sourcePolicy, sampleQueueItem }, null, 2));
} else {
  console.log("Crawler scaffold only. Add approved sources and review rules before enabling live collection.");
}
