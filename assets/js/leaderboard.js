function escapeHtml(value) {
  return String(value).replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}

const LEADERBOARD_VIEW_KEY = "ram_leaderboard_view_v1";
const LEADERBOARD_SOURCE_KEY = "ram_leaderboard_source_v1";
const SAVE_LAST_LEADERBOARD_PREF_KEY = "ram_save_last_leaderboard_enabled_v1";
const LEADERBOARD_VIEW_PARAM = "view";
const LEADERBOARD_SOURCE_PARAM = "source";
const DEFAULT_LEADERBOARD_VIEW = "flickers";
const DEFAULT_LEADERBOARD_SOURCE = "gallery";
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
    countLabel: "Flicks they are in",
    empty: "No crews found.",
  },
  tags: {
    option: "Tags",
    nameLabel: "Tag",
    countLabel: "Flicks they are in",
    empty: "No tags found.",
  },
};
const SOURCE_DEFS = {
  gallery: {
    option: "Gallery",
    searchPath: "/Gallery/",
  },
  freights: {
    option: "Freights",
    searchPath: "/Freights/",
  },
};

function normalizeViewKey(view) {
  if (view === "styles" || view === "names") return "tags";
  return view;
}

function normalizeSourceKey(source) {
  const key = String(source || "").trim().toLowerCase();
  if (key === "freight") return "freights";
  return key;
}

function isValidView(view) {
  return !!view && Object.prototype.hasOwnProperty.call(VIEW_DEFS, view);
}

