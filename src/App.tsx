import { useState, useCallback } from 'react';
import type { MotiveType, StylePreference, AnalysisResult } from './types/analysis';
import type { AppSettings } from './types/settings';
import type { HistoryItem } from './types/history';
import { loadSettings, saveSettings, loadHistory, addHistoryItem, clearHistory } from './services/storage';
import { analyzePhoto, ApiError } from './services/anthropicClient';
import { resizeImage } from './services/imageUtils';
import { ImagePicker } from './components/ImagePicker';
import { AnalysisView } from './components/AnalysisView';
import { HistoryList } from './components/HistoryList';
import { SettingsPanel } from './components/SettingsPanel';

type Tab = 'analyze' | 'history' | 'settings';
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

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Image state
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);

  // Selection state
  const [motiveType, setMotiveType] = useState<MotiveType>('Auto');
  const [stylePreference, setStylePreference] = useState<StylePreference>('Naturlig');

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [viewingHistoryItem, setViewingHistoryItem] = useState<HistoryItem | null>(null);

  // Settings handler
  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  // Image handler
  const handleImageSelected = useCallback(async (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setAnalysisResult(null);
    setAnalysisError(null);
    // Pre-process for display optimization
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

  // Analysis
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
      });

      setAnalysisResult(result);
      setScreen('result');

      // Save to history
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
  }, [imageDataUrl, settings, motiveType, stylePreference, processedDataUrl]);

  // History handlers
  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setViewingHistoryItem(item);
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Rensa all historik? Det går inte att ångra.')) {
      clearHistory();
      setHistory([]);
    }
  }, []);

  // Navigation
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

  return (
    <div className="app-container">
      {/* Nav bar */}
      <nav className="nav-bar">
        <div className="nav-logo">
          <span className="nav-logo-dot" />
          Fotocoach
        </div>
        {tab === 'analyze' && screen === 'result' && analysisResult && (
          <button className="nav-btn" onClick={handleNewPhoto} title="Ny analys">
            ＋
          </button>
        )}
      </nav>

      {/* Main content */}
      <main className="main-content">
        {/* ─── ANALYZE TAB ─────────────────────────────── */}
        {tab === 'analyze' && (
          <>
            {/* Home screen */}
            {screen === 'home' && (
              <div>
                {/* Image picker */}
                <div className="card" style={{ marginBottom: 12 }}>
                  <ImagePicker
                    imageDataUrl={imageDataUrl}
                    onImageSelected={handleImageSelected}
                    onImageCleared={handleImageCleared}
                  />
                </div>

                {/* Motive type */}
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

                {/* Style preference */}
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

                {/* Error */}
                {analysisError && (
                  <div className="error-banner" style={{ marginTop: 12 }}>
                    <span className="error-icon">⚠️</span>
                    <div className="error-content">
                      <div className="error-title">Något gick fel</div>
                      <div className="error-message">{analysisError}</div>
                    </div>
                  </div>
                )}

                {/* No API key warning */}
                {!settings.anthropicApiKey && (
                  <div className="error-banner" style={{ marginTop: 12, borderColor: 'var(--verdict-adjust-border)', background: 'var(--verdict-adjust-bg)' }}>
                    <span className="error-icon" style={{ color: 'var(--verdict-adjust)' }}>🔑</span>
                    <div className="error-content">
                      <div className="error-title" style={{ color: 'var(--verdict-adjust)' }}>API-nyckel saknas</div>
                      <div className="error-message">
                        Gå till <strong>Inställningar</strong> och ange din Anthropic API-nyckel för att kunna analysera bilder.
                      </div>
                    </div>
                  </div>
                )}

                {/* Analyze button */}
                <button
                  className={`btn btn-analyze ${!canAnalyze ? '' : ''}`}
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="spinner" />
                      Analyserar...
                    </>
                  ) : (
                    <>📡 Analysera bilden</>
                  )}
                </button>
              </div>
            )}

            {/* Result screen */}
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

        {/* ─── HISTORY TAB ─────────────────────────────── */}
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

        {/* ─── SETTINGS TAB ─────────────────────────────── */}
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
          <div className="analyzing-subtext">Claude bedömer komposition, ljus och potential</div>
        </div>
      )}

      {/* Tab bar */}
      <nav className="tab-bar">
        <button
          className={`tab-item ${tab === 'analyze' ? 'active' : ''}`}
          onClick={() => { setTab('analyze'); if (tab !== 'analyze') { setScreen('home'); } }}
        >
          <span className="tab-icon">📷</span>
          Analysera
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
