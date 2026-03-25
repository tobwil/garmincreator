// ─── Widget Types ────────────────────────────────────────────────────────────

export type WidgetType =
  | 'time_digital'
  | 'date'
  | 'steps'
  | 'heart_rate'
  | 'battery'
  | 'bluetooth'
  | 'notifications'
  | 'body_battery'
  | 'vo2max'
  | 'distance'
  | 'alarm';

// ─── Element Model ────────────────────────────────────────────────────────────

export interface WatchElement {
  id: string;
  type: WidgetType;
  /** X position in 454×454 coordinate space */
  x: number;
  /** Y position in 454×454 coordinate space */
  y: number;
  width: number;
  height: number;
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  showIcon: boolean;
  showLabel: boolean;
  showGraph: boolean;
  showBar: boolean;
  format?: string;
  zIndex: number;
}

// ─── Layout / Watchface Model ─────────────────────────────────────────────────

export interface BackgroundConfig {
  type: 'solid';
  color: string;
}

export interface WatchfaceLayout {
  id?: string;
  name: string;
  device: DeviceId;
  resolution: [number, number];
  background: BackgroundConfig;
  elements: WatchElement[];
}

// ─── Devices ──────────────────────────────────────────────────────────────────

export type DeviceId = 'forerunner970' | 'forerunner965' | 'fenix8' | 'fenix8s47';

export interface DeviceConfig {
  id: DeviceId;
  name: string;
  resolution: [number, number];
  displayType: 'amoled' | 'mip';
  partNumber: string;
}

export const DEVICES: Record<DeviceId, DeviceConfig> = {
  forerunner970: {
    id: 'forerunner970',
    name: 'Forerunner 970',
    resolution: [454, 454],
    displayType: 'amoled',
    partNumber: 'fr970',
  },
  forerunner965: {
    id: 'forerunner965',
    name: 'Forerunner 965',
    resolution: [454, 454],
    displayType: 'amoled',
    partNumber: 'fr965',
  },
  fenix8: {
    id: 'fenix8',
    name: 'Fēnix 8 (51mm)',
    resolution: [454, 454],
    displayType: 'amoled',
    partNumber: 'fenix8',
  },
  fenix8s47: {
    id: 'fenix8s47',
    name: 'Fēnix 8S (47mm)',
    resolution: [454, 454],
    displayType: 'amoled',
    partNumber: 'fenix8s47',
  },
};

// ─── Widget Defaults ──────────────────────────────────────────────────────────

export const WIDGET_DEFAULTS: Record<WidgetType, Omit<WatchElement, 'id' | 'x' | 'y' | 'zIndex'>> = {
  time_digital: {
    type: 'time_digital',
    width: 200,
    height: 72,
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    showIcon: false,
    showLabel: false,
    showGraph: false,
    showBar: false,
    format: 'HH:mm',
  },
  date: {
    type: 'date',
    width: 180,
    height: 36,
    fontSize: 18,
    fontWeight: 'normal',
    color: '#AAAAAA',
    showIcon: false,
    showLabel: false,
    showGraph: false,
    showBar: false,
  },
  steps: {
    type: 'steps',
    width: 140,
    height: 56,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00D4AA',
    showIcon: true,
    showLabel: true,
    showGraph: false,
    showBar: true,
  },
  heart_rate: {
    type: 'heart_rate',
    width: 120,
    height: 50,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF4D6A',
    showIcon: true,
    showLabel: false,
    showGraph: false,
    showBar: false,
  },
  battery: {
    type: 'battery',
    width: 110,
    height: 38,
    fontSize: 18,
    fontWeight: 'normal',
    color: '#88FF88',
    showIcon: true,
    showLabel: false,
    showGraph: false,
    showBar: false,
  },
  bluetooth: {
    type: 'bluetooth',
    width: 36,
    height: 36,
    fontSize: 14,
    fontWeight: 'normal',
    color: '#4488FF',
    showIcon: true,
    showLabel: false,
    showGraph: false,
    showBar: false,
  },
  notifications: {
    type: 'notifications',
    width: 80,
    height: 38,
    fontSize: 18,
    fontWeight: 'normal',
    color: '#FFAA44',
    showIcon: true,
    showLabel: false,
    showGraph: false,
    showBar: false,
  },
  body_battery: {
    type: 'body_battery',
    width: 120,
    height: 50,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFDD44',
    showIcon: true,
    showLabel: true,
    showGraph: false,
    showBar: false,
  },
  vo2max: {
    type: 'vo2max',
    width: 120,
    height: 50,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#44AAFF',
    showIcon: false,
    showLabel: true,
    showGraph: false,
    showBar: false,
  },
  distance: {
    type: 'distance',
    width: 140,
    height: 50,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8844',
    showIcon: false,
    showLabel: true,
    showGraph: false,
    showBar: true,
  },
  alarm: {
    type: 'alarm',
    width: 110,
    height: 38,
    fontSize: 18,
    fontWeight: 'normal',
    color: '#FF6644',
    showIcon: true,
    showLabel: false,
    showGraph: false,
    showBar: false,
  },
};

// ─── Widget UI Labels ─────────────────────────────────────────────────────────

export const WIDGET_LABELS: Record<WidgetType, string> = {
  time_digital: 'Time (Digital)',
  date: 'Date',
  steps: 'Steps',
  heart_rate: 'Heart Rate',
  battery: 'Battery',
  bluetooth: 'Bluetooth',
  notifications: 'Notifications',
  body_battery: 'Body Battery',
  vo2max: 'VO2 Max',
  distance: 'Distance',
  alarm: 'Alarm',
};

export const WIDGET_ICONS: Record<WidgetType, string> = {
  time_digital: '⏱',
  date: '📅',
  steps: '👟',
  heart_rate: '♥',
  battery: '🔋',
  bluetooth: '⬡',
  notifications: '🔔',
  body_battery: '⚡',
  vo2max: '💨',
  distance: '📏',
  alarm: '⏰',
};

// ─── Widget Categories ────────────────────────────────────────────────────────

export const WIDGET_CATEGORIES: { name: string; types: WidgetType[] }[] = [
  {
    name: 'Time & Date',
    types: ['time_digital', 'date', 'alarm'],
  },
  {
    name: 'Health & Fitness',
    types: ['heart_rate', 'steps', 'body_battery', 'vo2max', 'distance'],
  },
  {
    name: 'System',
    types: ['battery', 'bluetooth', 'notifications'],
  },
];

// ─── Simulated Preview Data ───────────────────────────────────────────────────

export const SIMULATED_DATA = {
  time: '09:41',
  dateShort: 'WED 19 MAR',
  steps: 8432,
  stepsGoal: 10000,
  heartRate: 72,
  battery: 68,
  bluetooth: true,
  notifications: 3,
  bodyBattery: 78,
  vo2max: 52.5,
  distanceKm: 4.2,
  distanceGoal: 8.0,
  alarm: '17:02',
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const WATCH_SIZE = 454;
