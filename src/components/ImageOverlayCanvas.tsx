import { useEffect, useRef, useState, useCallback } from 'react';
import type { ImageOverlays, Verdict } from '../types/analysis';

type OverlayMode = 'none' | 'grid' | 'subject' | 'crop' | 'distractions';

interface OverlayToggle {
  id: OverlayMode;
  label: string;
  emoji: string;
  available: boolean;
}

interface ImageOverlayCanvasProps {
  imageDataUrl: string;
  overlays?: ImageOverlays;
  verdict: Verdict;
}

const VERDICT_COLOR: Record<Verdict, string> = {
  TA_INTE: '#e84040',
  JUSTERA_FORST: '#e88c33',
  TA_NU: '#3dc46e',
};

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  // Thirds lines
  for (let i = 1; i <= 2; i++) {
    // vertical
    ctx.beginPath();
    ctx.moveTo((w / 3) * i, 0);
    ctx.lineTo((w / 3) * i, h);
    ctx.stroke();
    // horizontal
    ctx.beginPath();
    ctx.moveTo(0, (h / 3) * i);
    ctx.lineTo(w, (h / 3) * i);
    ctx.stroke();
  }

  // Power points
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let xi = 1; xi <= 2; xi++) {
    for (let yi = 1; yi <= 2; yi++) {
      const px = (w / 3) * xi;
      const py = (h / 3) * yi;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawHorizon(ctx: CanvasRenderingContext2D, w: number, h: number, horizonY: number) {
  const y = horizonY * h;
  ctx.save();
  ctx.strokeStyle = 'rgba(99,180,255,0.75)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.stroke();

  // Label
  ctx.fillStyle = 'rgba(99,180,255,0.9)';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('HORISONT', 8, y - 4);
  ctx.restore();
}

function drawSubjectBox(ctx: CanvasRenderingContext2D, w: number, h: number, box: ImageOverlays['subjectBox'], color: string) {
  if (!box) return;
  const x = box.x * w;
  const y = box.y * h;
  const bw = box.w * w;
  const bh = box.h * h;

  ctx.save();

  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([]);
  ctx.strokeRect(x, y, bw, bh);
  ctx.shadowBlur = 0;

  // Corner brackets
  const cs = Math.min(bw, bh) * 0.2; // corner size
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';

  // TL
  ctx.beginPath(); ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y); ctx.stroke();
  // TR
  ctx.beginPath(); ctx.moveTo(x + bw - cs, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw, y + cs); ctx.stroke();
  // BL
  ctx.beginPath(); ctx.moveTo(x, y + bh - cs); ctx.lineTo(x, y + bh); ctx.lineTo(x + cs, y + bh); ctx.stroke();
  // BR
  ctx.beginPath(); ctx.moveTo(x + bw - cs, y + bh); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw, y + bh - cs); ctx.stroke();

  // Label
  ctx.fillStyle = color;
  ctx.font = 'bold 10px monospace';
  const label = 'MOTIV';
  const lw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(x, y - 18, lw + 10, 16);
  ctx.fillStyle = color;
  ctx.fillText(label, x + 5, y - 6);

  ctx.restore();
}

function drawDistractions(ctx: CanvasRenderingContext2D, w: number, h: number, points: ImageOverlays['distractionPoints']) {
  if (!points || points.length === 0) return;
  ctx.save();
  for (const pt of points) {
    const px = pt.x * w;
    const py = pt.y * h;

    // Circle
    ctx.strokeStyle = '#e84040';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.shadowColor = '#e84040';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // X mark
    ctx.strokeStyle = '#e84040';
    ctx.lineWidth = 2;
    const s = 7;
    ctx.beginPath();
    ctx.moveTo(px - s, py - s); ctx.lineTo(px + s, py + s);
    ctx.moveTo(px + s, py - s); ctx.lineTo(px - s, py + s);
    ctx.stroke();

    // Label
    if (pt.label) {
      ctx.font = 'bold 10px monospace';
      const lw = ctx.measureText(pt.label).width;
      const lx = Math.min(px + 22, w - lw - 10);
      const ly = py + 4;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(lx - 4, ly - 12, lw + 8, 16);
      ctx.fillStyle = '#e84040';
      ctx.fillText(pt.label, lx, ly);
    }
  }
  ctx.restore();
}

