import type { AnalysisResult } from '../types/analysis';
import { VerdictCard } from './VerdictCard';
import { PriorityActions } from './PriorityActions';
import { CompositionCard } from './CompositionCard';
import { LightCard } from './LightCard';
import { CameraAdviceCard } from './CameraAdviceCard';
import { ImageOverlayCanvas } from './ImageOverlayCanvas';
import { LightroomExportCard } from './LightroomExportCard';

interface AnalysisViewProps {
  imageDataUrl: string;
  result: AnalysisResult;
  onBack: () => void;
  onNewPhoto: () => void;
  onRetake?: () => void;
}

export function AnalysisView({ imageDataUrl, result, onBack, onNewPhoto, onRetake }: AnalysisViewProps) {
  return (
    <div className="stagger">
      {/* Back */}
      <button className="back-btn" onClick={onBack}>
        ← Tillbaka
      </button>

      {/* Scoutingbild med overlays */}
      <div style={{ marginBottom: 16 }}>
        <ImageOverlayCanvas
          imageDataUrl={imageDataUrl}
          overlays={result.overlays}
          verdict={result.verdict}
        />
      </div>

      {/* Verdict */}
      <VerdictCard result={result} />

      {/* Priority actions */}
      {result.priorityActions && result.priorityActions.length > 0 && (
        <PriorityActions actions={result.priorityActions} />
      )}

      {/* Bakgrund och störningar */}
      {result.backgroundAndDistractions && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">🔍</span>
            <span className="card-title">Bakgrund och störningar</span>
          </div>
          <div className="info-value">{result.backgroundAndDistractions}</div>
        </div>
      )}

      {/* Vad fungerar */}
      {result.whatAlreadyWorks && result.whatAlreadyWorks.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">✨</span>
            <span className="card-title">Det som redan fungerar</span>
          </div>
          <div className="works-list">
            {result.whatAlreadyWorks.map((item, i) => (
              <div key={i} className="works-item">
                <span className="works-icon">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Komposition */}
      <CompositionCard composition={result.composition} />

      {/* Ljus */}
      <LightCard light={result.light} />

      {/* Kameraråd Sony a6700 */}
      {result.cameraAdvice && (
        <CameraAdviceCard advice={result.cameraAdvice} />
      )}

      {/* Lightroom-export */}
      {result.lightroomAdjustments && (
        <LightroomExportCard adjustments={result.lightroomAdjustments} />
      )}

      {/* Lärdom */}
      {result.learningPoint && (
        <div className="learning-card">
          <span className="learning-icon">💡</span>
          <div>
            <div className="info-label" style={{ marginBottom: 6 }}>Lärdom till nästa gång</div>
            <div className="learning-text">{result.learningPoint}</div>
          </div>
        </div>
      )}

      {/* Checklista */}
      {result.nextShotChecklist && result.nextShotChecklist.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">📋</span>
            <span className="card-title">Checklista inför nästa bild</span>
          </div>
          <div className="checklist">
            {result.nextShotChecklist.map((item, i) => (
              <div key={i} className="checklist-item">
                <div className="checklist-bullet" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {onRetake && (
        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: 8, borderColor: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
          onClick={onRetake}
        >
          🔄 Retake – ta ny scoutingbild och jämför
        </button>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onBack}>
          ← Ny analys
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onNewPhoto}>
          📷 Ny bild
        </button>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
