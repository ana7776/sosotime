import { mkdir, writeFile } from "node:fs/promises";

const categories = ["funny", "empathy", "issue", "life"];
const sources = ["자유게시판", "유머/감동", "일상토크", "HOT게시글", "생활정보"];
const titleSeeds = [
  "회사 냉장고에 이름 안 쓴 음료의 결말",
  "동네 마트 계산대에서 들은 한마디",
  "버스에서 이어폰 한쪽 잃어버린 후기",
  "관리비 고지서 보고 다들 놀란 이유",
  "중고거래 약속 장소가 갑자기 바뀐 사연",
  "카톡 단체방에 잘못 올린 사진 한 장",
  "퇴근길 지하철에서 모두 조용해진 순간",
  "편의점 알바생이 기억하는 단골 손님",
  "점심 메뉴 투표가 길어진 이유",
  "택배 기사님 문자에 웃음 터진 썰"
];
const tagPool = ["공감", "직장", "일상", "반전", "소소", "웃음", "이슈", "생활", "토론", "베스트"];

const summaryTemplates = [
  "짧은 일상 이야기인데 댓글에서 비슷한 경험담이 이어지며 공감이 붙었습니다. 과하게 설명하지 않아도 상황이 바로 그려지는 글입니다.",
  "처음에는 별일 아닌 듯 시작하지만 마지막 반응 때문에 분위기가 바뀐 게시글입니다. 댓글은 웃기다는 쪽과 이해된다는 쪽으로 갈렸습니다.",
  "생활 속 작은 불편을 다룬 글입니다. 해결책보다 각자 겪은 사례가 더 많이 달리면서 게시판에서 오래 회자됐습니다.",
  "사진 한 장과 짧은 설명만으로 맥락이 전달된 글입니다. 원문을 길게 옮기기보다 핵심 상황과 반응만 추려 소개합니다.",
  "호불호가 갈릴 수 있는 주제라 댓글 토론이 붙었습니다. 다만 큰 논쟁보다는 가볍게 읽을 수 있는 생활형 화제에 가깝습니다."
];
const commentTemplates = [
  "댓글 흐름을 보면 웃음 포인트보다 '나도 저런 적 있다'는 반응이 강했습니다.",
  "제목만 보면 단순한 해프닝인데, 읽고 나면 왜 인기글로 올라왔는지 납득되는 유형입니다.",
  "커뮤니티식 과장 없이 상황을 정리하면 오히려 더 담백하게 재미가 살아납니다.",
  "비슷한 경험담이 이어지기 좋은 소재라 오늘의 소소한 화제로 묶기 좋습니다.",
  "핵심은 사건 자체보다 사람들이 붙인 해석과 반응입니다."
];

const posts = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1;
  const category = categories[index % categories.length];
  const sourceName = sources[index % sources.length];
  const seed = titleSeeds[index % titleSeeds.length];
  const publishedAt = new Date(Date.UTC(2026, 5, 24, 6, 0, 0) - index * 37 * 60 * 1000).toISOString();
  const likes = 90 + ((id * 37) % 900);
  const comments = 6 + ((id * 11) % 160);
  const views = 1200 + ((id * 977) % 48000);
  const score = Math.round(likes * 3 + comments * 2 + views * 0.01);
  const dailyRank = id <= 10 ? id : null;
  const weeklyRank = id > 10 && id <= 20 ? id - 10 : id % 13 === 0 ? Math.min(10, (id % 10) + 1) : null;
  const tags = [tagPool[index % tagPool.length], tagPool[(index + 3) % tagPool.length], tagPool[(index + 7) % tagPool.length]];

  return {
    id,
    slug: `seed-post-${String(id).padStart(3, "0")}`,
    title: `${seed} ${id}`,
    summary: summaryTemplates[index % summaryTemplates.length],
    curatorComment: commentTemplates[(index + 2) % commentTemplates.length],
    category,
    sourceName,
    sourceUrl: `https://example.com/original/${id}`,
    image: `https://placehold.co/640x280/0e7c66/ffffff.webp?text=HARU+SOSO+${String(id).padStart(3, "0")}`,
    views,
    likes,
    comments,
    score,
    dailyRank,
    weeklyRank,
    tags,
    publishedAt,
    status: "published"
  };
});

await mkdir("public/data", { recursive: true });
await writeFile("public/data/posts.json", `${JSON.stringify(posts, null, 2)}\n`, "utf8");
console.log(`Seeded ${posts.length} posts to public/data/posts.json`);
