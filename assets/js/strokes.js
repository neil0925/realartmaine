function getLocalUID() {
  try {
    if (typeof window.getUID === "function") {
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
let strokes = [];
function addStroke(points, color = "#000", size = 4) {
  const stroke = {
    strokeId: crypto.randomUUID(),
    clientId: null,
    userId: USER_ID,
    points: points,
    color,
    size,
    timestamp: Date.now(),
  };
  stroke.clientId = stroke.strokeId;
  strokes.push(stroke);
  if (typeof window._markLocalStroke === "function") {
    try {
      window._markLocalStroke(stroke.clientId);
    } catch (e) {}
  }
  if (typeof window.saveStroke === "function") {
    try {
      window.saveStroke(Object.assign({}, stroke)).catch((err) => {
        console.warn(
          "[Firebase] saveStroke failed for clientId",
          stroke.clientId,
          err,
        );
      });
    } catch (e) {
      console.warn("[strokes] saveStroke invocation failed", e);
    }
  }
  return stroke;
}
function clearStrokes() {
  strokes = [];
}
function redrawStrokes(ctx) {
  const rect = ctx.canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  strokes.forEach((stroke) => {
    if (stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth =
      typeof stroke.size === "number"
        ? stroke.size
        : typeof stroke.width === "number"
          ? stroke.width
          : 4;
    ctx.lineCap = "round";
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  });
}
