import { readFile, writeFile } from "node:fs/promises";
import { author, siteUrl } from "./site-helpers.js";

const postsFile = "public/data/posts.json";
const posts = JSON.parse(await readFile(postsFile, "utf8"));

const categoryDescriptors = {
  funny: {
    description: "생활 속에서 갑자기 웃음이 터지는 장면을 차분하게 풀어봅니다.",
    summary:
      "억지로 과장하지 않아도 웃긴 장면은 보통 타이밍과 눈치에서 만들어집니다. 그래서 제목보다 그 순간의 분위기와 주변 반응을 같이 읽을 때 재미가 더 또렷해집니다.",
    comment: "웃긴 글일수록 누군가를 놀리는 말보다 그 장면의 어색한 타이밍을 먼저 떠올리면 훨씬 편하게 읽힙니다.",
  },
  empathy: {
    description: "누구나 한 번쯤 겪었을 법한 생활 장면을 공감 중심으로 정리합니다.",
    summary:
      "공감이 오래 남는 글은 큰 사건보다 사소한 순간을 구체적으로 붙잡습니다. 읽으면서 자기 하루와 겹치는 부분을 찾게 되면 짧은 글도 훨씬 깊게 남습니다.",
    comment: "공감 글은 정답을 찾기보다 내 경험이 어디서 겹치는지 확인하는 마음으로 읽을 때 더 편안합니다.",
  },
  issue: {
    description: "사람들이 왜 그 장면에 반응했는지 생활 언어로 다시 풀어봅니다.",
    summary:
      "빠르게 퍼진 이야기는 결론보다 맥락을 나눠 읽어야 오래 남습니다. 어떤 조건에서 반응이 커졌는지 분리해서 보면 괜한 피로를 줄일 수 있습니다.",
    comment: "이야기성 글은 찬반을 먼저 고르기보다 장면의 조건과 받아들이는 방식을 따로 보면 훨씬 덜 소모적입니다.",
  },
  life: {
    description: "일상에서 바로 떠올릴 수 있는 생활 기준과 반응을 정리합니다.",
    summary:
      "생활 글은 거창한 조언보다 내 동선과 습관에 바로 대입할 수 있는 기준이 남아야 합니다. 그래서 상황 설명과 작은 선택지를 함께 적는 편이 더 실용적입니다.",
    comment: "생활 글은 좋은 답 하나보다 지금 내 자리에서 바꿀 수 있는 기준 하나가 남을 때 가장 유용합니다.",
  },
  info: {
    description: "헷갈리기 쉬운 생활 정보를 가볍지만 빈약하지 않게 정리합니다.",
    summary:
      "정보 글은 숫자를 많이 붙이는 것보다 독자가 무엇부터 확인하면 되는지 먼저 보여 주는 편이 훨씬 도움이 됩니다. 한 번 읽고 바로 써먹을 수 있는 순서가 핵심입니다.",
    comment: "정보 글은 외워야 할 문장보다 실제로 확인 가능한 기준을 남겨 둘 때 가치가 커집니다.",
  },
};

