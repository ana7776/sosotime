const state = {
  posts: [],
  category: "all",
  rank: "latest",
  query: ""
};

const categoryMeta = {
  funny: { label: "유머", tone: "yellow" },
  empathy: { label: "공감", tone: "pink" },
  issue: { label: "이슈", tone: "blue" },
  life: { label: "생활", tone: "orange" },
  info: { label: "정보", tone: "green" }
};

const els = {
  postList: document.querySelector("#postList"),
  dailyBest: document.querySelector("#dailyBest"),
  weeklyBest: document.querySelector("#weeklyBest"),
  dailyCount: document.querySelector("#dailyCount"),
  weeklyCount: document.querySelector("#weeklyCount"),
  topCards: document.querySelector("#topCards"),
  searchInput: document.querySelector("#searchInput")
};

const numberFormat = new Intl.NumberFormat("ko-KR");

async function boot() {
  const response = await fetch("/data/posts.json");
  state.posts = (await response.json()).filter((post) => post.status === "published");
  applyStateFromUrl();
  bindEvents();
  render();
}

function bindEvents() {
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.filter || "all";
      setActive(".nav-tab", button);
      updateListUrl();
      render();
    });
  });

  document.querySelectorAll(".rank-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.rank = button.dataset.rank || "latest";
      setActive(".rank-button", button);
      updateListUrl();
      render();
    });
  });

  els.searchInput?.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    updateListUrl();
    render();
  });
}

function setActive(selector, selected) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle("is-active", button === selected);
  });
}

function applyStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const rank = params.get("rank");
  const query = params.get("q") || "";

  if (category === "all" || categoryMeta[category]) {
    state.category = category;
  }

  if (["latest", "daily", "weekly"].includes(rank)) {
    state.rank = rank;
  }

  if (query) {
    state.query = query.trim().toLowerCase();
    if (els.searchInput) els.searchInput.value = query;
  }

  const selectedCategory = document.querySelector(`.nav-tab[data-filter="${state.category}"]`);
  const selectedRank = document.querySelector(`.rank-button[data-rank="${state.rank}"]`);
  if (selectedCategory) setActive(".nav-tab", selectedCategory);
  if (selectedRank) setActive(".rank-button", selectedRank);
}

function updateListUrl() {
  const url = new URL(window.location.href);

  if (state.category === "all") url.searchParams.delete("category");
  else url.searchParams.set("category", state.category);

  if (state.rank === "latest") url.searchParams.delete("rank");
  else url.searchParams.set("rank", state.rank);

  if (state.query) url.searchParams.set("q", state.query);
  else url.searchParams.delete("q");

  history.replaceState({}, "", url);
}

function filteredPosts() {
  let posts = [...state.posts];

  if (state.category !== "all") {
    posts = posts.filter((post) => post.category === state.category);
  }

  if (state.query) {
    posts = posts.filter((post) => {
      const haystack = `${post.title} ${post.summary} ${post.curatorComment} ${post.tags.join(" ")}`.toLowerCase();
      return haystack.includes(state.query);
    });
  }

  if (state.rank === "daily") {
    posts = posts.filter((post) => post.dailyRank).sort((a, b) => a.dailyRank - b.dailyRank);
  } else if (state.rank === "weekly") {
    posts = posts.filter((post) => post.weeklyRank).sort((a, b) => a.weeklyRank - b.weeklyRank);
  } else {
    posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }

  return posts;
}

function render() {
  const posts = filteredPosts();
  renderTopCards();
  renderPostList(posts);
  renderDailyBest();
  renderWeeklyBest();
}

function renderTopCards() {
  if (!els.topCards) return;
  const daily = state.posts.filter((post) => post.dailyRank).sort((a, b) => a.dailyRank - b.dailyRank).slice(0, 6);
  els.topCards.replaceChildren(...daily.map(createStoryCard));
}

function renderPostList(posts) {
  if (!els.postList) return;

  if (!posts.length) {
    const empty = document.createElement("li");
    empty.className = "empty-row";
    empty.textContent = "조건에 맞는 글이 없습니다.";
    els.postList.replaceChildren(empty);
    return;
  }

  els.postList.replaceChildren(...posts.map(createLatestRow));
}

function renderDailyBest() {
  const daily = state.posts.filter((post) => post.dailyRank).sort((a, b) => a.dailyRank - b.dailyRank).slice(0, 10);
  if (els.dailyCount) els.dailyCount.textContent = daily.length;
  if (els.dailyBest) els.dailyBest.replaceChildren(...daily.map((post) => createRankItem(post, post.dailyRank)));
}

function renderWeeklyBest() {
  const weekly = state.posts.filter((post) => post.weeklyRank).sort((a, b) => a.weeklyRank - b.weeklyRank).slice(0, 10);
  if (els.weeklyCount) els.weeklyCount.textContent = weekly.length;
  if (els.weeklyBest) els.weeklyBest.replaceChildren(...weekly.map((post) => createRankItem(post, post.weeklyRank)));
}

function createStoryCard(post) {
  const meta = categoryMeta[post.category];
  const item = document.createElement("article");
  item.className = "story-card humor-story-card";
  item.innerHTML = `
    <a href="${post.path}">
      <span class="category-pill ${meta.tone}">${escapeHtml(meta.label)}</span>
      <img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy">
      <strong>${escapeHtml(post.title)}</strong>
      <small>조회 ${numberFormat.format(post.views)} · 추천 ${numberFormat.format(post.likes)} · 댓글 ${numberFormat.format(post.comments)}</small>
    </a>
  `;
  return item;
}

function createLatestRow(post) {
  const meta = categoryMeta[post.category];
  const item = document.createElement("li");
  item.innerHTML = `
    <article class="latest-row">
      <span class="category-pill ${meta.tone}">${escapeHtml(meta.label)}</span>
      <div class="latest-copy">
        <strong><a href="${post.path}">${escapeHtml(post.title)}</a></strong>
        <small>${escapeHtml(post.sourceName)} · 조회 ${numberFormat.format(post.views)} · 추천 ${numberFormat.format(post.likes)}</small>
      </div>
      <a href="${post.path}" aria-label="${escapeHtml(post.title)} 게시글 보기">
        <img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" loading="lazy">
      </a>
    </article>
  `;
  return item;
}

function createRankItem(post, rank) {
  const item = document.createElement("li");
  item.innerHTML = `
    <a href="${post.path}">
      <span class="best-rank">${rank}</span>
      <strong>${escapeHtml(post.title)}</strong>
      <em>${numberFormat.format(post.score)}</em>
    </a>
  `;
  return item;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

boot();
