const modeToggle = document.getElementById('modeToggle');
const modeIcon = document.getElementById('modeIcon');
const gear = document.querySelector('.gear-icon');
const dropdown = document.querySelector('.dropdown-content');

// Set dark mode based on localStorage
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  modeIcon.src = 'images/DarkMode.png';
} else {
  modeIcon.src = 'images/LightMode.png';
}

// Gear click toggles dropdown
gear.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  dropdown.classList.remove('show');
});

// Toggle dark mode
modeToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark);
  modeIcon.src = isDark ? 'images/DarkMode.png' : 'images/LightMode.png';
});
