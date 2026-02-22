import { AlertTriangle, Info, XCircle, X } from 'lucide-react';
import type { Alert } from '../data/sensors';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function alertStyles(severity: Alert['severity']) {
  if (severity === 'critical') return { border: 'rgba(248,113,113,0.4)', bg: 'rgba(127,29,29,0.2)', icon: <XCircle size={16} color="#f87171" />, color: '#f87171' };
  if (severity === 'warning') return { border: 'rgba(250,204,21,0.4)', bg: 'rgba(120,53,15,0.2)', icon: <AlertTriangle size={16} color="#facc15" />, color: '#facc15' };
  return { border: 'rgba(96,165,250,0.3)', bg: 'rgba(30,58,138,0.2)', icon: <Info size={16} color="#60a5fa" />, color: '#60a5fa' };
}

export default function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const ackAlerts = alerts.filter(a => a.acknowledged);

  return (
    <div style={{
      background: 'rgba(7,24,40,0.6)',
      border: '1px solid rgba(30,74,110,0.4)',
      borderRadius: 16,
      padding: '20px',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e2f0ff' }}>Alerts</h3>
        {activeAlerts.length > 0 && (
          <span style={{
            background: 'rgba(248,113,113,0.2)',
            border: '1px solid rgba(248,113,113,0.4)',
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 12,
            color: '#f87171',
          }}>
            {activeAlerts.length} active
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeAlerts.length === 0 && ackAlerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#4a6a8a', fontSize: 14 }}>
            No alerts — all systems nominal
          </div>
        )}

        {activeAlerts.map(alert => {
          const s = alertStyles(alert.severity);
          return (
            <div key={alert.id} style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '12px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e2f0ff', marginBottom: 3 }}>{alert.message}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#7ea8c8' }}>
                  <span>{alert.sensorName}</span>
                  <span>·</span>
                  <span>{timeAgo(alert.timestamp)}</span>
                </div>
              </div>
              <button
                onClick={() => onAcknowledge(alert.id)}
                title="Acknowledge"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6,
                  color: '#4a6a8a',
                  display: 'flex',
                  flexShrink: 0,
                  transition: 'color 0.2s',
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {ackAlerts.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11, color: '#4a6a8a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Acknowledged
            </div>
            {ackAlerts.map(alert => {
              const s = alertStyles(alert.severity);
              return (
                <div key={alert.id} style={{
                  opacity: 0.5,
                  padding: '8px 12px',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  borderRadius: 8,
                }}>
                  {s.icon}
                  <span style={{ fontSize: 12, color: '#7ea8c8', flex: 1 }}>{alert.message}</span>
                  <span style={{ fontSize: 11, color: '#4a6a8a' }}>{timeAgo(alert.timestamp)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
