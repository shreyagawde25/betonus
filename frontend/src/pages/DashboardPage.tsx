import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { AlertList } from '../components/AlertList';
import type { Alert, IngestionStatus } from '../types';

const demoToken = import.meta.env.VITE_DEMO_JWT ?? '';

export function DashboardPage(): JSX.Element {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [status, setStatus] = useState<IngestionStatus | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!demoToken) {
      setError('Set VITE_DEMO_JWT in frontend/.env to load protected dashboard data.');
      return;
    }

    Promise.all([
      apiFetch<{ alerts: Alert[] }>('/api/alerts', demoToken),
      apiFetch<IngestionStatus>('/api/logs/status', demoToken)
    ])
      .then(([alertsResponse, statusResponse]) => {
        setAlerts(alertsResponse.alerts);
        setStatus(statusResponse);
      })
      .catch(() => setError('Unable to load dashboard data. Check API availability and token.'));
  }, []);

  async function handleExplain(alertId: string): Promise<void> {
    if (!demoToken) return;
    await apiFetch(`/api/alerts/${alertId}/explain`, demoToken, { method: 'POST' });
    const refreshed = await apiFetch<{ alerts: Alert[] }>('/api/alerts', demoToken);
    setAlerts(refreshed.alerts);
  }

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1>Betonus Security Dashboard</h1>
      {error ? <p>{error}</p> : null}
      <section style={{ padding: '1rem', border: '1px solid #2e3a5f', marginBottom: '1rem' }}>
        <h2>Log Ingestion Status</h2>
        <p>Logs in last 24h: {status?.logsInLast24Hours ?? '—'}</p>
        <p>Last ingested: {status?.lastIngestedAt ? new Date(status.lastIngestedAt).toLocaleString() : '—'}</p>
      </section>
      <AlertList alerts={alerts} onExplain={handleExplain} />
      <section style={{ marginTop: '2rem' }}>
        <h2>Frontend AI explain endpoint usage</h2>
        <pre>{`fetch('/api/alerts/<alertId>/explain', { method: 'POST', headers: { Authorization: 'Bearer <JWT>' } })`}</pre>
      </section>
    </main>
  );
}
