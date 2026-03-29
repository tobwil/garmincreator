'use client';

import { WatchElement, SIMULATED_DATA } from '@/lib/types';

interface Props {
  element: WatchElement;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fontStyle(el: WatchElement, defaultFamily?: string): React.CSSProperties {
  return {
    fontFamily: el.fontFamily || defaultFamily || 'inherit',
    fontSize: el.fontSize,
    fontWeight: el.fontWeight,
    color: el.color,
  };
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
        ...fontStyle(el, "'Courier New', 'SF Mono', monospace"),
        letterSpacing: '0.05em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {SIMULATED_DATA.time}
    </div>
  );
}

function TimeAnalog({ el }: { el: WatchElement }) {
  const cx = el.width / 2;
  const cy = el.height / 2;
  const r = Math.min(cx, cy) - 4;

  const h = SIMULATED_DATA.timeH % 12;
  const m = SIMULATED_DATA.timeM;
  const s = SIMULATED_DATA.timeS;

  const hourAngle = ((h + m / 60) / 12) * 2 * Math.PI - Math.PI / 2;
  const minAngle = ((m + s / 60) / 60) * 2 * Math.PI - Math.PI / 2;
  const secAngle = (s / 60) * 2 * Math.PI - Math.PI / 2;

  const handEnd = (angle: number, len: number) => ({
    x: cx + Math.cos(angle) * len,
    y: cy + Math.sin(angle) * len,
  });

  const hourEnd = handEnd(hourAngle, r * 0.55);
  const minEnd = handEnd(minAngle, r * 0.78);
  const secEnd = handEnd(secAngle, r * 0.85);

  // Tick marks
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const isHour = true;
    const outer = r;
    const inner = r - (isHour ? 8 : 5);
    return {
      x1: cx + Math.cos(a) * inner,
      y1: cy + Math.sin(a) * inner,
      x2: cx + Math.cos(a) * outer,
      y2: cy + Math.sin(a) * outer,
    };
  });

  const accentColor = el.color;
  const dimColor = '#444';

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg width={el.width} height={el.height}>
        {/* Face ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={dimColor} strokeWidth={1.5} />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={i % 3 === 0 ? accentColor : dimColor}
            strokeWidth={i % 3 === 0 ? 2 : 1}
          />
        ))}

        {/* Hour hand */}
        <line
          x1={cx} y1={cy}
          x2={hourEnd.x} y2={hourEnd.y}
          stroke={accentColor} strokeWidth={3} strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1={cx} y1={cy}
          x2={minEnd.x} y2={minEnd.y}
          stroke={accentColor} strokeWidth={2} strokeLinecap="round"
        />

        {/* Second hand */}
        <line
          x1={cx} y1={cy}
          x2={secEnd.x} y2={secEnd.y}
          stroke="#FF4D4D" strokeWidth={1} strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={accentColor} />
        <circle cx={cx} cy={cy} r={1.5} fill="#FF4D4D" />
      </svg>
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
        ...fontStyle(el),
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
        ...fontStyle(el),
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

function HrChart({ el }: { el: WatchElement }) {
  const data = SIMULATED_DATA.hrHistory;
  const w = el.width;
  const h = el.height;
  const chartH = el.showLabel ? h - 16 : h;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = chartH - ((v - min) / range) * (chartH - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  // Area fill path
  const fillPts = [
    `0,${chartH}`,
    ...data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = chartH - ((v - min) / range) * (chartH - 8) - 4;
      return `${x},${y}`;
    }),
    `${w},${chartH}`,
  ].join(' ');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={w} height={chartH} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`hrGrad-${el.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={el.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={el.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill={`url(#hrGrad-${el.id})`} />
        <polyline points={pts} fill="none" stroke={el.color} strokeWidth={1.5} strokeLinejoin="round" />
        {/* Current HR dot */}
        {(() => {
          const last = data[data.length - 1];
          const lx = w;
          const ly = chartH - ((last - min) / range) * (chartH - 8) - 4;
          return <circle cx={lx} cy={ly} r={3} fill={el.color} />;
        })()}
      </svg>
      {el.showLabel && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          color: '#555',
          padding: '0 2px',
        }}>
          <span>24H HR</span>
          <span style={{ color: el.color }}>{SIMULATED_DATA.heartRate} bpm</span>
        </div>
      )}
    </div>
  );
}

function Steps({ el }: { el: WatchElement }) {
  const pct = SIMULATED_DATA.steps / SIMULATED_DATA.stepsGoal;
  const barH = 4;

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
        <span style={{ ...fontStyle(el) }}>
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

function StepsChart({ el }: { el: WatchElement }) {
  const data = SIMULATED_DATA.stepsHistory;
  const w = el.width;
  const h = el.height;
  const chartH = el.showLabel ? h - 16 : h - 4;
  const maxVal = Math.max(...data, 1);
  const barCount = data.length;
  const gap = 3;
  const barW = (w - gap * (barCount - 1)) / barCount;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={w} height={chartH} style={{ display: 'block' }}>
        {data.map((v, i) => {
          const barH2 = Math.max(2, (v / maxVal) * (chartH - 4));
          const x = i * (barW + gap);
          const y = chartH - barH2;
          const isToday = i === data.length - 1;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={barH2}
              rx={2}
              fill={isToday ? el.color : `${el.color}55`}
            />
          );
        })}
        {/* Goal line */}
        {(() => {
          const goalY = chartH - (SIMULATED_DATA.stepsGoal / maxVal) * (chartH - 4);
          return goalY > 0 ? (
            <line x1={0} y1={goalY} x2={w} y2={goalY}
              stroke={el.color} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5}
            />
          ) : null;
        })()}
      </svg>
      {el.showLabel && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          color: '#555',
          padding: '0 2px',
        }}>
          <span>7-DAY STEPS</span>
          <span style={{ color: el.color }}>{SIMULATED_DATA.steps.toLocaleString()}</span>
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
      <span style={{ fontWeight: el.fontWeight, fontFamily: el.fontFamily || 'inherit' }}>{pct}%</span>
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
      <span style={{ fontWeight: el.fontWeight, fontFamily: el.fontFamily || 'inherit' }}>{count}</span>
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
        <span style={{ ...fontStyle(el) }}>
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
      <span style={{ ...fontStyle(el) }}>
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
      <span style={{ ...fontStyle(el) }}>
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
      <span style={{ fontWeight: el.fontWeight, fontFamily: el.fontFamily || 'inherit' }}>{SIMULATED_DATA.alarm}</span>
    </div>
  );
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function WidgetRenderer({ element: el }: Props) {
  switch (el.type) {
    case 'time_digital':   return <TimeDigital el={el} />;
    case 'time_analog':    return <TimeAnalog el={el} />;
    case 'date':           return <DateWidget el={el} />;
    case 'heart_rate':     return <HeartRate el={el} />;
    case 'hr_chart':       return <HrChart el={el} />;
    case 'steps':          return <Steps el={el} />;
    case 'steps_chart':    return <StepsChart el={el} />;
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
