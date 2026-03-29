'use client';

import { create } from 'zustand';
import {
  WatchElement,
  WatchfaceLayout,
  BackgroundConfig,
  DeviceId,
  WidgetType,
  WIDGET_DEFAULTS,
  WATCH_SIZE,
} from './types';

function genId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function snapValue(v: number, gridSize: number, snap: boolean): number {
  if (!snap || gridSize <= 1) return v;
  return Math.round(v / gridSize) * gridSize;
}

interface WatchfaceStore {
  // ── State ──────────────────────────────────────────────────────────────────
  name: string;
  device: DeviceId;
  background: BackgroundConfig;
  elements: WatchElement[];
  selectedIds: string[];
  past: WatchElement[][];
  future: WatchElement[][];
  snapToGrid: boolean;
  gridSize: number;
  clipboard: WatchElement[] | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  setName: (name: string) => void;
  setDevice: (device: DeviceId) => void;
  setBackground: (bg: Partial<BackgroundConfig>) => void;
  addElement: (type: WidgetType, x?: number, y?: number) => void;
  updateElement: (id: string, updates: Partial<WatchElement>) => void;
  removeElement: (id: string) => void;
  removeSelected: () => void;
  selectElement: (id: string | null, addToSelection?: boolean) => void;
  clearSelection: () => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  loadTemplate: (layout: WatchfaceLayout) => void;
  undo: () => void;
  redo: () => void;
  getLayout: () => WatchfaceLayout;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  copySelected: () => void;
  paste: () => void;
}

export const useWatchfaceStore = create<WatchfaceStore>((set, get) => ({
  // ── Initial State ──────────────────────────────────────────────────────────
  name: 'My Watchface',
  device: 'forerunner970',
  background: { type: 'solid', color: '#000000' },
  elements: [],
  selectedIds: [],
  past: [],
  future: [],
  snapToGrid: false,
  gridSize: 8,
  clipboard: null,

  // ── Setters ────────────────────────────────────────────────────────────────
  setName: (name) => set({ name }),
  setDevice: (device) => set({ device }),
  setBackground: (bg) =>
    set((state) => ({ background: { ...state.background, ...bg } })),

  // ── Element Actions ────────────────────────────────────────────────────────
  addElement: (type, x, y) => {
    const defaults = WIDGET_DEFAULTS[type];
    const { snapToGrid, gridSize } = get();
    const maxZ = get().elements.reduce((m, el) => Math.max(m, el.zIndex), 0);
    const rawX = x ?? (WATCH_SIZE - defaults.width) / 2;
    const rawY = y ?? (WATCH_SIZE - defaults.height) / 2;
    const newElement: WatchElement = {
      ...defaults,
      id: genId(),
      x: snapValue(Math.max(0, Math.round(rawX)), gridSize, snapToGrid),
      y: snapValue(Math.max(0, Math.round(rawY)), gridSize, snapToGrid),
      zIndex: maxZ + 1,
    };
    set((state) => ({
      past: [...state.past.slice(-19), state.elements],
      future: [],
      elements: [...state.elements, newElement],
      selectedIds: [newElement.id],
    }));
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },

  removeElement: (id) => {
    set((state) => ({
      past: [...state.past.slice(-19), state.elements],
      future: [],
      elements: state.elements.filter((el) => el.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
  },

  removeSelected: () => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;
    set((state) => ({
      past: [...state.past.slice(-19), state.elements],
      future: [],
      elements: state.elements.filter((el) => !selectedIds.includes(el.id)),
      selectedIds: [],
    }));
  },

  selectElement: (id, addToSelection = false) => {
    if (id === null) {
      set({ selectedIds: [] });
      return;
    }
    if (addToSelection) {
      set((state) => {
        const already = state.selectedIds.includes(id);
        return {
          selectedIds: already
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        };
      });
    } else {
      set({ selectedIds: [id] });
    }
  },

  clearSelection: () => set({ selectedIds: [] }),

  bringForward: (id) => {
    set((state) => {
      const el = state.elements.find((e) => e.id === id);
      if (!el) return state;
      const maxZ = state.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
      return {
        elements: state.elements.map((e) =>
          e.id === id ? { ...e, zIndex: maxZ + 1 } : e
        ),
      };
    });
  },

  sendBackward: (id) => {
    set((state) => {
      const el = state.elements.find((e) => e.id === id);
      if (!el) return state;
      const minZ = state.elements.reduce((m, e) => Math.min(m, e.zIndex), Infinity);
      return {
        elements: state.elements.map((e) =>
          e.id === id ? { ...e, zIndex: minZ - 1 } : e
        ),
      };
    });
  },

  loadTemplate: (layout) => {
    set((state) => ({
      past: [...state.past.slice(-19), state.elements],
      future: [],
      name: layout.name,
      device: layout.device,
      background: layout.background,
      elements: layout.elements,
      selectedIds: [],
    }));
  },

  undo: () => {
    const { past, elements, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      elements: previous,
      future: [elements, ...future],
      selectedIds: [],
    });
  },

  redo: () => {
    const { past, elements, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, elements],
      elements: next,
      future: future.slice(1),
      selectedIds: [],
    });
  },

  getLayout: () => {
    const { name, device, background, elements } = get();
    return {
      name,
      device,
      resolution: [454, 454],
      background,
      elements,
    };
  },

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  setGridSize: (size) => set({ gridSize: size }),

  copySelected: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    const copied = elements.filter((el) => selectedIds.includes(el.id));
    set({ clipboard: copied });
  },

  paste: () => {
    const { clipboard } = get();
    if (!clipboard || clipboard.length === 0) return;
    const maxZ = get().elements.reduce((m, el) => Math.max(m, el.zIndex), 0);
    const newElements = clipboard.map((el, i) => ({
      ...el,
      id: genId(),
      x: Math.min(WATCH_SIZE - el.width, el.x + 16),
      y: Math.min(WATCH_SIZE - el.height, el.y + 16),
      zIndex: maxZ + 1 + i,
    }));
    set((state) => ({
      past: [...state.past.slice(-19), state.elements],
      future: [],
      elements: [...state.elements, ...newElements],
      selectedIds: newElements.map((e) => e.id),
      clipboard: newElements,
    }));
  },
}));
