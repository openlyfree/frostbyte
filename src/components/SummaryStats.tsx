import { Thermometer, TrendingDown, TrendingUp, AlertOctagon } from 'lucide-react';
import type { Sensor } from '../data/sensors';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <div style={{
      background: 'rgba(7,24,40,0.6)',
      border: `1px solid ${accent}33`,
      borderRadius: 14,
      padding: '18px 20px',
      backdropFilter: 'blur(8px)',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: `${accent}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, color: '#7ea8c8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#4a6a8a', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

interface SummaryStatsProps {
  sensors: Sensor[];
  alertCount: number;
}

export default function SummaryStats({ sensors, alertCount }: SummaryStatsProps) {
  const avgTemp = sensors.reduce((s, x) => s + x.currentTemp, 0) / sensors.length;
  const minSensor = sensors.reduce((a, b) => a.currentTemp < b.currentTemp ? a : b);
  const maxSensor = sensors.reduce((a, b) => a.currentTemp > b.currentTemp ? a : b);

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <StatCard
        label="Avg Temp"
        value={`${avgTemp.toFixed(1)}°C`}
        sub={`${sensors.length} sensors`}
        icon={<Thermometer size={18} color="#60a5fa" />}
        accent="#60a5fa"
      />
      <StatCard
        label="Coldest"
        value={`${minSensor.currentTemp.toFixed(1)}°C`}
        sub={minSensor.name}
        icon={<TrendingDown size={18} color="#818cf8" />}
        accent="#818cf8"
      />
      <StatCard
        label="Warmest"
        value={`${maxSensor.currentTemp.toFixed(1)}°C`}
        sub={maxSensor.name}
        icon={<TrendingUp size={18} color="#f472b6" />}
        accent="#f472b6"
      />
      <StatCard
        label="Active Alerts"
        value={`${alertCount}`}
        sub={alertCount === 0 ? 'All clear' : 'Needs attention'}
        icon={<AlertOctagon size={18} color={alertCount > 0 ? '#f87171' : '#4ade80'} />}
        accent={alertCount > 0 ? '#f87171' : '#4ade80'}
      />
    </div>
  );
}
