/* gallery.js
   - sequential image loading (placeholder -> load -> fade-in)
   - precise masonry row calculation after load
   - search filter
   - modal viewer
   - ad insertion every 10 images
*/

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
  "images/catch-OHK,BNE,PTG-troubledguppy-throie.jpg",
  "images/tabz, sloan-2gf,ptg,bne-RealArtMaine-hand style.jpg"
];

const gallery = document.getElementById("galleryContainer");
const searchInput = document.getElementById("searchInput");

// ---------- filename parser (robust trimming) ----------
function parseFilename(filename) {
  const base = filename.split("/").pop().replace(/\.[^.]+$/, "");
  // split by hyphen and trim each piece
  const rawParts = base.split("-").map(p => p.trim());
  const stylesPart = rawParts.pop() || "";
  const components = rawParts;
  const styles = stylesPart.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  let tag = "", crew = null, photographer = "";
  if (components.length === 2) {
    [tag, photographer] = components;
  } else if (components.length === 3) {
    [tag, crew, photographer] = components;
  } else {
    tag = components[0] || "";
    photographer = components[components.length - 1] || "";
    if (components.length > 2) {
      crew = components.slice(1, components.length - 1).join("-") || null;
    }
  }

  const tags = tag.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);

  return {
    src: filename,
    rawBase: base,
    tags,
    crew: crew ? crew.toLowerCase() : null,
    photographer: (photographer || "").toLowerCase(),
    styles
  };
}

// ---------- modal viewer ----------
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

// ---------- sequential loader with placeholder ----------
async function loadImagesSequentially(list) {
  gallery.innerHTML = "";
  for (let i = 0; i < list.length; i++) {
    // insert ad every 10 images
    if (i > 0 && i % 10 === 0) {
      const ad = document.createElement("div");
      ad.className = "ad-card";
      ad.textContent = "Ad / Featured";
      gallery.appendChild(ad);
    }

    const meta = parseFilename(list[i]);
    await loadImageWithPlaceholder(meta);
    // call resize after each image to keep layout stable
    resizeAllMasonryItems();
  }
  // final pass
  resizeAllMasonryItems();
}

function loadImageWithPlaceholder(meta) {
  return new Promise((resolve) => {
    const card = document.createElement("div");
    card.className = "card";

    const placeholder = document.createElement("img");
    placeholder.src = "images/loading.gif";
    placeholder.alt = "Loading...";
    placeholder.className = "loading-placeholder";
    placeholder.draggable = false;
    card.appendChild(placeholder);
    gallery.appendChild(card);

    const img = new Image();
    img.src = meta.src;
    img.alt = meta.rawBase;
    img.className = "gallery-image hidden"; // hidden until fully loaded
    img.draggable = false;

    // Only allow click after loaded
    img.addEventListener("click", () => openModal(meta));

    img.addEventListener("load", () => {
      // replace placeholder
      placeholder.remove();
      // show image
      img.classList.remove("hidden");
      img.classList.add("fade-in");
      // append to card
      card.appendChild(img);

      // precise masonry calculation: use the rendered height
      const grid = document.querySelector(".gallery");
      const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows"));
      const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap"));
      // sometimes image's layout is not yet finished; use requestAnimationFrame to be safer
      requestAnimationFrame(() => {
        const rowSpan = Math.max(1, Math.ceil((img.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap)));
        card.style.gridRowEnd = `span ${rowSpan}`;
        resolve();
      });
    });

    img.addEventListener("error", () => {
      placeholder.src = "images/error.png";
      resolve();
    });
  });
}

// ---------- search / filter ----------
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

// ---------- masonry resize helpers ----------
function resizeAllMasonryItems() {
  const grid = document.querySelector(".gallery");
  if (!grid) return;
  const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows"));
  const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap"));
  document.querySelectorAll(".card, .ad-card").forEach((item) => {
    const img = item.querySelector("img");
    if (!img) return;
    // some items are ad-cards with no gallery-image; handle gracefully
    const height = img.getBoundingClientRect().height || img.naturalHeight || rowHeight;
    const rowSpan = Math.max(1, Math.ceil((height + rowGap) / (rowHeight + rowGap)));
    item.style.gridRowEnd = `span ${rowSpan}`;
  });
}

window.addEventListener("resize", () => {
  // throttle with requestAnimationFrame for smoother resizing
  requestAnimationFrame(resizeAllMasonryItems);
});

// start
document.addEventListener("DOMContentLoaded", () => {
  loadImagesSequentially(imagesList);
});
window.addEventListener("load", resizeAllMasonryItems);
