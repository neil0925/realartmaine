/* gallery.js
   - sequential image loading (placeholder -> load -> fade-in)
   - interaction disabled until image fully loaded
   - precise masonry row calculation after each load
   - ad insertion every 10 items
   - search filtering
*/

// ORIGINAL_IMAGES removed: image metadata is now sourced from `IMAGE_LABELS`.
// We no longer rely on a long list of original filenames. metaList is
// generated from `IMAGE_LABELS` (1-based) below.

// IMAGE_LABELS: editable mapping for human-readable labels per numeric image.
// The following block contains explicit 1-based assignments so you can
// open this file and edit labels directly (e.g. `IMAGE_LABELS[1] = "..."`).
// We generate defaults from the original filenames but you can override any
// line by editing the string literal.
const IMAGE_LABELS = [null]; // 1-based (IMAGE_LABELS[1] -> label for image 1)

// ----- AUTO-GENERATED LABELS (editable) -----
// You may change any right-hand string to a preferred, human-readable label.

IMAGE_LABELS[1] = "catch, link, wake, hugo-OHK,PTG,LTB,5G-realartmaine-throwie, tag";
IMAGE_LABELS[2] = "same-SLT,TVT-realartmaine-tags";
IMAGE_LABELS[3] = "same-SLT,TVT-realartmaine-piece, staightletter";
IMAGE_LABELS[4] = "peck-SLF-realartmaine-throwie, bubble letter, hollow";
IMAGE_LABELS[5] = "salud-PTG-realartmaine-tags, character, hollow";
IMAGE_LABELS[6] = "salud-PTG-realartmaine-tags, hollow, character";
IMAGE_LABELS[7] = "bunt, some1-LG-realartmaine-stencil, tag";
IMAGE_LABELS[8] = "ankle-LTB,2K69-realartmaine-throwie, hollow";
IMAGE_LABELS[9] = "wake-LTB-realartmaine-fillin, throwie";
IMAGE_LABELS[10] = "SLT-SLT-realartmaine-paintroller";
IMAGE_LABELS[11] = "pest-realartmaine-throwie, bubble letter, hollow";
IMAGE_LABELS[12] = "rune-LTB,2K69-realartmaine-throwie, hollow, bubble letter";
IMAGE_LABELS[13] = "5G-5G-minnowfeed-straightletter, antistyle";
IMAGE_LABELS[14] = "qjoe, link-5G-realartmaine-antistyle, straightletter";
IMAGE_LABELS[15] = "link-5G,CRAFT-realartmaine-antistyle, piece";
IMAGE_LABELS[16] = "prizm, ruski, cats-realartmaine-paintroller";
IMAGE_LABELS[17] = "some1-realartmaine-stencil";
IMAGE_LABELS[18] = "owell-realartmaine-antistyle, throwie";
IMAGE_LABELS[19] = "owell-realartmaine-antistyle, throwie, fillin";
IMAGE_LABELS[20] = "sloan-BNE,PTG-realartmaine-throwie, hollow";
IMAGE_LABELS[21] = "zone-ZPLK-antistyle, wildstyle";
IMAGE_LABELS[22] = "vroom-ZPLK-piece, character";
IMAGE_LABELS[23] = "lufa-hex-ZPLK-tags, piece";
IMAGE_LABELS[24] = "nare-az-ZPLK-piece, character";
IMAGE_LABELS[25] = "wilt-2K69,VC-minnowfeed-blackbook";
IMAGE_LABELS[26] = "spek, segway, 27, port, melts, yalts-FTS,TSZ,CIRCLET,YME,IMS-minnowfeed-tags, moniker";
IMAGE_LABELS[27] = "segway-FTS-minnowfeed-throwie, hollow";
IMAGE_LABELS[28] = "same, catch-SLT,PTG,BNE,OHK-realartmaine-tag";
IMAGE_LABELS[29] = "same, 27, enya-SLT,TVT,TSZ,5G-minnowfeed-tags, stencil";
IMAGE_LABELS[30] = "rune-LTB,2K69-minnowfeed-piece, antistyle";
IMAGE_LABELS[31] = "rune, 27-LTB,2K69,TSZ,2GF-minnowfeed-throwie, fillin, antistyle";
IMAGE_LABELS[32] = "qjoe-5G,UK-minnowfeed-antistyle, piece";
IMAGE_LABELS[33] = "qjoe, link-5G-realartmaine-antistyle, straightletter";
IMAGE_LABELS[34] = "ojea3-HEX,OY!-minnowfeed-piece";
IMAGE_LABELS[35] = "ojea3-HEX,OY!-minnowfeed-tags";
IMAGE_LABELS[36] = "mobi-TSZ-minnowfeed-straightletter";
IMAGE_LABELS[37] = "lerk, link, obee-5G,OY!-minnowfeed-piece, paintroller";
IMAGE_LABELS[38] = "lerk, 27-2GF-minnowfeed-tags, stencil";
IMAGE_LABELS[39] = "kindbud-5G,SDH-minnowfeed-antistyle, piece";
IMAGE_LABELS[40] = "jumz-TSZ-minnowfeed-throwie, fillin, stencil";
IMAGE_LABELS[41] = "ichabod-YME,CIRLCET-minnowfeed-tag";
IMAGE_LABELS[42] = "grazi, 27-DWT,TSZ,2GF-minnowfeed-tags";
IMAGE_LABELS[43] = "gerv-YME-minnowfeed-piece";
IMAGE_LABELS[44] = "feer, scipio-2GF-minnowfeed-piece, tags, antistyle, tag";
IMAGE_LABELS[45] = "catch-PTG,OHK,BNE-minnowfeed-tags, throwie, fillin";
IMAGE_LABELS[46] = "catch-BNE,PTG,OHK-minnowfeed-throwie, hollow";
IMAGE_LABELS[47] = "catch, secret, 27-BNE,PTG,OHK,5G,TSZ-minnowfeed-antistyle, stencil, blackbook";
IMAGE_LABELS[48] = "ankle-LTB,2K69-minnowfeed-throwie, fillin";
IMAGE_LABELS[49] = "ankle-2K69,LTB-minnowfeed-tags";
IMAGE_LABELS[50] = "LSE-LSE-minnowfeed-straightletter";
IMAGE_LABELS[51] = "2GF-realartmaine-tag";
IMAGE_LABELS[52] = "27-TSZ,2GF-realartmaine-throwie, antistyle";
IMAGE_LABELS[53] = "ankle-LTB,2K69-realartmaine-tags";
IMAGE_LABELS[54] = "ankle, ne1, symbol, spud-LTB, 2K69, CTS-realartmaine-throwie, straightletter, tags, tag, fillin_";
IMAGE_LABELS[55] = "ankor-SFL-realartmaine-straightletter";
IMAGE_LABELS[56] = "aura-OHK-realartmaine-straightletter, piece";
IMAGE_LABELS[57] = "auto-CTS,TNL-realartmaine-tags, character";
IMAGE_LABELS[58] = "bosh, doves-SLT-realartmaine-throwie, fillin, tags, tag";
IMAGE_LABELS[59] = "catch-OHK,PTG,BNE-realartmaine-piece, antistyle";
IMAGE_LABELS[60] = "catch, payze-PTG,OHK,BNE,IMS-realartmaine-straightletter, fillin";
IMAGE_LABELS[61] = "catch, pyle-PTG,BNE,OHK-realartmaine-throwie, hollow, notmaine";
IMAGE_LABELS[62] = "chew-realartmaine-throwie, hollow";
IMAGE_LABELS[63] = "digitalnail-realartmaine-stencil";
IMAGE_LABELS[64] = "digitalnail-realartmaine-stencil(1)";
IMAGE_LABELS[65] = "wake, dean, link, auto, dove-LTB,CFM,SLT,5G,CTS,TNL,SDH,CRAFT-realartmaine-piece, antistyle, paintroller";
IMAGE_LABELS[66] = "wake, rune, doves, same-SLT,LTB,TVT-realartmaine-throwie, piece, fillin, tags, tag";
IMAGE_LABELS[67] = "wd40-realartmaine-tags";
IMAGE_LABELS[68] = "write-SFL-realartmaine-piece, straightletter";
IMAGE_LABELS[69] = "yami, high8, wake, secret-5G,LTB,OHK-realartmaine-antistyle, tags, tag, pieces";
IMAGE_LABELS[70] = "feer, kite, enzyme, loupe, auto-DWT,DPW,TNL,CTS-realartmaine-tags, piece, straightletter, antistyle";
IMAGE_LABELS[71] = "gervs-YME-realartmaine-piece";
IMAGE_LABELS[72] = "grazi-DWT-realartmaine-antistyle, throwie, hollow";
IMAGE_LABELS[73] = "grazi-DWT-realartmaine-straightletter";
IMAGE_LABELS[74] = "grazi-DWT-realartmaine-throwie, hollow";
IMAGE_LABELS[75] = "grazi, some1-DWT-realartmaine-tags, stencil";
IMAGE_LABELS[76] = "heart, knave, pout, ojea3, doves, merlin-CTS,TNL,HEX,OY!,CTS,SK8-realartmaine-throwie, fillin, straightletter, tags";
IMAGE_LABELS[77] = "hiphop, ducky-realartmaine-antistyle, character, portlandbee";
IMAGE_LABELS[78] = "key-2K69-realartmaine-throwie, fillin";
IMAGE_LABELS[79] = "solar-DNB-realartmaine-tags";
IMAGE_LABELS[80] = "slug, pest, some1, vane, brik-PTG,SFL-realartmaine-stencil, tags, tag";
IMAGE_LABELS[81] = "some1-realartmaine-stencil";
IMAGE_LABELS[82] = "some1-realartmaine-piece";
IMAGE_LABELS[83] = "towel-FK-realartmaine-tags";
IMAGE_LABELS[84] = "towel, sewer, salud, klerm, kindbud-FK,PTG,TNL,5G-realartmaine-tags, character";
IMAGE_LABELS[85] = "wake-LTB-realartmaine-throwie, fillin";
IMAGE_LABELS[86] = "27-TSZ,2GF-minnowfeed-paintroller";
IMAGE_LABELS[87] = "jipso, alps, goal-PTG-paintroller, tags, tag, throwie, straightletter, fillin, character";
IMAGE_LABELS[88] = "ducky-realartmaine-antistyle, paintroller";
IMAGE_LABELS[89] = "enya-5G-realartmaine-antistyle";
IMAGE_LABELS[90] = "enzyme-DPW-realartmaine-throwie, fillin";
IMAGE_LABELS[91] = "epser-UK,TMS-realartmaine-straightletter";
IMAGE_LABELS[92] = "epser-UK,TMS-realartmaine-tag";
IMAGE_LABELS[93] = "muska, piza-KYS-realartmaine-piece";
IMAGE_LABELS[94] = "muska, piza-KYS-realartmaine-straightletter";
IMAGE_LABELS[95] = "neptune, mobi-DNB,AWC,TSZ-realartmaine-tags, character, hollow";
IMAGE_LABELS[96] = "notice-realartmaine-straightletter";
IMAGE_LABELS[97] = "pigeon-realartmaine-character";
IMAGE_LABELS[98] = "salud, senegra-PTG,OHK-realartmaine-tags";
IMAGE_LABELS[99] = "same, calcium, ducky, yart-SLT,IMS,TVT,OHK-realartmaine-throwie, fillin, character, antistyle";
IMAGE_LABELS[100] = "skipio, pyle-2GF,PTG,OHK,BNE-realartmaine-throwie, fillin";
IMAGE_LABELS[101] = "soft, same-SLT,2K69-realartmaine-throwie, fillin";
IMAGE_LABELS[102] = "some1-realartmaine-character, hollow";
IMAGE_LABELS[103] = "suer, same-SLT,TVT,TMS-realartmaine-throwie, hollow, tags, tag";
IMAGE_LABELS[104] = "trak, hebrew-LTB,2K69-realartmaine-tags";
IMAGE_LABELS[105] = "wake, ducky-LTB-realartmaine-throwie, hollow, character, antistyle";
IMAGE_LABELS[106] = "mobi, grazi-DWT,TSZ-minnowfeed-straightletter, tags, tag";
IMAGE_LABELS[107] = "spots, wilt, 27-VC,2K69,HKC-minnowfeed-blackbook, antistyle";
IMAGE_LABELS[108] = "hebrew-cts-ZPLK-straightletter";
IMAGE_LABELS[109] = "fish, symbol, grazi, spots, loupe-TNL,CTS,DWT,2K69,VC-ZPLK-piece, throwie, fillin, antistyle, tags, tag";
IMAGE_LABELS[110] = "catch, soepo-PTG,BNE,OHK-throwie, fillin";
IMAGE_LABELS[111] = "aira-ZPLK-piece";
IMAGE_LABELS[112] = "aira-ZPLK-piece, character";
IMAGE_LABELS[113] = "aidan, grazi, loupe-CTS,TNL,DWT-ZPLK-straightletter, piece, fillin";
IMAGE_LABELS[114] = "sloan-PTG,BNE-realartmaine-moniker, tag, character";
IMAGE_LABELS[115] = "tabz, sloan-2gf,ptg,bne-RealArtMaine-hand style";
IMAGE_LABELS[116] = "songy-realartmaine-straightletter, hollow";
IMAGE_LABELS[117] = "salud-PTG,OHK-realartmaine-tags, character";
IMAGE_LABELS[118] = "learn-YME,CIRCLET-realartmaine-piece";
IMAGE_LABELS[119] = "iowa-3FK-realartmaine-tags";
IMAGE_LABELS[120] = "enya, osha, auto, lego, sloan-PTG,BNE,CTS,TNL,5G-realartmaine-tags";
IMAGE_LABELS[121] = "port-IMS-realartmaine-piece";
IMAGE_LABELS[122] = "thex-SLT-realartmaine-piece";
IMAGE_LABELS[123] = "uglyboy-5G-realartmaine-throwie, antistyle";
IMAGE_LABELS[124] = "27, learn-YME,SLT,CIRCLET,2GF,TSZ,2GF-minnowfeed-piece, stencil";
IMAGE_LABELS[125] = "27, mobi, vazor, segway-TSZ,2GF,AWC,FTS-minnowfeed-piece, straightletter, stencil";
IMAGE_LABELS[126] = "27, plato-HEX,TSZ,2GF-minnowfeed-tags";
IMAGE_LABELS[127] = "lastsupper, bd, mobi, gask-VC,TSZ,PTG-realartmaine-tags";
IMAGE_LABELS[128] = "iowa-3FK-realartmaine-tags";
IMAGE_LABELS[129] = "house-TNL-realartmaine-tags";
IMAGE_LABELS[130] = "ducky-realartmaine-character, antistyle, portlandbee";
IMAGE_LABELS[131] = "ducky-realartmaine-character, antistyle, portlandbee";
IMAGE_LABELS[132] = "ducky-realartmaine-antistyle, paintroller";
IMAGE_LABELS[133] = "able-cravecreative9-toy, piece";
IMAGE_LABELS[134] = "solar-DNB-realartmaine-tags, tag, handstyle";
// ----- END AUTO-GENERATED LABELS -----

