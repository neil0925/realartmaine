function escapeHtml(value) {
  return String(value).replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}

const LEADERBOARD_VIEW_KEY = "ram_leaderboard_view_v1";
const SAVE_LAST_LEADERBOARD_PREF_KEY = "ram_save_last_leaderboard_enabled_v1";
const LEADERBOARD_VIEW_PARAM = "view";
const DEFAULT_LEADERBOARD_VIEW = "flickers";
const LEADERBOARD_FALLBACK_SYNONYM_GROUPS = [
  [
    "throwie",
    "bubble letter",
    "throw",
    "bubbleletter",
    "throw up",
    "throwups",
    "throwup",
    "throw ups",
  ],
  [
    "antistyle",
    "anti style",
    "anti",
    "hipster graffiti",
    "hipster graff",
    "hipstergraff",
    "hipstergraffiti",
  ],
  ["catch", "cache"],
  ["ducky", "theportlandbee", "the portland bee", "bee"],
  ["dove", "doves"],
  ["VC", "HKC"],
  ["salud", "saludpig", "salud pig", "pig"],
  ["CTS", "TNL"],
  ["OY!", "oh yes!", "ohyes!"],
  [
    "triangle",
    "tri angle",
    "cheese",
    "cheesegrater",
    "cheese grater",
    "cheesegrater of death",
  ],
];
const VIEW_DEFS = {
  flickers: {
    option: "Top Flickers",
    nameLabel: "Flicker",
    countLabel: "Flicks",
    empty: "No flickers found.",
  },
  crews: {
    option: "Crews",
    nameLabel: "Crew",
    countLabel: "Flicks they were shown in",
    empty: "No crews found.",
  },
  tags: {
    option: "Tags",
    nameLabel: "Tag",
    countLabel: "Flicks they were shown in",
    empty: "No tags found.",
  },
};

function normalizeViewKey(view) {
  if (view === "styles" || view === "names") return "tags";
  return view;
}

function isValidView(view) {
  return !!view && Object.prototype.hasOwnProperty.call(VIEW_DEFS, view);
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function resolveSynonymGroups() {
  if (typeof SYNONYM_GROUPS !== "undefined" && Array.isArray(SYNONYM_GROUPS)) {
    return SYNONYM_GROUPS;
  }
  if (typeof window !== "undefined" && Array.isArray(window.SYNONYM_GROUPS)) {
    return window.SYNONYM_GROUPS;
  }
  return LEADERBOARD_FALLBACK_SYNONYM_GROUPS;
}

function buildCanonicalSynonymMap(groups) {
  const map = {};
  if (!Array.isArray(groups)) return map;
  groups.forEach((group) => {
    if (!Array.isArray(group) || !group.length) return;
    const normalizedGroup = group.map(normalizeText).filter(Boolean);
    if (!normalizedGroup.length) return;
    const canonical = normalizedGroup[0];
    normalizedGroup.forEach((term) => {
      map[term.toLowerCase()] = canonical;
    });
  });
  return map;
}

const SYNONYM_CANONICAL_MAP = buildCanonicalSynonymMap(resolveSynonymGroups());

function canonicalizeName(name) {
  const display = normalizeText(name);
  if (!display) return "";
  const canonical = SYNONYM_CANONICAL_MAP[display.toLowerCase()];
  return canonical || display;
}

function splitCommaValues(segment) {
  return String(segment || "")
    .split(",")
    .map((part) => normalizeText(part))
    .filter(Boolean);
}

function parseLabelSegments(label) {
  const parts = String(label || "")
    .split("-")
    .map((part) => normalizeText(part))
    .filter(Boolean);
  if (parts.length < 3) return null;
  if (parts.length >= 4) {
    return {
      tagNameSegment: parts[0],
      crewSegment: parts[1],
      flickerSegment: parts[2],
      tagSegment: parts.slice(3).join("-"),
    };
  }
  return {
    tagNameSegment: parts[0],
    crewSegment: "",
    flickerSegment: parts[1],
    tagSegment: parts.slice(2).join("-"),
  };
}

function incrementCounter(map, name) {
  const display = canonicalizeName(name);
  if (!display) return;
  const key = display.toLowerCase();
  const existing = map.get(key);
  if (existing) {
    existing.count += 1;
    return;
  }
  map.set(key, { name: display, count: 1 });
}

function incrementUniquePerEntry(map, values) {
  const seen = new Set();
  values.forEach((raw) => {
    const display = canonicalizeName(raw);
    if (!display) return;
    const key = display.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      return;
    }
    map.set(key, { name: display, count: 1 });
  });
}

