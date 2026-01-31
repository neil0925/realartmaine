// settings.js
// Injects a settings button + grey dropdown with a "Clear cache" action.
(function () {
  function qs(sel) { return document.querySelector(sel); }

  function createSettingsUI() {
    if (qs('#settings-dropdown-wrapper')) return; // already added

    const nav = qs('nav') || document.body;

    // If the page already has a .settings-dropdown element (we added it in HTML),
    // use that and remove absolute positioning so the gear participates in the
    // nav layout (left of the site title). Otherwise create a lightweight wrapper
    // and insert it before the site title.
    let container = qs('.settings-dropdown');
    let createdWrapper = false;
    if (container) {
      // reset positioning so nav flex layout controls alignment
      container.style.position = 'static';
      container.style.right = '';
      container.style.top = '';
      container.style.transform = '';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
    } else {
      container = document.createElement('div');
      container.className = 'settings-dropdown';
      Object.assign(container.style, {
        position: 'static',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'Arial, Helvetica, sans-serif'
      });
      createdWrapper = true;
    }

    const btn = document.createElement('button');
    btn.id = 'settings-btn';
    btn.type = 'button';
    btn.title = 'Settings';
    btn.innerText = '\u2699'; // gear
    Object.assign(btn.style, {
      width: '38px', height: '38px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.12)',
      background: '#ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '18px'
    });

    const dropdown = document.createElement('div');
    dropdown.id = 'settings-dropdown';
    Object.assign(dropdown.style, {
      display: 'none',
      position: 'absolute',
      right: '0',
      top: '46px',
      minWidth: '220px',
      background: '#e0e0e0',
      color: '#111',
      borderRadius: '8px',
      padding: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      border: '1px solid rgba(0,0,0,0.08)'
    });

    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearCacheBtn';
    clearBtn.type = 'button';
    clearBtn.innerText = 'Clear browser cache (local/session)';
    Object.assign(clearBtn.style, {
      width: '100%', padding: '8px 10px', borderRadius: '6px', border: 'none', background: '#cfcfcf', cursor: 'pointer'
    });

    const clearSW = document.createElement('button');
    clearSW.id = 'clearCachesBtn';
    clearSW.type = 'button';
    clearSW.innerText = 'Clear Service Worker caches';
    Object.assign(clearSW.style, {
      width: '100%', padding: '8px 10px', borderRadius: '6px', border: 'none', background: '#bfbfbf', cursor: 'pointer', marginTop: '8px'
    });

    const note = document.createElement('div');
    note.style.fontSize = '12px';
    note.style.marginTop = '8px';
    note.style.opacity = '0.9';
    note.innerText = 'This will remove localStorage and sessionStorage data. Use cautiously.';

    dropdown.appendChild(clearBtn);
    dropdown.appendChild(clearSW);
    dropdown.appendChild(note);

    container.appendChild(btn);
    container.appendChild(dropdown);

    // attach: if we created a new wrapper, insert it before the site title
    if (createdWrapper) {
      const rightGroup = qs('.right-group');
      const siteTitle = qs('.site-title');
      if (rightGroup && siteTitle) {
        rightGroup.insertBefore(container, siteTitle);
      } else if (nav && nav.appendChild) {
        nav.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
    }

    // toggle
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    // outside click closes
    document.addEventListener('click', (ev) => {
      if (!wrapper.contains(ev.target)) dropdown.style.display = 'none';
    });

    // clear storage
    clearBtn.addEventListener('click', async () => {
      const ok = window.confirm('Clear localStorage and sessionStorage for this site? This cannot be undone.');
      if (!ok) return;
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('localStorage.clear() failed', e);
      }
      try { sessionStorage.clear(); } catch (e) { console.warn('sessionStorage.clear() failed', e); }
      // indicate success
      clearBtn.innerText = 'Storage cleared';
      clearBtn.disabled = true;
      setTimeout(() => { clearBtn.innerText = 'Clear browser cache (local/session)'; clearBtn.disabled = false; }, 2500);
    });

    // clear caches (Cache Storage)
    clearSW.addEventListener('click', async () => {
      const ok = window.confirm('Delete all Cache Storage entries for this origin?');
      if (!ok) return;
      if (!('caches' in window)) {
        alert('Cache Storage API not supported in this browser.');
        return;
      }
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        clearSW.innerText = 'Service caches cleared';
        clearSW.disabled = true;
        setTimeout(() => { clearSW.innerText = 'Clear Service Worker caches'; clearSW.disabled = false; }, 2500);
      } catch (err) {
        console.warn('Failed to clear caches', err);
        alert('Failed to clear caches: see console');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createSettingsUI);
  else createSettingsUI();
})();
