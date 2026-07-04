import { readFile, writeFile } from "node:fs/promises";

const file = "public/data/posts.json";
const posts = JSON.parse(await readFile(file, "utf8")).filter((post) => post.id < 23);

const todayPosts = [
  {
    id: 23,
    slug: "cafe-order-mistake",
    title: "카페에서 들린 주문 실수에 모두가 웃은 이유",
    category: "funny",
    sourceName: "생활 유머 관찰",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    views: 7420,
    likes: 238,
    comments: 41,
    tags: ["카페", "주문실수", "생활유머"],
    publishedAt: "2026-07-04T07:40:00.000Z",
    updatedAt: "2026-07-04T07:40:00.000Z",
    description: "카페 주문 과정에서 생긴 작은 말실수가 왜 유머 글로 읽히는지 상황과 반응 중심으로 정리했습니다.",
    summary: "카페처럼 낯선 사람과 짧게 대화하는 공간에서는 작은 말실수 하나도 주변 분위기를 바꿀 수 있습니다. 중요한 건 누군가를 놀리는 장면이 아니라, 모두가 한 번쯤 겪어본 어색함과 웃음의 타이밍입니다.",
    curatorComment: "생활 유머는 실수한 사람을 조롱하지 않고 상황의 엇갈림만 보일 때 가장 편하게 읽힙니다.",
    body: makeBody({
      scene: "카페 주문대 앞에서는 짧은 시간 안에 메뉴, 옵션, 결제까지 한꺼번에 말해야 합니다. 이 과정에서 단어가 섞이거나 엉뚱한 표현이 튀어나오면 주변 사람들도 순간적으로 같은 장면을 이해하게 됩니다.",
      point: "웃음은 실수의 크기가 아니라 타이밍에서 나옵니다. 조용한 매장, 익숙한 주문 문장, 갑자기 나온 엉뚱한 단어가 겹치면 짧은 문장만으로도 상황이 그려집니다.",
      check: "캡처나 후기를 볼 때는 누군가를 비난하는 방향으로 쓰였는지, 아니면 상황의 어색함을 함께 웃는 방식인지 구분하면 좋습니다.",
      summary: "카페 주문대에서 생긴 작은 말실수를 소재로 한 생활 유머입니다. 실수보다 중요한 것은 그 장면을 둘러싼 짧은 침묵과 웃음의 타이밍입니다."
    })
  },
  {
    id: 24,
    slug: "cat-box-takeover",
    title: "고양이가 박스 하나로 하루를 장악한 순간",
    category: "empathy",
    sourceName: "커뮤니티 공감 반응",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    views: 6810,
    likes: 221,
    comments: 58,
    tags: ["고양이", "반려동물", "공감"],
    publishedAt: "2026-07-04T07:10:00.000Z",
    updatedAt: "2026-07-04T07:10:00.000Z",
    description: "반려동물이 작은 박스 하나에 집착하는 장면이 왜 오래 공유되는지 공감 포인트 중심으로 정리했습니다.",
    summary: "반려동물 사진은 설명이 길지 않아도 상황이 바로 전달됩니다. 특히 고양이가 새 장난감보다 빈 박스를 더 좋아하는 장면은 많은 사람이 알고 있는 반려동물의 엉뚱함을 정확히 건드립니다.",
    curatorComment: "반려동물 글은 과한 해석보다 보이는 행동과 짧은 반응을 살릴 때 더 오래 읽힙니다.",
    body: makeBody({
      scene: "택배 상자가 도착하면 내용물보다 박스에 먼저 관심을 보이는 반려동물이 많습니다. 사진 한 장만으로도 집안의 분위기와 보호자의 당황스러움이 함께 전해집니다.",
      point: "이런 글의 재미는 예상과 다른 선택에서 나옵니다. 사람이 준비한 물건보다 엉뚱한 공간을 더 좋아하는 모습이 귀엽고도 익숙하게 느껴집니다.",
      check: "반려동물 사진을 공유할 때는 주소 라벨, 집 내부 위치, 보호자 정보가 함께 보이지 않는지 확인하는 편이 안전합니다.",
      summary: "고양이가 박스 하나로 집안 분위기를 바꾼 공감형 반려동물 이야기입니다. 짧은 사진형 글일수록 설명보다 장면과 반응을 나누어 보는 편이 읽기 좋습니다."
    })
  },
  {
    id: 25,
    slug: "subway-door-timing",
    title: "지하철 문 앞에서 모두가 눈치 본 작은 상황",
    category: "life",
    sourceName: "생활 게시판 메모",
    sourceUrl: "https://www.ppomppu.co.kr/zboard/zboard.php?id=humor",
    views: 6230,
    likes: 196,
    comments: 47,
    tags: ["지하철", "눈치", "생활"],
    publishedAt: "2026-07-04T06:35:00.000Z",
    updatedAt: "2026-07-04T06:35:00.000Z",
    description: "지하철 문 앞에서 생긴 작은 눈치 싸움이 왜 공감 글로 읽히는지 생활 맥락 중심으로 정리했습니다.",
    summary: "지하철 문 앞은 짧은 시간에 많은 사람이 움직이는 공간입니다. 내릴 사람, 탈 사람, 비켜서야 하는 사람이 한순간 겹치면 누구도 크게 말하지 않았는데도 묘한 눈치가 생깁니다.",
    curatorComment: "생활 글은 정답을 정하기보다 모두가 겪는 불편한 타이밍을 보여줄 때 공감이 커집니다.",
    body: makeBody({
      scene: "출퇴근 시간 지하철 문 앞에서는 작은 위치 차이도 큰 불편으로 이어집니다. 누가 먼저 움직여야 하는지 애매한 순간이 생기면 주변의 시선과 몸짓이 동시에 바뀝니다.",
      point: "말로 설명하기 어려운 눈치가 글의 핵심입니다. 모두가 바쁘고 피곤한 상황에서 작은 배려가 있으면 분위기가 풀리고, 반대로 애매한 정지가 길어지면 불편함이 커집니다.",
      check: "이런 글은 특정 사람을 비난하기보다 공간 구조와 타이밍을 중심으로 읽는 편이 좋습니다.",
      summary: "지하철 문 앞의 작은 눈치 싸움은 많은 사람이 겪는 생활형 공감 소재입니다. 장면의 흐름과 확인할 점을 중심으로 읽으면 부담이 적습니다."
    })
  },
  {
    id: 26,
    slug: "group-chat-emoticon",
    title: "단체방에서 이모티콘 하나가 분위기를 바꾼 이유",
    category: "issue",
    sourceName: "게시판 이슈 관찰",
    sourceUrl: "https://m.fmkorea.com/index.php?mid=humor&order_type=desc&sort_index=pop",
    views: 5960,
    likes: 183,
    comments: 52,
    tags: ["단체방", "이모티콘", "반응"],
    publishedAt: "2026-07-04T06:05:00.000Z",
    updatedAt: "2026-07-04T06:05:00.000Z",
    description: "단체 채팅방에서 이모티콘 하나가 분위기를 바꾸는 과정을 커뮤니티 반응 중심으로 정리했습니다.",
    summary: "단체방에서는 짧은 이모티콘 하나도 맥락에 따라 농담, 동의, 무안함, 분위기 전환으로 다르게 읽힙니다. 같은 그림이어도 앞뒤 대화와 보낸 타이밍에 따라 반응이 갈릴 수 있습니다.",
    curatorComment: "온라인 대화 글은 캡처 일부만 보고 단정하기보다 앞뒤 맥락과 참여자 반응을 함께 보는 편이 좋습니다.",
    body: makeBody({
      scene: "단체방은 여러 사람이 동시에 같은 문장을 보고 각자 다른 방식으로 받아들이는 공간입니다. 그래서 짧은 이모티콘 하나도 대화의 흐름을 바꾸는 신호가 될 수 있습니다.",
      point: "핵심은 이모티콘 자체가 아니라 타이밍입니다. 진지한 대화 중이었는지, 이미 농담이 오가던 상황이었는지에 따라 같은 반응도 다르게 보입니다.",
      check: "캡처형 글은 앞뒤 대화가 생략된 경우가 많습니다. 일부 장면만 보고 사람의 의도를 단정하면 오해가 커질 수 있습니다.",
      summary: "온라인 단체방에서 작은 표현 하나가 분위기를 바꾸는 과정을 다룹니다. 표현보다 맥락과 반응 흐름을 함께 보는 것이 중요합니다."
    })
  },
  {
    id: 27,
    slug: "convenience-store-new-review",
    title: "편의점 신상품 후기에서 사람들이 먼저 보는 것",
    category: "info",
    sourceName: "정보 글 큐레이션",
    sourceUrl: "https://bbs.ruliweb.com/community/board/300143",
    views: 5480,
    likes: 169,
    comments: 34,
    tags: ["편의점", "신상품", "후기"],
    publishedAt: "2026-07-04T05:30:00.000Z",
    updatedAt: "2026-07-04T05:30:00.000Z",
    description: "편의점 신상품 후기에서 독자가 먼저 확인하는 정보와 읽기 좋은 후기 구조를 정리했습니다.",
    summary: "편의점 신상품 후기는 사진만큼이나 가격, 용량, 맛의 기준, 재구매 의사가 중요합니다. 독자는 “맛있다”는 감상보다 자신이 살지 말지 판단할 수 있는 정보를 먼저 찾습니다.",
    curatorComment: "후기 글은 감상과 확인 가능한 정보를 나누어 쓸 때 검색과 공유 모두에 강해집니다.",
    body: makeBody({
      scene: "편의점 신상품 글에서 독자가 가장 먼저 보는 것은 가격과 구성입니다. 사진이 좋아도 용량, 맛의 방향, 기존 제품과의 차이가 보이지 않으면 판단하기 어렵습니다.",
      point: "좋은 후기는 감상을 먼저 길게 쓰기보다 핵심 정보를 앞에 둡니다. 가격, 맛, 양, 재구매 의사만 보여도 독자는 글의 방향을 빠르게 파악합니다.",
      check: "후기 사진은 조명과 촬영 각도에 따라 실제 양이나 색감이 다르게 보일 수 있습니다. 가능하면 영수증, 포장 표기, 중량 같은 확인 가능한 정보와 함께 보는 것이 좋습니다.",
      summary: "편의점 신상품 후기는 사진보다 판단 가능한 정보가 먼저 보일 때 읽기 좋습니다. 후기의 핵심 정보와 확인할 지점을 나누어 정리합니다."
    })
  }
];

