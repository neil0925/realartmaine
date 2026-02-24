function escapeHtml(s) {
  return String(s).replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}
if (
  typeof window !== "undefined" &&
  typeof window.VIDEO_LABELS === "undefined"
) {
  window.VIDEO_LABELS = [null];
  window.VIDEO_LABELS[1] = "test-realartmaine-test";
}
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("galleryContainer");
  if (!container) return;
  const globalMetaList =
    typeof metaList !== "undefined" ? metaList : window.metaList || null;
  const globalVideoLabels =
    typeof VIDEO_LABELS !== "undefined"
      ? VIDEO_LABELS
      : window.VIDEO_LABELS || null;
  const globalVideoFiles =
    typeof VIDEO_FILES !== "undefined"
      ? VIDEO_FILES
      : window.VIDEO_FILES || null;
  function parseVideoLabel(label) {
    const out = {
      tags: [],
      crew: null,
      photographer: "",
      styles: [],
      raw: label || "",
    };
    if (!label) return out;
    const parts = label
      .split("-")
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) return out;
    const stylesPart = parts[parts.length - 1] || "";
    out.styles = stylesPart
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const photographerSeg = parts.length >= 2 ? parts[parts.length - 2] : "";
    const crewSeg = parts.length >= 3 ? parts[parts.length - 3] : "";
    const tagsSeg =
      parts.slice(0, Math.max(0, parts.length - 3)).join("-") || parts[0] || "";
    out.tags = (tagsSeg || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (crewSeg) {
      const isLikelyCrew =
        /^[A-Z0-9,\s]{1,12}$/.test(crewSeg) &&
        crewSeg === crewSeg.toUpperCase();
      if (isLikelyCrew || crewSeg.indexOf(",") >= 0)
        out.crew = crewSeg.toLowerCase();
    }
    if (photographerSeg) {
      const cand = photographerSeg
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      let chosen = null;
      for (const c of cand) {
        if (!c) continue;
        const isLikelyCrew = /^[A-Z0-9]{1,6}$/.test(c) && c === c.toUpperCase();
        if (isLikelyCrew) continue;
        chosen = c;
        break;
      }
      if (!chosen && cand.length) chosen = cand[0];
      out.photographer = (chosen || "").toLowerCase();
    }
    return out;
  }
  const videoMetaList = (function () {
    const list = [];
    const total =
      globalVideoLabels && Array.isArray(globalVideoLabels)
        ? Math.max(0, globalVideoLabels.length - 1)
        : globalMetaList
          ? globalMetaList.length
          : 0;
    for (let i = 0; i <= total; i++) list.push(null);
    for (let i = 1; i <= total; i++) {
      const entry = {
        index: i,
        numericSrc: `/assets/videos/${i}.mp4`,
        label: "",
        tags: [],
        crew: null,
        photographer: "",
        styles: [],
        rawBase: String(i),
      };
      if (globalVideoLabels && globalVideoLabels[i]) {
        entry.label = globalVideoLabels[i];
        entry.rawBase = globalVideoLabels[i];
        const parsed = parseVideoLabel(globalVideoLabels[i]);
        entry.tags = parsed.tags;
        entry.crew = parsed.crew;
        entry.photographer = parsed.photographer;
        entry.styles = parsed.styles;
      }
      if (
        globalMetaList &&
        Array.isArray(globalMetaList) &&
        globalMetaList[i]
      ) {
        const m = globalMetaList[i];
        if (m.videoPath) entry.numericSrc = m.videoPath;
        if (m.label) entry.label = m.label;
        if (m.tags) entry.tags = m.tags;
        if (m.photographer) entry.photographer = m.photographer;
        if (m.crew) entry.crew = m.crew;
        if (m.styles) entry.styles = m.styles;
      }
      list[i] = entry;
    }
    return list;
  })();
  function resolveVideoSrc(i) {
    if (
      globalMetaList &&
      Array.isArray(globalMetaList) &&
      globalMetaList[i] &&
      globalMetaList[i].videoPath
    )
      return globalMetaList[i].videoPath;
    if (
      globalVideoFiles &&
      Array.isArray(globalVideoFiles) &&
      globalVideoFiles[i]
    )
      return globalVideoFiles[i];
    const candidates = [
      `/assets/videos/${i}.mp4`,
      `/assets/videos/video${i}.mp4`,
      `/assets/videos/${i}.webm`,
    ];
    return candidates[0];
  }
  const count = Array.isArray(videoMetaList)
    ? Math.max(0, videoMetaList.length - 1)
    : 0;
  if (count <= 0) {
    container.innerHTML = "<p>No videos found.</p>";
    return;
  }
  for (let i = 1; i <= count; i++) {
    const wrap = document.createElement("div");
    wrap.className = "card";
    const imgWrap = document.createElement("div");
    imgWrap.className = "image-wrap loaded";
    const placeholder = document.createElement("div");
    placeholder.className = "loading-placeholder";
    placeholder.innerHTML = `<div class="placeholder-box active"><div class="spinner"></div><div class="loading-error" style="display:none"></div></div>`;
    const poster = document.createElement("div");
    poster.className = "gallery-image poster";
    const meta = videoMetaList[i] || { photographer: "", tags: [], label: "" };
    const title = meta.photographer || meta.label || "Video " + i;
    const subtitle =
      meta.tags && meta.tags.length ? meta.tags.slice(0, 3).join(", ") : "";
    poster.innerHTML =
      `<strong>${escapeHtml(title)}</strong>` +
      (subtitle ? `<div class="small">${escapeHtml(subtitle)}</div>` : "");
    poster.setAttribute("aria-hidden", "true");
    imgWrap.appendChild(placeholder);
    imgWrap.appendChild(poster);
    wrap.appendChild(imgWrap);
    (function (idx) {
      wrap.addEventListener("click", (ev) => {
        openSpotlight(idx);
      });
    })(i);
    container.appendChild(wrap);
  }
  function openSpotlight(index) {
    let backdrop = document.querySelector(".modal-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop";
      document.body.appendChild(backdrop);
    }
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-imgwrap">
        <div class="video-container">
          <div class="video-stage"></div>
          <div class="video-controls">
            <button class="playpause">Play</button>
            <div class="seek">
              <div class="seek-bar"><div class="seek-filled"></div></div>
            </div>
            <div class="time">0:00 / 0:00</div>
            <button class="mute">Mute</button>
            <button class="close">Close</button>
          </div>
        </div>
      </div>
    `;
    backdrop.appendChild(modal);
    const stage = modal.querySelector(".video-stage");
    const playBtn = modal.querySelector(".playpause");
    const closeBtn = modal.querySelector(".close");
    const muteBtn = modal.querySelector(".mute");
    const timeEl = modal.querySelector(".time");
    const seekBar = modal.querySelector(".seek-bar");
    const seekFilled = modal.querySelector(".seek-filled");
    const video = document.createElement("video");
    video.controls = false;
    video.preload = "none";
    video.crossOrigin = "anonymous";
    video.style.maxWidth = "100%";
    video.style.width = "100%";
    video.style.height = "auto";
    const meta = videoMetaList[index] || null;
    const resolved =
      meta && meta.numericSrc ? meta.numericSrc : resolveVideoSrc(index);
    const src =
      resolved + (resolved.includes("?") ? "&" : "?") + "cb=" + Date.now();
    video.src = src;
    stage.appendChild(video);
    let desiredStart = 0;
    function attemptPlay() {
      if (!video.src) return;
      video.preload = "auto";
      if (video.readyState >= 1) {
        try {
          video.currentTime = Math.max(0, desiredStart - 10);
        } catch (e) {}
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        const onMeta = () => {
          video.removeEventListener("loadedmetadata", onMeta);
          try {
            video.currentTime = Math.max(0, desiredStart - 10);
          } catch (e) {}
          const p = video.play();
          if (p && p.catch) p.catch(() => {});
        };
        video.addEventListener("loadedmetadata", onMeta);
        video.load();
      }
    }
    playBtn.addEventListener("click", () => {
      if (video.paused) {
        attemptPlay();
        playBtn.textContent = "Pause";
      } else {
        video.pause();
        playBtn.textContent = "Play";
      }
    });
    muteBtn.addEventListener("click", () => {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? "Unmute" : "Mute";
    });
    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    function closeModal() {
      try {
        video.pause();
      } catch (e) {}
      if (backdrop && modal.parentNode === backdrop)
        backdrop.removeChild(modal);
      if (backdrop && backdrop.childElementCount === 0)
        backdrop.parentNode.removeChild(backdrop);
    }
    function fmt(s) {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60)
        .toString()
        .padStart(2, "0");
      return m + ":" + sec;
    }
    video.addEventListener("timeupdate", () => {
      const cur = video.currentTime || 0;
      const dur = video.duration || 0;
      timeEl.textContent =
        fmt(cur) + " / " + (isFinite(dur) ? fmt(dur) : "0:00");
      if (dur) seekFilled.style.width = (cur / dur) * 100 + "%";
    });
    seekBar.addEventListener("click", (ev) => {
      const rect = seekBar.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(1, (ev.clientX - rect.left) / rect.width),
      );
      const dur = video.duration || 0;
      const target = dur * pct;
      desiredStart = target;
      try {
        video.currentTime = Math.max(0, target - 10);
      } catch (e) {}
      if (video.paused) {
        attemptPlay();
        playBtn.textContent = "Pause";
      }
    });
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    modal.addEventListener("remove", () =>
      document.removeEventListener("keydown", onKey),
    );
  }
});
