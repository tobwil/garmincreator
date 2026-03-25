'use client';

import { useEffect } from 'react';
import { useWatchfaceStore } from '@/lib/store';
import { Toolbar } from './Toolbar';
import { WidgetPanel } from './WidgetPanel';
import { WatchCanvas } from './WatchCanvas';
import { PropertiesPanel } from './PropertiesPanel';

export function Editor() {
  const { undo, redo, removeElement, selectedId } = useWatchfaceStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeElement(selectedId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, removeElement, selectedId]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#0a0a0a',
      }}
    >
      <Toolbar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <WidgetPanel />

        {/* Canvas area */}
        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <WatchCanvas />
        </main>

        <PropertiesPanel />
      </div>
    </div>
  );
}
