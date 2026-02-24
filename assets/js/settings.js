// settings.js
// Wires the gear dropdown and provides cache/storage maintenance actions.
(function () {
  const GALLERY_CACHE = "realart-gallery-v1";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function createActionButton(text, bg) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = text;
    Object.assign(btn.style, {
      width: "100%",
      padding: "8px 10px",
      borderRadius: "6px",
      border: "none",
      background: bg,
      color: "#111",
      cursor: "pointer",
      textAlign: "left"
    });
    return btn;
  }

  function isImageRequestPath(urlValue) {
    const raw = String(urlValue || "");
    let pathname = raw;
    try {
      pathname = new URL(raw).pathname;
    } catch (e) {
      pathname = raw;
    }
    const lower = pathname.toLowerCase();
    if (lower.includes("/assets/images/")) return true;
    if (lower.includes("/assets/gui/")) return true;
    return /\.(png|jpe?g|gif|webp|bmp|tiff?|avif|svg)(\?.*)?$/i.test(lower);
  }

  async function clearCachedImagesOnly() {
    if (!("caches" in window) || !caches.open) {
      throw new Error("Cache Storage API is not supported in this browser.");
    }

    const cache = await caches.open(GALLERY_CACHE);
    const reqs = await cache.keys();
    let removed = 0;

    for (const req of reqs) {
      let shouldDelete = isImageRequestPath(req && req.url ? req.url : "");
      if (!shouldDelete) {
        try {
          const resp = await cache.match(req);
          const contentType = (resp && resp.headers && resp.headers.get("content-type")) || "";
          shouldDelete = contentType.toLowerCase().startsWith("image/");
        } catch (e) {
          shouldDelete = false;
        }
      }

      if (shouldDelete) {
        try {
          const ok = await cache.delete(req);
          if (ok) removed += 1;
        } catch (e) {
          // ignore per-entry failures
        }
      }
    }

    return removed;
  }

  async function clearAllCacheStorage() {
    if (!("caches" in window)) {
      throw new Error("Cache Storage API is not supported in this browser.");
    }
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    return keys.length;
  }

  function updateButtonTemporarily(button, text, ms) {
    const old = button.textContent;
    button.textContent = text;
    button.disabled = true;
    setTimeout(function () {
      button.textContent = old;
      button.disabled = false;
    }, ms || 2200);
  }

  function wireDropdown(container, toggleTarget, dropdown) {
    container.style.position = container.style.position || "relative";
    toggleTarget.style.cursor = "pointer";
    toggleTarget.setAttribute("role", "button");
    if (!toggleTarget.hasAttribute("tabindex")) toggleTarget.setAttribute("tabindex", "0");
    toggleTarget.setAttribute("aria-label", "Open settings");

    function show() {
      dropdown.style.display = "flex";
    }
    function hide() {
      dropdown.style.display = "none";
    }
    function toggle(ev) {
      if (ev) ev.stopPropagation();
      dropdown.style.display = dropdown.style.display === "none" ? "flex" : "none";
    }

    // Start closed.
    hide();

    toggleTarget.addEventListener("click", toggle);
    toggleTarget.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        toggle(ev);
      }
      if (ev.key === "Escape") hide();
    });

    document.addEventListener("click", function (ev) {
      if (!container.contains(ev.target)) hide();
    });

    // Prevent dropdown clicks from bubbling and closing immediately.
    dropdown.addEventListener("click", function (ev) {
      ev.stopPropagation();
    });

    return { show: show, hide: hide };
  }

  function createSettingsUI() {
    const container = qs(".settings-dropdown");
    if (!container) return;
    if (container.dataset.settingsReady === "1") return;

    const toggleTarget = qs(".gear-box", container) || qs(".gear-icon", container) || container;
    let dropdown = qs(".dropdown-content", container);
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "dropdown-content";
      container.appendChild(dropdown);
    }

    // Ensure the dropdown has a usable panel style even if page CSS is sparse.
    Object.assign(dropdown.style, {
      display: "none",
      position: "absolute",
      right: "0",
      top: "44px",
      minWidth: "240px",
      maxWidth: "320px",
      background: "#fff",
      color: "#111",
      borderRadius: "8px",
      padding: "10px",
      boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
      border: "1px solid rgba(0,0,0,0.1)",
      flexDirection: "column",
      gap: "8px",
      zIndex: "6000000"
    });

    dropdown.innerHTML = "";

    const clearImageCacheBtn = createActionButton("Clear cached images", "#d6d6d6");
    const clearStorageBtn = createActionButton("Clear local/session storage", "#c9c9c9");
    const clearAllCachesBtn = createActionButton("Clear all site cache storage", "#bdbdbd");

    const note = document.createElement("div");
    note.textContent = "Image cache validation runs automatically while loading gallery images.";
    Object.assign(note.style, {
      fontSize: "12px",
      lineHeight: "1.35",
      opacity: "0.9",
      paddingTop: "2px"
    });

    dropdown.appendChild(clearImageCacheBtn);
    dropdown.appendChild(clearStorageBtn);
    dropdown.appendChild(clearAllCachesBtn);
    dropdown.appendChild(note);

    wireDropdown(container, toggleTarget, dropdown);

    clearImageCacheBtn.addEventListener("click", async function () {
      const ok = window.confirm("Delete cached image files for this site?");
      if (!ok) return;
      try {
        const removed = await clearCachedImagesOnly();
        updateButtonTemporarily(clearImageCacheBtn, "Removed " + removed + " cached image entries", 2600);
      } catch (err) {
        alert(err && err.message ? err.message : "Failed to clear cached images.");
      }
    });

    clearStorageBtn.addEventListener("click", function () {
      const ok = window.confirm("Clear localStorage and sessionStorage for this site?");
      if (!ok) return;
      try {
        localStorage.clear();
      } catch (e) {
        // ignore
      }
      try {
        sessionStorage.clear();
      } catch (e) {
        // ignore
      }
      updateButtonTemporarily(clearStorageBtn, "Local/session storage cleared", 2200);
    });

    clearAllCachesBtn.addEventListener("click", async function () {
      const ok = window.confirm("Delete all Cache Storage buckets for this site?");
      if (!ok) return;
      try {
        const removedBuckets = await clearAllCacheStorage();
        updateButtonTemporarily(clearAllCachesBtn, "Deleted " + removedBuckets + " cache buckets", 2600);
      } catch (err) {
        alert(err && err.message ? err.message : "Failed to clear cache storage.");
      }
    });

    container.dataset.settingsReady = "1";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSettingsUI);
  } else {
    createSettingsUI();
  }
})();
