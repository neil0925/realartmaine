// strokes.js - manages strokes and user identity

// Assign a persistent user ID
if (!localStorage.userId) {
  localStorage.userId = crypto.randomUUID();
}
const USER_ID = localStorage.userId;

// Array to hold strokes
let strokes = [];

// Function to add a new stroke
function addStroke(points, color = "#000", width = 4) {
  const stroke = {
    strokeId: crypto.randomUUID(),
    userId: USER_ID,
    points: points, // array of {x,y}
    color,
    width,
    timestamp: Date.now()
  };
  strokes.push(stroke);
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
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  });
}
