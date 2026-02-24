(async function () {
  function normalizeKey(s) {
    if (!s) return "/";
    let k = String(s).toLowerCase();
    k = k.replace(/\/index\.html$/i, "");
    k = k.replace(/\/$/, "");
    return k || "/";
  }
  const params = new URLSearchParams(window.location.search || "");
  const debugMode = params.get("debug") === "true";
  let text = null;
  async function tryFetchVariants() {
    const candidates = [
      "/maintenance.json",
      "maintenance.json",
      "./maintenance.json",
    ];
    for (const p of candidates) {
      try {
        const r = await fetch(p, { cache: "no-store" });
        if (r && r.ok) return await r.text();
      } catch (err) {}
    }
    return null;
  }
  try {
    text = await tryFetchVariants();
    if (!text) {
      console.info(
        "maintenance: no maintenance.json found at /maintenance.json or local path.",
      );
      return;
    }
  } catch (e) {
    console.warn("maintenance: failed to fetch maintenance.json", e);
    return;
  }
  if (!text || !text.trim()) return;
  let cfg;
  try {
    cfg = JSON.parse(text);
  } catch (e) {
    console.error("maintenance.json parse error", e);
    return;
  }
  if (!cfg || typeof cfg !== "object") return;
  const path = window.location.pathname || "/";
  const normPath = normalizeKey(path);
  const normalizedConfig = {};
  Object.keys(cfg).forEach((k) => {
    normalizedConfig[normalizeKey(k)] = cfg[k];
  });
  let entry = normalizedConfig[normPath] || null;
  if (!entry) {
    const keys = Object.keys(normalizedConfig).sort(
      (a, b) => b.length - a.length,
    );
    for (const key of keys) {
      if (
        normPath === key ||
        normPath.endsWith(key) ||
        key.endsWith(normPath)
      ) {
        entry = normalizedConfig[key];
        break;
      }
      if (normPath.indexOf("/" + key.replace(/^\//, "")) >= 0) {
        entry = normalizedConfig[key];
        break;
      }
    }
  }
  if (!entry) {
    console.info(
      "maintenance: no matching config entry for path",
      normPath,
      "available keys:",
      Object.keys(normalizedConfig),
    );
    return;
  }
  if (
    Object.prototype.hasOwnProperty.call(entry, "enabled") &&
    !entry.enabled
  ) {
    if (debugMode) {
      const badge = document.createElement("div");
      badge.className = "maintenance-debug-badge";
      badge.textContent = "MAINTENANCE CONFIGURED (disabled)";
      document.addEventListener("DOMContentLoaded", () =>
        document.body.appendChild(badge),
      );
    }
    return;
  }
  if (debugMode) {
    const badge = document.createElement("div");
    badge.className = "maintenance-debug-badge";
    badge.textContent = "MAINTENANCE ACTIVE (debug)";
    document.addEventListener("DOMContentLoaded", () => {
      document.body.appendChild(badge);
    });
    return;
  }
  function createBanner(pageName) {
    const wrapper = document.createElement("div");
    wrapper.className = "maintenance-banner";
    const title = document.createElement("h1");
    title.textContent = (pageName || "This page") + " is under maintenance";
    const info = document.createElement("p");
    info.className = "maintenance-estimate";
    info.textContent = entry.estimated
      ? "Estimated to be done by " + entry.estimated
      : "Estimated time not specified.";
    const note = document.createElement("p");
    note.className = "maintenance-note";
    if (entry.note && String(entry.note).trim()) {
      note.textContent = String(entry.note).trim();
    } else {
      note.textContent = "";
    }
    const help = document.createElement("p");
    help.className = "maintenance-help";
    help.innerHTML =
      'Feel free to check out the rest of our site: <a href="/">Home</a>.';
    wrapper.appendChild(title);
    wrapper.appendChild(info);
    if (note.textContent) wrapper.appendChild(note);
    wrapper.appendChild(help);
    return wrapper;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const banner = createBanner(
      (document.title || window.location.pathname)
        .replace(/\s*\|.*$/, "")
        .trim(),
    );
    const overlay = document.createElement("div");
    overlay.className = "maintenance-overlay";
    overlay.appendChild(banner);
    document.body.appendChild(overlay);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  });
})();
