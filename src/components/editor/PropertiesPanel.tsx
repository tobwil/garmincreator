'use client';

import { useWatchfaceStore } from '@/lib/store';
import { WIDGET_LABELS } from '@/lib/types';

export function PropertiesPanel() {
  const {
    elements,
    selectedId,
    background,
    updateElement,
    removeElement,
    bringForward,
    sendBackward,
    setBackground,
  } = useWatchfaceStore();

  const el = elements.find((e) => e.id === selectedId);

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: '#111',
        borderLeft: '1px solid #222',
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Properties</span>
        {el && (
          <span style={{ color: '#3b82f6', fontSize: 10 }}>
            {WIDGET_LABELS[el.type]}
          </span>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {!el ? (
          /* Background settings when nothing selected */
          <BackgroundSection bg={background.color} onChange={setBackground} />
        ) : (
          /* Element properties */
          <ElementProperties
            el={el}
            onUpdate={(updates) => updateElement(el.id, updates)}
            onRemove={() => removeElement(el.id)}
            onBringForward={() => bringForward(el.id)}
            onSendBackward={() => sendBackward(el.id)}
          />
        )}
      </div>
    </aside>
  );
}

// ─── Background Settings ──────────────────────────────────────────────────────

function BackgroundSection({
  bg,
  onChange,
}: {
  bg: string;
  onChange: (updates: { color: string }) => void;
}) {
  return (
    <Section label="Background">
      <PropRow label="Color">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={bg}
            onChange={(e) => onChange({ color: e.target.value })}
            style={{
              width: 36,
              height: 28,
              borderRadius: 4,
              border: '1px solid #333',
              cursor: 'pointer',
              padding: 2,
              background: '#1a1a1a',
            }}
          />
          <input
            type="text"
            value={bg}
            onChange={(e) => {
              if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                onChange({ color: e.target.value });
              }
            }}
            style={inputStyle}
          />
        </div>
      </PropRow>
      <div style={{ padding: '8px 16px', fontSize: 11, color: '#444', lineHeight: 1.6 }}>
        Click a widget to edit its properties, or select a template from the toolbar.
      </div>
    </Section>
  );
}

// ─── Element Properties ───────────────────────────────────────────────────────

type ElProps = {
  el: ReturnType<typeof useWatchfaceStore.getState>['elements'][0];
  onUpdate: (updates: Partial<typeof el>) => void;
  onRemove: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
};

function ElementProperties({ el, onUpdate, onRemove, onBringForward, onSendBackward }: ElProps) {
  return (
    <>
      {/* Position */}
      <Section label="Position">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px' }}>
          <LabeledInput label="X" value={el.x} onChange={(v) => onUpdate({ x: v })} />
          <LabeledInput label="Y" value={el.y} onChange={(v) => onUpdate({ y: v })} />
        </div>
      </Section>

      {/* Size */}
      <Section label="Size">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px' }}>
          <LabeledInput label="W" value={el.width} onChange={(v) => onUpdate({ width: v })} />
          <LabeledInput label="H" value={el.height} onChange={(v) => onUpdate({ height: v })} />
        </div>
      </Section>

      {/* Appearance */}
      <Section label="Appearance">
        <PropRow label="Color">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={el.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              style={{
                width: 36,
                height: 28,
                borderRadius: 4,
                border: '1px solid #333',
                cursor: 'pointer',
                padding: 2,
                background: '#1a1a1a',
              }}
            />
            <input
              type="text"
              value={el.color}
              onChange={(e) => {
                if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onUpdate({ color: e.target.value });
              }}
              style={inputStyle}
            />
          </div>
        </PropRow>

        <PropRow label="Font size">
          <input
            type="number"
            value={el.fontSize}
            min={8}
            max={80}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            style={{ ...inputStyle, width: 70 }}
          />
        </PropRow>

        <PropRow label="Font weight">
          <ToggleButton
            options={[
              { label: 'Regular', value: 'normal' },
              { label: 'Bold', value: 'bold' },
            ]}
            value={el.fontWeight}
            onChange={(v) => onUpdate({ fontWeight: v as 'normal' | 'bold' })}
          />
        </PropRow>
      </Section>

      {/* Options */}
      <Section label="Options">
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <CheckRow
            label="Show icon"
            checked={el.showIcon}
            onChange={(v) => onUpdate({ showIcon: v })}
          />
          <CheckRow
            label="Show label"
            checked={el.showLabel}
            onChange={(v) => onUpdate({ showLabel: v })}
          />
          <CheckRow
            label="Show bar"
            checked={el.showBar}
            onChange={(v) => onUpdate({ showBar: v })}
          />
        </div>
      </Section>

      {/* Layer */}
      <Section label="Layer">
        <div style={{ display: 'flex', gap: 8, padding: '0 16px' }}>
          <button onClick={onBringForward} style={{ ...smallBtn, flex: 1 }}>
            Bring Forward
          </button>
          <button onClick={onSendBackward} style={{ ...smallBtn, flex: 1 }}>
            Send Back
          </button>
        </div>
      </Section>

      {/* Delete */}
      <div style={{ padding: '12px 16px' }}>
        <button
          onClick={onRemove}
          style={{
            width: '100%',
            padding: '8px',
            background: 'transparent',
            border: '1px solid #3a1a1a',
            borderRadius: 6,
            color: '#FF4D4D',
            cursor: 'pointer',
            fontSize: 12,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#1a0808';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          Delete Widget
        </button>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          padding: '6px 16px 4px',
          fontSize: 10,
          fontWeight: 600,
          color: '#444',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 16px',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 12, color: '#888', flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, color: '#555' }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={inputStyle}
      />
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        fontSize: 12,
        color: '#999',
        userSelect: 'none',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: '#3b82f6', width: 14, height: 14 }}
      />
      {label}
    </label>
  );
}

function ToggleButton({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '4px 10px',
            fontSize: 11,
            borderRadius: 4,
            border: '1px solid',
            borderColor: value === opt.value ? '#3b82f6' : '#333',
            background: value === opt.value ? 'rgba(59,130,246,0.15)' : 'transparent',
            color: value === opt.value ? '#3b82f6' : '#666',
            cursor: 'pointer',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: 4,
  color: '#ccc',
  padding: '4px 8px',
  fontSize: 12,
  width: '100%',
  outline: 'none',
};

const smallBtn: React.CSSProperties = {
  padding: '5px 8px',
  fontSize: 11,
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: 4,
  color: '#888',
  cursor: 'pointer',
};
