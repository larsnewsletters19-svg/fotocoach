import { useState, useCallback } from 'react';
import type { MotiveType, StylePreference, AnalysisResult, RetakeComparison } from './types/analysis';
import type { AppSettings, PhotoWalkSettings } from './types/settings';
import type { HistoryItem } from './types/history';
import {
  loadSettings, saveSettings,
  loadHistory, addHistoryItem, updateHistoryItem, clearHistory,
  loadPhotoWalk, savePhotoWalk,
} from './services/storage';
import { analyzePhoto, retakePhoto, ApiError } from './services/anthropicClient';
import { resizeImage } from './services/imageUtils';
import { useTheme, resolveTheme } from './hooks/useTheme';
import { ImagePicker } from './components/ImagePicker';
import { AnalysisView } from './components/AnalysisView';
import { RetakePanel } from './components/RetakePanel';
import { HistoryList } from './components/HistoryList';
import { SettingsPanel } from './components/SettingsPanel';
import { PhotoWalkPanel } from './components/PhotoWalkPanel';
import { APP_VERSION } from './version';

type Tab = 'analyze' | 'walk' | 'history' | 'settings';
type Screen = 'home' | 'result' | 'retake';

const MOTIVE_TYPES: MotiveType[] = [
  'Auto', 'Resa', 'Gatufoto', 'Porträtt', 'Mat', 'Landskap', 'Arkitektur', 'Detalj',
];
const STYLE_PREFS: StylePreference[] = [
  'Naturlig', 'Filmisk', 'Dramatisk', 'Minimalistisk', 'Dokumentär',
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function App() {
  const [tab, setTab] = useState<Tab>('analyze');
  const [screen, setScreen] = useState<Screen>('home');

  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [photoWalk, setPhotoWalk] = useState<PhotoWalkSettings>(() => loadPhotoWalk());

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const [motiveType, setMotiveType] = useState<MotiveType>('Auto');
  const [stylePreference, setStylePreference] = useState<StylePreference>('Naturlig');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [viewingHistoryItem, setViewingHistoryItem] = useState<HistoryItem | null>(null);

  // ─── Theme ───
  useTheme(settings.theme ?? 'auto');

  const resolvedTheme = resolveTheme(settings.theme ?? 'auto');

  function cycleTheme() {
    const order = ['auto', 'light', 'dark'] as const;
    const current = settings.theme ?? 'auto';
    const next = order[(order.indexOf(current) + 1) % order.length];
    const updated = { ...settings, theme: next };
    setSettings(updated);
    saveSettings(updated);
  }

  const themeIcon = settings.theme === 'light' ? '☀️' : settings.theme === 'dark' ? '🌙' : '⚙️';

  // ─── Settings & walk ───
  const handleSettingsChange = useCallback((s: AppSettings) => {
    setSettings(s); saveSettings(s);
  }, []);

  const handlePhotoWalkChange = useCallback((w: PhotoWalkSettings) => {
    setPhotoWalk(w); savePhotoWalk(w);
  }, []);

  // ─── Image ───
  const handleImageSelected = useCallback(async (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setAnalysisResult(null);
    setAnalysisError(null);
    try {
      setProcessedDataUrl(await resizeImage(dataUrl));
    } catch {
      setProcessedDataUrl(dataUrl);
    }
  }, []);

  const handleImageCleared = useCallback(() => {
    setImageDataUrl(null);
    setProcessedDataUrl(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  }, []);

  // ─── Analyze ───
  const handleAnalyze = useCallback(async () => {
    if (!imageDataUrl || !settings.anthropicApiKey) {
      if (!settings.anthropicApiKey) setAnalysisError('API-nyckel saknas. Gå till Inställningar.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzePhoto({
        imageDataUrl,
        apiKey: settings.anthropicApiKey,
        motiveType,
        stylePreference,
        analysisTone: settings.analysisTone,
        technicalLevel: settings.technicalLevel,
        photoWalk: photoWalk.cameraType === 'sony-a6700' && photoWalk.activeLensIds.length > 0
          ? photoWalk
          : photoWalk.cameraType !== 'sony-a6700' ? photoWalk : null,
        cameraType: photoWalk.cameraType,
      });
      setAnalysisResult(result);
      setScreen('result');
      const id = generateId();
      setCurrentHistoryId(id);
      const item: HistoryItem = {
        id,
        createdAt: new Date().toISOString(),
        imageDataUrl: processedDataUrl ?? imageDataUrl,
        motiveType,
        stylePreference,
        result,
      };
      setHistory(addHistoryItem(item));
    } catch (err) {
      setAnalysisError(err instanceof ApiError || err instanceof Error ? err.message : 'Okänt fel.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageDataUrl, settings, motiveType, stylePreference, processedDataUrl, photoWalk]);

  // ─── Retake ───
  const handleStartRetake = useCallback(() => setScreen('retake'), []);

  const handleCompareRetake = useCallback(async (retakeDataUrl: string): Promise<RetakeComparison> => {
    if (!analysisResult) throw new Error('Ingen originalanalys att jämföra med.');
    const comparison = await retakePhoto({
      originalImageDataUrl: processedDataUrl ?? imageDataUrl!,
      retakeImageDataUrl: retakeDataUrl,
      apiKey: settings.anthropicApiKey,
      originalResult: analysisResult,
    });
    if (currentHistoryId) {
      setHistory(updateHistoryItem(currentHistoryId, {
        retakeImageDataUrl: retakeDataUrl,
        retakeComparison: comparison,
      }));
    }
    return comparison;
  }, [analysisResult, processedDataUrl, imageDataUrl, settings.anthropicApiKey, currentHistoryId]);

  const handleRetakeDone = useCallback(() => setScreen('result'), []);

  // ─── Navigation ───
  const handleBack = useCallback(() => {
    if (viewingHistoryItem) { setViewingHistoryItem(null); return; }
    if (screen === 'retake') { setScreen('result'); return; }
    setScreen('home');
  }, [viewingHistoryItem, screen]);

  const handleNewPhoto = useCallback(() => {
    setImageDataUrl(null);
    setProcessedDataUrl(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setCurrentHistoryId(null);
    setScreen('home');
    setTab('analyze');
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Rensa all historik? Det går inte att ångra.')) {
      clearHistory(); setHistory([]);
    }
  }, []);

  const canAnalyze = imageDataUrl !== null && !isAnalyzing;

  const cameraLabel = photoWalk.cameraType === 'sony-a6700'
    ? `Sony α6700 · ${photoWalk.activeLensIds.length} obj.`
    : photoWalk.cameraType === 'iphone-16' ? 'iPhone 16'
    : 'Samsung S25';

  return (
    <div className="app-container">
      {/* Nav */}
      <nav className="nav-bar">
        <div className="nav-logo">
          <span className="nav-logo-dot" />
          Fotocoach
          <span className="nav-version">v{APP_VERSION}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            className="theme-toggle-btn"
            onClick={cycleTheme}
            title={`Tema: ${settings.theme ?? 'auto'} – tryck för att byta`}
            aria-label="Byt tema"
          >
            {themeIcon}
          </button>
          {tab === 'analyze' && screen === 'result' && analysisResult && (
            <button className="nav-btn" onClick={handleNewPhoto} title="Ny analys">＋</button>
          )}
        </div>
      </nav>

      <main className="main-content">

        {/* ─── ANALYZE ─── */}
        {tab === 'analyze' && (
          <>
            {screen === 'home' && (
              <div>
                {/* Walk status pill */}
                <div className="walk-status-bar" onClick={() => setTab('walk')}>
                  <span className="walk-status-dot" />
                  <span className="walk-status-text">
                    {photoWalk.cameraType !== 'sony-a6700' ? '📱 ' : '📷 '}
                    <strong>{cameraLabel}</strong>
                  </span>
                  {photoWalk.cameraType === 'sony-a6700' && photoWalk.avoidLensSwap && (
                    <span className="walk-status-badge">Inget byte</span>
                  )}
                  <span className="walk-status-arrow">→</span>
                </div>

                <div className="card" style={{ marginBottom: 12 }}>
                  <ImagePicker imageDataUrl={imageDataUrl} onImageSelected={handleImageSelected} onImageCleared={handleImageCleared} />
                </div>

                <div className="card">
                  <div className="section-label">Motivtyp</div>
                  <div className="chip-group">
                    {MOTIVE_TYPES.map((m) => (
                      <button key={m} className={`chip ${motiveType === m ? 'selected' : ''}`} onClick={() => setMotiveType(m)}>{m}</button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="section-label">Bildstil</div>
                  <div className="chip-group">
                    {STYLE_PREFS.map((s) => (
                      <button key={s} className={`chip ${stylePreference === s ? 'selected' : ''}`} onClick={() => setStylePreference(s)}>{s}</button>
                    ))}
                  </div>
                </div>

                {analysisError && (
                  <div className="error-banner" style={{ marginTop: 12 }}>
                    <span className="error-icon">⚠️</span>
                    <div className="error-content">
                      <div className="error-title">Något gick fel</div>
                      <div className="error-message">{analysisError}</div>
                    </div>
                  </div>
                )}

                {!settings.anthropicApiKey && (
                  <div className="error-banner" style={{ marginTop: 12, borderColor: 'var(--verdict-adjust-border)', background: 'var(--verdict-adjust-bg)' }}>
                    <span className="error-icon" style={{ color: 'var(--verdict-adjust)' }}>🔑</span>
                    <div className="error-content">
                      <div className="error-title" style={{ color: 'var(--verdict-adjust)' }}>API-nyckel saknas</div>
                      <div className="error-message">Gå till <strong>Inställningar</strong> och ange din Anthropic API-nyckel.</div>
                    </div>
                  </div>
                )}

                <button className="btn btn-analyze" onClick={handleAnalyze} disabled={!canAnalyze}>
                  {isAnalyzing ? <><span className="spinner" />Analyserar...</> : <>📡 Analysera bilden</>}
                </button>
              </div>
            )}

            {screen === 'result' && analysisResult && (
              <AnalysisView
                imageDataUrl={processedDataUrl ?? imageDataUrl!}
                result={analysisResult}
                onBack={handleBack}
                onNewPhoto={handleNewPhoto}
                onRetake={handleStartRetake}
              />
            )}

            {screen === 'retake' && analysisResult && (
              <div>
                <button className="back-btn" onClick={handleBack}>← Tillbaka till analys</button>
                <div className="page-header" style={{ marginBottom: 16 }}>
                  <div className="page-title">Retake</div>
                  <div className="page-subtitle">Följ råden, ta en ny bild och jämför</div>
                </div>
                <RetakePanel
                  originalImageDataUrl={processedDataUrl ?? imageDataUrl!}
                  originalResult={analysisResult}
                  apiKey={settings.anthropicApiKey}
                  onCompare={handleCompareRetake}
                  onDone={handleRetakeDone}
                />
              </div>
            )}
          </>
        )}

        {/* ─── FOTOTUR ─── */}
        {tab === 'walk' && (
          <>
            <div className="page-header">
              <div className="page-title">Fototur</div>
              <div className="page-subtitle">Välj kamera och utrustning</div>
            </div>
            <PhotoWalkPanel walk={photoWalk} onChange={handlePhotoWalkChange} />
          </>
        )}

        {/* ─── HISTORIK ─── */}
        {tab === 'history' && (
          <>
            {viewingHistoryItem ? (
              <div>
                <AnalysisView
                  imageDataUrl={viewingHistoryItem.imageDataUrl}
                  result={viewingHistoryItem.result}
                  onBack={handleBack}
                  onNewPhoto={handleNewPhoto}
                />
                {viewingHistoryItem.retakeComparison && (
                  <div className="card" style={{ marginTop: 12 }}>
                    <div className="card-header">
                      <span className="card-icon">🔄</span>
                      <span className="card-title">Retake gjordes</span>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Resultat</div>
                      <div className="info-value">{viewingHistoryItem.retakeComparison.oneSentenceSummary}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="page-header">
                  <div className="page-title">Historik</div>
                  <div className="page-subtitle">Dina senaste analyser</div>
                </div>
                <HistoryList items={history} onSelect={setViewingHistoryItem} onClear={handleClearHistory} />
              </>
            )}
          </>
        )}

        {/* ─── INSTÄLLNINGAR ─── */}
        {tab === 'settings' && (
          <>
            <div className="page-header">
              <div className="page-title">Inställningar</div>
              <div className="page-subtitle">API-nyckel och preferenser</div>
            </div>
            <SettingsPanel settings={settings} onChange={handleSettingsChange} />
          </>
        )}
      </main>

      {isAnalyzing && (
        <div className="analyzing-overlay">
          <div className="analyzing-spinner" />
          <div className="analyzing-text">Analyserar scoutingbild...</div>
          <div className="analyzing-subtext">
            {resolvedTheme === 'light' ? 'Ljust tema aktivt' : 'Mörkt tema aktivt'} · {cameraLabel}
          </div>
        </div>
      )}

      <nav className="tab-bar">
        <button className={`tab-item ${tab === 'analyze' ? 'active' : ''}`}
          onClick={() => { setTab('analyze'); if (tab !== 'analyze') setScreen('home'); }}>
          <span className="tab-icon">📷</span>Analysera
        </button>
        <button className={`tab-item ${tab === 'walk' ? 'active' : ''}`} onClick={() => setTab('walk')}>
          <span className="tab-icon">🎒</span>Fototur
          {photoWalk.cameraType === 'sony-a6700' && photoWalk.activeLensIds.length > 0 && (
            <span className="tab-badge">{photoWalk.activeLensIds.length}</span>
          )}
        </button>
        <button className={`tab-item ${tab === 'history' ? 'active' : ''}`}
          onClick={() => { setTab('history'); setViewingHistoryItem(null); }}>
          <span className="tab-icon">🕰️</span>Historik
        </button>
        <button className={`tab-item ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          <span className="tab-icon">⚙️</span>Inställningar
        </button>
      </nav>
    </div>
  );
}
