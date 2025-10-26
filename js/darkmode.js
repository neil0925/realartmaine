// Check if user has a saved preference
const savedMode = localStorage.getItem('darkMode');

// Default to dark mode if no preference
const isDark = savedMode === null ? true : savedMode === 'true';
if (isDark) {
  document.body.classList.add('dark-mode');
  document.getElementById('modeIcon').src = 'images/DarkMode.png';
} else {
  document.getElementById('modeIcon').src = 'images/LightMode.png';
}

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
  
  // Save preference
  localStorage.setItem('darkMode', isDark);
});
