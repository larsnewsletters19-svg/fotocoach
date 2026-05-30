import type { AnalysisResult } from '../types/analysis';

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  return (
    <div className="score-row">
      <div className="score-track">
        <div
          className={`score-fill ${score < 5 ? 'low' : score < 7 ? 'medium' : 'high'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="score-value">{score}/10</div>
    </div>
  );
}

interface LightCardProps {
  light: AnalysisResult['light'];
}

export function LightCard({ light }: LightCardProps) {
  const rows: { label: string; value: string }[] = [
    { label: 'Riktning', value: light.direction },
    { label: 'Kvalitet', value: light.quality },
    { label: 'Kontrast', value: light.contrast },
    { label: 'Exponeringsrisk', value: light.exposureRisk },
    { label: 'Vitbalans', value: light.whiteBalance },
    { label: 'Bästa ljusåtgärd', value: light.bestLightAction },
  ].filter(r => r.value && r.value.trim() !== '');

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">☀️</span>
        <span className="card-title">Ljus</span>
      </div>
      <ScoreBar score={light.overallScore} />
      <div style={{ marginTop: 14 }}>
        {rows.map((row, i) => (
          <div key={i} className="info-row">
            <div className="info-label">{row.label}</div>
            <div className="info-value">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
