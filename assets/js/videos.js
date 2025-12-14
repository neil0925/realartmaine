// videos.js
// A video-archive/gallery script modelled after gallery.js but optimized
// for videos. Expects optional `metaList` entries, or `VIDEO_LABELS` and
// optional `VIDEO_FILES` arrays (1-based). Falls back to predictable
// filenames under `/assets/videos/`.

function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('galleryContainer');
  if (!container) return;

  const globalMetaList = (typeof metaList !== 'undefined') ? metaList : (window.metaList || null);
  const globalVideoLabels = (typeof VIDEO_LABELS !== 'undefined') ? VIDEO_LABELS : (window.VIDEO_LABELS || null);
  const globalVideoFiles = (typeof VIDEO_FILES !== 'undefined') ? VIDEO_FILES : (window.VIDEO_FILES || null);

  // Helper to resolve video source by index (1-based). Tries: metaList.path,
  // VIDEO_FILES mapping, then common filename patterns.
  function resolveVideoSrc(i) {
    if (globalMetaList && Array.isArray(globalMetaList) && globalMetaList[i] && globalMetaList[i].videoPath) return globalMetaList[i].videoPath;
    if (globalVideoFiles && Array.isArray(globalVideoFiles) && globalVideoFiles[i]) return globalVideoFiles[i];
    // try two common patterns
    const candidates = [`/assets/videos/${i}.mp4`, `/assets/videos/video${i}.mp4`, `/assets/videos/${i}.webm`];
    return candidates[0];
  }

  // Create card elements for each video label entry (or metaList length)
  const count = (globalVideoLabels && Array.isArray(globalVideoLabels)) ? globalVideoLabels.length - 1 : (globalMetaList ? globalMetaList.length : 0);
  if (count <= 0) {
    container.innerHTML = '<p>No videos found.</p>';
    return;
  }

  for (let i = 1; i <= count; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'card';
    const imgWrap = document.createElement('div');
    imgWrap.className = 'image-wrap loaded';

    // placeholder poster using a lightweight blank or SVG
    const placeholder = document.createElement('div');
    placeholder.className = 'loading-placeholder';
    placeholder.innerHTML = `<div class="placeholder-box active"><div class="spinner"></div><div class="loading-error" style="display:none"></div></div>`;

    const poster = document.createElement('div');
    poster.className = 'gallery-image poster';
    poster.textContent = 'Video ' + i;
    poster.setAttribute('aria-hidden','true');

    imgWrap.appendChild(placeholder);
    imgWrap.appendChild(poster);
    wrap.appendChild(imgWrap);

    // attach click to open spotlight/modal with custom controls
    wrap.addEventListener('click', (ev) => {
      openSpotlight(i);
    });

    container.appendChild(wrap);
  }

  // Build and open spotlight modal with custom controls
  function openSpotlight(index) {
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-imgwrap">
        <div class="video-container">
          <div class="video-stage"></div>
          <div class="video-controls">
            <button class="playpause">Play</button>
            <div class="seek">
              <div class="seek-bar"><div class="seek-filled"></div></div>
            </div>
            <div class="time">0:00 / 0:00</div>
            <button class="mute">Mute</button>
            <button class="close">Close</button>
          </div>
        </div>
      </div>
    `;

    backdrop.appendChild(modal);

    const stage = modal.querySelector('.video-stage');
    const playBtn = modal.querySelector('.playpause');
    const closeBtn = modal.querySelector('.close');
    const muteBtn = modal.querySelector('.mute');
    const timeEl = modal.querySelector('.time');
    const seekBar = modal.querySelector('.seek-bar');
    const seekFilled = modal.querySelector('.seek-filled');

    // Create the video element on demand (no preload until opened)
    const video = document.createElement('video');
    video.controls = false; // we'll use custom controls
    video.preload = 'none';
    video.crossOrigin = 'anonymous';
    video.style.maxWidth = '100%';
    video.style.width = '100%';
    video.style.height = 'auto';

    // Resolve source and add cache-busting param so browser doesn't permanently cache
    const src = resolveVideoSrc(index) + (resolveVideoSrc(index).includes('?') ? '&' : '?') + 'cb=' + Date.now();
    video.src = src;

    stage.appendChild(video);

    // Buffering strategy: when user clicks play, attempt to load and set time
    let desiredStart = 0;
    function attemptPlay() {
      if (!video.src) return;
      video.preload = 'auto';
      // ensure metadata loaded before setting time
      if (video.readyState >= 1) {
        try { video.currentTime = Math.max(0, desiredStart - 10); } catch (e) {}
        const p = video.play();
        if (p && p.catch) p.catch(()=>{});
      } else {
        const onMeta = () => {
          video.removeEventListener('loadedmetadata', onMeta);
          try { video.currentTime = Math.max(0, desiredStart - 10); } catch (e) {}
          const p = video.play(); if (p && p.catch) p.catch(()=>{});
        };
        video.addEventListener('loadedmetadata', onMeta);
        video.load();
      }
    }

    playBtn.addEventListener('click', () => {
      if (video.paused) {
        attemptPlay();
        playBtn.textContent = 'Pause';
      } else {
        video.pause();
        playBtn.textContent = 'Play';
      }
    });

    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });

    function closeModal() {
      try { video.pause(); } catch(e){}
      if (backdrop && modal.parentNode === backdrop) backdrop.removeChild(modal);
      // clean up backdrop if empty
      if (backdrop && backdrop.childElementCount === 0) backdrop.parentNode.removeChild(backdrop);
    }

    // update time/progress
    function fmt(s){ const m = Math.floor(s/60); const sec = Math.floor(s%60).toString().padStart(2,'0'); return m+':'+sec; }
    video.addEventListener('timeupdate', () => {
      const cur = video.currentTime || 0; const dur = video.duration || 0;
      timeEl.textContent = fmt(cur) + ' / ' + (isFinite(dur) ? fmt(dur) : '0:00');
      if (dur) seekFilled.style.width = ((cur/dur)*100)+'%';
    });

    // seekbar interaction - user seeks to a position; we set desiredStart and jump
    seekBar.addEventListener('click', (ev) => {
      const rect = seekBar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const dur = video.duration || 0;
      const target = dur * pct;
      desiredStart = target;
      try { video.currentTime = Math.max(0, target - 10); } catch(e) {}
      // ensure playing after seek
      if (video.paused) {
        attemptPlay();
        playBtn.textContent = 'Pause';
      }
    });

    // Keyboard escape to close
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    modal.addEventListener('remove', () => document.removeEventListener('keydown', onKey));
  }

});
