// Default dark mode
document.body.classList.add('dark-mode');

const modeToggle = document.getElementById('modeToggle');
const modeIcon = document.getElementById('modeIcon');

modeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  modeIcon.src = isDark ? 'images/Darkmode.png' : 'images/LightMode.png';
});
