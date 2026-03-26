(function () {
  const GALLERY_EXTS = [".jpg", ".JPG", ".jpeg", ".JPEG"];
  const FREIGHT_EXTS = [
    ".jpg",
    ".JPG",
    ".jpeg",
    ".JPEG",
    ".png",
    ".PNG",
    ".gif",
    ".GIF",
    ".webp",
    ".WEBP",
  ];
  const TAGGER_LIST_URL = "/assets/Tagger%20List.json";
  const MULTI_WORD_ICON_TOKENS = new Set([
    "old head",
    "circle t",
    "helped id",
    "freight writer",
    "retired name",
  ]);
  const KNOWN_ICON_KEYS = new Set([
    "5g",
    "bne",
    "bomber",
    "circlet",
    "craft",
    "cts",
    "dpw",
    "freight",
    "helped id",
    "locals",
    "ltb",
    "mgi",
    "ohk",
    "oldhead",
    "ptg",
    "retiredname",
    "sdh",
    "slt",
    "tnl",
    "vc",
  ]);
  const ICON_LABEL_MAP = new Map([
    ["circlet", "circle t"],
    ["retiredname", "retired name"],
    ["freight", "freight writer"],
  ]);
  let taggerListPromise = null;
  let taggerIconMap = null;
  const PICK_STORAGE_KEY = "ram_flick_of_day_pick_v2";
  const DAY_CHECK_INTERVAL_MS = 60000;
  let autoRefreshTimer = null;
  let renderToken = 0;

  function parseFlagToken(value) {
    const token = String(value || "").trim().toLowerCase();
    if (token === "y" || token === "yes" || token === "true" || token === "1") {
      return true;
    }
    if (token === "n" || token === "no" || token === "false" || token === "0") {
      return false;
    }
    return null;
  }

  function parseLabel(label) {
    const parts = String(label || "")
      .split("-")
      .map((v) => String(v || "").trim())
      .filter(Boolean);

    let core = parts.slice();
    if (core.length >= 6) {
      const tail = core.slice(-3).map(parseFlagToken);
      if (tail.every((v) => typeof v === "boolean")) {
        core = core.slice(0, -3);
      }
    }

    let tags = [];
    let photographer = "";

    if (core.length === 2) {
      tags = core[0].split(",").map((t) => t.trim()).filter(Boolean);
      photographer = core[1] || "";
    } else if (core.length === 3) {
      tags = core[0].split(",").map((t) => t.trim()).filter(Boolean);
      photographer = core[2] || "";
    } else if (core.length > 3) {
      tags = core[0].split(",").map((t) => t.trim()).filter(Boolean);
      photographer = core[core.length - 2] || "";
    } else {
      tags = String(label || "")
        .split("-")[0]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (photographer) {
      photographer = photographer.split(/\s|,/).filter(Boolean)[0] || "";
    }

    return { tags, photographer };
  }

  function normalizeTaggerName(value) {
    return String(value || "").trim().toLowerCase();
  }

  function splitIconTokens(value) {
    if (!value) return [];
    const rawTokens = String(value || "")
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
    const out = [];
    rawTokens.forEach((token) => {
      const lower = token.toLowerCase();
      if (lower.includes(" ") && !MULTI_WORD_ICON_TOKENS.has(lower)) {
        lower
          .split(/\s+/)
          .map((part) => part.trim())
          .filter(Boolean)
          .forEach((part) => out.push(part));
      } else {
        out.push(lower);
      }
    });
    return out;
  }

  function normalizeIconToken(value) {
    let token = String(value || "").trim().toLowerCase();
    if (!token) return "";
    token = token.replace(/\s+/g, " ").trim();
    if (token === "helpedid") token = "helped id";
    if (token === "local") token = "locals";
    if (token === "locals") return "locals";
    if (token === "old head") return "oldhead";
    if (token === "oldhead") return "oldhead";
    if (token === "circle t") return "circlet";
    if (token === "circlet") return "circlet";
    if (
      token === "freight" ||
      token === "freight writer" ||
      token === "freightwriter" ||
      token === "freights" ||
      token === "frieght" ||
      token === "frieghts"
    )
      return "freight";
    if (token === "retired" || token === "retired name")
      return "retiredname";
    return token;
  }

  function getIconLabel(iconKey) {
    if (!iconKey) return "";
    return ICON_LABEL_MAP.get(iconKey) || iconKey;
  }

  function buildTaggerIconMap(data) {
    if (!data || typeof data !== "object") return new Map();
    const map = new Map();
    Object.keys(data).forEach((name) => {
      const key = normalizeTaggerName(name);
      if (!key) return;
      const rawList = Array.isArray(data[name]) ? data[name] : [data[name]];
      const tokens = [];
      rawList.forEach((item) => {
        splitIconTokens(item).forEach((token) => tokens.push(token));
      });
      map.set(key, tokens);
    });
    return map;
  }

  function getDisplayIconsForTagger(taggerKey) {
    const map =
      taggerIconMap ||
      (typeof window !== "undefined" && window.RAM_TAGGER_ICON_MAP instanceof Map
        ? window.RAM_TAGGER_ICON_MAP
        : null);
    const icons = map && map.get ? map.get(taggerKey) : [];
    const out = [];
    const seen = new Set();
    (icons || []).forEach((icon) => {
      const key = normalizeIconToken(icon);
      if (!key || !KNOWN_ICON_KEYS.has(key)) return;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(key);
    });
    return out;
  }

  async function fetchJsonFile(url) {
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp || !resp.ok) return null;
      return await resp.json();
    } catch (e) {
      return null;
    }
  }

  function ensureTaggerListLoaded() {
    if (taggerIconMap) return Promise.resolve(taggerIconMap);
    if (
      typeof window !== "undefined" &&
      window.RAM_TAGGER_ICON_MAP instanceof Map
    ) {
      taggerIconMap = window.RAM_TAGGER_ICON_MAP;
      return Promise.resolve(taggerIconMap);
    }
    if (taggerListPromise) return taggerListPromise;
    taggerListPromise = fetchJsonFile(TAGGER_LIST_URL).then((data) => {
      taggerIconMap = buildTaggerIconMap(data);
      return taggerIconMap;
    });
    return taggerListPromise;
  }

  function buildEntries(source, labels, basePath, extensions) {
    const out = [];
    if (!Array.isArray(labels)) return out;

    for (let i = 1; i < labels.length; i += 1) {
      const label = String(labels[i] || "").trim();
      if (!label) continue;
      const parsed = parseLabel(label);
      const candidates = extensions.map((ext) => `${basePath}/${i}${ext}`);
      out.push({
        source,
        index: i,
        label,
        tags: parsed.tags,
        photographer: parsed.photographer,
        candidates,
      });
    }

    return out;
  }

  function buildCaptionText(entry) {
    const tagText =
      Array.isArray(entry.tags) && entry.tags.length ? entry.tags.join(", ") : "";
    const photographerText = String(entry.photographer || "").trim();
    if (tagText && photographerText) return `${tagText} flicked by ${photographerText}`;
    if (tagText) return tagText;
    if (photographerText) return `flicked by ${photographerText}`;
    return "";
  }

  function buildCaptionParts(entry) {
    const tags = Array.isArray(entry.tags) ? entry.tags.filter(Boolean) : [];
    const photographer = String(entry.photographer || "").trim();
    return {
      tags,
      photographer,
    };
  }

  function getDayNumberEastern() {
    const now = new Date();
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(now);
      const year = Number(parts.find((p) => p.type === "year")?.value);
      const month = Number(parts.find((p) => p.type === "month")?.value);
      const day = Number(parts.find((p) => p.type === "day")?.value);
      if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
        const easternMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
        return Math.floor(easternMidnight / 86400000);
      }
    } catch (e) {}

    const utcMidnight = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    );
    return Math.floor(utcMidnight / 86400000);
  }

  function getDayKeyEastern() {
    const now = new Date();
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(now);
      const year = parts.find((p) => p.type === "year")?.value || "0000";
      const month = parts.find((p) => p.type === "month")?.value || "00";
      const day = parts.find((p) => p.type === "day")?.value || "00";
      return `${year}-${month}-${day}`;
    } catch (e) {}
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function entryKey(entry) {
    if (!entry) return "";
    return `${entry.source || "gallery"}:${entry.index || 0}`;
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash +=
        (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
  }

  function orderEntries(entries, seed) {
    if (!Array.isArray(entries) || !entries.length) return [];
    const keyed = entries.map((entry, idx) => {
      const key = entryKey(entry);
      return {
        entry,
        key,
        score: hashString(`${seed}|${key}`),
        idx,
      };
    });

    keyed.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (a.key < b.key) return -1;
      if (a.key > b.key) return 1;
      return a.idx - b.idx;
    });

    return keyed.map((item) => item.entry);
  }

  function getStoredPick(dayKey, entries) {
    if (!dayKey) return null;
    try {
      const raw = localStorage.getItem(PICK_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.day !== dayKey || !parsed.key) return null;
      const lookup = new Map(entries.map((e) => [entryKey(e), e]));
      return lookup.get(parsed.key) || null;
    } catch (e) {
      return null;
    }
  }

  function storePick(dayKey, picked) {
    if (!dayKey || !picked) return;
    try {
      localStorage.setItem(
        PICK_STORAGE_KEY,
        JSON.stringify({ day: dayKey, key: entryKey(picked) }),
      );
    } catch (e) {}
  }

  function pickBalancedEntry(dayNumber, galleryEntries, freightEntries) {
    const galleryList = Array.isArray(galleryEntries) ? galleryEntries : [];
    const freightList = Array.isArray(freightEntries) ? freightEntries : [];
    const hasGallery = galleryList.length > 0;
    const hasFreight = freightList.length > 0;

    if (!hasGallery && !hasFreight) return null;

    if (!hasGallery) {
      const ordered = orderEntries(freightList, "freights");
      if (!ordered.length) return null;
      return ordered[dayNumber % ordered.length];
    }

    if (!hasFreight) {
      const ordered = orderEntries(galleryList, "gallery");
      if (!ordered.length) return null;
      return ordered[dayNumber % ordered.length];
    }

    const useGallery = dayNumber % 2 === 0;
    const ordered = orderEntries(
      useGallery ? galleryList : freightList,
      useGallery ? "gallery" : "freights",
    );
    if (!ordered.length) return null;
    const index = Math.floor(dayNumber / 2) % ordered.length;
    return ordered[index];
  }

  function pickEntryForToday(galleryEntries, freightEntries) {
    const dayKey = getDayKeyEastern();
    const entries = []
      .concat(Array.isArray(galleryEntries) ? galleryEntries : [])
      .concat(Array.isArray(freightEntries) ? freightEntries : []);
    if (!entries.length) return null;

    const stored = getStoredPick(dayKey, entries);
    if (stored) return stored;

    const picked = pickBalancedEntry(
      getDayNumberEastern(),
      galleryEntries,
      freightEntries,
    );
    if (picked) storePick(dayKey, picked);
    return picked;
  }

  function resolveImage(entry) {
    return new Promise((resolve) => {
      if (!entry || !Array.isArray(entry.candidates) || !entry.candidates.length) {
        resolve("");
        return;
      }

      let i = 0;
      const testNext = function () {
        if (i >= entry.candidates.length) {
          resolve("");
          return;
        }

        const candidate = entry.candidates[i++];
        const img = new Image();
        img.onload = function () {
          resolve(candidate);
        };
        img.onerror = function () {
          testNext();
        };
        img.src = candidate;
      };

      testNext();
    });
  }

  function openSpotlight(imageSrc, captionParts, captionText) {
    if (!imageSrc) return;

    const existing = document.querySelector(".modal-backdrop");
    if (existing && existing.parentNode) {
      try {
        if (
          document.fullscreenElement &&
          typeof existing.contains === "function" &&
          existing.contains(document.fullscreenElement)
        ) {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      } catch (e) {}
      existing.parentNode.removeChild(existing);
    }

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal modal-has-fullscreen-btn flick-day-modal";

    const imgWrap = document.createElement("div");
    imgWrap.className = "modal-imgwrap";

    const img = document.createElement("img");
    img.className = "modal-image";
    img.alt = captionText || "Flick of the day";
    img.src = imageSrc;

    imgWrap.appendChild(img);
    modal.appendChild(imgWrap);

    const caption = document.createElement("div");
    caption.className = "caption";
    const parts = captionParts || { tags: [], photographer: "" };
    let taggerPopup = null;
    let taggerPopupRow = null;
    let taggerButtons = [];
    let activeTaggerKey = "";

    const setActiveTaggerButton = (taggerKey) => {
      activeTaggerKey = taggerKey || "";
      taggerButtons.forEach(({ key, button }) => {
        if (key === taggerKey) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });
    };

    const hideTaggerPopup = () => {
      if (!taggerPopup) return;
      taggerPopup.classList.add("hidden");
      taggerPopup.dataset.tagger = "";
      taggerPopup.style.visibility = "";
      setActiveTaggerButton("");
    };

    const positionTaggerPopup = (anchorEl) => {
      if (!taggerPopup || !anchorEl) return;
      const rect = anchorEl.getBoundingClientRect();
      const desiredLeft = rect.left + rect.width / 2;
      const desiredTop = rect.bottom + 8;
      taggerPopup.style.left = `${desiredLeft}px`;
      taggerPopup.style.top = `${desiredTop}px`;
      taggerPopup.style.transform = "translate(-50%, 0)";
      taggerPopup.style.visibility = "hidden";
      taggerPopup.classList.remove("hidden");

      const popupRect = taggerPopup.getBoundingClientRect();
      const half = popupRect.width / 2;
      const minLeft = 8 + half;
      const maxLeft = window.innerWidth - 8 - half;
      let left = desiredLeft;
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;

      let top = desiredTop;
      let transform = "translate(-50%, 0)";
      if (top + popupRect.height > window.innerHeight - 8) {
        top = rect.top - 8;
        transform = "translate(-50%, -100%)";
      }
      if (top < 8) top = 8;

      taggerPopup.style.left = `${left}px`;
      taggerPopup.style.top = `${top}px`;
      taggerPopup.style.transform = transform;
      taggerPopup.style.visibility = "visible";
    };

    const renderTaggerPopup = (taggerKey, anchorEl) => {
      if (!taggerPopup || !taggerPopupRow) return;
      taggerPopupRow.innerHTML = "";
      const icons = getDisplayIconsForTagger(taggerKey);
      if (!icons.length) {
        hideTaggerPopup();
        return;
      }

      icons.forEach((iconKey) => {
        const iconWrap = document.createElement("span");
        iconWrap.className = "tagger-icon";
        iconWrap.setAttribute("tabindex", "0");
        const iconLabel = getIconLabel(iconKey);
        iconWrap.dataset.label = iconLabel;
        iconWrap.setAttribute("aria-label", iconLabel);
        iconWrap.setAttribute("role", "img");

        const iconImg = document.createElement("img");
        iconImg.className = "tagger-icon-img";
        iconImg.alt = iconKey;
        iconImg.src = `/assets/GUI/Icons/${encodeURIComponent(iconKey)}.png`;
        iconImg.onerror = () => {
          if (iconWrap.parentNode) iconWrap.parentNode.removeChild(iconWrap);
        };

        iconWrap.appendChild(iconImg);
        taggerPopupRow.appendChild(iconWrap);
      });

      if (!taggerPopupRow.childElementCount) {
        hideTaggerPopup();
        return;
      }

      taggerPopup.dataset.tagger = taggerKey || "";
      setActiveTaggerButton(taggerKey);
      positionTaggerPopup(anchorEl);
    };

    const toggleTaggerPopup = (taggerName, anchorEl) => {
      if (document.fullscreenElement) {
        hideTaggerPopup();
        return;
      }
      const taggerKey = normalizeTaggerName(taggerName);
      if (!getDisplayIconsForTagger(taggerKey).length) return;
      if (!taggerPopup) return;
      const isOpen =
        taggerPopup.dataset.tagger === taggerKey &&
        !taggerPopup.classList.contains("hidden");
      if (isOpen) {
        hideTaggerPopup();
        return;
      }
      renderTaggerPopup(taggerKey, anchorEl);
    };

    const renderCaption = () => {
      caption.innerHTML = "";
      const inner = document.createElement("div");
      inner.className = "caption-inner";
      const line = document.createElement("span");
      line.className = "caption-line";
      inner.appendChild(line);
      caption.appendChild(inner);
      taggerButtons = [];

      const taggers = Array.isArray(parts.tags) ? parts.tags.filter(Boolean) : [];
      let hasText = false;

      if (taggers.length) {
        const taggerRow = document.createElement("span");
        taggerRow.className = "caption-tags";
        taggers.forEach((tagger) => {
          const key = normalizeTaggerName(tagger);
          const hasIcons = getDisplayIconsForTagger(key).length > 0;
          if (hasIcons) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "tagger-link";
            button.textContent = tagger;
            taggerButtons.push({ key, button });
            button.addEventListener("click", (e) => {
              e.stopPropagation();
              toggleTaggerPopup(tagger, button);
            });
            taggerRow.appendChild(button);
          } else {
            const label = document.createElement("span");
            label.className = "tagger-name";
            label.textContent = tagger;
            taggerRow.appendChild(label);
          }
        });
        line.appendChild(taggerRow);
        hasText = true;
      }

      if (parts.photographer) {
        const spacer = hasText ? " " : "";
        line.appendChild(document.createTextNode(`${spacer}flicked by `));
        const photo = document.createElement("span");
        photo.className = "caption-photographer";
        photo.textContent = parts.photographer;
        line.appendChild(photo);
        hasText = true;
      }

      if (!hasText) {
        line.textContent = captionText || "";
      }

      if (!hasText && !captionText) {
        caption.style.display = "none";
      } else {
        caption.style.display = "block";
      }
    };

    renderCaption();
    ensureTaggerListLoaded().then(() => {
      if (!backdrop.parentNode) return;
      renderCaption();
    });
    modal.appendChild(caption);

    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.className = "modal-fullscreen-btn";
    fullscreenBtn.type = "button";
    fullscreenBtn.setAttribute("aria-label", "Toggle fullscreen");
    fullscreenBtn.textContent = "Fullscreen";

    const fullscreenClose = document.createElement("button");
    fullscreenClose.className = "modal-fullscreen-close hidden";
    fullscreenClose.type = "button";
    fullscreenClose.setAttribute("aria-label", "Close fullscreen");
    fullscreenClose.textContent = "x";

    modal.appendChild(fullscreenBtn);
    modal.appendChild(fullscreenClose);

    taggerPopup = document.createElement("div");
    taggerPopup.className = "tagger-icon-popup hidden";
    taggerPopup.dataset.tagger = "";
    taggerPopupRow = document.createElement("div");
    taggerPopupRow.className = "tagger-icon-row";
    taggerPopup.appendChild(taggerPopupRow);

    const updateFullscreenLabel = function () {
      const isFs = !!document.fullscreenElement;
      fullscreenBtn.textContent = isFs ? "Exit Fullscreen" : "Fullscreen";
      if (isFs) {
        backdrop.classList.add("gallery-fullscreen");
        modal.classList.add("gallery-fullscreen");
        fullscreenClose.classList.remove("hidden");
        hideTaggerPopup();
      } else {
        backdrop.classList.remove("gallery-fullscreen");
        modal.classList.remove("gallery-fullscreen");
        fullscreenClose.classList.add("hidden");
      }
      updateFullscreenFit();
    };

    const updateFullscreenFit = function () {
      if (!document.fullscreenElement) {
        modal.classList.remove("fs-tall");
        modal.classList.remove("fs-wide");
        img.style.width = "";
        img.style.height = "";
        img.style.maxWidth = "";
        img.style.maxHeight = "";
        try {
          delete modal.dataset.tallFixedW;
          delete modal.dataset.tallFixedH;
        } catch (e) {}
        return;
      }

      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      if (!naturalW || !naturalH) return;

      const viewW = window.innerWidth || 1;
      const viewH = window.innerHeight || 1;
      if (naturalH > naturalW) {
        modal.classList.remove("fs-tall");
        modal.classList.remove("fs-wide");
        const fixedW = parseInt(modal.dataset.tallFixedW || "", 10);
        const fixedH = parseInt(modal.dataset.tallFixedH || "", 10);
        if (fixedW > 0 && fixedH > 0) {
          img.style.width = `${fixedW}px`;
          img.style.height = `${fixedH}px`;
          img.style.maxWidth = "";
          img.style.maxHeight = "";
          return;
        }
        const targetH = Math.max(1, Math.round(viewH * 0.5));
        const targetW = Math.max(
          1,
          Math.round(targetH * (naturalW / naturalH)),
        );
        modal.dataset.tallFixedW = String(targetW);
        modal.dataset.tallFixedH = String(targetH);
        img.style.width = `${targetW}px`;
        img.style.height = `${targetH}px`;
        img.style.maxWidth = "";
        img.style.maxHeight = "";
        return;
      }

      try {
        delete modal.dataset.tallFixedW;
        delete modal.dataset.tallFixedH;
      } catch (e) {}
      img.style.width = "";
      img.style.height = "";
      img.style.maxWidth = "";
      img.style.maxHeight = "";

      const viewRatio = viewW / viewH;
      const imgRatio = naturalW / naturalH;
      if (imgRatio < viewRatio) {
        modal.classList.add("fs-tall");
        modal.classList.remove("fs-wide");
      } else {
        modal.classList.add("fs-wide");
        modal.classList.remove("fs-tall");
      }
    };

    const handleOutsideTaggerClick = (ev) => {
      if (!taggerPopup || taggerPopup.classList.contains("hidden")) return;
      if (taggerPopup.contains(ev.target)) return;
      if (ev.target.closest && ev.target.closest(".tagger-link")) return;
      hideTaggerPopup();
    };

    const close = function () {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", updateFullscreenLabel);
      window.removeEventListener("resize", updateFullscreenFit);
      document.removeEventListener("mousedown", handleOutsideTaggerClick, true);
      hideTaggerPopup();
      try {
        if (
          document.fullscreenElement === backdrop ||
          document.fullscreenElement === modal
        ) {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      } catch (e) {}
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    };

    const onKeyDown = function (ev) {
      if (ev.key === "Escape") close();
    };

    backdrop.addEventListener("click", function (ev) {
      if (ev.target === backdrop) close();
    });

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", updateFullscreenLabel);
    updateFullscreenLabel();
    window.addEventListener("resize", updateFullscreenFit);
    document.addEventListener("mousedown", handleOutsideTaggerClick, true);
    img.addEventListener("load", updateFullscreenFit);
    updateFullscreenFit();

    fullscreenBtn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      try {
        if (document.fullscreenElement) {
          if (document.exitFullscreen) document.exitFullscreen();
          return;
        }
        const target = backdrop || modal;
        if (target && target.requestFullscreen) {
          target.requestFullscreen();
        }
      } catch (e) {}
    });

    fullscreenClose.addEventListener("click", function (ev) {
      ev.stopPropagation();
      close();
    });

    backdrop.appendChild(modal);
    backdrop.appendChild(taggerPopup);
    document.body.appendChild(backdrop);
  }

  function scheduleDailyRefresh(refreshFn) {
    if (autoRefreshTimer) return;
    let lastDayKey = getDayKeyEastern();
    autoRefreshTimer = setInterval(() => {
      const nextKey = getDayKeyEastern();
      if (nextKey !== lastDayKey) {
        lastDayKey = nextKey;
        refreshFn();
      }
    }, DAY_CHECK_INTERVAL_MS);
  }

  function init() {
    const card = document.getElementById("flickDayCard");
    const image = document.getElementById("flickDayImage");
    const caption = document.getElementById("flickDayCaption");
    const loader = document.getElementById("flickDayLoader");
    if (!card || !image || !caption || !loader) return;
    ensureTaggerListLoaded();

    const renderFlick = function () {
      const token = (renderToken += 1);
      card.classList.remove("loaded");
      caption.textContent = "";
      caption.style.display = "none";
      card.disabled = false;
      card.style.cursor = "pointer";
      card.onclick = null;
      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
      image.alt = "Flick of the day";

      const galleryLabels =
        typeof window.IMAGE_LABELS !== "undefined" ? window.IMAGE_LABELS : [];
      const freightLabels =
        typeof window.FREIGHT_LABELS !== "undefined"
          ? window.FREIGHT_LABELS
          : [];

      const galleryEntries = buildEntries(
        "gallery",
        galleryLabels,
        "/assets/images",
        GALLERY_EXTS,
      );
      const freightEntries = buildEntries(
        "freights",
        freightLabels,
        "/assets/Freights",
        FREIGHT_EXTS,
      );

      const picked = pickEntryForToday(galleryEntries, freightEntries);
      if (!picked) {
        caption.textContent = "No flick available yet.";
        caption.style.display = "block";
        card.classList.add("loaded");
        card.disabled = true;
        card.style.cursor = "default";
        return;
      }

      const captionText = buildCaptionText(picked);
      const captionParts = buildCaptionParts(picked);

      resolveImage(picked).then((src) => {
        if (token !== renderToken) return;
        if (!src) {
          caption.textContent = "Flick image unavailable for today.";
          caption.style.display = "block";
          card.classList.add("loaded");
          card.disabled = true;
          card.style.cursor = "default";
          return;
        }

        let revealed = false;
        const reveal = function () {
          if (revealed) return;
          revealed = true;
          card.classList.add("loaded");
        };

        image.onload = reveal;
        image.src = src;
        image.alt = captionText || "Flick of the day";
        if (typeof image.decode === "function") {
          image.decode().then(reveal).catch(() => {});
        } else if (image.complete) {
          reveal();
        }

        card.onclick = function () {
          openSpotlight(src, captionParts, captionText);
        };
      });
    };

    renderFlick();
    scheduleDailyRefresh(renderFlick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
