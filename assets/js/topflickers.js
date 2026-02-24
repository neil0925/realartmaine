function escapeHtml(s) {
  return String(s).replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}
document.addEventListener("DOMContentLoaded", () => {
  const out = document.getElementById("leaderboard");
  if (!out) return;
  const debugMode =
    new URLSearchParams(window.location.search).get("debug") === "true";
  const counts = Object.create(null);
  const globalMetaList =
    typeof metaList !== "undefined" ? metaList : window.metaList || null;
  const globalImageLabels =
    typeof IMAGE_LABELS !== "undefined"
      ? IMAGE_LABELS
      : window.IMAGE_LABELS || null;
  const globalVideoLabels =
    typeof VIDEO_LABELS !== "undefined"
      ? VIDEO_LABELS
      : window.VIDEO_LABELS || null;
  if (globalMetaList && Array.isArray(globalMetaList)) {
    globalMetaList.forEach((m) => {
      const p = (m.photographer || m.photographerName || m.author || m.by || "")
        .toString()
        .trim();
      if (!p) return;
      if (!debugMode && p.toLowerCase().includes("realartmaine")) return;
      counts[p] = (counts[p] || 0) + 1;
    });
  }
  if (globalImageLabels && Array.isArray(globalImageLabels)) {
    const stopwords = new Set([
      "tag",
      "tags",
      "throwie",
      "piece",
      "stencil",
      "character",
      "hollow",
      "fillin",
      "antistyle",
      "straightletter",
      "paintroller",
      "blackbook",
      "minnowfeed",
      "notmaine",
      "hand",
      "handstyle",
    ]);
    for (let i = 1; i < globalImageLabels.length; i++) {
      const label = String(globalImageLabels[i] || "");
      if (!label) continue;
      const parts = label
        .split("-")
        .map((p) => p.trim())
        .filter(Boolean);
      if (!parts.length) continue;
      let photographerSeg = null;
      for (let j = parts.length - 1; j >= 0; j--) {
        const segTokens = parts[j].toLowerCase().split(/[,\s]+/);
        if (segTokens.some((t) => stopwords.has(t))) {
          photographerSeg = parts[j - 1] || null;
          break;
        }
      }
      if (!photographerSeg) {
        if (parts.length >= 3) photographerSeg = parts[parts.length - 2];
        else photographerSeg = parts[parts.length - 1];
      }
      if (!photographerSeg) continue;
      const candidates = photographerSeg
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      let chosen = null;
      for (const n of candidates) {
        const low = n.toLowerCase();
        if (stopwords.has(low)) continue;
        if (/^[A-Z0-9,\s]{1,6}$/.test(n) && n === n.toUpperCase()) continue;
        chosen = n;
        break;
      }
      if (!chosen && candidates.length) chosen = candidates[0];
      if (!chosen) continue;
      if (!debugMode && chosen.toLowerCase().includes("realartmaine")) continue;
      counts[chosen] = (counts[chosen] || 0) + 1;
    }
  }
  if (globalVideoLabels && Array.isArray(globalVideoLabels)) {
    const stopwords = new Set([
      "tag",
      "tags",
      "throwie",
      "piece",
      "stencil",
      "character",
      "hollow",
      "fillin",
      "antistyle",
      "straightletter",
      "paintroller",
      "blackbook",
      "minnowfeed",
      "notmaine",
      "hand",
      "handstyle",
    ]);
    for (let i = 1; i < globalVideoLabels.length; i++) {
      const label = String(globalVideoLabels[i] || "");
      if (!label) continue;
      const parts = label
        .split("-")
        .map((p) => p.trim())
        .filter(Boolean);
      if (!parts.length) continue;
      let photographerSeg = null;
      for (let j = parts.length - 1; j >= 0; j--) {
        const segTokens = parts[j].toLowerCase().split(/[,\s]+/);
        if (segTokens.some((t) => stopwords.has(t))) {
          photographerSeg = parts[j - 1] || null;
          break;
        }
      }
      if (!photographerSeg) {
        if (parts.length >= 3) photographerSeg = parts[parts.length - 2];
        else photographerSeg = parts[parts.length - 1];
      }
      if (!photographerSeg) continue;
      const candidates = photographerSeg
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      let chosen = null;
      for (const n of candidates) {
        const low = n.toLowerCase();
        if (stopwords.has(low)) continue;
        if (/^[A-Z0-9,\s]{1,6}$/.test(n) && n === n.toUpperCase()) continue;
        chosen = n;
        break;
      }
      if (!chosen && candidates.length) chosen = candidates[0];
      if (!chosen) continue;
      if (!debugMode && chosen.toLowerCase().includes("realartmaine")) continue;
      counts[chosen] = (counts[chosen] || 0) + 1;
    }
  }
  const list = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  let html = "<h1>Leaderboard</h1>";
  if (debugMode) {
    html += '<p style="opacity:.6">Debug mode enabled</p>';
  }
  if (!list.length) {
    html += "<p>No Top Flickers found.</p>";
  } else {
    html += `
      <div class="table-wrap">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th class="rank-col">#</th>
              <th class="photog-col">Flicker</th>
              <th class="count-col">Flicks</th>
            </tr>
          </thead>
          <tbody>
    `;
    list.slice(0, 200).forEach(([name, cnt], idx) => {
      html += `
        <tr>
          <td class="rank-col">${idx + 1}</td>
          <td class="photog-col">${escapeHtml(name)}</td>
          <td class="count-col">${cnt}</td>
        </tr>
      `;
    });
    html += `
          </tbody>
        </table>
      </div>
    `;
  }
  out.innerHTML = html;
});
