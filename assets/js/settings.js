(function () {
  const IMAGE_CACHE = "realart-image-cache-v2";
  const IMAGE_REVALIDATION_STATE_KEY = "ram_image_revalidation_state_v1";
  const SCROLL_TOP_PREF_KEY = "ram_scroll_top_button_enabled_v1";
  const SAVE_LAST_LEADERBOARD_PREF_KEY = "ram_save_last_leaderboard_enabled_v1";
  const SCROLL_TOP_BUTTON_ID = "ram-scroll-top-button";
  const FONT_FAMILY = "var(--ram-font8, Arial, Helvetica, sans-serif)";
  const FRAME_TEXT = "#30513d";
  const JUMP_TOP_HELP_TEXT =
    "Lets users jump to the top of a page with a button when scrolling up";
  const SAVE_LAST_LEADERBOARD_HELP_TEXT =
    "Saves last leaderboard source and filter for the next time they visit instead of always resetting to Gallery Top Flickers";
  const CHECK_ICON = (function () {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M3 8.6L6.2 11.6L13 4.6' fill='none' stroke='" +
      FRAME_TEXT +
      "' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'/></svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  })();
  let scrollTopButton = null;
  let scrollTopEnabled = true;
  let lastScrollY = 0;
  let updateQueued = false;
  let listenersBound = false;
  let navMenusBound = false;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function getPageType() {
    const path = String(window.location.pathname || "").toLowerCase();
    if (path.includes("/gallery")) return "gallery";
    if (path.includes("/freights")) return "freights";
    if (path.includes("/leaderboard")) return "leaderboard";
    if (path.includes("/home")) return "home";
    return "other";
  }

  function createActionButton(text) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = text;
    Object.assign(btn.style, {
      width: "100%",
      padding: "8px 10px",
      borderRadius: "6px",
      border: "none",
      background: "transparent",
      color: FRAME_TEXT,
      cursor: "pointer",
      textAlign: "left",
      fontFamily: FONT_FAMILY,
      fontSize: "0.92rem",
      lineHeight: "1.15",
    });
    btn.addEventListener("mouseenter", function () {
      btn.style.background = "rgba(255,255,255,0.16)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.background = "transparent";
    });
    return btn;
  }

  function createToggleRow(text, checked, helpText) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    });

    const row = document.createElement("label");
    Object.assign(row.style, {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 10px",
      borderRadius: "6px",
      background: "transparent",
      color: FRAME_TEXT,
      cursor: "pointer",
      userSelect: "none",
      fontFamily: FONT_FAMILY,
      fontSize: "0.92rem",
      lineHeight: "1.15",
    });
    row.addEventListener("mouseenter", function () {
      row.style.background = "rgba(255,255,255,0.16)";
    });
    row.addEventListener("mouseleave", function () {
      row.style.background = "transparent";
    });

    const labelText = document.createElement("span");
    labelText.textContent = text;
    Object.assign(labelText.style, {
      flex: "1 1 auto",
      textAlign: "center",
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!checked;
    Object.assign(checkbox.style, {
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      margin: "0",
      width: "16px",
      height: "16px",
      borderRadius: "3px",
      border: "1.5px solid " + FRAME_TEXT,
      backgroundColor: "transparent",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: "12px 12px",
      boxSizing: "border-box",
      outline: "none",
      cursor: "pointer",
      flex: "0 0 auto",
    });

    function repaintCheckbox() {
      checkbox.style.backgroundImage = checkbox.checked ? CHECK_ICON : "none";
    }

    checkbox.addEventListener("change", repaintCheckbox);
    checkbox.addEventListener("focus", function () {
      checkbox.style.boxShadow = "0 0 0 2px rgba(48,81,61,0.22)";
    });
    checkbox.addEventListener("blur", function () {
      checkbox.style.boxShadow = "none";
    });

    let rightElement = document.createElement("span");
    Object.assign(rightElement.style, {
      width: "16px",
      height: "16px",
      flex: "0 0 16px",
      pointerEvents: "none",
    });
    rightElement.setAttribute("aria-hidden", "true");

    let helpPanel = null;
    if (helpText) {
      const helpButton = document.createElement("button");
      helpButton.type = "button";
      helpButton.textContent = "?";
      helpButton.setAttribute("aria-label", "About " + text);
      helpButton.setAttribute("aria-expanded", "false");
      Object.assign(helpButton.style, {
        width: "16px",
        height: "16px",
        flex: "0 0 16px",
        borderRadius: "3px",
        border: "1.5px solid " + FRAME_TEXT,
        background: "transparent",
        color: FRAME_TEXT,
        cursor: "pointer",
        padding: "0",
        margin: "0",
        fontFamily: FONT_FAMILY,
        fontSize: "0.74rem",
        lineHeight: "1",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      });

      helpPanel = document.createElement("button");
      helpPanel.type = "button";
      helpPanel.setAttribute("aria-label", "Toggle help for " + text);
      Object.assign(helpPanel.style, {
        width: "100%",
        display: "none",
        alignItems: "center",
        gap: "6px",
        border: "none",
        borderRadius: "6px",
        background: "transparent",
        color: FRAME_TEXT,
        cursor: "pointer",
        padding: "0 10px 8px 10px",
        margin: "0",
        fontFamily: FONT_FAMILY,
        fontSize: "0.78rem",
        lineHeight: "1.2",
        textAlign: "left",
      });

      const helpMarker = document.createElement("span");
      helpMarker.textContent = "?";
      Object.assign(helpMarker.style, {
        width: "16px",
        height: "16px",
        flex: "0 0 16px",
        borderRadius: "3px",
        border: "1.5px solid " + FRAME_TEXT,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.72rem",
      });

      const helpCopy = document.createElement("span");
      helpCopy.textContent = helpText;
      Object.assign(helpCopy.style, {
        flex: "1 1 auto",
      });

      function toggleHelp(ev) {
        if (ev) {
          ev.preventDefault();
          ev.stopPropagation();
        }
        const show = helpPanel.style.display === "none";
        helpPanel.style.display = show ? "flex" : "none";
        helpButton.setAttribute("aria-expanded", show ? "true" : "false");
      }

      helpButton.addEventListener("click", toggleHelp);
      helpPanel.addEventListener("click", toggleHelp);
      helpPanel.appendChild(helpMarker);
      helpPanel.appendChild(helpCopy);
      rightElement = helpButton;
    }

    row.appendChild(checkbox);
    row.appendChild(labelText);
    row.appendChild(rightElement);
    wrapper.appendChild(row);
    if (helpPanel) wrapper.appendChild(helpPanel);
    repaintCheckbox();

    return { row: wrapper, checkbox };
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

  function getScrollTopSetting() {
    try {
      const raw = localStorage.getItem(SCROLL_TOP_PREF_KEY);
      if (raw === null) return true;
      return raw === "1";
    } catch (e) {
      return true;
    }
  }

  function saveScrollTopSetting(enabled) {
    try {
      localStorage.setItem(SCROLL_TOP_PREF_KEY, enabled ? "1" : "0");
    } catch (e) {}
  }

  function getSaveLastLeaderboardSetting() {
    try {
      const raw = localStorage.getItem(SAVE_LAST_LEADERBOARD_PREF_KEY);
      if (raw === null) return false;
      return raw === "1";
    } catch (e) {
      return false;
    }
  }

  function saveLastLeaderboardSetting(enabled) {
    try {
      localStorage.setItem(SAVE_LAST_LEADERBOARD_PREF_KEY, enabled ? "1" : "0");
    } catch (e) {}
  }

  function ensureScrollTopButton() {
    let btn = document.getElementById(SCROLL_TOP_BUTTON_ID);
    if (btn) return btn;

    btn = document.createElement("button");
    btn.id = SCROLL_TOP_BUTTON_ID;
    btn.type = "button";
    btn.textContent = "Top";
    btn.setAttribute("aria-label", "Jump to top");
    Object.assign(btn.style, {
      position: "fixed",
      left: "max(8px, env(safe-area-inset-left))",
      top: "max(8px, env(safe-area-inset-top))",
      zIndex: "7000000",
      padding: "6px 10px",
      borderRadius: "7px",
      border: "1px solid rgba(48,81,61,0.4)",
      backgroundImage: 'url("/assets/GUI/tile.png")',
      backgroundRepeat: "repeat",
      backgroundSize: "400px 400px",
      color: FRAME_TEXT,
      fontFamily: FONT_FAMILY,
      fontSize: "0.84rem",
      lineHeight: "1",
      fontWeight: "600",
      boxShadow: "0 8px 18px rgba(0,0,0,0.26)",
      cursor: "pointer",
      opacity: "0",
      transform: "translateY(-6px)",
      pointerEvents: "none",
      transition: "opacity 140ms ease, transform 140ms ease",
    });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
    document.body.appendChild(btn);
    return btn;
  }

  function setScrollTopButtonVisible(visible) {
    if (!scrollTopButton) return;
    scrollTopButton.style.opacity = visible ? "1" : "0";
    scrollTopButton.style.transform = visible
      ? "translateY(0)"
      : "translateY(-6px)";
    scrollTopButton.style.pointerEvents = visible ? "auto" : "none";
  }

  function shouldShowScrollTopButton(currentY, previousY) {
    if (!scrollTopEnabled) return false;
    const viewportH = Math.max(
      1,
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0,
    );
    const docH = Math.max(
      document.documentElement.scrollHeight || 0,
      document.body.scrollHeight || 0,
    );
    const hasScrollableContent =
      docH - viewportH > Math.max(60, viewportH * 0.2);
    if (!hasScrollableContent) return false;
    const nearTop = currentY <= Math.max(48, viewportH * 0.18);
    if (nearTop) return false;
    const farEnough = currentY >= Math.max(180, viewportH * 0.75);
    if (!farEnough) return false;
    const scrollingUp = currentY < previousY - 0.8;
    return scrollingUp;
  }

  function updateScrollTopButtonVisibility() {
    if (!scrollTopButton) return;
    const currentY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const visible = shouldShowScrollTopButton(currentY, lastScrollY);
    setScrollTopButtonVisible(visible);
    lastScrollY = currentY;
  }

  function queueScrollTopUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(function () {
      updateQueued = false;
      updateScrollTopButtonVisibility();
    });
  }

  function bindScrollTopListeners() {
    if (listenersBound) return;
    listenersBound = true;
    window.addEventListener("scroll", queueScrollTopUpdate, { passive: true });
    window.addEventListener("resize", queueScrollTopUpdate, { passive: true });
  }

  function applyScrollTopSetting(enabled) {
    scrollTopEnabled = !!enabled;
    saveScrollTopSetting(scrollTopEnabled);
    if (!scrollTopButton) scrollTopButton = ensureScrollTopButton();
    if (!scrollTopEnabled) {
      setScrollTopButtonVisible(false);
      return;
    }
    lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    queueScrollTopUpdate();
  }

  function wireDropdown(container, toggleTarget, dropdown) {
    container.style.position = container.style.position || "relative";
    toggleTarget.style.cursor = "pointer";
    toggleTarget.setAttribute("role", "button");
    if (!toggleTarget.hasAttribute("tabindex")) {
      toggleTarget.setAttribute("tabindex", "0");
    }
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

  function bindMobileNavMenuBehavior() {
    if (navMenusBound) return;
    navMenusBound = true;

    const menus = Array.from(document.querySelectorAll("details.nav-menu"));
    if (!menus.length) return;

    function closeAllMenus(except) {
      for (let i = 0; i < menus.length; i += 1) {
        if (menus[i] !== except) menus[i].open = false;
      }
    }

    for (let i = 0; i < menus.length; i += 1) {
      const menu = menus[i];
      const summary = menu.querySelector("summary");
      if (!summary || menu.dataset.navMenuReady === "1") continue;
      menu.dataset.navMenuReady = "1";

      summary.addEventListener("click", function (ev) {
        ev.preventDefault();
        const shouldOpen = !menu.open;
        closeAllMenus(menu);
        menu.open = shouldOpen;
      });
    }

    document.addEventListener("click", function (ev) {
      for (let i = 0; i < menus.length; i += 1) {
        if (!menus[i].contains(ev.target)) menus[i].open = false;
      }
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") return;
      closeAllMenus(null);
    });
  }

  function createSettingsUI() {
    bindMobileNavMenuBehavior();
    const pageType = getPageType();

    if (pageType === "home") {
      const existing = document.getElementById(SCROLL_TOP_BUTTON_ID);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      scrollTopButton = null;
    } else {
      scrollTopEnabled = getScrollTopSetting();
      scrollTopButton = ensureScrollTopButton();
      lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      bindScrollTopListeners();
      applyScrollTopSetting(scrollTopEnabled);
    }

    const container = qs(".settings-dropdown");
    if (!container) return;
    if (pageType === "home") {
      container.style.display = "none";
      return;
    }
    const isGalleryLike = pageType === "gallery" || pageType === "freights";
    if (!isGalleryLike && pageType !== "leaderboard") {
      container.style.display = "none";
      return;
    }
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
      borderRadius: "8px",
      padding: "10px",
      boxShadow: "0 10px 28px rgba(0,0,0,0.2)",
      border: "1px solid rgba(48,81,61,0.4)",
      flexDirection: "column",
      gap: "8px",
      zIndex: "6000000",
      backgroundImage: 'url("/assets/GUI/tile.png")',
      backgroundRepeat: "repeat",
      backgroundSize: "400px 400px",
      color: FRAME_TEXT,
      fontFamily: FONT_FAMILY,
    });

    dropdown.innerHTML = "";

    const jumpTopToggle = createToggleRow(
      "Jump to top",
      scrollTopEnabled,
      JUMP_TOP_HELP_TEXT,
    );
    dropdown.appendChild(jumpTopToggle.row);

    let saveLeaderboardToggle = null;
    if (pageType === "leaderboard") {
      saveLeaderboardToggle = createToggleRow(
        "Save last leaderboard",
        getSaveLastLeaderboardSetting(),
        SAVE_LAST_LEADERBOARD_HELP_TEXT,
      );
      dropdown.appendChild(saveLeaderboardToggle.row);
    }

    let clearCacheBtn = null;
    if (isGalleryLike) {
      clearCacheBtn = createActionButton("Clear cache");
      dropdown.appendChild(clearCacheBtn);
    }

    wireDropdown(container, toggleTarget, dropdown);

    jumpTopToggle.checkbox.addEventListener("change", function () {
      scrollTopEnabled = !!jumpTopToggle.checkbox.checked;
      applyScrollTopSetting(scrollTopEnabled);
    });

    if (saveLeaderboardToggle) {
      saveLeaderboardToggle.checkbox.addEventListener("change", function () {
        saveLastLeaderboardSetting(!!saveLeaderboardToggle.checkbox.checked);
      });
    }

    if (clearCacheBtn) {
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
    }

    container.dataset.settingsReady = "1";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSettingsUI);
  } else {
    createSettingsUI();
  }
})();
