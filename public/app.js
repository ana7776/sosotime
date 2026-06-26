const state = {
  posts: [],
  category: "all",
  rank: "latest",
  query: ""
};

const categoryLabels = {
  funny: "유머",
  empathy: "공감",
  issue: "이슈",
  life: "생활",
  info: "정보"
};

const els = {
  totalCount: document.querySelector("#totalCount"),
  featuredPost: document.querySelector("#featuredPost"),
  postList: document.querySelector("#postList"),
  dailyBest: document.querySelector("#dailyBest"),
  weeklyBest: document.querySelector("#weeklyBest"),
  dailyCount: document.querySelector("#dailyCount"),
  weeklyCount: document.querySelector("#weeklyCount"),
  categoryCount: document.querySelector("#categoryCount"),
  categoryLinks: document.querySelector("#categoryLinks"),
  searchInput: document.querySelector("#searchInput"),
  dialog: document.querySelector("#postDialog"),
  closeDialog: document.querySelector("#closeDialog"),
  dialogImage: document.querySelector("#dialogImage"),
  dialogMeta: document.querySelector("#dialogMeta"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogSummary: document.querySelector("#dialogSummary"),
  dialogComment: document.querySelector("#dialogComment"),
  dialogSource: document.querySelector("#dialogSource"),
  dialogTags: document.querySelector("#dialogTags")
};

const numberFormat = new Intl.NumberFormat("ko-KR");
const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

async function boot() {
  const response = await fetch("/data/posts.json");
  state.posts = await response.json();
  applyStateFromUrl();
  bindEvents();
  render();
  openPostFromUrl();
}

function bindEvents() {
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.filter;
      setActive(".nav-tab", button);
      updateListUrl();
      render();
    });
  });

  document.querySelectorAll(".rank-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.rank = button.dataset.rank;
      setActive(".rank-button", button);
      updateListUrl();
      render();
    });
  });

  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    render();
  });

  els.closeDialog.addEventListener("click", closePost);
  els.dialog.addEventListener("click", (event) => {
    if (event.target === els.dialog) closePost();
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

  if (category === "all" || categoryLabels[category]) {
    state.category = category;
  }

  if (["latest", "daily", "weekly"].includes(rank)) {
    state.rank = rank;
  }

  const selectedCategory = document.querySelector(`.nav-tab[data-filter="${state.category}"]`);
  const selectedRank = document.querySelector(`.rank-button[data-rank="${state.rank}"]`);
  if (selectedCategory) setActive(".nav-tab", selectedCategory);
  if (selectedRank) setActive(".rank-button", selectedRank);
}

function updateListUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("post");

  if (state.category === "all") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", state.category);
  }

  if (state.rank === "latest") {
    url.searchParams.delete("rank");
  } else {
    url.searchParams.set("rank", state.rank);
  }

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
  els.totalCount.textContent = numberFormat.format(state.posts.length);
  renderFeatured(state.posts[0]);
  els.postList.replaceChildren(...posts.map((post, index) => createPostRow(post, index)));

  const daily = state.posts.filter((post) => post.dailyRank).sort((a, b) => a.dailyRank - b.dailyRank).slice(0, 10);
  const weekly = state.posts.filter((post) => post.weeklyRank).sort((a, b) => a.weeklyRank - b.weeklyRank).slice(0, 10);
  els.dailyCount.textContent = daily.length;
  els.weeklyCount.textContent = weekly.length;
  els.dailyBest.replaceChildren(...daily.map((post) => createMiniRank(post, post.dailyRank)));
  els.weeklyBest.replaceChildren(...weekly.map((post) => createMiniRank(post, post.weeklyRank)));
  renderCategoryLinks();
}

function renderFeatured(post) {
  if (!post) return;
  els.featuredPost.innerHTML = `
    <img src="${post.image}" alt="" loading="lazy">
    <div>
      <p class="eyebrow">EDITOR'S PICK</p>
      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.summary)}</p>
      <button type="button">글 자세히 보기</button>
    </div>
  `;
  els.featuredPost.querySelector("button").addEventListener("click", () => openPost(post));
}

function createPostRow(post, index) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.className = "post-row";
  button.type = "button";
  button.addEventListener("click", () => openPost(post));
  button.innerHTML = `
    <span class="post-no">${numberFormat.format(index + 1)}</span>
    <span class="post-title">
      <img class="thumb" src="${post.image}" alt="" loading="lazy">
      <span class="title-lines">
        <strong>${escapeHtml(post.title)}</strong>
        <small>${escapeHtml(post.summary)}</small>
      </span>
    </span>
    <span class="source">${escapeHtml(categoryLabels[post.category])}</span>
    <span class="metric">${numberFormat.format(post.views)}</span>
    <span class="metric">${numberFormat.format(post.likes)}</span>
  `;
  item.append(button);
  return item;
}

function createMiniRank(post, rank) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.addEventListener("click", () => openPost(post));
  button.innerHTML = `
    <strong>${rank}. ${escapeHtml(post.title)}</strong>
    <small>${escapeHtml(categoryLabels[post.category])} · 추천 ${numberFormat.format(post.likes)}</small>
  `;
  item.append(button);
  return item;
}

function renderCategoryLinks() {
  const entries = Object.entries(categoryLabels).map(([category, label]) => {
    const count = state.posts.filter((post) => post.category === category).length;
    return { category, label, count };
  });

  els.categoryCount.textContent = entries.length;
  els.categoryLinks.replaceChildren(
    ...entries.map(({ category, label, count }) => {
      const link = document.createElement("a");
      link.href = `/?category=${category}`;
      link.className = "category-link";
      link.classList.toggle("is-active", state.category === category);
      link.innerHTML = `<strong>${escapeHtml(label)}</strong><span>${numberFormat.format(count)}개</span>`;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        state.category = category;
        const selected = document.querySelector(`.nav-tab[data-filter="${category}"]`);
        if (selected) setActive(".nav-tab", selected);
        updateListUrl();
        render();
      });
      return link;
    })
  );
}

function openPost(post) {
  const url = new URL(window.location.href);
  url.searchParams.set("post", post.slug);
  history.replaceState({}, "", url);

  els.dialogImage.src = post.image;
  els.dialogImage.alt = post.title;
  els.dialogMeta.textContent = `${categoryLabels[post.category]} · ${post.sourceName} · 조회 ${numberFormat.format(post.views)} · ${dateFormat.format(new Date(post.publishedAt))}`;
  els.dialogTitle.textContent = post.title;
  els.dialogSummary.textContent = post.summary;
  els.dialogComment.textContent = post.curatorComment;
  els.dialogSource.href = post.sourceUrl;
  els.dialogTags.textContent = post.tags.map((tag) => `#${tag}`).join(" ");
  els.dialog.showModal();
}

function closePost() {
  els.dialog.close();
  const url = new URL(window.location.href);
  url.searchParams.delete("post");
  history.replaceState({}, "", url);
}

function openPostFromUrl() {
  const slug = new URLSearchParams(window.location.search).get("post");
  const post = state.posts.find((item) => item.slug === slug);
  if (post) openPost(post);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

boot();
