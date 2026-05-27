(function () {
  const TAGGER_LIST_URL = "/assets/Tagger%20List.json";
  const MULTI_WORD_ICON_TOKENS = new Set([
    "old head",
    "circle t",
    "helped id",
    "freight writer",
    "retired name",
  ]);
  const KNOWN_ICON_KEYS = new Set([
    "5g",
    "bne",
    "bomber",
    "circlet",
    "craft",
    "cts",
    "dpw",
    "freight",
    "helped id",
    "locals",
    "ltb",
    "mgi",
    "ohk",
    "oldhead",
    "ptg",
    "retiredname",
    "sdh",
    "slt",
    "tnl",
    "vc",
  ]);
  const ICON_LABEL_MAP = new Map([
    ["circlet", "circle t"],
    ["retiredname", "retired name"],
    ["freight", "freight writer"],
  ]);
  const ICON_FILE_MAP = new Map([
    ["freight", "freight writer"],
    ["retiredname", "retired name"],
    ["helped id", "helped id"],
  ]);

  let taggerListPromise = null;
  let taggerIconMap = null;

  function normalizeTaggerName(value) {
    return String(value || "").trim().toLowerCase();
  }

  function splitIconTokens(value) {
    if (!value) return [];
    const rawTokens = String(value || "")
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
    const out = [];
    rawTokens.forEach((token) => {
      const lower = token.toLowerCase();
      if (lower.includes(" ") && !MULTI_WORD_ICON_TOKENS.has(lower)) {
        lower
          .split(/\s+/)
          .map((part) => part.trim())
          .filter(Boolean)
          .forEach((part) => out.push(part));
      } else {
        out.push(lower);
      }
    });
    return out;
  }

  function normalizeIconToken(value) {
    let token = String(value || "").trim().toLowerCase();
    if (!token) return "";
    token = token.replace(/\s+/g, " ").trim();
    if (token === "helpedid") token = "helped id";
    if (token === "local") token = "locals";
    if (token === "locals") return "locals";
    if (token === "old head") return "oldhead";
    if (token === "oldhead") return "oldhead";
    if (token === "circle t") return "circlet";
    if (token === "circlet") return "circlet";
    if (
      token === "freight" ||
      token === "freight writer" ||
      token === "freightwriter" ||
      token === "freights" ||
      token === "frieght" ||
      token === "frieghts"
    )
      return "freight";
    if (token === "retired" || token === "retired name") return "retiredname";
    return token;
  }

  function getIconLabel(iconKey) {
    if (!iconKey) return "";
    return ICON_LABEL_MAP.get(iconKey) || iconKey;
  }

  function getIconFileName(iconKey) {
    if (!iconKey) return "";
    return ICON_FILE_MAP.get(iconKey) || iconKey;
  }

  function buildTaggerIconMap(data) {
    if (!data || typeof data !== "object") return new Map();
    const map = new Map();
    Object.keys(data).forEach((name) => {
      const key = normalizeTaggerName(name);
      if (!key) return;
      const rawList = Array.isArray(data[name]) ? data[name] : [data[name]];
      const tokens = [];
      rawList.forEach((item) => {
        splitIconTokens(item).forEach((token) => tokens.push(token));
      });
      map.set(key, tokens);
    });
    return map;
  }

  function getMap() {
    return (
      taggerIconMap ||
      (typeof window !== "undefined" && window.RAM_TAGGER_ICON_MAP instanceof Map
        ? window.RAM_TAGGER_ICON_MAP
        : null)
    );
  }

  function getDisplayIconsForTagger(taggerKey) {
    const map = getMap();
    const icons = map && map.get ? map.get(taggerKey) : [];
    const out = [];
    const seen = new Set();
    (icons || []).forEach((icon) => {
      const key = normalizeIconToken(icon);
      if (!key || !KNOWN_ICON_KEYS.has(key)) return;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(key);
    });
    return out;
  }

  async function fetchJsonFile(url) {
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp || !resp.ok) return null;
      return await resp.json();
    } catch (e) {
      return null;
    }
  }

  function ensureLoaded() {
    if (taggerIconMap) return Promise.resolve(taggerIconMap);
    if (
      typeof window !== "undefined" &&
      window.RAM_TAGGER_ICON_MAP instanceof Map
    ) {
      taggerIconMap = window.RAM_TAGGER_ICON_MAP;
      return Promise.resolve(taggerIconMap);
    }
    if (taggerListPromise) return taggerListPromise;
    taggerListPromise = fetchJsonFile(TAGGER_LIST_URL).then((data) => {
      taggerIconMap = buildTaggerIconMap(data);
      if (typeof window !== "undefined") {
        window.RAM_TAGGER_ICON_MAP = taggerIconMap;
      }
      return taggerIconMap;
    });
    return taggerListPromise;
  }

  window.RAMTaggerIcons = {
    ensureLoaded,
    normalizeTaggerName,
    getDisplayIconsForTagger,
    getIconLabel,
    getIconFileName,
    iconSrcForKey(iconKey) {
      const iconFile = getIconFileName(iconKey);
      return `/assets/GUI/Icons/${encodeURIComponent(iconFile)}.png`;
    },
  };
})();
