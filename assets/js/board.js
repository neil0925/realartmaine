// board.js - pointer-based drawing with high-DPI support

let isDrawing = false;
let currentPoints = [];

// Ensure the canvas and context exist (canvas is in the DOM above these scripts)
const canvas = document.getElementById('drawingBoard');
const ctx = canvas.getContext('2d');

// Defaults (can be overridden by the toolbar script in index.html)
window.CURRENT_COLOR = window.CURRENT_COLOR || '#000000';
window.CURRENT_SIZE = window.CURRENT_SIZE || 4;

// Resize canvas to match CSS size and device pixel ratio
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  // Scale drawing operations so we can draw using CSS pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redrawStrokes(ctx);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
// initial size
resizeCanvas();

function getCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  // return CSS-pixel coordinates (not device pixels)
  return { x: clientX - rect.left, y: clientY - rect.top };
}

// Prevent default touch gestures on the canvas; pointer events handle input
canvas.style.touchAction = canvas.style.touchAction || 'none';

// create brush cursor overlay if missing and expose update function
let brushCursor = document.getElementById('brushCursor');
if (!brushCursor) {
  brushCursor = document.createElement('div');
  brushCursor.id = 'brushCursor';
  document.body.appendChild(brushCursor);
}

window.updateBrushPreview = function(size, color) {
  window.CURRENT_SIZE = parseInt(size, 10) || window.CURRENT_SIZE || 4;
  window.CURRENT_COLOR = color || window.CURRENT_COLOR || '#000';
  const px = Math.max(2, window.CURRENT_SIZE);
  brushCursor.style.width = brushCursor.style.height = px + 'px';
  brushCursor.style.background = window.CURRENT_COLOR;
  brushCursor.style.opacity = 0.65;
  brushCursor.style.borderColor = 'rgba(0,0,0,0.18)';
};

// ensure initial look
window.updateBrushPreview(window.CURRENT_SIZE, window.CURRENT_COLOR);

canvas.addEventListener('pointerdown', (e) => {
  // only handle primary button
  if (e.button !== undefined && e.button !== 0) return;
  canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
  isDrawing = true;
  currentPoints = [getCanvasPoint(e.clientX, e.clientY)];
});

canvas.addEventListener('pointermove', (e) => {
  // update cursor overlay position
  if (brushCursor) {
    brushCursor.style.display = 'block';
    brushCursor.style.left = (e.clientX + window.scrollX) + 'px';
    brushCursor.style.top = (e.clientY + window.scrollY) + 'px';
  }

  if (!isDrawing) return;
  const point = getCanvasPoint(e.clientX, e.clientY);
  currentPoints.push(point);

  // draw incremental segment for responsive feedback
  const len = currentPoints.length;
  if (len > 1) {
    ctx.beginPath();
    ctx.strokeStyle = window.CURRENT_COLOR || '#000';
    ctx.lineWidth = window.CURRENT_SIZE || 4;
    ctx.lineCap = 'round';
    ctx.moveTo(currentPoints[len-2].x, currentPoints[len-2].y);
    ctx.lineTo(currentPoints[len-1].x, currentPoints[len-1].y);
    ctx.stroke();
  }
});

// show/hide cursor when entering/leaving canvas
canvas.addEventListener('pointerenter', (e) => { if (brushCursor) brushCursor.style.display = 'block'; });
canvas.addEventListener('pointerleave', (e) => { if (brushCursor) brushCursor.style.display = 'none'; });

function endDrawing(e) {
  if (!isDrawing) return;
  isDrawing = false;
  if (currentPoints.length > 0) {
    // store strokes in CSS pixel coordinates so redraw works with transform
    addStroke(currentPoints.slice(), window.CURRENT_COLOR, window.CURRENT_SIZE);
  }
  currentPoints = [];
  canvas.releasePointerCapture && canvas.releasePointerCapture(e && e.pointerId);
  redrawStrokes(ctx);
}

canvas.addEventListener('pointerup', endDrawing);
canvas.addEventListener('pointercancel', endDrawing);
canvas.addEventListener('pointerout', (e) => { if (isDrawing) endDrawing(e); });
canvas.addEventListener('pointerleave', (e) => { if (isDrawing) endDrawing(e); });

// ensure existing strokes are drawn on load
redrawStrokes(ctx);
