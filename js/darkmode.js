// darkmode.js
// - dropdown is permanently open
// - gear icon does nothing
// - dark mode toggle works and saves to localStorage
// - defaults new visitors to dark mode

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.querySelector(".dropdown-content");
  const modeToggle = document.getElementById("modeToggle");
  const modeIcon = document.getElementById("modeIcon");

  // Safe localStorage helpers
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  }

  // Always-open dropdown
  if (dropdown) {
    dropdown.classList.add("show");
    dropdown.setAttribute("aria-hidden", "false");
  }

  // Default mode: dark if nothing stored
  if (safeGet("darkMode") === null) {
    safeSet("darkMode", "true");
  }

  // Apply saved mode
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

  // Dark mode toggle button
  if (modeToggle) {
    mo
