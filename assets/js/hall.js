(function () {
  const IMAGE_CACHE = "realart-image-cache-v2";
  const GUI_CACHE = "realart-gui-v1";
  const GUI_ASSETS = ["/assets/GUI/gear.png", "/assets/GUI/arrow.png"];
  const IMAGE_REVALIDATE_TTL_MS = 6 * 60 * 60 * 1000;
  const IMAGE_REVALIDATE_CONCURRENCY = 2;
  const IMAGE_REVALIDATION_STATE_KEY = "ram_image_revalidation_state_v1";
  const SORT_KEY = "ram_hall_sort_v1";
  const EXTENSIONS = [
    ".jpg",
    ".JPG",
    ".jpeg",
    ".JPEG",
    ".png",
    ".PNG",
    ".webp",
    ".WEBP",
  ];

  const __createdGuiBlobUrls = [];
  const __imageLastValidatedAt = new Map();
  const __pendingImageRevalidations = new Set();
  const __queuedImageRevalidations = [];
  const __knownMissingImageCandidates = new Set();
  let __activeImageRevalidations = 0;

  const container = document.getElementById("hallEntries");
  if (!container) return;

  const sortSelect = document.getElementById("hallSortSelect");
  const hallType = resolveHallType();
  const labels =
    hallType === "shame"
      ? window.SHAME_LABELS || []
      : window.FAME_LABELS || [];
  const imageRoot =
    hallType === "shame" ? "/assets/HallOfShame" : "/assets/HallOfFame";
  const hallLabel = hallType === "shame" ? "Hall of Shame" : "Hall of Fame";

  function resolveHallType() {
    try {
      const fromBody =
        document.body && document.body.dataset
          ? document.body.dataset.hall
          : "";
      if (fromBody) return String(fromBody).toLowerCase();
    } catch (e) {}
    const path = String(window.location.pathname || "").toLowerCase();
    if (path.includes("hallofshame")) return "shame";
    return "fame";
  }

  function loadImageRevalidationState() {
    try {
      const raw = localStorage.getItem(IMAGE_REVALIDATION_STATE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;
      const now = Date.now();
      for (const key of Object.keys(data)) {
        const ts = Number(data[key]);
        if (!Number.isFinite(ts)) continue;
        if (now - ts > 30 * 24 * 60 * 60 * 1000) continue;
        __imageLastValidatedAt.set(key, ts);
      }
    } catch (e) {}
  }

  function saveImageRevalidationState() {
    try {
      const now = Date.now();
      const out = {};
      __imageLastValidatedAt.forEach((ts, key) => {
        if (now - ts <= 30 * 24 * 60 * 60 * 1000) out[key] = ts;
      });
      localStorage.setItem(IMAGE_REVALIDATION_STATE_KEY, JSON.stringify(out));
    } catch (e) {}
  }

  function markImageValidated(candidate) {
    __imageLastValidatedAt.set(candidate, Date.now());
    saveImageRevalidationState();
  }

  function needsImageRevalidation(candidate) {
    const last = __imageLastValidatedAt.get(candidate) || 0;
    return Date.now() - last >= IMAGE_REVALIDATE_TTL_MS;
  }

  function buildConditionalHeadersFromCached(cachedResp) {
    const headers = {};
    if (!cachedResp || !cachedResp.headers) return headers;
    const etag = cachedResp.headers.get("etag");
    const lastModified = cachedResp.headers.get("last-modified");
    if (etag) headers["If-None-Match"] = etag;
    if (lastModified) headers["If-Modified-Since"] = lastModified;
    return headers;
  }

  async function revalidateCachedImage(candidate) {
    if (__knownMissingImageCandidates.has(candidate)) {
      markImageValidated(candidate);
      return;
    }
    if (typeof caches === "undefined" || !caches.open) {
      markImageValidated(candidate);
      return;
    }
    try {
      const cache = await caches.open(IMAGE_CACHE);
      const cachedResp = await cache.match(candidate);
      if (!cachedResp || !cachedResp.ok) {
        markImageValidated(candidate);
        return;
      }
      const headers = buildConditionalHeadersFromCached(cachedResp);
      const netResp = await fetch(candidate, {
        method: "GET",
        cache: "no-store",
        headers,
      });
      if (netResp && netResp.status === 304) {
        markImageValidated(candidate);
        return;
      }
      if (netResp && netResp.ok) {
        try {
          await cache.put(candidate, netResp.clone());
        } catch (e) {}
        markImageValidated(candidate);
        return;
      }
      if (netResp && netResp.status === 404) {
        __knownMissingImageCandidates.add(candidate);
        markImageValidated(candidate);
        return;
      }
      markImageValidated(candidate);
    } catch (e) {
      markImageValidated(candidate);
    }
  }

  function drainImageRevalidationQueue() {
    while (
      __activeImageRevalidations < IMAGE_REVALIDATE_CONCURRENCY &&
      __queuedImageRevalidations.length > 0
    ) {
      const candidate = __queuedImageRevalidations.shift();
      __activeImageRevalidations++;
      revalidateCachedImage(candidate)
        .catch(() => {})
        .finally(() => {
          __activeImageRevalidations--;
          __pendingImageRevalidations.delete(candidate);
          drainImageRevalidationQueue();
        });
    }
  }

  function queueImageRevalidation(candidate) {
    if (!candidate) return;
    if (!needsImageRevalidation(candidate)) return;
    if (__pendingImageRevalidations.has(candidate)) return;
    __pendingImageRevalidations.add(candidate);
    __queuedImageRevalidations.push(candidate);
    drainImageRevalidationQueue();
  }

  async function preCacheGuiAssets() {
    if (typeof caches === "undefined" || !caches.open) return;
    try {
      const cache = await caches.open(GUI_CACHE);
      for (const p of GUI_ASSETS) {
        try {
          const match = await cache.match(p);
          if (match && match.ok) continue;
          const resp = await fetch(p, { method: "GET" });
          if (resp && resp.ok) {
            try {
              await cache.put(p, resp.clone());
            } catch (e) {}
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  async function replaceGuiImagesFromCache() {
    if (typeof caches === "undefined" || !caches.open) return;
    try {
      const cache = await caches.open(GUI_CACHE);
      const imgs = Array.from(document.querySelectorAll("img"));
      for (const img of imgs) {
        try {
          const src = img.getAttribute("src") || img.src || "";
          if (!src.includes("/assets/GUI/")) continue;
          const path = src.replace(location.origin, "");
          const cached = await cache.match(path);
          if (cached && cached.ok) {
            const blob = await cached.blob();
            const blobUrl = URL.createObjectURL(blob);
            __createdGuiBlobUrls.push(blobUrl);
            img.src = blobUrl;
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  window.addEventListener("pagehide", () => {
    try {
      __createdGuiBlobUrls.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {}
      });
    } catch (e) {}
  });

  function scheduleBlobUrlRevoke(blobUrl) {
    if (!blobUrl) return;
    setTimeout(() => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (e) {}
    }, 1200);
  }

  async function getValidatedImageBlob(candidate) {
    if (__knownMissingImageCandidates.has(candidate)) return null;
    let cache = null;
    let cachedResp = null;
    if (typeof caches !== "undefined" && caches.open) {
      try {
        cache = await caches.open(IMAGE_CACHE);
        cachedResp = await cache.match(candidate);
      } catch (e) {
        cache = null;
        cachedResp = null;
      }
    }
    if (cachedResp && cachedResp.ok) {
      queueImageRevalidation(candidate);
      return { blob: await cachedResp.blob(), source: "cache" };
    }
    try {
      const onlineResp = await fetch(candidate, {
        method: "GET",
        cache: "no-store",
      });
      if (onlineResp && onlineResp.ok) {
        try {
          if (cache) await cache.put(candidate, onlineResp.clone());
        } catch (e) {}
        markImageValidated(candidate);
        return { blob: await onlineResp.blob(), source: "network" };
      }
      if (onlineResp && onlineResp.status === 404) {
        __knownMissingImageCandidates.add(candidate);
      }
    } catch (e) {}
    return null;
  }

  function parseLabelEntry(label, fallbackIndex) {
    const raw = String(label || "").trim();
    if (!raw) return null;
    const parts = raw.split("-");
    const title = (parts[0] || "").trim();
    const photographer = (parts[1] || "").trim();
    const imageNumber = fallbackIndex;
    const description = parts.length > 2 ? parts.slice(2).join("-").trim() : "";
    return {
      title: title || "Untitled",
      photographer,
      imageNumber,
      description,
      raw,
      loaded: false,
      loading: false,
      src: "",
      isPortrait: false,
      element: null,
      elements: null,
    };
  }

  function buildEntries(list) {
    const entries = [];
    if (!Array.isArray(list)) return entries;
    for (let i = 1; i < list.length; i += 1) {
      const entry = parseLabelEntry(list[i], i);
      if (!entry) continue;
      entries.push(entry);
    }
    return entries;
  }

  function getSavedSort() {
    try {
      const saved = localStorage.getItem(SORT_KEY);
      if (saved === "oldest" || saved === "newest") return saved;
    } catch (e) {}
    return "newest";
  }

  function saveSort(value) {
    try {
      localStorage.setItem(SORT_KEY, value);
    } catch (e) {}
  }

  function sortEntries(entries, order) {
    const list = entries.slice();
    list.sort((a, b) => {
      if (order === "oldest") return a.imageNumber - b.imageNumber;
      return b.imageNumber - a.imageNumber;
    });
    return list;
  }

  function buildCandidates(imageNumber) {
    return EXTENSIONS.map((ext) => `${imageRoot}/${imageNumber}${ext}`);
  }

  function applyPortraitSizing(entry) {
    if (!entry || !entry.elements) return;
    const img = entry.elements.img;
    const wrap = entry.elements.wrap;
    if (!img || !wrap) return;
    const naturalW = img.naturalWidth || 0;
    const naturalH = img.naturalHeight || 0;
    if (!naturalW || !naturalH) return;
    const isPortrait = naturalH > naturalW;
    entry.isPortrait = isPortrait;
    if (!isPortrait) {
      img.classList.remove("is-portrait");
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.maxWidth = "";
      img.style.maxHeight = "";
      return;
    }
    const wrapWidth = Math.max(
      1,
      wrap.clientWidth || wrap.getBoundingClientRect().width || 0,
    );
    img.classList.add("is-portrait");
    const galleryMinCol = 180;
    const galleryGap = 10;
    const cols = Math.max(
      1,
      Math.floor((wrapWidth + galleryGap) / (galleryMinCol + galleryGap)),
    );
    const baseColWidth = Math.max(
      120,
      Math.floor((wrapWidth - (cols - 1) * galleryGap) / cols),
    );
    const portraitScale = 2.7;
    let targetWidth = Math.round(baseColWidth * portraitScale);
    targetWidth = Math.max(1, Math.min(targetWidth, wrapWidth));
    const targetHeight = Math.round(targetWidth * (naturalH / naturalW));
    img.style.width = `${Math.max(1, targetWidth)}px`;
    img.style.height = `${Math.max(1, targetHeight)}px`;
    img.style.maxWidth = "";
    img.style.maxHeight = "";
  }

  function updateEntryCreditPosition(entry) {
    if (!entry || !entry.elements || !entry.elements.credit) return;
    const credit = entry.elements.credit;
    const img = entry.elements.img;
    if (!credit || !img) return;
    const imgRect = img.getBoundingClientRect();
    if (!imgRect.width || !imgRect.height) return;
    const width = Math.max(1, Math.round(imgRect.width));
    credit.style.width = `${width}px`;
    credit.style.maxWidth = `${width}px`;
  }

  function setPlaceholderError(entry, message) {
    if (!entry.elements || !entry.elements.placeholder) return;
    entry.elements.placeholder.classList.add("is-error");
    entry.elements.placeholder.textContent = message || "Image missing";
  }

  async function loadEntryImage(entry) {
    if (!entry || entry.loaded || entry.loading || !entry.elements) return;
    entry.loading = true;
    const img = entry.elements.img;
    const wrap = entry.elements.wrap;
    const placeholder = entry.elements.placeholder;

    if (placeholder) {
      placeholder.classList.remove("is-error");
      placeholder.textContent = "";
      const spinner = document.createElement("div");
      spinner.className = "spinner";
      spinner.style.display = "block";
      placeholder.appendChild(spinner);
    }

    const candidates = buildCandidates(entry.imageNumber);
    let chosen = null;
    let chosenBlob = null;

    for (const candidate of candidates) {
      const resolved = await getValidatedImageBlob(candidate);
      if (resolved && resolved.blob) {
        chosen = candidate;
        chosenBlob = resolved.blob;
        break;
      }
    }

    if (!chosenBlob) {
      entry.loading = false;
      entry.loaded = true;
      if (placeholder) {
        placeholder.innerHTML = "";
        setPlaceholderError(entry, "Image missing");
      }
      return;
    }

    const blobUrl = URL.createObjectURL(chosenBlob);
    img.src = blobUrl;
    try {
      await img.decode();
    } catch (e) {}

    applyPortraitSizing(entry);
    updateEntryCreditPosition(entry);

    entry.src = chosen || "";
    entry.loaded = true;
    entry.loading = false;

    if (wrap) wrap.classList.add("loaded");
    if (entry.elements && entry.elements.media)
      entry.elements.media.classList.add("loaded");
    if (placeholder) placeholder.innerHTML = "";
    scheduleBlobUrlRevoke(blobUrl);
  }

  function buildEntryElement(entry) {
    const article = document.createElement("article");
    article.className = "hall-entry";
    article.dataset.index = String(entry.imageNumber);

    const title = document.createElement("h2");
    title.className = "hall-entry-title";
    title.textContent = entry.title;
    article.appendChild(title);

    const media = document.createElement("div");
    media.className = "hall-entry-media";

    const wrap = document.createElement("div");
    wrap.className = "hall-entry-image-wrap";
    wrap.setAttribute("role", "button");
    wrap.setAttribute("tabindex", "0");
    wrap.setAttribute("aria-label", "Open image fullscreen");

    const placeholder = document.createElement("div");
    placeholder.className = "hall-entry-placeholder";
    wrap.appendChild(placeholder);

    const img = document.createElement("img");
    img.className = "hall-entry-image";
    img.alt = entry.title || `${hallLabel} ${entry.imageNumber}`;
    img.loading = "lazy";
    img.decoding = "async";
    wrap.appendChild(img);

    let credit = null;
    if (entry.photographer) {
      credit = document.createElement("div");
      credit.className = "hall-entry-credit";
      credit.textContent = `flicked by ${entry.photographer}`;
    }

    media.appendChild(wrap);
    if (credit) media.appendChild(credit);
    article.appendChild(media);

    const desc = document.createElement("p");
    desc.className = "hall-entry-desc";
    desc.textContent = entry.description || "";
    article.appendChild(desc);

    entry.elements = {
      article,
      img,
      wrap,
      placeholder,
      title,
      desc,
      credit,
      media,
    };

    const open = () => openModal(entry);
    wrap.addEventListener("click", (e) => {
      if (!img) return;
      const rect = img.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }
      open();
    });
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });

    return article;
  }

  let observer = null;
  const wrapToEntry = new WeakMap();

  function setupObserver(entryList) {
    if (observer) {
      try {
        observer.disconnect();
      } catch (e) {}
    }
    if (typeof IntersectionObserver === "undefined") {
      entryList.forEach((entry) => loadEntryImage(entry));
      return;
    }
    observer = new IntersectionObserver(
      (items) => {
        items.forEach((item) => {
          if (!item.isIntersecting) return;
          const entry = wrapToEntry.get(item.target);
          if (entry) loadEntryImage(entry);
          try {
            observer.unobserve(item.target);
          } catch (e) {}
        });
      },
      { root: null, rootMargin: "500px 0px", threshold: 0.01 },
    );

    entryList.forEach((entry) => {
      if (!entry || !entry.elements || entry.loaded) return;
      wrapToEntry.set(entry.elements.wrap, entry);
      observer.observe(entry.elements.wrap);
    });
  }

  function renderEmptyState() {
    container.innerHTML = "";
    const msg = document.createElement("div");
    msg.className = "hall-empty";
    msg.textContent = "No entries yet.";
    container.appendChild(msg);
  }

  const entries = buildEntries(labels);
  let currentSort = getSavedSort();

  function renderEntries() {
    if (!entries.length) {
      renderEmptyState();
      return;
    }

    const ordered = sortEntries(entries, currentSort);
    container.innerHTML = "";

    ordered.forEach((entry) => {
      if (!entry.element) {
        entry.element = buildEntryElement(entry);
      }
      container.appendChild(entry.element);
    });

    setupObserver(ordered);
  }

  function updatePortraitSizing() {
    entries.forEach((entry) => {
      if (!entry || !entry.loaded) return;
      if (entry.isPortrait) applyPortraitSizing(entry);
      updateEntryCreditPosition(entry);
    });
  }

  function openModal(entry) {
    if (!entry) return;

    const existing = document.querySelector(".hall-fullscreen-overlay");
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const overlay = document.createElement("div");
    overlay.className = "hall-fullscreen-overlay";

    const img = document.createElement("img");
    img.alt = entry.title || `${hallLabel} ${entry.imageNumber}`;
    img.className = "hall-fullscreen-image";
    img.style.visibility = "hidden";
    img.style.display = "none";

    const spinner = document.createElement("div");
    spinner.className = "spinner hall-fullscreen-spinner";
    spinner.style.display = "block";

    const closeBtn = document.createElement("button");
    closeBtn.className = "hall-fullscreen-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close fullscreen");
    closeBtn.textContent = "x";

    overlay.appendChild(spinner);
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);
    document.body.classList.add("hall-fullscreen-open");

    let modalLoadToken = 0;

    const setLoading = () => {
      spinner.style.display = "block";
      img.style.visibility = "hidden";
      img.style.display = "none";
    };

    const clearLoading = () => {
      spinner.style.display = "none";
    };

    const loadFullscreenImage = async () => {
      const requestId = ++modalLoadToken;
      setLoading();

      const candidates = buildCandidates(entry.imageNumber);
      let chosen = null;
      let chosenBlob = null;

      for (const candidate of candidates) {
        const resolved = await getValidatedImageBlob(candidate);
        if (resolved && resolved.blob) {
          chosen = candidate;
          chosenBlob = resolved.blob;
          break;
        }
      }

      if (requestId !== modalLoadToken) return;

      if (!chosenBlob) {
        clearLoading();
        return;
      }

      const blobUrl = URL.createObjectURL(chosenBlob);
      img.src = blobUrl;
      try {
        await img.decode();
      } catch (e) {}

      if (requestId !== modalLoadToken) {
        scheduleBlobUrlRevoke(blobUrl);
        return;
      }

      entry.src = chosen || entry.src;
      scheduleBlobUrlRevoke(blobUrl);
      clearLoading();
      img.style.visibility = "visible";
      img.style.display = "block";
    };

    const closeModal = () => {
      modalLoadToken++;
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.body.classList.remove("hall-fullscreen-open");
      document.removeEventListener("keydown", onKey);
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    };

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", onKey);

    loadFullscreenImage().catch(() => {});
  }

  loadImageRevalidationState();

  if (sortSelect) {
    sortSelect.value = currentSort;
    sortSelect.addEventListener("change", () => {
      currentSort = sortSelect.value || currentSort;
      saveSort(currentSort);
      renderEntries();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      renderEntries();
      window.addEventListener("resize", () =>
        requestAnimationFrame(updatePortraitSizing),
      );
      preCacheGuiAssets().catch(() => {});
      replaceGuiImagesFromCache().catch(() => {});
    });
  } else {
    renderEntries();
    window.addEventListener("resize", () =>
      requestAnimationFrame(updatePortraitSizing),
    );
    preCacheGuiAssets().catch(() => {});
    replaceGuiImagesFromCache().catch(() => {});
  }
})();
