import { readFile } from "node:fs/promises";

export const siteUrl = (process.env.SITE_URL || "https://sosotime.com").replace(/\/$/, "");
export const adsenseClient = process.env.ADSENSE_CLIENT || "ca-pub-5804969457082424";
export const author = {
  name: "김안나",
  slug: "kimanna",
  email: "anagim7776@gmail.com",
  path: "/author/kimanna/",
};

export const categoryMeta = {
  funny: {
    label: "웃음",
    shortLabel: "유머",
    intro:
      "웃음 카테고리는 하루 중 딱 한 번이라도 피식하게 만드는 생활 장면을 모읍니다. 누군가를 놀리거나 과장된 자극을 쫓기보다, 우리 모두 한 번쯤 겪었을 법한 민망함과 타이밍의 어긋남에서 웃음이 어떻게 생기는지 풀어냅니다. 짧은 해프닝도 맥락을 살려 읽으면 훨씬 오래 남기 때문에, 제목보다 장면과 감정의 결을 차분하게 짚는 글을 중심에 둡니다.",
  },
  empathy: {
    label: "공감",
    shortLabel: "공감",
    intro:
      "공감 카테고리는 별일 아닌데 이상하게 오래 기억나는 순간들을 다룹니다. 출근길, 집에 돌아온 저녁, 반려동물과 보내는 시간처럼 큰 사건은 아니어도 누구에게나 자기 이야기를 겹쳐 볼 틈이 있는 장면을 고릅니다. 읽고 나서 정보를 외우는 대신 '나도 비슷했다'는 감각이 남도록, 감정의 흐름과 생활 감각을 구체적으로 풀어 쓰는 데 집중합니다.",
  },
  issue: {
    label: "이야기",
    shortLabel: "이야기",
    intro:
      "이야기 카테고리는 온라인에서 화제가 된 장면을 그대로 따라가기보다, 왜 사람들이 그 지점에서 멈춰 서서 말하게 되는지 해석해 보는 공간입니다. 반응이 빨리 붙는 이슈일수록 단정적인 판단보다 장면의 조건과 받아들이는 방식이 더 중요합니다. 그래서 자극적인 결론 대신, 읽는 사람이 스스로 맥락을 분리해 볼 수 있도록 생활 언어로 다시 정리합니다.",
  },
  life: {
    label: "생활",
    shortLabel: "생활",
    intro:
      "생활 카테고리는 일상에서 바로 써먹을 수 있는 작은 기준을 다룹니다. 출근길 동선, 공공장소의 눈치, 더운 날과 늦은 밤의 생활 리듬처럼 사소하지만 반복되는 문제를 다루기 때문에 한 번 읽고 지나가도 실제 선택에 남는 것이 있어야 합니다. 거창한 팁보다도 상황을 읽는 법과 스스로 조절할 수 있는 기준을 차분하게 정리합니다.",
  },
  info: {
    label: "정보",
    shortLabel: "정보",
    intro:
      "정보 카테고리는 생활에 바로 닿는 판단 기준을 가볍지만 빈약하지 않게 설명합니다. 제품 후기나 서비스 안내, 계절 이슈처럼 누구나 한 번쯤 마주치는 소재를 다루되 숫자나 문구를 그대로 나열하지 않고 무엇을 먼저 확인하면 덜 헷갈리는지에 초점을 맞춥니다. 읽고 나면 '그래서 나는 무엇부터 보면 되는가'가 남도록 구성한 글만 모아 둡니다.",
  },
};

export async function loadPosts() {
  const posts = JSON.parse(await readFile("public/data/posts.json", "utf8"));
  return posts.filter((post) => post.status === "published").sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export function getCategoryPosts(posts, category) {
  return posts.filter((post) => post.category === category);
}

export function getTagMap(posts) {
  const map = new Map();
  for (const post of posts) {
    for (const tag of post.tags || []) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(post);
    }
  }
  return map;
}

export function slugifyTag(tag) {
  return String(tag)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function formatShortDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function absoluteUrl(value) {
  if (!value) return siteUrl;
  if (/^https?:\/\//.test(value)) return value;
  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

export function canonicalUrl(path) {
  return `${siteUrl}${path}`;
}

export function renderHead({ title, description, canonicalPath, image, type = "website", jsonLd }) {
  const canonical = canonicalUrl(canonicalPath);
  const imageUrl = image ? absoluteUrl(image) : undefined;
  return `    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" type="application/rss+xml" title="소소타임 RSS" href="/rss.xml" />
    <link rel="stylesheet" href="/styles.css" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="소소타임" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />${imageUrl ? `\n    <meta property="og:image" content="${imageUrl}" />` : ""}
    <meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />${imageUrl ? `\n    <meta name="twitter:image" content="${imageUrl}" />` : ""}
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}" crossorigin="anonymous"></script>
    <script type="application/ld+json">${safeJson(jsonLd)}</script>`;
}

export function renderSiteHeader({ currentPath = "/" } = {}) {
  const nav = [
    { href: "/", label: "홈" },
    ...Object.entries(categoryMeta).map(([category, meta]) => ({
      href: `/category/${category}/`,
      label: meta.label,
    })),
    { href: author.path, label: "글쓴이" },
    { href: "/about/", label: "사이트 소개" },
  ];

  return `<header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/" aria-label="소소타임 홈">
          <span class="brand-mark">소소</span>
          <span>
            <strong>소소타임</strong>
            <small>김안나의 생활 글 아카이브</small>
          </span>
        </a>
        <nav class="top-nav" aria-label="주요 메뉴">
          ${nav
            .map(
              (item) =>
                `<a class="nav-tab${currentPath === item.href ? " is-active" : ""}" href="${item.href}">${escapeHtml(item.label)}</a>`,
            )
            .join("\n          ")}
        </nav>
      </div>
    </header>`;
}

export function renderSiteFooter() {
  return `<footer class="site-footer">
      <a href="/about/">사이트 소개</a>
      <a href="/author/kimanna/">글쓴이 소개</a>
      <a href="/policy/editorial/">운영 안내</a>
      <a href="/policy/privacy/">개인정보처리방침</a>
      <a href="/contact/">문의하기</a>
      <a href="/policy/terms/">이용약관</a>
      <a href="/rss.xml">RSS</a>
    </footer>`;
}

export function renderPostCard(post) {
  return `<article class="collection-card">
      <a class="collection-row" href="${post.path}">
        <span class="collection-thumb"><img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy" /></span>
        <span class="collection-copy">
          <strong>${escapeHtml(post.title)}</strong>
          <small>${escapeHtml(categoryMeta[post.category]?.label || "글")} · ${formatShortDate(post.publishedAt)}</small>
          <p>${escapeHtml(post.description)}</p>
        </span>
      </a>
    </article>`;
}

export function renderTagLinks(posts) {
  const tagMap = getTagMap(posts);
  const tags = [...tagMap.entries()]
    .filter(([, list]) => list.length >= 2)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "ko"))
    .slice(0, 18);

  return tags
    .map(
      ([tag, list]) =>
        `<a href="/tag/${encodeURIComponent(slugifyTag(tag))}/">#${escapeHtml(tag)} <span>${list.length}</span></a>`,
    )
    .join("\n            ");
}
