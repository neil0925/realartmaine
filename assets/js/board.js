let isDrawing = false;
let currentPoints = [];

canvas.addEventListener("mousedown", e => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  currentPoints = [{ x: e.clientX - rect.left, y: e.clientY - rect.top }];
});

canvas.addEventListener("mousemove", e => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  currentPoints.push(point);

  redrawStrokes(ctx);

  const len = currentPoints.length;
  if (len > 1) {
    ctx.beginPath();
    ctx.strokeStyle = window.CURRENT_COLOR || "#000";
    ctx.lineWidth = window.CURRENT_SIZE || 4;
    ctx.lineCap = "round";
    ctx.moveTo(currentPoints[len-2].x, currentPoints[len-2].y);
    ctx.lineTo(currentPoints[len-1].x, currentPoints[len-1].y);
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", e => {
  if (!isDrawing) return;
  isDrawing = false;
  addStroke(currentPoints, window.CURRENT_COLOR, window.CURRENT_SIZE);
  currentPoints = [];
});

canvas.addEventListener("mouseleave", e => {
  if (isDrawing) {
    isDrawing = false;
    addStroke(currentPoints, window.CURRENT_COLOR, window.CURRENT_SIZE);
    currentPoints = [];
  }
});
