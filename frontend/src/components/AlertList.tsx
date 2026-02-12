import type { Alert } from '../types';

interface Props {
  alerts: Alert[];
  onExplain: (id: string) => Promise<void>;
}

export function AlertList({ alerts, onExplain }: Props): JSX.Element {
  return (
    <section>
      <h2>Recent Alerts</h2>
      {alerts.length === 0 ? <p>No alerts yet.</p> : null}
      <ul>
        {alerts.map((alert) => (
          <li key={alert._id} style={{ border: '1px solid #2e3a5f', padding: '1rem', marginBottom: '0.75rem' }}>
            <strong>{alert.summary}</strong>
            <p>Host: {alert.host}</p>
            <p>
              Severity: {alert.severity} | Risk score: {alert.riskScore}
            </p>
            <button onClick={() => onExplain(alert._id)}>Refresh AI summary</button>
            {alert.aiExplanation ? <p>{alert.aiExplanation}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
