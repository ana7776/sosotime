import { mkdir, writeFile } from "node:fs/promises";

const posts = [
  {
    title: "퇴근길 지하철에서 모두가 조용해진 순간",
    summary: "붐비는 지하철 안에서 작은 배려 하나가 분위기를 바꾼 사례를 정리했습니다. 단순한 미담보다 사람들이 왜 그 장면에 오래 반응했는지에 초점을 맞췄습니다.",
    curatorComment: "커뮤니티에서 오래 남는 글은 사건의 크기보다 공감 가능한 맥락이 선명할 때가 많습니다.",
    category: "empathy",
    sourceName: "커뮤니티 반응",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["퇴근길", "배려", "공감"]
  },
  {
    title: "편의점 계산대에서 생긴 오해가 웃음으로 끝난 이유",
    summary: "짧은 대화가 엇갈리며 생긴 해프닝을 상황별로 풀었습니다. 누구나 한 번쯤 겪을 법한 말실수라 부담 없이 읽히는 생활형 이야기입니다.",
    curatorComment: "가벼운 웃음도 맥락을 정리하면 훨씬 읽기 좋은 콘텐츠가 됩니다.",
    category: "funny",
    sourceName: "생활 유머",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["편의점", "말실수", "생활유머"]
  },
  {
    title: "커뮤니티에서 질문글이 답변을 잘 받는 방식",
    summary: "제목, 상황 설명, 시도한 방법을 분리해 쓰면 답변률이 올라갑니다. 실제 게시판 목록에서 자주 보이는 질문 유형을 바탕으로 정리했습니다.",
    curatorComment: "정보성 글은 독자가 바로 적용할 수 있는 구조를 갖출수록 가치가 커집니다.",
    category: "info",
    sourceName: "게시판 관찰",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["질문글", "커뮤니티", "글쓰기"]
  },
  {
    title: "사진 한 장이 설명보다 빠르게 퍼지는 이유",
    summary: "이미지 게시물이 텍스트보다 빠르게 공유되는 이유를 시선 흐름, 제목의 역할, 댓글 반응으로 나눠 살펴봤습니다.",
    curatorComment: "이미지 중심 글도 설명과 맥락을 붙이면 단순 재게시보다 독립적인 읽을거리가 됩니다.",
    category: "issue",
    sourceName: "콘텐츠 메모",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["이미지", "공유", "반응"]
  },
  {
    title: "마트 계산 줄에서 사람들이 예민해지는 지점",
    summary: "계산 순서, 장바구니 양, 직원 응대처럼 사소해 보이지만 갈등으로 번지기 쉬운 포인트를 생활 관찰 방식으로 정리했습니다.",
    curatorComment: "생활형 이슈는 누가 맞는지보다 왜 불편함이 커졌는지를 보면 읽을 만해집니다.",
    category: "life",
    sourceName: "생활 관찰",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["마트", "생활", "갈등"]
  },
  {
    title: "댓글이 글의 분위기를 바꾸는 세 가지 패턴",
    summary: "처음엔 평범했던 글이 댓글의 해석, 농담, 추가 정보로 달라지는 과정을 정리했습니다. 커뮤니티 글을 읽을 때 놓치기 쉬운 재미입니다.",
    curatorComment: "게시글만큼 댓글 흐름도 콘텐츠의 일부입니다. 다만 인신공격보다 해석의 다양성을 중심으로 보는 편이 좋습니다.",
    category: "issue",
    sourceName: "댓글 흐름",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["댓글", "해석", "분위기"]
  },
  {
    title: "직장 단톡방에서 답장을 늦게 하는 사람들의 속사정",
    summary: "읽씹처럼 보이지만 실제로는 업무 우선순위, 알림 피로, 답변 부담이 섞인 경우가 많습니다. 공감형 소재로 풀어봤습니다.",
    curatorComment: "공감글은 상대를 단정하지 않는 문장이 들어갈 때 더 오래 읽힙니다.",
    category: "empathy",
    sourceName: "직장 생활",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["직장", "단톡방", "공감"]
  },
  {
    title: "중고거래 약속 장소를 정할 때 생기는 미묘한 신경전",
    summary: "역 출구, 카페 앞, 편의점 앞처럼 장소 선택 하나에도 안전과 편의가 엇갈립니다. 거래 전 확인하면 좋은 기준을 함께 정리했습니다.",
    curatorComment: "생활 팁과 에피소드가 섞이면 광고 승인에 유리한 실용형 콘텐츠가 됩니다.",
    category: "info",
    sourceName: "생활 팁",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["중고거래", "약속", "안전"]
  },
  {
    title: "밈 제목이 길어질수록 클릭을 부르는 이유",
    summary: "긴 제목은 상황을 먼저 보여주고, 짧은 제목은 궁금증을 남깁니다. 커뮤니티 목록에서 자주 보이는 제목 스타일을 비교했습니다.",
    curatorComment: "제목 분석은 원문을 복제하지 않아도 충분히 독립적인 콘텐츠가 됩니다.",
    category: "funny",
    sourceName: "제목 분석",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["밈", "제목", "클릭"]
  },
  {
    title: "새벽 게시판에 잡담이 몰리는 이유",
    summary: "낮에는 정보성 글이 빠르게 소비되고, 새벽에는 가벼운 잡담과 감정 공유가 늘어납니다. 시간대별 커뮤니티 분위기를 정리했습니다.",
    curatorComment: "게시판은 시간대에 따라 전혀 다른 공간처럼 보입니다.",
    category: "life",
    sourceName: "게시판 관찰",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["새벽", "잡담", "커뮤니티"]
  },
  {
    title: "사소한 인증글이 오래 회자되는 조건",
    summary: "영수증, 사진, 짧은 후기처럼 작은 인증도 구체성이 있으면 신뢰를 얻습니다. 반대로 정보가 부족하면 의심 댓글이 먼저 붙습니다.",
    curatorComment: "애드센스 승인용 콘텐츠는 출처와 맥락을 분명히 하는 습관이 중요합니다.",
    category: "info",
    sourceName: "콘텐츠 기준",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["인증", "후기", "신뢰"]
  },
  {
    title: "버스에서 이어폰 소리가 새어 나올 때의 현실적인 대처",
    summary: "직접 말하기 어려운 상황에서 사람들이 어떤 반응을 보이는지 정리했습니다. 불편함과 배려 사이의 균형을 다룬 글입니다.",
    curatorComment: "일상 불편 글은 공격적인 결론보다 대처 선택지를 주는 편이 읽기 좋습니다.",
    category: "life",
    sourceName: "일상 이슈",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["버스", "이어폰", "배려"]
  },
  {
    title: "게시판 베스트 글이 되는 글의 공통점",
    summary: "짧은 도입, 선명한 반전, 댓글을 부르는 여백이 베스트 글에서 반복됩니다. 자극보다 구조를 중심으로 정리했습니다.",
    curatorComment: "베스트 목록을 참고하되 표현과 해설을 새로 만들면 사이트 고유성이 살아납니다.",
    category: "issue",
    sourceName: "베스트 관찰",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["베스트", "구조", "반응"]
  },
  {
    title: "식당 후기에서 사람들이 가장 먼저 보는 정보",
    summary: "맛 표현보다 가격, 대기 시간, 재방문 의사가 먼저 눈에 들어옵니다. 후기 글을 읽기 좋게 정리하는 순서를 제안합니다.",
    curatorComment: "후기형 콘텐츠는 광고 친화성이 높지만 과장 표현은 줄이는 편이 안정적입니다.",
    category: "info",
    sourceName: "후기 정리",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["식당", "후기", "정보"]
  },
  {
    title: "반려동물 사진 글이 과하게 설명하지 않아도 통하는 이유",
    summary: "표정, 자세, 상황만으로도 이야기가 만들어집니다. 다만 독립 콘텐츠로 만들려면 촬영 상황과 관찰 포인트를 덧붙이는 것이 좋습니다.",
    curatorComment: "이미지 콘텐츠를 다룰 때는 사진의 맥락 설명이 사이트 품질을 좌우합니다.",
    category: "empathy",
    sourceName: "사진 반응",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["사진", "반려동물", "공감"]
  },
  {
    title: "커뮤니티 농담이 오해를 부르는 순간",
    summary: "내부 밈이나 줄임말은 익숙한 사람에게는 웃기지만 처음 온 독자에게는 불친절할 수 있습니다. 설명의 균형을 잡는 방법을 정리했습니다.",
    curatorComment: "신규 방문자도 이해할 수 있어야 사이트 체류 시간이 좋아집니다.",
    category: "funny",
    sourceName: "밈 해설",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["농담", "밈", "오해"]
  },
  {
    title: "온라인에서 사과문이 잘 받아들여지지 않는 이유",
    summary: "사과의 형식보다 책임 범위와 재발 방지 내용이 더 중요합니다. 커뮤니티 반응에서 자주 반복되는 기준을 정리했습니다.",
    curatorComment: "민감한 이슈는 단정 대신 기준 정리형으로 다루는 편이 안전합니다.",
    category: "issue",
    sourceName: "반응 분석",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["사과문", "이슈", "기준"]
  },
  {
    title: "출근 준비 시간이 매번 부족해지는 사람들의 공통 습관",
    summary: "준비물 위치, 알람 간격, 전날 정리 여부가 아침 시간을 크게 좌우합니다. 가벼운 공감에서 시작해 실용 팁까지 붙였습니다.",
    curatorComment: "공감과 해결책을 함께 넣으면 얇은 잡담보다 완성도가 높아집니다.",
    category: "life",
    sourceName: "생활 루틴",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["출근", "루틴", "시간관리"]
  },
  {
    title: "커뮤니티에서 링크만 던진 글보다 요약글이 강한 이유",
    summary: "요약은 독자의 시간을 아끼고, 원문 링크는 확인 가능성을 줍니다. 두 요소가 같이 있을 때 글의 신뢰도가 올라갑니다.",
    curatorComment: "우리 사이트의 기본 방향도 복붙보다 요약과 해설입니다.",
    category: "info",
    sourceName: "운영 원칙",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["요약", "출처", "신뢰"]
  },
  {
    title: "가벼운 잡담글이 의외로 댓글을 많이 받는 이유",
    summary: "정답이 필요한 질문보다 각자 경험을 얹기 쉬운 주제가 댓글을 부릅니다. 참여 장벽이 낮은 글의 특징을 정리했습니다.",
    curatorComment: "댓글을 부르는 글은 독자에게 말할 자리를 남겨둡니다.",
    category: "empathy",
    sourceName: "댓글 관찰",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["잡담", "댓글", "참여"]
  },
  {
    title: "유머 게시판에서 정보 글이 살아남는 방식",
    summary: "딱딱한 정보도 짧은 사례, 표정이 보이는 제목, 핵심 요약이 있으면 읽힙니다. 정보와 재미의 균형을 정리했습니다.",
    curatorComment: "광고 승인에는 재미만큼 정보의 밀도도 중요합니다.",
    category: "info",
    sourceName: "게시판 분석",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["정보글", "유머", "요약"]
  },
  {
    title: "택배 도착 알림 하나로 하루 기분이 바뀌는 이유",
    summary: "기다림이 길수록 작은 알림도 보상처럼 느껴집니다. 소비 후기와 일상 공감 사이에서 읽기 좋게 정리한 글입니다.",
    curatorComment: "소비 경험은 과장 없이 감정과 정보를 나눠 쓰는 편이 좋습니다.",
    category: "empathy",
    sourceName: "생활 공감",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["택배", "기다림", "소비"]
  },
  {
    title: "커뮤니티 글 목록에서 카테고리가 중요한 이유",
    summary: "잡담, 유머, 정보가 섞이면 빠르게 훑기 어렵습니다. 카테고리와 랭킹 탭을 함께 두면 독자의 탐색 부담이 줄어듭니다.",
    curatorComment: "이번 레이아웃 변경도 이런 목록 탐색성을 높이는 방향입니다.",
    category: "info",
    sourceName: "레이아웃 메모",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["카테고리", "레이아웃", "탐색"]
  },
  {
    title: "가벼운 말장난이 오래 기억되는 조건",
    summary: "말장난 자체보다 상황과 타이밍이 맞을 때 반응이 커집니다. 억지 농담과 자연스러운 유머의 차이를 짚었습니다.",
    curatorComment: "유머 콘텐츠도 해설을 붙이면 단순 모음집보다 품질이 올라갑니다.",
    category: "funny",
    sourceName: "유머 해설",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["말장난", "타이밍", "웃음"]
  },
  {
    title: "분쟁성 글을 다룰 때 확인해야 할 최소 기준",
    summary: "당사자 주장, 시간 순서, 공개된 근거가 분리되어야 합니다. 확정되지 않은 내용은 추측으로 쓰지 않는 원칙을 정리했습니다.",
    curatorComment: "애드센스 승인과 장기 운영 모두에 필요한 안전장치입니다.",
    category: "issue",
    sourceName: "운영 기준",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["분쟁", "검증", "운영"]
  },
  {
    title: "주말 커뮤니티에서 음식 사진이 강한 이유",
    summary: "주말에는 정보보다 감각적인 후기와 가벼운 대화가 잘 읽힙니다. 음식 사진 글을 독립 콘텐츠로 정리하는 방법도 덧붙였습니다.",
    curatorComment: "사진만 두기보다 가격, 위치 맥락, 재방문 의사를 함께 쓰면 좋습니다.",
    category: "life",
    sourceName: "주말 반응",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["주말", "음식", "후기"]
  },
  {
    title: "검색으로 들어온 독자가 바로 나가지 않게 하는 글 구성",
    summary: "첫 문단에 결론을 두고, 중간에 사례를 배치하고, 마지막에 관련 글로 이어지게 만들면 체류 시간이 좋아집니다.",
    curatorComment: "커뮤니티형 사이트도 검색 독자를 고려한 구조가 필요합니다.",
    category: "info",
    sourceName: "SEO 메모",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["검색", "SEO", "구성"]
  },
  {
    title: "단골 가게가 생겼을 때 사람들이 남기는 작은 신호",
    summary: "메뉴 이름을 줄여 부르거나, 직원의 추천을 기억하거나, 방문 시간대를 맞추는 식으로 관계가 쌓입니다. 일상 공감형 글로 정리했습니다.",
    curatorComment: "따뜻한 생활 소재는 사이트 톤을 안정적으로 만들어줍니다.",
    category: "empathy",
    sourceName: "생활 관찰",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["단골", "가게", "일상"]
  },
  {
    title: "게시글 제목에 물음표가 많아질 때 생기는 효과",
    summary: "질문형 제목은 클릭을 만들지만 과하면 낚시처럼 보일 수 있습니다. 목록형 커뮤니티에서 신뢰를 지키는 제목 방식을 정리했습니다.",
    curatorComment: "호기심과 신뢰 사이의 균형이 중요합니다.",
    category: "issue",
    sourceName: "제목 분석",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["제목", "신뢰", "목록"]
  },
  {
    title: "오늘의 커뮤니티 글을 고를 때 제외하는 기준",
    summary: "개인 신상 노출, 확인되지 않은 비방, 맥락 없는 이미지 재업로드는 제외하는 편이 좋습니다. 오래 운영할 수 있는 큐레이션 기준입니다.",
    curatorComment: "좋은 큐레이션은 무엇을 싣지 않을지 정하는 일에서 시작합니다.",
    category: "info",
    sourceName: "운영 원칙",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    tags: ["큐레이션", "정책", "안전"]
  }
];

