let isDrawing = false;
let currentPoints = [];
const canvas = document.getElementById("drawingBoard");
const ctx = canvas.getContext("2d");
window.CURRENT_COLOR = window.CURRENT_COLOR || "#000000";
window.CURRENT_SIZE = window.CURRENT_SIZE || 4;
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redrawStrokes(ctx);
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
resizeCanvas();
function getCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}
canvas.style.touchAction = canvas.style.touchAction || "none";
let brushCursor = document.getElementById("brushCursor");
if (!brushCursor) {
  brushCursor = document.createElement("div");
  brushCursor.id = "brushCursor";
  brushCursor.style.position = "fixed";
  brushCursor.style.pointerEvents = "none";
  brushCursor.style.transform = "translate(-50%, -50%)";
  document.body.appendChild(brushCursor);
}
window.updateBrushPreview = function (size, color) {
  window.CURRENT_SIZE = parseInt(size, 10) || window.CURRENT_SIZE || 4;
  window.CURRENT_COLOR = color || window.CURRENT_COLOR || "#000";
  const px = Math.max(2, window.CURRENT_SIZE);
  brushCursor.style.width = brushCursor.style.height = px + "px";
  brushCursor.style.background = window.CURRENT_COLOR;
  brushCursor.style.opacity = 0.65;
  brushCursor.style.borderColor = "rgba(0,0,0,0.18)";
};
window.updateBrushPreview(window.CURRENT_SIZE, window.CURRENT_COLOR);
canvas.addEventListener("pointerdown", (e) => {
  if (e.button !== undefined && e.button !== 0) return;
  canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
  isDrawing = true;
  currentPoints = [getCanvasPoint(e.clientX, e.clientY)];
});
canvas.addEventListener("pointermove", (e) => {
  if (brushCursor) {
    brushCursor.style.display = "block";
    brushCursor.style.left = e.clientX + "px";
    brushCursor.style.top = e.clientY + "px";
  }
  if (!isDrawing) return;
  const point = getCanvasPoint(e.clientX, e.clientY);
  currentPoints.push(point);
  const len = currentPoints.length;
  if (len > 1) {
    ctx.beginPath();
    ctx.strokeStyle = window.CURRENT_COLOR || "#000";
    ctx.lineWidth = window.CURRENT_SIZE || 4;
    ctx.lineCap = "round";
    ctx.moveTo(currentPoints[len - 2].x, currentPoints[len - 2].y);
    ctx.lineTo(currentPoints[len - 1].x, currentPoints[len - 1].y);
    ctx.stroke();
  }
});
canvas.addEventListener("pointerenter", (e) => {
  if (brushCursor) brushCursor.style.display = "block";
});
canvas.addEventListener("pointerleave", (e) => {
  if (brushCursor) brushCursor.style.display = "none";
});
function endDrawing(e) {
  if (!isDrawing) return;
  isDrawing = false;
  if (currentPoints.length > 0) {
    addStroke(currentPoints.slice(), window.CURRENT_COLOR, window.CURRENT_SIZE);
  }
  currentPoints = [];
  canvas.releasePointerCapture &&
    canvas.releasePointerCapture(e && e.pointerId);
  redrawStrokes(ctx);
}
canvas.addEventListener("pointerup", endDrawing);
canvas.addEventListener("pointercancel", endDrawing);
canvas.addEventListener("pointerout", (e) => {
  if (isDrawing) endDrawing(e);
});
canvas.addEventListener("pointerleave", (e) => {
  if (isDrawing) endDrawing(e);
});
redrawStrokes(ctx);