const newPosts = [
  {
    slug: "delivery-driver-short-chat-laugh-point",
    title: "택배 기사님과 나눈 짧은 대화가 웃음 포인트가 되는 순간",
    category: "funny",
    tags: ["택배", "짧은대화", "생활유머"],
    publishedAt: "2026-08-13T07:20:00.000Z",
    opening:
      "현관 앞에서 택배를 받다가 기사님과 두어 마디 나누는 순간, 예상하지 못한 농담 한마디에 둘 다 웃어버리는 경우가 있습니다. 짧은 순간이지만 그날 하루의 기분을 살짝 바꿔 놓기도 합니다.",
    detail:
      "이런 장면이 재미있는 이유는 두 사람 다 준비되지 않은 상태였기 때문입니다. 정해진 인사말이 아니라 그 자리에서 즉흥적으로 나온 말이라서, 짧아도 오래 기억에 남는 웃음이 됩니다.",
  },
  {
    slug: "meeting-mic-mute-forget-moment",
    title: "회의 중 마이크 음소거를 깜빡했을 때 벌어지는 일",
    category: "funny",
    tags: ["화상회의", "음소거", "직장생활"],
    publishedAt: "2026-08-14T07:30:00.000Z",
    opening:
      "화상회의 중 음소거를 깜빡하고 혼잣말을 하거나 옆에서 나는 생활 소음이 그대로 전달되는 순간이 있습니다. 본인은 뒤늦게 알아차리지만 이미 화면 너머 사람들은 다 들은 뒤입니다.",
    detail:
      "웃음 포인트는 실수 내용보다 그 다음의 정적입니다. 아무도 언급하지 않다가 회의가 끝난 뒤에야 슬쩍 이야기가 나오는 흐름이 이런 소재가 반복해서 공감받는 이유입니다.",
  },
  {
    slug: "moving-day-new-neighborhood-store-feeling",
    title: "이사 첫날 새 동네 편의점에서 느끼는 낯섦",
    category: "empathy",
    tags: ["이사", "새동네", "낯섦"],
    publishedAt: "2026-08-15T07:40:00.000Z",
    opening:
      "이사한 첫날 짐 정리를 하다 잠깐 나온 편의점에서 물건 위치가 낯설어 한참을 서성이게 됩니다. 늘 다니던 동네와 같은 브랜드인데도 진열이 다르면 괜히 어색해집니다.",
    detail:
      "많은 사람이 공감하는 지점은 물건을 못 찾는 것 자체보다 그 낯섦이 주는 감정입니다. 익숙했던 동선이 사라졌다는 사실이 새삼 이사를 실감하게 만드는 순간으로 이어집니다.",
  },
  {
    slug: "reunion-friend-conversation-topic-moment",
    title: "오랜만에 만난 친구와 대화 주제를 찾는 순간",
    category: "empathy",
    tags: ["오랜만", "친구", "대화"],
    publishedAt: "2026-08-16T07:35:00.000Z",
    opening:
      "몇 년 만에 만난 친구와 자리에 앉으면 반가움이 지나간 뒤 잠깐 정적이 찾아옵니다. 무슨 이야기부터 꺼내야 할지 서로 눈치를 보는 그 짧은 순간이 묘하게 어색합니다.",
    detail:
      "이 장면이 공감을 받는 이유는 사이가 멀어져서가 아니라 서로의 최근이 낯설어졌기 때문입니다. 몇 마디만 오가면 다시 예전 리듬을 찾는다는 걸 알면서도 그 시작이 늘 조심스럽습니다.",
  },
  {
    slug: "community-verification-post-doubt-comment-pattern",
    title: "커뮤니티 인증 글에 달리는 의심 댓글의 패턴",
    category: "issue",
    tags: ["인증글", "의심댓글", "커뮤니티"],
    publishedAt: "2026-08-18T07:25:00.000Z",
    opening:
      "특이한 경험담이나 인증 글이 올라오면 놀랍다는 반응과 함께 꼭 의심하는 댓글도 따라붙습니다. 사실 여부를 가리기 어려운 글일수록 이런 패턴이 더 빠르게 나타납니다.",
    detail:
      "이런 반응이 반복되는 이유는 온라인 글 특성상 맥락을 다 보여줄 수 없기 때문입니다. 의심하는 사람도, 믿는 사람도 결국 자기 경험에 비추어 판단하기 때문에 같은 글을 두고도 반응이 크게 갈립니다.",
  },
  {
    slug: "short-clip-all-day-talk-reason",
    title: "짧은 영상 하나가 하루 종일 회자되는 이유",
    category: "issue",
    tags: ["짧은영상", "화제", "온라인반응"],
    publishedAt: "2026-08-19T07:45:00.000Z",
    opening:
      "몇 초짜리 짧은 영상 하나가 하루 종일 여러 커뮤니티를 돌며 회자되는 경우가 있습니다. 내용 자체는 단순한데도 각자 다른 지점에서 재미나 공감을 느끼기 때문입니다.",
    detail:
      "이런 흐름을 보면 화제성은 정보량보다 재해석 가능성에서 나온다는 걸 알 수 있습니다. 같은 장면을 두고 사람마다 다른 댓글과 밈이 붙으면서 원래보다 더 오래, 더 넓게 퍼집니다.",
  },
  {
    slug: "trending-search-issue-temperature-gap",
    title: "실시간 검색어에 오른 이슈를 대하는 온도차",
    category: "issue",
    tags: ["실시간검색어", "이슈", "온도차"],
    publishedAt: "2026-08-20T07:15:00.000Z",
    opening:
      "같은 이슈가 실시간 검색어에 올라도 누군가는 심각하게 받아들이고 누군가는 가볍게 넘깁니다. 이슈 자체의 무게보다 그걸 처음 접한 경로와 타이밍이 온도차를 만드는 경우가 많습니다.",
    detail:
      "이런 차이가 흥미로운 지점은 같은 정보를 봐도 반응이 갈린다는 사실입니다. 먼저 자세한 맥락을 접한 사람과 제목만 본 사람의 반응이 다르기 때문에, 이슈를 볼 때는 어디서 처음 접했는지도 함께 살펴보면 좋습니다.",
  },
  {
    slug: "evening-mart-discount-corner-habit",
    title: "저녁 시간대 마트 할인 코너를 확인하는 습관",
    category: "life",
    tags: ["마트", "할인코너", "저녁시간"],
    publishedAt: "2026-08-21T07:50:00.000Z",
    opening:
      "퇴근 후 마트에 들르면 저녁 시간대에만 나오는 할인 스티커를 확인하는 게 습관이 된 사람들이 많습니다. 같은 제품이라도 이 시간대를 놓치면 다음 날까지 기다려야 하는 경우가 흔합니다.",
    detail:
      "실질적으로 도움이 되는 기준은 할인 폭보다 도착 순서입니다. 신선식품 코너를 먼저 살펴보고 나머지 장보기를 뒤로 미루는 순서만 바꿔도 원하는 물건을 놓치는 일이 줄어듭니다.",
  },
  {
    slug: "seasonal-closet-reorganize-delay-reason",
    title: "환절기 옷장 정리를 미루게 되는 이유",
    category: "life",
    tags: ["환절기", "옷장정리", "생활습관"],
    publishedAt: "2026-08-22T07:20:00.000Z",
    opening:
      "계절이 바뀌는 시기가 되면 옷장을 정리해야 한다는 걸 알면서도 며칠씩 미루게 됩니다. 아직 더운 날과 선선한 날이 섞여 있어 무엇을 먼저 꺼내야 할지 애매하기 때문입니다.",
    detail:
      "이럴 때 도움이 되는 기준은 날씨 예보보다 아침저녁 체감 온도입니다. 낮 기온이 아니라 출근 시간대 온도를 기준으로 옷을 골라 두면 정리 타이밍을 놓치는 일이 줄어듭니다.",
  },
  {
    slug: "seasonal-cold-prevention-first-check",
    title: "환절기 감기 예방을 위해 먼저 확인할 것",
    category: "info",
    tags: ["환절기", "감기예방", "생활정보"],
    publishedAt: "2026-08-23T07:10:00.000Z",
    opening:
      "환절기에는 큰 일교차 때문에 감기 예방 수칙부터 찾아보게 되지만, 실제로 먼저 확인할 것은 실내외 온도차와 하루 중 가장 쌀쌀한 시간대입니다.",
    detail:
      "확인 순서를 정해 두면 대비가 훨씬 수월해집니다. 아침 최저기온, 사무실이나 실내 냉방 세기, 야외 이동 시간 순으로 살펴보면 겉옷을 챙길지 말지 헷갈리는 일이 줄어듭니다.",
  },
];

