import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { Sensor, TemperatureReading } from '../data/sensors';

interface TempChartProps {
  sensor: Sensor;
  history: TemperatureReading[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(5,20,35,0.95)',
      border: '1px solid rgba(96,165,250,0.3)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 13,
    }}>
      <div style={{ color: '#7ea8c8', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#60a5fa', fontWeight: 600 }}>{payload[0].value.toFixed(1)}°C</div>
    </div>
  );
}

export default function TempChart({ sensor, history }: TempChartProps) {
  const step = Math.ceil(history.length / 8);
  const ticks = history.filter((_, i) => i % step === 0).map(r => r.time);
  const temps = history.map(r => r.temp);
  const minY = Math.min(...temps, sensor.targetMin) - 2;
  const maxY = Math.max(...temps, sensor.targetMax) + 2;

  return (
    <div style={{
      background: 'rgba(7,24,40,0.6)',
      border: '1px solid rgba(30,74,110,0.4)',
      borderRadius: 16,
      padding: '20px',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e2f0ff', marginBottom: 4 }}>
          Temperature History — {sensor.name}
        </h3>
        <span style={{ fontSize: 12, color: '#7ea8c8' }}>Last 24 hours</span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 2, background: '#60a5fa' }} />
          <span style={{ fontSize: 12, color: '#7ea8c8' }}>Temperature</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 2, background: 'rgba(250,204,21,0.6)', borderTop: '2px dashed rgba(250,204,21,0.6)' }} />
          <span style={{ fontSize: 12, color: '#7ea8c8' }}>Safe range</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="time"
            ticks={ticks}
            tick={{ fill: '#4a6a8a', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            domain={[minY, maxY]}
            tick={{ fill: '#4a6a8a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}°`}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={sensor.targetMax}
            stroke="rgba(250,204,21,0.5)"
            strokeDasharray="4 3"
            label={{ value: 'Max', fill: '#facc15', fontSize: 11, position: 'right' }}
          />
          <ReferenceLine
            y={sensor.targetMin}
            stroke="rgba(250,204,21,0.5)"
            strokeDasharray="4 3"
            label={{ value: 'Min', fill: '#facc15', fontSize: 11, position: 'right' }}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#60a5fa' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
