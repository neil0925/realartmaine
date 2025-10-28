// --- Gallery Image List ---
const imagesList = [
  "images/5G-TroubledGuppy-piece.jpg",
  "images/aura-OHK-troubledguppy-piece.jpg",
  "images/blame-troubledguppy-piece.jpg",
  "images/brik-PTG-troubledguppy-piece.jpg",
  "images/burek-2GF-troubledguppy-piece.jpg",
  "images/cache, pyle-BNE,OHK,PTG-troubledguppy-piece.jpg",
  "images/feer, give-MFH-troubledguppy-piece, hand style.jpg",
  "images/feer-troubledguppy-throie.jpg",
  "images/enzyme-dpw-troubledguppy-throie.jpg",
  "images/Enya, 5G-troubledguppy-piece.jpg",
  "images/catch-OHK,BNE,PTG-troubledguppy-piece.jpg",
  "images/catch-OHK,BNE,PTG-troubledguppy-throie.jpg"
];

const gallery = document.getElementById("galleryContainer");
const searchInput = document.getElementById("searchInput");

// --- Parse filenames into metadata ---
function parseFilename(filename) {
  const base = filename.split("/").pop().replace(/\.[^.]+$/, "");
  const parts = base.split("-");
  const stylesPart = parts.pop();
  const components = parts;
  const styles = stylesPart
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  let tag = "",
    crew = null,
    photographer = "";
  if (components.length === 2) {
    [tag, photographer] = components;
  } else if (components.length === 3) {
    [tag, crew, photographer] = components;
  } else {
    tag = components[0] || "";
    photographer = components[components.length - 1] || "";
    if (components.length > 2) {
      crew = components.slice(1, components.length - 1).join("-");
    }
  }

  const tags = tag
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  return {
    src: filename,
    rawBase: base,
    tags,
    crew: crew ? crew.toLowerCase() : null,
    photographer: photographer.toLowerCase(),
    styles,
  };
}

// --- Modal Viewer ---
function openModal(meta) {
  document.body.style.overflow = "hidden";

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      document.body.removeChild(backdrop);
      document.body.style.overflow = "";
    }
  });

  const modal = document.createElement("div");
  modal.className = "modal";

  const img = document.createElement("img");
  img.src = meta.src;
  img.alt = meta.rawBase;

  const caption = document.createElement("div");
  caption.className = "caption";
  const crewPart = meta.crew ? ` (${meta.crew})` : "";
  caption.textContent = `"${meta.tags.join(", ")}" flicked by ${meta.photographer}${crewPart}`;

  modal.appendChild(img);
  modal.appendChild(caption);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

// --- Load Images Sequentially (with placeholder + fade-in) ---
async function loadImagesSequentially(list) {
  gallery.innerHTML = "";

  for (let i = 0; i < list.length; i++) {
    // every 10th image → ad card
    if (i > 0 && i % 10 === 0) {
      const ad = document.createElement("div");
      ad.className = "ad-card";
      ad.textContent = "Ad / Featured";
      gallery.appendChild(ad);
    }

    const meta = parseFilename(list[i]);
    await loadImageWithPlaceholder(meta);
    resizeAllMasonryItems(); // keep grid consistent
  }
}

function loadImageWithPlaceholder(meta) {
  return new Promise((resolve) => {
    const card = document.createElement("div");
    card.className = "card";

    const placeholder = document.createElement("img");
    placeholder.src = "images/loading.gif";
    placeholder.alt = "Loading...";
    placeholder.className = "loading-placeholder";
    card.appendChild(placeholder);
    gallery.appendChild(card);

    const img = new Image();
    img.src = meta.src;
    img.alt = meta.rawBase;
    img.className = "gallery-image hidden";
    img.draggable = false;

    img.addEventListener("click", () => openModal(meta));

    img.addEventListener("load", () => {
      placeholder.remove();
      img.classList.remove("hidden");
      img.classList.add("fade-in");
      card.appendChild(img);
      resolve();
    });

    img.addEventListener("error", () => {
      placeholder.src = "images/error.png";
      resolve();
    });
  });
}

// --- Search Filter ---
function filterGallery(q) {
  q = (q || "").trim().toLowerCase();
  if (!q) {
    loadImagesSequentially(imagesList);
    return;
  }
  const filtered = imagesList.filter((src) => {
    const meta = parseFilename(src);
    const hay = [...meta.tags, meta.crew || "", meta.photographer, ...meta.styles].join(" ");
    return hay.includes(q);
  });
  loadImagesSequentially(filtered);
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => filterGallery(e.target.value));
}

// --- Masonry Layout Helpers ---
function resizeMasonryItem(item) {
  const grid = document.querySelector(".gallery");
  const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows"));
  const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap"));
  const img = item.querySelector("img");
  if (!img) return;
  const rowSpan = Math.ceil((img.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
  item.style.gridRowEnd = `span ${rowSpan}`;
}

function resizeAllMasonryItems() {
  const items = document.querySelectorAll(".card, .ad-card");
  items.forEach((item) => resizeMasonryItem(item));
}

window.addEventListener("load", () => resizeAllMasonryItems());
window.addEventListener("resize", () => resizeAllMasonryItems());

// --- Start Loading ---
document.addEventListener("DOMContentLoaded", () => loadImagesSequentially(imagesList));
