import { readFile, writeFile } from "node:fs/promises";

const siteUrl = process.env.SITE_URL || "https://sosotime.com";
const adsenseClient = process.env.ADSENSE_CLIENT || "ca-pub-5804969457082424";
const posts = JSON.parse(await readFile("public/data/posts.json", "utf8")).filter((post) => post.status === "published");

const categoryMeta = {
  funny: { label: "유머", board: "humor", tone: "warning" },
  empathy: { label: "웃썰", board: "story", tone: "danger" },
  issue: { label: "사건", board: "issue", tone: "primary" },
  life: { label: "자유", board: "free", tone: "success" },
  info: { label: "정보", board: "info", tone: "info" },
};

const latest = [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
const daily = posts.filter((post) => post.dailyRank).sort((a, b) => a.dailyRank - b.dailyRank).slice(0, 10);
const weekly = posts.filter((post) => post.weeklyRank).sort((a, b) => a.weeklyRank - b.weeklyRank).slice(0, 10);
const hot = [...posts].sort((a, b) => b.score - a.score).slice(0, 5);
const gallery = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 8);
const boardGroups = Object.entries(categoryMeta)
  .map(([category, meta]) => ({
    category,
    ...meta,
    posts: posts.filter((post) => post.category === category).sort((a, b) => b.score - a.score).slice(0, 5),
  }))
  .filter((group) => group.posts.length);

const pageTitle = "소소타임 - 유머 커뮤니티";
const pageDescription =
  "소소타임은 공개 커뮤니티 유머글을 원문 복제 없이 제목, 반응, 핵심 맥락 중심으로 정리하는 Bootstrap 게시판형 큐레이션 사이트입니다.";

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
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDescription)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="naver-site-verification" content="39233df2c0bc4eae9016d16a8866f9f7131b6b60" />
    <link rel="canonical" href="${siteUrl}/" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
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
  <body class="bootstrap-board-body">
    <div class="board-topbar">
      <div class="container">
        <ul class="list-inline pull-left">
          <li><a href="/">즐겨찾기</a></li>
          <li>${formatToday()}</li>
        </ul>
        <ul class="list-inline pull-right">
          <li><a href="/upload">글쓰기</a></li>
          <li><a href="/report">신고/삭제요청</a></li>
          <li><a href="/policy/editorial">운영원칙</a></li>
        </ul>
      </div>
    </div>

    <header class="board-header">
      <div class="container">
        <div class="row">
          <div class="col-sm-5">
            <a class="board-brand" href="/" aria-label="소소타임 홈">
              <strong>SOSO TIME</strong>
              <span>유머 커뮤니티</span>
            </a>
          </div>
          <div class="col-sm-7">
            <form class="board-search input-group" action="/" role="search">
              <label class="sr-only" for="searchInput">검색어 입력</label>
              <input id="searchInput" name="q" class="form-control" type="search" placeholder="제목, 요약, 태그 검색" />
              <span class="input-group-btn"><button class="btn btn-danger" type="submit">검색</button></span>
            </form>
          </div>
        </div>
      </div>
    </header>

    <nav class="navbar navbar-default board-nav" role="navigation" aria-label="게시판 메뉴">
      <div class="container">
        <ul class="nav navbar-nav">
          <li class="active"><a class="nav-tab" href="/" data-filter="all">전체</a></li>
          ${Object.entries(categoryMeta).map(([category, meta]) => renderNav(category, meta)).join("\n          ")}
        </ul>
        <ul class="nav navbar-nav navbar-right">
          <li><a class="rank-button" href="/?rank=daily" data-rank="daily">일일 베스트</a></li>
          <li><a class="rank-button" href="/?rank=weekly" data-rank="weekly">주간 베스트</a></li>
        </ul>
      </div>
    </nav>

    <main class="container board-shell">
      <div class="row">
        <section class="col-md-8 board-main" aria-labelledby="latest-title">
          <div class="panel panel-default board-panel">
            <div class="panel-heading">
              <h1 id="latest-title" class="panel-title">실시간 수집 보드</h1>
              <div class="btn-group btn-group-xs pull-right" role="group" aria-label="정렬">
                <a class="btn btn-default rank-button is-active" href="/" data-rank="latest">최신</a>
                <a class="btn btn-default rank-button" href="/?rank=daily" data-rank="daily">인기</a>
                <a class="btn btn-default rank-button" href="/?rank=weekly" data-rank="weekly">주간</a>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-hover board-table">
                <caption class="sr-only">소소타임 최신 게시글 목록</caption>
                <colgroup>
                  <col class="col-num" />
                  <col />
                  <col class="col-author" />
                  <col class="col-date" />
                  <col class="col-hit" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">번호</th>
                    <th scope="col">제목</th>
                    <th scope="col">출처</th>
                    <th scope="col">날짜</th>
                    <th scope="col">조회</th>
                  </tr>
                </thead>
                <tbody id="postList">
                  ${latest.map((post, index) => renderBoardRow(post, latest.length - index)).join("\n                  ")}
                </tbody>
              </table>
            </div>
          </div>

          <div class="row board-section-grid">
            ${boardGroups.map(renderBoardPreview).join("\n            ")}
          </div>
        </section>

        <aside class="col-md-4 board-sidebar" aria-label="사이드 콘텐츠">
          <section class="panel panel-danger">
            <div class="panel-heading"><h2 class="panel-title">일일 베스트 10</h2></div>
            <ol id="dailyBest" class="list-group rank-list">
              ${daily.map((post) => renderRankItem(post, post.dailyRank)).join("\n              ")}
            </ol>
          </section>

          <section class="panel panel-default">
            <div class="panel-heading"><h2 class="panel-title">주간 베스트 10</h2></div>
            <ol id="weeklyBest" class="list-group rank-list">
              ${weekly.map((post) => renderRankItem(post, post.weeklyRank)).join("\n              ")}
            </ol>
          </section>

          <section class="panel panel-default">
            <div class="panel-heading"><h2 class="panel-title">추천글</h2></div>
            <div class="list-group hot-list">
              ${hot.map(renderHotItem).join("\n              ")}
            </div>
          </section>

          <section class="panel panel-default">
            <div class="panel-heading"><h2 class="panel-title">오늘의 짤</h2></div>
            <div class="panel-body">
              <div class="board-gallery">
                ${gallery.map(renderGalleryItem).join("\n                ")}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>

    <footer class="board-footer">
      <div class="container">
        <ul class="list-inline">
          <li><a href="/about">사이트 소개</a></li>
          <li><a href="/policy/editorial">운영 안내</a></li>
          <li><a href="/report">신고/삭제요청</a></li>
          <li><a href="/upload">후기 제보</a></li>
          <li><a href="/contact">문의하기</a></li>
          <li><a href="/policy/privacy">개인정보처리방침</a></li>
          <li><a href="/policy/terms">이용약관</a></li>
        </ul>
        <p>원문 전체를 복제하지 않고 공개 목록 메타와 자체 요약 중심으로 큐레이션합니다.</p>
      </div>
    </footer>

    <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script type="module" src="/app.js"></script>
  </body>
