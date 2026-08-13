import { writeFile } from "node:fs/promises";
import {
  author,
  categoryMeta,
  escapeHtml,
  formatShortDate,
  loadPosts,
  renderComicHero,
  renderHead,
  renderPostCard,
  renderSiteFooter,
  renderSiteHeader,
  renderTagLinks,
  safeJson,
  siteUrl,
} from "./site-helpers.js";

const posts = await loadPosts();
const featured = posts[0];
const latest = posts.slice(0, 12);
const categoryBlocks = Object.entries(categoryMeta)
  .map(([category, meta]) => ({
    category,
    meta,
    posts: posts.filter((post) => post.category === category).slice(0, 4),
  }))
  .filter((block) => block.posts.length > 0);

const pageTitle = "소소타임 | 생활 속 웃음과 공감을 직접 쓰는 글";
const pageDescription =
  "소소타임은 김안나가 생활 속 웃음, 공감, 이야기, 생활 정보 주제를 직접 정리해 올리는 오리지널 글 아카이브입니다.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "소소타임",
      url: siteUrl,
      inLanguage: "ko-KR",
      description: pageDescription,
    },
    {
      "@type": "Organization",
      name: "소소타임",
      url: siteUrl,
      founder: {
        "@type": "Person",
        name: author.name,
        email: author.email,
      },
    },
  ],
};

const html = `<!doctype html>
<html lang="ko">
  <head>
${renderHead({
  title: pageTitle,
  description: pageDescription,
  canonicalPath: "/",
  image: featured?.image,
  jsonLd,
})}
  </head>
  <body class="soso-home-body">
    ${renderSiteHeader({ currentPath: "/" })}
    ${renderComicHero()}
    <main class="page-shell">
      <section class="home-hero-card">
        <div>
          <p class="eyebrow">MONDAY NOTES</p>
          <h1>생활 속에서 웃기고, 민망하고, 괜히 오래 남는 순간을 차분하게 기록합니다.</h1>
          <p>
            소소타임은 김안나가 직접 겪었거나 주변에서 자주 마주치는 장면을 바탕으로 쓴 생활형 글을 모읍니다.
            짧게 웃고 끝나는 이야기라도 상황과 감정의 결을 같이 남겨, 다시 읽어도 얇지 않게 정리하는 쪽을 택합니다.
          </p>
        </div>
        <div class="home-hero-side">
          <strong>${posts.length}</strong>
          <span>현재 공개 글 수</span>
          <a href="${author.path}">글쓴이 소개 보기</a>
        </div>
      </section>

      <section class="feature-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">LATEST PICK</p>
            <h2>최근 올라온 글</h2>
          </div>
          <span>${featured ? formatShortDate(featured.publishedAt) : ""}</span>
        </div>
        ${
          featured
            ? `<article class="feature-card">
          <img src="${featured.image}" alt="${escapeHtml(featured.title)} 대표 이미지" loading="eager" />
          <div>
            <small>${escapeHtml(categoryMeta[featured.category]?.label || "글")}</small>
            <h3><a href="${featured.path}">${escapeHtml(featured.title)}</a></h3>
            <p>${escapeHtml(featured.summary)}</p>
            <a class="primary-link" href="${featured.path}">이 글 읽기</a>
          </div>
        </article>`
            : ""
        }
      </section>

      <section class="category-guide">
        <div class="section-heading">
          <div>
            <p class="eyebrow">CATEGORY</p>
            <h2>카테고리별로 둘러보기</h2>
          </div>
        </div>
        <div class="category-grid">
          ${categoryBlocks
            .map(
              ({ category, meta, posts: items }) => `<article class="category-panel">
              <h3><a href="/category/${category}/">${escapeHtml(meta.label)}</a></h3>
              <p>${escapeHtml(meta.intro)}</p>
              <ul>
                ${items
                  .map(
                    (post) =>
                      `<li><a href="${post.path}">${escapeHtml(post.title)}</a><span>${formatShortDate(post.publishedAt)}</span></li>`,
                  )
                  .join("\n                ")}
              </ul>
            </article>`,
            )
            .join("\n          ")}
        </div>
      </section>

      <section class="latest-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">ARCHIVE</p>
            <h2>최신 글 모음</h2>
          </div>
        </div>
        <div class="collection-grid">
          ${latest.map(renderPostCard).join("\n          ")}
        </div>
      </section>

      <section class="tag-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">TAGS</p>
            <h2>자주 이어지는 이야기</h2>
          </div>
        </div>
        <div class="tag-cloud">
          ${renderTagLinks(posts)}
        </div>
      </section>
    </main>
    ${renderSiteFooter()}
  </body>
</html>
`;

await writeFile("public/index.html", html, "utf8");
console.log(`Generated home page with ${posts.length} posts`);