const startId = Math.max(...posts.map((post) => post.id)) + 1;

newPosts.forEach((entry, index) => {
  const id = startId + index;
  const descriptor = categoryDescriptors[entry.category];
  const tags = entry.tags;
  const tagText = tags.join(", ");

  const body = [
    {
      heading: "그 장면은 보통 이렇게 시작됩니다",
      paragraphs: [
        entry.opening,
        `${tags[0]} 이야기가 자꾸 반복해서 공감을 받는 이유도 여기에 있습니다. 누구나 비슷한 상황을 한 번쯤 지나왔기 때문에, 글을 읽는 순간 자기 경험이 자연스럽게 겹쳐지고 장면이 훨씬 선명하게 살아납니다.`,
      ],
    },
    {
      heading: "왜 그때 더 크게 느껴졌을까요",
      paragraphs: [
        entry.detail,
        `그래서 이런 글은 누가 더 예민했는지를 단정하는 방식으로 읽기보다, 어떤 조건이 반응을 키웠는지 나눠 보는 편이 낫습니다. ${tags[1]}처럼 익숙한 요소가 섞이면 독자는 자기 기준까지 함께 떠올리게 됩니다.`,
      ],
    },
    {
      heading: "비슷한 상황에서는 이런 차이가 생깁니다",
      paragraphs: [
        `${tagText}처럼 익숙한 소재는 장소와 시간만 달라져도 전혀 다른 결로 읽힙니다. 평일과 주말이 다르고, 혼자 있을 때와 사람이 많은 자리에서 느끼는 민망함이나 편안함도 꽤 다르게 움직입니다.`,
        `그래서 비슷한 이야기를 볼 때는 장면 자체를 외우기보다 조건을 같이 보는 습관이 중요합니다. 사람이 많았는지, 시간에 쫓기는 상황이었는지, 이미 비슷한 경험이 누적된 상태였는지를 같이 보면 글의 맥락이 훨씬 또렷해집니다.`,
      ],
    },
    {
      heading: "이럴 때 내가 먼저 챙기게 된 기준",
      paragraphs: [
        `${entry.title} 같은 일을 여러 번 보고 나면 결국 거창한 해결책보다 작은 기준이 남습니다. 상황을 한 번 더 살피거나, 잠깐 거리를 두고 다시 보거나, 내가 먼저 확인할 수 있는 정보를 챙기는 식의 변화가 실제로 가장 오래 갑니다.`,
        `생활 글이 도움 되는 순간도 바로 여기입니다. 정답을 외우기보다 내 습관에 바로 붙일 수 있는 기준 하나를 건져 가면 다음 비슷한 장면에서 덜 흔들립니다. 읽고 끝내지 않고 생활 감각으로 남길 수 있어야 얇지 않은 글이 됩니다.`,
      ],
    },
    {
      heading: "읽고 나서 남는 한마디",
      paragraphs: [
        `${entry.title}은 거창한 교훈을 주는 소재는 아니지만, 그래서 더 오래 남습니다. 누구나 쉽게 지나칠 수 있는 순간을 붙잡아 두면 우리가 어디에서 웃고, 어디에서 멈칫하고, 어디에서 서로를 이해하는지가 자연스럽게 드러납니다.`,
        `소소타임은 이런 생활 장면을 한 번 더 천천히 풀어 적는 방식으로 기록합니다. 다음에 비슷한 글을 만났을 때도 자극적인 반응만 보지 말고 내가 실제로 겪은 순간과 어떤 부분이 겹치는지부터 떠올려 보면 읽는 재미와 정보성이 함께 남습니다.`,
      ],
    },
  ];

  while (bodyLength(body) < 1200) {
    body[0].paragraphs[0] += " 그 작은 차이가 하루의 인상을 바꾸는 경우가 생각보다 흔합니다.";
    body[2].paragraphs[1] += " 같은 소재라도 조건을 나눠 읽는 습관이 있으면 억지 해석에 휩쓸릴 가능성도 줄어듭니다.";
    body[4].paragraphs[1] += " 그래서 생활 글은 짧더라도 결국 독자의 실제 하루와 이어질 수 있어야 합니다.";
  }

  posts.push({
    id,
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    sourceName: author.name,
    sourceUrl: `${siteUrl}${author.path}`,
    image: `/assets/posts/post-${String(id).padStart(2, "0")}.webp`,
    views: 0,
    likes: 0,
    comments: 0,
    score: 0,
    dailyRank: null,
    weeklyRank: null,
    tags,
    body,
    publishedAt: entry.publishedAt,
    updatedAt: entry.publishedAt,
    description: `${entry.title}을 중심으로 ${descriptor.description}`,
    summary: `${descriptor.summary} ${entry.title} 같은 글은 장면을 눈앞에 그리듯 읽을수록 더 잘 남습니다.`,
    curatorComment: `${descriptor.comment} ${tags[0]}처럼 익숙한 요소를 기준 삼아 보면 글의 결이 더 또렷해집니다.`,
    path: `/posts/${entry.slug}/`,
    status: "published",
  });
});

await writeFile(postsFile, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
console.log(`Added ${newPosts.length} posts, total ${posts.length}`);

function bodyLength(sections) {
  return sections.reduce((sum, section) => sum + section.paragraphs.reduce((acc, paragraph) => acc + paragraph.length, 0), 0);
}
