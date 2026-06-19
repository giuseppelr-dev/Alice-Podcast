const COVER_SRC = "assets/coverV2.jpeg";

const ICONS = {
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M9.5 10.5 12 13l2.5-2.5"/><path d="M8.5 16h7"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>`,
  more: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.75"/><circle cx="12" cy="12" r="1.75"/><circle cx="19" cy="12" r="1.75"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72c0 .79.86 1.26 1.5.84l9.02-6.86a1 1 0 0 0 0-1.68L9.5 4.3A1 1 0 0 0 8 5.14z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7V5zm7 0h3v14h-3V5z"/></svg>`,
};

const player = {
  audio: null,
  currentEpisodeId: null,
  els: {},

  init() {
    this.audio = document.getElementById("audio-player");
    this.els = {
      miniPlayer: document.getElementById("mini-player"),
      title: document.getElementById("player-title"),
      artist: document.getElementById("player-artist"),
      cover: document.getElementById("player-cover"),
      playBtn: document.getElementById("player-play-btn"),
      progress: document.getElementById("player-progress"),
      progressFill: document.getElementById("player-progress-fill"),
    };

    if (!this.audio) return;

    this.els.playBtn.addEventListener("click", () => this.togglePlay());
    this.els.progress.addEventListener("click", (event) => this.seek(event));
    this.audio.addEventListener("timeupdate", () => this.updateProgress());
    this.audio.addEventListener("loadedmetadata", () => this.updateEpisodeDuration());
    this.audio.addEventListener("play", () => this.syncUi());
    this.audio.addEventListener("pause", () => this.syncUi());
    this.audio.addEventListener("ended", () => this.onEnded());
  },

  getEpisode(id) {
    return EPISODES.find((episode) => episode.id === id);
  },

  formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = String(total % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  },

  formatDuration(seconds) {
    const mins = Math.max(1, Math.round(seconds / 60));
    return `~${mins} min`;
  },

  updateEpisodeDuration() {
    if (!this.currentEpisodeId || !this.audio.duration) return;
    const meta = document.querySelector(
      `.episode[data-episode-id="${this.currentEpisodeId}"] .episode__meta`
    );
    if (meta) {
      meta.textContent = `Ep. ${this.currentEpisodeId} • ${this.formatDuration(this.audio.duration)}`;
    }
  },

  updateProgress() {
    const { currentTime, duration } = this.audio;
    const percent = duration ? (currentTime / duration) * 100 : 0;
    this.els.progressFill.style.width = `${percent}%`;
    this.els.progress.setAttribute(
      "aria-valuenow",
      String(Math.round(percent))
    );
  },

  seek(event) {
    if (!this.audio.duration) return;
    const rect = this.els.progress.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.audio.currentTime = Math.max(0, Math.min(1, ratio)) * this.audio.duration;
  },

  syncUi() {
    const isPlaying = !this.audio.paused && !this.audio.ended;
    this.els.playBtn.innerHTML = isPlaying ? ICONS.pause : ICONS.play;
    this.els.playBtn.setAttribute(
      "aria-label",
      isPlaying ? "Pausa" : "Riproduci"
    );
    this.els.miniPlayer.classList.toggle("is-playing", isPlaying);

    document.querySelectorAll(".episode").forEach((item) => {
      const id = Number(item.dataset.episodeId);
      const isActive = id === this.currentEpisodeId;
      item.classList.toggle("is-active", isActive);

      const playBtn = item.querySelector(".episode__play");
      if (!playBtn || !this.getEpisode(id)?.audio) return;

      playBtn.innerHTML = isActive && isPlaying ? ICONS.pause : ICONS.play;
      playBtn.setAttribute(
        "aria-label",
        isActive && isPlaying ? "Pausa episodio" : "Riproduci episodio"
      );
    });
  },

  loadEpisode(episode) {
    this.currentEpisodeId = episode.id;
    this.audio.src = episode.audio;
    this.els.title.textContent = episode.title;
    this.els.artist.textContent = PUBLISHER;
    this.els.cover.src = COVER_SRC;
    this.els.miniPlayer.classList.add("is-visible");
  },

  playEpisode(episode) {
    if (!episode?.audio) return;

    if (this.currentEpisodeId === episode.id) {
      this.togglePlay();
      return;
    }

    this.loadEpisode(episode);
    this.audio.play().catch(() => {});
  },

  togglePlay() {
    if (!this.currentEpisodeId) {
      const firstPlayable = EPISODES.find((episode) => episode.audio);
      if (firstPlayable) this.playEpisode(firstPlayable);
      return;
    }

    if (this.audio.paused) {
      this.audio.play().catch(() => {});
    } else {
      this.audio.pause();
    }
  },

  onEnded() {
    this.audio.currentTime = 0;
    this.syncUi();
  },
};

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

function renderEpisodes() {
  const list = document.getElementById("episode-list");
  if (!list || typeof EPISODES === "undefined") return;

  EPISODES.forEach((episode) => {
    const item = document.createElement("li");
    item.className = "episode";
    item.dataset.episodeId = String(episode.id);

    const top = document.createElement("div");
    top.className = "episode__top";

    const content = document.createElement("div");
    content.className = "episode__content";

    const title = document.createElement("h3");
    title.className = "episode__title";
    title.textContent = episode.title;

    const description = document.createElement("p");
    description.className = "episode__description is-collapsed";
    description.textContent = episode.description;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "episode__toggle";
    toggle.textContent = "Mostra altro";
    toggle.hidden = true;
    toggle.addEventListener("click", () => {
      const expanded = description.classList.toggle("is-expanded");
      description.classList.toggle("is-collapsed", !expanded);
      toggle.textContent = expanded ? "Mostra meno" : "Mostra altro";
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    const meta = document.createElement("p");
    meta.className = "episode__meta";
    meta.textContent = `Ep. ${episode.id} • ~45 min`;

    content.append(title, description, toggle, meta);
    top.append(createEpisodeThumb(), content);

    const actions = document.createElement("div");
    actions.className = "episode__actions";

    const icons = document.createElement("div");
    icons.className = "episode__action-icons no-interaction";
    icons.append(
      createIconButton("episode__action-icon", ICONS.plus),
      createIconButton("episode__action-icon", ICONS.download),
      createIconButton("episode__action-icon", ICONS.share),
      createIconButton("episode__action-icon", ICONS.more)
    );

    const play = document.createElement("button");
    play.type = "button";
    play.className = "episode__play";
    play.innerHTML = ICONS.play;
    play.setAttribute(
      "aria-label",
      episode.audio ? "Riproduci episodio" : "Episodio non disponibile"
    );

    if (episode.audio) {
      play.addEventListener("click", () => player.playEpisode(episode));
    } else {
      play.classList.add("episode__play--disabled");
      play.disabled = true;
    }

    actions.append(icons, play);
    item.append(top, actions);
    list.appendChild(item);

    requestAnimationFrame(() => {
      if (description.scrollHeight > description.clientHeight + 1) {
        toggle.hidden = false;
        toggle.setAttribute("aria-expanded", "false");
      }
    });
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
  player.init();
  renderEpisodes();
  renderInfoPanel();
  initTabs();
});
