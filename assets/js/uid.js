(function () {
  const GALLERY_KEY = "gallery_uid";
  const LEGACY_KEY = "ram_uid";
  function createUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID)
      return crypto.randomUUID();
    return (
      "uid-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }
  function getStoredUID() {
    try {
      return (
        localStorage.getItem(GALLERY_KEY) ||
        localStorage.getItem(LEGACY_KEY) ||
        localStorage.userId ||
        null
      );
    } catch (e) {
      return null;
    }
  }
  function saveLocalUID(uid) {
    try {
      localStorage.setItem(GALLERY_KEY, uid);
      try {
        localStorage.setItem(LEGACY_KEY, uid);
      } catch (e) {}
      try {
        localStorage.userId = uid;
      } catch (e) {}
    } catch (e) {
      console.warn("[UID] could not save to localStorage", e);
    }
  }
  async function ensureUID() {
    let uid = getStoredUID();
    if (!uid) {
      uid = createUID();
      saveLocalUID(uid);
      const userObj = {
        uid,
        createdAt: Date.now(),
        userAgent: navigator.userAgent || null,
        platform: navigator.platform || null,
      };
      if (typeof window.registerUser === "function") {
        try {
          await window.registerUser(userObj);
          console.log("[UID] registered user:", uid);
        } catch (err) {
          console.warn("[UID] registerUser failed, user saved locally:", err);
        }
      }
    }
    window.getGalleryUID = function () {
      return getStoredUID();
    };
    window.getUID = function () {
      return getStoredUID();
    };
    return uid;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureUID);
  } else {
    ensureUID();
  }
})();
