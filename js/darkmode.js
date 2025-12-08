// darkmode.js
// - defaults new visitors to dark
// - toggles dropdown on gear click only (click gear to open/close)
// - toggles dark mode and persists choice in localStorage
// - centers dropdown content (CSS) — JS ensures dropdown is closed initially

document.addEventListener("DOMContentLoaded", () => {
  const gear = document.querySelector(".gear-icon");
  const dropdown = document.querySelector(".dropdown-content");
  const modeToggle = document.getElementById("modeToggle");
  const modeIcon = document.getElementById("modeIcon");

  // Safe localStorage helpers (guards against private mode / unavailable storage)
  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      // ignore storage errors silently
    }
  }

  // Ensure dropdown exists and is hidden on load
  if (dropdown) {
    dropdown.classList.remove("show");
    // optional: set aria attributes for accessibility
    dropdown.setAttribute("aria-hidden", "true");
  }

  // Default: if no saved preference -> set dark (per your request)
  if (safeGet("darkMode") === null) {
    safeSet("darkMode", "true");
  }

  // Apply mode based on localStorage
  const applyMode = () => {
    const isDark = safeGet("darkMode") === "true";
    if (isDark) {
      document.body.classList.add("dark-mode");
      if (modeIcon) modeIcon.src = "images/DarkMode.png";
    } else {
      document.body.classList.remove("dark-mode");
      if (modeIcon) modeIcon.src = "images/LightMode.png";
    }
  };

  applyMode();

  // Gear toggles dropdown (only gear toggles; clicking gear again closes)
  if (gear && dropdown) {
    // initialize aria-expanded
    gear.setAttribute("aria-controls", "dropdown");
    gear.setAttribute("aria-expanded", "false");

    gear.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const isShown = dropdown.classList.toggle("show");
      dropdown.setAttribute("aria-hidden", (!isShown).toString());
      gear.setAttribute("aria-expanded", isShown.toString());
    });

    // NOTE: per your comment, we do NOT auto-close on outside click.
    // The dropdown will only be toggled via the gear or closed by Escape.
  }

  // Mode toggle button (single button)
  if (modeToggle) {
    modeToggle.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const currentlyDark = safeGet("darkMode") === "true";
      const newMode = !currentlyDark;
      safeSet("darkMode", newMode ? "true" : "false");
      applyMode();
    });
  }

  // Escape to close dropdown
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdown && dropdown.classList.contains("show")) {
      dropdown.classList.remove("show");
      dropdown.setAttribute("aria-hidden", "true");
      if (gear) gear.setAttribute("aria-expanded", "false");
    }
  });
});