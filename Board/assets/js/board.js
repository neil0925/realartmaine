// board.js
// Handles pointer events, local drawing and saving strokes to Firebase
(function () {
  const canvas = document.getElementById('drawingBoard');
  if (!canvas) {
    console.warn('board.js: canvas not found on load');
    return;
  }

  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let currentStrokePoints = [];

  function ensureCanvasSize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      // preserve drawn content? For now we resize and leave it blank on resizes.
      canvas.width = w;
      canvas.height = h;
    }
  }

  function toNormalizedPoint(evt) {
    const rect = canvas.getBoundingClientRect();
    const x = (evt.clientX - rect.left) / canvas.clientWidth;
    const y = (evt.clientY - rect.top) / canvas.clientHeight;
    return { x, y };
  }

  function drawPointOnCanvas(pt) {
    const px = Math.round((pt.x <= 1 ? pt.x * canvas.clientWidth : pt.x));
    const py = Math.round((pt.y <= 1 ? pt.y * canvas.clientHeight : pt.y));
    ctx.lineTo(px, py);
    ctx.stroke();
  }

  function handlePointerDown(e) {
    if (typeof window.isDrawingAllowed !== 'undefined' && !window.isDrawingAllowed) return;
    ensureCanvasSize();
    isDrawing = true;
    ctx.beginPath();
    ctx.strokeStyle = window.CURRENT_COLOR || '#000';
    ctx.lineWidth = window.CURRENT_SIZE || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const p = toNormalizedPoint(e);
    currentStrokePoints = [p];
    ctx.moveTo(Math.round(p.x * canvas.clientWidth), Math.round(p.y * canvas.clientHeight));
  }

  function handlePointerMove(e) {
    if (!isDrawing) return;
    const p = toNormalizedPoint(e);
    currentStrokePoints.push(p);
    drawPointOnCanvas(p);
  }

  async function handlePointerUp(e) {
    if (!isDrawing) return;
    isDrawing = false;

    const clientId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'cid-' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    const stroke = {
      clientId,
      userId: (typeof window.getUID === 'function') ? window.getUID() : null,
      color: window.CURRENT_COLOR || '#000',
      size: window.CURRENT_SIZE || 4,
      points: currentStrokePoints,
      timestamp: Date.now()
    };

    try {
      if (typeof window.saveStroke === 'function') {
        await window.saveStroke(stroke);
        // Mark this client-side id so realtime listener doesn't duplicate it
        if (typeof window._markLocalStroke === 'function') window._markLocalStroke(clientId);
        console.log('[board] stroke saved');
      } else {
        console.warn('[board] saveStroke not available; stroke not saved to DB');
      }
    } catch (err) {
      console.error('[board] failed to save stroke:', err);
    }

    currentStrokePoints = [];
  }

  // Attach listeners
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);
  canvas.addEventListener('pointerleave', handlePointerUp);

  // When page loads, ensure the realtime listener is set up when ready
  document.addEventListener('DOMContentLoaded', () => {
    // If drawStrokeOnCanvas exists and save/listen functions exist, set up listener
    if (typeof window.setupRealtimeStrokeListener === 'function' && typeof window.drawStrokeOnCanvas === 'function') {
      try {
        window.setupRealtimeStrokeListener(window.drawStrokeOnCanvas);
        console.log('[board] Realtime stroke listener set up');
      } catch (err) {
        console.warn('[board] failed to setup realtime listener:', err);
      }
    } else {
      // Try later in case Firebase script/module hasn't executed yet
      setTimeout(() => {
        if (typeof window.setupRealtimeStrokeListener === 'function' && typeof window.drawStrokeOnCanvas === 'function') {
          window.setupRealtimeStrokeListener(window.drawStrokeOnCanvas);
          console.log('[board] Realtime stroke listener set up (deferred)');
        }
      }, 1000);
    }
  });
})();
