import type { PhotoWalkSettings, CameraType } from '../types/settings';
import type { LensProfile } from '../types/analysis';
import { SONY_LENSES } from '../data/cameraData';
import { MOBILE_CAMERAS } from '../data/mobileCameraData';

interface PhotoWalkPanelProps {
  walk: PhotoWalkSettings;
  onChange: (walk: PhotoWalkSettings) => void;
}

const CAMERA_OPTIONS: { id: CameraType; label: string; sub: string; emoji: string }[] = [
  { id: 'sony-a6700', label: 'Sony α6700', sub: 'APS-C + objektivval', emoji: '📷' },
  { id: 'iphone-16', label: 'iPhone 16', sub: 'ProRAW · 13–120mm', emoji: '📱' },
  { id: 'samsung-s25', label: 'Samsung S25', sub: 'RAW DNG · 13–230mm', emoji: '📱' },
];

function LensCard({ lens, isPacked, isMounted, onToggle, onMount }: {
  lens: LensProfile;
  isPacked: boolean;
  isMounted: boolean;
  onToggle: () => void;
  onMount: () => void;
}) {
  return (
    <div className={`lens-card ${isPacked ? 'lens-card--packed' : ''} ${isMounted ? 'lens-card--mounted' : ''}`}>
      <div className="lens-card-top">
        <div className="lens-card-info">
          <div className="lens-card-name">{lens.name}</div>
          <div className="lens-card-meta">
            {lens.focalLengthMm}mm · {lens.maxAperture}
            {lens.stabilized && <span className="lens-ois-badge">OIS</span>}
          </div>
          <div className="lens-card-sweet">Sweet spot: {lens.sweetSpotAperture}</div>
        </div>
        <button
          className={`lens-toggle-btn ${isPacked ? 'lens-toggle-btn--remove' : 'lens-toggle-btn--add'}`}
          onClick={onToggle}
        >
          {isPacked ? '✓' : '+'}
        </button>
      </div>
      {isPacked && (
        <>
          <div className="lens-card-actions">
            <button className={`lens-mount-btn ${isMounted ? 'lens-mount-btn--active' : ''}`} onClick={onMount}>
              {isMounted ? '📷 Sitter på kameran' : 'Sätt på kameran'}
            </button>
          </div>
          <div className="lens-use-cases">
            {lens.bestUseCases.slice(0, 4).map((u) => (
              <span key={u} className="lens-use-tag">{u}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MobileCameraInfo({ cameraType }: { cameraType: CameraType }) {
  const mobile = MOBILE_CAMERAS.find((c) => c.id === cameraType);
  if (!mobile) return null;
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-header">
        <span className="card-icon">📱</span>
        <span className="card-title">Linser – {mobile.brand} {mobile.model}</span>
      </div>
      {mobile.lenses.map((lens) => (
        <div key={lens.id} className="info-row">
          <div className="info-label">
            {lens.name}
            {lens.opticalZoom && <span className="lens-ois-badge" style={{ marginLeft: 6 }}>Optisk</span>}
          </div>
          <div className="info-value">
            {lens.focalLengthEquiv} eq · {lens.aperture} · {lens.bestFor.slice(0, 3).join(', ')}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12 }} className="api-key-note">
        {cameraType === 'iphone-16'
          ? '💡 Aktivera ProRAW i Inställningar › Kamera › Format för bästa kvalitet'
          : '💡 Använd Pro-läge i kamera-appen och spara RAW (DNG) via Expert RAW'}
      </div>
    </div>
  );
}

export function PhotoWalkPanel({ walk, onChange }: PhotoWalkPanelProps) {
  function set<K extends keyof PhotoWalkSettings>(key: K, value: PhotoWalkSettings[K]) {
    onChange({ ...walk, [key]: value });
  }

  function selectCamera(id: CameraType) {
    onChange({
      ...walk,
      cameraType: id,
      // reset lens selection when switching away from Sony
      activeLensIds: id === 'sony-a6700' ? walk.activeLensIds : [],
      mountedLensId: id === 'sony-a6700' ? walk.mountedLensId : '',
    });
  }

  function toggleLens(id: string) {
    const isActive = walk.activeLensIds.includes(id);
    if (isActive) {
      const updated = walk.activeLensIds.filter((l) => l !== id);
      onChange({
        ...walk,
        activeLensIds: updated,
        mountedLensId: walk.mountedLensId === id ? (updated[0] ?? '') : walk.mountedLensId,
      });
    } else {
      const updated = [...walk.activeLensIds, id];
      onChange({ ...walk, activeLensIds: updated, mountedLensId: walk.mountedLensId || id });
    }
  }

  const isSony = walk.cameraType === 'sony-a6700';
  const packedLenses = SONY_LENSES.filter((l) => walk.activeLensIds.includes(l.id));
  const unpackedLenses = SONY_LENSES.filter((l) => !walk.activeLensIds.includes(l.id));
  const mountedLens = SONY_LENSES.find((l) => l.id === walk.mountedLensId);
  const selectedCamera = CAMERA_OPTIONS.find((c) => c.id === walk.cameraType);

  return (
    <div>
      {/* Camera selector */}
      <div className="section-label" style={{ marginBottom: 10 }}>Kamera med på turen</div>
      <div className="camera-selector">
        {CAMERA_OPTIONS.map((cam) => (
          <button
            key={cam.id}
            className={`camera-selector-btn ${walk.cameraType === cam.id ? 'camera-selector-btn--active' : ''}`}
            onClick={() => selectCamera(cam.id)}
          >
            <span className="camera-selector-emoji">{cam.emoji}</span>
            <div className="camera-selector-text">
              <div className="camera-selector-label">{cam.label}</div>
              <div className="camera-selector-sub">{cam.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Status summary */}
      {(isSony ? walk.activeLensIds.length > 0 : true) && (
        <div className="walk-summary-card" style={{ marginTop: 16 }}>
          <div className="walk-summary-header">
            <span>{selectedCamera?.emoji ?? '📷'}</span>
            <div>
              <div className="walk-summary-title">{selectedCamera?.label}</div>
              {isSony && mountedLens && (
                <div className="walk-summary-mounted">{mountedLens.name} · {mountedLens.maxAperture}</div>
              )}
              {!isSony && (
                <div className="walk-summary-mounted">Alla linser tillgängliga</div>
              )}
            </div>
            {isSony && (
              <div className="walk-summary-count">{walk.activeLensIds.length} obj.</div>
            )}
          </div>

          <div className="walk-extras">
            <button className={`walk-extra-btn ${walk.hasTriPod ? 'walk-extra-btn--active' : ''}`} onClick={() => set('hasTriPod', !walk.hasTriPod)}>
              {walk.hasTriPod ? '✓' : '+'} Stativ
            </button>
            <button className={`walk-extra-btn ${walk.hasFilters ? 'walk-extra-btn--active' : ''}`} onClick={() => set('hasFilters', !walk.hasFilters)}>
              {walk.hasFilters ? '✓' : '+'} Filter
            </button>
            {isSony && (
              <button className={`walk-extra-btn ${walk.avoidLensSwap ? 'walk-extra-btn--active' : ''}`} onClick={() => set('avoidLensSwap', !walk.avoidLensSwap)}>
                {walk.avoidLensSwap ? '✓' : '+'} Inget byte
              </button>
            )}
          </div>

          <input
            className="input-field walk-notes-input"
            placeholder="Notering, t.ex. 'Gamla stan, gyllene timmen'…"
            value={walk.notes}
            onChange={(e) => set('notes', e.target.value)}
            maxLength={120}
          />
        </div>
      )}

      {/* Mobile: show lens overview */}
      {!isSony && (
        <div style={{ marginTop: 16 }}>
          <MobileCameraInfo cameraType={walk.cameraType} />
        </div>
      )}

      {/* Sony: lens packing */}
      {isSony && (
        <>
          {packedLenses.length > 0 && (
            <div className="walk-section" style={{ marginTop: 16 }}>
              <div className="section-label" style={{ marginBottom: 10 }}>Med på turen</div>
              <div className="lens-list">
                {packedLenses.map((lens) => (
                  <LensCard
                    key={lens.id}
                    lens={lens}
                    isPacked={true}
                    isMounted={walk.mountedLensId === lens.id}
                    onToggle={() => toggleLens(lens.id)}
                    onMount={() => set('mountedLensId', lens.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="walk-section" style={{ marginTop: 16 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>
              {packedLenses.length > 0 ? 'Hemma' : 'Dina objektiv – välj vad du tar med'}
            </div>
            {unpackedLenses.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: 32 }}>✓</div>
                <div className="empty-state-title" style={{ fontSize: 14 }}>Alla objektiv packade</div>
              </div>
            ) : (
              <div className="lens-list">
                {unpackedLenses.map((lens) => (
                  <LensCard
                    key={lens.id}
                    lens={lens}
                    isPacked={false}
                    isMounted={false}
                    onToggle={() => toggleLens(lens.id)}
                    onMount={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
