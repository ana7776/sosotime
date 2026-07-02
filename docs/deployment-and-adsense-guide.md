# 소소타임 배포 및 애드센스 승인 가이드

## 목표 구조

- 별도 어드민 없이 정적 파일만 배포합니다.
- 글은 `/posts/글-제목/` 형식의 정적 HTML로 생성합니다.
- 홈, 글 상세, 정책 페이지, `sitemap.xml`, `robots.txt`를 빌드 과정에서 자동 갱신합니다.
- 애드센스 승인 전에는 얇은 자동 생성 글보다 검수된 텍스트 중심 글을 우선 공개합니다.
- 빈 카테고리는 홈과 글 상세 네비게이션에서 자동으로 제외합니다.

## 초기 디렉토리 구조

```text
sosotime/
├─ public/
│  ├─ data/posts.json
│  ├─ posts/
│  ├─ about.html
│  ├─ contact.html
│  ├─ index.html
│  ├─ robots.txt
│  ├─ sitemap.xml
│  └─ policy/
│     ├─ privacy.html
│     └─ terms.html
├─ scripts/
│  ├─ lib/r2-images.js
│  ├─ generate-index-page.js
│  ├─ generate-post-pages.js
│  ├─ generate-sitemap.js
│  ├─ fetch-r2-image.js
│  └─ upload-r2-image.js
├─ functions/
│  └─ _middleware.js
├─ docs/
├─ .env.example
├─ package.json
└─ wrangler.toml
```

## 로컬 빌드 흐름

```bash
npm install
npm run build
npm run dev
```

Windows PowerShell 실행 정책 때문에 `npm`이 막히면 아래처럼 실행합니다.

```bash
npm.cmd run build
```

## SEO 자동 생성 구조

`scripts/generate-sitemap.js`가 빌드 때마다 `public/sitemap.xml`과 `public/robots.txt`를 생성합니다.

- `sitemap.xml`: 홈, 소개, 문의, 개인정보처리방침, 이용약관, 공개 글 상세 URL을 포함합니다.
- `robots.txt`: Googlebot, Googlebot-Image, Mediapartners-Google, AdsBot-Google, 일반 봇 접근을 허용하고 sitemap 위치를 명시합니다.
- 글 URL: 숫자 ID나 쿼리스트링이 아닌 `/posts/제목-slug/` 구조를 사용합니다.

## 애드센스 승인 전 레이아웃 원칙

- 본문은 이미지보다 텍스트 설명, 요약, 해설을 중심으로 구성합니다.
- 문서당 H1은 하나만 사용합니다.
- 글 상세는 H1 제목, H2 주요 섹션, H3 세부 맥락 순서로 계층을 유지합니다.
- 홈과 글 상세의 카테고리 메뉴는 실제 글이 있는 카테고리만 보여줍니다.
- Footer에는 사이트 소개, 개인정보처리방침, 문의하기, 이용약관 링크를 항상 노출합니다.
- 커뮤니티 원문이나 이미지를 그대로 복제하지 않고 자체 요약과 해설 중심으로 작성합니다.

## GitHub & Cloudflare Pages 연동

권장 설정:

```text
GitHub repository: https://github.com/ana7776/sosotime
Production branch: main
Build command: npm run build
Build output directory: public
Root directory: /
```

동작 흐름:

1. 로컬에서 글 데이터와 코드 수정
2. `npm run build`로 생성 결과 확인
3. GitHub `main` 브랜치에 push
4. Cloudflare Pages가 GitHub 변경을 감지
5. Cloudflare Pages가 `npm run build` 실행
6. `public` 폴더가 전 세계 CDN에 배포

현재 `wrangler.toml`은 Pages 프로젝트명 `sosotime`과 출력 폴더 `public`을 사용합니다.

## 배포 전 체크리스트

```bash
npm run build
```

확인할 주소:

```text
https://sosotime.com/
https://sosotime.com/sitemap.xml
https://sosotime.com/robots.txt
https://sosotime.com/about
https://sosotime.com/contact
https://sosotime.com/policy/privacy
```

Search Console에는 `https://sosotime.com/sitemap.xml`을 제출하고, 새 글은 개별 URL 검사로 색인 생성을 요청합니다.
