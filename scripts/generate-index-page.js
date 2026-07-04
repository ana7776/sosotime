import { readFile, writeFile } from "node:fs/promises";

const siteUrl = process.env.SITE_URL || "https://sosotime.com";
const posts = JSON.parse(await readFile("public/data/posts.json", "utf8")).filter((post) => post.status === "published");
const adsenseClient = process.env.ADSENSE_CLIENT || "ca-pub-5804969457082424";

const categoryMeta = {
  funny: {
    label: "유머",
    icon: "웃",
    tone: "yellow",
    navLabel: "유머",
    description: "가볍게 웃을 수 있는 생활 속 장면과 반응",
  },
  empathy: {
    label: "공감",
    icon: "공",
    tone: "pink",
    navLabel: "공감",
    description: "퇴근길, 대화, 작은 배려처럼 누구나 아는 순간",
  },
  issue: {
    label: "이슈",
    icon: "잇",
    tone: "blue",
    navLabel: "이슈",
    description: "커뮤니티에서 의견이 갈린 장면의 맥락",
  },
  life: {
    label: "생활",
    icon: "생",
    tone: "orange",
    navLabel: "생활",
    description: "일상에서 헷갈리기 쉬운 기준과 선택 포인트",
  },
  info: {
    label: "정보",
    icon: "정",
    tone: "green",
    navLabel: "정보",
    description: "링크, 후기, 요약 글을 읽을 때 확인할 정보",
  },
};

const sortedLatest = [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
const daily = posts.filter((post) => post.dailyRank).sort((a, b) => a.dailyRank - b.dailyRank).slice(0, 10);
const weekly = posts.filter((post) => post.weeklyRank).sort((a, b) => a.weeklyRank - b.weeklyRank).slice(0, 10);
const topStories = daily.slice(0, 6);
const editorPicks = sortedLatest.slice(1, 4);
const gallery = [...sortedLatest].sort((a, b) => b.likes - a.likes).slice(0, 6);
const categorySummaries = Object.entries(categoryMeta)
  .map(([category, meta]) => ({
    category,
    ...meta,
    count: posts.filter((post) => post.category === category).length,
    posts: posts
      .filter((post) => post.category === category)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4),
  }))
  .filter((entry) => entry.count > 0);

