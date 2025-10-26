// Default dark mode for new visitors
document.body.classList.add('dark-mode');

const gear = document.querySelector('.gear-icon');
const dropdown = document.querySelector('.dropdown-content');
const modeToggle = document.getElementById('modeToggle');
const modeIcon = document.getElementById('modeIcon');

// Gear click toggles dropdown
gear.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  dropdown.classList.remove('show');
});

// Mode toggle
modeToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isDark = document.body.classList.toggle('dark-mode');

  // Switch icon
  modeIcon.src = isDark ? 'images/DarkMode.png' : 'images/LightMode.png';
});