function pickFlicker(segment, debugMode) {
  const candidates = splitCommaValues(segment);
  for (let i = 0; i < candidates.length; i += 1) {
    const name = normalizeText(candidates[i]);
    if (!name) continue;
    const lower = name.toLowerCase();
    if (!debugMode && lower.includes("realartmaine")) continue;
    const compact = name.replace(/\s+/g, "");
    if (/^[A-Z0-9!]{1,6}$/.test(compact) && compact === compact.toUpperCase()) {
      continue;
    }
    return name;
  }
  return "";
}

function sortLeaderboard(map) {
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 200);
}

function collectLabels() {
  const labels = [];
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
    globalMetaList.forEach((item) => {
      const label = normalizeText(item && item.label);
      if (label) labels.push(label);
    });
  } else if (globalImageLabels && Array.isArray(globalImageLabels)) {
    for (let i = 1; i < globalImageLabels.length; i += 1) {
      const label = normalizeText(globalImageLabels[i]);
      if (label) labels.push(label);
    }
  }

  if (globalVideoLabels && Array.isArray(globalVideoLabels)) {
    for (let i = 1; i < globalVideoLabels.length; i += 1) {
      const label = normalizeText(globalVideoLabels[i]);
      if (label) labels.push(label);
    }
  }

  return labels;
}

function buildLeaderboards(labels, debugMode) {
  const flickers = new Map();
  const crews = new Map();
  const tags = new Map();

  labels.forEach((label) => {
    const parsed = parseLabelSegments(label);
    if (!parsed) return;

    const flicker = pickFlicker(parsed.flickerSegment, debugMode);
    if (flicker) incrementCounter(flickers, flicker);

    const crewValues = splitCommaValues(parsed.crewSegment);
    if (crewValues.length) incrementUniquePerEntry(crews, crewValues);

    const tagValues = splitCommaValues(parsed.tagNameSegment);
    if (tagValues.length) incrementUniquePerEntry(tags, tagValues);
  });

  return {
    flickers: sortLeaderboard(flickers),
    crews: sortLeaderboard(crews),
    tags: sortLeaderboard(tags),
  };
}

function readSavedView() {
  try {
    const saved = localStorage.getItem(LEADERBOARD_VIEW_KEY);
    const normalized = normalizeViewKey(saved);
    return isValidView(normalized) ? normalized : "";
  } catch (e) {
    return "";
  }
}

function saveView(view) {
  try {
    localStorage.setItem(LEADERBOARD_VIEW_KEY, view);
  } catch (e) {}
}

function getSaveLastLeaderboardSetting() {
  try {
    const raw = localStorage.getItem(SAVE_LAST_LEADERBOARD_PREF_KEY);
    if (raw === null) return false;
    return raw === "1";
  } catch (e) {
    return false;
  }
}

function readViewFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const view = normalizeViewKey(params.get(LEADERBOARD_VIEW_PARAM));
    return isValidView(view) ? view : "";
  } catch (e) {
    return "";
  }
}

