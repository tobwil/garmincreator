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

interface WatchfaceStore {
  // ── State ──────────────────────────────────────────────────────────────────
  name: string;
  device: DeviceId;
  background: BackgroundConfig;
  elements: WatchElement[];
  selectedId: string | null;
  past: WatchElement[][];
  future: WatchElement[][];

  // ── Actions ────────────────────────────────────────────────────────────────
  setName: (name: string) => void;
  setDevice: (device: DeviceId) => void;
  setBackground: (bg: Partial<BackgroundConfig>) => void;
  addElement: (type: WidgetType, x?: number, y?: number) => void;
  updateElement: (id: string, updates: Partial<WatchElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  loadTemplate: (layout: WatchfaceLayout) => void;
  undo: () => void;
  redo: () => void;
  getLayout: () => WatchfaceLayout;
}

export const useWatchfaceStore = create<WatchfaceStore>((set, get) => ({
  // ── Initial State ──────────────────────────────────────────────────────────
  name: 'My Watchface',
  device: 'forerunner970',
  background: { type: 'solid', color: '#000000' },
  elements: [],
  selectedId: null,
  past: [],
  future: [],

  // ── Setters ────────────────────────────────────────────────────────────────
  setName: (name) => set({ name }),
  setDevice: (device) => set({ device }),
  setBackground: (bg) =>
    set((state) => ({ background: { ...state.background, ...bg } })),

  // ── Element Actions ────────────────────────────────────────────────────────
  addElement: (type, x, y) => {
    const defaults = WIDGET_DEFAULTS[type];
    const maxZ = get().elements.reduce((m, el) => Math.max(m, el.zIndex), 0);
    const centerX = x ?? (WATCH_SIZE - defaults.width) / 2;
    const centerY = y ?? (WATCH_SIZE - defaults.height) / 2;
    const newElement: WatchElement = {
      ...defaults,
      id: genId(),
      x: Math.round(centerX),
      y: Math.round(centerY),
      zIndex: maxZ + 1,
    };
    set((state) => ({
      past: [...state.past.slice(-19), state.elements],
      future: [],
      elements: [...state.elements, newElement],
      selectedId: newElement.id,
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
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  selectElement: (id) => set({ selectedId: id }),

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
      selectedId: null,
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
      selectedId: null,
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
      selectedId: null,
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
}));
