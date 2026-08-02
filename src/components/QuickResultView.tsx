import type { QuickAnalysis, Verdict } from '../types/analysis';
import { VerdictCard } from './VerdictCard';

const VERDICT_CONFIG: Record<Verdict, { color: string; bg: string; border: string }> = {
  TA_INTE: { color: 'var(--verdict-no)', bg: 'var(--verdict-no-bg)', border: 'var(--verdict-no-border)' },
  JUSTERA_FORST: { color: 'var(--verdict-adjust)', bg: 'var(--verdict-adjust-bg)', border: 'var(--verdict-adjust-border)' },
  TA_NU: { color: 'var(--verdict-go)', bg: 'var(--verdict-go-bg)', border: 'var(--verdict-go-border)' },
};

interface QuickResultViewProps {
  imageDataUrl: string;
  quick: QuickAnalysis;
  isLoadingFull: boolean;
  onFullAnalysis: () => void;
  onRetake: () => void;
  onNewPhoto: () => void;
  onBack: () => void;
}

export function QuickResultView({
  imageDataUrl,
  quick,
  isLoadingFull,
  onFullAnalysis,
  onRetake,
  onNewPhoto,
  onBack,
}: QuickResultViewProps) {
  const cfg = VERDICT_CONFIG[quick.verdict];

  // Bygg ett minimalt AnalysisResult-kompatibelt objekt för VerdictCard
  const fakeResult = {
    verdict: quick.verdict,
    confidence: quick.confidence,
    oneSentenceReason: quick.oneSentenceReason,
    sceneType: quick.sceneType,
    mainSubject: '',
    priorityActions: quick.priorityActions,
    composition: { overallScore: 0, ruleOfThirds: '', leadingLines: '', foregroundMiddleBackground: '', backgroundCleanliness: '', negativeSpace: '', edgesAndDistractions: '', cropSuggestion: '' },
    light: { overallScore: 0, direction: '', quality: '', contrast: '', exposureRisk: '', whiteBalance: '', bestLightAction: '' },
    backgroundAndDistractions: '',
    whatAlreadyWorks: [],
    learningPoint: '',
    nextShotChecklist: [],
  };

  return (
    <div className="stagger">
      <button className="back-btn" onClick={onBack}>← Tillbaka</button>

      {/* Bild */}
      <div style={{ marginBottom: 16 }}>
        <img
          src={imageDataUrl}
          alt="Scoutingbild"
          style={{ width: '100%', borderRadius: 'var(--radius-lg)', objectFit: 'cover', maxHeight: 260, display: 'block' }}
        />
      </div>

      {/* Verdict */}
      <VerdictCard result={fakeResult} />

      {/* Snabba åtgärder */}
      {quick.priorityActions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">⚡</span>
            <span className="card-title">Åtgärder på plats</span>
          </div>
          <div className="priority-actions-list">
            {quick.priorityActions.map((action, i) => (
              <div key={i} className="priority-action-item">
                <div className="priority-action-rank">{action.rank ?? i + 1}</div>
                <div className="priority-action-content">
                  <div className="priority-action-text">{action.action}</div>
                  <div className="priority-action-why">{action.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="quick-divider">
        <span>Vill du ha mer detaljer?</span>
      </div>

      {/* Fullständig analys */}
      <button
        className="btn btn-secondary"
        style={{ width: '100%', gap: 10 }}
        onClick={onFullAnalysis}
        disabled={isLoadingFull}
      >
        {isLoadingFull ? (
          <><span className="spinner spinner-amber" />Laddar fullständig analys...</>
        ) : (
          <>🔬 Visa fullständig analys</>
        )}
      </button>

      {/* Retake */}
      {quick.verdict !== 'TA_INTE' && (
        <button
          className="btn btn-secondary"
          style={{ width: '100%', borderColor: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
          onClick={onRetake}
          disabled={isLoadingFull}
        >
          🔄 Retake – ta ny bild och jämför
        </button>
      )}

      {/* Ny bild */}
      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={onNewPhoto}
      >
        📷 Ny bild
      </button>

      {/* TA NU-indikator */}
      {quick.readyToShoot && (
        <div className="quick-ready-banner" style={{ background: cfg.bg, borderColor: cfg.border }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <span style={{ color: cfg.color, fontWeight: 700, fontSize: 14 }}>
            Scenen är klar — ta bilden nu med din riktiga kamera!
          </span>
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