function writeViewToUrl(view) {
  try {
    const url = new URL(window.location.href);
    if (view === DEFAULT_LEADERBOARD_VIEW) {
      url.searchParams.delete(LEADERBOARD_VIEW_PARAM);
    } else {
      url.searchParams.set(LEADERBOARD_VIEW_PARAM, view);
    }
    const query = url.searchParams.toString();
    const next =
      url.pathname + (query ? "?" + query : "") + (url.hash ? url.hash : "");
    window.history.replaceState(null, "", next);
  } catch (e) {}
}

function renderLeaderboard(root, boardData, activeView, debugMode) {
  const view = isValidView(activeView) ? activeView : DEFAULT_LEADERBOARD_VIEW;
  const def = VIEW_DEFS[view];
  const rows = boardData[view] || [];

  let html = "<h1>Leaderboard</h1>";
  html += `
    <div class="leaderboard-controls search-bar">
      <select id="leaderboardViewSelect" aria-label="Leaderboard view" title="Leaderboard view">
        <option value="flickers">${VIEW_DEFS.flickers.option}</option>
        <option value="crews">${VIEW_DEFS.crews.option}</option>
        <option value="tags">${VIEW_DEFS.tags.option}</option>
      </select>
    </div>
  `;

  if (debugMode) {
    html += '<p style="opacity:.6">Debug mode enabled</p>';
  }

  if (!rows.length) {
    html += `<p>${escapeHtml(def.empty)}</p>`;
    root.innerHTML = html;
    const emptySelect = document.getElementById("leaderboardViewSelect");
    if (emptySelect) emptySelect.value = view;
    return;
  }

  html += `
    <div class="table-wrap">
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th class="photog-col">${escapeHtml(def.nameLabel)}</th>
            <th class="count-col">${escapeHtml(def.countLabel)}</th>
          </tr>
        </thead>
        <tbody>
  `;

  rows.forEach((row, index) => {
    const gallerySearchHref = `/Gallery/?search=${encodeURIComponent(row.name)}`;
    const rowNameEscaped = escapeHtml(row.name);
    html += `
      <tr>
        <td class="rank-col">${index + 1}</td>
        <td class="photog-col">
          <a
            class="leaderboard-link"
            href="${gallerySearchHref}"
            aria-label="Search gallery for ${rowNameEscaped}"
            title="Search gallery for ${rowNameEscaped}"
          >${rowNameEscaped}</a>
        </td>
        <td class="count-col">${row.count}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  root.innerHTML = html;
  const select = document.getElementById("leaderboardViewSelect");
  if (select) select.value = view;
}

document.addEventListener("DOMContentLoaded", function () {
  const out = document.getElementById("leaderboard");
  if (!out) return;

  const debugMode =
    new URLSearchParams(window.location.search).get("debug") === "true";
  const labels = collectLabels();
  const boardData = buildLeaderboards(labels, debugMode);
  const saveLastEnabled = getSaveLastLeaderboardSetting();
  let currentView =
    readViewFromUrl() ||
    (saveLastEnabled ? readSavedView() : "") ||
    DEFAULT_LEADERBOARD_VIEW;

  if (!isValidView(currentView)) currentView = DEFAULT_LEADERBOARD_VIEW;
  if (saveLastEnabled) saveView(currentView);
  writeViewToUrl(currentView);

  function refresh(nextView) {
    const normalizedView = normalizeViewKey(nextView);
    const view = isValidView(normalizedView)
      ? normalizedView
      : DEFAULT_LEADERBOARD_VIEW;
    currentView = view;
    if (getSaveLastLeaderboardSetting()) saveView(currentView);
    writeViewToUrl(currentView);
    renderLeaderboard(out, boardData, currentView, debugMode);
    const select = document.getElementById("leaderboardViewSelect");
    if (!select) return;
    select.addEventListener("change", function () {
      refresh(select.value);
    });
  }

  refresh(currentView);

  window.addEventListener("popstate", function () {
    const fromUrl = readViewFromUrl() || DEFAULT_LEADERBOARD_VIEW;
    if (fromUrl === currentView) return;
    refresh(fromUrl);
  });
});
