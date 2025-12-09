/* gallery.js
   - sequential image loading (placeholder -> load -> fade-in)
   - interaction disabled until image fully loaded
   - precise masonry row calculation after each load
   - ad insertion every 10 items
   - search filtering
*/

let imagesList = [
  "/assets/images/catch, link, wake, hugo-OHK,PTG,LTB,5G-realartmaine-throwie, tag.jpg",
  "/assets/images/same-SLT,TVT-realartmaine-tags.jpg",
  "/assets/images/same-SLT,TVT-realartmaine-piece, staightletter.jpg",
  "/assets/images/peck-SLF-realartmaine-throwie, bubble letter, hollow.jpg",
  "/assets/images/salud-PTG-realartmaine-tags, character, hollow.jpg",
  "/assets/images/salud-PTG-realartmaine-tags, hollow, character.jpg",
  "/assets/images/bunt, some1-LG-realartmaine-stencil, tag.jpg",
  "/assets/images/ankle-LTB,2K69-realartmaine-throwie, hollow .jpg",
  "/assets/images/wake-LTB-realartmaine-fillin, throwie.jpg",
  "/assets/images/SLT-SLT-realartmaine-paintroller.jpg",
  "/assets/images/pest-realartmaine-throwie, bubble letter, hollow.jpg",
  "/assets/images/rune-LTB,2K69-realartmaine-throwie, hollow, bubble letter.jpg",
  "/assets/images/5G-5G-minnowfeed-straightletter, antistyle.JPG",
  "/assets/images/qjoe, link-5G-realartmaine-antistyle, straightletter.jpg",
  "/assets/images/link-5G,CRAFT-realartmaine-antistyle, piece.jpg",
  "/assets/images/prizm, ruski, cats-realartmaine-paintroller.jpg",
  "/assets/images/some1-realartmaine-stencil.jpg",
  "/assets/images/owell-realartmaine-antistyle, throwie.jpg",
  "/assets/images/owell-realartmaine-antistyle, throwie, fillin.jpg",
  "/assets/images/sloan-BNE,PTG-realartmaine-throwie, hollow.jpg",
  "/assets/images/zone-ZPLK-antistyle, wildstyle.JPG",
  "/assets/images/vroom-ZPLK-piece, character.JPG",
  "/assets/images/lufa-hex-ZPLK-tags, piece.JPG",
  "/assets/images/nare-az-ZPLK-piece, character.JPG",
  "/assets/images/wilt-2K69,VC-minnowfeed-blackbook.jpg",
  "/assets/images/spek, segway, 27, port, melts, yalts-FTS,TSZ,CIRCLET,YME,IMS-minnowfeed-tags, moniker.JPG",
  "/assets/images/segway-FTS-minnowfeed-throwie, hollow.JPG",
  "/assets/images/same, catch-SLT,PTG,BNE,OHK-realartmaine-tag.jpg",
  "/assets/images/same, 27, enya-SLT,TVT,TSZ,5G-minnowfeed-tags, stencil.jpg",
  "/assets/images/rune-LTB,2K69-minnowfeed-piece, antistyle.JPG",
  "/assets/images/rune, 27-LTB,2K69,TSZ,2GF-minnowfeed-throwie, fillin, antistyle.JPG",
  "/assets/images/qjoe-5G,UK-minnowfeed-antistyle, piece.JPG",
  "/assets/images/qjoe, link-5G-realartmaine-antistyle, straightletter.jpg",
  "/assets/images/ojea3-HEX,OY!-minnowfeed-piece.JPG",
  "/assets/images/ojea3-HEX,OY!-minnowfeed-tags.JPG",
  "/assets/images/mobi-TSZ-minnowfeed-straightletter.JPG",
  "/assets/images/lerk, link, obee-5G,OY!-minnowfeed-piece, paintroller.JPG",
  "/assets/images/lerk, 27-2GF-minnowfeed-tags, stencil.JPG",
  "/assets/images/kindbud-5G,SDH-minnowfeed-antistyle, piece.JPG",
  "/assets/images/jumz-TSZ-minnowfeed-throwie, fillin, stencil.JPG",
  "/assets/images/ichabod-YME,CIRLCET-minnowfeed-tag.jpg",
  "/assets/images/grazi, 27-DWT,TSZ,2GF-minnowfeed-tags.JPG",
  "/assets/images/gerv-YME-minnowfeed-piece.JPG",
  "/assets/images/feer, scipio-2GF-minnowfeed-piece, tags, antistyle.jpg",
  "/assets/images/catch-PTG,OHK,BNE-minnowfeed-tags, throwie, fillin.JPG",
  "/assets/images/catch-BNE,PTG,OHK-minnowfeed-throwie, hollow.JPG",
  "/assets/images/catch, secret, 27-BNE,PTG,OHK,5G,TSZ-minnowfeed-antistyle, stencil, blackbook.JPG",
  "/assets/images/ankle-LTB,2K69-minnowfeed-throwie, fillin.JPG",
  "/assets/images/ankle-2K69,LTB-minnowfeed-tags.JPG",
  "/assets/images/LSE-LSE-minnowfeed-straightletter.jpg",
  "/assets/images/2GF-realartmaine-tag.jpg",
  "/assets/images/27-TSZ,2GF-realartmaine-throwie, antistyle.jpg",
  "/assets/images/ankle-LTB,2K69-realartmaine-tags.jpg",
  "/assets/images/ankle, ne1, symbol, spud-LTB, 2K69, CTS-realartmaine-throwie, straightletter, tags, fillin_.jpg",
  "/assets/images/ankor-SFL-realartmaine-straightletter.jpg",
  "/assets/images/aura-OHK-realartmaine-straightletter, piece.jpg",
  "/assets/images/auto-CTS,TNL-realartmaine-tags, character.jpg",
  "/assets/images/bosh, doves-SLT-realartmaine-throwie, fillin, tags.jpg",
  "/assets/images/catch-OHK,PTG,BNE-realartmaine-piece, antistyle.jpg",
  "/assets/images/catch, payze-PTG,OHK,BNE,IMS-realartmaine-straightletter, fillin.jpg",
  "/assets/images/catch, pyle-PTG,BNE,OHK-realartmaine-throwie, hollow, notmaine.jpg",
  "/assets/images/chew-realartmaine-throwie, hollow.jpg",
  "/assets/images/digitalnail-realartmaine-stencil.jpg",
  "/assets/images/digitalnail-realartmaine-stencil(1).jpg",
  "/assets/images/wake, dean, link, auto, dove-LTB,CFM,SLT,5G,CTS,TNL,SDH,CRAFT-realartmaine-piece, antistyle, paintroller.jpg",
  "/assets/images/wake, rune, doves, same-SLT,LTB,TVT-realartmaine-throwie, piece, fillin, tags.jpg",
  "/assets/images/wd40-realartmaine-tags.jpg",
  "/assets/images/write-SFL-realartmaine-piece, straightletter.jpg",
  "/assets/images/yami, high8, wake, secret-5G,LTB,OHK-realartmaine-antistyle, tags, pieces.jpg",
  "/assets/images/feer, kite, enzyme, loupe, auto-DWT,DPW,TNL,CTS-realartmaine-tags, piece, straightletter, antistyle.jpg",
  "/assets/images/gervs-YME-realartmaine-piece.jpg",
  "/assets/images/grazi-DWT-realartmaine-antistyle, throwie, hollow.jpg",
  "/assets/images/grazi-DWT-realartmaine-straightletter.jpg",
  "/assets/images/grazi-DWT-realartmaine-throwie, hollow.jpg",
  "/assets/images/grazi, some1-DWT-realartmaine-tags, stencil.jpg",
  "/assets/images/heart, knave, pout, ojea3, doves, merlin-CTS,TNL,HEX,OY!,CTS,SK8-realartmaine-throwie, fillin, straightletter, tags.jpg",
  "/assets/images/hiphop, ducky-realartmaine-antistyle, character, portlandbee.jpg",
  "/assets/images/key-2K69-realartmaine-throwie, fillin.jpg",
  "/assets/images/solar-DNB-realartmaine-tags.jpg",
  "/assets/images/slug, pest, some1, vane, brik-PTG,SFL-realartmaine-stencil, tags.jpg",
  "/assets/images/some1-realartmaine-stencil.jpg",
  "/assets/images/some1-realartmaine-piece.jpg",
  "/assets/images/towel-FK-realartmaine-tags.jpg",
  "/assets/images/towel, sewer, salud, klerm, kindbud-FK,PTG,TNL,5G-realartmaine-tags, character.jpg",
  "/assets/images/wake-LTB-realartmaine-throwie, fillin.jpg",
  "/assets/images/27-TSZ,2GF-minnowfeed-paintroller.jpg",
  "/assets/images/jipso, alps, goal-PTG-paintroller, tags, throwie, straightletter, fillin, character.jpg",
  "/assets/images/ducky-realartmaine-antistyle, paintroller.jpg",
  "/assets/images/enya-5G-realartmaine-antistyle.jpg",
  "/assets/images/enzyme-DPW-realartmaine-throwie, fillin.jpg",
  "/assets/images/epser-UK,TMS-realartmaine-straightletter.jpg",
  "/assets/images/epser-UK,TMS-realartmaine-tag.jpg",
  "/assets/images/muska, piza-KYS-realartmaine-piece.jpg",
  "/assets/images/muska, piza-KYS-realartmaine-straightletter.jpg",
  "/assets/images/neptune, mobi-DNB,AWC,TSZ-realartmaine-tags, character, hollow.jpg",
  "/assets/images/notice-realartmaine-straightletter.jpg",
  "/assets/images/pigeon-realartmaine-character.jpg",
  "/assets/images/salud, senegra-PTG,OHK-realartmaine-tags.jpg",
  "/assets/images/same, calcium, ducky, yart-SLT,IMS,TVT,OHK-realartmaine-throwie, fillin, character, antistyle.jpg",
  "/assets/images/skipio, pyle-2GF,PTG,OHK,BNE-realartmaine-throwie, fillin.jpg",
  "/assets/images/soft, same-SLT,2K69-realartmaine-throwie, fillin.jpg",
  "/assets/images/some1-realartmaine-character, hollow.jpg",
  "/assets/images/suer, same-SLT,TVT,TMS-realartmaine-throwie, hollow, tags.jpg",
  "/assets/images/trak, hebrew-LTB,2K69-realartmaine-tags.jpg",
  "/assets/images/wake, ducky-LTB-realartmaine-throwie, hollow, character, antistyle.jpg",
  "/assets/images/mobi, grazi-DWT,TSZ-minnowfeed-straightletter, tags.JPG",
  "/assets/images/spots, wilt, 27-VC,2K69,HKC-minnowfeed-blackbook, antistyle.JPG",
  "/assets/images/hebrew-cts-ZPLK-straightletter.JPG",
  "/assets/images/fish, symbol, grazi, spots, loupe-TNL,CTS,DWT,2K69,VC-ZPLK-piece, throwie, fillin, antistyle, tags.JPG",
  "/assets/images/catch, soepo-PTG,BNE,OHK-throwie, fillin.JPG",
  "/assets/images/aira-ZPLK-piece.JPG",
  "/assets/images/aira-ZPLK-piece, character.JPG",
  "/assets/images/aidan, grazi, loupe-CTS,TNL,DWT-ZPLK-straightletter, piece, fillin.JPG",
  "/assets/images/sloan-PTG,BNE-realartmaine-moniker, tag, character.jpg",
  "/assets/images/tabz, sloan-2gf,ptg,bne-RealArtMaine-hand style.jpg",
  "/assets/images/songy-realartmaine-straightletter, hollow.jpg",
  "/assets/images/salud-PTG,OHK-realartmaine-tags, character.jpg",
  "/assets/images/learn-YME,CIRCLET-realartmaine-piece.jpg",
  "/assets/images/iowa-3FK-realartmaine-tags.jpg",
  "/assets/images/enya, osha, auto, lego, sloan-PTG,BNE,CTS,TNL,5G-realartmaine-tags.jpg",
  "/assets/images/port-IMS-realartmaine-piece.jpg",
  "/assets/images/thex-SLT-realartmaine-piece.jpg",
  "/assets/images/uglyboy-5G-realartmaine-throwie, antistyle.jpg",
  "/assets/images/27, learn-YME,SLT,CIRCLET,2GF,TSZ,2GF-minnowfeed-piece, stencil.JPG",
  "/assets/images/27, mobi, vazor, segway-TSZ,2GF,AWC,FTS-minnowfeed-piece, straightletter, stencil.JPG",
  "/assets/images/27, plato-HEX,TSZ,2GF-minnowfeed-tags.jpg"
];
// remove exact-duplicate paths while preserving first occurrence order
imagesList = Array.from(new Set(imagesList.map(s => s.trim())));

