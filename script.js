/* ============================================================
   VARIABLES GLOBALES
   ============================================================ */

let currentIndex = 0;
let isOverride = false;

const STORAGE_KEY = "memoire_highlights_v2"; // nouvelle clé propre

const scrollArea = document.getElementById("memoire-left");



/* =========================================== */
/*   NOUVEAU SOMMAIRE — SLIDE PANEL            */
/* =========================================== */

const tocHandle = document.getElementById("toc-handle");
const tocOverlay = document.getElementById("toc-overlay");

if (tocHandle && tocOverlay) {
    // ouvrir
    tocHandle.addEventListener("click", () => {
        tocOverlay.classList.add("open");
        document.body.classList.add("toc-open"); // 🔥 NOUVELLE LIGNE
    });

    // click sur titres dans le panneau
    document.querySelectorAll('#toc-overlay [data-target]').forEach(item => {
        item.addEventListener("click", () => {
            const id = item.getAttribute("data-target");
            const section = document.getElementById(id);
            if (!section) return;

            const y = window.scrollY + section.getBoundingClientRect().top - 40;
            window.scrollTo({ top: y, behavior: "smooth" });

            tocOverlay.classList.remove("open");
            document.body.classList.remove("toc-open"); // 🔥 NOUVELLE LIGNE
        });
    });

    // fermer quand on clique en dehors du panneau
    document.addEventListener("click", (e) => {
        if (tocOverlay.classList.contains("open")) {
            if (!e.target.closest(".toc-panel") && !e.target.closest("#toc-handle")) {
                tocOverlay.classList.remove("open");
                document.body.classList.remove("toc-open"); // 🔥 NOUVELLE LIGNE
            }
        }
    });
}

const fullpage = document.getElementById("fullpage");

document.querySelectorAll('#toc-overlay [data-target]').forEach(item => {
    item.addEventListener("click", () => {
        const id = item.getAttribute("data-target");
        const section = document.getElementById(id);
        if (!section) return;

        const isInFullpage = fullpage.contains(section);

        if (isInFullpage) {
            // 🔥 scroll dans le conteneur fullscreen
            fullpage.scrollTo({
                top: section.offsetTop,
                behavior: "smooth"
            });
        } else {
            // 🔥 scroll normal dans la page
            const y = window.scrollY + section.getBoundingClientRect().top - 40;
            window.scrollTo({ top: y, behavior: "smooth" });
        }

        tocOverlay.classList.remove("open");
        document.body.classList.remove("toc-open");
    });
});




/* ============================================================
   NOTES DE BAS DE PAGE : BULLE
   ============================================================ */

const notePopup = document.getElementById("note-popup");

function initNotes() {
    const notes = document.querySelectorAll("sup[data-note]");

    notes.forEach(note => {
        // on nettoie d'éventuels anciens handlers
        note.onmouseenter = null;
        note.onmouseleave = null;

        note.addEventListener("mouseenter", () => {
            const content = note.getAttribute("data-note");
            notePopup.innerHTML = content;

            const rect = note.getBoundingClientRect();
            notePopup.style.top = (rect.top + window.scrollY - 22) + "px";
            notePopup.style.left = (rect.right + window.scrollX + 100) + "px";

            notePopup.classList.add("visible");
        });

        note.addEventListener("mouseleave", () => {
            notePopup.classList.remove("visible");
        });
    });
}

// Fermer les notes en scrollant la colonne gauche
document.getElementById("memoire-left").addEventListener("scroll", () => {
    notePopup.classList.remove("visible");
});


/* ============================================================
   VIDÉO DANS L’IPHONE
   ============================================================ */

const iphoneScreen = document.getElementById("iphone-screen");
const mainVideo   = document.getElementById("iphone-video");
const iphoneWrapper = document.getElementById("iphone-wrapper"); // ← NOUVELLE LIGNE


// Liens cliquables éventuels (tu peux en avoir plus tard)
const videoLinks = document.querySelectorAll(".video-link");

videoLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const url = link.getAttribute("data-video");
        iphoneScreen.innerHTML = `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
    });
});


/* ============================================================
   FULLSCREEN VIDEO
   ============================================================ */

const fullscreenBtn = document.getElementById("fullscreen");

fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        mainVideo.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

mainVideo.addEventListener("fullscreenchange", () => {
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


/* ============================================================
   PLAYLIST AUTOMATIQUE
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
currentIndex = 0;
mainVideo.src = playlist[currentIndex];
mainVideo.play();

mainVideo.addEventListener("ended", () => {
    if (isOverride) return; // si on est en mode "vidéo spéciale", on ne touche pas
    currentIndex = (currentIndex + 1) % playlist.length;
    mainVideo.src = playlist[currentIndex];
    mainVideo.play();
});


/* ============================================================
   CONTROLES SUIVANT / PRECEDENT
   ============================================================ */

const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

nextBtn.addEventListener("click", () => {
    isOverride = false;
    iphoneWrapper.classList.remove("glow");   // <<< AJOUT

    mainVideo.onended = null; // on enlève un éventuel handler spécial

    currentIndex = (currentIndex + 1) % playlist.length;
    mainVideo.src = playlist[currentIndex];
    mainVideo.currentTime = 0;
    mainVideo.play();
});

prevBtn.addEventListener("click", () => {
    isOverride = false;
    iphoneWrapper.classList.remove("glow");   // <<< AJOUT

    mainVideo.onended = null;

    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    mainVideo.src = playlist[currentIndex];
    mainVideo.currentTime = 0;
    mainVideo.play();
});


/* ============================================================
   (NOUVEAU) — HOVER -> VIDÉO SPÉCIALE
   ============================================================ */

function initVideoTriggers() {
    const triggers = document.querySelectorAll(".video-trigger");

    triggers.forEach(trigger => {
        // on nettoie l'ancien handler
        trigger.onmouseenter = null;

        trigger.addEventListener("mouseenter", () => {
            const raw = trigger.getAttribute("data-video") || "";
            const videos = raw.split(",").map(v => v.trim()).filter(Boolean);
            if (!videos.length) return;

            let i = 0;
            isOverride = true;

            iphoneWrapper.classList.add("glow");   // <<< AJOUT


            function playCurrent() {
                mainVideo.src = videos[i];
                mainVideo.currentTime = 0;
                mainVideo.play();
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

                // retour à la playlist
                isOverride = false;
                iphoneWrapper.classList.remove("glow");   // <<< AJOUT

                mainVideo.onended = null;
                currentIndex = (currentIndex + 1) % playlist.length;
                mainVideo.src = playlist[currentIndex];
                mainVideo.currentTime = 0;
                mainVideo.play();

                }
            };
        });
    });
}


/* ============================================================
   PLAY / PAUSE
   ============================================================ */

const playPauseBtn  = document.getElementById("playpause");
const playPauseIcon = document.getElementById("playpause-icon");

playPauseBtn.addEventListener("click", () => {
    if (mainVideo.paused) {
        mainVideo.play();
        playPauseIcon.src = "/svg/pause.svg";
    } else {
        mainVideo.pause();
        playPauseIcon.src = "/svg/play.svg";
    }
});

mainVideo.addEventListener("play", () => {
    playPauseIcon.src = "/svg/pause.svg";
});

mainVideo.addEventListener("pause", () => {
    playPauseIcon.src = "/svg/play.svg";
});


/* ============================================================
   MUTE
   ============================================================ */

const muteBtn  = document.getElementById("mute-toggle");
const muteIcon = document.getElementById("mute-icon");

muteBtn.addEventListener("click", () => {
    mainVideo.muted = !mainVideo.muted;
    muteIcon.src = mainVideo.muted ? "/svg/muted.svg" : "/svg/son.svg";
});


/* ============================================================
   SURBRILLANCE + LOCALSTORAGE
   ============================================================ */

const highlightBtn = document.getElementById("highlight-btn");
let lastSelection  = null;

// détection de sélection
document.addEventListener("mouseup", () => {
    const selection = window.getSelection();

    if (selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        lastSelection = range;

        // coordonnées exactes du passage sélectionné
        const rect = range.getBoundingClientRect();

        // positionner le bouton à côté du texte surligné
        highlightBtn.style.top  = (window.scrollY + rect.top - 10) + "px";
        highlightBtn.style.left = (window.scrollX + rect.right + 15) + "px";

        highlightBtn.style.display = "block";
    } else {
        highlightBtn.style.display = "none";
    }
});


// appliquer surlignage
highlightBtn.addEventListener("click", () => {
    if (!lastSelection) return;

    const range    = lastSelection;
    const contents = range.cloneContents();

    const mark = document.createElement("mark");
    mark.classList.add("custom-highlight");
    mark.appendChild(contents);

    range.deleteContents();
    range.insertNode(mark);

    // corriger le petit espace fantôme éventuel
    if (mark.previousSibling &&
        mark.previousSibling.nodeType === 3 &&
        !mark.previousSibling.nodeValue.trim()) {
        mark.previousSibling.remove();
    }

    highlightBtn.style.display = "none";
    window.getSelection().removeAllRanges();

    saveHighlights();
    initNotes();
    initVideoTriggers();
});

// sauvegarde du HTML de la colonne gauche
function saveHighlights() {
    const html = document.querySelector("#memoire-left").innerHTML;
    localStorage.setItem(STORAGE_KEY, html);
}


/* ============================================================
   RESTAURATION AU CHARGEMENT
   ============================================================ */

window.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        document.querySelector("#memoire-left").innerHTML = saved;
    }

    initNotes();
    initVideoTriggers();
});


/* ============================================================
   SUPPRESSION DU SURLIGNAGE PAR CLIC
   ============================================================ */

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("custom-highlight")) {
        const mark   = e.target;
        const parent = mark.parentNode;

        while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
        }
        mark.remove();

        saveHighlights();
        initNotes();
        initVideoTriggers();
    }
});

