/* gallery.js
   - sequential image loading (placeholder -> load -> fade-in)
   - interaction disabled until image fully loaded
   - precise masonry row calculation after each load
   - ad insertion every 10 items
   - search filtering
*/

// ---------- Replace the static imagesList with an automatic fetch from GitHub ----------
let imagesList = [
  // fallback minimal example (keeps behavior if API fails). You can leave this empty.
  "images/placeholder.jpg"
];

// <-- ADDITION: ensure DOM refs and load token exist before any function runs -->
const gallery = document.getElementById("galleryContainer");
const searchInput = document.getElementById("searchInput");
let currentLoadId = 0;
// <-- end addition -->

// Configure these values for your repo (update to your GitHub account/repo/branch)
const GITHUB_OWNER = "YOUR_GITHUB_USERNAME";
const GITHUB_REPO  = "realartmaine";
const GITHUB_BRANCH = "main"; // or "master"
const IMAGES_DIR    = "images";

// Try to list images from the GitHub repo using the Contents API (public repos only)
async function fetchImagesFromGitHub() {
  try {
    // If user has not configured owner/repo, skip the API call to avoid 404 spam
    if (!GITHUB_OWNER || GITHUB_OWNER.includes("YOUR_") || !GITHUB_REPO || GITHUB_REPO.includes("YOUR_")) {
      console.info("fetchImagesFromGitHub: GITHUB_OWNER/GITHUB_REPO not configured; skipping API call.");
      return null;
    }

    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${encodeURIComponent(IMAGES_DIR)}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.warn("GitHub API returned", res.status, res.statusText);
      return null;
    }
    const items = await res.json();
    if (!Array.isArray(items)) return null;

    // Keep only files with image extensions, build raw.githubusercontent URLs
    const imgs = items
      .filter(f => f.type === "file" && /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(f.name))
      .map(f => `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${IMAGES_DIR}/${encodeURIComponent(f.name)}`);

    if (imgs.length === 0) return null;
    return imgs;
  } catch (err) {
    console.warn("Failed to fetch images from GitHub:", err);
    return null;
  }
}

// On DOM ready: try to fetch list from GitHub, fall back to existing imagesList
document.addEventListener("DOMContentLoaded", async () => {
  // try GitHub first (only for public repos / rate-limited)
  const fetched = await fetchImagesFromGitHub();
  if (Array.isArray(fetched) && fetched.length > 0) {
    imagesList = fetched;
  }
  loadImagesSequentially(imagesList);
});

const DEFAULT_ASPECT = 0.66;

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
    // insert ad only when loadedCount hits the interval (e.g. every 10 loaded items)
    const AD_INTERVAL = 10;
    if (loadedCount > 0 && loadedCount % AD_INTERVAL === 0) {
      // compute ad row span using same rowHeight/rowGap logic
      const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows") || "10");
      const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("gap") || "10");
      const adMinH = 140; // should match CSS min-height
      const adRowSpan = Math.max(1, Math.ceil((adMinH + rowGap) / (rowHeight + rowGap)));

      const ad = document.createElement("div");
      ad.className = "ad-card";
      ad.textContent = "Ad / Featured";
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

// start
window.addEventListener("resize", () => requestAnimationFrame(resizeAllMasonryItems));
window.addEventListener("load", resizeAllMasonryItems);
