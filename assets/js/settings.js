(function () {
  const IMAGE_CACHE = "realart-image-cache-v2";
  const IMAGE_REVALIDATION_STATE_KEY = "ram_image_revalidation_state_v1";
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
      textAlign: "left",
    });
    return btn;
  }
  async function clearImageCacheOnly() {
    if (!("caches" in window) || !caches.open) {
      throw new Error("Cache Storage API is not supported in this browser.");
    }
    let removedEntries = 0;
    try {
      const cache = await caches.open(IMAGE_CACHE);
      const reqs = await cache.keys();
      removedEntries = reqs.length;
    } catch (e) {
      removedEntries = 0;
    }
    try {
      await caches.delete(IMAGE_CACHE);
    } catch (e) {}
    try {
      localStorage.removeItem(IMAGE_REVALIDATION_STATE_KEY);
    } catch (e) {}
    return removedEntries;
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
    if (!toggleTarget.hasAttribute("tabindex"))
      toggleTarget.setAttribute("tabindex", "0");
    toggleTarget.setAttribute("aria-label", "Open settings");
    function hide() {
      dropdown.style.display = "none";
    }
    function toggle(ev) {
      if (ev) ev.stopPropagation();
      dropdown.style.display =
        dropdown.style.display === "none" ? "flex" : "none";
    }
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
    dropdown.addEventListener("click", function (ev) {
      ev.stopPropagation();
    });
  }
  function createSettingsUI() {
    const container = qs(".settings-dropdown");
    if (!container) return;
    if (container.dataset.settingsReady === "1") return;
    const toggleTarget =
      qs(".gear-box", container) || qs(".gear-icon", container) || container;
    let dropdown = qs(".dropdown-content", container);
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "dropdown-content";
      container.appendChild(dropdown);
    }
    Object.assign(dropdown.style, {
      display: "none",
      position: "absolute",
      right: "0",
      top: "44px",
      minWidth: "220px",
      maxWidth: "300px",
      background: "#fff",
      color: "#111",
      borderRadius: "8px",
      padding: "10px",
      boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
      border: "1px solid rgba(0,0,0,0.1)",
      flexDirection: "column",
      gap: "8px",
      zIndex: "6000000",
    });
    dropdown.innerHTML = "";
    const clearCacheBtn = createActionButton("Clear cache", "#d6d6d6");
    dropdown.appendChild(clearCacheBtn);
    wireDropdown(container, toggleTarget, dropdown);
    clearCacheBtn.addEventListener("click", async function () {
      const ok = window.confirm("Delete cached gallery images for this site?");
      if (!ok) return;
      try {
        const removed = await clearImageCacheOnly();
        updateButtonTemporarily(
          clearCacheBtn,
          "Cleared " + removed + " cached images",
          2600,
        );
      } catch (err) {
        alert(
          err && err.message ? err.message : "Failed to clear image cache.",
        );
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
