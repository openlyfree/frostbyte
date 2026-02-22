export interface Sensor {
  id: string;
  name: string;
  location: string;
  currentTemp: number;
  minTemp: number;
  maxTemp: number;
  targetMin: number;
  targetMax: number;
  humidity: number;
  battery: number;
  status: 'ok' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface TemperatureReading {
  time: string;
  temp: number;
  humidity: number;
}

export interface Alert {
  id: string;
  sensorId: string;
  sensorName: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
}

export const initialSensors: Sensor[] = [
  {
    id: 's1',
    name: 'Freezer Unit A',
    location: 'Warehouse North',
    currentTemp: -18.2,
    minTemp: -22.5,
    maxTemp: -14.1,
    targetMin: -25,
    targetMax: -15,
    humidity: 45,
    battery: 87,
    status: 'ok',
    lastUpdated: new Date(),
  },
  {
    id: 's2',
    name: 'Cold Room B',
    location: 'Warehouse South',
    currentTemp: 3.8,
    minTemp: 1.2,
    maxTemp: 7.9,
    targetMin: 0,
    targetMax: 8,
    humidity: 72,
    battery: 62,
    status: 'ok',
    lastUpdated: new Date(),
  },
  {
    id: 's3',
    name: 'Deep Freeze C',
    location: 'Processing Plant',
    currentTemp: -28.4,
    minTemp: -31.0,
    maxTemp: -25.2,
    targetMin: -30,
    targetMax: -20,
    humidity: 38,
    battery: 23,
    status: 'warning',
    lastUpdated: new Date(),
  },
  {
    id: 's4',
    name: 'Chiller D',
    location: 'Retail Floor',
    currentTemp: 9.1,
    minTemp: 3.5,
    maxTemp: 11.0,
    targetMin: 2,
    targetMax: 8,
    humidity: 68,
    battery: 95,
    status: 'critical',
    lastUpdated: new Date(),
  },
];

function generateHistory(baseTemp: number, hours = 24): TemperatureReading[] {
  const readings: TemperatureReading[] = [];
  let temp = baseTemp;
  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    temp += (Math.random() - 0.5) * 1.5;
    readings.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(temp * 10) / 10,
      humidity: Math.round(45 + Math.random() * 30),
    });
  }
  return readings;
}

export const sensorHistory: Record<string, TemperatureReading[]> = {
  s1: generateHistory(-18),
  s2: generateHistory(4),
  s3: generateHistory(-28),
  s4: generateHistory(8),
};

export const initialAlerts: Alert[] = [
  {
    id: 'a1',
    sensorId: 's4',
    sensorName: 'Chiller D',
    message: 'Temperature exceeded upper threshold (9.1°C > 8°C)',
    severity: 'critical',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    acknowledged: false,
  },
  {
    id: 'a2',
    sensorId: 's3',
    sensorName: 'Deep Freeze C',
    message: 'Battery level low (23% remaining)',
    severity: 'warning',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    acknowledged: false,
  },
  {
    id: 'a3',
    sensorId: 's2',
    sensorName: 'Cold Room B',
    message: 'Humidity spike detected (72%)',
    severity: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    acknowledged: true,
  },
];