const pageTitle = "소소타임 - 웃음과 공감이 있는 커뮤니티";
const pageDescription =
  "소소타임은 커뮤니티에서 반응이 좋은 생활 유머, 공감 이야기, 이슈 글을 처음 보는 독자도 편하게 읽을 수 있도록 핵심 장면과 확인 포인트로 정리합니다.";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "소소타임",
  url: siteUrl,
  inLanguage: "ko-KR",
  description: pageDescription,
  publisher: { "@type": "Organization", name: "소소타임", url: siteUrl },
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
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
    <meta property="og:site_name" content="소소타임" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDescription)}" />
    <meta property="og:url" content="${siteUrl}/" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDescription)}" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}" crossorigin="anonymous"></script>
    <script type="application/ld+json">${safeJson(jsonLd)}</script>
  </head>
  <body class="humor-home-body">
    <header class="humor-header">
      <div class="humor-header-top">
        <a class="humor-logo" href="/" aria-label="소소타임 홈">
          <strong>SOSO TIME</strong>
          <small>웃음과 공감이 있는 커뮤니티</small>
        </a>
        <form class="humor-search" action="/" role="search">
          <label class="visually-hidden" for="searchInput">검색어 입력</label>
          <input id="searchInput" name="q" type="search" placeholder="검색어를 입력하세요" />
        </form>
        <nav class="humor-actions" aria-label="바로가기">
          <a href="/?rank=daily" class="rank-button" data-rank="daily">인기글</a>
          <a class="submit-action" href="/upload">제보하기</a>
          <a href="/policy/editorial">운영안내</a>
        </nav>
      </div>
      <nav class="humor-nav" aria-label="카테고리">
        <div class="humor-nav-inner">
          <a class="nav-tab is-active" href="/" data-filter="all">전체</a>
          ${categorySummaries.map(renderNavTab).join("\n          ")}
          <a href="/policy/editorial">베스트</a>
          <a href="/report">커뮤니티</a>
          <span class="menu-mark" aria-hidden="true">☰</span>
        </div>
      </nav>
    </header>

    <main class="humor-shell">
      <div class="humor-layout">
        <div class="humor-main">
          <section class="home-hero-card humor-hero" aria-labelledby="home-title">
            <img class="home-hero-image" src="/assets/site/hero-community.webp" alt="휴대폰을 보며 웃는 소소타임 캐릭터" loading="eager" />
            <button class="hero-arrow left" type="button" aria-label="이전 추천">‹</button>
            <button class="hero-arrow right" type="button" aria-label="다음 추천">›</button>
            <div class="home-hero-copy">
              <p class="eyebrow">오늘의 웃음 큐레이션</p>
              <h1 id="home-title">오늘, 당신을 웃게 할<br /><span>한 편의 이야기</span></h1>
              <p>생활 유머, 공감 사연, 이슈 글을 처음 보는 사람도 빠르게 이해할 수 있도록 장면과 반응 중심으로 정리합니다.</p>
              <a class="hero-action" href="/?rank=daily">오늘의 인기글 보러가기</a>
              <div class="hero-dots" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
            </div>
          </section>

          <section class="humor-card-section" aria-labelledby="top-title">
            <div class="section-heading section-title-row">
              <h2 id="top-title">오늘의 인기글</h2>
              <a href="/?rank=daily">더보기</a>
            </div>
            <div id="topCards" class="story-card-grid humor-story-grid">
              ${topStories.map(renderStoryCard).join("\n              ")}
            </div>
          </section>

          <section class="humor-ad" aria-label="소소타임 안내">
            <div>
              <strong>소소타임과 함께 즐거운 하루!</strong>
              <span>일상 속 작은 웃음이 큰 쉼표가 됩니다.</span>
            </div>
            <em>AD</em>
          </section>

          <section class="category-popular" aria-labelledby="category-title">
            <div class="section-heading section-title-row">
              <h2 id="category-title">카테고리별 인기글</h2>
              <a href="/">더보기</a>
            </div>
            <div class="category-board humor-category-board">
              ${categorySummaries.map(renderCategoryColumn).join("\n              ")}
            </div>
          </section>

          <section class="humor-latest-section" aria-labelledby="latest-title">
            <div class="section-heading section-title-row latest-tabs">
              <h2 id="latest-title">최신 글</h2>
              <a class="rank-button is-active" href="/" data-rank="latest">최신</a>
              <a class="rank-button" href="/?rank=daily" data-rank="daily">인기</a>
              <a class="rank-button" href="/?rank=weekly" data-rank="weekly">주간</a>
              <a href="/">더보기</a>
            </div>
            <ol id="postList" class="collection-list humor-latest-list">
              ${sortedLatest.map(renderLatestItem).join("\n              ")}
            </ol>
          </section>
        </div>

        <aside class="humor-sidebar" aria-label="사이드 콘텐츠">
          <section class="sidebar-card" aria-labelledby="daily-title">
            <div class="section-title-row">
              <h2 id="daily-title">실시간 인기</h2>
              <a href="/?rank=daily">더보기</a>
            </div>
            <ol id="dailyBest" class="best-list rank-list humor-rank-list">
              ${daily.map((post) => renderBestItem(post, post.dailyRank)).join("\n              ")}
            </ol>
          </section>

          <section class="sidebar-card" aria-labelledby="editor-title">
            <div class="section-title-row">
              <h2 id="editor-title">에디터 추천</h2>
              <a href="/policy/editorial">더보기</a>
            </div>
            ${renderEditorMain(editorPicks[0])}
            <div class="editor-list">
              ${editorPicks.slice(1).map(renderEditorItem).join("\n              ")}
            </div>
          </section>

          <section class="sidebar-card" aria-labelledby="weekly-title">
            <div class="section-title-row">
              <h2 id="weekly-title">주간 반응</h2>
              <a href="/?rank=weekly">더보기</a>
            </div>
            <ol id="weeklyBest" class="best-list rank-list humor-rank-list">
              ${weekly.slice(0, 6).map((post) => renderBestItem(post, post.weeklyRank)).join("\n              ")}
            </ol>
          </section>

          <section class="sidebar-card" aria-labelledby="gallery-title">
            <div class="section-title-row">
              <h2 id="gallery-title">오늘의 짤</h2>
              <a href="/?category=funny">더보기</a>
            </div>
            <div class="mini-gallery">
              ${gallery.map(renderGalleryImage).join("\n              ")}
            </div>
          </section>

          <section class="sidebar-card" aria-labelledby="tag-title">
            <div class="section-title-row">
              <h2 id="tag-title">인기 태그</h2>
            </div>
            <div class="tag-cloud">
              ${renderTagCloud()}
            </div>
          </section>

          <section class="rule-card humor-rule-card" aria-labelledby="rule-title">
            <h2 id="rule-title">안심하고 읽는 기준</h2>
            <p>핵심 장면은 짧게, 자세한 반응은 출처에서 확인할 수 있게 정리해 독자가 부담 없이 읽도록 돕습니다.</p>
            <a href="/policy/editorial">자세히 보기</a>
          </section>
        </aside>
      </div>
    </main>

    <footer class="board-footer humor-footer">
      <a href="/about">소소타임 소개</a>
      <a href="/policy/editorial">운영 안내</a>
      <a href="/report">신고/삭제요청</a>
      <a href="/upload">글 제보</a>
      <a href="/contact">문의하기</a>
      <a href="/policy/privacy">개인정보처리방침</a>
      <a href="/policy/terms">이용약관</a>
    </footer>

    <script type="module" src="/app.js"></script>
  </body>