for (const post of posts) post.dailyRank = null;
for (const [index, id] of [21, 22, 1, 2, 3].entries()) {
  const post = posts.find((item) => item.id === id);
  if (post) post.dailyRank = todayPosts.length + index + 1;
}

for (const [index, post] of todayPosts.entries()) {
  post.path = `/posts/${post.slug}/`;
  post.image = `/assets/posts/post-${String(post.id).padStart(2, "0")}.webp`;
  post.score = Math.round(post.likes * 4 + post.comments * 3 + post.views * 0.03);
  post.dailyRank = index + 1;
  post.weeklyRank = null;
  post.status = "published";
  posts.push(post);
}

posts.sort((a, b) => a.id - b.id);
await writeFile(file, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
console.log(`Added today's posts. Total: ${posts.length}`);

function makeBody({ scene, point, check, summary }) {
  return [
    {
      heading: "어떤 장면인가요",
      paragraphs: [
        scene,
        "이런 글은 큰 사건보다 짧은 타이밍과 익숙한 분위기에서 반응이 나옵니다. 독자는 자신이 겪은 비슷한 순간을 떠올리며 가볍게 읽게 됩니다."
      ]
    },
    {
      heading: "사람들이 반응한 지점",
      paragraphs: [
        point,
        "댓글에서는 비슷한 경험담과 짧은 농담이 붙기 쉽습니다. 그래서 원글 하나보다 반응의 흐름까지 함께 볼 때 글의 재미가 더 잘 보입니다."
      ]
    },
    {
      heading: "읽을 때 확인할 점",
      paragraphs: [
        check,
        "특정 개인을 알아볼 수 있는 정보나 맥락이 빠진 캡처는 오해를 만들 수 있습니다. 가벼운 글일수록 상황과 확인 가능한 정보만 중심에 두는 편이 안전합니다."
      ]
    },
    {
      heading: "요약",
      paragraphs: [
        summary,
        "소소타임은 원문을 그대로 옮기지 않고, 핵심 상황과 독자가 확인하면 좋은 지점을 자체 문장으로 정리합니다."
      ]
    }
  ];
}
