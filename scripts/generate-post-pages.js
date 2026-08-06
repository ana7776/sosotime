import { mkdir, rm, writeFile } from "node:fs/promises";
import {
  absoluteUrl,
  author,
  canonicalUrl,
  categoryMeta,
  escapeHtml,
  formatDate,
  formatShortDate,
  loadPosts,
  renderHead,
  renderSiteFooter,
  renderSiteHeader,
  safeJson,
  siteUrl,
  slugifyTag,
} from "./site-helpers.js";

const posts = await loadPosts();

await rm("public/posts", { recursive: true, force: true });

for (const post of posts) {
  const dir = `public${post.path}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}index.html`, renderPost(post), "utf8");
}

console.log(`Generated ${posts.length} static post pages`);

function renderPost(post) {
  const canonical = canonicalUrl(post.path);
  const category = categoryMeta[post.category];
  const related = relatedPosts(post, 3);
  const inlineRelated = relatedPosts(post, 2);
  const { previous, next } = previousNext(post);
  const pageTitle = `${post.title} | 소소타임`;
  const pageDescription = post.description;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: pageDescription,
        image: absoluteUrl(post.image),
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        inLanguage: "ko-KR",
        articleSection: category?.label || "글",
        author: {
          "@type": "Person",
          name: author.name,
          url: `${siteUrl}${author.path}`,
          email: author.email,
        },
        publisher: {
          "@type": "Organization",
          name: "소소타임",
          url: siteUrl,
        },
        mainEntityOfPage: canonical,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
          { "@type": "ListItem", position: 2, name: category?.label || "글", item: `${siteUrl}/category/${post.category}/` },
          { "@type": "ListItem", position: 3, name: post.title, item: canonical },
        ],
      },
    ],
  };

  return `<!doctype html>
<html lang="ko">
  <head>
${renderHead({
  title: pageTitle,
  description: pageDescription,
  canonicalPath: post.path,
  image: post.image,
  type: "article",
  jsonLd,
})}
    <meta property="article:published_time" content="${post.publishedAt}" />
    <meta property="article:modified_time" content="${post.updatedAt || post.publishedAt}" />
    <meta property="article:section" content="${escapeHtml(category?.label || "글")}" />
  </head>
  <body>
    ${renderSiteHeader()}
    <main class="page-shell article-shell">
      <article class="article-page">
        <nav class="breadcrumb" aria-label="현재 위치">
          <a href="/">홈</a>
          <span>›</span>
          <a href="/category/${post.category}/">${escapeHtml(category?.label || "글")}</a>
          <span>›</span>
          <span>${escapeHtml(post.title)}</span>
        </nav>

        <header class="article-header">
          <p class="eyebrow">${escapeHtml(category?.label || "글")}</p>
          <h1>${escapeHtml(post.title)}</h1>
          <p class="article-description">${escapeHtml(post.summary)}</p>
          <div class="article-meta">
            <div><dt>발행일</dt><dd>${formatDate(post.publishedAt)}</dd></div>
            <div><dt>글쓴이</dt><dd><a href="${author.path}">${author.name}</a></dd></div>
            <div><dt>분류</dt><dd>${escapeHtml(category?.label || "글")}</dd></div>
          </div>
        </header>

        <figure class="article-figure">
          <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="eager" />
          <figcaption>${escapeHtml(post.title)}의 분위기를 먼저 떠올릴 수 있도록 만든 대표 이미지입니다.</figcaption>
        </figure>

        <section class="reader-brief" aria-labelledby="summary-title">
          <h2 id="summary-title">먼저 읽으면 좋은 포인트</h2>
          <ul>
            <li>${escapeHtml(post.summary)}</li>
            <li>${escapeHtml(post.curatorComment)}</li>
            <li>${escapeHtml(post.body?.[2]?.paragraphs?.[0] || "장면 자체보다 왜 그런 반응이 생겼는지까지 같이 보면 훨씬 오래 남습니다.")}</li>
          </ul>
        </section>

        ${post.body
          .map((section, index) => `${renderSection(section)}${index === 1 ? renderInlineRelated(inlineRelated) : ""}`)
          .join("\n")}

        <section class="author-note" aria-labelledby="author-note-title">
          <h2 id="author-note-title">글쓴이 메모</h2>
          <p><strong>${author.name}</strong> · 비슷한 일 겪으셨다면 반갑습니다. 의견이나 수정 요청은 <a href="/contact/">문의하기</a>로 보내 주세요.</p>
        </section>

        <nav class="article-pager" aria-label="이전 다음 글">
          ${previous ? `<a href="${previous.path}"><small>이전 글</small><strong>${escapeHtml(previous.title)}</strong></a>` : `<span></span>`}
          ${next ? `<a href="${next.path}"><small>다음 글</small><strong>${escapeHtml(next.title)}</strong></a>` : `<span></span>`}
        </nav>

        <section class="related-posts" aria-labelledby="related-title">
          <h2 id="related-title">같이 읽으면 좋은 글</h2>
          <div>
            ${related.map(renderRelatedPost).join("\n            ")}
          </div>
        </section>

        <section class="article-tags" aria-label="태그">
          ${post.tags.map((tag) => `<a href="/tag/${encodeURIComponent(slugifyTag(tag))}/">#${escapeHtml(tag)}</a>`).join("")}
        </section>
      </article>
    </main>
    ${renderSiteFooter()}
  </body>
</html>`;
}

function renderSection(section) {
  return `<section class="article-section">
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n          ")}
        </section>`;
}

function renderInlineRelated(items) {
  if (!items.length) return "";
  return `<aside class="inline-related" aria-label="본문 중간 추천 글">
          <p>이 장면이 익숙했다면 아래 글도 함께 읽어 보세요.</p>
          <div>
            ${items.map((post) => `<a href="${post.path}">${escapeHtml(post.title)}</a>`).join("")}
          </div>
        </aside>`;
}

function relatedPosts(post, count) {
  const sameCategory = posts.filter((item) => item.id !== post.id && item.category === post.category);
  const sameTag = posts.filter(
    (item) => item.id !== post.id && item.category !== post.category && item.tags.some((tag) => post.tags.includes(tag)),
  );
  const fallback = posts.filter((item) => item.id !== post.id && item.category !== post.category);
  return [...sameCategory, ...sameTag, ...fallback].filter(uniqueById).slice(0, count);
}

function uniqueById(post, index, list) {
  return list.findIndex((item) => item.id === post.id) === index;
}

function renderRelatedPost(post) {
  return `<a href="${post.path}">
              <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy" />
              <span>
                <strong>${escapeHtml(post.title)}</strong>
                <small>${escapeHtml(categoryMeta[post.category]?.label || "글")} · ${formatShortDate(post.publishedAt)}</small>
              </span>
            </a>`;
}

function previousNext(post) {
  const index = posts.findIndex((item) => item.id === post.id);
  return {
    previous: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}
