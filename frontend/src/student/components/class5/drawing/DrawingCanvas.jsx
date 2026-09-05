import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

const DrawingCanvas = forwardRef(function DrawingCanvas({ color = '#4f46e5', lineWidth = 6, onChange }, ref) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef(null);
  const drawingRef = useRef(false);
  const colorRef = useRef(color);
  const widthRef = useRef(lineWidth);

  useEffect(() => {
    colorRef.current = color;
    widthRef.current = lineWidth;
  }, [color, lineWidth]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = Math.max(200, rect.width);
    const height = Math.max(250, Math.min(480, Math.round(width * 0.7)));

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    redraw();
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });
  };

  const drawStroke = (ctx, stroke) => {
    if (stroke.length < 2) {
      ctx.beginPath();
      ctx.arc(stroke[0].x, stroke[0].y, widthRef.current / 2, 0, Math.PI * 2);
      ctx.fillStyle = stroke.color;
      ctx.fill();
      return;
    }
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x, stroke[i].y);
    }
    ctx.stroke();
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top),
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pos = getPos(e);
    currentStrokeRef.current = { color: colorRef.current, lineWidth: widthRef.current, points: [pos] };
  };

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    currentStrokeRef.current.points.push(pos);
    const ctx = canvasRef.current.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = currentStrokeRef.current.color;
    ctx.lineWidth = currentStrokeRef.current.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pts = currentStrokeRef.current.points;
    if (pts.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    strokesRef.current.push(currentStrokeRef.current);
    currentStrokeRef.current = null;
    if (onChange) onChange(strokesRef.current.length > 0);
  };

  useEffect(() => {
    setupCanvas();
    const onResize = () => setupCanvas();
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(onResize);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    clear() {
      strokesRef.current = [];
      currentStrokeRef.current = null;
      redraw();
      if (onChange) onChange(false);
    },
    undo() {
      strokesRef.current.pop();
      currentStrokeRef.current = null;
      redraw();
      if (onChange) onChange(strokesRef.current.length > 0);
    },
    isEmpty() {
      return strokesRef.current.length === 0;
    },
    hasContent() {
      return strokesRef.current.length > 0;
    },
  }));

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        background: '#fff',
        borderRadius: 20,
        border: '2px dashed #c7d2fe',
        touchAction: 'none',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'crosshair',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ display: 'block', touchAction: 'none' }}
      />
    </div>
  );
});

export default DrawingCanvas;
