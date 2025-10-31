/* darkmode.js
   - toggles dark-mode class
   - defaults new visitors to dark mode
   - toggles dropdown with gear click only
   - swaps mode icon between LightMode.png and DarkMode.png
*/

document.addEventListener("DOMContentLoaded", () => {
  const gear = document.querySelector(".gear-icon");
  const dropdown = document.querySelector(".dropdown-content");
  const modeToggle = document.getElementById("modeToggle");
  const modeIcon = document.getElementById("modeIcon");

  // default: if no saved preference, set dark mode true for new visitors
  const saved = localStorage.getItem("darkMode");
  if (saved === null) {
    // default to dark
    localStorage.setItem("darkMode", "true");
  }

  const applyModeFromStorage = () => {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
      document.body.classList.add("dark-mode");
      if (modeIcon) modeIcon.src = "images/DarkMode.png";
    } else {
      document.body.classList.remove("dark-mode");
      if (modeIcon) modeIcon.src = "images/LightMode.png";
    }
  };

  applyModeFromStorage();

  // Gear click toggles dropdown (only toggled by gear click)
  if (gear && dropdown) {
    gear.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });
    // do NOT auto-close on outside click (per your request)
  }

  // Mode toggle: single button toggles dark <-> light, switches icon
  if (modeToggle && modeIcon) {
    modeToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isDark = !(localStorage.getItem("darkMode") === "true");
      localStorage.setItem("darkMode", isDark ? "true" : "false");
      applyModeFromStorage();
    });
  }

  // optional: close dropdown when pressing Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdown) dropdown.classList.remove("show");
  });
});
