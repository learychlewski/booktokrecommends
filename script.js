

let currentIndex = 0;
let isOverride = false;

const STORAGE_KEY = "memoire_highlights_v2";
const scrollArea = document.getElementById("memoire-left");
const IS_TOUCH = window.matchMedia("(hover: none) and (pointer: coarse)").matches;


/* ============================================================
   SOMMAIRE — SLIDE PANEL
   ============================================================ */

(function initTOC() {
  const tocHandle = document.getElementById("toc-handle");
  const tocOverlay = document.getElementById("toc-overlay");
  const fullpage = document.getElementById("fullpage");

  if (!tocHandle || !tocOverlay) return;

  // Ouvrir
  const tocMobile = document.getElementById("toc-mobile");

tocHandle.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (window.matchMedia("(max-width: 900px)").matches) {
    // 📱 MOBILE
    tocMobile?.classList.remove("hidden");
  } else {
    // 🖥 DESKTOP
    tocOverlay.classList.add("open");
    document.body.classList.add("toc-open");
  }
});



  // Navigation (une seule fois)
tocOverlay.addEventListener("click", (e) => {
  const item = e.target.closest("[data-target]");
  if (!item) return;

  e.preventDefault();
  e.stopPropagation();

  const id = item.getAttribute("data-target");
  const section = document.getElementById(id);
  if (!section) return;

  const memoire = document.getElementById("memoire-left");

  // 🖥 DESKTOP
  if (!window.matchMedia("(max-width: 900px)").matches) {
    if (id === "hero" || id === "avant-propos") {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
  section.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
  }
  // 📱 MOBILE
  else {
    section.scrollIntoView({ behavior: "smooth" });
  }

  tocOverlay.classList.remove("open");
  document.body.classList.remove("toc-open");
});



// Fermer quand on clique ailleurs
tocOverlay.addEventListener("click", (e) => {
  if (e.target !== tocOverlay) return;

  tocOverlay.classList.remove("open");
  document.body.classList.remove("toc-open");
});



  // ESC ferme le sommaire
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tocOverlay.classList.contains("open")) {
      tocOverlay.classList.remove("open");
      document.body.classList.remove("toc-open");
    }
  });
})();

/* ============================================================
   NOTES DE BAS DE PAGE
   ============================================================ */

const notePopup = document.getElementById("note-popup");

function initNotes() {
  const notes = document.querySelectorAll("sup[data-note]");
  if (!notes.length) return;

  // Desktop bubble existe, mais on ne crash pas si elle n’existe pas (mobile/sections)
  const canBubble = !!notePopup;

  const hideBubble = () => {
    if (notePopup) notePopup.classList.remove("visible");
    notes.forEach((n) => n.classList.remove("trigger-active"));
  };

  const showBubble = (note) => {
    if (!canBubble) return;
    const content = note.getAttribute("data-note") || "";
    notePopup.innerHTML = content;

    const rect = note.getBoundingClientRect();
    notePopup.style.top = rect.top + window.scrollY - 22 + "px";
    notePopup.style.left = rect.right + window.scrollX + 30 + "px";

    notePopup.classList.add("visible");
    note.classList.add("trigger-active");
  };

  notes.forEach((note) => {
    // nettoyage (car initNotes peut être rappelé après surlignage)
    note.onmouseenter = null;
    note.onmouseleave = null;
    note.onclick = null;

    if (IS_TOUCH) {
      note.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const modal = document.getElementById("note-modal");
        const content = document.getElementById("note-modal-content");
        if (!modal || !content) return;

        content.innerHTML = note.getAttribute("data-note") || "";
        modal.classList.remove("hidden");
      });
    } else {
      note.addEventListener("mouseenter", () => showBubble(note));
      note.addEventListener("mouseleave", hideBubble);
    }
  });

  // Desktop only: clic ailleurs ferme la bulle
  if (!IS_TOUCH) {
    document.addEventListener("click", (e) => {
      if (!e.target.closest("sup[data-note]")) hideBubble();
    });
  }

  // scroll de la colonne gauche ferme la bulle
  document.getElementById("memoire-left")?.addEventListener("scroll", hideBubble);
}

/* ============================================================
   IMAGES — TEXTE (DESKTOP hover overlay / MOBILE modal)
   ============================================================ */

function initImageTriggers() {
  const triggers = document.querySelectorAll(".image-trigger");
  if (!triggers.length) return;

  const hoverOverlay = document.getElementById("hover-image-overlay");
  const hoverImg = document.getElementById("hover-image-large");
  const hoverCaption = document.getElementById("hover-image-caption");

  const imageModal = document.getElementById("image-modal");
  const imageModalImg = document.getElementById("image-modal-img");
  const imageModalCaption = document.getElementById("image-modal-caption");

  // Desktop hover overlay
  // Desktop hover overlay (souris uniquement, robuste)
if (hoverOverlay && hoverImg) {
  triggers.forEach((tr) => {
    tr.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;

      const raw = tr.getAttribute("data-img");
      if (!raw) return;

      const first = raw.split(",")[0].trim();
      hoverImg.src = first;

      if (hoverCaption) {
        hoverCaption.textContent = tr.getAttribute("data-caption") || "";
      }

      hoverOverlay.classList.add("visible");
    });
  });

  hoverOverlay.addEventListener("click", (e) => {
    if (e.target === hoverOverlay) hoverOverlay.classList.remove("visible");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hoverOverlay.classList.remove("visible");
  });
}


  // Mobile/Tablet: click -> modale image (on réutilise #image-modal si présent)
  if (IS_TOUCH && imageModal && imageModalImg) {
    triggers.forEach((tr) => {
      tr.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const raw = tr.getAttribute("data-img");
        if (!raw) return;

        const first = raw.split(",")[0].trim();
        imageModalImg.src = first;

        if (imageModalCaption) {
          imageModalCaption.textContent = tr.getAttribute("data-caption") || "";
        }

        imageModal.classList.remove("hidden");
      });
    });
  }
}

/* ============================================================
   IMAGES — ANNEXE (thumbs -> image modal)
   ============================================================ */

function initImageModal() {
  const thumbs = document.querySelectorAll(".image-annex-thumb");
  const modal = document.getElementById("image-modal");
  const img = document.getElementById("image-modal-img");
  const caption = document.getElementById("image-modal-caption");

  if (!thumbs.length || !modal || !img) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      img.src = thumb.dataset.img;
      if (caption) caption.textContent = thumb.dataset.caption || "";
      modal.classList.remove("hidden");
    });
  });

  // fermeture clic hors contenu
  modal.addEventListener("click", (e) => {
    if (!e.target.closest(".image-modal-content")) {
      modal.classList.add("hidden");
    }
  });

  // fermeture ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.add("hidden");
  });
}

/* ============================================================
   VIDÉO DANS L’IPHONE (playlist + controls)
   ============================================================ */

const iphoneScreen = document.getElementById("iphone-screen");
const mainVideo = document.getElementById("iphone-video");
const iphoneWrapper = document.getElementById("iphone-wrapper");