</html>
`;

await writeFile("public/index.html", html, "utf8");
console.log(`Generated humor portal index page with ${posts.length} posts`);

function renderNavTab(entry) {
  return `<a class="nav-tab" href="/?category=${entry.category}" data-filter="${entry.category}">${escapeHtml(entry.navLabel)}</a>`;
}

function renderStoryCard(post) {
  const meta = getCategory(post);
  return `<article class="story-card humor-story-card">
                <a href="${post.path}">
                  <span class="category-pill ${meta.tone}">${escapeHtml(meta.label)}</span>
                  <img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" />
                  <strong>${escapeHtml(post.title)}</strong>
                  <small>조회 ${numberFormat(post.views)} · 추천 ${numberFormat(post.likes)} · 댓글 ${numberFormat(post.comments)}</small>
                </a>
              </article>`;
}

function renderCategoryColumn(entry) {
  return `<article class="category-column ${entry.tone}">
                <div class="category-column-head">
                  <h3><span>${escapeHtml(entry.icon)}</span>${escapeHtml(entry.label)}</h3>
                  <a href="/?category=${entry.category}" class="nav-tab" data-filter="${entry.category}">더보기</a>
                </div>
                <p>${escapeHtml(entry.description)}</p>
                <ol>
                  ${entry.posts.map((post, index) => renderCategoryPost(post, index)).join("\n                  ")}
                </ol>
              </article>`;
}

function renderCategoryPost(post, index) {
  return `<li><a href="${post.path}"><span>${index + 1}</span><strong>${escapeHtml(post.title)}</strong></a></li>`;
}

function renderLatestItem(post) {
  const meta = getCategory(post);
  return `<li>
                <article class="latest-row">
                  <span class="category-pill ${meta.tone}">${escapeHtml(meta.label)}</span>
                  <div class="latest-copy">
                    <strong><a href="${post.path}">${escapeHtml(post.title)}</a></strong>
                    <small>${escapeHtml(post.sourceName)} · ${relativeMinutes(post)}분 전 · 조회 ${numberFormat(post.views)}</small>
                  </div>
                  <a href="${post.path}" aria-label="${escapeHtml(post.title)} 게시글 보기">
                    <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy" />
                  </a>
                </article>
              </li>`;
}

function renderBestItem(post, rank) {
  return `<li>
                <a href="${post.path}">
                  <span class="best-rank">${rank}</span>
                  <strong>${escapeHtml(post.title)}</strong>
                  <em>${numberFormat(post.score)}</em>
                </a>
              </li>`;
}

function renderEditorMain(post) {
  if (!post) return "";
  return `<a class="editor-main-pick" href="${post.path}">
              <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy" />
              <span>BEST</span>
              <strong>${escapeHtml(post.title)}</strong>
              <small>추천 ${numberFormat(post.likes)} · 조회 ${numberFormat(post.views)}</small>
            </a>`;
}

function renderEditorItem(post) {
  return `<a href="${post.path}">
                <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy" />
                <div>
                  <em>PICK</em>
                  <strong>${escapeHtml(post.title)}</strong>
                  <small>추천 ${numberFormat(post.likes)} · 조회 ${numberFormat(post.views)}</small>
                </div>
              </a>`;
}

function renderGalleryImage(post) {
  return `<a href="${post.path}"><img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" /></a>`;
}

function renderTagCloud() {
  const tags = [...new Set(posts.flatMap((post) => post.tags || []))]
    .filter(Boolean)
    .slice(0, 10);
  return tags.map((tag) => `<a href="/?q=${encodeURIComponent(tag)}">#${escapeHtml(tag)}</a>`).join("\n              ");
}

function getCategory(post) {
  return categoryMeta[post.category] || categoryMeta.funny;
}

function relativeMinutes(post) {
  const index = sortedLatest.findIndex((item) => item.slug === post.slug);
  return Math.max(2, index * 3 + 2);
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