// Helper: get label for numeric index (1-based). Returns empty string if missing.
function getLabelForIndex(index) {
  if (!index || index < 1) return '';
  return IMAGE_LABELS[index] || '';
}
// remove exact-duplicate paths while preserving first occurrence order

// Build numeric mapping and metadata lookup from `IMAGE_LABELS`.
// `IMAGE_LABELS` is 1-based; entries may be overridden by editing this file.
// We set `orig` to the numeric path and only attempt numeric files as
// candidates (no fallback to long original filenames).
const metaList = (function() {
  const list = [];
  const total = (typeof IMAGE_LABELS !== 'undefined') ? Math.max(0, IMAGE_LABELS.length - 1) : 0;
  for (let idx = 0; idx < total; idx++) {
    const index = idx + 1;
    const label = IMAGE_LABELS[index] || '';
    const nameNoExt = label || String(index);
    // try common extensions so files restored with different cases/extensions still load
    const exts = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.gif', '.GIF'];
    const numericSrc = `/assets/images/${index}${exts[0]}`;
    const basename = `${index}${exts[0]}`;
    const orig = numericSrc; // no original-filename fallback

    const tokens = (label || '')
      .replace(/[\W_]+/g, ' ')
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    // build candidates with common extensions (prefer lowercase .jpg first)
    const candidates = exts.map(e => `/assets/images/${index}${e}`);

    list.push({
      index,
      orig,
      basename,
      nameNoExt,
      ext: exts[0],
      numericSrc,
      label,
      candidates,
      tokens
    });
  }
  return list;
})();

