import { useState, useEffect } from 'react';
import { Snowflake, RefreshCw } from 'lucide-react';
import SensorCard from './components/SensorCard';
import TempChart from './components/TempChart';
import AlertsPanel from './components/AlertsPanel';
import SummaryStats from './components/SummaryStats';
import { initialSensors, sensorHistory, initialAlerts } from './data/sensors';
import type { Sensor, Alert } from './data/sensors';

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function App() {
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors);
  const [selectedId, setSelectedId] = useState<string>('s1');
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [history] = useState(sensorHistory);
  const [refreshing, setRefreshing] = useState(false);
  const now = useNow();

  const selectedSensor = sensors.find(s => s.id === selectedId) ?? sensors[0];
  const activeAlertCount = alerts.filter(a => !a.acknowledged).length;

  function refresh() {
    setRefreshing(true);
    setTimeout(() => {
      setSensors(prev =>
        prev.map(s => ({
          ...s,
          currentTemp: Math.round((s.currentTemp + (Math.random() - 0.5) * 0.8) * 10) / 10,
          humidity: Math.min(100, Math.max(20, s.humidity + Math.round((Math.random() - 0.5) * 4))),
          lastUpdated: new Date(),
        }))
      );
      setRefreshing(false);
    }, 600);
  }

  function acknowledge(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #03101e 0%, #071828 40%, #061520 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background frost pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(96,165,250,0.04) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(129,140,248,0.04) 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(7,24,40,0.8)',
        borderBottom: '1px solid rgba(30,74,110,0.3)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Snowflake size={20} color="white" />
          </div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#e2f0ff', letterSpacing: '-0.01em' }}>
              Frost<span style={{ color: '#60a5fa' }}>Byte</span>
            </span>
            <div style={{ fontSize: 11, color: '#4a6a8a', lineHeight: 1 }}>Cold Chain Monitor</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#4a6a8a' }}>
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          {activeAlertCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 20,
              padding: '4px 12px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>{activeAlertCount} Alert{activeAlertCount > 1 ? 's' : ''}</span>
            </div>
          )}
          <button
            onClick={refresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(96,165,250,0.1)',
              border: '1px solid rgba(96,165,250,0.2)',
              borderRadius: 8,
              padding: '6px 14px',
              color: '#60a5fa',
              fontSize: 13,
              fontWeight: 500,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: refreshing ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Summary stats */}
        <div style={{ marginBottom: 24 }}>
          <SummaryStats sensors={sensors} alertCount={activeAlertCount} />
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Left column: sensor list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#4a6a8a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Sensors
            </h2>
            {sensors.map(sensor => (
              <SensorCard
                key={sensor.id}
                sensor={sensor}
                selected={sensor.id === selectedId}
                onClick={() => setSelectedId(sensor.id)}
              />
            ))}
          </div>

          {/* Right column: chart + alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TempChart sensor={selectedSensor} history={history[selectedSensor.id] ?? []} />
            <AlertsPanel alerts={alerts} onAcknowledge={acknowledge} />
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
