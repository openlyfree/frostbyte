import { Thermometer, Droplets, Battery, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Sensor } from '../data/sensors';

interface SensorCardProps {
  sensor: Sensor;
  selected: boolean;
  onClick: () => void;
}

function getBatteryColor(pct: number) {
  if (pct > 50) return '#4ade80';
  if (pct > 20) return '#facc15';
  return '#f87171';
}

function getStatusIcon(status: Sensor['status']) {
  if (status === 'ok') return <CheckCircle size={16} color="#4ade80" />;
  if (status === 'warning') return <AlertTriangle size={16} color="#facc15" />;
  return <XCircle size={16} color="#f87171" />;
}

function getStatusBorder(status: Sensor['status']) {
  if (status === 'ok') return '1px solid rgba(74,222,128,0.3)';
  if (status === 'warning') return '1px solid rgba(250,204,21,0.4)';
  return '1px solid rgba(248,113,113,0.5)';
}

export default function SensorCard({ sensor, selected, onClick }: SensorCardProps) {
  const tempRange = sensor.maxTemp - sensor.minTemp;
  const pct = Math.min(100, Math.max(0, ((sensor.currentTemp - sensor.minTemp) / (tempRange || 1)) * 100));

  return (
    <div
      onClick={onClick}
      style={{
        background: selected
          ? 'linear-gradient(135deg, rgba(30,74,110,0.6), rgba(6,42,70,0.8))'
          : 'rgba(7,24,40,0.6)',
        border: selected ? '1px solid rgba(96,165,250,0.6)' : getStatusBorder(sensor.status),
        borderRadius: 16,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        backdropFilter: 'blur(8px)',
        boxShadow: selected ? '0 0 20px rgba(96,165,250,0.15)' : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            {getStatusIcon(sensor.status)}
            <span style={{ fontWeight: 600, fontSize: 15, color: '#e2f0ff' }}>{sensor.name}</span>
          </div>
          <span style={{ fontSize: 12, color: '#7ea8c8' }}>{sensor.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Wifi size={12} color="#4ade80" />
          <span style={{ fontSize: 11, color: '#4ade80' }}>LIVE</span>
        </div>
      </div>

      {/* Temperature */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
        <Thermometer size={28} color="#60a5fa" />
        <span style={{
          fontSize: 36,
          fontWeight: 700,
          color: sensor.status === 'critical' ? '#f87171' : sensor.status === 'warning' ? '#facc15' : '#60a5fa',
          lineHeight: 1,
        }}>
          {sensor.currentTemp.toFixed(1)}
        </span>
        <span style={{ fontSize: 18, color: '#7ea8c8', lineHeight: 1.5 }}>°C</span>
      </div>

      {/* Temp range bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7ea8c8', marginBottom: 4 }}>
          <span>Min {sensor.minTemp.toFixed(1)}°C</span>
          <span>Max {sensor.maxTemp.toFixed(1)}°C</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 3,
            background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Droplets size={14} color="#7ea8c8" />
          <span style={{ fontSize: 13, color: '#7ea8c8' }}>{sensor.humidity}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Battery size={14} color={getBatteryColor(sensor.battery)} />
          <span style={{ fontSize: 13, color: getBatteryColor(sensor.battery) }}>{sensor.battery}%</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a6a8a' }}>
          Target: {sensor.targetMin}–{sensor.targetMax}°C
        </div>
      </div>
    </div>
  );
}
