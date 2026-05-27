(function () {
  const SUPABASE_URL = "https://ydojwnfxxnwwppfuadwl.supabase.co";
  const SUPABASE_KEY = "sb_publishable_DolnQT7u83wmDg4otUDBuQ_yMR1d26I";
  const FAVORITES_TABLE = "favorites";
  const FAVORITE_ICON_SRC = "/assets/GUI/Favorite.png";
  const UNFAVORITE_ICON_SRC = "/assets/GUI/Unfavorite.png";

  let supabaseClient = null;
  const userFavorites = new Set();
  const favoriteCounts = new Map();
  const countsBySource = { gallery: null, freights: null };
  const countsPromiseBySource = { gallery: null, freights: null };
  const userIdsBySource = { gallery: null, freights: null };
  const userIdsPromiseBySource = { gallery: null, freights: null };
  const fetchGenerationBySource = { gallery: 0, freights: 0 };

  function normalizeSource(source) {
    const key = String(source || "").trim().toLowerCase();
    if (key === "freight") return "freights";
    return key === "freights" ? "freights" : "gallery";
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

  function getGalleryUIDSafe() {
    try {
      if (typeof window.getGalleryUID === "function") {
        const uid = window.getGalleryUID();
        if (uid) return uid;
      }
      if (typeof window.getUID === "function") {
        const uid = window.getUID();
        if (uid) return uid;
      }
    } catch (e) {}
    try {
      return (
        localStorage.getItem("gallery_uid") ||
        localStorage.getItem("ram_uid") ||
        localStorage.userId ||
        null
      );
    } catch (e) {}
    return null;
  }

  function getItemId(source, index) {
    if (index === undefined || index === null || index === "") return "";
    const n = Number(index);
    if (!Number.isFinite(n) || n < 1) return "";
    const prefix = normalizeSource(source);
    return `${prefix}:${n}`;
  }

  function formatFavoriteCount(value) {
    const count = Number(value || 0);
    if (!Number.isFinite(count) || count <= 0) return "0";
    if (count < 1000) return String(count);
    if (count < 1_000_000) {
      const v = count / 1000;
      const label = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
      return `${label}`.replace(/\.0$/, "") + "k";
    }
    if (count < 1_000_000_000) {
      const v = count / 1_000_000;
      const label = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
      return `${label}`.replace(/\.0$/, "") + "m";
    }
    const v = count / 1_000_000_000;
    const label = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    return `${label}`.replace(/\.0$/, "") + "b";
  }

  function isReady() {
    return !!getSupabaseClient() && !!getGalleryUIDSafe();
  }

  function getUserSet(src) {
    if (!userIdsBySource[src]) userIdsBySource[src] = new Set();
    return userIdsBySource[src];
  }

  function syncUserFavorite(itemId, isFav) {
    if (!itemId) return;
    const prefix = normalizeSource(String(itemId).split(":")[0]);
    const set = getUserSet(prefix);
    if (isFav) {
      set.add(itemId);
      userFavorites.add(itemId);
    } else {
      set.delete(itemId);
      userFavorites.delete(itemId);
    }
  }

  async function fetchFavoriteCount(itemId) {
    if (!itemId) return null;
    const cached = favoriteCounts.get(itemId);
    if (typeof cached === "number") return cached;
    const client = getSupabaseClient();
    if (!client) return null;
    const { count } = await client
      .from(FAVORITES_TABLE)
      .select("id", { count: "exact", head: true })
      .eq("item_id", itemId);
    if (typeof count === "number") {
      favoriteCounts.set(itemId, count);
      return count;
    }
    return null;
  }

  async function fetchUserFavoriteState(itemId) {
    if (!itemId) return null;
    if (userFavorites.has(itemId)) return true;
    const client = getSupabaseClient();
    const uid = getGalleryUIDSafe();
    if (!client || !uid) return null;
    const { data } = await client
      .from(FAVORITES_TABLE)
      .select("id")
      .eq("user_uid", uid)
      .eq("item_id", itemId)
      .limit(1);
    const isFav = Array.isArray(data) && data.length > 0;
    syncUserFavorite(itemId, isFav);
    return isFav;
  }

  async function addFavorite(itemId) {
    if (!itemId) return false;
    const client = getSupabaseClient();
    const uid = getGalleryUIDSafe();
    if (!client || !uid) return false;
    const { error } = await client
      .from(FAVORITES_TABLE)
      .insert({ user_uid: uid, item_id: itemId });
    if (error) return false;
    syncUserFavorite(itemId, true);
    favoriteCounts.set(itemId, (favoriteCounts.get(itemId) || 0) + 1);
    const prefix = normalizeSource(String(itemId).split(":")[0]);
    if (countsBySource[prefix]) {
      countsBySource[prefix].set(
        itemId,
        (countsBySource[prefix].get(itemId) || 0) + 1,
      );
    }
    return true;
  }

  async function removeFavorite(itemId) {
    if (!itemId) return false;
    const client = getSupabaseClient();
    const uid = getGalleryUIDSafe();
    if (!client || !uid) return false;
    const { error } = await client
      .from(FAVORITES_TABLE)
      .delete()
      .eq("user_uid", uid)
      .eq("item_id", itemId);
    if (error) return false;
    syncUserFavorite(itemId, false);
    const next = Math.max(0, (favoriteCounts.get(itemId) || 1) - 1);
    favoriteCounts.set(itemId, next);
    const prefix = normalizeSource(String(itemId).split(":")[0]);
    if (countsBySource[prefix] && countsBySource[prefix].has(itemId)) {
      countsBySource[prefix].set(itemId, next);
    }
    return true;
  }

  function isFavorited(itemId) {
    return userFavorites.has(itemId);
  }

  function getCount(itemId) {
    if (favoriteCounts.has(itemId)) return favoriteCounts.get(itemId);
    const prefix = normalizeSource(String(itemId || "").split(":")[0]);
    const map = countsBySource[prefix];
    if (map && map.has(itemId)) return map.get(itemId);
    return 0;
  }

  function ensureCountsForSource(source) {
    const src = normalizeSource(source);
    if (countsBySource[src]) return Promise.resolve(countsBySource[src]);
    if (countsPromiseBySource[src]) return countsPromiseBySource[src];
    const client = getSupabaseClient();
    if (!client) {
      const empty = new Map();
      countsBySource[src] = empty;
      return Promise.resolve(empty);
    }
    const prefix = `${src}:`;
    countsPromiseBySource[src] = client
      .from(FAVORITES_TABLE)
      .select("item_id")
      .like("item_id", `${prefix}%`)
      .then(({ data, error }) => {
        const map = new Map();
        if (!error && Array.isArray(data)) {
          data.forEach((row) => {
            if (!row || !row.item_id) return;
            map.set(row.item_id, (map.get(row.item_id) || 0) + 1);
          });
        }
        map.forEach((count, itemId) => {
          favoriteCounts.set(
            itemId,
            Math.max(count, favoriteCounts.get(itemId) || 0),
          );
        });
        countsBySource[src] = map;
        countsPromiseBySource[src] = null;
        return map;
      })
      .catch(() => {
        const empty = new Map();
        countsBySource[src] = empty;
        countsPromiseBySource[src] = null;
        return empty;
      });
    return countsPromiseBySource[src];
  }

  function ensureUserFavoriteIdsForSource(source) {
    const src = normalizeSource(source);
    if (userIdsBySource[src]) return Promise.resolve(userIdsBySource[src]);
    if (userIdsPromiseBySource[src]) return userIdsPromiseBySource[src];

    const client = getSupabaseClient();
    const uid = getGalleryUIDSafe();
    if (!client || !uid) {
      const empty = new Set();
      userIdsBySource[src] = empty;
      return Promise.resolve(empty);
    }

    const generation = ++fetchGenerationBySource[src];
    const prefix = `${src}:`;

    userIdsPromiseBySource[src] = client
      .from(FAVORITES_TABLE)
      .select("item_id")
      .eq("user_uid", uid)
      .then(({ data, error }) => {
        if (generation !== fetchGenerationBySource[src]) {
          return userIdsBySource[src] || new Set();
        }
        const set = getUserSet(src);
        set.clear();
        if (!error && Array.isArray(data)) {
          data.forEach((row) => {
            if (!row || !row.item_id) return;
            if (!String(row.item_id).startsWith(prefix)) return;
            set.add(row.item_id);
            userFavorites.add(row.item_id);
          });
        }
        userIdsPromiseBySource[src] = null;
        return set;
      })
      .catch(() => {
        if (generation !== fetchGenerationBySource[src]) {
          return userIdsBySource[src] || new Set();
        }
        const empty = getUserSet(src);
        empty.clear();
        userIdsPromiseBySource[src] = null;
        return empty;
      });

    return userIdsPromiseBySource[src];
  }

  function preloadForSource(source) {
    const src = normalizeSource(source);
    ensureCountsForSource(src).catch(() => {});
    if (getGalleryUIDSafe()) {
      ensureUserFavoriteIdsForSource(src).catch(() => {});
    }
  }

  function needsFavoriteData(sort) {
    return sort === "favorites" || sort === "most_favorites";
  }

  window.RAMFavorites = {
    getItemId,
    normalizeSource,
    formatFavoriteCount,
    isReady,
    isFavorited,
    getCount,
    fetchFavoriteCount,
    fetchUserFavoriteState,
    addFavorite,
    removeFavorite,
    ensureCountsForSource,
    ensureUserFavoriteIdsForSource,
    preloadForSource,
    needsFavoriteData,
    FAVORITE_ICON_SRC,
    UNFAVORITE_ICON_SRC,
  };
})();
