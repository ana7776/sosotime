import { mkdir, rm, writeFile } from "node:fs/promises";
import {
  author,
  canonicalUrl,
  categoryMeta,
  escapeHtml,
  formatShortDate,
  getCategoryPosts,
  getTagMap,
  loadPosts,
  renderHead,
  renderPostCard,
  renderSiteFooter,
  renderSiteHeader,
  siteUrl,
  slugifyTag,
} from "./site-helpers.js";

const posts = await loadPosts();
const tagMap = getTagMap(posts);
const eligibleTags = [...tagMap.entries()].filter(([, list]) => list.length >= 2);

await Promise.all([
  rm("public/category", { recursive: true, force: true }),
  rm("public/tag", { recursive: true, force: true }),
  rm("public/author", { recursive: true, force: true }),
]);

for (const [category, meta] of Object.entries(categoryMeta)) {
  const items = getCategoryPosts(posts, category);
  if (!items.length) continue;
  await writePage(`public/category/${category}/index.html`, renderCollectionPage({
    title: `${meta.label} 글 모음 | 소소타임`,
    description: `${meta.label} 카테고리에서 생활 속 장면을 차분하게 풀어낸 글을 모았습니다.`,
    canonicalPath: `/category/${category}/`,
    heading: `${meta.label} - 생활 속에서 오래 남는 장면들`,
    intro: meta.intro,
    currentPath: `/category/${category}/`,
    posts: items,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${meta.label} 글 모음`,
      description: meta.intro,
      url: `${siteUrl}/category/${category}/`,
    },
  }));
}

for (const [tag, items] of eligibleTags) {
  const slug = slugifyTag(tag);
  const intro = `#${tag} 태그는 한 번 보고 끝나는 농담보다 비슷한 경험이 이어지는 글을 묶어 보여줍니다. 같은 단어라도 상황에 따라 웃음, 공감, 생활 팁으로 읽히는 결이 다르기 때문에 이 태그에 모인 글을 함께 보면 반응의 공통점과 차이를 더 또렷하게 볼 수 있습니다.`;
  await writePage(`public/tag/${slug}/index.html`, renderCollectionPage({
    title: `#${tag} 글 모음 | 소소타임`,
    description: `${tag}와 이어지는 생활 글을 소소타임에서 모아 봅니다.`,
    canonicalPath: `/tag/${slug}/`,
    heading: `#${tag} 글 모음`,
    intro,
    currentPath: "",
    posts: items,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `#${tag} 글 모음`,
      description: intro,
      url: `${siteUrl}/tag/${slug}/`,
    },
  }));
}

await writePage(`public/author/${author.slug}/index.html`, renderAuthorPage());
await writePage("public/404.html", render404Page());
await writeFile("public/rss.xml", renderRss(), "utf8");
await writeFile("public/_redirects", renderRedirects(), "utf8");

const staticPages = [
  {
    key: "about",
    path: "/about/",
    title: "사이트 소개 | 소소타임",
    description: "소소타임이 어떤 글을 왜 쓰는지 소개합니다.",
    body: `
      <p>소소타임은 김안나가 생활 속에서 자주 마주치는 장면을 직접 쓰는 글 사이트입니다. 출근길의 민망함, 공공장소에서 생기는 작은 눈치, 웃고 넘기지만 오래 남는 말투 같은 주제를 고릅니다. 누구나 한 번쯤 겪었을 법한 일을 다루되, 장면 묘사와 감정의 결을 충분히 남겨 얇지 않은 글로 읽히게 하는 것이 운영 기준입니다.</p>
      <p>여기 있는 글은 짧은 감상이나 링크 모음이 아니라, 생활 속에서 왜 그런 반응이 생기는지까지 풀어 쓰는 오리지널 원고입니다. 그래서 제목만 자극적으로 세우기보다 실제로 도움이 되는 판단 기준이나 공감 포인트가 남는지 먼저 점검합니다. 읽는 사람이 가볍게 웃고도 자기 경험을 떠올릴 수 있는 글을 꾸준히 쌓아 가는 것이 목표입니다.</p>
    `,
  },
  {
    key: "contact",
    path: "/contact/",
    title: "문의하기 | 소소타임",
    description: "소소타임 운영자에게 의견이나 수정 요청을 보낼 수 있는 페이지입니다.",
    body: `
      <p>글 내용에 대한 의견, 표현 수정 요청, 오탈자 제안, 광고 노출 관련 문의는 아래 메일로 보내 주세요. 운영자가 직접 확인하고 필요한 경우 내용 수정이나 보완 작업을 진행합니다.</p>
      <p><a href="mailto:${author.email}">${author.email}</a></p>
      <p>연락을 보낼 때는 해당 글 주소와 확인이 필요한 부분을 함께 적어 주시면 더 빠르게 확인할 수 있습니다. 광고와 정책 관련 문의도 같은 메일로 받습니다.</p>
    `,
  },
  {
    key: "upload",
    path: "/upload/",
    title: "글 제안 안내 | 소소타임",
    description: "소소타임에 어울리는 생활 소재를 제안하는 방법을 안내합니다.",
    body: `
      <p>소소타임은 생활 속 웃음과 공감을 담은 소재를 중심으로 글을 씁니다. 주변에서 자주 반복되는 장면이나, 많은 사람이 자기 경험을 겹쳐 볼 수 있는 생활 이야기가 있다면 메일로 알려 주세요.</p>
      <p>다만 제안받은 내용을 그대로 게시하지는 않습니다. 운영자가 직접 다시 관찰하고 자신의 문장으로 정리할 수 있는 주제만 다루며, 개인정보나 특정인을 불편하게 만들 수 있는 소재는 받지 않습니다.</p>
    `,
  },
  {
    key: "report",
    path: "/report/",
    title: "수정 요청 | 소소타임",
    description: "표현 수정이나 삭제 요청을 보낼 수 있는 안내 페이지입니다.",
    body: `
      <p>특정 표현이 사실과 다르게 느껴지거나 수정이 필요하다고 판단되면 메일로 알려 주세요. 생활 글 특성상 개인을 특정하지 않는 방향을 기본으로 삼지만, 불편함이 생길 수 있는 지점은 빠르게 다시 보겠습니다.</p>
      <p>요청 메일에는 글 주소, 수정이 필요한 문장, 요청 이유를 함께 적어 주시면 확인이 수월합니다. 검토 후 반영 여부와 방향을 가능한 범위 안에서 답변드리겠습니다.</p>
    `,
  },
  {
    key: "editorial",
    path: "/policy/editorial/",
    title: "운영 안내 | 소소타임",
    description: "소소타임이 어떤 기준으로 글을 쓰고 고치는지 안내합니다.",
    body: `
      <p>소소타임은 생활 속 웃음, 공감, 이야기, 정보를 운영자가 직접 써서 올리는 사이트입니다. 누군가의 문장을 그대로 가져오지 않고, 한 장면을 다시 관찰하고 풀어쓴 글만 공개합니다. 자극적인 판단이나 확인되지 않은 주장보다 실제로 독자가 떠올릴 수 있는 장면과 생활 기준을 남기는 편을 우선합니다.</p>
      <p>선정적이거나 혐오를 부를 수 있는 소재, 개인을 특정할 수 있는 내용, 사실 확인이 어려운 단정은 다루지 않습니다. 글을 수정할 때도 같은 기준을 유지하며, 오탈자나 오해 소지가 있는 표현은 별도 연락이 오기 전에도 계속 점검합니다.</p>
    `,
  },
  {
    key: "privacy",
    path: "/policy/privacy/",
    title: "개인정보처리방침 | 소소타임",
    description: "소소타임의 개인정보 및 쿠키 처리 방침입니다.",
    body: `
      <p>소소타임은 별도의 회원 가입 기능을 운영하지 않지만, 문의 메일을 통해 이름이나 이메일 주소처럼 사용자가 직접 보내는 정보가 전달될 수 있습니다. 이 정보는 문의 내용 확인과 답변을 위해서만 사용하며, 관련 목적이 끝난 뒤에는 필요한 기간만 보관한 후 정리합니다.</p>
      <p>이 사이트는 Google AdSense 광고를 포함할 수 있으며, 광고 제공 과정에서 쿠키나 유사 기술이 사용될 수 있습니다. Google과 제3자 광고 파트너는 방문자의 이전 방문 기록을 바탕으로 맞춤형 광고를 제공할 수 있고, 사용자는 브라우저 설정이나 Google 광고 설정에서 개인 맞춤 광고를 관리할 수 있습니다.</p>
      <p>로그 분석이나 보안 점검을 위해 서버 접근 기록, 기기 정보, 브라우저 정보가 일시적으로 처리될 수 있습니다. 이는 서비스 안정성 유지와 비정상 접근 확인을 위한 최소 범위에서만 사용합니다.</p>
    `,
  },
  {
    key: "terms",
    path: "/policy/terms/",
    title: "이용약관 | 소소타임",
    description: "소소타임 이용 시 참고할 기본 약관입니다.",
    body: `
      <p>소소타임의 모든 글과 이미지는 사이트 운영 목적에 맞게 관리되며, 방문자는 개인적인 읽기와 공유 범위 안에서 이용할 수 있습니다. 글 일부를 인용할 때는 문맥이 훼손되지 않도록 필요한 최소 범위만 사용해 주세요.</p>
      <p>사이트 운영자는 서비스 안정성과 운영 정책에 따라 글의 공개 범위나 표현을 조정할 수 있습니다. 이용 과정에서 불편한 점이나 수정이 필요한 사항은 문의 페이지를 통해 알려 주시면 검토 후 반영하겠습니다.</p>
    `,
  },
];

for (const page of staticPages) {
  const html = renderStaticPage(page);
  await writePage(`public${page.path}index.html`, html);
  await writeFile(`public/${page.key}.html`, html, "utf8");
  if (page.path.startsWith("/policy/")) {
    await writeFile(`public${page.path.slice(0, -1)}.html`, html, "utf8");
  }
}

console.log(`Generated static pages, ${Object.keys(categoryMeta).length} categories, ${eligibleTags.length} tags, author page, RSS, redirects, and 404`);

function renderCollectionPage({ title, description, canonicalPath, heading, intro, currentPath, posts, jsonLd }) {
  return `<!doctype html>
<html lang="ko">
  <head>
${renderHead({ title, description, canonicalPath, jsonLd })}
  </head>
  <body>
    ${renderSiteHeader({ currentPath })}
    <main class="page-shell">
      <section class="generic-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">COLLECTION</p>
            <h1>${escapeHtml(heading)}</h1>
          </div>
        </div>
        <p class="intro-copy">${escapeHtml(intro)}</p>
        <div class="collection-grid">
          ${posts.map(renderPostCard).join("\n          ")}
        </div>
      </section>
    </main>
    ${renderSiteFooter()}
  </body>
</html>`;
}

function renderAuthorPage() {
  const intro =
    "김안나는 소소타임에서 생활 속 웃음과 공감을 직접 써서 기록합니다. 커뮤니티 반응을 따라가는 대신, 누구나 자기 경험을 포개어 볼 수 있는 장면을 천천히 풀어 쓰는 방식을 좋아합니다. 출근길과 퇴근 후의 작은 민망함, 공공장소에서 생기는 눈치, 제품이나 안내 문구를 읽을 때 헷갈리는 지점을 생활 언어로 다시 쓰는 것이 주된 작업입니다. 한 번 웃고 끝나는 글보다는, 읽고 나서도 자기 하루를 떠올리게 만드는 글을 오래 남기는 것이 목표입니다.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    email: author.email,
    url: `${siteUrl}${author.path}`,
    worksFor: {
      "@type": "Organization",
      name: "소소타임",
      url: siteUrl,
    },
  };

  return `<!doctype html>
<html lang="ko">
  <head>
${renderHead({
  title: `글쓴이 소개 | ${author.name} | 소소타임`,
  description: `${author.name}가 어떤 기준으로 생활 글을 쓰는지 소개합니다.`,
  canonicalPath: author.path,
  jsonLd,
})}
  </head>
  <body>
    ${renderSiteHeader({ currentPath: author.path })}
    <main class="page-shell">
      <section class="generic-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">AUTHOR</p>
            <h1>${author.name}</h1>
          </div>
        </div>
        <p class="intro-copy">${escapeHtml(intro)}</p>
        <div class="meta-copy">
          <p>연락처: <a href="mailto:${author.email}">${author.email}</a></p>
        </div>
        <div class="collection-grid">
          ${posts.map(renderPostCard).join("\n          ")}
        </div>
      </section>
    </main>
    ${renderSiteFooter()}
  </body>
</html>`;
}

function renderStaticPage(page) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: `${siteUrl}${page.path}`,
  };
  return `<!doctype html>
<html lang="ko">
  <head>
${renderHead({
  title: page.title,
  description: page.description,
  canonicalPath: page.path,
  jsonLd,
})}
  </head>
  <body>
    ${renderSiteHeader({ currentPath: page.path })}
    <main class="page-shell">
      <section class="generic-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">INFO</p>
            <h1>${escapeHtml(page.title.replace(" | 소소타임", ""))}</h1>
          </div>
        </div>
        <div class="rich-copy">
          ${page.body}
        </div>
      </section>
    </main>
    ${renderSiteFooter()}
  </body>
</html>`;
}

