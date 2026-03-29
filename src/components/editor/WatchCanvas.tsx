'use client';

import { useRef, useState, useCallback } from 'react';
import { useWatchfaceStore } from '@/lib/store';
import { WidgetType, WIDGET_DEFAULTS, WATCH_SIZE, WatchElement } from '@/lib/types';
import { WidgetRenderer } from './WidgetRenderer';

const CANVAS_PX = WATCH_SIZE; // 1:1 px mapping

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

interface ResizeState {
  id: string;
  startMouseX: number;
  startMouseY: number;
  startW: number;
  startH: number;
}

function snapVal(v: number, gridSize: number, snap: boolean): number {
  if (!snap || gridSize <= 1) return v;
  return Math.round(v / gridSize) * gridSize;
}

export function WatchCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    elements,
    selectedIds,
    background,
    snapToGrid,
    gridSize,
    selectElement,
    updateElement,
    addElement,
  } = useWatchfaceStore();

  const [drag, setDrag] = useState<DragState | null>(null);
  const [resize, setResize] = useState<ResizeState | null>(null);

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // ── Background CSS ───────────────────────────────────────────────────────
  const bgStyle = background.type === 'gradient'
    ? `linear-gradient(${background.angle ?? 135}deg, ${background.color}, ${background.colorEnd ?? '#333333'})`
    : background.color;

  // ── Drop from widget panel ───────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('widgetType') as WidgetType;
      if (!type || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const defaults = WIDGET_DEFAULTS[type];
      const rawX = e.clientX - rect.left - defaults.width / 2;
      const rawY = e.clientY - rect.top - defaults.height / 2;
      addElement(
        type,
        snapVal(Math.max(0, Math.round(rawX)), gridSize, snapToGrid),
        snapVal(Math.max(0, Math.round(rawY)), gridSize, snapToGrid),
      );
    },
    [addElement, gridSize, snapToGrid]
  );

  // ── Element drag ─────────────────────────────────────────────────────────
  const handleElementPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      const el = elements.find((el) => el.id === id);
      if (!el || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDrag({
        id,
        offsetX: e.clientX - rect.left - el.x,
        offsetY: e.clientY - rect.top - el.y,
      });
      selectElement(id, e.shiftKey);
    },
    [elements, selectElement]
  );

  const handleElementPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left - drag.offsetX;
      const rawY = e.clientY - rect.top - drag.offsetY;
      updateElement(drag.id, {
        x: snapVal(Math.round(Math.max(0, Math.min(CANVAS_PX, rawX))), gridSize, snapToGrid),
        y: snapVal(Math.round(Math.max(0, Math.min(CANVAS_PX, rawY))), gridSize, snapToGrid),
      });
    },
    [drag, updateElement, gridSize, snapToGrid]
  );

  const handleElementPointerUp = useCallback(() => {
    setDrag(null);
  }, []);

  // ── Resize handle ────────────────────────────────────────────────────────
  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, el: WatchElement) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setResize({
        id: el.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startW: el.width,
        startH: el.height,
      });
    },
    []
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resize) return;
      const dx = e.clientX - resize.startMouseX;
      const dy = e.clientY - resize.startMouseY;
      updateElement(resize.id, {
        width: snapVal(Math.max(20, Math.round(resize.startW + dx)), gridSize, snapToGrid),
        height: snapVal(Math.max(16, Math.round(resize.startH + dy)), gridSize, snapToGrid),
      });
    },
    [resize, updateElement, gridSize, snapToGrid]
  );

  const handleResizePointerUp = useCallback(() => {
    setResize(null);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4" style={{ background: '#0d0d0d' }}>
      {/* Watch bezel */}
      <div
        style={{
          borderRadius: '50%',
          padding: 6,
          background: 'linear-gradient(145deg, #2a2a2a, #111)',
          boxShadow:
            '0 0 0 1px #3a3a3a, inset 0 1px 1px rgba(255,255,255,0.05), 0 30px 80px rgba(0,0,0,0.9)',
        }}
      >
        {/* Watch screen */}
        <div
          ref={containerRef}
          style={{
            width: CANVAS_PX,
            height: CANVAS_PX,
            borderRadius: '50%',
            background: bgStyle,
            position: 'relative',
            overflow: 'hidden',
            cursor: drag ? 'grabbing' : 'default',
            userSelect: 'none',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => selectElement(null)}
        >
          {/* Snap-to-grid overlay */}
          {snapToGrid && (
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: 0.12,
              }}
            >
              <defs>
                <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                  <circle cx={gridSize / 2} cy={gridSize / 2} r={0.8} fill="#888" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* Elements */}
          {sortedElements.map((el) => {
            const isSelected = selectedIds.includes(el.id);
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  cursor: drag?.id === el.id ? 'grabbing' : 'grab',
                  outline: isSelected
                    ? '1.5px solid rgba(59,130,246,0.9)'
                    : '1px solid transparent',
                  outlineOffset: 1,
                  borderRadius: 2,
                  touchAction: 'none',
                }}
                onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                onPointerMove={handleElementPointerMove}
                onPointerUp={handleElementPointerUp}
                onClick={(e) => e.stopPropagation()}
              >
                <WidgetRenderer element={el} />

                {/* Resize handle (SE corner) */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      right: -4,
                      bottom: -4,
                      width: 10,
                      height: 10,
                      background: '#3b82f6',
                      borderRadius: 2,
                      cursor: 'se-resize',
                      touchAction: 'none',
                    }}
                    onPointerDown={(e) => handleResizePointerDown(e, el)}
                    onPointerMove={handleResizePointerMove}
                    onPointerUp={handleResizePointerUp}
                  />
                )}
              </div>
            );
          })}

          {/* Empty state hint */}
          {elements.length === 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333',
                pointerEvents: 'none',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 40 }}>⌚</div>
              <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 180, lineHeight: 1.5 }}>
                Drag widgets from the left panel
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resolution label */}
      <div style={{ fontSize: 11, color: '#444', letterSpacing: '0.1em' }}>
        454 × 454 px · AMOLED
        {snapToGrid && (
          <span style={{ marginLeft: 8, color: '#3b82f6' }}>· Grid {gridSize}px</span>
        )}
      </div>
    </div>
  );
}
