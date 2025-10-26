// Get elements
const gear = document.querySelector('.gear-icon');
const dropdown = document.querySelector('.dropdown-content');
const modeToggle = document.getElementById('modeToggle');
const modeIcon = document.getElementById('modeIcon');

// --- Load mode from localStorage ---
const savedMode = localStorage.getItem('darkMode');
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

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  dropdown.classList.remove('show');
});

// --- Mode toggle ---
modeToggle.addEventListener('click', (e) => {
  e.stopPropagation();

  const isDark = document.body.classList.toggle('dark-mode');

  // Save preference
  localStorage.setItem('darkMode', isDark);

  // Update icon
  modeIcon.src = isDark ? 'images/DarkMode.png' : 'images/LightMode.png';
});

// Optional: make dropdown exactly fit button
function resizeDropdown() {
  const buttonRect = modeToggle.getBoundingClientRect();
  dropdown.style.width = buttonRect.width + 'px';
}
resizeDropdown();
window.addEventListener('resize', resizeDropdown);
