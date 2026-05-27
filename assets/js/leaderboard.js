(function () {
function escapeHtml(value) {
  return String(value).replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}

const LEADERBOARD_VIEW_KEY = "ram_leaderboard_view_v1";
const LEADERBOARD_SOURCE_KEY = "ram_leaderboard_source_v1";
const LEADERBOARD_METRIC_KEY = "ram_leaderboard_metric_v1";
const SAVE_LAST_LEADERBOARD_PREF_KEY = "ram_save_last_leaderboard_enabled_v1";
const LEADERBOARD_VIEW_PARAM = "view";
const LEADERBOARD_SOURCE_PARAM = "source";
const LEADERBOARD_METRIC_PARAM = "metric";
const DEFAULT_LEADERBOARD_VIEW = "flickers";
const DEFAULT_LEADERBOARD_SOURCE = "gallery";
const DEFAULT_LEADERBOARD_METRIC = "presence";
const SUPABASE_URL = "https://ydojwnfxxnwwppfuadwl.supabase.co";
const SUPABASE_KEY = "sb_publishable_DolnQT7u83wmDg4otUDBuQ_yMR1d26I";
const FAVORITES_TABLE = "favorites";
let supabaseClient = null;
const favoriteCountsBySource = {
  gallery: null,
  freights: null,
};
const favoriteCountsPromiseBySource = {
  gallery: null,
  freights: null,
};
const favoriteLeaderboardsBySource = {
  gallery: null,
  freights: null,
};
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
const METRIC_DEFS = {
  presence: {
    option: "Presence",
  },
  favorites: {
    option: "Most Favorites",
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

function normalizeMetricKey(metric) {
  const key = String(metric || "").trim().toLowerCase();
  if (key === "most favorites" || key === "most_favorites") return "favorites";
  if (key === "favorite" || key === "favorites") return "favorites";
  if (key === "presence" || key === "standard") return "presence";
  return key;
}

function isValidView(view) {
  return !!view && Object.prototype.hasOwnProperty.call(VIEW_DEFS, view);
}

function isValidSource(source) {
  return !!source && Object.prototype.hasOwnProperty.call(SOURCE_DEFS, source);
}

function isValidMetric(metric) {
  return !!metric && Object.prototype.hasOwnProperty.call(METRIC_DEFS, metric);
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  try {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
      );
    }
  } catch (e) {}
  return supabaseClient;
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

function incrementCounterBy(map, name, amount) {
  const display = canonicalizeName(name);
  const weight = Number(amount) || 0;
  if (!display || weight <= 0) return;
  const key = display.toLowerCase();
  const existing = map.get(key);
  if (existing) {
    existing.count += weight;
    return;
  }
  map.set(key, { name: display, count: weight });
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

function incrementUniquePerEntryBy(map, values, amount) {
  const weight = Number(amount) || 0;
  if (weight <= 0) return;
  const seen = new Set();
  values.forEach((raw) => {
    const display = canonicalizeName(raw);
    if (!display) return;
    const key = display.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const existing = map.get(key);
    if (existing) {
      existing.count += weight;
      return;
    }
    map.set(key, { name: display, count: weight });
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

function collectLabelEntriesFromArray(labelArray) {
  const out = [];
  if (!Array.isArray(labelArray)) return out;
  for (let i = 1; i < labelArray.length; i += 1) {
    const label = normalizeText(labelArray[i]);
    if (!label) continue;
    out.push({ index: i, label });
  }
  return out;
}

function collectLabelEntriesForSource(source) {
  const key = normalizeSourceKey(source);

  if (key === "freights") {
    const freightLabels =
      typeof FREIGHT_LABELS !== "undefined"
        ? FREIGHT_LABELS
        : window.FREIGHT_LABELS || null;
    return collectLabelEntriesFromArray(freightLabels);
  }

  const entries = [];
  const globalImageLabels =
    typeof IMAGE_LABELS !== "undefined"
      ? IMAGE_LABELS
      : window.IMAGE_LABELS || null;
  const globalVideoLabels =
    typeof VIDEO_LABELS !== "undefined"
      ? VIDEO_LABELS
      : window.VIDEO_LABELS || null;

  collectLabelEntriesFromArray(globalImageLabels).forEach((entry) =>
    entries.push(entry),
  );
  collectLabelEntriesFromArray(globalVideoLabels).forEach((entry) =>
    entries.push(entry),
  );

  return entries;
}

function buildLeaderboards(entries, debugMode) {
  const flickers = new Map();
  const crews = new Map();
  const tags = new Map();

  entries.forEach((entry) => {
    const label = entry && entry.label ? entry.label : entry;
    if (!label) return;
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

function buildFavoriteLeaderboards(entries, source, debugMode, favoriteMap) {
  const flickers = new Map();
  const crews = new Map();
  const tags = new Map();
  const sourceKey = normalizeSourceKey(source);
  const favorites = favoriteMap || new Map();

  entries.forEach((entry) => {
    if (!entry || !entry.label || !entry.index) return;
    const itemId = `${sourceKey}:${entry.index}`;
    const weight = favorites.get(itemId) || 0;
    if (weight <= 0) return;
    const parsed = parseLabelSegments(entry.label);
    if (!parsed) return;

    const flicker = pickFlicker(parsed.flickerSegment, debugMode);
    if (flicker) incrementCounterBy(flickers, flicker, weight);

    const crewValues = splitCommaValues(parsed.crewSegment);
    if (crewValues.length) incrementUniquePerEntryBy(crews, crewValues, weight);

    const tagValues = splitCommaValues(parsed.tagNameSegment);
    if (tagValues.length) incrementUniquePerEntryBy(tags, tagValues, weight);
  });

  return {
    flickers: sortLeaderboard(flickers, 200),
    crews: sortLeaderboard(crews, 200),
    tags: sortLeaderboard(tags, 200),
  };
}

function ensureFavoriteCountsForSource(source) {
  const src = normalizeSourceKey(source);
  if (!isValidSource(src)) return Promise.resolve(new Map());
  if (favoriteCountsBySource[src]) return Promise.resolve(favoriteCountsBySource[src]);
  if (favoriteCountsPromiseBySource[src]) return favoriteCountsPromiseBySource[src];
  const client = getSupabaseClient();
  if (!client) {
    const empty = new Map();
    favoriteCountsBySource[src] = empty;
    return Promise.resolve(empty);
  }
  const prefix = `${src}:`;
  favoriteCountsPromiseBySource[src] = client
    .from(FAVORITES_TABLE)
    .select("item_id")
    .like("item_id", `${prefix}%`)
    .then(({ data }) => {
      const map = new Map();
      if (Array.isArray(data)) {
        data.forEach((row) => {
          if (!row || !row.item_id) return;
          map.set(row.item_id, (map.get(row.item_id) || 0) + 1);
        });
      }
      favoriteCountsBySource[src] = map;
      return map;
    })
    .catch(() => {
      const empty = new Map();
      favoriteCountsBySource[src] = empty;
      return empty;
    });
  return favoriteCountsPromiseBySource[src];
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

function readSavedMetric() {
  try {
    const saved = localStorage.getItem(LEADERBOARD_METRIC_KEY);
    const normalized = normalizeMetricKey(saved);
    return isValidMetric(normalized) ? normalized : "";
  } catch (e) {
    return "";
  }
}

function saveMetric(metric) {
  try {
    localStorage.setItem(LEADERBOARD_METRIC_KEY, metric);
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
    const metric = normalizeMetricKey(params.get(LEADERBOARD_METRIC_PARAM));
    return {
      view: isValidView(view) ? view : "",
      source: isValidSource(source) ? source : "",
      metric: isValidMetric(metric) ? metric : "",
    };
  } catch (e) {
    return { view: "", source: "", metric: "" };
  }
}

function cleanupLeaderboardParams() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(LEADERBOARD_VIEW_PARAM);
    url.searchParams.delete(LEADERBOARD_SOURCE_PARAM);
    url.searchParams.delete(LEADERBOARD_METRIC_PARAM);
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
  if (vw === "tags") return rows.slice(0, 25);
  return rows;
}

function sanitizeViewForMetric(view, metric) {
  return view;
}

function getViewDefForMetric(view, metric) {
  const base = VIEW_DEFS[view] || VIEW_DEFS[DEFAULT_LEADERBOARD_VIEW];
  if (metric !== "favorites") return base;
  return {
    ...base,
    countLabel: "Amount of favorites",
  };
}

function renderLeaderboard(
  root,
  boardDataBySource,
  entriesBySource,
  activeSource,
  activeView,
  activeMetric,
  debugMode,
) {
  const source = isValidSource(activeSource)
    ? activeSource
    : DEFAULT_LEADERBOARD_SOURCE;
  const metric = isValidMetric(activeMetric)
    ? activeMetric
    : DEFAULT_LEADERBOARD_METRIC;
  const view = sanitizeViewForMetric(
    isValidView(activeView) ? activeView : DEFAULT_LEADERBOARD_VIEW,
    metric,
  );
  const sourceDef = SOURCE_DEFS[source];
  const viewDef = getViewDefForMetric(view, metric);
  const favoriteBoards =
    metric === "favorites" ? favoriteLeaderboardsBySource[source] : null;
  const rows =
    metric === "favorites"
      ? getRowsForView(
          { [source]: favoriteBoards || { flickers: [], crews: [], tags: [] } },
          source,
          view,
        )
      : getRowsForView(boardDataBySource, source, view);
  const isLoadingFavorites = metric === "favorites" && !favoriteBoards;
  const showCrews = true;
  const viewOptions = [
    `<option value="flickers">${VIEW_DEFS.flickers.option}</option>`,
    showCrews ? `<option value="crews">${VIEW_DEFS.crews.option}</option>` : "",
    `<option value="tags">${VIEW_DEFS.tags.option}</option>`,
  ]
    .filter(Boolean)
    .join("");

  let html = "<h1>Leaderboard</h1>";
  html += `
    <div class="leaderboard-filters">
      <div class="leaderboard-controls search-bar">
        <select id="leaderboardViewSelect" aria-label="Leaderboard view" title="Leaderboard view">
          ${viewOptions}
        </select>
      </div>
      <div class="leaderboard-controls search-bar">
        <select id="leaderboardSourceSelect" aria-label="Leaderboard source" title="Leaderboard source">
          <option value="gallery">${SOURCE_DEFS.gallery.option}</option>
          <option value="freights">${SOURCE_DEFS.freights.option}</option>
        </select>
      </div>
      <div class="leaderboard-controls search-bar">
        <select id="leaderboardMetricSelect" aria-label="Leaderboard metric" title="Leaderboard metric">
          <option value="presence">${METRIC_DEFS.presence.option}</option>
          <option value="favorites">${METRIC_DEFS.favorites.option}</option>
        </select>
      </div>
    </div>
  `;

  if (debugMode) {
    html += '<p style="opacity:.6">Debug mode enabled</p>';
  }

  if (isLoadingFavorites) {
    html += `<p>Loading favorites...</p>`;
    root.innerHTML = html;
    const sourceSelect = document.getElementById("leaderboardSourceSelect");
    const viewSelect = document.getElementById("leaderboardViewSelect");
    const metricSelect = document.getElementById("leaderboardMetricSelect");
    if (sourceSelect) sourceSelect.value = source;
    if (viewSelect) viewSelect.value = view;
    if (metricSelect) metricSelect.value = metric;
    return;
  }

  if (!rows.length) {
    html += `<p>${escapeHtml(viewDef.empty)}</p>`;
    root.innerHTML = html;
    const sourceSelect = document.getElementById("leaderboardSourceSelect");
    const viewSelect = document.getElementById("leaderboardViewSelect");
    const metricSelect = document.getElementById("leaderboardMetricSelect");
    if (sourceSelect) sourceSelect.value = source;
    if (viewSelect) viewSelect.value = view;
    if (metricSelect) metricSelect.value = metric;
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
  const metricSelect = document.getElementById("leaderboardMetricSelect");
  if (sourceSelect) sourceSelect.value = source;
  if (viewSelect) viewSelect.value = view;
  if (metricSelect) metricSelect.value = metric;
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

  const entriesBySource = {
    gallery: collectLabelEntriesForSource("gallery"),
    freights: collectLabelEntriesForSource("freights"),
  };
  const boardDataBySource = {
    gallery: buildLeaderboards(entriesBySource.gallery, debugMode),
    freights: buildLeaderboards(entriesBySource.freights, debugMode),
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
  let currentMetric =
    fromUrl.metric ||
    (saveLastEnabled ? readSavedMetric() : "") ||
    DEFAULT_LEADERBOARD_METRIC;

  if (!isValidSource(currentSource)) currentSource = DEFAULT_LEADERBOARD_SOURCE;
  if (!isValidView(currentView)) currentView = DEFAULT_LEADERBOARD_VIEW;
  if (!isValidMetric(currentMetric)) currentMetric = DEFAULT_LEADERBOARD_METRIC;
  currentView = sanitizeViewForMetric(currentView, currentMetric);

  cleanupLeaderboardParams();

  if (saveLastEnabled) {
    saveSource(currentSource);
    saveView(currentView);
    saveMetric(currentMetric);
  }

  const requestFavoritesRender = (source, metric) => {
    if (metric !== "favorites") return;
    const src = normalizeSourceKey(source);
    if (!isValidSource(src)) return;
    if (favoriteLeaderboardsBySource[src]) {
      renderLeaderboard(
        out,
        boardDataBySource,
        entriesBySource,
        currentSource,
        currentView,
        currentMetric,
        debugMode,
      );
      return;
    }
    ensureFavoriteCountsForSource(src)
      .then((map) => {
        favoriteLeaderboardsBySource[src] = buildFavoriteLeaderboards(
          entriesBySource[src],
          src,
          debugMode,
          map,
        );
      })
      .finally(() => {
        if (currentMetric !== "favorites") return;
        renderLeaderboard(
          out,
          boardDataBySource,
          entriesBySource,
          currentSource,
          currentView,
          currentMetric,
          debugMode,
        );
      });
  };

  function refresh(nextSource, nextView, nextMetric) {
    const source = isValidSource(normalizeSourceKey(nextSource))
      ? normalizeSourceKey(nextSource)
      : currentSource;
    const view = isValidView(normalizeViewKey(nextView))
      ? normalizeViewKey(nextView)
      : currentView;
    const metric = isValidMetric(normalizeMetricKey(nextMetric))
      ? normalizeMetricKey(nextMetric)
      : currentMetric;

    currentSource = source;
    currentMetric = metric;
    currentView = sanitizeViewForMetric(view, currentMetric);

    if (getSaveLastLeaderboardSetting()) {
      saveSource(currentSource);
      saveView(currentView);
      saveMetric(currentMetric);
    }

    renderLeaderboard(
      out,
      boardDataBySource,
      entriesBySource,
      currentSource,
      currentView,
      currentMetric,
      debugMode,
    );
    requestFavoritesRender(currentSource, currentMetric);
  }

  refresh(currentSource, currentView, currentMetric);

  out.addEventListener("change", function (event) {
    const target = event && event.target;
    if (!target || !target.id) return;
    if (
      target.id !== "leaderboardSourceSelect" &&
      target.id !== "leaderboardViewSelect" &&
      target.id !== "leaderboardMetricSelect"
    ) {
      return;
    }
    const sourceSelect = document.getElementById("leaderboardSourceSelect");
    const viewSelect = document.getElementById("leaderboardViewSelect");
    const metricSelect = document.getElementById("leaderboardMetricSelect");
    const desiredMetric = normalizeMetricKey(
      metricSelect ? metricSelect.value : currentMetric,
    );
    const nextMetric = isValidMetric(desiredMetric)
      ? desiredMetric
      : DEFAULT_LEADERBOARD_METRIC;
    const desiredView = normalizeViewKey(
      viewSelect ? viewSelect.value : currentView,
    );
    const nextView = sanitizeViewForMetric(desiredView, nextMetric);
    if (viewSelect && viewSelect.value !== nextView) {
      viewSelect.value = nextView;
    }
    const nextSource = sourceSelect ? sourceSelect.value : currentSource;
    refresh(nextSource, nextView, nextMetric);
  });
});
})();
