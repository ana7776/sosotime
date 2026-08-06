import { readFile, writeFile } from "node:fs/promises";
import { author, siteUrl } from "./site-helpers.js";

const postsFile = "public/data/posts.json";
const posts = JSON.parse(await readFile(postsFile, "utf8"));

const replacements = {
  "old-hof-vibe-reactions": {
    title: "오래된 호프집 분위기 글에 사람들이 유독 반응하는 이유",
    tags: ["호프집", "추억", "생활유머"],
    category: "funny",
  },
  "shorts-fatigue-long-posts": {
    title: "짧은 영상에 지친 날 긴 글이 다시 읽히는 순간",
    tags: ["짧은영상", "긴글", "읽기습관"],
    category: "info",
  },
};

const categoryDescriptors = {
  funny: {
    description: "생활 속에서 갑자기 웃음이 터지는 장면을 차분하게 풀어봅니다.",
    summary: "억지로 과장하지 않아도 웃긴 장면은 보통 타이밍과 눈치에서 만들어집니다. 그래서 제목보다 그 순간의 분위기와 주변 반응을 같이 읽을 때 재미가 더 또렷해집니다.",
    comment: "웃긴 글일수록 누군가를 놀리는 말보다 그 장면의 어색한 타이밍을 먼저 떠올리면 훨씬 편하게 읽힙니다.",
  },
  empathy: {
    description: "누구나 한 번쯤 겪었을 법한 생활 장면을 공감 중심으로 정리합니다.",
    summary: "공감이 오래 남는 글은 큰 사건보다 사소한 순간을 구체적으로 붙잡습니다. 읽으면서 자기 하루와 겹치는 부분을 찾게 되면 짧은 글도 훨씬 깊게 남습니다.",
    comment: "공감 글은 정답을 찾기보다 내 경험이 어디서 겹치는지 확인하는 마음으로 읽을 때 더 편안합니다.",
  },
  issue: {
    description: "사람들이 왜 그 장면에 반응했는지 생활 언어로 다시 풀어봅니다.",
    summary: "빠르게 퍼진 이야기는 결론보다 맥락을 나눠 읽어야 오래 남습니다. 어떤 조건에서 반응이 커졌는지 분리해서 보면 괜한 피로를 줄일 수 있습니다.",
    comment: "이야기성 글은 찬반을 먼저 고르기보다 장면의 조건과 받아들이는 방식을 따로 보면 훨씬 덜 소모적입니다.",
  },
  life: {
    description: "일상에서 바로 떠올릴 수 있는 생활 기준과 반응을 정리합니다.",
    summary: "생활 글은 거창한 조언보다 내 동선과 습관에 바로 대입할 수 있는 기준이 남아야 합니다. 그래서 상황 설명과 작은 선택지를 함께 적는 편이 더 실용적입니다.",
    comment: "생활 글은 좋은 답 하나보다 지금 내 자리에서 바꿀 수 있는 기준 하나가 남을 때 가장 유용합니다.",
  },
  info: {
    description: "헷갈리기 쉬운 생활 정보를 가볍지만 빈약하지 않게 정리합니다.",
    summary: "정보 글은 숫자를 많이 붙이는 것보다 독자가 무엇부터 확인하면 되는지 먼저 보여 주는 편이 훨씬 도움이 됩니다. 한 번 읽고 바로 써먹을 수 있는 순서가 핵심입니다.",
    comment: "정보 글은 외워야 할 문장보다 실제로 확인 가능한 기준을 남겨 둘 때 가치가 커집니다.",
  },
};

for (const post of posts) {
  const replacement = replacements[post.slug];
  if (replacement) {
    post.title = replacement.title;
    post.tags = replacement.tags;
    post.category = replacement.category;
  }

  const descriptor = categoryDescriptors[post.category] || categoryDescriptors.life;
  const topic = post.title;
  const tags = (post.tags || []).slice(0, 3);
  const tagText = tags.length ? tags.join(", ") : "생활 장면";

  post.description = `${topic}을 중심으로 ${descriptor.description}`;
  post.summary = `${descriptor.summary} ${topic} 같은 글은 장면을 눈앞에 그리듯 읽을수록 더 잘 남습니다.`;
  post.curatorComment = `${descriptor.comment} ${tags[0] ? `${tags[0]}처럼 익숙한 요소를 기준 삼아 보면 글의 결이 더 또렷해집니다.` : ""}`.trim();
  post.sourceName = author.name;
  post.sourceUrl = `${siteUrl}${author.path}`;
  post.views = 0;
  post.likes = 0;
  post.comments = 0;
  post.score = 0;
  post.dailyRank = null;
  post.weeklyRank = null;
  post.body = buildBody(post, tagText);
}

