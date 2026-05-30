import type { CameraAdvice } from '../types/analysis';

interface CameraAdviceCardProps {
  advice: CameraAdvice;
}

type Row = { label: string; value: string; highlight?: boolean };

export function CameraAdviceCard({ advice }: CameraAdviceCardProps) {
  const settingsRows: Row[] = [
    { label: 'Objektiv', value: advice.recommendedLens, highlight: true },
    { label: 'Brännvidd', value: advice.focalLengthReason },
    { label: 'Bländare', value: `${advice.aperture} — ${advice.apertureReason}` },
    { label: 'Slutartid', value: `${advice.shutterSpeed} — ${advice.shutterReason}` },
    { label: 'ISO', value: `${advice.iso} — ${advice.isoReason}` },
  ].filter(r => r.value?.trim());

  const focusRows: Row[] = [
    { label: 'Fokusläge', value: advice.focusMode },
    { label: 'Fokusområde', value: advice.focusArea },
    { label: 'Anledning', value: advice.focusModeReason },
  ].filter(r => r.value?.trim());

  const extraRows: Row[] = [
    { label: 'Drivläge', value: advice.driveMode },
    { label: 'Vitbalans', value: advice.whiteBalance },
    { label: 'Filformat', value: advice.fileFormat },
  ].filter(r => r.value?.trim());

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <span className="card-icon">📷</span>
        <span className="card-title">Sony a6700 — inställningar</span>
      </div>

      {/* Quick settings strip */}
      <div className="camera-quick-strip">
        {advice.aperture && (
          <div className="camera-quick-item">
            <div className="camera-quick-value">{advice.aperture}</div>
            <div className="camera-quick-label">Bländare</div>
          </div>
        )}
        {advice.shutterSpeed && (
          <div className="camera-quick-item">
            <div className="camera-quick-value">{advice.shutterSpeed}</div>
            <div className="camera-quick-label">Slutartid</div>
          </div>
        )}
        {advice.iso && (
          <div className="camera-quick-item">
            <div className="camera-quick-value">{advice.iso.replace('ISO ', '')}</div>
            <div className="camera-quick-label">ISO</div>
          </div>
        )}
        {advice.fileFormat && (
          <div className="camera-quick-item">
            <div className="camera-quick-value">{advice.fileFormat}</div>
            <div className="camera-quick-label">Format</div>
          </div>
        )}
      </div>

      {/* Lens */}
      <div className="camera-section-label">Objektiv</div>
      {settingsRows.filter(r => ['Objektiv', 'Brännvidd'].includes(r.label)).map((row, i) => (
        <div key={i} className="info-row">
          <div className="info-label">{row.label}</div>
          <div className={`info-value ${row.highlight ? 'camera-highlight' : ''}`}>{row.value}</div>
        </div>
      ))}

      {/* Exposure details */}
      <div className="camera-section-label" style={{ marginTop: 14 }}>Exponering</div>
      {settingsRows.filter(r => ['Bländare', 'Slutartid', 'ISO'].includes(r.label)).map((row, i) => (
        <div key={i} className="info-row">
          <div className="info-label">{row.label}</div>
          <div className="info-value">{row.value}</div>
        </div>
      ))}

      {/* Focus */}
      {focusRows.length > 0 && (
        <>
          <div className="camera-section-label" style={{ marginTop: 14 }}>Autofokus</div>
          {focusRows.map((row, i) => (
            <div key={i} className="info-row">
              <div className="info-label">{row.label}</div>
              <div className="info-value">{row.value}</div>
            </div>
          ))}
        </>
      )}

      {/* Extra settings */}
      {extraRows.length > 0 && (
        <>
          <div className="camera-section-label" style={{ marginTop: 14 }}>Övriga inställningar</div>
          {extraRows.map((row, i) => (
            <div key={i} className="info-row">
              <div className="info-label">{row.label}</div>
              <div className="info-value">{row.value}</div>
            </div>
          ))}
        </>
      )}

      {/* Extra tip */}
      {advice.extraTip && (
        <div className="camera-extra-tip">
          <span style={{ flexShrink: 0 }}>💡</span>
          <span>{advice.extraTip}</span>
        </div>
      )}
    </div>
  );
}
