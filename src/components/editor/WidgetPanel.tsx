'use client';

import { useWatchfaceStore } from '@/lib/store';
import {
  WidgetType,
  WIDGET_LABELS,
  WIDGET_ICONS,
  WIDGET_CATEGORIES,
} from '@/lib/types';

export function WidgetPanel() {
  const { addElement } = useWatchfaceStore();

  const handleDragStart = (e: React.DragEvent, type: WidgetType) => {
    e.dataTransfer.setData('widgetType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = (type: WidgetType) => {
    addElement(type);
  };

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: '#111',
        borderRight: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid #222',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: '#555',
          textTransform: 'uppercase',
        }}
      >
        Widgets
      </div>

      {/* Widget list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {WIDGET_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            {/* Category label */}
            <div
              style={{
                padding: '8px 16px 4px',
                fontSize: 10,
                fontWeight: 600,
                color: '#444',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {cat.name}
            </div>

            {/* Widget items */}
            {cat.types.map((type) => (
              <WidgetItem
                key={type}
                type={type}
                onDragStart={handleDragStart}
                onClick={handleClick}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid #1a1a1a',
          fontSize: 10,
          color: '#333',
          lineHeight: 1.5,
        }}
      >
        Drag widgets onto the watch, or click to add at center.
      </div>
    </aside>
  );
}

function WidgetItem({
  type,
  onDragStart,
  onClick,
}: {
  type: WidgetType;
  onDragStart: (e: React.DragEvent, type: WidgetType) => void;
  onClick: (type: WidgetType) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      onClick={() => onClick(type)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 16px',
        cursor: 'grab',
        fontSize: 13,
        color: '#ccc',
        transition: 'background 0.1s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = '#1a1a1a';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <span
        style={{
          fontSize: 16,
          width: 24,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {WIDGET_ICONS[type]}
      </span>
      <span>{WIDGET_LABELS[type]}</span>
    </div>
  );
}
