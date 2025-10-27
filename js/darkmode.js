// ================================
// Dark Mode & Settings Dropdown JS
// ================================

// Get elements
const gear = document.querySelector('.gear-icon');
const dropdown = document.querySelector('.dropdown-content');
const modeToggle = document.getElementById('modeToggle');
const modeIcon = document.getElementById('modeIcon');

// --- Load saved mode from localStorage or default to dark ---
let savedMode = localStorage.getItem('darkMode');
if (savedMode === null) {
  savedMode = 'true'; // Default to dark mode
  localStorage.setItem('darkMode', savedMode);
}

if (savedMode === 'true') {
  document.body.classList.add('dark-mode');
  modeIcon.src = 'images/DarkMode.png';
} else {
  document.body.classList.remove('dark-mode');
  modeIcon.src = 'images/LightMode.png';
}

// --- Gear click toggles dropdown ---
gear.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('show');
});

// --- Close dropdown when clicking outside ---
document.addEventListener('click', () => {
  dropdown.classList.remove('show');
});

// --- Toggle dark/light mode ---
modeToggle.addEventListener('click', (e) => {
  e.stopPropagation();

  // Toggle class
  const isDark = document.body.classList.toggle('dark-mode');

  // Save user preference
  localStorage.setItem('darkMode', isDark);

  // Swap icons
  modeIcon.src = isDark ? 'images/DarkMode.png' : 'images/LightMode.png';
});

// --- Optional: auto-adjust dropdown width to button (future-safe) ---
function resizeDropdown() {
  const buttonRect = modeToggle.getBoundingClientRect();
  dropdown.style.width = Math.max(160, buttonRect.width + 10) + 'px';
}
resizeDropdown();
window.addEventListener('resize', resizeDropdown);
