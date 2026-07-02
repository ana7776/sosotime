import { readFile, writeFile } from "node:fs/promises";

const siteUrl = process.env.SITE_URL || "https://sosotime.com";
const posts = JSON.parse(await readFile("public/data/posts.json", "utf8")).filter((post) => post.status === "published");
const adsenseClient = process.env.ADSENSE_CLIENT || "ca-pub-5804969457082424";

const categoryMeta = {
  funny: { label: "유머" },
  empathy: { label: "공감" },
  issue: { label: "이슈" },
  life: { label: "생활" },
  info: { label: "정보" }
};

const sortedLatest = [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
const daily = posts.filter((post) => post.dailyRank).sort((a, b) => a.dailyRank - b.dailyRank).slice(0, 10);
const weekly = posts.filter((post) => post.weeklyRank).sort((a, b) => a.weeklyRank - b.weeklyRank).slice(0, 10);

const pageTitle = "웃음보드 - 오늘 웃긴 것만 정리";
const pageDescription = "웃음보드는 커뮤니티 유머 후보를 수집해 일일 베스트, 주간 베스트, 실시간 수집 보드로 보여주는 요약형 유머 큐레이션 사이트입니다.";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "웃음보드",
  url: siteUrl,
  inLanguage: "ko-KR",
  description: pageDescription,
  publisher: { "@type": "Organization", name: "소소타임", url: siteUrl },
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDescription)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="naver-site-verification" content="39233df2c0bc4eae9016d16a8866f9f7131b6b60" />
    <link rel="canonical" href="${siteUrl}/" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="stylesheet" href="/styles.css" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="웃음보드" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDescription)}" />
    <meta property="og:url" content="${siteUrl}/" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDescription)}" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}" crossorigin="anonymous"></script>
    <script type="application/ld+json">${safeJson(jsonLd)}</script>
  </head>
  <body class="board-body">
    <main class="humor-board-shell">
      <header class="board-hero">
        <div>
          <p class="board-kicker">오늘 웃긴 것만 정리</p>
          <h1>웃음보드</h1>
        </div>
        <label class="board-search">
          <span class="sr-only">제목, 본문, 출처 검색</span>
          <input id="searchInput" type="search" placeholder="제목, 본문, 출처 검색" />
        </label>
      </header>

      <nav class="board-tabs" aria-label="보드 바로가기">
        <a href="#postList">수집글 100개</a>
        <a href="/?rank=daily">일일 베스트 10</a>
        <a href="/?rank=weekly">주간 베스트 10</a>
        <a href="/upload">이미지 WebP 지정</a>
      </nav>

      <section class="best-grid" aria-label="베스트 글">
        <article class="best-panel">
          <h2>♨ 일일 베스트 10</h2>
          <ol id="dailyBest" class="best-list">
            ${daily.map((post) => renderBestItem(post, post.dailyRank, "daily")).join("\n            ")}
          </ol>
        </article>

        <article class="best-panel">
          <h2>🏆 주간 베스트 10</h2>
          <ol id="weeklyBest" class="best-list">
            ${weekly.map((post) => renderBestItem(post, post.weeklyRank, "weekly")).join("\n            ")}
          </ol>
        </article>
      </section>

      <section class="collection-board" aria-labelledby="collection-title">
        <div class="collection-head">
          <h2 id="collection-title">실시간 수집 보드</h2>
          <span>${numberFormat(sortedLatest.length)}개</span>
        </div>
        <ol id="postList" class="collection-list">
          ${sortedLatest.map(renderCollectionItem).join("\n          ")}
        </ol>
      </section>

      <section class="adsense-ready-section" aria-labelledby="adsense-ready-title">
        <h2 id="adsense-ready-title">웃음보드 운영 원칙</h2>
        <div>
          <article>
            <h3>원문 복제 금지</h3>
            <p>원문 전체를 그대로 옮기지 않고, 독자가 맥락을 빠르게 이해할 수 있는 자체 요약과 제한적 미리보기만 제공합니다.</p>
          </article>
          <article>
            <h3>출처 강조</h3>
            <p>각 게시글에는 출처명과 원문 이동 링크를 표시합니다. 자세한 댓글 흐름과 원문 반응은 출처에서 확인하도록 안내합니다.</p>
          </article>
          <article>
            <h3>검수 후 게시</h3>
            <p>수집 후보는 부적절한 표현, 개인정보, 권리 침해 가능성을 확인한 뒤 게시하며 신고/삭제요청을 상시 접수합니다.</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="board-footer">
      <a href="/about">사이트 소개</a>
      <a href="/policy/editorial">운영 안내</a>
      <a href="/report">신고/삭제요청</a>
      <a href="/upload">후기 제보</a>
      <a href="/contact">문의하기</a>
      <a href="/policy/privacy">개인정보처리방침</a>
      <a href="/policy/terms">이용약관</a>
    </footer>

    <script type="module" src="/app.js"></script>
  </body>
</html>
`;

await writeFile("public/index.html", html, "utf8");
console.log(`Generated refreshed index page with ${posts.length} posts`);

function renderBestItem(post, rank, type) {
  const score = type === "weekly" ? post.score + 1400 : post.score;
  return `<li>
              <a href="${post.path}">
                <span class="best-rank">${rank}</span>
                <strong>${escapeHtml(post.title)}</strong>
                <em>${numberFormat(score)}</em>
              </a>
            </li>`;
}

function renderCollectionItem(post) {
  const category = categoryMeta[post.category]?.label || "유머";
  return `<li>
            <article class="collection-row">
              <a class="collection-thumb" href="${post.path}" aria-label="${escapeHtml(post.title)} 게시글 보기">
                <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy" />
              </a>
              <div class="collection-copy">
                <p>${escapeHtml(category)} · ${escapeHtml(post.sourceName)} · 조회 ${numberFormat(post.views)} · 추천 ${numberFormat(post.likes)}</p>
                <h3><a href="${post.path}">${escapeHtml(post.title)}</a></h3>
                <p>${escapeHtml(post.summary)}</p>
              </div>
              <a class="collection-open" href="${post.path}" aria-label="${escapeHtml(post.title)} 게시글로 이동">↗</a>
            </article>
          </li>`;
}

function numberFormat(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