function drawCropBox(ctx: CanvasRenderingContext2D, w: number, h: number, box: ImageOverlays['cropBox']) {
  if (!box) return;
  const x = box.x * w;
  const y = box.y * h;
  const bw = box.w * w;
  const bh = box.h * h;

  ctx.save();

  // Darken outside crop
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, w, y);                          // top
  ctx.fillRect(0, y + bh, w, h - y - bh);            // bottom
  ctx.fillRect(0, y, x, bh);                         // left
  ctx.fillRect(x + bw, y, w - x - bw, bh);           // right

  // Crop border
  ctx.strokeStyle = '#e8a833';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.shadowColor = '#e8a833';
  ctx.shadowBlur = 8;
  ctx.strokeRect(x, y, bw, bh);
  ctx.shadowBlur = 0;

  // Label
  ctx.font = 'bold 10px monospace';
  const label = 'BESKÄRNING';
  const lw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(x, y + bh + 2, lw + 10, 16);
  ctx.fillStyle = '#e8a833';
  ctx.fillText(label, x + 5, y + bh + 14);

  ctx.restore();
}

export function ImageOverlayCanvas({ imageDataUrl, overlays, verdict }: ImageOverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeOverlay, setActiveOverlay] = useState<OverlayMode>('none');
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const color = VERDICT_COLOR[verdict];

  // Build toggle list
  const toggles: OverlayToggle[] = [
    { id: 'none', label: 'Av', emoji: '✕', available: true },
    { id: 'grid', label: 'Grid', emoji: '⊞', available: true },
    { id: 'subject', label: 'Motiv', emoji: '🎯', available: !!overlays?.subjectBox },
    { id: 'crop', label: 'Crop', emoji: '✂️', available: !!overlays?.cropBox },
    { id: 'distractions', label: 'Störn.', emoji: '⚠️', available: !!(overlays?.distractionPoints?.length) },
  ];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgSize) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imgSize.w;
    canvas.height = imgSize.h;

    ctx.drawImage(img, 0, 0, imgSize.w, imgSize.h);

    if (activeOverlay === 'grid') {
      drawGrid(ctx, imgSize.w, imgSize.h);
      if (overlays?.horizonY !== undefined) {
        drawHorizon(ctx, imgSize.w, imgSize.h, overlays.horizonY);
      }
    }
    if (activeOverlay === 'subject') {
      drawSubjectBox(ctx, imgSize.w, imgSize.h, overlays?.subjectBox, color);
    }
    if (activeOverlay === 'crop') {
      drawCropBox(ctx, imgSize.w, imgSize.h, overlays?.cropBox);
    }
    if (activeOverlay === 'distractions') {
      drawDistractions(ctx, imgSize.w, imgSize.h, overlays?.distractionPoints);
    }
  }, [activeOverlay, overlays, imgSize, color]);

  // Load image once
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Scale to max 800px wide for canvas performance
      const maxW = 800;
      const scale = Math.min(1, maxW / img.naturalWidth);
      setImgSize({ w: Math.round(img.naturalWidth * scale), h: Math.round(img.naturalHeight * scale) });
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  useEffect(() => {
    draw();
  }, [draw]);

  const hasAnyOverlay = overlays && (overlays.subjectBox || overlays.cropBox || (overlays.distractionPoints?.length ?? 0) > 0);

  return (
    <div className="overlay-wrapper">
      {/* Canvas */}
      <div className="overlay-canvas-container">
        <canvas
          ref={canvasRef}
          className="overlay-canvas"
          style={{ display: imgSize ? 'block' : 'none' }}
        />
        {!imgSize && (
          <img src={imageDataUrl} alt="Analyserad bild" className="overlay-canvas" />
        )}
      </div>

      {/* Toggle buttons */}
      {(hasAnyOverlay || true) && (
        <div className="overlay-toggles">
          {toggles.map((t) => (
            <button
              key={t.id}
              className={`overlay-toggle-btn ${activeOverlay === t.id ? 'overlay-toggle-btn--active' : ''} ${!t.available ? 'overlay-toggle-btn--disabled' : ''}`}
              onClick={() => t.available && setActiveOverlay(t.id)}
              title={!t.available ? 'Ej tillgänglig för denna bild' : t.label}
            >
              <span className="overlay-toggle-emoji">{t.emoji}</span>
              <span className="overlay-toggle-label">{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {activeOverlay !== 'none' && (
        <div className="overlay-hint">
          {activeOverlay === 'grid' && 'Tredjedelsgrid · vita punkter = kraftpunkter' + (overlays?.horizonY !== undefined ? ' · blå linje = horisont' : '')}
          {activeOverlay === 'subject' && 'Markerat huvudmotiv enligt AI-analys'}
          {activeOverlay === 'crop' && 'Föreslagen beskärning · mörkare = beskärs bort'}
          {activeOverlay === 'distractions' && 'Störande element identifierade av AI'}
        </div>
      )}
    </div>
  );
}
