// board.js - handles canvas drawing input
import { addStroke, redrawStrokes } from './strokes.js';

const canvas = document.getElementById("drawingBoard");
const ctx = canvas.getContext("2d");

// Resize canvas to fill parent
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  redrawStrokes(ctx);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Track drawing state
let isDrawing = false;
let currentPoints = [];

// Mouse events
canvas.addEventListener("mousedown", e => {
  isDrawing = true;
  currentPoints = [{ x: e.offsetX, y: e.offsetY }];
});

canvas.addEventListener("mousemove", e => {
  if (!isDrawing) return;
  const point = { x: e.offsetX, y: e.offsetY };
  currentPoints.push(point);
  redrawStrokes(ctx); // redraw all strokes
  // draw current line segment
  ctx.beginPath();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  const len = currentPoints.length;
  if (len > 1) {
    ctx.moveTo(currentPoints[len-2].x, currentPoints[len-2].y);
    ctx.lineTo(currentPoints[len-1].x, currentPoints[len-1].y);
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", e => {
  if (!isDrawing) return;
  isDrawing = false;
  addStroke(currentPoints);
  currentPoints = [];
});

canvas.addEventListener("mouseleave", e => {
  if (isDrawing) {
    isDrawing = false;
    addStroke(currentPoints);
    currentPoints = [];
  }
});
