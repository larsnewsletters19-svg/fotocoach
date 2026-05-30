import { useState, useCallback } from 'react';
import type { AnalysisResult, RetakeComparison, RetakeVerdict } from '../types/analysis';
import { ImagePicker } from './ImagePicker';

const RETAKE_VERDICT_CONFIG: Record<RetakeVerdict, {
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
}> = {
  TA_NU: {
    label: 'TA NU',
    emoji: '✅',
    color: 'var(--verdict-go)',
    bg: 'var(--verdict-go-bg)',
    border: 'var(--verdict-go-border)',
  },
  BÄTTRE: {
    label: 'BÄTTRE',
    emoji: '📈',
    color: 'var(--accent-amber)',
    bg: 'var(--accent-amber-dim)',
    border: 'var(--accent-amber-glow)',
  },
  LIKNANDE: {
    label: 'LIKNANDE',
    emoji: '↔️',
    color: 'var(--text-secondary)',
    bg: 'var(--bg-elevated)',
    border: 'var(--border-default)',
  },
  SÄMRE: {
    label: 'SÄMRE',
    emoji: '📉',
    color: 'var(--verdict-no)',
    bg: 'var(--verdict-no-bg)',
    border: 'var(--verdict-no-border)',
  },
};

function DeltaBar({ label, delta }: { label: string; delta: number }) {
  const pct = Math.round(((delta + 10) / 20) * 100);
  const color = delta > 1 ? 'var(--verdict-go)' : delta < -1 ? 'var(--verdict-no)' : 'var(--text-tertiary)';
  const sign = delta > 0 ? '+' : '';
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="info-label">{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color }}>{sign}{delta}</span>
      </div>
      <div className="score-track">
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

interface RetakeViewProps {
  originalImageDataUrl: string;
  originalResult: AnalysisResult;
  comparison: RetakeComparison;
  retakeImageDataUrl: string;
  onNewRetake: () => void;
  onDone: () => void;
}