</html>
`;

await writeFile("public/index.html", html, "utf8");
console.log(`Generated Bootstrap board index page with ${posts.length} posts`);

function renderNav(category, meta) {
  return `<li><a class="nav-tab" href="/?category=${category}" data-filter="${category}">${escapeHtml(meta.label)}</a></li>`;
}

function renderBoardRow(post, number) {
  const meta = getCategory(post);
  return `<tr data-category="${post.category}" data-rank-daily="${post.dailyRank || ""}" data-rank-weekly="${post.weeklyRank || ""}">
                    <td class="text-center board-number">${number}</td>
                    <td class="board-title-cell">
                      <a href="${post.path}"><span class="label label-${meta.tone}">${escapeHtml(meta.label)}</span> ${escapeHtml(post.title)}</a>
                      <span class="comment-count">[${numberFormat(post.comments)}]</span>
                      <p>${escapeHtml(post.summary)}</p>
                    </td>
                    <td class="text-center board-author">${escapeHtml(post.sourceName)}</td>
                    <td class="text-center">${formatDate(post.publishedAt)}</td>
                    <td class="text-center">${numberFormat(post.views)}</td>
                  </tr>`;
}

function renderBoardPreview(group) {
  return `<div class="col-sm-6">
              <section class="panel panel-default mini-board">
                <div class="panel-heading">
                  <h2 class="panel-title">${escapeHtml(group.label)}</h2>
                  <a href="/?category=${group.category}" class="nav-tab" data-filter="${group.category}">더보기</a>
                </div>
                <ul class="list-unstyled">
                  ${group.posts.map((post) => `<li><a href="${post.path}">${escapeHtml(post.title)}</a><span>${numberFormat(post.views)}</span></li>`).join("\n                  ")}
                </ul>
              </section>
            </div>`;
}

function renderRankItem(post, rank) {
  return `<li class="list-group-item">
                <a href="${post.path}">
                  <span class="rank-badge">${rank}</span>
                  <strong>${escapeHtml(post.title)}</strong>
                  <em>${numberFormat(post.score)}</em>
                </a>
              </li>`;
}

function renderHotItem(post) {
  const meta = getCategory(post);
  return `<a class="list-group-item hot-item" href="${post.path}">
                <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy" />
                <span>
                  <b>${escapeHtml(post.title)}</b>
                  <small><span class="label label-${meta.tone}">${escapeHtml(meta.label)}</span> 추천 ${numberFormat(post.likes)}</small>
                </span>
              </a>`;
}

function renderGalleryItem(post) {
  return `<a href="${post.path}"><img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" /></a>`;
}

function getCategory(post) {
  return categoryMeta[post.category] || categoryMeta.funny;
}

function formatToday() {
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", weekday: "short" }).format(new Date());
}

function formatDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit" }).format(date).replace(/\.$/, "");
}

function numberFormat(value) {
  return new Intl.NumberFormat("ko-KR").format(value || 0);
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
