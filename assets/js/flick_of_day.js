(function () {
  const GALLERY_EXTS = [".jpg", ".JPG", ".jpeg", ".JPEG"];
  const FREIGHT_EXTS = [
    ".jpg",
    ".JPG",
    ".jpeg",
    ".JPEG",
    ".png",
    ".PNG",
    ".gif",
    ".GIF",
    ".webp",
    ".WEBP",
  ];

  function gcd(a, b) {
    let x = Math.abs(Number(a) || 0);
    let y = Math.abs(Number(b) || 0);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  }

  function chooseCoprimeStep(total) {
    if (!Number.isFinite(total) || total <= 1) return 1;
    let step = Math.floor(total * 0.61803398875);
    if (step < 2) step = 2;
    if (step >= total) step = total - 1;
    if (step % 2 === 0) step += 1;

    let current = step;
    while (current < total) {
      if (gcd(current, total) === 1) return current;
      current += 2;
    }

    current = 1;
    while (current < total) {
      if (gcd(current, total) === 1) return current;
      current += 1;
    }
    return 1;
  }

  function parseFlagToken(value) {
    const token = String(value || "").trim().toLowerCase();
    if (token === "y" || token === "yes" || token === "true" || token === "1") {
      return true;
    }
    if (token === "n" || token === "no" || token === "false" || token === "0") {
      return false;
    }
    return null;
  }

  function parseLabel(label) {
    const parts = String(label || "")
      .split("-")
      .map((v) => String(v || "").trim())
      .filter(Boolean);

    let core = parts.slice();
    if (core.length >= 6) {
      const tail = core.slice(-3).map(parseFlagToken);
      if (tail.every((v) => typeof v === "boolean")) {
        core = core.slice(0, -3);
      }
    }

    let tags = [];
    let photographer = "";

    if (core.length === 2) {
      tags = core[0].split(",").map((t) => t.trim()).filter(Boolean);
      photographer = core[1] || "";
    } else if (core.length === 3) {
      tags = core[0].split(",").map((t) => t.trim()).filter(Boolean);
      photographer = core[2] || "";
    } else if (core.length > 3) {
      tags = core[0].split(",").map((t) => t.trim()).filter(Boolean);
      photographer = core[core.length - 2] || "";
    } else {
      tags = String(label || "")
        .split("-")[0]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (photographer) {
      photographer = photographer.split(/\s|,/).filter(Boolean)[0] || "";
    }

    return { tags, photographer };
  }

  function buildEntries(source, labels, basePath, extensions) {
    const out = [];
    if (!Array.isArray(labels)) return out;

    for (let i = 1; i < labels.length; i += 1) {
      const label = String(labels[i] || "").trim();
      if (!label) continue;
      const parsed = parseLabel(label);
      const candidates = extensions.map((ext) => `${basePath}/${i}${ext}`);
      out.push({
        source,
        index: i,
        label,
        tags: parsed.tags,
        photographer: parsed.photographer,
        candidates,
      });
    }

    return out;
  }

  function buildCaption(entry) {
    const tagText = Array.isArray(entry.tags) && entry.tags.length
      ? entry.tags.join(", ")
      : "";
    const photographerText = String(entry.photographer || "").trim();
    if (tagText && photographerText) return `${tagText} flicked by ${photographerText}`;
    if (tagText) return tagText;
    if (photographerText) return `flicked by ${photographerText}`;
    return "";
  }

  function getDayNumberEastern() {
    const now = new Date();
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(now);
      const year = Number(parts.find((p) => p.type === "year")?.value);
      const month = Number(parts.find((p) => p.type === "month")?.value);
      const day = Number(parts.find((p) => p.type === "day")?.value);
      if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
        const easternMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
        return Math.floor(easternMidnight / 86400000);
      }
    } catch (e) {}

    const utcMidnight = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    );
    return Math.floor(utcMidnight / 86400000);
  }

  function pickEntryForToday(entries) {
    if (!entries.length) return null;
    if (entries.length === 1) return entries[0];

    const dayNumber = getDayNumberEastern();
    const total = entries.length;
    const step = chooseCoprimeStep(total);
    const base = 37 % total;
    const idx = ((dayNumber * step + base) % total + total) % total;
    return entries[idx] || entries[0];
  }

  function resolveImage(entry) {
    return new Promise((resolve) => {
      if (!entry || !Array.isArray(entry.candidates) || !entry.candidates.length) {
        resolve("");
        return;
      }

      let i = 0;
      const testNext = function () {
        if (i >= entry.candidates.length) {
          resolve("");
          return;
        }

        const candidate = entry.candidates[i++];
        const img = new Image();
        img.onload = function () {
          resolve(candidate);
        };
        img.onerror = function () {
          testNext();
        };
        img.src = candidate;
      };

      testNext();
    });
  }

  function openSpotlight(imageSrc, captionText) {
    if (!imageSrc) return;

    const existing = document.querySelector(".modal-backdrop");
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal flick-day-modal";

    const imgWrap = document.createElement("div");
    imgWrap.className = "modal-imgwrap";

    const img = document.createElement("img");
    img.className = "modal-image";
    img.alt = captionText || "Flick of the day";
    img.src = imageSrc;

    imgWrap.appendChild(img);
    modal.appendChild(imgWrap);

    const caption = document.createElement("div");
    caption.className = "caption";
    caption.textContent = captionText || "";
    if (!captionText) caption.style.display = "none";
    modal.appendChild(caption);

    const close = function () {
      document.removeEventListener("keydown", onKeyDown);
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    };

    const onKeyDown = function (ev) {
      if (ev.key === "Escape") close();
    };

    backdrop.addEventListener("click", function (ev) {
      if (ev.target === backdrop) close();
    });

    document.addEventListener("keydown", onKeyDown);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
  }

  function init() {
    const card = document.getElementById("flickDayCard");
    const image = document.getElementById("flickDayImage");
    const caption = document.getElementById("flickDayCaption");
    const loader = document.getElementById("flickDayLoader");
    if (!card || !image || !caption || !loader) return;

    card.classList.remove("loaded");
    caption.textContent = "";
    caption.style.display = "none";

    const galleryLabels =
      typeof window.IMAGE_LABELS !== "undefined" ? window.IMAGE_LABELS : [];
    const freightLabels =
      typeof window.FREIGHT_LABELS !== "undefined" ? window.FREIGHT_LABELS : [];

    const entries = []
      .concat(buildEntries("gallery", galleryLabels, "/assets/images", GALLERY_EXTS))
      .concat(buildEntries("freights", freightLabels, "/assets/Freights", FREIGHT_EXTS));

    const picked = pickEntryForToday(entries);
    if (!picked) {
      caption.textContent = "No flick available yet.";
      caption.style.display = "block";
      card.classList.add("loaded");
      card.disabled = true;
      card.style.cursor = "default";
      return;
    }

    const captionText = buildCaption(picked);

    resolveImage(picked).then((src) => {
      if (!src) {
        caption.textContent = "Flick image unavailable for today.";
        caption.style.display = "block";
        card.classList.add("loaded");
        card.disabled = true;
        card.style.cursor = "default";
        return;
      }

      let revealed = false;
      const reveal = function () {
        if (revealed) return;
        revealed = true;
        card.classList.add("loaded");
      };

      image.addEventListener("load", reveal, { once: true });
      image.src = src;
      if (typeof image.decode === "function") {
        image.decode().then(reveal).catch(() => {});
      } else if (image.complete) {
        reveal();
      }

      card.addEventListener("click", function () {
        openSpotlight(src, captionText);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