await writeFile(postsFile, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
console.log(`Upgraded ${posts.length} posts`);

function buildBody(post, tagText) {
  const opener = post.title;
  const firstTag = post.tags?.[0] || "생활";
  const secondTag = post.tags?.[1] || "장면";
  const sections = [
    {
      heading: "그 장면은 보통 이렇게 시작됩니다",
      paragraphs: [
        `${opener} 같은 일은 대개 아주 평범한 타이밍에서 시작됩니다. 특별한 사건이 터진다기보다 모두가 자기 리듬대로 움직이던 순간에 작은 어긋남이 생기고, 그 짧은 틈이 예상보다 오래 기억에 남습니다.`,
        `${firstTag} 이야기가 자꾸 반복해서 공감을 받는 이유도 여기에 있습니다. 누구나 비슷한 상황을 한 번쯤 지나왔기 때문에, 글을 읽는 순간 자기 경험이 자연스럽게 겹쳐지고 장면이 훨씬 선명하게 살아납니다.`,
      ],
    },
    {
      heading: "왜 그때 더 크게 느껴졌을까요",
      paragraphs: [
        `${opener}이 유독 크게 느껴지는 건 사건의 크기보다 마음의 여유와 주변 분위기 때문인 경우가 많습니다. 바쁜 시간대이거나 이미 피곤한 상태에서는 아주 작은 말투와 움직임도 평소보다 크게 다가옵니다.`,
        `그래서 이런 글은 누가 더 예민했는지를 단정하는 방식으로 읽기보다, 어떤 조건이 반응을 키웠는지 나눠 보는 편이 낫습니다. ${secondTag}처럼 익숙한 요소가 섞이면 독자는 자기 기준까지 함께 떠올리게 됩니다.`,
      ],
    },
    {
      heading: "비슷한 상황에서는 이런 차이가 생깁니다",
      paragraphs: [
        `${tagText}처럼 익숙한 소재는 장소와 시간만 달라져도 전혀 다른 결로 읽힙니다. 출근 전과 퇴근 후가 다르고, 혼자 있을 때와 사람이 많은 자리에서 느끼는 민망함이나 편안함도 꽤 다르게 움직입니다.`,
        `그래서 비슷한 이야기를 볼 때는 장면 자체를 외우기보다 조건을 같이 보는 습관이 중요합니다. 사람이 많았는지, 말을 길게 할 수 없는 상황이었는지, 이미 비슷한 경험이 누적된 상태였는지를 같이 보면 글의 맥락이 훨씬 또렷해집니다.`,
      ],
    },
    {
      heading: "이럴 때 내가 먼저 챙기게 된 기준",
      paragraphs: [
        `${opener} 같은 일을 여러 번 보고 나면 결국 거창한 해결책보다 작은 기준이 남습니다. 말 한마디를 더 천천히 하거나, 잠깐 거리 두고 상황을 다시 보거나, 내가 먼저 확인할 수 있는 정보를 챙기는 식의 변화가 실제로 가장 오래 갑니다.`,
        `생활 글이 도움 되는 순간도 바로 여기입니다. 정답을 외우기보다 내 습관에 바로 붙일 수 있는 기준 하나를 건져 가면 다음 비슷한 장면에서 덜 흔들립니다. 읽고 끝내지 않고 생활 감각으로 남길 수 있어야 얇지 않은 글이 됩니다.`,
      ],
    },
    {
      heading: "읽고 나서 남는 한마디",
      paragraphs: [
        `${opener}은 거창한 교훈을 주는 소재는 아니지만, 그래서 더 오래 남습니다. 누구나 쉽게 지나칠 수 있는 순간을 붙잡아 두면 우리가 어디에서 웃고, 어디에서 멈칫하고, 어디에서 서로를 이해하는지가 자연스럽게 드러납니다.`,
        `소소타임은 이런 생활 장면을 한 번 더 천천히 풀어 적는 방식으로 기록합니다. 다음에 비슷한 글을 만났을 때도 자극적인 반응만 보지 말고 내가 실제로 겪은 순간과 어떤 부분이 겹치는지부터 떠올려 보면 읽는 재미와 정보성이 함께 남습니다.`,
      ],
    },
  ];

  while (bodyLength(sections) < 1200) {
    sections[0].paragraphs[0] += " 그 작은 차이가 하루의 인상을 바꾸는 경우가 생각보다 흔합니다.";
    sections[2].paragraphs[1] += " 같은 소재라도 조건을 나눠 읽는 습관이 있으면 억지 해석에 휩쓸릴 가능성도 줄어듭니다.";
    sections[4].paragraphs[1] += " 그래서 생활 글은 짧더라도 결국 독자의 실제 하루와 이어질 수 있어야 합니다.";
  }

  return sections;
}

function bodyLength(sections) {
  return sections.reduce((sum, section) => sum + section.paragraphs.reduce((acc, paragraph) => acc + paragraph.length, 0), 0);
}
