// js/gallery.js
// Simple gallery loader + parser that reads a hardcoded list of images.
// NOTE: GitHub Pages does not expose directory listing, so we will keep
// a small `imagesList` array you update when you add images via GitHub UI.

const imagesList = [
"images/5G-TroubledGuppy-piece.jpg",
];

const gallery = document.getElementById('galleryContainer');
const searchInput = document.getElementById('searchInput');

// parse filename into metadata
function parseFilename(filename) {
  // Remove path and extension:
  const base = filename.split('/').pop().replace(/\.[^.]+$/, '');
  // Split last part (styles) off by finding the last hyphen
  // We assume: tag[-crew]-photographer-styles...
  const parts = base.split('-');
  // styles are after the last hyphen, everything before are components
  const stylesPart = parts.pop();
  const components = parts; // 2 or 3 components
  const styles = stylesPart.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  // determine tag / crew / photographer
  let tag = '', crew = null, photographer = '';
  if (components.length === 2) {
    [tag, photographer] = components;
  } else if (components.length === 3) {
    [tag, crew, photographer] = components;
  } else {
    // fallback: first = tag, last = photographer, middle join as crew
    tag = components[0] || '';
    photographer = components[components.length-1] || '';
    if (components.length > 2) {
      crew = components.slice(1, components.length-1).join('-');
    }
  }

  // allow multiple tags inside tag string split by commas
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
  // create modal elements
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) document.body.removeChild(backdrop);
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
    // insert ad every 10 images (index 9, 19, 29... => i % 10 === 9)
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
    // search across tags, crew, photographer, styles
    const hay = [
      ...meta.tags,
      meta.crew || '',
      meta.photographer,
      ...meta.styles
    ].join(' ');
    return hay.includes(q);
  });
  renderGallery(filtered);
}

// initial render
renderGallery(imagesList);

// hook up search
if (searchInput) {
  searchInput.addEventListener('input', (e) => filterGallery(e.target.value));
}

