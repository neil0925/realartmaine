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

  // Defensive: if elements missing, skip gracefully
  if (!dropdown) {
    // make sure nothing tries to show the dropdown if it doesn't exist
  } else {
    // ensure dropdown hidden on load
    dropdown.classList.remove("show");
  }

  // default: if no saved preference -> set dark (per your request)
  if (localStorage.getItem("darkMode") === null) {
    localStorage.setItem("darkMode", "true");
  }

  const applyMode = () => {
    const isDark = localStorage.getItem("darkMode") === "true";
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
  gear.addEventListener("click", (ev) => {
    ev.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !gear.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

    // Do NOT auto-close on outside click (per previous preference).
    // If you later want outside-click to close, add a document click handler.
  }

  // Mode toggle button (single button)
  if (modeToggle) {
    modeToggle.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const newMode = !(localStorage.getItem("darkMode") === "true");
      localStorage.setItem("darkMode", newMode ? "true" : "false");
      applyMode();
    });
  }

  // Escape to close dropdown
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdown) dropdown.classList.remove("show");
  });
});
