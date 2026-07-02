# R2 이미지 최적화 자동화

이 문서는 소소타임의 대표 이미지 파이프라인을 설명합니다. 외부 URL 또는 로컬 이미지 파일을 입력하면 `sharp`로 WebP 변환과 압축을 수행하고, `@aws-sdk/client-s3`를 통해 Cloudflare R2 버킷에 업로드한 뒤 최종 공개 URL을 JSON으로 반환합니다.

## 디렉토리 구조

```text
sosotime/
├─ .env.example
├─ package.json
├─ public/
│  ├─ data/posts.json
│  ├─ assets/posts/
│  ├─ posts/
│  ├─ robots.txt
│  └─ sitemap.xml
├─ scripts/
│  ├─ lib/r2-images.js
│  ├─ fetch-r2-image.js
│  ├─ upload-r2-image.js
│  ├─ generate-index-page.js
│  ├─ generate-post-pages.js
│  └─ generate-sitemap.js
├─ docs/
│  ├─ deployment-and-adsense-guide.md
│  └─ r2-image-automation.md
└─ wrangler.toml
```

## 환경변수

로컬에서는 `.env` 파일에, GitHub Actions나 Cloudflare Pages에서는 비밀 환경변수로 등록합니다.

```bash
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=sosotime-images
R2_PUBLIC_BASE_URL=https://images.sosotime.com

IMAGE_MAX_BYTES=12582912
IMAGE_WIDTH=1200
IMAGE_HEIGHT=675
IMAGE_WEBP_QUALITY=80
IMAGE_RESIZE_FIT=cover
KEEP_IMAGE_TMP=0
```

현재 계정에서 R2가 비활성화된 경우 실제 업로드는 실패합니다. 먼저 Cloudflare Dashboard에서 R2를 활성화하고 버킷과 공개 도메인을 만든 뒤 사용하세요.

## URL 이미지 다운로드 후 업로드

```bash
npm run image:fetch -- "https://example.com/source.jpg" "퇴근길 지하철에서 모두가 조용해진 순간"
```

R2 없이 변환만 검증:

```bash
npm run image:fetch -- "https://example.com/source.jpg" "테스트 이미지" --dry-run
```

처리 흐름:

1. URL이 `http` 또는 `https`인지 확인합니다.
2. `fetch`로 이미지를 다운로드합니다.
3. `content-type`이 지원되는 래스터 이미지인지 확인합니다.
4. `sharp`로 EXIF 회전 보정, 1200x675 리사이즈, WebP 품질 80 변환을 수행합니다.
5. `PutObjectCommand`로 R2에 업로드합니다.
6. 공개 URL, R2 key, 변환 크기 정보를 JSON으로 출력합니다.

핵심 구현 파일:

```text
scripts/fetch-r2-image.js      외부 URL 다운로드 → WebP 변환 → R2 업로드
scripts/upload-r2-image.js     로컬 이미지 파일 → WebP 변환 → R2 업로드
scripts/lib/r2-images.js       공통 함수: fetch, sharp, S3 PutObjectCommand, publicUrl 생성
```

`scripts/lib/r2-images.js`의 주요 로직은 아래 조건을 만족합니다.

- `fetch`로 원본 URL 이미지를 다운로드합니다.
- `content-type`이 `jpeg`, `png`, `webp`, `gif`, `avif`, `heic`, `heif` 등 지원 이미지인지 확인합니다.
- `sharp(...).rotate().resize({ width: 1200, height: 675, fit: "cover" }).webp({ quality: 80 })`로 WebP 변환과 압축을 수행합니다.
- `@aws-sdk/client-s3`의 `S3Client`와 `PutObjectCommand`를 사용해 Cloudflare R2 S3 호환 엔드포인트에 업로드합니다.
- `ContentType: "image/webp"`와 장기 캐시 헤더를 지정합니다.
- 업로드 후 `R2_PUBLIC_BASE_URL + key` 형태의 최종 공개 이미지 URL을 JSON으로 반환합니다.

## 로컬 이미지 업로드

```bash
npm run image:upload -- "./source/photo.png" "마트 계산대 앞에서 생긴 작은 오해"
```

`jpg`, `jpeg`, `png`, `webp`, `gif`, `avif`, `heic`, `heif` 입력을 받아 WebP로 다시 최적화합니다.

## 출력 예시

```json
{
  "sourceUrl": "https://example.com/source.jpg",
  "sourceContentType": "image/jpeg",
  "sourceBytes": 512000,
  "optimizedBytes": 132400,
  "width": 1200,
  "height": 675,
  "quality": 80,
  "fit": "cover",
  "bucket": "sosotime-images",
  "key": "curated/2026/06/퇴근길-지하철에서-모두가-조용해진-순간.webp",
  "publicUrl": "https://images.sosotime.com/curated/2026/06/%ED%87%B4%EA%B7%BC%EA%B8%B8-%EC%A7%80%ED%95%98%EC%B2%A0%EC%97%90%EC%84%9C-%EB%AA%A8%EB%91%90%EA%B0%80-%EC%A1%B0%EC%9A%A9%ED%95%B4%EC%A7%84-%EC%88%9C%EA%B0%84.webp"
}
```

업로드 결과의 `publicUrl`을 `public/data/posts.json`의 해당 글 `image` 필드에 넣고 `npm run build`를 실행하면 홈, 글 상세, 사이트맵이 함께 갱신됩니다.

## 주의사항

- 권리가 확인된 이미지, 직접 만든 이미지, 무료 라이선스 이미지, AI 생성 이미지만 사용하세요.
- 커뮤니티 게시글 이미지를 그대로 가져오면 애드센스 승인에 불리할 수 있습니다.
- R2 키와 비밀값은 GitHub에 커밋하지 마세요.
- Cloudflare Pages Functions를 쓰지 않는 현재 구조에서는 `wrangler.toml`에 R2 바인딩을 넣지 않아도 됩니다.
