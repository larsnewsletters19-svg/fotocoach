import { useState } from 'react';
import type { LightroomAdjustments } from '../types/analysis';
import { downloadXmpFile } from '../services/xmpGenerator';

interface LightroomExportCardProps {
  adjustments: LightroomAdjustments;
}

type Row = { label: string; value: number; unit?: string; showSign?: boolean };

function ValueRow({ label, value, unit = '', showSign = true }: Row) {
  const sign = showSign && value > 0 ? '+' : '';
  const color = value > 0 ? 'var(--verdict-go)' : value < 0 ? 'var(--verdict-no)' : 'var(--text-tertiary)';
  return (
    <div className="lr-value-row">
      <span className="lr-value-label">{label}</span>
      <span className="lr-value-number" style={{ color }}>
        {sign}{value}{unit}
      </span>
    </div>
  );
}

export function LightroomExportCard({ adjustments }: LightroomExportCardProps) {
  const [downloaded, setDownloaded] = useState(false);

  function handleDownload() {
    downloadXmpFile(adjustments);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">🎛️</span>
        <span className="card-title">Efterbearbetning – Lightroom</span>
      </div>

      {/* White balance */}
      <div className="lr-section-label">Vitbalans</div>
      <div className="lr-value-row">
        <span className="lr-value-label">Temperatur</span>
        <span className="lr-value-number" style={{ color: 'var(--text-secondary)' }}>
          {adjustments.whiteBalanceTemp}K
        </span>
      </div>
      <ValueRow label="Tint" value={adjustments.whiteBalanceTint} />

      {/* Tone */}
      <div className="lr-section-label" style={{ marginTop: 12 }}>Ton</div>
      <ValueRow label="Exponering" value={adjustments.exposure} unit=" EV" />
      <ValueRow label="Kontrast" value={adjustments.contrast} />
      <ValueRow label="Highlights" value={adjustments.highlights} />
      <ValueRow label="Shadows" value={adjustments.shadows} />
      <ValueRow label="Whites" value={adjustments.whites} />
      <ValueRow label="Blacks" value={adjustments.blacks} />

      {/* Presence */}
      <div className="lr-section-label" style={{ marginTop: 12 }}>Presence</div>
      <ValueRow label="Clarity" value={adjustments.clarity} />
      <ValueRow label="Dehaze" value={adjustments.dehaze} />
      <ValueRow label="Vibrance" value={adjustments.vibrance} />
      <ValueRow label="Saturation" value={adjustments.saturation} />

      {/* Reasoning */}
      {adjustments.reasoning && (
        <div className="lr-reasoning">
          💡 {adjustments.reasoning}
        </div>
      )}

      {/* Download button */}
      <button
        className={`btn ${downloaded ? 'btn-secondary' : 'btn-primary'} lr-download-btn`}
        onClick={handleDownload}
      >
        {downloaded ? (
          <><span>✓</span><span>Nedladdad!</span></>
        ) : (
          <><span>⬇️</span><span>Ladda ner .xmp</span></>
        )}
      </button>

      <div className="lr-hint">
        Dubbelklicka filen i Lightroom, eller använd Foto → Importera inställningar från...
      </div>
    </div>
  );
}
