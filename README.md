# Garmin Watchface Builder

A visual drag-and-drop editor for creating custom Garmin watchfaces. Design your watchface in the browser and export a complete, compilable **Connect IQ project** (Monkey C source code).

![Editor Layout](https://via.placeholder.com/900x500/0a0a0a/3b82f6?text=Garmin+Watchface+Builder)

---

## Features

### Visual Editor
- **Round 454×454 AMOLED canvas** — pixel-accurate preview for Forerunner 970, 965, Fēnix 8
- **Drag-and-drop** widgets from the panel onto the watch, or click to add at center
- **Resize** by dragging the blue handle at the bottom-right corner of any widget
- **Properties panel** — color, font size/weight, position, size, show/hide icon · label · bar
- **Layer control** — bring forward / send backward
- **Live preview** with simulated data (heart rate, steps, battery, etc.)

### Widgets (11 types)
| Widget | Data Source |
|--------|-------------|
| Time (Digital) | `System.getClockTime()` |
| Date | `Gregorian.info()` |
| Steps | `ActivityMonitor.getInfo().steps` |
| Heart Rate | `ActivityMonitor.getHeartRateHistory()` |
| Battery | `System.getSystemStats().battery` |
| Bluetooth | `System.getDeviceSettings().phoneConnected` |
| Notifications | `System.getDeviceSettings().notificationCount` |
| Body Battery | `ActivityMonitor.getInfo().bodyBattery` |
| VO2 Max | `UserProfile.getProfile().vo2maxRunning` |
| Distance | `ActivityMonitor.getInfo().distance` |
| Alarm | `System.getClockTime()` |

### Templates
- **Minimal Dark** — Time, date, heart rate, battery
- **Sport Pro** — Full sport layout with steps, body battery, notifications
- **Data Dense** — Maximum info: VO2 Max, Body Battery, Distance, and more
- **Clean Sport** — Focus on daily step goal with essential vitals

### Export
- **Connect IQ Project (.zip)** — Complete Monkey C source code, ready to compile with the Garmin SDK
- **Layout JSON** — Save your design to re-import and continue editing later

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Delete` / `Backspace` | Delete selected widget |
| Click canvas background | Deselect |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/tobwil/garmincreator.git
cd garmincreator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Using the Exported Connect IQ Project

The exported `.zip` contains a complete Garmin Connect IQ project:

```
mywatchface/
├── manifest.xml              # Device targets, permissions, SDK version
├── source/
│   ├── WatchFaceApp.mc       # Application entry point
│   └── WatchFaceView.mc      # Main view with generated onUpdate() drawing code
├── resources/
│   └── strings/
│       └── strings.xml       # App name string resource
└── README.md                 # Build instructions
```

### Compiling the Project

1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install the [Monkey C extension](https://marketplace.visualstudio.com/items?itemName=garmin.monkey-c)
3. Download and install the [Garmin Connect IQ SDK](https://developer.garmin.com/connect-iq/sdk/) (≥ 8.1.0)
4. Unzip the exported file and open the folder in VS Code
5. Press `F5` to run in the Connect IQ Simulator
6. To build for a physical device: `Ctrl+Shift+P` → **Monkey C: Build for Device**
7. Copy the generated `.prg` file to your watch via USB: `GARMIN/Apps/`

### Sideloading on Your Watch

1. Connect your Garmin watch via USB
2. Copy the `.prg` file to `<WATCH>/GARMIN/Apps/`
3. Safely eject and disconnect
4. On the watch: Settings → Watch Face → select your new watchface

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | [Zustand](https://zustand-demo.pmnd.rs/) |
| Code Generation | Custom Monkey C template engine |
| ZIP Export | [JSZip](https://stuk.github.io/jszip/) + [FileSaver.js](https://github.com/eligrey/FileSaver.js/) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page (renders Editor)
│   └── globals.css          # Global styles
├── components/editor/
│   ├── index.tsx            # Editor layout + keyboard shortcuts
│   ├── WatchCanvas.tsx      # Round canvas, drag-and-drop, resize
│   ├── WidgetRenderer.tsx   # Per-widget visual preview renderers
│   ├── WidgetPanel.tsx      # Left sidebar: widget library
│   ├── PropertiesPanel.tsx  # Right sidebar: element properties
│   └── Toolbar.tsx          # Top bar: name, device, templates, export
├── lib/
│   ├── types.ts             # All TypeScript types + constants
│   ├── store.ts             # Zustand store (state + actions + undo/redo)
│   ├── export.ts            # ZIP/JSON export and JSON import
│   └── codegen/
│       └── monkeyc.ts       # Monkey C + manifest.xml code generator
└── data/
    └── watchfaceTemplates.ts  # 4 built-in starter templates
```

---

## Roadmap

### v1.1 — In Progress
- [ ] Snap-to-grid toggle
- [ ] Multi-select with shift-click
- [ ] Copy/paste widgets
- [ ] Analog clock widget

### v2.0 — Planned
- [ ] Custom fonts from a curated library
- [ ] Mini-charts (step history bar chart, HR curve)
- [ ] Gradient backgrounds
- [ ] Cloud build: server-side Garmin SDK compile → direct `.prg` download
- [ ] User accounts with saved designs
- [ ] Community template gallery

### v3.0 — Future
- [ ] Upload custom icons/images
- [ ] Conditional display (e.g., color changes by HR zone)
- [ ] AMOLED animations
- [ ] Connect IQ Store integration
- [ ] 50+ device profiles with correct resolutions

---

## Supported Devices

| Device | Resolution | Display |
|--------|-----------|---------|
| Forerunner 970 | 454 × 454 | AMOLED |
| Forerunner 965 | 454 × 454 | AMOLED |
| Fēnix 8 (51mm) | 454 × 454 | AMOLED |
| Fēnix 8S (47mm) | 454 × 454 | AMOLED |

More devices (Epix Pro, Forerunner 265, etc.) coming in v1.1.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ for the Garmin community.*
