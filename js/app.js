const COVER_SRC = "assets/cover.jpeg";

function createEpisodeThumb() {
  const thumb = document.createElement("img");
  thumb.className = "episode__thumb";
  thumb.src = COVER_SRC;
  thumb.alt = "";
  thumb.width = 64;
  thumb.height = 64;
  thumb.loading = "lazy";
  return thumb;
}

function createIconButton(className, svg) {
  const btn = document.createElement("span");
  btn.className = className;
  btn.innerHTML = svg;
  return btn;
}

const ICONS = {
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 16V4m0 0 4-4m-4 4 4 4"/></svg>`,
  more: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`,
};

function renderEpisodes() {
  const list = document.getElementById("episode-list");
  if (!list || typeof EPISODES === "undefined") return;

  EPISODES.forEach((episode) => {
    const item = document.createElement("li");
    item.className = "episode";

    const top = document.createElement("div");
    top.className = "episode__top";

    const content = document.createElement("div");
    content.className = "episode__content";

    const title = document.createElement("h3");
    title.className = "episode__title";
    title.textContent = episode.title;

    const description = document.createElement("p");
    description.className = "episode__description";
    description.textContent = episode.description;

    const meta = document.createElement("p");
    meta.className = "episode__meta";
    meta.textContent = `Ep. ${episode.id} • ~45 min`;

    content.append(title, description, meta);
    top.append(createEpisodeThumb(), content);

    const actions = document.createElement("div");
    actions.className = "episode__actions no-interaction";

    const icons = document.createElement("div");
    icons.className = "episode__action-icons";
    icons.append(
      createIconButton("episode__action-icon", ICONS.plus),
      createIconButton("episode__action-icon", ICONS.download),
      createIconButton("episode__action-icon", ICONS.share),
      createIconButton("episode__action-icon", ICONS.more)
    );

    const play = createIconButton("episode__play", ICONS.play);
    actions.append(icons, play);

    item.append(top, actions);
    list.appendChild(item);
  });
}

function renderInfoPanel() {
  const panel = document.getElementById("info-text");
  if (!panel || typeof PODCAST_INFO === "undefined") return;
  panel.textContent = PODCAST_INFO;
}

function initTabs() {
  const tabs = document.querySelectorAll(".tab-bar__tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      if (!target) return;

      tabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });

      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === `panel-${target}`);
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderEpisodes();
  renderInfoPanel();
  initTabs();
});
