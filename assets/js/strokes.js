// strokes.js - manages strokes and user identity

// Assign a persistent user ID (prefer Firebase-backed UID when available)
function getLocalUID() {
  try {
    if (typeof window.getUID === 'function') {
      const uid = window.getUID();
      if (uid) return uid;
    }
    if (localStorage.userId) return localStorage.userId;
    const newId = crypto.randomUUID();
    localStorage.userId = newId;
    return newId;
  } catch (e) {
    return crypto.randomUUID();
  }
}
const USER_ID = getLocalUID();

// Array to hold strokes
let strokes = [];

// Function to add a new stroke
function addStroke(points, color = "#000", size = 4) {
  const stroke = {
    strokeId: crypto.randomUUID(),
    clientId: null, // will set below (clientId used for local dedup)
    userId: USER_ID,
    points: points, // array of {x,y}
    color,
    size,
    timestamp: Date.now()
  };

  // Use strokeId as clientId for deduplication when saved to remote DB
  stroke.clientId = stroke.strokeId;

  // Store locally first for immediate redraw
  strokes.push(stroke);

  // Mark this as a locally-originating stroke so realtime listener can ignore it
  if (typeof window._markLocalStroke === 'function') {
    try { window._markLocalStroke(stroke.clientId); } catch (e) { /* ignore */ }
  }

  // Save remotely if API is available (fire-and-forget)
  if (typeof window.saveStroke === 'function') {
    try {
      // Do not await to avoid blocking UI; handle failure silently
      window.saveStroke(Object.assign({}, stroke)).catch(err => {
        console.warn('[Firebase] saveStroke failed for clientId', stroke.clientId, err);
      });
    } catch (e) {
      console.warn('[strokes] saveStroke invocation failed', e);
    }
  }

  return stroke;
}

// Function to clear strokes (optional)
function clearStrokes() {
  strokes = [];
}

// Function to redraw strokes on a canvas context
function redrawStrokes(ctx) {
  // clear using CSS pixel dimensions because ctx may be scaled for high-DPI
  const rect = ctx.canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  strokes.forEach(stroke => {
    if (stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    // Support legacy strokes that used `width` while new strokes use `size`
    ctx.lineWidth = (typeof stroke.size === 'number') ? stroke.size : (typeof stroke.width === 'number' ? stroke.width : 4);
    ctx.lineCap = "round";
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  });
}
