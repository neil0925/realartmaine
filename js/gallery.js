/* gallery.js
   - sequential image loading (placeholder -> load -> fade-in)
   - interaction disabled until image fully loaded
   - precise masonry row calculation after each load
   - ad insertion every 10 items
   - search filtering
*/

const imagesList = [
  "images/catch, link, wake, hugo-OHK,PTG,LTB,5G-realartmaine-throwie, tag.jpg",
  "images/bunt, some1-LG-realartmaine-stencil, tag.jpg",
  "images/ankle-LTB,2K69-realartmaine-throwie, hollow .jpg",
  "images/SLT-SLT-realartmaine-paintroller.jpg",
  "images/qjoe, link-5G-realartmaine-antistyle, straightletter.jpg",
  "images/same, catch-SLT,PTG,BNE,OHK-realartmaine-tags.jpg",
  "images/sloan-BNE,PTG-realartmaine-throwie, hollow.jpg",
  "images/sloan-PTG,BNE-realartmaine-moniker, tag, character.jpg",
  "images/tabz, sloan-2gf,ptg,bne-RealArtMaine-hand style.jpg",   
  "images/songy-realartmaine-straightletter, hollow.jpg",
  "images/thex-SLT-realartmaine-piece.jpg",
  "images/uglyboy-5G-realartmaine-throwie, antistyle.jpg",
  "images/27, learn-YME,SLT,CIRCLET,2GF,TSZ,2GF-minnowfeed-piece, stencil.JPG",
  "images/27, mobi, vazor, segway-TSZ,2GF,AWC,FTS-minnowfeed-piece, straightletter,stencil.JPG",
  “images/27, plato-HEX,TSZ,2GF-minnowfeed-tags.jpg”,
  “images/27, vazor-TSZ,AWC-minnowfeed-straightletter, piece, stencil.jpg”,
  “images/27-2GF,TSZ-minnowfeed-antistyle, throwie, hollow.JPG”,
  “images/27-TSZ,2GF-minnowfeed-paintroller.jpg”,
  “images/27-TSZ,2GF-minnowfeed-tags.JPG”,
  “images/27-TSZ-minnowfeed-straightletter, stencil.JPG”,
  “images/27-TSZ-minnowfeed-throwie, antistyle, hollow.JPG”,
  “images/5G-5G-minnowfeed-straightletter, antistyle.JPG”,
  “images/ankle-2K69,LTB-minnowfeed-tags.JPG”,
  “images/ankle-LTB,2K69-minnowfeed-throwie, fillin.JPG”,
  “images/catch, link-5G,OHK,PTG,BNE-minnowfeed-throwie, fillin, hollow.JPG”,
  “images/catch, secret, 27-BNE,PTG,OHK,5G,TSZ-minnowfeed-antistyle, stencil, blackbook.JPG”,
  “images/catch-BNE,PTG,OHK-minnowfeed-throwie, hollow.JPG”,
  “source/catch-PTG,OHK,BNE-minnowfeed-tags, throwie, fillin.JPG”,
  “images/feer, scipio-2GF-minnowfeed-piece, tags, antistyle.jpg”,
  “images/gerv-YME-minnowfeed-piece.JPG”,
  “images/grazi, 27-DWT,TSZ,2GF-minnowfeed-tags.JPG”,
  “images/ichabod-YME,CIRLCET-minnowfeed-tag.jpg”,
  “images/jumz-TSZ-minnowfeed-throwie, fillin, stencil.JPG”,
  “images/kindbud-5G,SDH-minnowfeed-antistyle, piece.JPG”,
  “images/lerk, 27-2GF-minnowfeed-tags, stencil.JPG”,
  “images/lerk, link, obee-5G,OY!-minnowfeed-piece, paintroller.JPG”,
  “images/LSE-LSE-minnowfeed-straightletter.jpg”,
  “images/mobi, grazi-DWT,TSZ-minnowfeed-straightletter, tags.JPG”,
  “images/mobi-TSZ-minnowfeed-straightletter.JPG”,
  “images/ojea3-HEX,OY!-minnowfeed-piece.JPG”,
  “images/ojea3-HEX,OY!-minnowfeed-tags.JPG”,
  “images/qjoe-5G,UK-minnowfeed-antistyle, piece.JPG”,
  “images/qjoe-5G-minnowfeed-tags.JPG”,
  “images/rune, 27-LTB,2K69,TSZ,2GF-minnowfeed-throwie, fillin, antistyle.JPG”,
  “images/rune-LTB,2K69-minnowfeed-piece, antistyle.JPG”,
  “images/same, 27, enya-SLT,TVT,TSZ,5G-minnowfeed-tags, stencil.jpg”,
  “images/segway-FTS-minnowfeed-throwie, hollow.JPG”,
  “images/spek, segway, 27, port, melts, yalts-FTS,TSZ,CIRCLET,YME,IMS-minnowfeed-tags, moniker.JPG”,
  “images/spots, wilt, 27-VC,2K69,HKC-minnowfeed-blackbook, antistyle.JPG”,
  “images/wilt-2K69,VC-minnowfeed-blackbook.jpg”,
  “images/wuhan,27-2GF,TSZ-minnowfeed-tags, stencil.JPG”


];

