import { rm, mkdir, readFile, writeFile } from "node:fs/promises";

const siteUrl = process.env.SITE_URL || "https://sosotime.com";
const posts = JSON.parse(await readFile("public/data/posts.json", "utf8")).filter((post) => post.status === "published");
const categoryLabels = {
  funny: "유머",
  empathy: "공감",
  issue: "이슈",
  life: "생활",
  info: "정보"
};
const categoryEntries = Object.entries(categoryLabels)
  .map(([category, label]) => ({ category, label, count: posts.filter((post) => post.category === category).length }))
  .filter((entry) => entry.count > 0);
const adsenseClient = process.env.ADSENSE_CLIENT || "ca-pub-5804969457082424";

await rm("public/posts", { recursive: true, force: true });

for (const post of posts) {
  const dir = `public${post.path}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}index.html`, renderPost(post), "utf8");
}

console.log(`Generated ${posts.length} static post pages`);

function renderPost(post) {
  const canonical = `${siteUrl}${post.path}`;
  const categoryLabel = categoryLabels[post.category];
  const pageTitle = `${post.title} - 소소타임`;
  const imageUrl = absoluteUrl(post.image);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.description,
        image: imageUrl,
        inLanguage: "ko-KR",
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        articleSection: categoryLabel,
        author: {
          "@type": "Organization",
          name: "소소타임",
          url: siteUrl
        },
        publisher: {
          "@type": "Organization",
          name: "소소타임",
          url: siteUrl
        },
        mainEntityOfPage: canonical
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "홈",
            item: `${siteUrl}/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryLabel,
            item: `${siteUrl}/?category=${post.category}`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: canonical
          }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(post.description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />
    <link rel="stylesheet" href="/styles.css" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="소소타임" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(post.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="article:published_time" content="${post.publishedAt}" />
    <meta property="article:modified_time" content="${post.updatedAt || post.publishedAt}" />
    <meta property="article:section" content="${escapeHtml(categoryLabel)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(post.description)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}" crossorigin="anonymous"></script>
    <script type="application/ld+json">${safeJson(jsonLd)}</script>
  </head>
  <body>
    ${siteHeader()}
    <main class="page-shell article-shell">
      <article class="article-page">
        <nav class="breadcrumb" aria-label="현재 위치">
          <a href="/">홈</a>
          <span>›</span>
          <span>${escapeHtml(categoryLabels[post.category])}</span>
        </nav>
        <header class="article-header">
          <p class="eyebrow">${escapeHtml(categoryLabels[post.category])} CURATION</p>
          <h1>${escapeHtml(post.title)}</h1>
          <p class="article-description">${escapeHtml(post.summary)}</p>
          <p class="preview-notice">이 글은 원문 전체를 복제하지 않는 제한적 미리보기입니다. 핵심 상황과 반응만 요약하고, 자세한 맥락은 출처 링크에서 확인할 수 있습니다.</p>
          <dl class="article-meta">
            <div><dt>출처</dt><dd>${escapeHtml(post.sourceName)}</dd></div>
            <div><dt>발행</dt><dd>${formatDate(post.publishedAt)}</dd></div>
            <div><dt>추천</dt><dd>${numberFormat(post.likes)}</dd></div>
            <div><dt>댓글</dt><dd>${numberFormat(post.comments)}</dd></div>
          </dl>
        </header>

        <figure class="article-figure">
          <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="eager" />
          <figcaption>${escapeHtml(post.title)}의 분위기를 먼저 잡아볼 수 있는 대표 이미지입니다.</figcaption>
        </figure>

        <section class="reader-brief" aria-labelledby="summary-title">
          <h2 id="summary-title">먼저 보면 좋은 부분</h2>
          <ul>
            ${summaryPoints(post).map((point) => `<li>${escapeHtml(point)}</li>`).join("\n            ")}
          </ul>
          <p>${escapeHtml(post.curatorComment)}</p>
        </section>

        ${post.body.map(renderSection).join("\n")}

        <section class="related-posts" aria-labelledby="related-title">
          <h2 id="related-title">같이 보면 좋은 글</h2>
          <div>
            ${relatedPosts(post).map(renderRelatedPost).join("\n            ")}
          </div>
        </section>

        <section class="article-source" aria-labelledby="source-title">
          <p class="eyebrow">SOURCE</p>
          <h2 id="source-title">출처에서 원문 보기</h2>
          <p>소소타임은 원문 전체를 옮기지 않고 자체 요약과 큐레이션만 제공합니다. 원문 반응, 추천, 댓글 흐름을 더 보고 싶다면 아래 출처 링크를 확인해 주세요.</p>
          <div class="source-action-row">
            <a class="source-primary-link" href="${post.sourceUrl}" target="_blank" rel="noopener noreferrer">출처로 이동하기</a>
            <a href="/report?post=${encodeURIComponent(post.path)}">신고/삭제요청</a>
          </div>
        </section>

        <section class="article-tags" aria-label="태그">
          ${post.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}
        </section>
      </article>
    </main>
    ${siteFooter()}
  </body>
</html>
`;
}

function renderSection(section) {
  return `<section class="article-section">
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n          ")}
        </section>`;
}

function relatedPosts(post) {
  const sameCategory = posts.filter((item) => item.id !== post.id && item.category === post.category);
  const fallback = posts.filter((item) => item.id !== post.id && item.category !== post.category);
  return [...sameCategory, ...fallback].slice(0, 3);
}

function renderRelatedPost(post) {
  return `<a href="${post.path}">
              <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy" />
              <span>
                <strong>${escapeHtml(post.title)}</strong>
                <small>추천 ${numberFormat(post.likes)} · 댓글 ${numberFormat(post.comments)}</small>
              </span>
            </a>`;
}

function summaryPoints(post) {
  return [
    post.summary,
    post.body?.[2]?.paragraphs?.[0] || "제목이 약속한 장면과 실제 반응을 나누어 보면 더 편하게 읽을 수 있습니다.",
    post.curatorComment
  ];
}

function siteHeader() {
  return `<header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/" aria-label="소소타임 홈">
          <span class="brand-mark">소소</span>
          <span>
            <strong>소소타임</strong>
            <small>커뮤니티 이슈 큐레이션</small>
          </span>
        </a>
        <nav class="top-nav" aria-label="주요 분류">
          ${categoryEntries.map(({ category, label }) => `<a class="nav-tab" href="/?category=${category}">${label}</a>`).join("\n          ")}
        </nav>
      </div>
    </header>`;
}

function siteFooter() {
  return `<footer class="site-footer">
      <a href="/about">사이트 소개</a>
      <a href="/policy/editorial">운영 안내</a>
      <a href="/report">신고/삭제요청</a>
      <a href="/upload">후기 제보</a>
      <a href="/policy/privacy">개인정보처리방침</a>
      <a href="/contact">문의하기</a>
      <a href="/policy/terms">이용약관</a>
    </footer>`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function numberFormat(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function absoluteUrl(value) {
  if (/^https?:\/\//.test(value)) return value;
  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
