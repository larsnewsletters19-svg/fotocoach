import type { Verdict, AnalysisResult } from '../types/analysis';

const VERDICT_CONFIG: Record<Verdict, {
  label: string;
  emoji: string;
  sublabel: string;
}> = {
  TA_INTE: {
    label: 'TA INTE',
    emoji: '🛑',
    sublabel: 'Vänta eller hitta en annan scen',
  },
  JUSTERA_FORST: {
    label: 'JUSTERA FÖRST',
    emoji: '🔧',
    sublabel: 'Potential finns — följ råden nedan',
  },
  TA_NU: {
    label: 'TA NU',
    emoji: '✅',
    sublabel: 'Scenen är stark — ta bilden direkt',
  },
};

function confidenceLabel(c: number): string {
  if (c >= 0.85) return 'hög säkerhet';
  if (c >= 0.65) return 'god säkerhet';
  return 'viss osäkerhet';
}

interface VerdictCardProps {
  result: AnalysisResult;
}

export function VerdictCard({ result }: VerdictCardProps) {
  const config = VERDICT_CONFIG[result.verdict];

  return (
    <div className={`verdict-card ${result.verdict} animate-in`}>
      <div className="verdict-emoji">{config.emoji}</div>
      <div className={`verdict-label ${result.verdict}`}>{config.label}</div>
      <div className="verdict-reason">{result.oneSentenceReason}</div>
      <div className="verdict-meta">
        <span className="verdict-tag">{result.sceneType}</span>
        <span className="verdict-tag">{result.mainSubject}</span>
        <span className="verdict-tag">{confidenceLabel(result.confidence)}</span>
      </div>
      <div className="verdict-confidence">
        {config.sublabel}
      </div>
    </div>
  );
}
