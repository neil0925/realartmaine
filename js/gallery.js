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
  "images/5G-5G-minnowfeed-straightletter, antistyle.JPG",
  "images/qjoe, link-5G-realartmaine-antistyle, straightletter.jpg",
  "images/same, catch-SLT,PTG,BNE,OHK-realartmaine-tags.jpg",
  "images/sloan-BNE,PTG-realartmaine-throwie, hollow.jpg",
  "images/zone-ZPLK-antistyle, wildstyle.JPG",
  "images/vroom-ZPLK-piece, character.JPG",
  "images/lufa-hex-ZPLK-tags, piece.JPG",
  "images/nare-az-ZPLK-piece, character.JPG",
  "images/wilt-2K69,VC-minnowfeed-blackbook.jpg",
  "images/spek, segway, 27, port, melts, yalts-FTS,TSZ,CIRCLET,YME,IMS-minnowfeed-tags, moniker.JPG",
  "images/segway-FTS-minnowfeed-throwie, hollow.JPG",
  "images/same, catch-SLT,PTG,BNE,OHK-realartmaine-tag.jpg",
  "images/same, 27, enya-SLT,TVT,TSZ,5G-minnowfeed-tags, stencil.jpg",
  "images/rune-LTB,2K69-minnowfeed-piece, antistyle.JPG",
  "images/rune, 27-LTB,2K69,TSZ,2GF-minnowfeed-throwie, fillin, antistyle.JPG",
  "images/qjoe-5G,UK-minnowfeed-antistyle, piece.JPG",
  "images/qjoe, link-5G-realartmaine-antistyle, straightletter.jpg",
  "images/ojea3-HEX,OY!-minnowfeed-piece.JPG",
  "images/ojea3-HEX,OY!-minnowfeed-tags.JPG",
  "images/mobi-TSZ-minnowfeed-straightletter.JPG",
  "images/lerk, link, obee-5G,OY!-minnowfeed-piece, paintroller.JPG",
  "images/lerk, 27-2GF-minnowfeed-tags, stencil.JPG",
  "images/kindbud-5G,SDH-minnowfeed-antistyle, piece.JPG",
  "images/jumz-TSZ-minnowfeed-throwie, fillin, stencil.JPG",
  "images/ichabod-YME,CIRLCET-minnowfeed-tag.jpg",
  "images/grazi, 27-DWT,TSZ,2GF-minnowfeed-tags.JPG",
  "images/gerv-YME-minnowfeed-piece.JPG",
  "images/feer, scipio-2GF-minnowfeed-piece, tags, antistyle.jpg",
  "images/catch-PTG,OHK,BNE-minnowfeed-tags, throwie, fillin.JPG",
  "images/catch-BNE,PTG,OHK-minnowfeed-throwie, hollow.JPG",
  "images/catch, secret, 27-BNE,PTG,OHK,5G,TSZ-minnowfeed-antistyle, stencil, blackbook.JPG",
  "images/catch, link-5G,OHK,PTG,BNE-minnowfeed-throw",
  "images/ankle-LTB,2K69-minnowfeed-throwie, fillin.JPG",
  "images/ankle-2K69,LTB-minnowfeed-tags.JPG",
  "images/LSE-LSE-minnowfeed-straightletter.jpg",
  "images/2GF-realartmaine-tag.jpg",
  "images/27-TSZ,2GF-realartmaine-throwie, antistyle.jpg",
  "images/ankle-LTB,2K69-realartmaine-tags.jpg",
  "images/ankle-LTB,2K69-realartmaine-throwie, fillin.jpg",
  "images/ankle, ne1, symbol, spud-LTB, 2K69, CTS-realartmaine-throwie, straightletter, tags, fillin_.jpg",
  "images/ankor-SFL-realartmaine-straightletter.jpg",
  "images/aura-OHK-realartmaine-straightletter, piece.jpg",
  "images/auto-CTS,TNL-realartmaine-tags, character.jpg",
  "images/bestie by auto-CTS,TNL-realartmaine-tags, antistyle.jpg",
  "images/bosh, doves-SLT-realartmaine-throwie, fillin, tags.jpg",
  "images/catch-OHK,PTG,BNE-realartmaine-piece, antistyle.jpg",
  "images/catch, payze-PTG,OHK,BNE,IMS-realartmaine-straightletter, fillin.jpg",
  "images/catch, pyle-PTG,BNE,OHK-realartmaine-throwie, hollow, notmaine.jpg",
  "images/chew-realartmaine-throwie, hollow.jpg",
  "images/digitalnail-realartmaine-stencil.jpg",
  "images/digitalnail-realartmaine-stencil(1).jpg",
  "images/dove, crones, reck-SLT,5G-realartmaine-throwie, tag, fillin.jpg",
  "images/doves-SLT,CFM-realartmaine-piece, character.jpg",
  "images/doves-SLT,CFM-realartmaine-straightletter.jpg",
  "images/doves, 2yung-pieces-realartmaine-pieces.jpg",
  "images/ducky-realartmaine-antistyle, paintroller.jpg",
  "images/ducky-realartmaine-antistyle, paintroller(1).jpg",
  "images/ducky-realartmaine-character, antistyle, portlandbee.jpg",
  "images/ducky-realartmaine-character, antistyle, portlandbee(1).jpg",
  "images/ehsk-realartmaine-straightletter.jpg",
  "images/enya-5G-realartmaine-antistyle.jpg",
  "images/enya, osha, auto, sloan-PTG,BNE,CTS,TNL,5G-realartmaine-tags.jpg",
  "images/enzyme-DPW-realartmaine-throwie, fillin.jpg",
  "images/epser-UK,TMS-realartmaine-straightletter.jpg",
  "images/epser-UK,TMS-realartmaine-tag.jpg",
  "images/feer, kite, enzyme, loupe, auto-DWT,DPW,TNL,CTS-realartmaine-tags, piece, straightletter, antistyle.jpg",
  "images/gervs-YME-realartmaine-piece.jpg",
  "images/grazi-DWT-realartmaine-antistyle, throwie, hollow.jpg",
  "images/grazi-DWT-realartmaine-straightletter.jpg",
  "images/grazi-DWT-realartmaine-throwie, hollow.jpg",
  "images/grazi, some1-DWT-realartmaine-tags, stencil.jpg",
  "images/heart, knave, pout, ojea3, doves, merlin-CTS,TNL,HEX,OY!,CTS,SK8-realartmaine-throwie, fillin, straightletter, tags.jpg",
  "images/hiphop, ducky-realartmaine-antistyle, character, portlandbee.jpg",
  "images/key-2K69-realartmaine-throwie, fillin.jpg",
  "images/muska, piza-KYS-realartmaine-piece.jpg",
  "images/muska, piza-KYS-realartmaine-straightletter.jpg",
  "images/neptune, mobi-DNB,AWC,TSZ-realartmaine-tags, character, hollow.jpg",
  "images/notice-realartmaine-straightletter.jpg",
  "images/pigeon-realartmaine-character.jpg",
  "images/salud, senegra-PTG,OHK-realartmaine-tags.jpg",
  "images/same, calcium, ducky, yart-SLT,IMS,TVT,OHK-realartmaine-throwie, fillin, character, antistyle.jpg",
  "images/skipio, pyle-2GF,PTG,OHK,BNE-realartmaine-throwie, fillin.jpg",
  "images/soft, same-SLT,2K69-realartmaine-throwie, fillin.jpg",
  "images/some1-realartmaine-character, hollow.jpg
  "images/suer, same-SLT,TVT,TMS-realartmaine-throwie, hollow, tags.jpg",
  "images/trak, hebrew-LTB,2K69-realartmaine-tags.jpg",
  "images/wake, ducky-LTB-realartmaine-throwie, hollow, character, antistyle.jpg",
  "images/mobi, grazi-DWT,TSZ-minnowfeed-straightletter, tags.JPG",
  "images/spots, wilt, 27-VC,2K69,HKC-minnowfeed-blackbook, antistyle.JPG",
  "images/hebrew-cts-ZPLK-straightletter.JPG",
  "images/cgask-ptg-ZPLK-straightletter.JPG",
  "images/fish, symbol, grazi, spots, loupe-TNL,CTS,DWT,2K69,VC-ZPLK-piece, throwie, fillin, antistyle, tags.JPG",
  "images/catch, soepo-PTG,BNE,OHK-throwie, fillin.JPG",
  "images/aira-ZPLK-piece.JPG",
  "images/aira-ZPLK-piece, character.JPG",
  "images/aidan, grazi, loupe-CTS,TNL,DWT-ZPLK-straightletter, piece, fillin.JPG",
  "images/sloan-PTG,BNE-realartmaine-moniker, tag, character.jpg",
  "images/tabz, sloan-2gf,ptg,bne-RealArtMaine-hand style.jpg",
  "images/songy-realartmaine-straightletter, hollow.jpg",
  "images/thex-SLT-realartmaine-piece.jpg",
  "images/uglyboy-5G-realartmaine-throwie, antistyle.jpg",
  "images/27, learn-YME,SLT,CIRCLET,2GF,TSZ,2GF-minnowfeed-piece, stencil.JPG",
  "images/27, mobi, vazor, segway-TSZ,2GF,AWC,FTS-minnowfeed-piece, straightletter, stencil.JPG",
  "images/27, plato-HEX,TSZ,2GF-minnowfeed-tags.jpg"
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
  caption.textContent = `"${meta.tags.join(", ")}" flicked by ${meta.photographer}`;


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
