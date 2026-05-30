import type { AnalysisResult } from '../types/analysis';

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  const level = score < 5 ? 'low' : score < 7 ? 'medium' : 'high';
  return (
    <div className="score-row">
      <div className="score-track">
        <div className="score-fill" style={{ width: `${pct}%` }} data-level={level} />
      </div>
      <div className="score-value">{score}/10</div>
    </div>
  );
}

interface CompositionCardProps {
  composition: AnalysisResult['composition'];
}

export function CompositionCard({ composition }: CompositionCardProps) {
  const rows: { label: string; value: string }[] = [
    { label: 'Tredjedelsregeln', value: composition.ruleOfThirds },
    { label: 'Ledande linjer', value: composition.leadingLines },
    { label: 'Förgrund/mitten/bakgrund', value: composition.foregroundMiddleBackground },
    { label: 'Bakgrundsrenhet', value: composition.backgroundCleanliness },
    { label: 'Negativt utrymme', value: composition.negativeSpace },
    { label: 'Kanter och störningar', value: composition.edgesAndDistractions },
    { label: 'Beskärningsförslag', value: composition.cropSuggestion },
  ].filter(r => r.value && r.value.trim() !== '');

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">📐</span>
        <span className="card-title">Komposition</span>
      </div>
      <ScoreBar score={composition.overallScore} />
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