// <-- ADDITION: ensure DOM refs and load token exist before any function runs -->
const gallery = document.getElementById("galleryContainer");
const searchInput = document.getElementById("searchInput");
// load-run token used to cancel obsolete loads
let currentLoadId = 0;
// <-- end addition -->

const DEFAULT_ASPECT = 0.66;

// Ad configuration: set publisherId to 'ca-pub-XXXXXXXXXXXX' to enable real AdSense.
// Leave empty ('') to keep plain "Ad placeholder" boxes.
const ADS_CONFIG = {
  publisherId: 'ca-pub-6627789827798682', // <-- set to your publisher id
  adInterval: 25   // insert ad every 25 images
};

// helper to ensure the AdSense loader script is present (only if publisherId provided)
function ensureAdsLoader(publisherId) {
  if (!publisherId) return;
  // detect existing loader either by data-ad-client attribute or by src path
  const existing = document.querySelector('script[data-ad-client], script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
  if (existing) return;
  const s = document.createElement('script');
  s.async = true;
  // use the same src + client query param and crossorigin attribute that AdSense provided
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(publisherId);
  s.crossOrigin = "anonymous";
  // set data-ad-client for script detection consistency
  s.setAttribute('data-ad-client', publisherId);
  document.head.appendChild(s);
}

// ----------------- CHANGES START -----------------
// missing helper used throughout the file — compute stable rendered height
function getRenderedImageHeight(img, availableWidth) {
  if (!img) return 0;
  const cw = (typeof availableWidth === "number" && availableWidth > 0) ? availableWidth : (img.clientWidth || 0);
  if (img.naturalWidth && img.naturalHeight && cw > 0) {
    return (cw * img.naturalHeight) / img.naturalWidth;
  }
  const rect = img.getBoundingClientRect ? img.getBoundingClientRect() : { height: 0 };
  return rect.height || 0;
}
// ----------------- CHANGES END -----------------

// helper: normalize token string
function normToken(s) {
  return (s || "").toString().trim().toLowerCase();
}

// build a set of searchable tokens from parsed metadata
function buildMetaTokens(meta) {
  const tokens = new Set();

  // tags and styles are arrays already (from parseFilename)
  (meta.tags || []).forEach(t => {
    const parts = t.split(/[\s,;]+/).map(normToken).filter(Boolean);
    parts.forEach(p => tokens.add(p));
  });
  (meta.styles || []).forEach(s => {
    const parts = s.split(/[\s,;]+/).map(normToken).filter(Boolean);
    parts.forEach(p => tokens.add(p));
  });

  // crew (may contain commas/spaces)
  if (meta.crew) {
    meta.crew.split(/[\s,;]+/).map(normToken).filter(Boolean).forEach(p => tokens.add(p));
  }

  // photographer (may contain commas/spaces)
  if (meta.photographer) {
    meta.photographer.split(/[\s,;]+/).map(normToken).filter(Boolean).forEach(p => tokens.add(p));
  }

  // also include rawBase words (helpful for some filenames)
  (meta.rawBase || "").split(/[\s,;,_-]+/).map(normToken).filter(Boolean).forEach(p => tokens.add(p));

  return tokens;
}

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

/* Replace the existing loadImagesSequentially + loadImageWithPlaceholder logic
   with a two-phase approach:
   - Phase A: create and append all cards+placeholders (so the grid can form columns)
   - Phase B: sequentially load each image into the already-appended card
*/

// load images one-by-one with placeholder
async function loadImagesSequentially(list) {
  if (!gallery) return;
  const myLoadId = ++currentLoadId;
  gallery.innerHTML = "";

  // read gallery metrics for column calculation
  const grid = gallery;
  const gap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");
  const galleryWidth = Math.max(200, grid.clientWidth || document.documentElement.clientWidth);
  // estimate number of columns based on min column width used in CSS (keep in sync)
  const minCol = 180; // match CSS
  const cols = Math.max(1, Math.floor((galleryWidth + gap) / (minCol + gap)));
  const columnWidth = Math.max(120, Math.floor((galleryWidth - (cols - 1) * gap) / cols));

  // Phase A: create all image cards+placeholders synchronously (NO ads here)
  const cards = [];
  for (let i = 0; i < list.length; i++) {
    if (myLoadId !== currentLoadId) return;

    const meta = parseFilename(list[i]);

    const card = document.createElement("div");
    card.className = "card";

    const wrap = document.createElement("div");
    wrap.className = "image-wrap";

    // conservative placeholder height based on estimated column width
    const defaultH = Math.max(80, Math.round(columnWidth * DEFAULT_ASPECT));
    wrap.style.height = `${defaultH}px`;

    // placeholder wrapper (CSS spinner, not an img)
    const placeholder = document.createElement("div");
    placeholder.className = "placeholder-box";

    const spinner = document.createElement("div");
    spinner.className = "spinner";
    placeholder.appendChild(spinner);

    wrap.appendChild(placeholder);
    card.appendChild(wrap);
    gallery.appendChild(card);

    // set initial grid-row span so layout immediately forms columns
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows") || "10");
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");
    const initialRowSpan = Math.max(1, Math.ceil((defaultH + rowGap) / (rowHeight + rowGap)));
    card.style.gridRowEnd = `span ${initialRowSpan}`;

    // keep structure and metadata for phase B
    cards.push({ meta, card, wrap, placeholder });
  }

  // Phase B: sequentially load real images into existing cards — strictly one at a time
  let loadedCount = 0;
  // mark the first placeholder active so single spinner shows
  if (cards.length > 0 && cards[0].placeholder) cards[0].placeholder.classList.add("active");

  for (let i = 0; i < cards.length; i++) {
    if (myLoadId !== currentLoadId) return;
    const { meta, card, wrap, placeholder } = cards[i];
    const ok = await loadImageIntoCard(meta, card, wrap, placeholder, myLoadId);
    if (myLoadId !== currentLoadId) return;

    // ensure this placeholder is no longer active (spinner moves)
    if (placeholder && placeholder.classList.contains("active")) {
      placeholder.classList.remove("active");
    }
    // activate next placeholder (single spinner moves forward)
    if (i + 1 < cards.length && cards[i + 1].placeholder) {
      cards[i + 1].placeholder.classList.add("active");
    }

    // only count as "loaded" if ok was true (load succeeded or error handled)
    loadedCount++;
    // insert ad only when loadedCount hits the interval (e.g. every 25 loaded items)
    const AD_INTERVAL = ADS_CONFIG.adInterval;
    if (loadedCount > 0 && loadedCount % AD_INTERVAL === 0) {
      // compute ad row span using same rowHeight/rowGap logic
      const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows") || "10");
      const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");
      const adMinH = 140; // should match CSS min-height
      const adRowSpan = Math.max(1, Math.ceil((adMinH + rowGap) / (rowHeight + rowGap)));

      const ad = document.createElement("div");
      ad.className = "ad-card";
      ad.textContent = "Advertisment placeholder";
      ad.style.gridRowEnd = `span ${adRowSpan}`;

      // insert ad into DOM directly after the card for the loadedCount-th item
      if (card && card.parentNode) {
        card.parentNode.insertBefore(ad, card.nextSibling);
      } else {
        gallery.appendChild(ad);
      }
      // small local update; full recalculation will run at the end
    }
  }

  // final layout correction (one final pass)
  if (myLoadId === currentLoadId) resizeAllMasonryItems();
}

// new helper: load image into an existing card/wrap/placeholder
function loadImageIntoCard(meta, card, wrap, placeholder, expectedLoadId) {
  return new Promise((resolve) => {
    if (expectedLoadId !== currentLoadId) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.alt = meta.rawBase;
    img.className = "gallery-image hidden";
    img.draggable = false;

    img.addEventListener("click", () => openModal(meta));

    const grid = document.querySelector(".gallery");
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows") || "10");
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");

    // attach handlers BEFORE setting src to avoid race where load fires before handler attached
    img.addEventListener("load", () => {
      if (expectedLoadId !== currentLoadId) {
        if (card.parentNode === gallery) gallery.removeChild(card);
        resolve(false);
        return;
      }

      const finalH = getRenderedImageHeight(img, wrap.clientWidth) || parseInt(wrap.style.height) || 150;
      wrap.style.height = `${finalH}px`;

      img.classList.remove("hidden");
      img.classList.add("fade-in");

      // remove placeholder wrapper if present
      if (placeholder && placeholder.parentNode === wrap) {
        // remove placeholder (spinner won't show because active removed by loop)
        placeholder.remove();
      }
      wrap.appendChild(img);

      requestAnimationFrame(() => {
        const rowSpan = Math.max(1, Math.ceil((finalH + rowGap) / (rowHeight + rowGap)));
        card.style.gridRowEnd = `span ${rowSpan}`;
        wrap.classList.add("loaded");
        resolve(true);
      });
    });

    img.addEventListener("error", () => {
      if (expectedLoadId !== currentLoadId) {
        if (card.parentNode === gallery) gallery.removeChild(card);
        resolve(false);
        return;
      }
      // replace placeholder with filename text (basename)
      try {
        const filename = (meta && meta.src) ? meta.src.split("/").pop() : "unknown";
        const errEl = document.createElement("div");
        errEl.className = "loading-error";
        errEl.textContent = `Failed: ${filename}`;
        if (placeholder && placeholder.parentNode === wrap) {
          placeholder.replaceWith(errEl);
        } else {
          wrap.appendChild(errEl);
        }
      } catch (e) {
        if (placeholder && placeholder.parentNode === wrap) {
          placeholder.textContent = "Failed to load";
        }
      }
      // ensure wrap height remains reasonable (keep default set earlier)
      resolve(true);
    });

    // only set src after handlers attached
    img.src = meta.src;
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

  // split the query into tokens (space/comma/semicolon separated). Search matches if ANY token is present in the image tokens.
  const queryTokens = q.split(/[\s,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean);

  const filtered = imagesList.filter(src => {
    const meta = parseFilename(src);
    const metaTokens = buildMetaTokens(meta); // set of normalized tokens

    // require that at least one query token equals one of the meta tokens (strict token match)
    return queryTokens.some(qt => metaTokens.has(qt));
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

  // batch DOM reads & writes in one loop to reduce layout thrash
  const items = Array.from(document.querySelectorAll(".card, .ad-card"));
  items.forEach(item => {
    // handle ad-cards specially: compute its height and set row span (do not nullify)
    if (item.classList.contains("ad-card")) {
      const h = item.getBoundingClientRect().height || 140;
      const adRowSpan = Math.max(1, Math.ceil((h + rowGap) / (rowHeight + rowGap)));
      item.style.gridRowEnd = `span ${adRowSpan}`;
      return;
    }

    const wrap = item.querySelector(".image-wrap");
    const img = item.querySelector(".gallery-image");
    const err = item.querySelector(".loading-error");

    if (!wrap) {
      // fallback: nothing to size
      item.style.gridRowEnd = null;
      return;
    }

    // Determine height:
    // - If image exists: use intrinsic-based rendered height
    // - Else if error exists: use wrap's rendered height (it was set earlier or based on default)
    // - Else fallback to current wrap height or default aspect ratio
    let height = 0;
    if (img) {
      const availW = wrap.clientWidth || item.clientWidth || 0;
      height = getRenderedImageHeight(img, availW) || (availW * DEFAULT_ASPECT) || rowHeight;
    } else if (err) {
      height = wrap.getBoundingClientRect().height || rowHeight;
    } else {
      height = wrap.getBoundingClientRect().height || (wrap.clientWidth * DEFAULT_ASPECT) || rowHeight;
    }

    // apply height and row span
    wrap.style.height = `${height}px`;
    const rowSpan = Math.max(1, Math.ceil((height + rowGap) / (rowHeight + rowGap)));
    item.style.gridRowEnd = `span ${rowSpan}`;
  });
}

// replace the previous ad-insertion logic with this block
function maybeInsertAdAfter(card, index, gallery) {
  // index is zero-based count of images inserted so far
  const insertAfterCount = ADS_CONFIG.adInterval;
  if (insertAfterCount <= 0) return;

  // Insert an ad after every adInterval images
  if ((index + 1) % insertAfterCount !== 0) return;

  // compute grid row span if you use that logic elsewhere (fallback = 1)
  const adRowSpan = 1;

  const ad = document.createElement('div');
  ad.className = 'ad-card';
  ad.style.gridRowEnd = `span ${adRowSpan}`;

  if (ADS_CONFIG.publisherId) {
    // ensure loader present then build real AdSense container
    ensureAdsLoader(ADS_CONFIG.publisherId);

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    // optional: set a specific slot by uncommenting and filling data-ad-slot
    // ins.setAttribute('data-ad-slot', 'YOUR_AD_SLOT_ID');
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');

    ad.appendChild(ins);

    // attempt to render the ad (will fail silently in dev/localhost)
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // development environments often throw here; keep placeholder visible
      console.warn('adsbygoogle push failed', e);
      // keep a visible fallback label if rendering failed
      const label = document.createElement('div');
      label.className = 'ad-fallback-label';
      label.textContent = 'Ad placeholder';
      ad.appendChild(label);
    }
  } else {
    // no publisher id: keep the same visible placeholder as before
    const label = document.createElement('div');
    label.className = 'ad-fallback-label';
    label.textContent = 'Ad placeholder';
    ad.appendChild(label);
  }

  // insert into DOM after the related card (or at end)
  if (card && card.parentNode) {
    card.parentNode.insertBefore(ad, card.nextSibling);
  } else {
    gallery.appendChild(ad);
  }
}

// start
document.addEventListener("DOMContentLoaded", () => loadImagesSequentially(imagesList));
window.addEventListener("resize", () => requestAnimationFrame(resizeAllMasonryItems));
window.addEventListener("load", resizeAllMasonryItems);