const categories = ["funny", "empathy", "issue", "life", "info"];
const baseDate = new Date(Date.UTC(2026, 5, 25, 0, 30, 0));

const seeded = posts.map((post, index) => {
  const id = index + 1;
  const likes = 42 + ((id * 29) % 420);
  const comments = 4 + ((id * 7) % 96);
  const views = 820 + ((id * 739) % 18000);
  const score = Math.round(likes * 4 + comments * 3 + views * 0.03);

  return {
    id,
    slug: `community-note-${String(id).padStart(3, "0")}`,
    title: post.title,
    summary: post.summary,
    curatorComment: post.curatorComment,
    category: post.category || categories[index % categories.length],
    sourceName: post.sourceName,
    sourceUrl: post.sourceUrl,
    image: `https://placehold.co/800x450/1f6f5b/ffffff.webp?text=SOSOTIME+${String(id).padStart(2, "0")}`,
    views,
    likes,
    comments,
    score,
    dailyRank: id <= 8 ? id : null,
    weeklyRank: id > 8 && id <= 18 ? id - 8 : null,
    tags: post.tags,
    publishedAt: new Date(baseDate.getTime() - index * 53 * 60 * 1000).toISOString(),
    status: "published"
  };
});

await mkdir("public/data", { recursive: true });
await writeFile("public/data/posts.json", `${JSON.stringify(seeded, null, 2)}\n`, "utf8");
console.log(`Seeded ${seeded.length} editorial posts to public/data/posts.json`);
