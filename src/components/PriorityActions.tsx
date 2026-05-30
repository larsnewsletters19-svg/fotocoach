import type { PriorityAction, ImpactLevel, TimingType } from '../types/analysis';

const impactLabel: Record<ImpactLevel, string> = {
  high: 'Stor effekt',
  medium: 'Medel effekt',
  low: 'Liten effekt',
};

const timingLabel: Record<TimingType, string> = {
  now: 'Nu',
  wait: 'Vänta',
  optional: 'Valfritt',
};

interface PriorityActionsProps {
  actions: PriorityAction[];
}

export function PriorityActions({ actions }: PriorityActionsProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">⚡</span>
        <span className="card-title">Prioriterade åtgärder</span>
      </div>
      <div className="priority-actions-list">
        {actions.map((action, i) => (
          <div key={i} className="priority-action-item">
            <div className="priority-action-rank">{action.rank ?? i + 1}</div>
            <div className="priority-action-content">
              <div className="priority-action-text">{action.action}</div>
              <div className="priority-action-why">{action.why}</div>
              <div className="priority-action-badges">
                <span className={`badge badge-impact-${action.impact}`}>
                  {impactLabel[action.impact] ?? action.impact}
                </span>
                <span className={`badge badge-timing-${action.timing}`}>
                  {timingLabel[action.timing] ?? action.timing}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