function ComparisonResult({ originalImageDataUrl, retakeImageDataUrl, comparison, originalResult, onNewRetake, onDone }: RetakeViewProps) {
  const cfg = RETAKE_VERDICT_CONFIG[comparison.retakeVerdict];

  return (
    <div className="stagger">
      {/* Before / After */}
      <div className="retake-before-after">
        <div className="retake-img-wrap">
          <img src={originalImageDataUrl} alt="Original" className="retake-img" />
          <div className="retake-img-label">ORIGINAL</div>
        </div>
        <div className="retake-arrow">→</div>
        <div className="retake-img-wrap">
          <img src={retakeImageDataUrl} alt="Retake" className="retake-img" />
          <div className="retake-img-label retake-img-label--new">RETAKE</div>
        </div>
      </div>

      {/* Verdict */}
      <div className="retake-verdict-card" style={{ background: cfg.bg, borderColor: cfg.border }}>
        <div style={{ fontSize: 36 }}>{cfg.emoji}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: cfg.color, letterSpacing: '-0.03em' }}>
          {cfg.label}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 260 }}>
          {comparison.oneSentenceSummary}
        </div>
        {comparison.readyToShoot && (
          <div className="retake-ready-badge">📷 Klar att ta med riktiga kameran</div>
        )}
      </div>

      {/* Delta chart */}
      <div className="card">
        <div className="card-header">
          <span className="card-icon">📊</span>
          <span className="card-title">Förändring</span>
        </div>
        <DeltaBar label="Komposition" delta={comparison.compositionDelta} />
        <DeltaBar label="Ljus" delta={comparison.lightDelta} />
        <DeltaBar label="Bakgrund" delta={comparison.backgroundDelta} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <span className="info-label">Totalt</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 700,
            color: comparison.overallImprovement > 0 ? 'var(--verdict-go)' : comparison.overallImprovement < 0 ? 'var(--verdict-no)' : 'var(--text-secondary)',
          }}>
            {comparison.overallImprovement > 0 ? '+' : ''}{comparison.overallImprovement} poäng
          </span>
        </div>
      </div>

      {/* Improved */}
      {comparison.improvedAspects.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">✅</span>
            <span className="card-title">Förbättringar</span>
          </div>
          <div className="works-list">
            {comparison.improvedAspects.map((item, i) => (
              <div key={i} className="works-item">
                <span className="works-icon">↑</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remaining issues */}
      {comparison.remainingIssues.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">🔧</span>
            <span className="card-title">Kvarstående problem</span>
          </div>
          <div className="checklist">
            {comparison.remainingIssues.map((item, i) => (
              <div key={i} className="checklist-item">
                <div className="checklist-bullet" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final recommendation */}
      {comparison.finalRecommendation && (
        <div className="learning-card">
          <span className="learning-icon">💡</span>
          <div>
            <div className="info-label" style={{ marginBottom: 6 }}>Rekommendation</div>
            <div className="learning-text">{comparison.finalRecommendation}</div>
          </div>
        </div>
      )}

      {/* Original scores for reference */}
      <div className="card" style={{ opacity: 0.7 }}>
        <div className="card-header">
          <span className="card-icon">📋</span>
          <span className="card-title">Original som referens</span>
        </div>
        <div className="info-row">
          <div className="info-label">Komposition</div>
          <div className="info-value">{originalResult.composition.overallScore}/10</div>
        </div>
        <div className="info-row">
          <div className="info-label">Ljus</div>
          <div className="info-value">{originalResult.light.overallScore}/10</div>
        </div>
        <div className="info-row">
          <div className="info-label">Verdict</div>
          <div className="info-value">{originalResult.verdict.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onNewRetake}>
          🔄 Nytt retake
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onDone}>
          ✓ Klar
        </button>
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

// ─── Main RetakeView ─────────────────────────────────────────────────────────

interface RetakePanelProps {
  originalImageDataUrl: string;
  originalResult: AnalysisResult;
  apiKey: string;
  onCompare: (retakeDataUrl: string) => Promise<RetakeComparison>;
  onDone: () => void;
}

export function RetakePanel({ originalImageDataUrl, originalResult, onCompare, onDone }: RetakePanelProps) {
  const [retakeDataUrl, setRetakeDataUrl] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparison, setComparison] = useState<RetakeComparison | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = useCallback(async () => {
    if (!retakeDataUrl) return;
    setIsComparing(true);
    setError(null);
    try {
      const result = await onCompare(retakeDataUrl);
      setComparison(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setIsComparing(false);
    }
  }, [retakeDataUrl, onCompare]);

  const handleNewRetake = useCallback(() => {
    setRetakeDataUrl(null);
    setComparison(null);
    setError(null);
  }, []);

  if (comparison && retakeDataUrl) {
    return (
      <ComparisonResult
        originalImageDataUrl={originalImageDataUrl}
        retakeImageDataUrl={retakeDataUrl}
        comparison={comparison}
        originalResult={originalResult}
        onNewRetake={handleNewRetake}
        onDone={onDone}
      />
    );
  }

  return (
    <div>
      {/* Quick reminder of top action */}
      {originalResult.priorityActions.length > 0 && (
        <div className="retake-reminder">
          <div className="retake-reminder-label">Råd att följa</div>
          {originalResult.priorityActions.slice(0, 3).map((a, i) => (
            <div key={i} className="retake-reminder-item">
              <span className="retake-reminder-num">{i + 1}</span>
              <span>{a.action}</span>
            </div>
          ))}
        </div>
      )}

      {/* Side by side preview */}
      <div className="retake-setup">
        <div className="retake-setup-col">
          <div className="retake-setup-label">ORIGINAL</div>
          <img src={originalImageDataUrl} alt="Original" className="retake-setup-img" />
        </div>
        <div className="retake-setup-col">
          <div className="retake-setup-label">RETAKE</div>
          <div style={{ flex: 1 }}>
            <ImagePicker
              imageDataUrl={retakeDataUrl}
              onImageSelected={setRetakeDataUrl}
              onImageCleared={() => setRetakeDataUrl(null)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginTop: 12 }}>
          <span className="error-icon">⚠️</span>
          <div className="error-content">
            <div className="error-title">Fel vid jämförelse</div>
            <div className="error-message">{error}</div>
          </div>
        </div>
      )}

      <button
        className="btn btn-analyze"
        onClick={handleCompare}
        disabled={!retakeDataUrl || isComparing}
        style={{ marginTop: 16 }}
      >
        {isComparing ? (
          <><span className="spinner" />Jämför bilderna...</>
        ) : (
          <>🔄 Jämför med original</>
        )}
      </button>
    </div>
  );
}