(function initVideoLinks() {
  const videoLinks = document.querySelectorAll(".video-link");
  if (!iphoneScreen || !videoLinks.length) return;

  videoLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const url = link.getAttribute("data-video");
      if (!url) return;
      iphoneScreen.innerHTML = `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
    });
  });
})();

/* ============================================================
   FULLSCREEN (guards)
   ============================================================ */

(function initFullscreen() {
  const fullscreenBtn = document.getElementById("fullscreen");
  if (!fullscreenBtn || !mainVideo) return;

  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      mainVideo.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  // Sur certains navigateurs, l'event est sur document
  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      mainVideo.style.width = "100%";
      mainVideo.style.height = "auto";
      mainVideo.style.objectFit = "contain";
      mainVideo.style.position = "static";
    } else {
      mainVideo.style.width = "100%";
      mainVideo.style.height = "100%";
      mainVideo.style.objectFit = "cover";
      mainVideo.style.position = "absolute";
      mainVideo.style.top = "0";
      mainVideo.style.left = "0";
    }
  });
})();

/* ============================================================
   PLAYLIST AUTOMATIQUE (inchangée)
   ============================================================ */

const playlist = [
  "videos/video1.mp4","videos/video2.mp4","videos/video3.mp4","videos/video4.mp4","videos/video5.mp4",
  "videos/video6.mp4","videos/video7.mp4","videos/video8.mp4","videos/video9.mp4","videos/video10.mp4",
  "videos/video11.mp4","videos/video12.mp4","videos/video13.mp4","videos/video14.mp4","videos/video15.mp4",
  "videos/video16.mp4","videos/1_60.mp4","videos/2_230.mp4","videos/3_240.mp4","videos/4_241.mp4",
  "videos/5_252.mp4","videos/6_251.mp4","videos/7_62.mp4","videos/8_242.mp4","videos/9_243.mp4",
  "videos/10_61.mp4","videos/11_260.mp4","videos/12_261.mp4","videos/13_262.mp4","videos/14_270.mp4",
  "videos/15_271.mp4","videos/16_272.mp4","videos/17_247.mp4","videos/18_248.mp4","videos/19_249.mp4",
  "videos/20_280.mp4","videos/21_281.mp4","videos/22_63.mp4","videos/23_282.mp4","videos/24_46.mp4",
  "videos/34_224.mp4","videos/37_223.mp4","videos/36_222.mp4","videos/38_221.mp4","videos/35_220.mp4",
  "videos/33_211.mp4","videos/32_210.mp4","videos/30_202.mp4","videos/31_201.mp4","videos/29_200.mp4",
  "videos/20_191.mp4","videos/19_190.mp4","videos/39_180.mp4","videos/27_170.mp4","videos/26_103.mp4",
  "videos/21_102.mp4","videos/18_162.mp4","videos/17_161.mp4","videos/16_160.mp4","videos/15_151.mp4",
  "videos/14_141.mp4","videos/13_140.mp4","videos/12_131.mp4","videos/11_130.mp4","videos/10_122.mp4",
  "videos/9_121.mp4","videos/8_120.mp4","videos/7_111.mp4","videos/6_110.mp4","videos/5_101.mp4",
  "videos/4_100.mp4","videos/2_91.mp4","videos/1_90.mp4","videos/41_82.mp4","videos/42_81.mp4",
  "videos/40_80.mp4","videos/28_71.mp4","videos/23_45.mp4","videos/24_44.mp4","videos/25_43.mp4",
  "videos/22_42.mp4","videos/3_70.mp4","videos/video17.mp4"
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(playlist);

// démarrage playlist
if (mainVideo) {
  currentIndex = 0;
  mainVideo.src = playlist[currentIndex];
  mainVideo.play().catch(() => { /* autoplay peut être bloqué */ });

  mainVideo.addEventListener("ended", () => {
    if (isOverride) return;
    currentIndex = (currentIndex + 1) % playlist.length;
    mainVideo.src = playlist[currentIndex];
    mainVideo.play().catch(() => {});
  });
}

/* ============================================================
   CONTROLES SUIVANT / PRECEDENT (guards)
   ============================================================ */

(function initPrevNext() {
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  if (!mainVideo) return;

  nextBtn?.addEventListener("click", () => {
    isOverride = false;
    iphoneWrapper?.classList.remove("glow");
    mainVideo.onended = null;

    currentIndex = (currentIndex + 1) % playlist.length;
    mainVideo.src = playlist[currentIndex];
    mainVideo.currentTime = 0;
    mainVideo.play().catch(() => {});
  });

  prevBtn?.addEventListener("click", () => {
    isOverride = false;
    iphoneWrapper?.classList.remove("glow");
    mainVideo.onended = null;

    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    mainVideo.src = playlist[currentIndex];
    mainVideo.currentTime = 0;
    mainVideo.play().catch(() => {});
  });
})();

/* ============================================================
   VIDEO TRIGGERS (FIX : plus de double IS_TOUCH)
   Desktop: hover -> iPhone override
   Mobile/Tablet: click -> modale vidéo
   ============================================================ */

function initVideoTriggers() {
  const triggers = document.querySelectorAll(".video-trigger");
  if (!triggers.length) return;

  const runTrigger = (trigger) => {
    const raw = trigger.getAttribute("data-video") || "";
    const videos = raw.split(",").map(v => v.trim()).filter(Boolean);
    if (!videos.length || !mainVideo) return;

    let i = 0;
    isOverride = true;

    iphoneWrapper?.classList.add("glow");
    trigger.classList.add("trigger-active");

    function playCurrent() {
      mainVideo.src = videos[i];
      mainVideo.currentTime = 0;
      mainVideo.play().catch(() => {});
    }

    playCurrent();

    mainVideo.onended = () => {
      if (!isOverride) {
        mainVideo.onended = null;
        return;
      }

      i++;
      if (i < videos.length) {
        playCurrent();
      } else {
        isOverride = false;
        iphoneWrapper?.classList.remove("glow");
        trigger.classList.remove("trigger-active");

        mainVideo.onended = null;
        currentIndex = (currentIndex + 1) % playlist.length;
        mainVideo.src = playlist[currentIndex];
        mainVideo.currentTime = 0;
        mainVideo.play().catch(() => {});
      }
    };
  };

  triggers.forEach((trigger) => {
    // nettoyage
    trigger.onmouseenter = null;
    trigger.onmouseleave = null;
    trigger.onclick = null;

    if (IS_TOUCH) {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const raw = trigger.getAttribute("data-video") || "";
        const videos = raw.split(",").map(v => v.trim()).filter(Boolean);
        if (!videos.length) return;

        openVideoModal({
          file: videos[0],
          title: trigger.textContent.trim(),
          user: "", date: "", description: "",
          views: "", likes: "", comments: "", link: ""
        });
      });
    } else {
      trigger.addEventListener("mouseenter", () => runTrigger(trigger));
      trigger.addEventListener("mouseleave", () => {
        trigger.classList.remove("trigger-active");
      });
    }
  });
}

/* ============================================================
   PLAY / PAUSE + MUTE (guards)
   ============================================================ */

(function initPlayPauseMute() {
  if (!mainVideo) return;

  const playPauseBtn = document.getElementById("playpause");
  const playPauseIcon = document.getElementById("playpause-icon");

  const muteBtn = document.getElementById("mute-toggle");
  const muteIcon = document.getElementById("mute-icon");

  // 🔇 état initial : vidéo muette
  mainVideo.muted = true;
  if (muteIcon) muteIcon.src = "svg/muted.svg";

  // ▶️ Play / Pause
  playPauseBtn?.addEventListener("click", () => {
    if (mainVideo.paused) {
      mainVideo.play().catch(() => {});
      if (playPauseIcon) playPauseIcon.src = "svg/pause.svg";
    } else {
      mainVideo.pause();
      if (playPauseIcon) playPauseIcon.src = "svg/play.svg";
    }
  });

  mainVideo.addEventListener("play", () => {
    if (playPauseIcon) playPauseIcon.src = "svg/pause.svg";
  });

  mainVideo.addEventListener("pause", () => {
    if (playPauseIcon) playPauseIcon.src = "svg/play.svg";
  });

  // 🔊 Mute / Unmute
  muteBtn?.addEventListener("click", () => {
    mainVideo.muted = !mainVideo.muted;
    if (muteIcon) {
      muteIcon.src = mainVideo.muted
        ? "svg/muted.svg"
        : "svg/son.svg";
    }
  });
})();



const highlightBtn = document.getElementById("highlight-btn");
let lastSelection = null;

(function initHighlight() {
  if (!highlightBtn) return;

  document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    if (!selection) return;

    if (selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      lastSelection = range;

      const rect = range.getBoundingClientRect();
      highlightBtn.style.top = window.scrollY + rect.top - 10 + "px";
      highlightBtn.style.left = window.scrollX + rect.right + 15 + "px";
      highlightBtn.style.display = "block";
    } else {
      highlightBtn.style.display = "none";
    }
  });

  highlightBtn.addEventListener("click", () => {
    if (!lastSelection) return;

    const range = lastSelection;
    const contents = range.cloneContents();

    const mark = document.createElement("mark");
    mark.classList.add("custom-highlight");
    mark.appendChild(contents);

    range.deleteContents();
    range.insertNode(mark);

    // enlever espace fantôme
    if (mark.previousSibling && mark.previousSibling.nodeType === 3 && !mark.previousSibling.nodeValue.trim()) {
      mark.previousSibling.remove();
    }

    highlightBtn.style.display = "none";
    window.getSelection()?.removeAllRanges();

    saveHighlights();
    // On ré-attache les handlers sur le contenu réécrit
    initNotes();
    initVideoTriggers();
    initImageTriggers();
    initImageModal();
  });
})();

function saveHighlights() {
  const html = document.querySelector("#memoire-left")?.innerHTML || "";
  localStorage.setItem(STORAGE_KEY, html);
}

/* suppression du surlignage par clic */
document.addEventListener("click", (e) => {
  if (e.target.classList && e.target.classList.contains("custom-highlight")) {
    const mark = e.target;
    const parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    mark.remove();

    saveHighlights();
    initNotes();
    initVideoTriggers();
    initImageTriggers();
  }
});

/* ============================================================
   ANNEXE VIDÉO — GÉNÉRATION AUTOMATIQUE
   ============================================================ */

function buildAnnex() {
  const annexGrid = document.getElementById("video-annex-grid");
  if (!annexGrid) return;

  annexGrid.innerHTML = "";

  const triggers = [...document.querySelectorAll(".video-trigger")];

  const annexList = [];
  const seen = new Set();

  triggers.forEach((tr) => {
    const raw = tr.getAttribute("data-video");
    if (!raw) return;

    const files = raw.split(",").map(v => v.trim()).filter(Boolean);
    files.forEach((f) => {
      if (seen.has(f)) return;
      seen.add(f);

      annexList.push({
        file: f,
        title: tr.textContent.replace(/\s+/g, " ").trim(),
        user: "—",
        link: "#",
        views: "—",
        likes: "—",
        comments: "—",
        shares: "—",
        date: "",
        description: ""
      });
    });
  });

  annexList.forEach((v, index) => {
    const div = document.createElement("div");
    div.className = "annex-thumb";
    div.innerHTML = `
      <video src="${v.file}" muted></video>
      <span class="annex-number">${index + 1}</span>
    `;
    div.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation(); // 🔥 LA CLÉ
  openVideoModal(v);
});
    annexGrid.appendChild(div);
  });

  window.ANNEX_VIDEOS = annexList;
}

/* ============================================================
   COLOPHON (guards + fermeture sûre)
   ============================================================ */

(function initColophon() {
  const copyrightBtn = document.getElementById("copyright-button");
  const colophonOverlay = document.getElementById("colophon-overlay");
  if (!copyrightBtn || !colophonOverlay) return;

  copyrightBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    colophonOverlay.classList.add("open");
  });

  colophonOverlay.addEventListener("click", (e) => {
    // clic en dehors du panneau
    if (e.target === colophonOverlay) colophonOverlay.classList.remove("open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") colophonOverlay.classList.remove("open");
  });
})();

/* ============================================================
   MODALE D’INFO VIDÉO (OPEN + CLOSE iOS SAFE)
   ============================================================ */

function openVideoModal(data) {
  const modal = document.getElementById("video-modal");
  if (!modal) return;

  modal.classList.remove("hidden");

  const player = document.getElementById("video-modal-player");
  if (player) {
    player.src = data.file;
    player.currentTime = 0;
    // sur iOS, play peut être bloqué si pas issu d’un geste utilisateur : on ignore l’erreur
    player.play?.().catch(() => {});
  }

  const title = document.getElementById("video-modal-title");
  const user = document.getElementById("video-modal-user");
  const date = document.getElementById("video-modal-date");
  const desc = document.getElementById("video-modal-description");
  const link = document.getElementById("video-modal-link");

  const comments = document.getElementById("video-modal-comments");

  if (title) title.innerText = data.title || "";
  if (user) user.innerText = data.user || "—";
  if (date) date.innerText = data.date ? `Publié le ${data.date}` : "";
  if (desc) desc.innerText = data.description || "";
  if (link) link.href = data.link || "#";



  if (comments) comments.innerHTML = "";
}

(function initVideoModalClose() {
  const videoModal = document.getElementById("video-modal");
  const videoModalPlayer = document.getElementById("video-modal-player");
  const videoModalClose = document.getElementById("video-modal-close");

  if (!videoModal || !videoModalClose) return;

  const close = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // 🔥 clé iOS
    }
    videoModal.classList.add("hidden");
    if (videoModalPlayer) {
      videoModalPlayer.pause();
      videoModalPlayer.currentTime = 0;
    }
  };

  // X
  videoModalClose.addEventListener("click", close);

  // clic en dehors de la box
  videoModal.addEventListener("click", (e) => {
    const box = document.querySelector(".video-modal-content");
    if (box && !box.contains(e.target)) close(e);
  });

  // ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !videoModal.classList.contains("hidden")) close(e);
  });
})();

document.querySelector(".video-modal-content")?.addEventListener("click", (e) => {
  e.stopPropagation();
});

/* ============================================================
   MODALE NOTES — FERMETURE (UNE FOIS)
   ============================================================ */

(function initNoteModalClose() {
  const noteModal = document.getElementById("note-modal");
  const noteModalClose = document.querySelector("#note-modal .modal-close");
  if (!noteModal || !noteModalClose) return;

  noteModalClose.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    noteModal.classList.add("hidden");
  });

  // clic overlay ferme
  noteModal.addEventListener("click", (e) => {
    if (e.target === noteModal) noteModal.classList.add("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") noteModal.classList.add("hidden");
  });
})();

/* ============================================================
   RESTAURATION AU CHARGEMENT + INIT
   ============================================================ */

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && document.querySelector("#memoire-left")) {
    document.querySelector("#memoire-left").innerHTML = saved;
  }

  initNotes();
  initVideoTriggers();
  initImageTriggers();
  initImageModal();
  buildAnnex();

  // Ajout d’infos annexes (tes stats) — on garde ton comportement
  window.addEventListener("load", () => {
    if (!window.ANNEX_VIDEOS) return;

    // Exemple : vidéo n°1 (index 0)
    if (window.ANNEX_VIDEOS[0]) {
      window.ANNEX_VIDEOS[0].user = "@literary_lex";
      window.ANNEX_VIDEOS[0].description =
        "Forever indebted to my bestie 🥲 #booktok #fyp #bookish #booktokfyp #acotar";
      window.ANNEX_VIDEOS[0].date = "18 octobre 2025";
      window.ANNEX_VIDEOS[0].link = "https://www.tiktok.com/@literary_lex/video/7562372634042715423";
    }

    if (window.ANNEX_VIDEOS[1]) {
      window.ANNEX_VIDEOS[1].user = "@bookishcharl";
      window.ANNEX_VIDEOS[1].description =
        "i rlly thought “oh I’ll get back into reading!! what a fun and harmless hobby!!” i have no money now xxx #booktok #books #bookhaul #lockdown #covid";
      window.ANNEX_VIDEOS[1].date = "20 février 2022";
      window.ANNEX_VIDEOS[1].link = "https://www.tiktok.com/@bookishcharl/video/7066833248927698182";
    }

    if (window.ANNEX_VIDEOS[2]) {
      window.ANNEX_VIDEOS[2].user = "@donie_bookshelf";
      window.ANNEX_VIDEOS[2].description =
        "This interaction warmed my heart 🩷🥹  #booktokcommunityfyp #bookworm #bookcommunity #readersoftiktok #xybca";
      window.ANNEX_VIDEOS[2].date = "19 octobre 2025";
      window.ANNEX_VIDEOS[2].link = "https://www.tiktok.com/@donie_bookshelf/video/7562728902989270286";
    }

    if (window.ANNEX_VIDEOS[3]) {
      window.ANNEX_VIDEOS[3].user = "@alicia_bookss";
      window.ANNEX_VIDEOS[3].description =
        "Les termes du booktok 📚🫵🏻 #BookTok #lecoindeslecteurs #booktokfr #booktokfrance #romance";
      window.ANNEX_VIDEOS[3].date = "14 août 2025";
      window.ANNEX_VIDEOS[3].link = "https://www.tiktok.com/@alicia_bookss/video/7538491010817494294";
    }

    if (window.ANNEX_VIDEOS[4]) {
      window.ANNEX_VIDEOS[4].user = "@newbuild_newlyweds";
      window.ANNEX_VIDEOS[4].description =
        "Heavy on the vibes when reading ✨📚☕️ #bookish #booktok #bookstsgram #book #books #readingtok #reading #vibes #aesthetic #homelibrary #library #bookishvibes #booktoker #booktokfyp";
      window.ANNEX_VIDEOS[4].date = "31 janvier 2025";
      window.ANNEX_VIDEOS[4].link = "https://www.tiktok.com/@newbuild_newlyweds/video/7465856125624405294";
    }

    if (window.ANNEX_VIDEOS[5]) {
      window.ANNEX_VIDEOS[5].user = "@gracemariebooks";
      window.ANNEX_VIDEOS[5].description =
        "this was definitely a big book haul month <3 definitely going on a book buying ban till further notice 📖📖 #booktok #bookfyp #bookhaul #bookshopping";
      window.ANNEX_VIDEOS[5].date = "1er juin 2025";
      window.ANNEX_VIDEOS[5].link = "https://www.tiktok.com/@gracemariebooks/video/7510949327104134418";
    }

    if (window.ANNEX_VIDEOS[6]) {
      window.ANNEX_VIDEOS[6].user = "@macksbooks";
      window.ANNEX_VIDEOS[6].description =
        "book haul🎀 #booktok #books #bookish #bookrecs #fyp #read #girlie #bookrecommendations #booklover #aesthetic #bookworm #love #romancebooks #gracieabrams #bookhaul";
      window.ANNEX_VIDEOS[6].date = "20 janvier 2024";
      window.ANNEX_VIDEOS[6].link = "https://www.tiktok.com/@macksbooks/video/7326311912822574382";
    }

    if (window.ANNEX_VIDEOS[7]) {
      window.ANNEX_VIDEOS[7].user = "@eliseebooks";
      window.ANNEX_VIDEOS[7].description =
        "Des livres qui se lisent très vite tellement ils sont addictifs 🕯️🍂📖 #leclubdeslecteurs #lecture #booktokfrance #bookhaul #booktok";
      window.ANNEX_VIDEOS[7].date = "11 octobre 2025";
      window.ANNEX_VIDEOS[7].link = "https://www.tiktok.com/@eliseebooks/video/7559881877624982806";
    }

    if (window.ANNEX_VIDEOS[8]) {
      window.ANNEX_VIDEOS[8].user = "@yannareads";
      window.ANNEX_VIDEOS[8].description =
        "MY FAV ENEMIES TO LOVERS BOOKS 🙆🏼‍♀️🫶🏻 #books #tbr #booktok #ememiestolovers";
      window.ANNEX_VIDEOS[8].date = "5 septembre 2024";
      window.ANNEX_VIDEOS[8].link = "https://www.tiktok.com/@yannareads/video/7411227416741367082?";
    }

    if (window.ANNEX_VIDEOS[9]) {
      window.ANNEX_VIDEOS[9].user = "@larryreads";
      window.ANNEX_VIDEOS[9].description =
        "happy pride month 🏳️‍🌈 #bookrecs #lgbtq #lgbtqbooks #pridemonth #romancebooks";
      window.ANNEX_VIDEOS[9].date = "1er juin 2025";
      window.ANNEX_VIDEOS[9].link = "https://www.tiktok.com/@larryreads/video/7511039541155892526";
    }

    if (window.ANNEX_VIDEOS[10]) {
      window.ANNEX_VIDEOS[10].user = "@eatsleepreadrepeat";
      window.ANNEX_VIDEOS[10].description =
        "This video took so long to film and edit😭 so worth it though!!📚🤍 #bookshelf #bookshelftour #organise #readersoftiktok #booktok";
      window.ANNEX_VIDEOS[10].date = "6 novembre 2025";
      window.ANNEX_VIDEOS[10].link = "https://www.tiktok.com/@eatsleepreadrepeat/video/7569434353575398678";
    }

    if (window.ANNEX_VIDEOS[11]) {
      window.ANNEX_VIDEOS[11].user = "@specialstargazing";
      window.ANNEX_VIDEOS[11].description =
        "#books #bookstan #classicbooks #classicbooktok #literature #booksoftiktok #literature #bookquotes #darkacademia #penguinclassics #classiclittok #darkacademiaaesthetic #bookrec #classicliterature #bookshelftour #bookshelf";
      window.ANNEX_VIDEOS[11].date = "9 janvier 2025";
      window.ANNEX_VIDEOS[11].link = "https://www.tiktok.com/@specialstargazing/video/7458012718092553494";
    }

    if (window.ANNEX_VIDEOS[12]) {
      window.ANNEX_VIDEOS[12].user = "@books.edaj";
      window.ANNEX_VIDEOS[12].description =
        "17 livres dans ma PAL ça vaaa Et vous combien ? ( si vous pouvez compter 🤣 ) Venez sur insta : https://www.instagram.com/books.edaj?igsh=MTN0anA0YWhiMnJqcg%3D%3D&utm_source=qr #books #booktok #PAL";
      window.ANNEX_VIDEOS[12].date = "15 juin 2025";
      window.ANNEX_VIDEOS[12].link = "https://www.tiktok.com/@books.edaj/video/7516182718741237014";
    }

    if (window.ANNEX_VIDEOS[13]) {
      window.ANNEX_VIDEOS[13].user = "@lilou_icrm.edaj";
      window.ANNEX_VIDEOS[13].description =
        "Bon c'est sur un tabouret et je fais 1.55m c'est pas trop compliqué...#booktokfrance #booktokfr #pourtoii";
      window.ANNEX_VIDEOS[13].date = "28 novembre 2024";
      window.ANNEX_VIDEOS[13].link = "https://www.tiktok.com/@lilou_icrm/video/7442389432407297312";
    }

    if (window.ANNEX_VIDEOS[14]) {
      window.ANNEX_VIDEOS[14].user = "@bookology.fr";
      window.ANNEX_VIDEOS[14].description =
        "60 TROPES !? 😱⚠️ j’ai un accent plus que BANCAL tout le long mdrrrr, merci de ne pas vous moquer 😭 On m’a posé beaucoup de questions sur les différents tropes dans les livres !! Je trouvais ça cool de vous compiler et de vous expliquer tous les principaux que l’on retrouve sur le Booktok 🫶🏼 📲 Si des recommandations de livres contenant des tropes spécifiques vous intéressent, n’hésitez pas à le dire en commentaire ! — 💌 partie 2 disponible ici : — #booktok #nousleslecteurs #leclubdeslecteurs #bookworm #tropes #booktropes #bookrecommendations #livres #livreaddict";
      window.ANNEX_VIDEOS[14].date = "25 septembre 2024";
      window.ANNEX_VIDEOS[14].link = "https://www.tiktok.com/@bookology.fr/video/7418644998154964256";
    }

    if (window.ANNEX_VIDEOS[15]) {
      window.ANNEX_VIDEOS[15].user = "@franiefae";
      window.ANNEX_VIDEOS[15].description =
        "This is your sign to slow down and read your book 📖✨☁️ @SendAFriend ✨ @Sip-Sip Hooray! #booktok #cozyroom #bookish #cozyreading #booknook #readingnook #fourthwing #bookrecs #readingvlog #readingaesthetic #aesthetic #cozyvibes #booktoker #booktokfyp";
      window.ANNEX_VIDEOS[15].date = "21 mai 2025";
      window.ANNEX_VIDEOS[15].link = "https://www.tiktok.com/@franiefae/video/7506925503782178079";
    }

    if (window.ANNEX_VIDEOS[16]) {
      window.ANNEX_VIDEOS[16].user = "@the.cozysoul";
      window.ANNEX_VIDEOS[16].description =
        "I’m so excited for this book series 📕 #readingnight #booktok #bookworm #bookish #phantasma #bookseries #bookrecommendations #bookrec #readingvlog #readingvibes #readingaesthetic #booklover #bookgirl #bookgirlies #cozygirl #cozynightin #cozynight #fantasybooktok #romantasybooks #darkromance #readingtime #readingromance #fyp";
      window.ANNEX_VIDEOS[16].date = "12 mai 2025";
      window.ANNEX_VIDEOS[16].link = "https://www.tiktok.com/@the.cozysoul/video/7503574176037555478";
    }

    if (window.ANNEX_VIDEOS[17]) {
      window.ANNEX_VIDEOS[17].user = "@bookswithsandm";
      window.ANNEX_VIDEOS[17].description =
        "18hrs next?👀 #booktok #target #books #reading #readathon #readingvlog #vlog #fyp #foryou #foryoupages";
      window.ANNEX_VIDEOS[17].date = "11 juillet 2024";
      window.ANNEX_VIDEOS[17].link = "https://www.tiktok.com/@bookswithsandm/video/7390389064844840238";
    }

    if (window.ANNEX_VIDEOS[18]) {
      window.ANNEX_VIDEOS[18].user = "@vivnyae";
      window.ANNEX_VIDEOS[18].description =
        "ᥫ᭡ The Fate of Ophelia - Taylor Swift {OUABH trilogy - Jacks & Evangeline Fox} I can’t wait to read their novella im actually so excited - ib: @𝓮𝓿𝓪 ac: @audios art creds: hachandraws, rosedskies, junkokiu, rosiethorns88, kotikomori, clairekie, imjenndove, lazersanwrld (all ig) & mayleeillust (tt) — #onceuponabrokenheart #ouabhedit #bookedit #evajacks #stephaniegarber";
      window.ANNEX_VIDEOS[18].date = "18 octobre 2025";
      window.ANNEX_VIDEOS[18].link = "https://www.tiktok.com/@vivnyae/video/7562539886096518408";
    }

    if (window.ANNEX_VIDEOS[19]) {
      window.ANNEX_VIDEOS[19].user = "@editsbysope";
      window.ANNEX_VIDEOS[19].description =
        "#DEVILSNIGHT || the best month has started! 📚🖤 #devilsnightedit #penelopedouglas scp: @𝖇𝖔𝖇𝖇𝖎 ✰ @𝙢𝙧𝙨𝙬𝙖𝙧𝙣𝙚𝙧𝙧 #booktok #devilsnightseries devils night edit / corrupt hideaway killswitch nightfall / devils night series edit / book edit";
      window.ANNEX_VIDEOS[19].date = "4 octobre 2025";
      window.ANNEX_VIDEOS[19].link = "https://www.tiktok.com/@editsbysope/video/7557455383225208086";
    }

    if (window.ANNEX_VIDEOS[20]) {
      window.ANNEX_VIDEOS[20].user = "@svgemntpp";
      window.ANNEX_VIDEOS[20].description =
        "how lucky am i to fall in love again and again through books 💗 #booktok #fallinloveagain #bookaesthetic #bookish #books";
      window.ANNEX_VIDEOS[20].date = "26 septembre 2025";
      window.ANNEX_VIDEOS[20].link = "https://www.tiktok.com/@svgemntpp/video/7554327732071664904";
    }

    if (window.ANNEX_VIDEOS[21]) {
      window.ANNEX_VIDEOS[21].user = "@bookish.with.jess";
      window.ANNEX_VIDEOS[21].description =
        "✨pt. 3 – ☀️early mornings☕️✨ the best way to start the day💖✨ #booktok #bookish #bookworm #library #booknook";
      window.ANNEX_VIDEOS[21].date = "20 septembre 2025";
      window.ANNEX_VIDEOS[21].link = "https://www.tiktok.com/@bookish.with.jess/video/7552159375134084382";
    }

    if (window.ANNEX_VIDEOS[22]) {
      window.ANNEX_VIDEOS[22].user = "@bookchey";
      window.ANNEX_VIDEOS[22].description =
        "A reader lives a thousand lives before they die ✨ #booktok #reader #read #bookreaction #whyiread";
      window.ANNEX_VIDEOS[22].date = "4 octobre 2025";
      window.ANNEX_VIDEOS[22].link = "https://www.tiktok.com/@bookchey/video/7557120281563696414";
    }

    if (window.ANNEX_VIDEOS[23]) {
      window.ANNEX_VIDEOS[23].user = "@esmeinghamreads";
      window.ANNEX_VIDEOS[23].description =
        "Reading is my life. I need it. I cannot live without it. NO JOKES. #booktok #shatterme";
      window.ANNEX_VIDEOS[23].date = "1 octobre 2025";
      window.ANNEX_VIDEOS[23].link = "https://www.tiktok.com/@esmeinghamreads/video/7556311683736685846";
    }

    if (window.ANNEX_VIDEOS[24]) {
      window.ANNEX_VIDEOS[24].user = "@readbypaulina";
      window.ANNEX_VIDEOS[24].description =
        "#BookTok #bookrecommendations #enemiestolovers #mafiaromance #booktokfyp";
      window.ANNEX_VIDEOS[24].date = "12 septembre 2025";
      window.ANNEX_VIDEOS[24].link = "https://www.tiktok.com/@readbypaulina/video/7549135494626512150";
    }

    if (window.ANNEX_VIDEOS[25]) {
      window.ANNEX_VIDEOS[25].user = "@bookishvinyl";
      window.ANNEX_VIDEOS[25].description =
        "If you haven’t read this do it NOW #booktok #bookwork #bookish #book #dontlettheforestin";
      window.ANNEX_VIDEOS[25].date = "8 octobre 2025";
      window.ANNEX_VIDEOS[25].link = "https://www.tiktok.com/@bookishvinyl/video/7558944570361253134";
    }

    if (window.ANNEX_VIDEOS[26]) {
      window.ANNEX_VIDEOS[26].user = "@charlie.is.reading";
      window.ANNEX_VIDEOS[26].description =
        "J'espère que le concept vous plaira 🫶🏻 @lea🧸💌 ✮⋆˙ @Lili books ☆ @Culturelle📚🩺 @lapassiondesmots @Mel 🌙 | Bookology #booktokfr #booktokfrance #booktok #lecture #recommendations #recommendationslittéraires #recs #pal #influencer #bookinfluencer";
      window.ANNEX_VIDEOS[26].date = "25 février 2025";
      window.ANNEX_VIDEOS[26].link = "https://www.tiktok.com/@charlie.is.reading/video/7475257910432419094";
    }

    if (window.ANNEX_VIDEOS[27]) {
      window.ANNEX_VIDEOS[27].user = "@lucyinthebooks";
      window.ANNEX_VIDEOS[27].description =
        "Welcome to cosy little bookclub where I fall inlove with every fantasy man I read about🍂🍁📖#Booktok  #bookgirlies #fyp #bookaesthetic";
      window.ANNEX_VIDEOS[27].date = "1 septembre 2025";
      window.ANNEX_VIDEOS[27].link = "https://www.tiktok.com/@lucyinthebooks/video/7545207590901386518";
    }

    if (window.ANNEX_VIDEOS[28]) {
      window.ANNEX_VIDEOS[28].user = "@margoeaux";
      window.ANNEX_VIDEOS[28].description =
        "i have never in my life cried bc of a book i am so unwell #thesongofachilles";
      window.ANNEX_VIDEOS[28].date = "8 septembre 2021";
      window.ANNEX_VIDEOS[28].link = "https://www.tiktok.com/@margoeaux/video/7005380270648036613";
    }

    if (window.ANNEX_VIDEOS[29]) {
      window.ANNEX_VIDEOS[29].user = "@regulusshow";
      window.ANNEX_VIDEOS[29].description =
        "he is half of my soul, as the poets say 🏹 #tsoa #thesongofachilles #audiobook #booktok #madelinemiller #achilles #patroclus #troy #thetis #books #reading #achillesandpatroclus #circe #TakingCareOfBiz #JamieMovie #greekmythology #romance #lgbt #trojanwar #menelaus #helenofsparta #helenoftroy #quotes";
      window.ANNEX_VIDEOS[29].date = "21 septembre 2021";
      window.ANNEX_VIDEOS[29].link = "https://www.tiktok.com/@regulusshow/video/7010464790241905925";
    }

    if (window.ANNEX_VIDEOS[30]) {
      window.ANNEX_VIDEOS[30].user = "@urfrenchreader";
      window.ANNEX_VIDEOS[30].description =
        "Oups, je me sens légèrement dépassée par les évènements… #booktok #thesongofachilles #lechantdachille #trend #booktokfrance #livre #addiction";
      window.ANNEX_VIDEOS[30].date = "9 mai 2023";
      window.ANNEX_VIDEOS[30].link = "https://www.tiktok.com/@urfrenchreader/video/7231114005463485722";
    }

    if (window.ANNEX_VIDEOS[31]) {
      window.ANNEX_VIDEOS[31].user = "@harpercollins";
      window.ANNEX_VIDEOS[31].description =
        "Get ready to fall in love with autumn's coziest reads! 🍁☕ These new spicy romances are packed with all your favorite tropes—from grumpy x sunshine and forced proximity to small-town charm and opposites attract. Perfect for fans of Gilmore Girls vibes, Hannah Grace, Tessa Bailey, and Ali Hazelwood! 🧡 #fall #bookrecs #romancebooks #reading #tbr";
      window.ANNEX_VIDEOS[31].date = "26 août 2025";
      window.ANNEX_VIDEOS[31].link = "https://www.tiktok.com/@harpercollins/video/7543005432453795102";
    }

    if (window.ANNEX_VIDEOS[32]) {
      window.ANNEX_VIDEOS[32].user = "@hachettefrance";
      window.ANNEX_VIDEOS[32].description =
        "Mythologie, romance, sorcières, secrets, trahison... On vous a convaincu de lire Witch and God de Liv Stone (@editions_bmr) 😉? #booktok #booktokfrance #bookaddict #romance #greekmythology #witchandgod";
      window.ANNEX_VIDEOS[32].date = "22 juillet 2022";
      window.ANNEX_VIDEOS[32].link = "https://www.tiktok.com/@hachettefrance/video/7123234196214107397";
    }

    if (window.ANNEX_VIDEOS[33]) {
      window.ANNEX_VIDEOS[33].user = "@alex.aster";
      window.ANNEX_VIDEOS[33].description =
        "You can preorder Lightlark now! #booktok #bookstan #yabooks #lightlark #dreambig #bigdreams #authorsoftiktok #authortok";
      window.ANNEX_VIDEOS[33].date = "20 avril 2022";
      window.ANNEX_VIDEOS[33].link = "https://www.tiktok.com/@alex.aster/video/7088723397986815274";
    }

    if (window.ANNEX_VIDEOS[34]) {
      window.ANNEX_VIDEOS[34].user = "@alex.aster";
      window.ANNEX_VIDEOS[34].description =
        "Maybe… news soon? #lightlark #nightbane #skyshade #booktok #bookish";
      window.ANNEX_VIDEOS[34].date = "27 juin 2024";
      window.ANNEX_VIDEOS[34].link = "https://www.tiktok.com/@alex.aster/video/7384981838500056363";
    }

    if (window.ANNEX_VIDEOS[35]) {
      window.ANNEX_VIDEOS[35].user = "@alex.aster";
      window.ANNEX_VIDEOS[35].description =
        "It’s called Lightlark #booktok #bookstan #bookclub #yabooks #books";
      window.ANNEX_VIDEOS[35].date = "13 mars 2021";
      window.ANNEX_VIDEOS[35].link = "https://www.tiktok.com/@alex.aster/video/6939242279056035077";
    }

    if (window.ANNEX_VIDEOS[36]) {
      window.ANNEX_VIDEOS[36].user = "@alex.aster";
      window.ANNEX_VIDEOS[36].description =
        "Nightbane is almost here, you can preorder anywhere now to get a first edition";
      window.ANNEX_VIDEOS[36].date = "18 septembre 2023";
      window.ANNEX_VIDEOS[36].link = "https://www.tiktok.com/@alex.aster/video/7279929223307939115";
    }

    if (window.ANNEX_VIDEOS[37]) {
      window.ANNEX_VIDEOS[37].user = "@alex.aster";
      window.ANNEX_VIDEOS[37].description =
        "And you get 6 character page overlays if you preorder Lightlark now! #booktok #booktropes #yabooks #readingrecs #reader #lightlark #bookclub";
      window.ANNEX_VIDEOS[37].date = "18 juin 2022";
      window.ANNEX_VIDEOS[37].link = "https://www.tiktok.com/@alex.aster/video/7110335669578370346";
    }

    if (window.ANNEX_VIDEOS[38]) {
      window.ANNEX_VIDEOS[38].user = "@avina.stgraves";
      window.ANNEX_VIDEOS[38].description =
        "#BookTok#darkromance#paranormalromance#demonromance Book: Eldridth Manor by Leigh Rivers & Avina St. Graves @Author Leigh Rivers";
      window.ANNEX_VIDEOS[38].date = "25 septembre 2025";
      window.ANNEX_VIDEOS[38].link = "https://www.tiktok.com/@avina.stgraves/video/7554132538508332295";
    }

    if (window.ANNEX_VIDEOS[39]) {
      window.ANNEX_VIDEOS[39].user = "@authordanielletasma";
      window.ANNEX_VIDEOS[39].description =
        "you fall in love with characters, scenes, the story 😫💌 #booktok #writing #writer #fyp #romanceseries";
      window.ANNEX_VIDEOS[39].date = "22 septembre 2025";
      window.ANNEX_VIDEOS[39].link = "https://www.tiktok.com/@authordanielletasma/video/7552779110485871904";
    }

    if (window.ANNEX_VIDEOS[40]) {
      window.ANNEX_VIDEOS[40].user = "@esmeinghamreads";
      window.ANNEX_VIDEOS[40].description =
        "You’re* FANTASY-ROMANCE. Wow. Writing a book is a FULL time job. ⚔️❤️‍🩹 #writer #BookTok";
      window.ANNEX_VIDEOS[40].date = "6 novembre 2025";
      window.ANNEX_VIDEOS[40].link = "https://www.tiktok.com/@esmeinghamreads/video/7569646928498003222";
    }

    if (window.ANNEX_VIDEOS[41]) {
      window.ANNEX_VIDEOS[41].user = "@haleypham";
      window.ANNEX_VIDEOS[41].description =
        "More behind the scenes from writing the book that I’ve been waiting to share! 🌟";
      window.ANNEX_VIDEOS[41].date = "7 novembre 2025";
      window.ANNEX_VIDEOS[41].link = "https://www.tiktok.com/@haleypham/video/7570015721313275191?";
    }

    if (window.ANNEX_VIDEOS[42]) {
      window.ANNEX_VIDEOS[42].user = "@kherryslife";
      window.ANNEX_VIDEOS[42].description =
        "Updated version of Ana Huang books i own! #BookTok #bookish #bookworm #anahuang #twistedseries #twistedlies #twistedlove #twistedhate #twistedgames #reader #literature";
      window.ANNEX_VIDEOS[42].date = "16 décembre 2023";
      window.ANNEX_VIDEOS[42].link = "https://www.tiktok.com/@kherryslife/video/7313300757606927649";
    }

    if (window.ANNEX_VIDEOS[43]) {
      window.ANNEX_VIDEOS[43].user = "@coralieslibrary";
      window.ANNEX_VIDEOS[43].description =
        "Cant stop wont stop collecting pretty/special editions of the books i love ☺️🩷 #booktok #books #bookworm #bookrecommendations #twistedseries#anahuang";
      window.ANNEX_VIDEOS[43].date = "2 février 2024";
      window.ANNEX_VIDEOS[43].link = "https://www.tiktok.com/@coralieslibrary/video/7331046008673062149";
    }

    if (window.ANNEX_VIDEOS[44]) {
      window.ANNEX_VIDEOS[44].user = "@stellaloveswarner";
      window.ANNEX_VIDEOS[44].description =
        "you must be haunting me. #Darkromance #BookTok #booktoker #viral #fyp> #fictionalmen #Carnival #devilsnightseries #hauntingadeline";
      window.ANNEX_VIDEOS[44].date = "27 février 2025";
      window.ANNEX_VIDEOS[44].link = "https://www.tiktok.com/@stellaloveswarner/video/7476161616216591639";
    }

    if (window.ANNEX_VIDEOS[45]) {
      window.ANNEX_VIDEOS[45].user = "@angel.ofire";
      window.ANNEX_VIDEOS[45].description =
        "Bcs it makes her feel alive 🖤 #booktok #aesthetic #reading #darkromance";
      window.ANNEX_VIDEOS[45].date = "7 août 2025";
      window.ANNEX_VIDEOS[45].link = "https://www.tiktok.com/@angel.ofire/video/7535911771803045142";
    }

    if (window.ANNEX_VIDEOS[46]) {
      window.ANNEX_VIDEOS[46].user = "@f1xbook";
      window.ANNEX_VIDEOS[46].description =
        "Sing if you have read 📚 #booktok #books #foryoupage #fyp #shatterme #colleenhoover #twistedseries #foryou";
      window.ANNEX_VIDEOS[46].date = "10 février 2023";
      window.ANNEX_VIDEOS[46].link = "https://www.tiktok.com/@f1xbook/video/7198604139549527301";
    }

    if (window.ANNEX_VIDEOS[47]) {
      window.ANNEX_VIDEOS[47].user = "@cassiesbooktok";
      window.ANNEX_VIDEOS[47].description =
        "Some recs #booktok #bookrecs #bookish #bookworm #foryou";
      window.ANNEX_VIDEOS[47].date = "22 février 2024";
      window.ANNEX_VIDEOS[47].link = "https://www.tiktok.com/@cassiesbooktok/video/7338194698655386885";
    }

    if (window.ANNEX_VIDEOS[48]) {
      window.ANNEX_VIDEOS[48].user = "@aimeetea_reads";
      window.ANNEX_VIDEOS[48].description =
        "am I booktoker after all?😭 #booktok #reading #bookgirlies #books #bookrecs";
      window.ANNEX_VIDEOS[48].date = "11 octobre 2025";
      window.ANNEX_VIDEOS[48].link = "https://www.tiktok.com/@aimeetea_reads/video/7560046395995229442";
    }

    if (window.ANNEX_VIDEOS[49]) {
      window.ANNEX_VIDEOS[49].user = "@irena_twin";
      window.ANNEX_VIDEOS[49].description =
        "Dark romance 🖤🥀 #darkacademia #darkromance #books #pinterest #darkaesthetic";
      window.ANNEX_VIDEOS[49].date = "28 août 2025";
      window.ANNEX_VIDEOS[49].link = "https://www.tiktok.com/@irena_twin/video/7543566376003226888";
    }

    if (window.ANNEX_VIDEOS[50]) {
      window.ANNEX_VIDEOS[50].user = "@lovingautumnnn";
      window.ANNEX_VIDEOS[50].description =
        "#DARKACADEMIA ➻❥ i adore the aesthetic of both of these #thesecrethistory #ifwewerevillains #richardpapen #olivermarks #booktok #CapCut #bookaesthetic #edit #fyp #foryou #autumn #darkacademia";
      window.ANNEX_VIDEOS[50].date = "12 août 2023";
      window.ANNEX_VIDEOS[50].link = "https://www.tiktok.com/@lovingautumnnn/video/7266512319948115206";
    }

    if (window.ANNEX_VIDEOS[51]) {
      window.ANNEX_VIDEOS[51].user = "@livvs.reads";
      window.ANNEX_VIDEOS[51].description =
        "#darkromance #darkromancebooks #darkromancereads #darkromancebooktok #book #booktok #books #bookclub #booktoker #bookrecs #smut #smutrecs #smuttbookrecs #smutbook #smutbooktok #smuttiktok #smuttok #spicybooktok #spicybookrecs #spicybooktok📚 #spicybook #spicybooksoftictok #spicyreads #spicyrecs #steamybooks #steamyreads #steamybooktok #steamybookrecs #steamyromancebooks #steamybook #steamyromanceaddict #romancebooks #romancebooktok #romancebookrecs";
      window.ANNEX_VIDEOS[51].date = "14 août 2022";
      window.ANNEX_VIDEOS[51].link = "https://www.tiktok.com/@livvs.reads/video/7131599507736825089";
    }

    if (window.ANNEX_VIDEOS[52]) {
      window.ANNEX_VIDEOS[52].user = "@michelle.staiger";
      window.ANNEX_VIDEOS[52].description =
        "we fall in love again and again… #BookTok #reading #booksbooksbooks #romantasy #michellestaiger";
      window.ANNEX_VIDEOS[52].date = "23 septembre 2025";
      window.ANNEX_VIDEOS[52].link = "https://www.tiktok.com/@michelle.staiger/video/7553363129883774230";
    }

    if (window.ANNEX_VIDEOS[53]) {
      window.ANNEX_VIDEOS[53].user = "@majaicalreads";
      window.ANNEX_VIDEOS[53].description =
        "Because in the end, that’s what reading is all about 🥹 #booktok #fantasy #romantasy #fallinloveagain #bookreaction";
      window.ANNEX_VIDEOS[53].date = "20 septembre 2025";
      window.ANNEX_VIDEOS[53].link = "https://www.tiktok.com/@majaicalreads/video/7552236964703915286";
    }

    if (window.ANNEX_VIDEOS[54]) {
      window.ANNEX_VIDEOS[54].user = "@clarissebook";
      window.ANNEX_VIDEOS[54].description =
        "#book #fallinloveagain #trend #booktok #romange";
      window.ANNEX_VIDEOS[54].date = "24 septembre 2025";
      window.ANNEX_VIDEOS[54].link = "https://www.tiktok.com/@clarissebook/video/7553703857679879446";
    }

    if (window.ANNEX_VIDEOS[55]) {
      window.ANNEX_VIDEOS[55].user = "@dari_reads";
      window.ANNEX_VIDEOS[55].description =
        "i love this book❤️ #booktok #fy #foryou #fyp #fyfyfyfy #viral #reading #book #aesthetic #inlovewiththisbook #itendswithus";
      window.ANNEX_VIDEOS[55].date = "4 janvier 2023";
      window.ANNEX_VIDEOS[55].link = "https://www.tiktok.com/@dari_reads/video/7184833277000174853";
    }

    if (window.ANNEX_VIDEOS[56]) {
      window.ANNEX_VIDEOS[56].user = "@athinaeditz";
      window.ANNEX_VIDEOS[56].description =
        "just read the book and I'm fully impressed  #itendswithus #itendswithusbook #colleenhoover #lilybloom #atlascorrigan #itstopshereitendswithus #rylekincaid #edit #fypシ #booktok #viral #4upageシ #fyp #fypage #fyppppppppppppppppppppppp #fypsounds #fypp #fypdongggggggg #foryoupage #foryoupageofficiall #athinaeditz #book";
      window.ANNEX_VIDEOS[56].date = "2 janvier 2023";
      window.ANNEX_VIDEOS[56].link = "https://www.tiktok.com/@athinaeditz/video/7183986966147468550";
    }

    if (window.ANNEX_VIDEOS[57]) {
      window.ANNEX_VIDEOS[57].user = "@kirstyyreads";
      window.ANNEX_VIDEOS[57].description =
        "did anyone elses book obsession also start with this book 😅 #fyp #booktok #bookworm #books #booklover #bookish #reading #booktoker #bookrecs #bookrecommendations #bookclub #itendswithus #itendswithusbook #colleenhoover #colleenhooverbooks";
      window.ANNEX_VIDEOS[57].date = "19 avril 2024";
      window.ANNEX_VIDEOS[57].link = "https://www.tiktok.com/@kirstyyreads/video/7359548801830391072";
    }

    if (window.ANNEX_VIDEOS[58]) {
      window.ANNEX_VIDEOS[58].user = "@itskatebeckett";
      window.ANNEX_VIDEOS[58].description =
        "dark academia fall aesthetic 🍂 #darkacademiaaesthetic #darkacademiaoutfits #darkacademiavibes #darkacademia #darkacademiafashion #autumn #autumnvibes #autumnaesthetic #fallaesthetic #fallvibes🍂 #darkfall #darkaesthetic #pinterestaesthetic #moodboard #fallmoodboard #fyp #foryou";
      window.ANNEX_VIDEOS[58].date = "30 juin 2025";
      window.ANNEX_VIDEOS[58].link = "https://www.tiktok.com/@itskatebeckett/video/7521776539239746838";
    }

    if (window.ANNEX_VIDEOS[59]) {
      window.ANNEX_VIDEOS[59].user = "@antiquariant";
      window.ANNEX_VIDEOS[59].description =
        "I cannot imagine a life without books. Please tell me what you are currently reading. 💼☕️ #darkacademia #deadpoetssociety #autumnaesthetic #dostoyevski #history #historyaesthetic #literature #goldenbrown #blackcoffee #oddities #vintage #vintagehomedecor #fyp #foryou #victorian #oldbooks #donnatartt #taxidermy #fall #gothic #gothicvictorian #vintagefashion #bobliofile #bookcollector #booktok #antiquefurniture #darkvictorian #candles";
      window.ANNEX_VIDEOS[59].date = "4 août 2025";
      window.ANNEX_VIDEOS[59].link = "https://www.tiktok.com/@antiquariant/video/7534685562343640342";
    }

    if (window.ANNEX_VIDEOS[60]) {
      window.ANNEX_VIDEOS[60].user = "@libraryofscarletletters";
      window.ANNEX_VIDEOS[60].description =
        "One word to describe this  book: heart-wrenching #babel #rfkuang #darkacademia #bookaesthetic";
      window.ANNEX_VIDEOS[60].date = "20 juin 2023";
      window.ANNEX_VIDEOS[60].link = "https://www.tiktok.com/@libraryofscarletletters/video/7246618819710471429";
    }

    if (window.ANNEX_VIDEOS[61]) {
      window.ANNEX_VIDEOS[61].user = "@av.jackie";
      window.ANNEX_VIDEOS[61].description =
        "This part had me screaming🫠😫Now this is enemies to lovers😫 #judeduarte #cardangreenbriar #thecruelprince #thewickedking #thecruelprincehollyblack #thefolkoftheair #jude #cardan #hollyblack #booktokfyp #booktok #enemiestolovers #bookquotes #bookscenes #bookrecs #fantasy #fyp #bookrecommendations #bookish";
      window.ANNEX_VIDEOS[61].date = "27 mars 2024";
      window.ANNEX_VIDEOS[61].link = "https://www.tiktok.com/@av.jackie/video/7350839534935887146";
    }

    if (window.ANNEX_VIDEOS[62]) {
      window.ANNEX_VIDEOS[62].user = "@anissaow";
      window.ANNEX_VIDEOS[62].description =
        "bref 😩 #fypシ #booktok #pourtoi #enemiestolovers";
      window.ANNEX_VIDEOS[62].date = "6 janvier 2022";
      window.ANNEX_VIDEOS[62].link = "https://www.tiktok.com/@anissaow/video/7050112604731149573";
    }

    if (window.ANNEX_VIDEOS[63]) {
      window.ANNEX_VIDEOS[63].user = "@dutchmelrose";
      window.ANNEX_VIDEOS[63].description =
        "Replying to @Tabbi IYKYK 👀 #darkromance #booktok #dutchmelrose #runrunrun";
      window.ANNEX_VIDEOS[63].date = "14 septembre 2025";
      window.ANNEX_VIDEOS[63].link = "https://www.tiktok.com/@dutchmelrose/video/7550010502076730679";
    }

    if (window.ANNEX_VIDEOS[64]) {
      window.ANNEX_VIDEOS[64].user = "@av.jackie";
      window.ANNEX_VIDEOS[64].description =
        "Kai raised the bar high😫 #kaiazer #paedyngray #powerless #laurenroberts #booktok #booktokfyp #bookquotes #bookscenes #bookrecommendations #bookrecs #bookcommunity #books #fantasy #romance";
      window.ANNEX_VIDEOS[64].date = "24 mai 2024";
      window.ANNEX_VIDEOS[64].link = "https://www.tiktok.com/@av.jackie/video/7372425691020971310";
    }

    if (window.ANNEX_VIDEOS[65]) {
      window.ANNEX_VIDEOS[65].user = "@aminasnotokay";
      window.ANNEX_VIDEOS[65].description =
        "mother mafi the only one to ever do it!! every spiral of fate is out tomorrow i could cry (i am crying)";
      window.ANNEX_VIDEOS[65].date = "30 septembre 2025";
      window.ANNEX_VIDEOS[65].link = "https://www.tiktok.com/@aminasnotokay/video/7555696641613892894";
    }

    if (window.ANNEX_VIDEOS[66]) {
      window.ANNEX_VIDEOS[66].user = "@iggylu";
      window.ANNEX_VIDEOS[66].description =
        "Hot. #zademeadows #hauntingadeline #booktok #fyp #goviral #book";
      window.ANNEX_VIDEOS[66].date = "3 janvier 2025";
      window.ANNEX_VIDEOS[66].link = "https://www.tiktok.com/@iggylu/video/7455815175623544097";
    }

    if (window.ANNEX_VIDEOS[67]) {
      window.ANNEX_VIDEOS[67].user = "@elismrsking";
      window.ANNEX_VIDEOS[67].description =
        "Giggling rn #hauntingadeline #zademeadows #adelinereilly #foryoupage #fyp #foryou #bookish #books #booktok #bookgirl #reading #romance #fictional #darkromance";
      window.ANNEX_VIDEOS[67].date = "2 décembre 2023";
      window.ANNEX_VIDEOS[67].link = "https://www.tiktok.com/@elismrsking/video/7307832841071529249";
    }

    if (window.ANNEX_VIDEOS[68]) {
      window.ANNEX_VIDEOS[68].user = "@dutchmelrose";
      window.ANNEX_VIDEOS[68].description =
        "IYKYK 👀 the mirror scene all makes sense now #hauntingadeline #zademeadows #darkromance";
      window.ANNEX_VIDEOS[68].date = "7 août 2025";
      window.ANNEX_VIDEOS[68].link = "https://www.tiktok.com/@dutchmelrose/video/7535908563256888589";
    }

    if (window.ANNEX_VIDEOS[69]) {
      window.ANNEX_VIDEOS[69].user = "@thatdreamydoll";
      window.ANNEX_VIDEOS[69].description =
        "run little mouse. #fyp #explore #explorepage #zademeadows #zademeadowsedits #hauntingadeline #huntingadeline #maskedmen #catandmouseduet #bookporn #booktok #bookgirlies #adeline #darkromance #darkromancelovers #darkromancebook #smut";
      window.ANNEX_VIDEOS[69].date = "1 septembre 2024";
      window.ANNEX_VIDEOS[69].link = "https://www.tiktok.com/@thatdreamydoll/video/7409643600021163272";
    }

    if (window.ANNEX_VIDEOS[70]) {
      window.ANNEX_VIDEOS[70].user = "@veiledvice";
      window.ANNEX_VIDEOS[70].description =
        "Surprise🥀 #darkromance #zademeadows #hauntingadeline #huntingadeline #spicybooktok #darkromancebooktok #masktok #booktokgirlies #maskedmen";
      window.ANNEX_VIDEOS[70].date = "24 décembre 2024";
      window.ANNEX_VIDEOS[70].link = "https://www.tiktok.com/@veiledvice/video/7451750045013118216";
    }

    if (window.ANNEX_VIDEOS[71]) {
      window.ANNEX_VIDEOS[71].user = "@tati.booktok";
      window.ANNEX_VIDEOS[71].description =
        "#hauntingadeline #darkromance #bookrecommendations #rec";
      window.ANNEX_VIDEOS[71].date = "19 mai 2025";
      window.ANNEX_VIDEOS[71].link = "https://www.tiktok.com/@tati.booktok/video/7506060025958354181";
    }

    if (window.ANNEX_VIDEOS[72]) {
      window.ANNEX_VIDEOS[72].user = "@sweetie2566yt";
      window.ANNEX_VIDEOS[72].description =
        "Haunting Adeline | HAUNTED by @H. D. Carlton full video: youtube sweetie2566 #hauntingadeline #huntingadeline #booktok #books #zademeadows #adelinereilly #foryou #fyp #foryoupage";
      window.ANNEX_VIDEOS[72].date = "13 mars 2024";
      window.ANNEX_VIDEOS[72].link = "https://www.tiktok.com/@sweetie2566yt/video/7345623727712914720";
    }

    if (window.ANNEX_VIDEOS[73]) {
      window.ANNEX_VIDEOS[73].user = "@emvxrse";
      window.ANNEX_VIDEOS[73].description =
        "i loved the sms era between them | scp @𝖇𝖔𝖇𝖇𝖎 ✰ / ae.torrance #hauntingadeline #zademeadows #adelinereilly #viral #fyp #huntingadeline #booktok  @✟ @𝓃𝒶𝓎𝒶𝒽";
      window.ANNEX_VIDEOS[73].date = "13 mars 2025";
      window.ANNEX_VIDEOS[73].link = "https://www.tiktok.com/@emvxrse/video/7481412375573204246";
    }

    if (window.ANNEX_VIDEOS[74]) {
      window.ANNEX_VIDEOS[74].user = "@.minareads";
      window.ANNEX_VIDEOS[74].description =
        "crazy. #fyp #saawareness #booktok #reading #hauntingadeline #bookish #sa";
      window.ANNEX_VIDEOS[74].date = "14 février 2025";
      window.ANNEX_VIDEOS[74].link = "https://www.tiktok.com/@.minareads/video/7471297579112860950";
    }

    if (window.ANNEX_VIDEOS[75]) {
      window.ANNEX_VIDEOS[75].user = "@distresseddame";
      window.ANNEX_VIDEOS[75].description =
        "you’ve lost your head #hauntingadeline #BookTok #fy #booktokfyp #hdcarlton #romancebooks #viral #bookish #fantasybook #bookishhumor #fypage #booktoker #bookishthings  #enemiestolovers";
      window.ANNEX_VIDEOS[75].date = "21 août 2024";
      window.ANNEX_VIDEOS[75].link = "https://www.tiktok.com/@distresseddame/video/7405354012750499102";
    }

    if (window.ANNEX_VIDEOS[76]) {
      window.ANNEX_VIDEOS[76].user = "@sincerelyamandas";
      window.ANNEX_VIDEOS[76].description =
        "two very different things, if i do say so myself #books #booktok #reader #bookrecommendations #bookish #romancebooks #darkromancebooks #darkromancereads #hauntingadeline #darkromance #spicybooks";
      window.ANNEX_VIDEOS[76].date = "16 juin 2025";
      window.ANNEX_VIDEOS[76].link = "https://www.tiktok.com/@sincerelyamandas/video/7516558064338750750";
    }

    if (window.ANNEX_VIDEOS[77]) {
      window.ANNEX_VIDEOS[77].user = "@tcnhs_";
      window.ANNEX_VIDEOS[77].description =
        "Me too Addie, me too.. #capcut #template #hauntingadeline #huntingadeline #adeline #zade #zademeadows #zaddy #chapter29 #29 #mirror";
      window.ANNEX_VIDEOS[77].date = "16 mars 2024";
      window.ANNEX_VIDEOS[77].link = "https://www.tiktok.com/@tcnhs_/video/7346947092968967457";
    }

    if (window.ANNEX_VIDEOS[78]) {
      window.ANNEX_VIDEOS[78].user = "@boundlessbookshel";
      window.ANNEX_VIDEOS[78].description =
        "Adeline ❤️‍🔥 #huntingadeline #hauntingadeline #hdcarlton #hdcarltonauthor #hdcarltonbooks #booksbooksbooks #booktok #darkromance #romance #adeline #zademeadows #book #books #fyp #fy #fyy";
      window.ANNEX_VIDEOS[78].date = "21 octobre 2024";
      window.ANNEX_VIDEOS[78].link = "https://www.tiktok.com/@boundlessbookshel/video/7428168937809906976";
    }

    if (window.ANNEX_VIDEOS[79]) {
      window.ANNEX_VIDEOS[79].user = "@marissa.booktok";
      window.ANNEX_VIDEOS[79].description =
        "Willing or unwilling the scenes will be recreated 😏 #bookishhumor #darkromance #bookish #maskedmen #booktok";
      window.ANNEX_VIDEOS[79].date = "6 juillet 2025";
      window.ANNEX_VIDEOS[79].link = "https://www.tiktok.com/@marissa.booktok/video/7523744968394001695";
    }

    if (window.ANNEX_VIDEOS[80]) {
      window.ANNEX_VIDEOS[80].user = "@nafeesaxbilal";
      window.ANNEX_VIDEOS[80].description =
        "How beautiful is parsons manor 🖤 #hautingadeline #huntingadeline #catandmouseduet #adelinereilly #zademeadows #bookboyfriend #hdcarlton #booktok #bookgirlies #fanart #fyp #fypシ゚viral #🖤🥀 #🌹 #darkromance #darkromancebooks #littlemouse #📚";
      window.ANNEX_VIDEOS[80].date = "10 mars 2024";
      window.ANNEX_VIDEOS[80].link = "https://www.tiktok.com/@nafeesaxbilal/video/7344847314546068768";
    }

    if (window.ANNEX_VIDEOS[81]) {
      window.ANNEX_VIDEOS[81].user = "@milliereads033";
      window.ANNEX_VIDEOS[81].description =
        "I said what I said. #booktok #zademeadows #hauntingadeline #huntingadeline #hdcarlton #catandmouseduet #darkromance #darkromancebooks #bookrec";
      window.ANNEX_VIDEOS[81].date = "7 mars 2025";
      window.ANNEX_VIDEOS[81].link = "https://www.tiktok.com/@milliereads033/video/7479138940772109590";
    }

    if (window.ANNEX_VIDEOS[82]) {
      window.ANNEX_VIDEOS[82].user = "@corndawgmami";
      window.ANNEX_VIDEOS[82].description =
        "and it opened a whole new world. #fyp #darkromance #booktok #bookish #hauntingadeline #zademeadows";
      window.ANNEX_VIDEOS[82].date = "27 avril 2025";
      window.ANNEX_VIDEOS[82].link = "https://www.tiktok.com/@corndawgmami/video/7497764933485219118";
    }










  });
});

/* ============================================================
   SAFETY NET — FERMETURE MODALE VIDÉO (iOS ULTIME)
   ============================================================ */

document.addEventListener(
  "click",
  (e) => {
    const modal = document.getElementById("video-modal");
    const box = document.querySelector(".video-modal-content");
    const closeBtn = document.getElementById("video-modal-close");

    if (!modal || modal.classList.contains("hidden")) return;

    // clic sur le X
    if (closeBtn && closeBtn.contains(e.target)) {
      modal.classList.add("hidden");
    }

    // clic hors de la box
    if (box && !box.contains(e.target)) {
      modal.classList.add("hidden");
    }

    const player = document.getElementById("video-modal-player");
    if (player) {
      player.pause();
      player.currentTime = 0;
    }
  },
  true // 🔥 CAPTURE = AVANT TOUS LES AUTRES LISTENERS
);


const tocMobileList = document.getElementById("toc-mobile-list");

if (tocMobileList) {

  // Sections fixes
  const fixedSections = [
    { id: "hero", label: "Accueil" },
    { id: "avant-propos", label: "Avant-propos" },
    { id: "introduction", label: "Introduction" }
  ];

  fixedSections.forEach(sec => {
    const li = document.createElement("li");
    li.textContent = sec.label;
    li.dataset.target = sec.id;
    li.classList.add("toc-main");
    tocMobileList.appendChild(li);
  });

  // Chapitres (h2)
  document.querySelectorAll("h2.chapter-title").forEach(h2 => {
    const section = h2.closest("section");
    if (!section || !section.id) return;

    const li = document.createElement("li");
    li.textContent = h2.textContent.replace(/\s+/g, " ").trim();
    li.dataset.target = section.id;
    li.classList.add("toc-chapter");
    tocMobileList.appendChild(li);

    // Sous-titres (h3)
    section.querySelectorAll("h3[id]").forEach(h3 => {
      const sub = document.createElement("li");
      sub.textContent = h3.textContent.replace(/\s+/g, " ").trim();
      sub.dataset.target = h3.id;
      sub.classList.add("toc-sub");
      tocMobileList.appendChild(sub);
    });
  });

  // Sections finales
  // Sections finales
["conclusion", "bibliographie", "annexes", "remerciements"].forEach(id => {
  const section = document.getElementById(id);
  if (!section) return;

  const rawText = section.querySelector("h2, h3")?.textContent || id;

  // 🔥 majuscule uniquement sur la première lettre
  const label = rawText.charAt(0).toUpperCase() + rawText.slice(1);

  const li = document.createElement("li");
  li.textContent = label;
  li.dataset.target = id;
  li.classList.add("toc-main");
  tocMobileList.appendChild(li);
});

}

// ============================================================
// SOMMAIRE MOBILE — SIMPLE & FIABLE
// ============================================================

(function tocMobileSimple() {
  const handle = document.getElementById("toc-handle");
  const tocMobile = document.getElementById("toc-mobile");
  const list = document.getElementById("toc-mobile-list");

  if (!handle || !tocMobile || !list) return;

  // ouvrir
  handle.addEventListener("click", (e) => {
    if (window.innerWidth > 900) return;
    e.preventDefault();
    tocMobile.classList.remove("hidden");
  });

  // navigation + fermeture
  list.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-target]");
    if (!li) return;

    const id = li.dataset.target;
    const target = document.getElementById(id);
    if (!target) return;

    const y = window.scrollY + target.getBoundingClientRect().top - 40;
    window.scrollTo({ top: y, behavior: "smooth" });

    tocMobile.classList.add("hidden");
  });

  // clic hors panneau = fermer
  tocMobile.addEventListener("click", (e) => {
    if (e.target === tocMobile) {
      tocMobile.classList.add("hidden");
    }
  });

  // ESC = fermer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      tocMobile.classList.add("hidden");
    }
  });
})();