function render404Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "페이지를 찾을 수 없음 | 소소타임",
    description: "요청한 페이지를 찾을 수 없을 때 이동할 수 있는 안내 페이지입니다.",
    url: `${siteUrl}/404.html`,
  };
  return `<!doctype html>
<html lang="ko">
  <head>
${renderHead({
  title: "페이지를 찾을 수 없음 | 소소타임",
  description: "요청한 페이지를 찾지 못했을 때 홈과 주요 글로 이동할 수 있습니다.",
  canonicalPath: "/404.html",
  jsonLd,
})}
  </head>
  <body>
    ${renderSiteHeader()}
    <main class="page-shell">
      <section class="generic-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">404</p>
            <h1>찾으시는 페이지가 없습니다.</h1>
          </div>
        </div>
        <div class="rich-copy">
          <p>주소가 바뀌었거나 삭제된 페이지일 수 있습니다. 아래 링크에서 홈, 카테고리, 최근 글로 다시 이동해 보세요.</p>
        </div>
        <div class="quick-links">
          <a href="/">홈으로 이동</a>
          <a href="/category/funny/">웃음 글 보기</a>
          <a href="/category/empathy/">공감 글 보기</a>
          <a href="${posts[0]?.path || "/"}">최근 글 보기</a>
        </div>
      </section>
    </main>
    ${renderSiteFooter()}
  </body>
</html>`;
}