// metaBySrc maps both the numeric path and the original path to the same meta
const metaBySrc = {};
metaList.forEach(m => {
  // register all candidate paths so lookups and fallbacks work regardless of extension/case
  if (Array.isArray(m.candidates)) {
    m.candidates.forEach(c => { metaBySrc[c] = m; });
  }
  // also map canonical numericSrc and orig for compatibility
  metaBySrc[m.numericSrc] = m;
  metaBySrc[m.orig] = m;
});

// Safe helper: get meta for a src (numeric or original)
function getMetaForSrc(src) {
  if (!src) return null;
  return metaBySrc[src] || null;
}

// Helper to get tokens for a given src; falls back to a light parse if unknown
function tokensForSrc(src) {
  const m = getMetaForSrc(src);
  if (m) return m.tokens;
  // fallback: strip path and extension and tokenize
  const base = (src || '').replace(/^.*\/(assets\/images\/)?/i, '');
  const d = base.lastIndexOf('.');
  const name = d >= 0 ? base.slice(0, d) : base;
  return (name.replace(/[\W_]+/g, ' ').trim().toLowerCase().split(/\s+/).filter(Boolean));
}

// <-- ADDITION: ensure DOM refs and load token exist before any function runs -->
const gallery = document.getElementById("galleryContainer");
const searchInput = document.getElementById("searchInput");
// load-run token used to cancel obsolete loads
let currentLoadId = 0;
// the list currently displayed in the gallery (changes with search/filter)
let currentDisplayedList = [];
// <-- end addition -->

