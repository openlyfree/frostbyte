# ❄️ FrostByte

**FrostByte** is a real-time cold chain monitoring dashboard — built for the FrostByte Hackathon.

Monitor temperature-sensitive assets across your entire supply chain from a single, beautiful interface.

## 🚀 Features

- **Live Temperature Monitoring** — Real-time readings from multiple sensors with animated live indicators
- **24-Hour History Charts** — Interactive line charts showing temperature trends with configurable safe-range overlays
- **Smart Alerts** — Severity-classified alerts (critical / warning / info) with one-click acknowledgement
- **Fleet Overview** — Summary statistics showing average, coldest, and warmest sensor readings
- **Battery & Humidity Tracking** — Monitor sensor health alongside temperature data

## 🛠 Tech Stack

- **React 19 + TypeScript** — Component-based UI with full type safety
- **Vite** — Lightning-fast dev server and build tool
- **Recharts** — Composable charting library for temperature history visualization
- **Lucide React** — Crisp, consistent icon set

## 📦 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗 Build for Production

```bash
npm run build
npm run preview
```

## 📐 Project Structure

```
src/
├── components/
│   ├── SensorCard.tsx     # Individual sensor tile with status, temp, battery
│   ├── TempChart.tsx      # 24-hour recharts line chart with threshold lines
│   ├── AlertsPanel.tsx    # Active & acknowledged alerts list
│   └── SummaryStats.tsx   # Top-row KPI cards
├── data/
│   └── sensors.ts         # Sensor data model, mock readings & alert fixtures
├── App.tsx                # Root layout, state management, auto-refresh
└── main.tsx               # React entry point
```
