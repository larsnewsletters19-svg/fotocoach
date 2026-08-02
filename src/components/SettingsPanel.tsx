import { useState } from 'react';
import type { AppSettings, ThemePreference } from '../types/settings';
import type { AnalysisTone, TechnicalLevel } from '../types/analysis';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const [showKey, setShowKey] = useState(false);

  const hasKey = settings.anthropicApiKey.length > 10;

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    onChange({ ...settings, [key]: value });
  }

  const tones: AnalysisTone[] = ['Uppmuntrande', 'Balanserad', 'Rak'];
  const levels: TechnicalLevel[] = ['Enkel', 'Normal', 'Avancerad'];

  const themeOptions: { id: ThemePreference; label: string; emoji: string }[] = [
    { id: 'auto', label: 'Auto', emoji: '⚙️' },
    { id: 'dark', label: 'Mörkt', emoji: '🌙' },
    { id: 'light', label: 'Ljust', emoji: '☀️' },
  ];

  return (
    <div>
      {/* API key */}
      <div className="settings-section">
        <div className="settings-section-title">Anthropic API-nyckel</div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="info-label">Status</div>
            {hasKey ? (
              <span className="pill-indicator success"><span className="pill-dot" />Ansluten</span>
            ) : (
              <span className="pill-indicator warning"><span className="pill-dot" />Saknas</span>
            )}
          </div>
          <div className="key-toggle-wrapper">
            <input
              type={showKey ? 'text' : 'password'}
              className={`input-field ${hasKey ? 'has-key' : ''}`}
              placeholder="sk-ant-..."
              value={settings.anthropicApiKey}
              onChange={(e) => set('anthropicApiKey', e.target.value.trim())}
              autoComplete="off"
              spellCheck={false}
            />
            <button className="key-toggle" onClick={() => setShowKey(!showKey)} type="button">
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="api-key-note">
            🔒 API-nyckeln sparas lokalt i din webbläsare och skickas bara till Anthropic vid analys.<br />
            Hämta din nyckel på <strong style={{ color: 'var(--accent-amber)' }}>console.anthropic.com</strong>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="settings-section">
        <div className="settings-section-title">Tema</div>
        <div className="card">
          <div className="info-label" style={{ marginBottom: 10 }}>Ljust eller mörkt? Auto följer telefonens inställning.</div>
          <div className="theme-radio-group">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                className={`theme-radio-btn ${settings.theme === opt.id ? 'selected' : ''}`}
                onClick={() => set('theme', opt.id)}
              >
                <span className="theme-radio-emoji">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="api-key-note" style={{ marginTop: 8 }}>
            {settings.theme === 'auto' && '📱 Följer telefonens ljus/mörkt-inställning automatiskt.'}
            {settings.theme === 'dark' && '🌙 Mörkt tema alltid – snyggt inomhus.'}
            {settings.theme === 'light' && '☀️ Ljust tema alltid – bäst i starkt solljus utomhus.'}
          </div>
        </div>
      </div>

      {/* Analysis tone */}
      <div className="settings-section">
        <div className="settings-section-title">Analyston</div>
        <div className="card">
          <div className="info-label" style={{ marginBottom: 8 }}>Hur vill du att coachen pratar med dig?</div>
          <div className="radio-group">
            {tones.map((tone) => (
              <button
                key={tone}
                className={`radio-option ${settings.analysisTone === tone ? 'selected' : ''}`}
                onClick={() => set('analysisTone', tone)}
              >
                {tone}
              </button>
            ))}
          </div>
          <div className="api-key-note" style={{ marginTop: 8 }}>
            {settings.analysisTone === 'Uppmuntrande' && '😊 Varm och positiv ton, men ändå konkret och tydlig.'}
            {settings.analysisTone === 'Balanserad' && '⚖️ Saklig och pedagogisk. Lagom direkthet.'}
            {settings.analysisTone === 'Rak' && '🎯 Direkt och utan omsvep. Råd utan inramning.'}
          </div>
        </div>
      </div>

      {/* Technical level */}
      <div className="settings-section">
        <div className="settings-section-title">Teknisk nivå</div>
        <div className="card">
          <div className="info-label" style={{ marginBottom: 8 }}>Hur tekniska råd vill du ha?</div>
          <div className="radio-group">
            {levels.map((level) => (
              <button
                key={level}
                className={`radio-option ${settings.technicalLevel === level ? 'selected' : ''}`}
                onClick={() => set('technicalLevel', level)}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="api-key-note" style={{ marginTop: 8 }}>
            {settings.technicalLevel === 'Enkel' && '🌱 Inga fototermer. Perfekt för nybörjare.'}
            {settings.technicalLevel === 'Normal' && '📷 Vanliga fototermer med kort förklaring.'}
            {settings.technicalLevel === 'Avancerad' && '🔬 Exakt fotografiskt språk. Inga förklaringar.'}
          </div>
        </div>
      </div>

      {/* App info */}
      <div className="settings-section">
        <div className="settings-section-title">Om appen</div>
        <div className="card">
          <div className="info-row">
            <div className="info-label">Version</div>
            <div className="info-value">0.6.0 – Ljust/mörkt tema & mobilkameror</div>
          </div>
          <div className="info-row">
            <div className="info-label">Modell</div>
            <div className="info-value">Claude Sonnet 5</div>
          </div>
          <div className="info-row">
            <div className="info-label">Kameror</div>
            <div className="info-value">Sony α6700 · iPhone 16 · Samsung S25</div>
          </div>
          <div className="info-row">
            <div className="info-label">Kommande versioner</div>
            <div className="info-value">Personligt lärande</div>
          </div>
        </div>
      </div>
    </div>
  );
}