const DEFAULT_ASPECT = 0.66;



const TOY_BLACKLIST = [
  "arise", "cutie", "love", "lovey", "4kt", "fourkt", "sajak", "sajack", "freeze",
  "ames", "ame", "chad", "token", "sour", "saint", "ecko", "echo"
].map(s => s.toLowerCase());

function showToyBlockedMessage() {
  if (!gallery) return;
  gallery.innerHTML = '';
  const msgWrap = document.createElement('div');
  msgWrap.className = 'toy-blocked';
  msgWrap.textContent = "Sorry we don't let toys on our site error code (TOY)";
  gallery.appendChild(msgWrap);
  currentDisplayedList = [];
}

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

  // if metadata includes precomputed tokens (from IMAGE_LABELS / metaList), include them
  if (meta && Array.isArray(meta.tokens)) {
    meta.tokens.forEach(t => { if (t) tokens.add(t); });
  }

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
  // If we have a runtime metadata map for numeric srcs, return it directly
  if (typeof metaBySrc !== 'undefined' && metaBySrc[filename]) {
    return metaBySrc[filename];
  }
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

// Ensure `imagesList` is derived from the previously-built `metaList`.
// `metaList` entries contain `numericSrc`, `orig`, `label`, and computed `tokens`.
// We make the numeric src the default `meta.src`.
const imagesList = metaList.map(m => {
  // default to numeric src as the primary path
  m.src = m.numericSrc;
  m.rawBase = m.rawBase || m.nameNoExt;
  m.candidates = m.candidates || m.candidates;  // already set in metaList
  return m.numericSrc;
});