function renderRss() {
  const items = posts.slice(0, 20).map((post) => `  <item>
    <title>${escapeHtml(post.title)}</title>
    <link>${siteUrl}${post.path}</link>
    <guid>${siteUrl}${post.path}</guid>
    <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    <description>${escapeHtml(post.description)}</description>
  </item>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>소소타임</title>
  <link>${siteUrl}/</link>
  <description>생활 속 웃음과 공감을 직접 쓰는 글 모음</description>
  <language>ko-KR</language>
${items.join("\n")}
</channel>
</rss>
`;
}

function renderRedirects() {
  return `# legacy post redirects
/posts/댓글-분위기가-글의-인상을-바꾸는-순간/ /posts/group-chat-emoticon/ 301
/posts/긴-제목이-클릭을-부르는-때와-피로하게-만드는-때/ / 301
/posts/링크만-던져진-글보다-한눈에-보이는-글이-편한-이유/ / 301
/posts/베스트-글에서-반복되는-공통-구조/ / 301
/posts/사소한-인증-글이-오래-회자되는-조건/ / 301
/posts/사진-한-장이-설명보다-빠르게-퍼지는-이유/ / 301
/posts/스포츠-장면-하나가-유머-글로-번지는-이유/ / 301
/posts/저녁-게시판에-농담-글이-몰리는-이유/ / 301
/posts/출근길-목격담이-댓글을-빠르게-모으는-이유/ / 301
/about /about/ 301
/contact /contact/ 301
/upload /upload/ 301
/report /report/ 301
/policy/editorial /policy/editorial/ 301
/policy/privacy /policy/privacy/ 301
/policy/terms /policy/terms/ 301
https://www.sosotime.com/* https://sosotime.com/:splat 301
`;
}

async function writePage(path, html) {
  const directory = path.slice(0, path.lastIndexOf("/"));
  if (directory) {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(path, html, "utf8");
}
