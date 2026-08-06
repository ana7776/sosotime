const state = {
  posts: [],
  category: "all",
  rank: "latest",
  query: "",
};

const categoryMeta = {
  funny: { label: "유머", tone: "warning" },
  empathy: { label: "웃썰", tone: "danger" },
  issue: { label: "사건", tone: "primary" },
  life: { label: "자유", tone: "success" },
  info: { label: "정보", tone: "info" },
};

const els = {
  postList: document.querySelector("#postList"),
  dailyBest: document.querySelector("#dailyBest"),
  weeklyBest: document.querySelector("#weeklyBest"),
  searchInput: document.querySelector("#searchInput"),
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
    button.addEventListener("click", (event) => {
      const category = button.dataset.filter;
      if (!category) return;
      event.preventDefault();
      state.category = category;
      setNavActive(button);
      updateListUrl();
      render();
    });
  });

  document.querySelectorAll(".rank-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
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

function setNavActive(selected) {
  document.querySelectorAll(".board-nav li").forEach((item) => item.classList.remove("active"));
  selected.closest("li")?.classList.add("active");
}

function setActive(selector, selected) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle("is-active", button === selected);
    button.classList.toggle("active", button === selected);
  });
}

function applyStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const rank = params.get("rank");
  const query = params.get("q") || "";

  if (category === "all" || categoryMeta[category]) state.category = category;
  if (["latest", "daily", "weekly"].includes(rank)) state.rank = rank;

  if (query) {
    state.query = query.trim().toLowerCase();
    if (els.searchInput) els.searchInput.value = query;
  }

  const selectedCategory = document.querySelector(`.nav-tab[data-filter="${state.category}"]`);
  const selectedRank = document.querySelector(`.rank-button[data-rank="${state.rank}"]`);
  if (selectedCategory) setNavActive(selectedCategory);
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

  if (state.category !== "all") posts = posts.filter((post) => post.category === state.category);

  if (state.query) {
    posts = posts.filter((post) => {
      const haystack = `${post.title} ${post.summary} ${post.curatorComment} ${(post.tags || []).join(" ")}`.toLowerCase();
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
  renderPostList(posts);
  renderDailyBest();
  renderWeeklyBest();
}

function renderPostList(posts) {
  if (!els.postList) return;

  if (!posts.length) {
    els.postList.innerHTML = `<tr><td class="empty-row" colspan="5">조건에 맞는 글이 없습니다.</td></tr>`;
    return;
  }

  els.postList.replaceChildren(...posts.map((post, index) => createBoardRow(post, posts.length - index)));
}

function renderDailyBest() {
  const daily = state.posts.filter((post) => post.dailyRank).sort((a, b) => a.dailyRank - b.dailyRank).slice(0, 10);
  if (els.dailyBest) els.dailyBest.replaceChildren(...daily.map((post) => createRankItem(post, post.dailyRank)));
}

function renderWeeklyBest() {
  const weekly = state.posts.filter((post) => post.weeklyRank).sort((a, b) => a.weeklyRank - b.weeklyRank).slice(0, 10);
  if (els.weeklyBest) els.weeklyBest.replaceChildren(...weekly.map((post) => createRankItem(post, post.weeklyRank)));
}

function createBoardRow(post, number) {
  const meta = categoryMeta[post.category] || categoryMeta.funny;
  const row = document.createElement("tr");
  row.dataset.category = post.category;
  row.innerHTML = `
    <td class="text-center board-number">${number}</td>
    <td class="board-title-cell">
      <a href="${post.path}"><span class="label label-${meta.tone}">${escapeHtml(meta.label)}</span> ${escapeHtml(post.title)}</a>
      <span class="comment-count">[${numberFormat.format(post.comments || 0)}]</span>
      <p>${escapeHtml(post.summary)}</p>
    </td>
    <td class="text-center board-author">${escapeHtml(post.sourceName)}</td>
    <td class="text-center">${formatDate(post.publishedAt)}</td>
    <td class="text-center">${numberFormat.format(post.views || 0)}</td>
  `;
  return row;
}

function createRankItem(post, rank) {
  const item = document.createElement("li");
  item.className = "list-group-item";
  item.innerHTML = `
    <a href="${post.path}">
      <span class="rank-badge">${rank}</span>
      <strong>${escapeHtml(post.title)}</strong>
      <em>${numberFormat.format(post.score || 0)}</em>
    </a>
  `;
  return item;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit" }).format(new Date(value)).replace(/\.$/, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

boot();
