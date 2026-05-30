import type { HistoryItem } from '../types/history';
import type { Verdict } from '../types/analysis';

const verdictText: Record<Verdict, string> = {
  TA_INTE: 'TA INTE',
  JUSTERA_FORST: 'JUSTERA FÖRST',
  TA_NU: 'TA NU',
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export function HistoryList({ items, onSelect, onClear }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🕰️</div>
        <div className="empty-state-title">Ingen historik ännu</div>
        <div className="empty-state-text">
          Dina senaste 8 analyser visas här. Ta din första scoutingbild!
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="page-subtitle">{items.length} analys{items.length !== 1 ? 'er' : ''} sparad{items.length !== 1 ? 'e' : ''}</div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClear}
          style={{ color: 'var(--verdict-no)' }}
        >
          Rensa historik
        </button>
      </div>
      <div className="history-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="history-item"
            onClick={() => onSelect(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
          >
            <img
              src={item.imageDataUrl}
              alt="Scoutingbild"
              className="history-thumbnail"
            />
            <div className="history-content">
              <div className={`history-verdict ${item.result.verdict}`}>
                {verdictText[item.result.verdict]}
              </div>
              <div className="history-summary">{item.result.oneSentenceReason}</div>
              <div className="history-meta">
                <span className="history-tag">{item.motiveType}</span>
                <span className="history-tag">{item.stylePreference}</span>
              </div>
              <div className="history-date">{formatDate(item.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