// modal viewer
function openModal(meta) {
  // Store body scroll position before opening modal
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  
  // Only close if clicking on backdrop, not on modal content
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      closeModal();
    }
  });

  const modal = document.createElement("div");
  modal.className = "modal";

  const imgwrap = document.createElement("div");
  imgwrap.className = "modal-imgwrap";

  const img = document.createElement("img");
  img.src = meta.src;
  img.alt = meta.rawBase;
  img.className = "modal-image";

  imgwrap.appendChild(img);
  modal.appendChild(imgwrap);

  const caption = document.createElement("div");
  caption.className = "caption";
  
  // Extract tags and photographer from the label.
  let tagText = '';
  let photographerText = '';
  
  if (meta && meta.label) {
    const dashParts = meta.label.split('-');
    if (dashParts.length > 0) {
      tagText = dashParts[0].trim();
    }
    let photographerIndex = -1;
    if (dashParts.length >= 4) {
      photographerIndex = 2;
    } else if (dashParts.length >= 3) {
      photographerIndex = 1;
    }
    if (photographerIndex >= 0 && dashParts[photographerIndex]) {
      const photoStr = dashParts[photographerIndex].trim();
      const photoTokens = photoStr.split(/[\s,]+/);
      photographerText = photoTokens[0];
    }
  }
  
  let captionText = '';
  if (tagText) {
    captionText = tagText;
  }
  if (photographerText) {
    captionText += (captionText ? ' ' : '') + `flicked by ${photographerText}`;
  }
  
  caption.textContent = captionText || (meta && meta.rawBase) || '';
  modal.appendChild(caption);
  // Add left and right navigation arrows using user's PNG icons
  // declare observer variable in this scope so closeModal can disconnect it
  let bodyClassObserver = null;

  const leftArrow = document.createElement("button");
  leftArrow.className = "modal-arrow modal-arrow-left";
  leftArrow.setAttribute("aria-label", "Previous image");

  const leftImg = document.createElement("img");
  leftImg.alt = "Previous";
  leftImg.style.width = "36px";
  leftImg.style.height = "36px";
  leftImg.style.objectFit = "contain";
  leftImg.style.pointerEvents = "none";
  // left arrow should be flipped horizontally so a single right-facing
  // image can be reused for both directions
  leftImg.style.transform = "scaleX(-1)";
  leftImg.src = '/assets/GUI/arrow.png';
  // if the PNG fails to load, fall back to a simple text arrow (no SVG).
  leftImg.onerror = () => {
    try { leftImg.onerror = null; } catch (e) {}
    // Replace the image with a single-character arrow to avoid broken images.
    if (leftArrow) {
      leftArrow.textContent = '‹';
      // ensure any image is removed so styling remains consistent
      try { leftImg.remove(); } catch (e) {}
    }
  };
  leftImg.onload = () => {
    if (leftArrow && leftArrow.textContent) leftArrow.textContent = '';
  };
  leftArrow.appendChild(leftImg);

  const rightArrow = document.createElement("button");
  rightArrow.className = "modal-arrow modal-arrow-right";
  rightArrow.setAttribute("aria-label", "Next image");

  const rightImg = document.createElement("img");
  rightImg.alt = "Next";
  rightImg.style.width = "36px";
  rightImg.style.height = "36px";
  rightImg.style.objectFit = "contain";
  rightImg.style.pointerEvents = "none";
  // right arrow uses the same right-facing image without flip
  rightImg.style.transform = "none";
  rightImg.src = '/assets/GUI/arrow.png';
  rightImg.onerror = () => {
    try { rightImg.onerror = null; } catch (e) {}
    if (rightArrow) {
      rightArrow.textContent = '›';
      try { rightImg.remove(); } catch (e) {}
    }
  };
  rightImg.onload = () => {
    if (rightArrow && rightArrow.textContent) rightArrow.textContent = '';
  };
  rightArrow.appendChild(rightImg);

  // Update arrow icons according to dark-mode (white for dark, black for light)
  function updateArrowIcons() {
    const isDark = document.body.classList.contains('dark-mode');
    // Per user request: in dark mode use original image (no invert).
    // In light mode invert colors so the white arrow becomes dark.
    const filter = isDark ? 'none' : 'invert(1)';
    leftImg.style.filter = filter;
    rightImg.style.filter = filter;
  }
  updateArrowIcons();

  // Watch for class changes on body so icons update when mode toggles
  bodyClassObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === 'class') updateArrowIcons();
    }
  });
  bodyClassObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  modal.appendChild(leftArrow);
  modal.appendChild(rightArrow);

  // Check if a modal already exists and remove it before adding the new one
  const existingBackdrop = document.querySelector(".modal-backdrop");
  if (existingBackdrop && existingBackdrop.parentNode) {
    document.body.removeChild(existingBackdrop);
  }

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  // Find current image index for navigation within the currently displayed list
  // Fallback to global imagesList if for some reason currentDisplayedList is empty
  const activeList = (Array.isArray(currentDisplayedList) && currentDisplayedList.length > 0) ? currentDisplayedList : imagesList;
  let currentIndex = activeList.indexOf(meta.numericSrc);
  if (currentIndex < 0) {
    // try matching by numeric index fallback (meta.numericSrc might differ in extension)
    currentIndex = activeList.findIndex(s => {
      try { return s && s.replace(/\.[^.]+$/, '') === (meta.numericSrc || '').replace(/\.[^.]+$/, ''); }
      catch (e) { return false; }
    });
  }
  
  // Highlight the current card in the background gallery
  const highlightCard = () => {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => card.classList.remove("highlighted"));
    if (cards[currentIndex]) {
      cards[currentIndex].classList.add("highlighted");
      // Scroll to keep the card visible
      cards[currentIndex].scrollIntoView({ behavior: "auto", block: "nearest" });
    }
  };
  highlightCard();
  
  // Close modal function
  const closeModal = () => {
    // Remove highlight from all cards
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => card.classList.remove("highlighted"));
    
    // disconnect the observer watching body class changes (if present)
    try { if (typeof bodyClassObserver !== 'undefined' && bodyClassObserver && bodyClassObserver.disconnect) bodyClassObserver.disconnect(); } catch (e) {}

    if (backdrop.parentNode) {
      document.body.removeChild(backdrop);
    }
    // Restore scroll position
    window.scrollTo(scrollX, scrollY);
    document.removeEventListener("keydown", handleKeyboard);
  };
  
  // Navigation function
  const navigateTo = (newIndex) => {
    const listForNav = (Array.isArray(currentDisplayedList) && currentDisplayedList.length > 0) ? currentDisplayedList : imagesList;
    if (!Array.isArray(listForNav) || listForNav.length === 0) return;
    const loopedIndex = ((newIndex % listForNav.length) + listForNav.length) % listForNav.length;
    const src = listForNav[loopedIndex];
    const newMeta = parseFilename(src);

    // Close current modal and open the new one (prevents stacking)
    closeModal();
    openModal(newMeta);
  };
  
  // Arrow button click handlers
  leftArrow.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateTo(currentIndex - 1);
  });
  
  rightArrow.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateTo(currentIndex + 1);
  });
  
  // Keyboard navigation (left/right arrow keys)
  const handleKeyboard = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigateTo(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      navigateTo(currentIndex + 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
  };
  
  document.addEventListener("keydown", handleKeyboard);
}

