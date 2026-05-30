import { useState, useCallback } from 'react';
import type { MotiveType, StylePreference, AnalysisResult } from './types/analysis';
import type { AppSettings, PhotoWalkSettings } from './types/settings';
import type { HistoryItem } from './types/history';
import { loadSettings, saveSettings, loadHistory, addHistoryItem, clearHistory, loadPhotoWalk, savePhotoWalk } from './services/storage';
import { analyzePhoto, ApiError } from './services/anthropicClient';
import { resizeImage } from './services/imageUtils';
import { ImagePicker } from './components/ImagePicker';
import { AnalysisView } from './components/AnalysisView';
import { HistoryList } from './components/HistoryList';
import { SettingsPanel } from './components/SettingsPanel';
import { PhotoWalkPanel } from './components/PhotoWalkPanel';
import { APP_VERSION } from './version';

type Tab = 'analyze' | 'walk' | 'history' | 'settings';
type Screen = 'home' | 'result';

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

  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [viewingHistoryItem, setViewingHistoryItem] = useState<HistoryItem | null>(null);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handlePhotoWalkChange = useCallback((newWalk: PhotoWalkSettings) => {
    setPhotoWalk(newWalk);
    savePhotoWalk(newWalk);
  }, []);

  const handleImageSelected = useCallback(async (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setAnalysisResult(null);
    setAnalysisError(null);
    try {
      const resized = await resizeImage(dataUrl);
      setProcessedDataUrl(resized);
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

  const handleAnalyze = useCallback(async () => {
    if (!imageDataUrl) return;
    if (!settings.anthropicApiKey) {
      setAnalysisError('API-nyckel saknas. Gå till Inställningar och ange din nyckel.');
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
        photoWalk: photoWalk.activeLensIds.length > 0 ? photoWalk : null,
      });

      setAnalysisResult(result);
      setScreen('result');

      const histItem: HistoryItem = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        imageDataUrl: processedDataUrl ?? imageDataUrl,
        motiveType,
        stylePreference,
        result,
      };
      const updated = addHistoryItem(histItem);
      setHistory(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setAnalysisError(err.message);
      } else if (err instanceof Error) {
        setAnalysisError(err.message);
      } else {
        setAnalysisError('Okänt fel. Försök igen.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageDataUrl, settings, motiveType, stylePreference, processedDataUrl, photoWalk]);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setViewingHistoryItem(item);
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Rensa all historik? Det går inte att ångra.')) {
      clearHistory();
      setHistory([]);
    }
  }, []);

  const handleBack = useCallback(() => {
    if (viewingHistoryItem) {
      setViewingHistoryItem(null);
      return;
    }
    setScreen('home');
  }, [viewingHistoryItem]);

  const handleNewPhoto = useCallback(() => {
    setImageDataUrl(null);
    setProcessedDataUrl(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setScreen('home');
    setTab('analyze');
  }, []);

  const canAnalyze = imageDataUrl !== null && !isAnalyzing;
  const walkIsActive = photoWalk.activeLensIds.length > 0;
  const mountedLensName = walkIsActive && photoWalk.mountedLensId
    ? photoWalk.mountedLensId.split('-').slice(1).join(' ')
    : null;

  return (
    <div className="app-container">
      {/* Nav bar */}
      <nav className="nav-bar">
        <div className="nav-logo">
          <span className="nav-logo-dot" />
          Fotocoach
          <span className="nav-version">v{APP_VERSION}</span>
        </div>
        {tab === 'analyze' && screen === 'result' && analysisResult && (
          <button className="nav-btn" onClick={handleNewPhoto} title="Ny analys">＋</button>
        )}
      </nav>

      <main className="main-content">

        {/* ─── ANALYZE TAB ─── */}
        {tab === 'analyze' && (
          <>
            {screen === 'home' && (
              <div>
                {/* Walk status pill */}
                {walkIsActive && (
                  <div className="walk-status-bar" onClick={() => setTab('walk')}>
                    <span className="walk-status-dot" />
                    <span className="walk-status-text">
                      Fototur aktiv
                      {mountedLensName && <> · <strong>{photoWalk.activeLensIds.length} obj.</strong></>}
                    </span>
                    {photoWalk.avoidLensSwap && <span className="walk-status-badge">Inget byte</span>}
                    <span className="walk-status-arrow">→</span>
                  </div>
                )}

                <div className="card" style={{ marginBottom: 12 }}>
                  <ImagePicker
                    imageDataUrl={imageDataUrl}
                    onImageSelected={handleImageSelected}
                    onImageCleared={handleImageCleared}
                  />
                </div>

                <div className="card">
                  <div className="section-label">Motivtyp</div>
                  <div className="chip-group">
                    {MOTIVE_TYPES.map((m) => (
                      <button
                        key={m}
                        className={`chip ${motiveType === m ? 'selected' : ''}`}
                        onClick={() => setMotiveType(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="section-label">Bildstil</div>
                  <div className="chip-group">
                    {STYLE_PREFS.map((s) => (
                      <button
                        key={s}
                        className={`chip ${stylePreference === s ? 'selected' : ''}`}
                        onClick={() => setStylePreference(s)}
                      >
                        {s}
                      </button>
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
                      <div className="error-message">
                        Gå till <strong>Inställningar</strong> och ange din Anthropic API-nyckel.
                      </div>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-analyze"
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                >
                  {isAnalyzing ? (
                    <><span className="spinner" />Analyserar...</>
                  ) : (
                    <>📡 Analysera bilden</>
                  )}
                </button>
              </div>
            )}

            {screen === 'result' && analysisResult && (
              <AnalysisView
                imageDataUrl={processedDataUrl ?? imageDataUrl!}
                result={analysisResult}
                onBack={handleBack}
                onNewPhoto={handleNewPhoto}
              />
            )}
          </>
        )}

        {/* ─── FOTOTUR TAB ─── */}
        {tab === 'walk' && (
          <>
            <div className="page-header">
              <div className="page-title">Fototur</div>
              <div className="page-subtitle">Välj objektiv och vad som sitter på kameran</div>
            </div>
            <PhotoWalkPanel walk={photoWalk} onChange={handlePhotoWalkChange} />
          </>
        )}

        {/* ─── HISTORY TAB ─── */}
        {tab === 'history' && (
          <>
            {viewingHistoryItem ? (
              <AnalysisView
                imageDataUrl={viewingHistoryItem.imageDataUrl}
                result={viewingHistoryItem.result}
                onBack={handleBack}
                onNewPhoto={handleNewPhoto}
              />
            ) : (
              <>
                <div className="page-header">
                  <div className="page-title">Historik</div>
                  <div className="page-subtitle">Dina senaste analyser</div>
                </div>
                <HistoryList
                  items={history}
                  onSelect={handleSelectHistoryItem}
                  onClear={handleClearHistory}
                />
              </>
            )}
          </>
        )}

        {/* ─── SETTINGS TAB ─── */}
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

      {/* Analyzing overlay */}
      {isAnalyzing && (
        <div className="analyzing-overlay">
          <div className="analyzing-spinner" />
          <div className="analyzing-text">Analyserar scoutingbild...</div>
          <div className="analyzing-subtext">
            {walkIsActive ? 'Tar hänsyn till din fototur' : 'Claude bedömer komposition, ljus och potential'}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <nav className="tab-bar">
        <button
          className={`tab-item ${tab === 'analyze' ? 'active' : ''}`}
          onClick={() => { setTab('analyze'); if (tab !== 'analyze') setScreen('home'); }}
        >
          <span className="tab-icon">📷</span>
          Analysera
        </button>
        <button
          className={`tab-item ${tab === 'walk' ? 'active' : ''}`}
          onClick={() => setTab('walk')}
        >
          <span className="tab-icon">🎒</span>
          Fototur
          {walkIsActive && <span className="tab-badge">{photoWalk.activeLensIds.length}</span>}
        </button>
        <button
          className={`tab-item ${tab === 'history' ? 'active' : ''}`}
          onClick={() => { setTab('history'); setViewingHistoryItem(null); }}
        >
          <span className="tab-icon">🕰️</span>
          Historik
        </button>
        <button
          className={`tab-item ${tab === 'settings' ? 'active' : ''}`}
          onClick={() => setTab('settings')}
        >
          <span className="tab-icon">⚙️</span>
          Inställningar
        </button>
      </nav>
    </div>
  );
}
