// strokes.js
// Expose drawStrokeOnCanvas to global scope for Firebase listener to call
(function () {
  function ensureCanvasSize(canvas) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function drawStrokeOnCanvas(stroke) {
    const canvas = document.getElementById('drawingBoard');
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }
    ensureCanvasSize(canvas);
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = stroke.color || '#000';
    ctx.lineWidth = stroke.size || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points = stroke.points || [];
    if (points.length === 0) return;

    ctx.beginPath();

    // points may be normalized [0..1] or absolute pixels depending on how they were saved.
    // To support both, detect values in [0,1] and scale by canvas pixel size when needed.
    function getX(pt) {
      return (pt.x <= 1 ? Math.round(pt.x * canvas.width) : pt.x);
    }
    function getY(pt) {
      return (pt.y <= 1 ? Math.round(pt.y * canvas.height) : pt.y);
    }

    ctx.moveTo(getX(points[0]), getY(points[0]));
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      ctx.lineTo(getX(p), getY(p));
    }
    ctx.stroke();
  }

  // Expose as global
  window.drawStrokeOnCanvas = drawStrokeOnCanvas;
})();
