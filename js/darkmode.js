// Initialize mode based on localStorage
const savedMode = localStorage.getItem('darkMode');
if (savedMode === 'true') {
  document.body.classList.add('dark-mode');
}

// Elements
const gear = document.querySelector('.gear-icon');
const dropdown = document.querySelector('.dropdown-content');
const modeToggle = document.getElementById('modeToggle');
const modeIcon = document.getElementById('modeIcon');

// Set initial icon based on current mode
modeIcon.src = document.body.classList.contains('dark-mode') 
  ? 'images/DarkMode.png' 
  : 'images/LightMode.png';

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
  
  // Save preference
  localStorage.setItem('darkMode', isDark);

  // Switch icon
  modeIcon.src = isDark ? 'images/DarkMode.png' : 'images/LightMode.png';
});
