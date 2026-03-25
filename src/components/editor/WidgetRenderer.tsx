'use client';

import { WatchElement, SIMULATED_DATA, WATCH_SIZE } from '@/lib/types';

interface Props {
  element: WatchElement;
}

// ─── Individual widget visual renderers ───────────────────────────────────────

function TimeDigital({ el }: { el: WatchElement }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: el.color,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        fontFamily: "'Courier New', 'SF Mono', monospace",
        letterSpacing: '0.05em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {SIMULATED_DATA.time}
    </div>
  );
}

function DateWidget({ el }: { el: WatchElement }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: el.color,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}
    >
      {SIMULATED_DATA.dateShort}
    </div>
  );
}

function HeartRate({ el }: { el: WatchElement }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: el.showIcon ? 'flex-start' : 'center',
        gap: 6,
        color: el.color,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        padding: el.showIcon ? '0 8px' : '0',
      }}
    >
      {el.showIcon && (
        <span style={{ fontSize: el.fontSize * 0.6, lineHeight: 1 }}>♥</span>
      )}
      <span>{SIMULATED_DATA.heartRate}</span>
    </div>
  );
}

function Steps({ el }: { el: WatchElement }) {
  const pct = SIMULATED_DATA.steps / SIMULATED_DATA.stepsGoal;
  const barH = 4;
  const barY = el.height - barH - 2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: el.color,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {el.showIcon && (
          <span style={{ fontSize: el.fontSize * 0.5 }}>👟</span>
        )}
        <span style={{ fontSize: el.fontSize, fontWeight: el.fontWeight }}>
          {SIMULATED_DATA.steps.toLocaleString()}
        </span>
      </div>
      {el.showLabel && (
        <div style={{ fontSize: 10, color: '#666', letterSpacing: '0.1em' }}>
          STEPS
        </div>
      )}
      {el.showBar && (
        <div
          style={{
            position: 'absolute',
            bottom: 2,
            left: 0,
            right: 0,
            height: barH,
            background: '#333',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, pct * 100)}%`,
              height: '100%',
              background: el.color,
              borderRadius: 2,
            }}
          />
        </div>
      )}
    </div>
  );
}

function Battery({ el }: { el: WatchElement }) {
  const pct = SIMULATED_DATA.battery;
  const battColor = pct > 20 ? el.color : '#FF4444';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: el.showIcon ? 'flex-start' : 'center',
        gap: 6,
        padding: el.showIcon ? '0 6px' : '0',
        color: battColor,
        fontSize: el.fontSize,
      }}
    >
      {el.showIcon && (
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
          <rect x="0.5" y="0.5" width="18" height="13" rx="1.5" stroke={battColor} />
          <rect x="18.5" y="3.5" width="3" height="7" rx="1" fill={battColor} />
          <rect x="1.5" y="1.5" width={Math.round((pct / 100) * 16)} height="11" rx="1" fill={battColor} />
        </svg>
      )}
      <span style={{ fontWeight: el.fontWeight }}>{pct}%</span>
    </div>
  );
}

function Bluetooth({ el }: { el: WatchElement }) {
  const connected = SIMULATED_DATA.bluetooth;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
        <path
          d="M2 5L12 16L7 21V1L12 6L2 16"
          stroke={connected ? el.color : '#444'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Notifications({ el }: { el: WatchElement }) {
  const count = SIMULATED_DATA.notifications;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        color: count > 0 ? el.color : '#444',
        fontSize: el.fontSize,
      }}
    >
      <span style={{ fontSize: el.fontSize * 0.7 }}>🔔</span>
      <span style={{ fontWeight: el.fontWeight }}>{count}</span>
    </div>
  );
}

function BodyBattery({ el }: { el: WatchElement }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: el.color,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {el.showIcon && <span style={{ fontSize: el.fontSize * 0.6 }}>⚡</span>}
        <span style={{ fontSize: el.fontSize, fontWeight: el.fontWeight }}>
          {SIMULATED_DATA.bodyBattery}
        </span>
      </div>
      {el.showLabel && (
        <div style={{ fontSize: 10, color: '#666', letterSpacing: '0.1em' }}>
          BODY BAT
        </div>
      )}
    </div>
  );
}

function Vo2Max({ el }: { el: WatchElement }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: el.color,
      }}
    >
      <span style={{ fontSize: el.fontSize, fontWeight: el.fontWeight }}>
        {SIMULATED_DATA.vo2max}
      </span>
      {el.showLabel && (
        <div style={{ fontSize: 10, color: '#666', letterSpacing: '0.1em' }}>
          VO2 MAX
        </div>
      )}
    </div>
  );
}

function Distance({ el }: { el: WatchElement }) {
  const pct = SIMULATED_DATA.distanceKm / SIMULATED_DATA.distanceGoal;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: el.color,
        position: 'relative',
      }}
    >
      <span style={{ fontSize: el.fontSize, fontWeight: el.fontWeight }}>
        {SIMULATED_DATA.distanceKm.toFixed(1)} km
      </span>
      {el.showLabel && (
        <div style={{ fontSize: 10, color: '#666', letterSpacing: '0.1em' }}>
          DISTANCE
        </div>
      )}
      {el.showBar && (
        <div
          style={{
            position: 'absolute',
            bottom: 2,
            left: 0,
            right: 0,
            height: 4,
            background: '#333',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, pct * 100)}%`,
              height: '100%',
              background: el.color,
              borderRadius: 2,
            }}
          />
        </div>
      )}
    </div>
  );
}

function Alarm({ el }: { el: WatchElement }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        color: el.color,
        fontSize: el.fontSize,
      }}
    >
      {el.showIcon && <span style={{ fontSize: el.fontSize * 0.8 }}>⏰</span>}
      <span style={{ fontWeight: el.fontWeight }}>{SIMULATED_DATA.alarm}</span>
    </div>
  );
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function WidgetRenderer({ element: el }: Props) {
  switch (el.type) {
    case 'time_digital':   return <TimeDigital el={el} />;
    case 'date':           return <DateWidget el={el} />;
    case 'heart_rate':     return <HeartRate el={el} />;
    case 'steps':          return <Steps el={el} />;
    case 'battery':        return <Battery el={el} />;
    case 'bluetooth':      return <Bluetooth el={el} />;
    case 'notifications':  return <Notifications el={el} />;
    case 'body_battery':   return <BodyBattery el={el} />;
    case 'vo2max':         return <Vo2Max el={el} />;
    case 'distance':       return <Distance el={el} />;
    case 'alarm':          return <Alarm el={el} />;
    default:               return null;
  }
}
