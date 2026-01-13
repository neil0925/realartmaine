(function () {
  const KEY = 'ram_uid';

  function createUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'uid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function getStoredUID() {
    try {
      // Prefer modern key, fall back to legacy localStorage.userId for compatibility
      return localStorage.getItem(KEY) || localStorage.userId || null;
    } catch (e) {
      return null;
    }
  }

  function saveLocalUID(uid) {
    try {
      localStorage.setItem(KEY, uid);
      // Also write legacy key so older code continues to work (e.g., strokes.js)
      try { localStorage.userId = uid; } catch (e) {}
    } catch (e) {
      console.warn('[UID] could not save to localStorage', e);
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
        platform: navigator.platform || null
      };

      if (typeof window.registerUser === 'function') {
        try {
          await window.registerUser(userObj);
          console.log('[UID] registered user:', uid);
        } catch (err) {
          console.warn('[UID] registerUser failed, user saved locally:', err);
        }
      } else {
        // registerUser may not be available yet (module not executed); that's fine
        console.warn('[UID] window.registerUser not available; user saved locally only');
      }
    }

    // expose helper
    window.getUID = function () {
      return getStoredUID();
    };

    return uid;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureUID);
  } else {
    ensureUID();
  }
})();