const gallery = document.getElementById("galleryContainer");
const searchInput = document.getElementById("searchInput");

// parse filename to metadata
function parseFilename(filename) {
  const base = filename.split("/").pop().replace(/\.[^.]+$/, "");
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

// modal viewer
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

// load images one-by-one with placeholder
async function loadImagesSequentially(list) {
  if (!gallery) return;
  gallery.innerHTML = "";

  for (let i = 0; i < list.length; i++) {
    if (i > 0 && i % 10 === 0) {
      const ad = document.createElement("div");
      ad.className = "ad-card";
      ad.textContent = "Ad / Featured";
      gallery.appendChild(ad);
    }

    const meta = parseFilename(list[i]);
    await loadImageWithPlaceholder(meta);
    // keep layout stable after each append
    resizeAllMasonryItems();
  }
  // final layout fix
  resizeAllMasonryItems();
}

function loadImageWithPlaceholder(meta) {
  return new Promise((resolve) => {
    const card = document.createElement("div");
    card.className = "card";

    // placeholder image (no hover)
    const placeholder = document.createElement("img");
    placeholder.src = "images/loading.gif";
    placeholder.alt = "Loading...";
    placeholder.className = "loading-placeholder";
    placeholder.draggable = false;
    card.appendChild(placeholder);
    gallery.appendChild(card);

    // real image object
    const img = new Image();
    img.src = meta.src;
    img.alt = meta.rawBase;
    img.className = "gallery-image hidden";
    img.draggable = false;

    // hook click (modal) — will work after load
    img.addEventListener("click", () => openModal(meta));

    // when loaded: replace placeholder, show image, compute grid span
    img.addEventListener("load", () => {
      placeholder.remove();
      img.classList.remove("hidden");
      img.classList.add("fade-in");
      card.appendChild(img);

      // compute row span reliably on next frame
      requestAnimationFrame(() => {
        const grid = document.querySelector(".gallery");
        const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows") || "10");
        const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");
        const height = img.getBoundingClientRect().height;
        const rowSpan = Math.max(1, Math.ceil((height + rowGap) / (rowHeight + rowGap)));
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

// search/filter
function filterGallery(q) {
  if (!gallery) return;
  q = (q || "").trim().toLowerCase();
  if (!q) {
    loadImagesSequentially(imagesList);
    return;
  }
  const filtered = imagesList.filter(src => {
    const meta = parseFilename(src);
    const hay = [...meta.tags, meta.crew || "", meta.photographer, ...meta.styles].join(" ");
    return hay.includes(q);
  });
  loadImagesSequentially(filtered);
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => filterGallery(e.target.value));
}

// masonry resize helper
function resizeAllMasonryItems() {
  const grid = document.querySelector(".gallery");
  if (!grid) return;
  const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows") || "10");
  const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");

  document.querySelectorAll(".card, .ad-card").forEach(item => {
    const img = item.querySelector("img");
    if (!img) {
      // keep ad-cards default
      item.style.gridRowEnd = null;
      return;
    }
    const height = img.getBoundingClientRect().height || rowHeight;
    const rowSpan = Math.max(1, Math.ceil((height + rowGap) / (rowHeight + rowGap)));
    item.style.gridRowEnd = `span ${rowSpan}`;
  });
}

// start
document.addEventListener("DOMContentLoaded", () => loadImagesSequentially(imagesList));
window.addEventListener("resize", () => requestAnimationFrame(resizeAllMasonryItems));
window.addEventListener("load", resizeAllMasonryItems);
