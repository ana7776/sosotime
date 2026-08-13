import { writeFile } from "node:fs/promises";
import {
  author,
  categoryMeta,
  escapeHtml,
  loadPosts,
  renderComicHero,
  renderHead,
  renderPhotoCard,
  renderSiteFooter,
  renderSiteHeader,
  renderTagLinks,
  safeJson,
  siteUrl,
} from "./site-helpers.js";

const posts = await loadPosts();
const featured = posts[0];
const mosaicRest = posts.slice(1, 5);
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
      <section class="photo-mosaic-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">LATEST PICK</p>
            <h1>사진으로 먼저 보는 소소타임</h1>
          </div>
        </div>
        ${
          featured
            ? `<div class="photo-mosaic">
          <a class="photo-mosaic-main" href="${featured.path}">
            <img src="${featured.image}" alt="${escapeHtml(featured.title)} 대표 이미지" loading="eager" />
          </a>
          ${mosaicRest
            .map(
              (post) => `<a class="photo-mosaic-item" href="${post.path}">
            <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy" />
          </a>`,
            )
            .join("\n          ")}
        </div>`
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
        <div class="category-tiles">
          ${categoryBlocks
            .map(
              ({ category, meta, posts: items }) => `<a class="category-tile" href="/category/${category}/" style="--accent:${meta.accent}">
              <img src="${items[0].image}" alt="${escapeHtml(meta.label)} 카테고리 대표 이미지" loading="lazy" />
            </a>`,
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
        <div class="photo-grid">
          ${latest.map(renderPhotoCard).join("\n          ")}
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
