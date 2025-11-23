# Conveyor HMI - Next.js 16 Application

## Environment Setup

Create a `.env.local` file in the project root:

```env
# MQTT Configuration
NEXT_PUBLIC_MQTT_BROKER_PROD=wss://broker.iot.hmmitb.com:8884
NEXT_PUBLIC_MQTT_BROKER_DEV=ws://broker.iot.hmmitb.com:1884

# Node Environment
NODE_ENV=development
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Main dashboard page
│   ├── globals.css                # Global styles
│   └── api/                       # API routes (if needed)
├── components/
│   ├── common/
│   │   ├── navbar.tsx
│   │   ├── status-indicator.tsx
│   │   └── mqtt-status.tsx
│   ├── monitoring/
│   │   ├── placing-points-grid.tsx
│   │   ├── digital-twin-2d.tsx
│   │   ├── sensor-status.tsx
│   │   └── relay-status.tsx
│   ├── controls/
│   │   ├── mode-selector.tsx
│   │   ├── speed-control.tsx
│   │   ├── actuator-controls.tsx
│   │   └── conveyor-controls.tsx
│   ├── diagnostics/
│   │   ├── relay-toggle.tsx
│   │   ├── placing-point-modifier.tsx
│   │   └── system-logs.tsx
│   └── ui/                        # shadcn/ui components
├── hooks/
│   ├── use-mqtt.ts
│   ├── use-placing-points.ts
│   ├── use-conveyor-state.ts
│   ├── use-system-state.ts
│   └── use-sensor-data.ts
├── lib/
│   ├── mqtt/
│   │   ├── client.ts
│   │   ├── topics.ts
│   │   └── schemas.ts
│   ├── constants/
│   │   └── config.ts
│   └── utils/
│       └── helpers.ts
├── store/
│   ├── system-store.ts
│   ├── plc-store.ts
│   ├── conveyor-store.ts
│   ├── sensor-store.ts
│   └── actuator-store.ts
└── types/
    └── index.ts
```

## Installation & Deployment

### Local Development

```bash
npm install
npm run dev
```

### Vercel Deployment

1. Push your code to GitHub/GitLab
2. Connect repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_MQTT_BROKER_PROD`
   - `NEXT_PUBLIC_MQTT_BROKER_DEV`
4. Deploy with `npm run build`

### Key Features

- ✅ Real-time MQTT communication
- ✅ 2D SVG-based digital twin
- ✅ Three-tab interface (Monitoring, Controls, Diagnostics)
- ✅ Light/Dark theme with HMI color standards
- ✅ Zustand state management
- ✅ TanStack Query for data syncing
- ✅ TypeScript with strict types (no 'any')
- ✅ Server components where possible
- ✅ Vercel-ready (no Docker)
- ✅ snake_case naming convention

### Important Notes

1. All client components have `'use client'` directive
2. Follow HMI color standards for industrial applications
3. Placing points: O1-O10 (outer), I1-I10 (inner)
4. Relay mapping: R1-R2 (LA1), R3-R4 (LA2), R5-R7 (Sensors), R8-R9 (Motors)
5. MQTT connection with exponential backoff retry
6. All data types are strictly typed - no 'any' types allowed
