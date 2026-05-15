(function () {
  function getIcons() {
    return window.RAMTaggerIcons || null;
  }

  function getFav() {
    return window.RAMFavorites || null;
  }

  function createTaggerPopupController() {
    const icons = getIcons();
    const taggerPopup = document.createElement("div");
    taggerPopup.className = "tagger-icon-popup hidden";
    taggerPopup.dataset.tagger = "";
    const taggerPopupRow = document.createElement("motion" === "x" ? "div" : "div");
    taggerPopupRow.className = "tagger-icon-row";
    taggerPopup.appendChild(taggerPopupRow);
    document.body.appendChild(taggerPopup);

    let taggerButtons = [];
    let activeTaggerKey = "";

    const setActiveTaggerButton = (taggerKey) => {
      activeTaggerKey = taggerKey || "";
      taggerButtons.forEach(({ key, button }) => {
        if (key === taggerKey) button.classList.add("active");
        else button.classList.remove("active");
      });
    };

    const hideTaggerPopup = () => {
      taggerPopup.classList.add("hidden");
      taggerPopup.dataset.tagger = "";
      taggerPopup.style.visibility = "";
      setActiveTaggerButton("");
    };

    const positionTaggerPopup = (anchorEl) => {
      if (!anchorEl) return;
      const rect = anchorEl.getBoundingClientRect();
      const desiredLeft = rect.left + rect.width / 2;
      const desiredTop = rect.bottom + 8;
      taggerPopup.style.left = `${desiredLeft}px`;
      taggerPopup.style.top = `${desiredTop}px`;
      taggerPopup.style.transform = "translate(-50%, 0)";
      taggerPopup.style.visibility = "hidden";
      taggerPopup.classList.remove("hidden");

      const popupRect = taggerPopup.getBoundingClientRect();
      const half = popupRect.width / 2;
      const minLeft = 8 + half;
      const maxLeft = window.innerWidth - 8 - half;
      let left = desiredLeft;
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;

      let top = desiredTop;
      let transform = "translate(-50%, 0)";
      if (top + popupRect.height > window.innerHeight - 8) {
        top = rect.top - 8;
        transform = "translate(-50%, -100%)";
      }
      if (top < 8) top = 8;

      taggerPopup.style.left = `${left}px`;
      taggerPopup.style.top = `${top}px`;
      taggerPopup.style.transform = transform;
      taggerPopup.style.visibility = "visible";
    };

    const renderTaggerPopup = (taggerKey, anchorEl) => {
      if (!icons) return;
      taggerPopupRow.innerHTML = "";
      const iconKeys = icons.getDisplayIconsForTagger(taggerKey);
      if (!iconKeys.length) {
        hideTaggerPopup();
        return;
      }

      iconKeys.forEach((iconKey) => {
        const iconWrap = document.createElement("span");
        iconWrap.className = "tagger-icon";
        iconWrap.setAttribute("tabindex", "0");
        const iconLabel = icons.getIconLabel(iconKey);
        iconWrap.dataset.label = iconLabel;
        iconWrap.setAttribute("aria-label", iconLabel);
        iconWrap.setAttribute("role", "img");

        const iconImg = document.createElement("img");
        iconImg.className = "tagger-icon-img";
        iconImg.alt = iconKey;
        iconImg.src = icons.iconSrcForKey(iconKey);
        iconImg.onerror = () => {
          if (iconWrap.parentNode) iconWrap.parentNode.removeChild(iconWrap);
        };

        iconWrap.appendChild(iconImg);
        taggerPopupRow.appendChild(iconWrap);
      });

      if (!taggerPopupRow.childElementCount) {
        hideTaggerPopup();
        return;
      }

      taggerPopup.dataset.tagger = taggerKey || "";
      setActiveTaggerButton(taggerKey);
      positionTaggerPopup(anchorEl);
    };

    const toggleTaggerPopup = (taggerName, anchorEl) => {
      if (!icons) return;
      if (document.fullscreenElement) {
        hideTaggerPopup();
        return;
      }
      const taggerKey = icons.normalizeTaggerName(taggerName);
      if (!icons.getDisplayIconsForTagger(taggerKey).length) return;
      const isOpen =
        taggerPopup.dataset.tagger === taggerKey &&
        !taggerPopup.classList.contains("hidden");
      if (isOpen) {
        hideTaggerPopup();
        return;
      }
      renderTaggerPopup(taggerKey, anchorEl);
    };

    return {
      popup: taggerPopup,
      setTaggerButtons(buttons) {
        taggerButtons = buttons || [];
      },
      hideTaggerPopup,
      toggleTaggerPopup,
    };
  }

  function renderRichCaption(captionEl, options) {
    const icons = getIcons();
    const fav = getFav();
    const {
      tags = [],
      photographer = "",
      itemId = "",
      fallbackText = "",
      isDebug = false,
      debugText = "",
      taggerPopupCtrl = null,
    } = options || {};

    let favoriteRequestToken = 0;
    let favoriteState = null;

    captionEl.innerHTML = "";
    if (isDebug) {
      captionEl.textContent = debugText || "";
      return {
        favoriteState: null,
        requestToken: 0,
        bumpToken() {
          return ++favoriteRequestToken;
        },
      };
    }

    const inner = document.createElement("div");
    inner.className = "caption-inner";
    const line = document.createElement("span");
    line.className = "caption-line";
    inner.appendChild(line);
    captionEl.appendChild(inner);

    const taggerButtons = [];
    const taggers = Array.isArray(tags) ? tags.filter(Boolean) : [];
    let hasText = false;

    if (taggers.length && icons) {
      const taggerRow = document.createElement("span");
      taggerRow.className = "caption-tags";
      taggers.forEach((tagger) => {
        const key = icons.normalizeTaggerName(tagger);
        const hasIconList = icons.getDisplayIconsForTagger(key).length > 0;
        if (hasIconList) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "tagger-link";
          button.textContent = tagger;
          taggerButtons.push({ key, button });
          if (taggerPopupCtrl) {
            button.addEventListener("click", (e) => {
              e.stopPropagation();
              taggerPopupCtrl.toggleTaggerPopup(tagger, button);
            });
          }
          taggerRow.appendChild(button);
        } else {
          const label = document.createElement("span");
          label.className = "tagger-name";
          label.textContent = tagger;
          taggerRow.appendChild(label);
        }
      });
      line.appendChild(taggerRow);
      hasText = true;
    } else if (taggers.length) {
      const taggerRow = document.createElement("span");
      taggerRow.className = "caption-tags";
      taggers.forEach((tagger) => {
        const label = document.createElement("span");
        label.className = "tagger-name";
        label.textContent = tagger;
        taggerRow.appendChild(label);
      });
      line.appendChild(taggerRow);
      hasText = true;
    }

    if (photographer) {
      const spacer = hasText ? " " : "";
      line.appendChild(document.createTextNode(`${spacer}flicked by `));
      const photo = document.createElement("span");
      photo.className = "caption-photographer";
      photo.textContent = photographer;
      line.appendChild(photo);
      hasText = true;
    }

    const setFavoriteUI = (state) => {
      if (!state || !state.button || !state.icon || !state.countEl || !fav) return;
      if (state.spinner) {
        state.spinner.classList.add("hidden");
        state.icon.style.display = "block";
        state.button.disabled = false;
        state.button.setAttribute("aria-busy", "false");
      }
      const isFavItem = fav.isFavorited(state.itemId);
      state.icon.src = isFavItem
        ? fav.UNFAVORITE_ICON_SRC
        : fav.FAVORITE_ICON_SRC;
      state.icon.alt = isFavItem ? "Unfavorite" : "Favorite";
      state.countEl.textContent = fav.formatFavoriteCount(fav.getCount(state.itemId));
    };

    const loadFavoriteState = async (targetItemId, token) => {
      if (!targetItemId || !fav) return;
      try {
        await fav.fetchUserFavoriteState(targetItemId);
        await fav.fetchFavoriteCount(targetItemId);
      } catch (e) {}
      if (token !== favoriteRequestToken) return;
      if (favoriteState && favoriteState.itemId === targetItemId) {
        setFavoriteUI(favoriteState);
      }
    };

    const toggleFavorite = async (state) => {
      if (!state || !state.itemId || !fav) return;
      const isFavItem = fav.isFavorited(state.itemId);
      const ok = isFavItem
        ? await fav.removeFavorite(state.itemId)
        : await fav.addFavorite(state.itemId);
      if (!ok) return;
      setFavoriteUI(state);
      if (typeof window.refreshGalleryIfFavoritesSort === "function") {
        window.refreshGalleryIfFavoritesSort();
      }
    };

    if (itemId && fav && fav.isReady()) {
      const token = favoriteRequestToken;
      const action = document.createElement("span");
      action.className = "favorite-action";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "favorite-btn";
      button.style.width = "45px";
      button.style.height = "45px";
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      const spinner = document.createElement("span");
      spinner.className = "favorite-spinner";
      const icon = document.createElement("img");
      icon.src = fav.FAVORITE_ICON_SRC;
      icon.alt = "Favorite";
      icon.style.width = "30px";
      icon.style.height = "30px";
      icon.style.objectFit = "contain";
      icon.style.display = "none";
      button.appendChild(spinner);
      button.appendChild(icon);
      const countEl = document.createElement("span");
      countEl.className = "favorite-count";
      countEl.textContent = "...";
      action.appendChild(button);
      action.appendChild(countEl);
      const favoriteRow = document.createElement("div");
      favoriteRow.className = "favorite-row";
      favoriteRow.appendChild(action);
      inner.appendChild(favoriteRow);

      favoriteState = { itemId, button, icon, countEl, spinner };
      loadFavoriteState(itemId, token).catch(() => {});

      button.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(favoriteState).catch(() => {});
      });
    }

    if (!hasText) {
      line.textContent = fallbackText || "";
    }

    if (!hasText && !fallbackText) {
      captionEl.style.display = "none";
    } else {
      captionEl.style.display = "block";
    }

    if (taggerPopupCtrl) taggerPopupCtrl.setTaggerButtons(taggerButtons);

    return {
      favoriteState,
      get requestToken() {
        return favoriteRequestToken;
      },
      bumpToken() {
        favoriteRequestToken += 1;
        favoriteState = null;
        return favoriteRequestToken;
      },
      reloadFavorites(targetItemId) {
        const token = favoriteRequestToken;
        return loadFavoriteState(targetItemId, token);
      },
    };
  }

  window.RAMGalleryModalUI = {
    createTaggerPopupController,
    renderRichCaption,
  };
})();
