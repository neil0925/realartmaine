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

    for (let i = 1; i < globalImageLabels.length; i++) {
      const label = (globalImageLabels[i] || '').toString();
      if (!label) continue;
      const tokens = label.split(',').map(t => t.trim()).filter(Boolean);
      tokens.forEach(tok => {
        // exclude tokens that are clearly descriptors
        const low = tok.toLowerCase();
        if (stopwords.has(low)) return;
        if (low.includes('realartmaine')) return; // exclude site account

          // Extract photographer based on dash-count rule:
          // - If token has 3 dashes (parts.length === 4), photographer is between last two dashes -> parts[parts.length-2]
          // - If token has 2 dashes (parts.length === 3), photographer is the middle part -> parts[1]
          // - If token has 1 dash (parts.length === 2), fall back to the second part
          if (tok.includes('-')) {
            const parts = tok.split('-').map(p => p.trim()).filter(Boolean);
            let cand = null;
            if (parts.length >= 3) {
              cand = parts[parts.length - 2];
            } else if (parts.length === 2) {
              cand = parts[1];
            }
            if (!cand) return;
            if (stopwords.has(cand.toLowerCase())) return;
            if (cand.toLowerCase().includes('realartmaine')) return;
            counts[cand] = (counts[cand] || 0) + 1;
          }
      });
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
