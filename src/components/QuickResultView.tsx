import type { QuickAnalysis, Verdict } from '../types/analysis';
import { VerdictCard } from './VerdictCard';

const VERDICT_CONFIG: Record<Verdict, { color: string; bg: string; border: string }> = {
  TA_INTE:      { color: 'var(--verdict-no)',     bg: 'var(--verdict-no-bg)',     border: 'var(--verdict-no-border)'     },
  JUSTERA_FORST:{ color: 'var(--verdict-adjust)', bg: 'var(--verdict-adjust-bg)', border: 'var(--verdict-adjust-border)' },
  TA_NU:        { color: 'var(--verdict-go)',     bg: 'var(--verdict-go-bg)',     border: 'var(--verdict-go-border)'     },
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

      {/* Åtgärder */}
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

      {/* TA NU-banner */}
      {quick.readyToShoot && (
        <div className="quick-ready-banner" style={{ background: cfg.bg, borderColor: cfg.border }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>✅</span>
          <span style={{ color: cfg.color, fontWeight: 700, fontSize: 14, lineHeight: 1.4 }}>
            Scenen är klar — ta bilden nu med din riktiga kamera!
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="quick-divider">
        <span>Mer detaljer?</span>
      </div>

      {/* Knappar */}
      <div className="quick-actions">
        <button
          className="btn btn-secondary quick-action-btn"
          onClick={onFullAnalysis}
          disabled={isLoadingFull}
        >
          {isLoadingFull
            ? <><span className="spinner spinner-amber" /><span>Analyserar...</span></>
            : <><span>🔬</span><span>Fullständig analys</span></>
          }
        </button>

        {quick.verdict !== 'TA_INTE' && (
          <button
            className="btn btn-secondary quick-action-btn quick-action-btn--retake"
            onClick={onRetake}
            disabled={isLoadingFull}
          >
            <span>🔄</span><span>Retake</span>
          </button>
        )}

        <button
          className="btn btn-primary quick-action-btn"
          onClick={onNewPhoto}
        >
          <span>📷</span><span>Ny bild</span>
        </button>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