/* Replace the existing loadImagesSequentially + loadImageWithPlaceholder logic
   with a two-phase approach:
   - Phase A: create and append all cards+placeholders (so the grid can form columns)
   - Phase B: sequentially load each image into the already-appended card
*/

// load images one-by-one with placeholder
async function loadImagesSequentially(list) {
  if (!gallery) return;
  // remember which list is currently being shown (used by modal navigation)
  currentDisplayedList = Array.isArray(list) ? list.slice() : [];
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

    const grid = document.querySelector(".gallery");
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows") || "10");
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");

    // Try candidate paths sequentially (numeric first, then original filename)
    const candidates = (meta && meta.candidates && meta.candidates.length) ? meta.candidates.slice() : [meta.src];

    // attach click handler to wrap immediately (not waiting for image load)
    const onWrapClick = (e) => { e.stopPropagation(); openModal(meta); };
    wrap.addEventListener("click", onWrapClick);

    let attemptIndex = 0;
    function tryNext() {
      if (expectedLoadId !== currentLoadId) {
        if (card.parentNode === gallery) gallery.removeChild(card);
        resolve(false);
        return;
      }
      if (attemptIndex >= candidates.length) {
        // all attempts failed: show error inside placeholder
        try {
          const filename = (meta && meta.src) ? meta.src.split("/").pop() : "unknown";
          const errEl = document.createElement("div");
          errEl.className = "loading-error";
          errEl.textContent = `Failed: ${filename}`;
          if (placeholder && placeholder.parentNode === wrap) {
            placeholder.innerHTML = "";
            placeholder.appendChild(errEl);
          } else {
            wrap.appendChild(errEl);
          }
        } catch (e) {
          if (placeholder && placeholder.parentNode === wrap) {
            placeholder.textContent = "Failed to load";
          }
        }
        resolve(true);
        return;
      }

      const candidate = candidates[attemptIndex++];
      // replace handlers by assigning onload/onerror (avoids stacking handlers)
      img.onload = () => {
        if (expectedLoadId !== currentLoadId) {
          if (card.parentNode === gallery) gallery.removeChild(card);
          resolve(false);
          return;
        }

        // successful: update meta.src to the working candidate so modals/open use it
        meta.src = candidate;

        const finalH = getRenderedImageHeight(img, wrap.clientWidth) || parseInt(wrap.style.height) || 150;
        wrap.style.height = `${finalH}px`;

        img.classList.remove("hidden");
        img.classList.add("fade-in");

        // clear placeholder box contents (remove spinner) but keep the box
        if (placeholder && placeholder.parentNode === wrap) {
          placeholder.innerHTML = "";
        }
        wrap.appendChild(img);

        requestAnimationFrame(() => {
          const rowSpan = Math.max(1, Math.ceil((finalH + rowGap) / (rowHeight + rowGap)));
          card.style.gridRowEnd = `span ${rowSpan}`;
          wrap.classList.add("loaded");
          resolve(true);
        });
      };

      img.onerror = () => {
        // try next candidate
        tryNext();
      };

      // start loading this candidate via fetch to avoid <img> 404 console errors
      // Use fetch to test whether the resource exists; if it does, create a blob URL
      // and set it as the image source. This prevents the browser from logging
      // "Failed to load resource" for missing images initiated by <img>.
      fetch(candidate, { method: 'GET' }).then(resp => {
        if (!resp.ok) throw new Error('not-ok');
        return resp.blob();
      }).then(blob => {
        if (expectedLoadId !== currentLoadId) {
          resolve(false);
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        img.src = blobUrl;
        // decode ensures the image is fully available before we measure it
        img.decode().then(() => {
          // successful: update meta.src to the working candidate so modals/open use it
          meta.src = candidate;

          const finalH = getRenderedImageHeight(img, wrap.clientWidth) || parseInt(wrap.style.height) || 150;
          wrap.style.height = `${finalH}px`;

          img.classList.remove("hidden");
          img.classList.add("fade-in");

          // clear placeholder box contents (remove spinner) but keep the box
          if (placeholder && placeholder.parentNode === wrap) {
            placeholder.innerHTML = "";
          }
          wrap.appendChild(img);

          requestAnimationFrame(() => {
            const rowSpan = Math.max(1, Math.ceil((finalH + rowGap) / (rowHeight + rowGap)));
            card.style.gridRowEnd = `span ${rowSpan}`;
            wrap.classList.add("loaded");
            try { URL.revokeObjectURL(blobUrl); } catch (e) {}
            resolve(true);
          });
        }).catch(() => {
          // decoding failed; try next candidate
          try { URL.revokeObjectURL(blobUrl); } catch (e) {}
          tryNext();
        });
      }).catch(() => {
        // fetch failed or returned non-OK — try next candidate
        tryNext();
      });
    }

    // kick off attempts
    tryNext();

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

  // Split the query into tokens (space/comma/semicolon separated) so we can
  // perform strict token-level checks rather than substring matches.
  const queryTokens = q.split(/[\s,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean);

  // If any token exactly matches a toy blacklist term, short-circuit and show
  // the polite blocked message. This avoids false positives caused by
  // substring matches (e.g. 'game' containing 'ame').
  for (const t of TOY_BLACKLIST) {
    if (queryTokens.includes(t)) {
      showToyBlockedMessage();
      return;
    }
  }

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
