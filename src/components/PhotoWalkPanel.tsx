import type { PhotoWalkSettings } from '../types/settings';
import type { LensProfile } from '../types/analysis';
import { SONY_LENSES } from '../data/cameraData';

interface PhotoWalkPanelProps {
  walk: PhotoWalkSettings;
  onChange: (walk: PhotoWalkSettings) => void;
}

function LensCard({ lens, role, onToggle, isMounted, onMount }: {
  lens: LensProfile;
  role: 'packed' | 'available' | 'none';
  onToggle: () => void;
  isMounted: boolean;
  onMount: () => void;
}) {
  const isPacked = role === 'packed' || role === 'available';

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
          aria-label={isPacked ? 'Ta bort från fototuren' : 'Lägg till i fototuren'}
        >
          {isPacked ? '✓' : '+'}
        </button>
      </div>

      {isPacked && (
        <div className="lens-card-actions">
          <button
            className={`lens-mount-btn ${isMounted ? 'lens-mount-btn--active' : ''}`}
            onClick={onMount}
          >
            {isMounted ? '📷 Sitter på kameran' : 'Sätt på kameran'}
          </button>
        </div>
      )}

      {isPacked && (
        <div className="lens-use-cases">
          {lens.bestUseCases.slice(0, 4).map((u) => (
            <span key={u} className="lens-use-tag">{u}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function PhotoWalkPanel({ walk, onChange }: PhotoWalkPanelProps) {
  function set<K extends keyof PhotoWalkSettings>(key: K, value: PhotoWalkSettings[K]) {
    onChange({ ...walk, [key]: value });
  }

  function toggleLens(id: string) {
    const isActive = walk.activeLensIds.includes(id);
    if (isActive) {
      const updated = walk.activeLensIds.filter((l) => l !== id);
      const newWalk: PhotoWalkSettings = {
        ...walk,
        activeLensIds: updated,
        mountedLensId: walk.mountedLensId === id ? (updated[0] ?? '') : walk.mountedLensId,
      };
      onChange(newWalk);
    } else {
      const updated = [...walk.activeLensIds, id];
      onChange({
        ...walk,
        activeLensIds: updated,
        mountedLensId: walk.mountedLensId || id,
      });
    }
  }

  function mountLens(id: string) {
    set('mountedLensId', id);
  }

  const packedLenses = SONY_LENSES.filter((l) => walk.activeLensIds.includes(l.id));
  const unpackedLenses = SONY_LENSES.filter((l) => !walk.activeLensIds.includes(l.id));
  const mountedLens = SONY_LENSES.find((l) => l.id === walk.mountedLensId);

  return (
    <div>
      {/* Status summary */}
      {walk.activeLensIds.length > 0 && (
        <div className="walk-summary-card">
          <div className="walk-summary-header">
            <span>📷</span>
            <div>
              <div className="walk-summary-title">Sony α6700</div>
              {mountedLens && (
                <div className="walk-summary-mounted">
                  {mountedLens.name} · {mountedLens.maxAperture}
                </div>
              )}
            </div>
            <div className="walk-summary-count">
              {walk.activeLensIds.length} obj.
            </div>
          </div>

          <div className="walk-extras">
            <button
              className={`walk-extra-btn ${walk.hasTriPod ? 'walk-extra-btn--active' : ''}`}
              onClick={() => set('hasTriPod', !walk.hasTriPod)}
            >
              {walk.hasTriPod ? '✓' : '+'} Stativ
            </button>
            <button
              className={`walk-extra-btn ${walk.hasFilters ? 'walk-extra-btn--active' : ''}`}
              onClick={() => set('hasFilters', !walk.hasFilters)}
            >
              {walk.hasFilters ? '✓' : '+'} Filter
            </button>
            <button
              className={`walk-extra-btn ${walk.avoidLensSwap ? 'walk-extra-btn--active' : ''}`}
              onClick={() => set('avoidLensSwap', !walk.avoidLensSwap)}
              title="AI:n prioriterar det monterade objektivet"
            >
              {walk.avoidLensSwap ? '✓' : '+'} Undvik byte
            </button>
          </div>

          {walk.notes !== undefined && (
            <input
              className="input-field walk-notes-input"
              placeholder="Notering om turen, t.ex. 'Gamla stan, gyllene timmen'…"
              value={walk.notes}
              onChange={(e) => set('notes', e.target.value)}
              maxLength={120}
            />
          )}
        </div>
      )}

      {/* Packed lenses */}
      {packedLenses.length > 0 && (
        <div className="walk-section">
          <div className="section-label" style={{ marginBottom: 10 }}>Med på turen</div>
          <div className="lens-list">
            {packedLenses.map((lens) => (
              <LensCard
                key={lens.id}
                lens={lens}
                role="packed"
                onToggle={() => toggleLens(lens.id)}
                isMounted={walk.mountedLensId === lens.id}
                onMount={() => mountLens(lens.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available lenses */}
      <div className="walk-section">
        <div className="section-label" style={{ marginBottom: 10 }}>
          {packedLenses.length > 0 ? 'Hemma' : 'Dina objektiv – välj vad du tar med'}
        </div>
        {unpackedLenses.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-state-icon" style={{ fontSize: 32 }}>✓</div>
            <div className="empty-state-title" style={{ fontSize: 14 }}>Alla objektiv är packade</div>
          </div>
        ) : (
          <div className="lens-list">
            {unpackedLenses.map((lens) => (
              <LensCard
                key={lens.id}
                lens={lens}
                role="none"
                onToggle={() => toggleLens(lens.id)}
                isMounted={false}
                onMount={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
