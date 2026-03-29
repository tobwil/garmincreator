'use client';

import { useState } from 'react';
import { useWatchfaceStore } from '@/lib/store';
import { DEVICES, DeviceId } from '@/lib/types';
import { TEMPLATES, TEMPLATE_DESCRIPTIONS } from '@/data/watchfaceTemplates';
import { exportAsConnectIQ, exportAsJSON, importFromJSON } from '@/lib/export';

export function Toolbar() {
  const {
    name,
    device,
    elements,
    past,
    future,
    snapToGrid,
    gridSize,
    setName,
    setDevice,
    undo,
    redo,
    loadTemplate,
    getLayout,
    toggleSnapToGrid,
    setGridSize,
  } = useWatchfaceStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportConnectIQ = async () => {
    setExporting(true);
    try {
      await exportAsConnectIQ(getLayout());
    } finally {
      setExporting(false);
      setShowExport(false);
    }
  };

  const handleExportJSON = () => {
    exportAsJSON(getLayout());
    setShowExport(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const layout = await importFromJSON(file);
      loadTemplate(layout);
    };
    input.click();
  };

  return (
    <header
      style={{
        height: 48,
        background: '#0f0f0f',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* App logo */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#3b82f6',
          letterSpacing: '0.05em',
          marginRight: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 16 }}>⌚</span>
        Garmin Creator
      </div>

      <Divider />

      {/* Watchface name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid #333',
          color: '#e0e0e0',
          fontSize: 13,
          padding: '2px 4px',
          width: 160,
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderBottomColor = '#3b82f6';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderBottomColor = '#333';
        }}
      />

      <Divider />

      {/* Device selector */}
      <select
        value={device}
        onChange={(e) => setDevice(e.target.value as DeviceId)}
        style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: 4,
          color: '#aaa',
          fontSize: 12,
          padding: '4px 8px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {Object.values(DEVICES).map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <Divider />

      {/* Templates */}
      <div style={{ position: 'relative' }}>
        <ToolbarButton
          onClick={() => {
            setShowTemplates((v) => !v);
            setShowExport(false);
          }}
          active={showTemplates}
        >
          Templates
        </ToolbarButton>

        {showTemplates && (
          <Dropdown onClose={() => setShowTemplates(false)}>
            {TEMPLATES.map((tpl) => (
              <DropdownItem
                key={tpl.id}
                onClick={() => {
                  loadTemplate(tpl);
                  setShowTemplates(false);
                }}
              >
                <div style={{ fontWeight: 500, color: '#ddd' }}>{tpl.name}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                  {TEMPLATE_DESCRIPTIONS[tpl.id!]}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </div>

      {/* Undo / Redo */}
      <ToolbarButton onClick={undo} disabled={past.length === 0} title="Undo (Ctrl+Z)">
        ↩
      </ToolbarButton>
      <ToolbarButton onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y)">
        ↪
      </ToolbarButton>

      <Divider />

      {/* Snap to grid */}
      <ToolbarButton
        onClick={toggleSnapToGrid}
        active={snapToGrid}
        title="Snap to grid"
      >
        ⊞ Snap
      </ToolbarButton>

      {snapToGrid && (
        <select
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          title="Grid size"
          style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: 4,
            color: '#aaa',
            fontSize: 11,
            padding: '3px 6px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value={4}>4 px</option>
          <option value={8}>8 px</option>
          <option value={16}>16 px</option>
          <option value={32}>32 px</option>
        </select>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Element count */}
      <div style={{ fontSize: 11, color: '#444', marginRight: 4 }}>
        {elements.length} widget{elements.length !== 1 ? 's' : ''}
      </div>

      {/* Import */}
      <ToolbarButton onClick={handleImport}>Import JSON</ToolbarButton>

      <Divider />

      {/* Export */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowExport((v) => !v);
            setShowTemplates(false);
          }}
          style={{
            padding: '6px 14px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: 5,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6';
          }}
        >
          Export ▾
        </button>

        {showExport && (
          <Dropdown onClose={() => setShowExport(false)} right>
            <DropdownItem onClick={handleExportConnectIQ}>
              <div style={{ fontWeight: 500, color: '#ddd' }}>
                {exporting ? 'Generating…' : '⬇ Connect IQ Project (.zip)'}
              </div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                Monkey C source code, ready to compile
              </div>
            </DropdownItem>
            <DropdownItem onClick={handleExportJSON}>
              <div style={{ fontWeight: 500, color: '#ddd' }}>⬇ Layout JSON</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                Save design to reimport later
              </div>
            </DropdownItem>
          </Dropdown>
        )}
      </div>
    </header>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
  return (
    <div
      style={{ width: 1, height: 20, background: '#222', margin: '0 4px', flexShrink: 0 }}
    />
  );
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '5px 10px',
        background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
        border: '1px solid',
        borderColor: active ? '#3b82f6' : 'transparent',
        borderRadius: 4,
        color: disabled ? '#333' : active ? '#3b82f6' : '#888',
        fontSize: 12,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.color = '#ccc';
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.color = active ? '#3b82f6' : '#888';
      }}
    >
      {children}
    </button>
  );
}

function Dropdown({
  children,
  onClose,
  right,
}: {
  children: React.ReactNode;
  onClose: () => void;
  right?: boolean;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 200 }}
        onClick={onClose}
      />
      {/* Menu */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          [right ? 'right' : 'left']: 0,
          zIndex: 201,
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          minWidth: 240,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </>
  );
}

function DropdownItem({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 14px',
        cursor: 'pointer',
        borderBottom: '1px solid #222',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = '#222';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      {children}
    </div>
  );
}
