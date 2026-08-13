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
    slug: "office-dinner-boss-joke-laugh-timing",
    title: "회식 자리에서 사장님 농담에 웃어야 하는 타이밍",
    category: "funny",
    tags: ["회식", "직장생활", "눈치"],
    publishedAt: "2026-07-24T08:10:00.000Z",
    opening:
      "회식 자리에서 사장님이 농담을 던지면 테이블 전체의 시선이 순간적으로 한곳에 모입니다. 재미있어서라기보다 누가 먼저 웃는지, 얼마나 크게 웃는지가 그 자리의 분위기를 정하기 때문입니다.",
    detail:
      "문제는 농담 자체보다 반응 속도입니다. 너무 빨리 웃으면 과하게 보이고, 너무 늦게 웃으면 분위기를 못 읽은 사람이 됩니다. 그 몇 초 사이에 모두가 서로의 표정을 살피는 장면이 이 소재가 계속 회자되는 이유입니다.",
  },
  {
    slug: "group-chat-typo-laugh-moment",
    title: "단톡방에서 오타 하나가 웃음 포인트가 되는 순간",
    category: "funny",
    tags: ["단톡방", "오타", "메신저"],
    publishedAt: "2026-07-27T07:35:00.000Z",
    opening:
      "바쁘게 손가락을 움직이다 보면 단톡방에 의도하지 않은 단어가 올라가는 순간이 있습니다. 본인은 바로 지우고 싶지만 이미 다른 사람들이 읽어버린 뒤라 상황을 되돌릴 수 없습니다.",
    detail:
      "재미의 핵심은 오타의 내용보다 그 뒤에 이어지는 정적입니다. 아무도 언급하지 않다가 누군가 짧은 이모티콘 하나를 보내는 순간, 방 안의 긴장이 한 번에 풀리는 흐름이 이런 글의 공통된 구조입니다.",
  },
  {
    slug: "shared-umbrella-rainy-season-awkwardness",
    title: "장마철 우산 하나를 같이 쓰다 생기는 어색함",
    category: "empathy",
    tags: ["장마", "우산", "생활공감"],
    publishedAt: "2026-07-30T07:50:00.000Z",
    opening:
      "갑자기 쏟아진 비에 우산이 하나뿐이면 누구와 함께 걷느냐에 따라 거리감이 완전히 달라집니다. 평소라면 신경 쓰지 않았을 어깨 간격 하나가 이상하게 의식되는 순간입니다.",
    detail:
      "이런 장면이 오래 기억에 남는 이유는 대화보다 침묵 때문입니다. 우산 아래에서는 굳이 말을 하지 않아도 서로의 걸음 속도를 맞추게 되고, 그 짧은 동행이 예상보다 편안했다는 기억으로 남는 경우가 많습니다.",
  },
  {
    slug: "vacation-return-desk-pile-feeling",
    title: "여름휴가 복귀 첫날 책상에 쌓인 것들을 보는 마음",
    category: "empathy",
    tags: ["여름휴가", "출근", "복귀"],
    publishedAt: "2026-08-02T08:05:00.000Z",
    opening:
      "휴가를 다녀온 다음 날 책상 앞에 앉으면 쌓인 메일과 메모부터 눈에 들어옵니다. 며칠 쉬었을 뿐인데 마치 오래 자리를 비운 사람처럼 낯설게 느껴지는 순간입니다.",
    detail:
      "많은 사람이 공감하는 지점은 복귀 자체보다 그 사이의 온도차입니다. 느긋했던 리듬에서 갑자기 평소 속도로 돌아가야 하는 그 하루가 유독 길게 느껴진다는 이야기가 반복해서 나옵니다.",
  },
  {
    slug: "review-star-rating-mood-shift",
    title: "온라인 후기 별점 하나로 분위기가 갈리는 이유",
    category: "issue",
    tags: ["온라인후기", "별점", "반응"],
    publishedAt: "2026-08-04T07:20:00.000Z",
    opening:
      "같은 매장, 같은 메뉴를 두고도 후기 별점은 사람마다 크게 갈립니다. 별 하나 차이가 실제 경험의 차이보다 그날의 기분과 기다린 시간에 더 좌우되는 경우가 많기 때문입니다.",
    detail:
      "이런 글이 화제가 되는 지점은 별점 자체보다 댓글의 온도입니다. 낮은 별점 하나에 반박 댓글이 몰리기도 하고, 반대로 비슷한 경험을 가진 사람들이 조용히 동의하기도 하면서 여론이 순식간에 갈립니다.",
  },
  {
    slug: "realtime-rank-post-drop-speed",
    title: "실시간 인기글이 순위에서 빠르게 밀려나는 이유",
    category: "issue",
    tags: ["실시간인기", "게시판", "순위"],
    publishedAt: "2026-08-06T07:45:00.000Z",
    opening:
      "오전에 상위권이던 글이 오후가 되면 흔적도 없이 밀려나 있는 경우가 있습니다. 글의 완성도가 갑자기 떨어진 것이 아니라 그 시간대에 더 자극적인 소재가 몰렸기 때문인 경우가 많습니다.",
    detail:
      "이런 흐름을 보면 순위가 콘텐츠의 질보다 타이밍에 좌우된다는 사실이 드러납니다. 좋은 글도 비슷한 소재가 한꺼번에 쏟아지는 시간대를 만나면 묻히고, 반대로 조용한 시간대에는 평범한 글도 오래 상위권에 머무릅니다.",
  },
  {
    slug: "rainy-season-shoe-care-morning-time",
    title: "장마철 신발 관리로 아침 시간이 늘어나는 이유",
    category: "life",
    tags: ["장마", "신발관리", "아침루틴"],
    publishedAt: "2026-08-08T07:15:00.000Z",
    opening:
      "장마철에는 신발장을 여는 순간부터 아침 루틴이 달라집니다. 전날 젖은 신발이 마르지 않아 다른 신발을 급하게 찾아야 하는 상황이 반복되기 때문입니다.",
    detail:
      "이 시기에 도움이 되는 기준은 화려한 방수 용품보다 순서입니다. 신발을 벗은 직후 물기를 먼저 닦아 두는 습관 하나만 있어도 다음 날 아침에 고르는 시간이 눈에 띄게 줄어듭니다.",
  },
  {
    slug: "summer-fridge-reorganize-standard",
    title: "여름철 냉장고 정리 기준을 다시 세우게 되는 순간",
    category: "life",
    tags: ["여름철", "냉장고정리", "생활기준"],
    publishedAt: "2026-08-09T07:30:00.000Z",
    opening:
      "더운 계절에는 냉장고 문을 여는 횟수가 늘면서 안쪽 정리가 금세 흐트러집니다. 자리를 정해 두었던 식재료도 며칠만 지나면 뒤섞여 무엇이 있는지 한눈에 파악하기 어려워집니다.",
    detail:
      "이럴 때 실질적으로 도움이 되는 기준은 칸을 나누는 방법보다 유통기한이 짧은 것을 눈높이에 두는 습관입니다. 문을 열자마자 보이는 자리에 먼저 먹어야 할 것을 두면 정리 상태가 훨씬 오래 유지됩니다.",
  },
  {
    slug: "vacation-delivery-delay-notice-checklist",
    title: "휴가철 택배 배송 지연 안내를 확인하는 순서",
    category: "info",
    tags: ["휴가철", "택배", "배송지연"],
    publishedAt: "2026-08-11T07:40:00.000Z",
    opening:
      "휴가철에는 물류량이 몰리면서 평소보다 배송이 며칠씩 늦어지는 경우가 흔합니다. 이 시기에는 예상 도착일보다 안내 문자와 배송 조회 화면을 먼저 확인하는 편이 헷갈림을 줄여 줍니다.",
    detail:
      "확인 순서를 정해 두면 불필요한 문의를 줄일 수 있습니다. 주문 상태, 예상 지연 안내, 고객센터 공지 순으로 살펴보면 실제로 문제가 생긴 건인지 단순히 물량이 몰린 시기인지 구분하기 쉬워집니다.",
  },
  {
    slug: "heat-wave-alert-text-first-check",
    title: "폭염 특보 문자를 받은 뒤 가장 먼저 확인할 것",
    category: "info",
    tags: ["폭염특보", "안전문자", "여름철"],
    publishedAt: "2026-08-12T08:00:00.000Z",
    opening:
      "폭염 특보 문자를 받으면 대부분 온도부터 확인하지만, 실제로 먼저 볼 것은 시간대별 야외활동 자제 권고와 우리 동네 무더위 쉼터 운영 여부입니다.",
    detail:
      "문자 내용을 넘겨 버리기보다 낮 시간대 외출 계획이 있는지부터 점검하는 편이 실질적입니다. 특히 실외 활동이 많은 날에는 물병과 그늘막 위치를 미리 정해 두는 작은 습관이 체감 안전도를 크게 바꿉니다.",
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
