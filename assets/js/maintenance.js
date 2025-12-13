    /* maintenance.js
   Loads /maintenance.json (if present) and, for the current path,
   displays a friendly maintenance banner unless `?debug=true` is set.

   Usage: edit `/maintenance.json` at site root with keys matching
   normalized paths (e.g. "/Gallery", "/Home"). Each entry should
   contain `estimated` (string) and optional `note` (string).

   If `/maintenance.json` is empty/missing or does not contain the
   current path, the page continues to function normally.
*/

(async function() {
  function normalizeKey(s) {
    if (!s) return '/';
    let k = String(s).toLowerCase();
    k = k.replace(/\/index\.html$/i, '');
    k = k.replace(/\/$/, '');
    return k || '/';
  }

  // quick check for debug bypass
  const params = new URLSearchParams(window.location.search || '');
  const debugMode = params.get('debug') === 'true';

  let text = null;
  // Try absolute path first (production), then relative paths for local previews.
  async function tryFetchVariants() {
    const candidates = ['/maintenance.json', 'maintenance.json', './maintenance.json'];
    for (const p of candidates) {
      try {
        const r = await fetch(p, { cache: 'no-store' });
        if (r && r.ok) return await r.text();
      } catch (err) {
        // continue to next candidate
      }
    }
    return null;
  }

  try {
    text = await tryFetchVariants();
    if (!text) {
      // Helpful debug hint for local testing environments
      console.info('maintenance: no maintenance.json found at /maintenance.json or local path.');
      return;
    }
  } catch (e) {
    console.warn('maintenance: failed to fetch maintenance.json', e);
    return;
  }

  if (!text || !text.trim()) return; // empty file -> no maintenance

  let cfg;
  try {
    cfg = JSON.parse(text);
  } catch (e) {
    console.error('maintenance.json parse error', e);
    return;
  }
  if (!cfg || typeof cfg !== 'object') return;

  const path = window.location.pathname || '/';
  const normPath = normalizeKey(path);

  // normalize config keys for robust matching
  const normalizedConfig = {};
  Object.keys(cfg).forEach(k => { normalizedConfig[normalizeKey(k)] = cfg[k]; });

  const entry = normalizedConfig[normPath] || null;
  if (!entry) return; // nothing for this page

  if (debugMode) {
    // show small debug badge but allow page access
    const badge = document.createElement('div');
    badge.className = 'maintenance-debug-badge';
    badge.textContent = 'MAINTENANCE ACTIVE (debug)';
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(badge);
    });
    return;
  }

  // Build banner element
  function createBanner(pageName) {
    const wrapper = document.createElement('div');
    wrapper.className = 'maintenance-banner';

    const title = document.createElement('h1');
    title.textContent = (pageName || 'This page') + ' is under maintenance';

    const info = document.createElement('p');
    info.className = 'maintenance-estimate';
    info.textContent = entry.estimated ? ('Estimated to be done by ' + entry.estimated) : 'Estimated time not specified.';

    const note = document.createElement('p');
    note.className = 'maintenance-note';
    if (entry.note && String(entry.note).trim()) {
      note.textContent = String(entry.note).trim();
    } else {
      // if no note, keep it empty (spec requested)
      note.textContent = '';
    }

    const help = document.createElement('p');
    help.className = 'maintenance-help';
    help.innerHTML = 'Feel free to check out the rest of our site: <a href="/">Home</a>.';

    wrapper.appendChild(title);
    wrapper.appendChild(info);
    if (note.textContent) wrapper.appendChild(note);
    wrapper.appendChild(help);
    return wrapper;
  }

  // insert banner in a non-destructive way: prefer `#galleryContainer` or `main`.
  document.addEventListener('DOMContentLoaded', () => {
    const banner = createBanner((document.title || window.location.pathname).replace(/\s*\|.*$/, '').trim());

    // keep the container node present so other scripts don't crash
    const galleryEl = document.getElementById('galleryContainer');
    if (galleryEl) {
      galleryEl.innerHTML = '';
      galleryEl.appendChild(banner);
      return;
    }

    const mainEl = document.querySelector('main');
    if (mainEl) {
      // don't remove nav/footer — replace main content
      mainEl.innerHTML = '';
      mainEl.appendChild(banner);
      return;
    }

    // fallback: replace body with simple message but keep nav if possible
    document.body.innerHTML = '';
    document.body.appendChild(banner);
  });
})();
