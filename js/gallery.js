/* gallery.js
   - sequential image loading (placeholder -> load -> fade-in)
   - interaction disabled until image fully loaded
   - precise masonry row calculation after each load
   - ad insertion every 10 items
   - search filtering
*/

let imagesList = [
	"images/catch, link, wake, hugo-OHK,PTG,LTB,5G-realartmaine-throwie, tag.jpg",
	"images/same-SLT,TVT-realartmaine-tags.jpg",
	"images/same-SLT,TVT-realartmaine-piece, staightletter.jpg",
	"images/peck-SLF-realartmaine-throwie, bubble letter, hollow.jpg",
	"images/salud-PTG-realartmaine-tags, character, hollow.jpg",
	"images/salud-PTG-realartmaine-tags, hollow, character.jpg",
	"images/bunt, some1-LG-realartmaine-stencil, tag.jpg",
	"images/ankle-LTB,2K69-realartmaine-throwie, hollow .jpg",
	"images/wake-LTB-realartmaine-fillin, throwie.jpg",
	"images/SLT-SLT-realartmaine-paintroller.jpg",
	"images/pest-realartmaine-throwie, bubble letter, hollow.jpg",
	"images/rune-LTB,2K69-realartmaine-throwie, hollow, bubble letter.jpg",
	"images/5G-5G-minnowfeed-straightletter, antistyle.JPG",
	"images/qjoe, link-5G-realartmaine-antistyle, straightletter.jpg",
	"images/link-5G,CRAFT-realartmaine-antistyle, piece.jpg",
	"images/prizm, ruski, cats-realartmaine-paintroller.jpg",
	"images/some1-realartmaine-stencil.jpg",
	"images/owell-realartmaine-antistyle, throwie.jpg",
	"images/owell-realartmaine-antistyle, throwie, fillin.jpg",
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
	"images/ankle-LTB,2K69-minnowfeed-throwie, fillin.JPG",
	"images/ankle-2K69,LTB-minnowfeed-tags.JPG",
	"images/LSE-LSE-minnowfeed-straightletter.jpg",
	"images/2GF-realartmaine-tag.jpg",
	"images/27-TSZ,2GF-realartmaine-throwie, antistyle.jpg",
	"images/ankle-LTB,2K69-realartmaine-tags.jpg",
  "images/ankle, ne1, symbol, spud-LTB, 2K69, CTS-realartmaine-throwie, straightletter, tags, fillin_.jpg",
  "images/ankor-SFL-realartmaine-straightletter.jpg",
  "images/aura-OHK-realartmaine-straightletter, piece.jpg",
  "images/auto-CTS,TNL-realartmaine-tags, character.jpg",
  "images/bosh, doves-SLT-realartmaine-throwie, fillin, tags.jpg",
  "images/catch-OHK,PTG,BNE-realartmaine-piece, antistyle.jpg",
  "images/catch, payze-PTG,OHK,BNE,IMS-realartmaine-straightletter, fillin.jpg",
  "images/catch, pyle-PTG,BNE,OHK-realartmaine-throwie, hollow, notmaine.jpg",
  "images/chew-realartmaine-throwie, hollow.jpg",
  "images/digitalnail-realartmaine-stencil.jpg",
  "images/digitalnail-realartmaine-stencil(1).jpg",
  "images/wake, dean, link, auto, dove-LTB,CFM,SLT,5G,CTS,TNL,SDH,CRAFT-realartmaine-piece, antistyle, paintroller.jpg",
  "images/wake, rune, doves, same-SLT,LTB,TVT-realartmaine-throwie, piece, fillin, tags.jpg",
  "images/wd40-realartmaine-tags.jpg",
  "images/write-SFL-realartmaine-piece, straightletter.jpg",
  "images/yami, high8, wake, secret-5G,LTB,OHK-realartmaine-antistyle, tags, pieces.jpg",
  "images/feer, kite, enzyme, loupe, auto-DWT,DPW,TNL,CTS-realartmaine-tags, piece, straightletter, antistyle.jpg",
  "images/gervs-YME-realartmaine-piece.jpg",
  "images/grazi-DWT-realartmaine-antistyle, throwie, hollow.jpg",
  "images/grazi-DWT-realartmaine-straightletter.jpg",
  "images/grazi-DWT-realartmaine-throwie, hollow.jpg",
  "images/grazi, some1-DWT-realartmaine-tags, stencil.jpg",
  "images/heart, knave, pout, ojea3, doves, merlin-CTS,TNL,HEX,OY!,CTS,SK8-realartmaine-throwie, fillin, straightletter, tags.jpg",
  "images/hiphop, ducky-realartmaine-antistyle, character, portlandbee.jpg",
  "images/key-2K69-realartmaine-throwie, fillin.jpg",
  "images/doves-SLT,CFM-realartmaine-piece, character.jpg",
  "images/solar-DNB-realartmaine-tags.jpg",
  "images/slug, pest, some1, vane, brik-PTG,SFL-realartmaine-stencil, tags.jpg",
  "images/some1-realartmaine-stencil.jpg",
  "images/some1-realartmaine-piece.jpg",
  "images/towel-FK-realartmaine-tags.jpg",
  "images/towel, sewer, salud, klerm, kindbud-FK,PTG,TNL,5G-realartmaine-tags, character.jpg",
  "images/wake-LTB-realartmaine-throwie, fillin.jpg",
  "images/27-TSZ,2GF-minnowfeed-paintroller.jpg",
  "images/jipso, alps, goal-PTG-paintroller, tags, throwie, straightletter, fillin, character.jpg",
  "images/ducky-realartmaine-antistyle, paintroller.jpg",
  "images/enya-5G-realartmaine-antistyle.jpg",
  "images/enzyme-DPW-realartmaine-throwie, fillin.jpg",
  "images/epser-UK,TMS-realartmaine-straightletter.jpg",
  "images/epser-UK,TMS-realartmaine-tag.jpg",
  "images/muska, piza-KYS-realartmaine-piece.jpg",
  "images/muska, piza-KYS-realartmaine-straightletter.jpg",
  "images/neptune, mobi-DNB,AWC,TSZ-realartmaine-tags, character, hollow.jpg",
  "images/notice-realartmaine-straightletter.jpg",
  "images/pigeon-realartmaine-character.jpg",
  "images/salud, senegra-PTG,OHK-realartmaine-tags.jpg",
  "images/same, calcium, ducky, yart-SLT,IMS,TVT,OHK-realartmaine-throwie, fillin, character, antistyle.jpg",
  "images/skipio, pyle-2GF,PTG,OHK,BNE-realartmaine-throwie, fillin.jpg",
  "images/soft, same-SLT,2K69-realartmaine-throwie, fillin.jpg",
  "images/some1-realartmaine-character, hollow.jpg",
  "images/suer, same-SLT,TVT,TMS-realartmaine-throwie, hollow, tags.jpg",
  "images/trak, hebrew-LTB,2K69-realartmaine-tags.jpg",
  "images/wake, ducky-LTB-realartmaine-throwie, hollow, character, antistyle.jpg",
  "images/mobi, grazi-DWT,TSZ-minnowfeed-straightletter, tags.JPG",
  "images/spots, wilt, 27-VC,2K69,HKC-minnowfeed-blackbook, antistyle.JPG",
  "images/hebrew-cts-ZPLK-straightletter.JPG",
  "images/fish, symbol, grazi, spots, loupe-TNL,CTS,DWT,2K69,VC-ZPLK-piece, throwie, fillin, antistyle, tags.JPG",
  "images/catch, soepo-PTG,BNE,OHK-throwie, fillin.JPG",
  "images/aira-ZPLK-piece.JPG",
  "images/aira-ZPLK-piece, character.JPG",
  "images/aidan, grazi, loupe-CTS,TNL,DWT-ZPLK-straightletter, piece, fillin.JPG",
  "images/sloan-PTG,BNE-realartmaine-moniker, tag, character.jpg",
  "images/tabz, sloan-2gf,ptg,bne-RealArtMaine-hand style.jpg",
  "images/songy-realartmaine-straightletter, hollow.jpg",
  "images/salud-PTG,OHK-realartmaine-tags, character.jpg",
  "images/salud-PTG,OHK-realartmaine-tags, character.jpg",
  "images/learn-YME,CIRCLET-realartmaine-piece.jpg",
  "images/iowa-3FK-realartmaine-tags.jpg",
  "images/enya, osha, auto, lego, sloan-PTG,BNE,CTS,TNL,5G-realartmaine-tags.jpg",
  "images/port-IMS-realartmaine-piece.jpg",
  "images/thex-SLT-realartmaine-piece.jpg",
  "images/uglyboy-5G-realartmaine-throwie, antistyle.jpg",
  "images/27, learn-YME,SLT,CIRCLET,2GF,TSZ,2GF-minnowfeed-piece, stencil.JPG",
  "images/27, mobi, vazor, segway-TSZ,2GF,AWC,FTS-minnowfeed-piece, straightletter, stencil.JPG",
  "images/27, plato-HEX,TSZ,2GF-minnowfeed-tags.jpg"
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
  adInterval: 50   // insert ad every 25 images
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

  // compute available height for the gallery (viewport minus nav/footer areas)
  const nav = document.querySelector("nav");
  const footer = document.querySelector("footer");
  const navH = nav ? nav.getBoundingClientRect().height : 0;
  const footerH = footer ? footer.getBoundingClientRect().height : 0;
  const availableH = Math.max(200, window.innerHeight - navH - footerH - 48); // comfortable padding
  gallery.style.maxHeight = `${availableH}px`;
  gallery.style.overflowY = "auto";

  // read gallery metrics for column calculation
  const grid = gallery;
  const gap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");
  const galleryWidth = Math.max(200, grid.clientWidth || document.documentElement.clientWidth);
  const minCol = 180; // match CSS
  const cols = Math.max(1, Math.floor((galleryWidth + gap) / (minCol + gap)));
  const columnWidth = Math.max(120, Math.floor((galleryWidth - (cols - 1) * gap) / cols));

  // Phase A: create only a limited initial pool of placeholders (prevents huge scroll)
  const cards = [];
  const total = list.length;
  const initialPool = Math.min(total, Math.max(cols * 3, 6)); // ~3 rows of placeholders
  let nextCreateIndex = initialPool;

  // helper to create a card for a given index (keeps code concise)
  function createCardForIndex(i) {
    const meta = parseFilename(list[i]);
    const card = document.createElement("div");
    card.className = "card";

    const wrap = document.createElement("div");
    wrap.className = "image-wrap";

    // cap the placeholder height so many unloaded items don't create huge blank scroll space
    const defaultH = Math.min(Math.max(80, Math.round(columnWidth * DEFAULT_ASPECT)), 160);
    wrap.style.height = `${defaultH}px`;

    const placeholder = document.createElement("div");
    placeholder.className = "placeholder-box";

    const spinner = document.createElement("div");
    spinner.className = "spinner";
    placeholder.appendChild(spinner);

    wrap.appendChild(placeholder);
    card.appendChild(wrap);
    gallery.appendChild(card);

    // initial grid-row span so layout immediately forms columns
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows") || "10");
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");
    const initialRowSpan = Math.max(1, Math.ceil((defaultH + rowGap) / (rowHeight + rowGap)));
    card.style.gridRowEnd = `span ${initialRowSpan}`;

    return { meta, card, wrap, placeholder };
  }

  // create only the initial pool synchronously
  for (let i = 0; i < initialPool; i++) {
    if (myLoadId !== currentLoadId) return;
    cards.push(createCardForIndex(i));
  }

  // Phase B: sequentially load images; after each load append one more placeholder if available.
  let loadedCount = 0;
  if (cards.length > 0 && cards[0].placeholder) cards[0].placeholder.classList.add("active");

  for (let i = 0; i < cards.length; i++) {
    if (myLoadId !== currentLoadId) return;
    const { meta, card, wrap, placeholder } = cards[i];

    // actually load this card's image
    const ok = await loadImageIntoCard(meta, card, wrap, placeholder, myLoadId);
    if (myLoadId !== currentLoadId) return;

    // move the spinner forward: remove active from this placeholder (if still present)
    if (placeholder && placeholder.classList && placeholder.classList.contains("active")) {
      placeholder.classList.remove("active");
    }

    // Determine the next placeholder and make it active.
    // Priority: existing next placeholder in sequence (cards[i+1]),
    // otherwise create one (if items remain) and activate it immediately.
    let nextPlaceholder = null;
    if (cards[i + 1] && cards[i + 1].placeholder) {
      nextPlaceholder = cards[i + 1].placeholder;
    } else if (nextCreateIndex < total) {
      const newCard = createCardForIndex(nextCreateIndex++);
      cards.push(newCard);
      nextPlaceholder = newCard.placeholder;
    }
    if (nextPlaceholder && nextPlaceholder.classList) {
      nextPlaceholder.classList.add("active");
    }

    // count loaded and insert ad periodically (existing ad insert logic)
    loadedCount++;
    const AD_INTERVAL = 10;
    if (loadedCount > 0 && loadedCount % AD_INTERVAL === 0) {
      const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows") || "10");
      const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");
      const adMinH = 140;
      const adRowSpan = Math.max(1, Math.ceil((adMinH + rowGap) / (rowHeight + rowGap)));

      const ad = document.createElement("div");
      ad.className = "ad-card";
      ad.textContent = "Advertisment placeholder";
      ad.style.gridRowEnd = `span ${adRowSpan}`;

      if (card && card.parentNode) {
        card.parentNode.insertBefore(ad, card.nextSibling);
      } else {
        gallery.appendChild(ad);
      }
    }

    // After each reveal, recalc layout and ensure gallery scroll doesn't overshoot too far
    requestAnimationFrame(resizeAllMasonryItems);
    // optionally keep the viewport clamped near last revealed image:
    // scroll the gallery to ensure the newly loaded item is visible but do not scroll beyond it
    try {
      const cardRect = card.getBoundingClientRect();
      const galleryRect = gallery.getBoundingClientRect();
      // If the loaded card is below the visible gallery viewport, scroll just enough so it's visible.
      if (cardRect.bottom > galleryRect.bottom) {
        const delta = cardRect.bottom - galleryRect.bottom + 10; // small padding
        gallery.scrollTop += delta;
      }
      // clamp maximum scroll to the last appended card's bottom + 10px
      const lastCard = cards[cards.length - 1].card;
      if (lastCard) {
        const lastBottom = lastCard.getBoundingClientRect().bottom - galleryRect.top;
        const maxScroll = Math.max(0, Math.ceil(lastBottom + 10 - galleryRect.height));
        if (gallery.scrollTop > maxScroll) gallery.scrollTop = maxScroll;
      }
    } catch (e) {
      // ignore measurement errors in odd environments
    }
  }

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
        // keep the full grid recalculated after each image reveals to avoid gaps/overscroll
        requestAnimationFrame(resizeAllMasonryItems);
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