function isValidSource(source) {
  return !!source && Object.prototype.hasOwnProperty.call(SOURCE_DEFS, source);
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

function isYesNoFlagToken(token) {
  const normalized = String(token || "").trim().toLowerCase();
  return (
    normalized === "y" ||
    normalized === "n" ||
    normalized === "yes" ||
    normalized === "no" ||
    normalized === "true" ||
    normalized === "false" ||
    normalized === "1" ||
    normalized === "0"
  );
}

function parseLabelSegments(label) {
  const parts = String(label || "")
    .split("-")
    .map((part) => normalizeText(part))
    .filter(Boolean);
  if (parts.length < 3) return null;

  let coreParts = parts.slice();
  if (coreParts.length >= 6) {
    const tail = coreParts.slice(-3);
    if (tail.every(isYesNoFlagToken)) {
      coreParts = coreParts.slice(0, -3);
    }
  }

  if (coreParts.length < 3) return null;

  const stylesSegment = coreParts.pop() || "";
  const components = coreParts;

  if (components.length === 2) {
    return {
      tagNameSegment: components[0],
      crewSegment: "",
      flickerSegment: components[1],
      stylesSegment,
    };
  }

  if (components.length === 3) {
    return {
      tagNameSegment: components[0],
      crewSegment: components[1],
      flickerSegment: components[2],
      stylesSegment,
    };
  }

  return {
    tagNameSegment: components[0] || "",
    crewSegment: components.slice(1, components.length - 1).join("-"),
    flickerSegment: components[components.length - 1] || "",
    stylesSegment,
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

function sortLeaderboard(map, limit) {
  const max = Number.isFinite(limit) ? Math.max(1, limit) : 200;
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, max);
}

function collectFromLabelArray(labelArray) {
  const out = [];
  if (!Array.isArray(labelArray)) return out;
  for (let i = 1; i < labelArray.length; i += 1) {
    const label = normalizeText(labelArray[i]);
    if (label) out.push(label);
  }
  return out;
}

function collectLabelsForSource(source) {
  const key = normalizeSourceKey(source);

  if (key === "freights") {
    const freightLabels =
      typeof FREIGHT_LABELS !== "undefined"
        ? FREIGHT_LABELS
        : window.FREIGHT_LABELS || null;
    return collectFromLabelArray(freightLabels);
  }

  const labels = [];
  const globalImageLabels =
    typeof IMAGE_LABELS !== "undefined"
      ? IMAGE_LABELS
      : window.IMAGE_LABELS || null;
  const globalVideoLabels =
    typeof VIDEO_LABELS !== "undefined"
      ? VIDEO_LABELS
      : window.VIDEO_LABELS || null;

  collectFromLabelArray(globalImageLabels).forEach((label) => labels.push(label));
  collectFromLabelArray(globalVideoLabels).forEach((label) => labels.push(label));

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
    flickers: sortLeaderboard(flickers, 200),
    crews: sortLeaderboard(crews, 200),
    tags: sortLeaderboard(tags, 200),
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

function readSavedSource() {
  try {
    const saved = localStorage.getItem(LEADERBOARD_SOURCE_KEY);
    const normalized = normalizeSourceKey(saved);
    return isValidSource(normalized) ? normalized : "";
  } catch (e) {
    return "";
  }
}

function saveSource(source) {
  try {
    localStorage.setItem(LEADERBOARD_SOURCE_KEY, source);
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

function readStateFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const view = normalizeViewKey(params.get(LEADERBOARD_VIEW_PARAM));
    const source = normalizeSourceKey(params.get(LEADERBOARD_SOURCE_PARAM));
    return {
      view: isValidView(view) ? view : "",
      source: isValidSource(source) ? source : "",
    };
  } catch (e) {
    return { view: "", source: "" };
  }
}

function cleanupLeaderboardParams() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(LEADERBOARD_VIEW_PARAM);
    url.searchParams.delete(LEADERBOARD_SOURCE_PARAM);
    const query = url.searchParams.toString();
    const next =
      url.pathname + (query ? "?" + query : "") + (url.hash ? url.hash : "");
    window.history.replaceState(null, "", next);
  } catch (e) {}
}

function getRowsForView(boardDataBySource, source, view) {
  const src = isValidSource(source) ? source : DEFAULT_LEADERBOARD_SOURCE;
  const vw = isValidView(view) ? view : DEFAULT_LEADERBOARD_VIEW;
  const bySource = boardDataBySource[src] || {
    flickers: [],
    crews: [],
    tags: [],
  };
  const rows = Array.isArray(bySource[vw]) ? bySource[vw].slice() : [];
  if (vw === "crews") return rows.slice(0, 10);
  return rows;
}

function renderLeaderboard(root, boardDataBySource, activeSource, activeView, debugMode) {
  const source = isValidSource(activeSource)
    ? activeSource
    : DEFAULT_LEADERBOARD_SOURCE;
  const view = isValidView(activeView) ? activeView : DEFAULT_LEADERBOARD_VIEW;
  const sourceDef = SOURCE_DEFS[source];
  const viewDef = VIEW_DEFS[view];
  const rows = getRowsForView(boardDataBySource, source, view);

  let html = "<h1>Leaderboard</h1>";
  html += `
    <div class="leaderboard-controls search-bar">
      <select id="leaderboardSourceSelect" aria-label="Leaderboard source" title="Leaderboard source">
        <option value="gallery">${SOURCE_DEFS.gallery.option}</option>
        <option value="freights">${SOURCE_DEFS.freights.option}</option>
      </select>
    </div>
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
    html += `<p>${escapeHtml(viewDef.empty)}</p>`;
    root.innerHTML = html;
    const sourceSelect = document.getElementById("leaderboardSourceSelect");
    const viewSelect = document.getElementById("leaderboardViewSelect");
    if (sourceSelect) sourceSelect.value = source;
    if (viewSelect) viewSelect.value = view;
    return;
  }

  html += `
    <div class="table-wrap">
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th class="photog-col">${escapeHtml(viewDef.nameLabel)}</th>
            <th class="count-col">${escapeHtml(viewDef.countLabel)}</th>
          </tr>
        </thead>
        <tbody>
  `;

  rows.forEach((row, index) => {
    const nameEscaped = escapeHtml(row.name);
    const targetHref =
      sourceDef.searchPath + "?search=" + encodeURIComponent(row.name);
    html += `
      <tr>
        <td class="rank-col">${index + 1}</td>
        <td class="photog-col">
          <a
            class="leaderboard-link"
            href="${targetHref}"
            aria-label="Search ${escapeHtml(sourceDef.option)} for ${nameEscaped}"
            title="Search ${escapeHtml(sourceDef.option)} for ${nameEscaped}"
          >${nameEscaped}</a>
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
  const sourceSelect = document.getElementById("leaderboardSourceSelect");
  const viewSelect = document.getElementById("leaderboardViewSelect");
  if (sourceSelect) sourceSelect.value = source;
  if (viewSelect) viewSelect.value = view;
}

document.addEventListener("DOMContentLoaded", function () {
  const out = document.getElementById("leaderboard");
  if (!out) return;

  let debugMode = false;
  try {
    debugMode = new URLSearchParams(window.location.search).get("debug") === "true";
  } catch (e) {
    debugMode = false;
  }

  const boardDataBySource = {
    gallery: buildLeaderboards(collectLabelsForSource("gallery"), debugMode),
    freights: buildLeaderboards(collectLabelsForSource("freights"), debugMode),
  };

  const saveLastEnabled = getSaveLastLeaderboardSetting();
  const fromUrl = readStateFromUrl();

  let currentSource =
    fromUrl.source ||
    (saveLastEnabled ? readSavedSource() : "") ||
    DEFAULT_LEADERBOARD_SOURCE;
  let currentView =
    fromUrl.view ||
    (saveLastEnabled ? readSavedView() : "") ||
    DEFAULT_LEADERBOARD_VIEW;

  if (!isValidSource(currentSource)) currentSource = DEFAULT_LEADERBOARD_SOURCE;
  if (!isValidView(currentView)) currentView = DEFAULT_LEADERBOARD_VIEW;

  cleanupLeaderboardParams();

  if (saveLastEnabled) {
    saveSource(currentSource);
    saveView(currentView);
  }

  function refresh(nextSource, nextView) {
    const source = isValidSource(normalizeSourceKey(nextSource))
      ? normalizeSourceKey(nextSource)
      : currentSource;
    const view = isValidView(normalizeViewKey(nextView))
      ? normalizeViewKey(nextView)
      : currentView;

    currentSource = source;
    currentView = view;

    if (getSaveLastLeaderboardSetting()) {
      saveSource(currentSource);
      saveView(currentView);
    }

    renderLeaderboard(out, boardDataBySource, currentSource, currentView, debugMode);

    const sourceSelect = document.getElementById("leaderboardSourceSelect");
    const viewSelect = document.getElementById("leaderboardViewSelect");

    if (sourceSelect) {
      sourceSelect.addEventListener("change", function () {
        refresh(sourceSelect.value, currentView);
      });
    }

    if (viewSelect) {
      viewSelect.addEventListener("change", function () {
        refresh(currentSource, viewSelect.value);
      });
    }
  }

  refresh(currentSource, currentView);
});
