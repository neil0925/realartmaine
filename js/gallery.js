// Simple gallery loader + parser
const imagesList = [
"/images/5G-TroubledGuppy-piece.jpg",
"/images/aura-OHK-troubledguppy-piece.jpg",
"/images/blame-troubledguppy-piece.jpg",
"/images/brik-PTG-troubledguppy-piece.jpg",
"/images/burek, house-2GF,CTS,TNL-troubledgubby-piece.jpg",
"/images/burek-2GF-troubledguppy-piece.jpg",
"/images/cache, pyle-BNE,OHK,PTG-troubledguppy-piece.jpg",
"/images/feer, give-MFH-troubledguppy-piece, hand style.jpg",
"/images/feer-troubledguppy-throie.jpg",
"/images/enzyme-dpw-troubledguppy-throie.jpg",
"/images/Enya, 5G-troubledguppy-straight letter.jpg",
"/images/Enya, 5G-troubledguppy-piece, anti style.jpg",
"/images/Enya, 5G-troubledguppy-piece.jpg",
"/images/catch-OHK,BNE,PTG-troubledguppy-throie, straight letter.jpg",
"/images/catch-OHK,BNE,PTG-troubledguppy-piece, throie.jpg",
"/images/catch-OHK,BNE,PTG-troubledguppy-piece.jpg",
"/images/catch-OHK,BNE,PTG-troubledguppy-throie.jpg",
];

const gallery = document.getElementById('galleryContainer');
const searchInput = document.getElementById('searchInput');

// parse filename into metadata
function parseFilename(filename) {
  const base = filename.split('/').pop().replace(/\.[^.]+$/, '');
  const parts = base.split('-');
  const stylesPart = parts.pop();
  const components = parts;
  const styles = stylesPart.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  let tag = '', crew = null, photographer = '';
  if (components.length === 2) {
    [tag, photographer] = components;
  } else if (components.length === 3) {
    [tag, crew, photographer] = components;
  } else {
    tag = components[0] || '';
    photographer = components[components.length-1] || '';
    if (components.length > 2) {
      crew = components.slice(1, components.length-1).join('-');
    }
  }

  const tags = tag.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  return { src: filename, rawBase: base, tags, crew: crew ? crew.toLowerCase() : null, photographer: photographer.toLowerCase(), styles };
}

function makeCard(imageMeta, index) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card';
  const img = document.createElement('img');
  img.src = imageMeta.src;
  img.alt = imageMeta.rawBase;
  img.dataset.meta = JSON.stringify(imageMeta);

  img.addEventListener('click', () => openModal(imageMeta));

  wrapper.appendChild(img);
  return wrapper;
}

function openModal(meta) {
  document.body.style.overflow = 'hidden';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      document.body.removeChild(backdrop);
      document.body.style.overflow = '';
    }
  });

  const modal = document.createElement('div');
  modal.className = 'modal';

  const img = document.createElement('img');
  img.src = meta.src;
  img.alt = meta.rawBase;

  const caption = document.createElement('div');
  caption.className = 'caption';
  const crewPart = meta.crew ? ` (${meta.crew})` : '';
  caption.textContent = `"${meta.tags.join(', ')}" flicked by ${meta.photographer}${crewPart}`;

  modal.appendChild(img);
  modal.appendChild(caption);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function renderGallery(list) {
  gallery.innerHTML = '';
  list.forEach((src, i) => {
    if (i > 0 && i % 10 === 0) {
      const ad = document.createElement('div');
      ad.className = 'ad-card';
      ad.textContent = 'Ad / Featured';
      gallery.appendChild(ad);
    }
    const meta = parseFilename(src);
    gallery.appendChild(makeCard(meta, i));
  });
}

function filterGallery(q) {
  q = (q || '').trim().toLowerCase();
  if (!q) {
    renderGallery(imagesList);
    return;
  }
  const filtered = imagesList.filter(src => {
    const meta = parseFilename(src);
    const hay = [...meta.tags, meta.crew || '', meta.photographer, ...meta.styles].join(' ');
    return hay.includes(q);
  });
  renderGallery(filtered);
}

// initial render
renderGallery(imagesList);

if (searchInput) {
  searchInput.addEventListener('input', (e) => filterGallery(e.target.value));
}

// ---- Masonry layout ----
function resizeMasonryItem(item){
    const grid = document.querySelector('.gallery');
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));
    const img = item.querySelector('img');
    if(!img) return;
    const rowSpan = Math.ceil((img.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = `span ${rowSpan}`;
}

function resizeAllMasonryItems(){
    const items = document.querySelectorAll('.card, .ad-card');
    items.forEach(item => resizeMasonryItem(item));
}

window.addEventListener('load', () => resizeAllMasonryItems());
window.addEventListener('resize', () => resizeAllMasonryItems());

const originalRenderGallery = renderGallery;
renderGallery = function(list){
    originalRenderGallery(list);
    resizeAllMasonryItems();
}
