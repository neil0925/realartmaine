// submissions.js
// Build a simple leaderboard of photographers using data available
// in `gallery.js`. Heuristics are used when explicit metadata isn't
// present: we parse `IMAGE_LABELS` tokens and pick candidate names.

function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

document.addEventListener('DOMContentLoaded', () => {
  const out = document.getElementById('leaderboard');
  if (!out) return;

  // Attempt to use structured `metaList` if available (preferred)
  const counts = Object.create(null);
  // `metaList` and `IMAGE_LABELS` may be declared as top-level `const` in
  // `gallery.js` (not as window properties). Support both forms.
  const globalMetaList = (typeof metaList !== 'undefined') ? metaList : (window.metaList || null);
  const globalImageLabels = (typeof IMAGE_LABELS !== 'undefined') ? IMAGE_LABELS : (window.IMAGE_LABELS || null);

  if (globalMetaList && Array.isArray(globalMetaList)) {
    globalMetaList.forEach(m => {
      const p = (m.photographer || m.photographerName || m.author || m.by || '').toString().trim();
      if (!p) return;
      const key = p;
      if (key.toLowerCase().includes('realartmaine')) return; // exclude
      counts[key] = (counts[key] || 0) + 1;
    });
  }

  // Fallback: parse IMAGE_LABELS if present
  if (globalImageLabels && Array.isArray(globalImageLabels)) {
    const stopwords = new Set([
      'tag','tags','throwie','piece','stencil','character','hollow','fillin','antistyle','straightletter','paintroller','blackbook','minnowfeed','notmaine','hand','handstyle'
    ]);

    // More robust approach: split the entire label on '-' to get logical
    // segments and look for style words (stopwords) near the end. The
    // photographer is usually the segment immediately before style tokens.
    for (let i = 1; i < globalImageLabels.length; i++) {
      const label = (globalImageLabels[i] || '').toString();
      if (!label) continue;

      // Break label into hyphen-separated segments (these tend to be
      // subject / crew / photographer / styles)
      const parts = label.split('-').map(p => p.trim()).filter(Boolean);
      if (!parts.length) continue;

      // Find the rightmost segment that contains a style/descriptor from stopwords.
      // Photographer is likely the segment immediately before that.
      let photographerSeg = null;
      for (let j = parts.length - 1; j >= 0; j--) {
        const seg = parts[j].toLowerCase();
        // check if any comma-separated token in this segment matches a style
        const segTokens = seg.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
        const hasStyle = segTokens.some(t => stopwords.has(t));
        if (hasStyle) {
          if (j - 1 >= 0) photographerSeg = parts[j - 1];
          break;
        }
      }

      // Fallbacks if we couldn't locate a style marker
      if (!photographerSeg) {
        if (parts.length >= 3) photographerSeg = parts[parts.length - 2];
        else if (parts.length === 2) photographerSeg = parts[1];
        else photographerSeg = parts[0];
      }

      if (!photographerSeg) continue;

      // The segment might contain multiple comma-separated names (crews).
      // Prefer a candidate that looks like a real photographer name: not
      // an all-uppercase crew code and not a style word.
      const candNames = photographerSeg.split(',').map(s => s.trim()).filter(Boolean);
      let chosen = null;
      for (const n of candNames) {
        const low = n.toLowerCase();
        if (!low) continue;
        if (stopwords.has(low)) continue;
        // skip obvious crew lists like "PTG,OHK" (all-uppercase tokens or short codes)
        const isLikelyCrew = /^[A-Z0-9,\s]{1,6}$/.test(n) && n === n.toUpperCase();
        if (isLikelyCrew) continue;
        chosen = n;
        break;
      }

      // If no good candidate found, fall back to first comma-part (best-effort)
      if (!chosen && candNames.length) chosen = candNames[0];
      if (!chosen) continue;

      const final = chosen.trim();
      if (!final) continue;
      // Exclude the site's own account from the leaderboard
      if (final.toLowerCase().includes('realartmaine')) continue;
      const key = final;
      counts[key] = (counts[key] || 0) + 1;
    }
  }

  // Build sorted leaderboard
  const list = Object.entries(counts).sort((a,b) => b[1] - a[1]);

  let html = '<h1>Top Photographers</h1>';
  if (list.length === 0) {
    html += '<p>No submissions found.</p>';
  } else {
    html += '<div class="table-wrap"><table class="leaderboard-table"><thead><tr>' +
      '<th class="rank-col">Place</th>' +
      '<th class="photog-col">Photographer</th>' +
      '<th class="count-col">Number of Submissions</th>' +
      '</tr></thead><tbody>';

    list.slice(0, 200).forEach(([name, cnt], idx) => {
      const place = idx + 1;
      html += `<tr><td class="rank-col">${place}</td><td class="photog-col">${escapeHtml(name)}</td><td class="count-col">${cnt}</td></tr>`;
    });

    html += '</tbody></table></div>';
  }

  out.innerHTML = html;
});
