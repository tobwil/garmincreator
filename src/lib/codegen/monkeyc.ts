/**
 * Monkey C code generator for Garmin Connect IQ watchfaces.
 * Converts a WatchfaceLayout JSON to a complete Connect IQ project.
 */

import { WatchfaceLayout, WatchElement, WidgetType, DEVICES } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToMonkeyC(hex: string): string {
  // Remove # and convert to 0xRRGGBB
  const clean = hex.replace('#', '').padStart(6, '0').toUpperCase();
  return `0x${clean}`;
}

function className(name: string): string {
  // Convert "My Watchface" → "MyWatchface"
  return name.replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function getRequiredImports(elements: WatchElement[]): string[] {
  const imports = new Set<string>([
    'Toybox.Application',
    'Toybox.Graphics',
    'Toybox.Lang',
    'Toybox.System',
    'Toybox.WatchUi',
  ]);

  const types = new Set(elements.map((e) => e.type));

  if (
    types.has('heart_rate') || types.has('hr_chart') ||
    types.has('steps') || types.has('steps_chart') ||
    types.has('body_battery') || types.has('distance')
  ) {
    imports.add('Toybox.ActivityMonitor');
  }
  if (types.has('vo2max')) {
    imports.add('Toybox.UserProfile');
  }
  if (types.has('bluetooth') || types.has('notifications')) {
    imports.add('Toybox.System');
  }

  return Array.from(imports).sort();
}

// ─── Per-element Code Generation ──────────────────────────────────────────────

function generateElementCode(el: WatchElement): string {
  const color = hexToMonkeyC(el.color);
  const cx = Math.round(el.x + el.width / 2);
  const cy = Math.round(el.y + el.height / 2);

  switch (el.type) {
    case 'time_digital':
      return `
        // Time (Digital)
        var clockTime = System.getClockTime();
        var timeStr = clockTime.hour.format("%02d") + ":" + clockTime.min.format("%02d");
        dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
        dc.drawText(${cx}, ${cy}, Graphics.FONT_NUMBER_HOT, timeStr, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);`;

    case 'time_analog': {
      const acx = Math.round(el.x + el.width / 2);
      const acy = Math.round(el.y + el.height / 2);
      const r = Math.round(Math.min(el.width, el.height) / 2 - 4);
      return `
        // Time (Analog)
        var clockTime = System.getClockTime();
        var h = clockTime.hour % 12;
        var m = clockTime.min;
        var s = clockTime.sec;
        var pi = Math.PI;
        var hourAngle = ((h.toFloat() + m.toFloat() / 60.0f) / 12.0f) * 2.0f * pi - pi / 2.0f;
        var minAngle = ((m.toFloat() + s.toFloat() / 60.0f) / 60.0f) * 2.0f * pi - pi / 2.0f;
        var secAngle = (s.toFloat() / 60.0f) * 2.0f * pi - pi / 2.0f;
        // Face ring
        dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawCircle(${acx}, ${acy}, ${r});
        // Hour hand
        dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
        dc.drawLine(${acx}, ${acy},
            (${acx} + (Math.cos(hourAngle) * ${Math.round(r * 0.55)}).toNumber()).toNumber(),
            (${acy} + (Math.sin(hourAngle) * ${Math.round(r * 0.55)}).toNumber()).toNumber());
        // Minute hand
        dc.drawLine(${acx}, ${acy},
            (${acx} + (Math.cos(minAngle) * ${Math.round(r * 0.78)}).toNumber()).toNumber(),
            (${acy} + (Math.sin(minAngle) * ${Math.round(r * 0.78)}).toNumber()).toNumber());
        // Second hand
        dc.setColor(Graphics.COLOR_RED, Graphics.COLOR_TRANSPARENT);
        dc.drawLine(${acx}, ${acy},
            (${acx} + (Math.cos(secAngle) * ${Math.round(r * 0.85)}).toNumber()).toNumber(),
            (${acy} + (Math.sin(secAngle) * ${Math.round(r * 0.85)}).toNumber()).toNumber());
        dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(${acx}, ${acy}, 3);`;
    }

    case 'date':
      return `
        // Date
        var today = Time.today();
        var info = Calendar.info(today, Time.FORMAT_MEDIUM);
        var dateStr = info.day_of_week.substring(0, 3).toUpper() + " " + info.day.toString() + " " + info.month.substring(0, 3).toUpper();
        dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
        dc.drawText(${cx}, ${cy}, Graphics.FONT_MEDIUM, dateStr, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);`;

    case 'heart_rate': {
      const lines: string[] = [`
        // Heart Rate
        var hrHistory = ActivityMonitor.getHeartRateHistory(1, true);
        var hrSample = hrHistory.next();
        if (hrSample != null && hrSample.heartRate != ActivityMonitor.INVALID_HR_SAMPLE) {
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);`];
      if (el.showIcon) {
        lines.push(`            dc.drawText(${el.x + 20}, ${cy}, Graphics.FONT_XTINY, "\\u2665", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);`);
        lines.push(`            dc.drawText(${el.x + el.width - 10}, ${cy}, Graphics.FONT_MEDIUM, hrSample.heartRate.toString(), Graphics.TEXT_JUSTIFY_RIGHT | Graphics.TEXT_JUSTIFY_VCENTER);`);
      } else {
        lines.push(`            dc.drawText(${cx}, ${cy}, Graphics.FONT_MEDIUM, hrSample.heartRate.toString(), Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);`);
      }
      lines.push(`        }`);
      return lines.join('\n');
    }

    case 'hr_chart':
      return `
        // HR Chart (simplified — draws current HR as text with label)
        var hrHistory = ActivityMonitor.getHeartRateHistory(1, true);
        var hrSample = hrHistory.next();
        if (hrSample != null && hrSample.heartRate != ActivityMonitor.INVALID_HR_SAMPLE) {
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${cy - 8}, Graphics.FONT_MEDIUM, hrSample.heartRate.toString(), Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${el.y + el.height - 8}, Graphics.FONT_XTINY, "24H HR", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        }`;

    case 'steps': {
      const barY = el.y + el.height - 6;
      const code = `
        // Steps
        var actInfo = ActivityMonitor.getInfo();
        if (actInfo != null) {
            var stepsStr = actInfo.steps.toString();
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${el.y + Math.round(el.height * 0.38)}, Graphics.FONT_MEDIUM, stepsStr, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);${el.showLabel ? `
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${el.y + Math.round(el.height * 0.7)}, Graphics.FONT_XTINY, "STEPS", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);` : ''}${el.showBar ? `
            // Steps progress bar
            var stepsGoal = actInfo.stepGoal;
            if (stepsGoal != null && stepsGoal > 0) {
                var pct = actInfo.steps.toFloat() / stepsGoal.toFloat();
                if (pct > 1.0f) { pct = 1.0f; }
                var barWidth = ${el.width};
                var fillWidth = (barWidth * pct).toNumber();
                dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
                dc.fillRoundedRectangle(${el.x}, ${barY}, barWidth, 4, 2);
                dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
                if (fillWidth > 0) { dc.fillRoundedRectangle(${el.x}, ${barY}, fillWidth, 4, 2); }
            }` : ''}
        }`;
      return code;
    }

    case 'steps_chart': {
      const barCount = 7;
      const gap = 3;
      const barW2 = Math.floor((el.width - gap * (barCount - 1)) / barCount);
      return `
        // Steps Chart (7-day — draws today's steps as bar + label)
        var actInfo = ActivityMonitor.getInfo();
        if (actInfo != null) {
            var stepsVal = actInfo.steps;
            var stepGoal = actInfo.stepGoal;
            if (stepGoal == null || stepGoal == 0) { stepGoal = 10000; }
            var pct = stepsVal.toFloat() / stepGoal.toFloat();
            if (pct > 1.0f) { pct = 1.0f; }
            var chartH = ${el.height - (el.showLabel ? 16 : 4)};
            var fillH = (chartH * pct).toNumber();
            // Draw today's bar (rightmost)
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.fillRoundedRectangle(${el.x + el.width - barW2}, ${el.y}, ${barW2}, chartH, 2);
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
            if (fillH > 0) {
                dc.fillRoundedRectangle(${el.x + el.width - barW2}, ${el.y + (el.height - 4) - fillH}, ${barW2}, fillH, 2);
            }${el.showLabel ? `
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${el.x}, ${el.y + el.height - 8}, Graphics.FONT_XTINY, "7-DAY", Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${el.x + el.width}, ${el.y + el.height - 8}, Graphics.FONT_XTINY, stepsVal.toString(), Graphics.TEXT_JUSTIFY_RIGHT | Graphics.TEXT_JUSTIFY_VCENTER);` : ''}
        }`;
    }

    case 'battery':
      return `
        // Battery
        var sysStats = System.getSystemStats();
        var battPct = sysStats.battery.toNumber();
        var battStr = battPct.toString() + "%";
        dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);${el.showIcon ? `
        // Battery icon (outline)
        dc.drawRectangle(${el.x}, ${cy} - 8, 22, 16);
        dc.fillRectangle(${el.x} + 22, ${cy} - 4, 3, 8);
        var fillW = ((battPct * 20) / 100).toNumber();
        dc.fillRectangle(${el.x} + 1, ${cy} - 7, fillW, 14);
        dc.drawText(${el.x + 30}, ${cy}, Graphics.FONT_SMALL, battStr, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);` : `
        dc.drawText(${cx}, ${cy}, Graphics.FONT_SMALL, battStr, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);`}`;

    case 'bluetooth':
      return `
        // Bluetooth
        var deviceSettings = System.getDeviceSettings();
        if (deviceSettings.phoneConnected) {
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${cy}, Graphics.FONT_SMALL, "B", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        } else {
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${cy}, Graphics.FONT_SMALL, "B", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        }`;

    case 'notifications':
      return `
        // Notifications
        var deviceSettings = System.getDeviceSettings();
        var notifCount = deviceSettings.notificationCount;
        if (notifCount > 0) {
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${cy}, Graphics.FONT_SMALL, notifCount.toString(), Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        }`;

    case 'body_battery':
      return `
        // Body Battery
        var actInfo = ActivityMonitor.getInfo();
        if (actInfo != null && actInfo has :bodyBattery && actInfo.bodyBattery != null) {
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);${el.showIcon ? `
            dc.drawText(${el.x + 20}, ${cy}, Graphics.FONT_XTINY, "\\u26A1", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
            dc.drawText(${el.x + el.width - 10}, ${cy}, Graphics.FONT_MEDIUM, actInfo.bodyBattery.toString(), Graphics.TEXT_JUSTIFY_RIGHT | Graphics.TEXT_JUSTIFY_VCENTER);` : `
            dc.drawText(${cx}, ${cy}, Graphics.FONT_MEDIUM, actInfo.bodyBattery.toString(), Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);`}${el.showLabel ? `
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${el.y + el.height - 8}, Graphics.FONT_XTINY, "BODY BAT", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);` : ''}
        }`;

    case 'vo2max':
      return `
        // VO2 Max
        var profile = UserProfile.getProfile();
        if (profile != null && profile.vo2maxRunning != null) {
            var vo2Str = profile.vo2maxRunning.toString();
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${cy - (el.showLabel ? 8 : 0)}, Graphics.FONT_MEDIUM, vo2Str, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);${el.showLabel ? `
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${el.y + el.height - 8}, Graphics.FONT_XTINY, "VO2 MAX", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);` : ''}
        }`;

    case 'distance': {
      const barY2 = el.y + el.height - 6;
      return `
        // Distance (weekly)
        var actInfo = ActivityMonitor.getInfo();
        if (actInfo != null) {
            var distM = actInfo.distance; // in cm
            var distKm = distM.toFloat() / 100000.0f;
            var distStr = distKm.format("%.1f") + " km";
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${el.y + Math.round(el.height * 0.38)}, Graphics.FONT_SMALL, distStr, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);${el.showLabel ? `
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(${cx}, ${el.y + Math.round(el.height * 0.7)}, Graphics.FONT_XTINY, "DISTANCE", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);` : ''}${el.showBar ? `
            dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.fillRoundedRectangle(${el.x}, ${barY2}, ${el.width}, 4, 2);
            dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
            dc.fillRoundedRectangle(${el.x}, ${barY2}, (${el.width} * 0.5).toNumber(), 4, 2);` : ''}
        }`;
    }

    case 'alarm':
      return `
        // Alarm
        // Note: For actual alarm display, use ClockTime and app settings
        dc.setColor(${color}, Graphics.COLOR_TRANSPARENT);
        dc.drawText(${cx}, ${cy}, Graphics.FONT_SMALL, "ALM", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);`;

    default:
      return `        // Unknown widget type: ${(el as WatchElement).type}`;
  }
}

// ─── File Generators ──────────────────────────────────────────────────────────

export function generateAppMC(cn: string): string {
  return `import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class ${cn}App extends Application.AppBase {

    function initialize() {
        AppBase.initialize();
    }

    function onStart(state as Dictionary?) as Void {
    }

    function onStop(state as Dictionary?) as Void {
    }

    function getInitialView() as [Views] or [Views, InputDelegates] {
        return [ new ${cn}View() ];
    }

}

function getApp() as ${cn}App {
    return Application.getApp() as ${cn}App;
}
`;
}

export function generateViewMC(layout: WatchfaceLayout, cn: string): string {
  const imports = getRequiredImports(layout.elements);
  const sorted = [...layout.elements].sort((a, b) => a.zIndex - b.zIndex);

  // Check if we need Calendar import
  const needsCalendar = sorted.some((e) => e.type === 'date');
  const needsUserProfile = sorted.some((e) => e.type === 'vo2max');
  const needsMath = sorted.some((e) => e.type === 'time_analog');

  const allImports = [
    ...imports,
    ...(needsCalendar ? ['Toybox.Time', 'Toybox.Time.Gregorian as Calendar'] : []),
    ...(needsUserProfile ? ['Toybox.UserProfile'] : []),
    ...(needsMath ? ['Toybox.Math'] : []),
  ];

  // Background: use solid color; gradient approximated with solid start color
  const bgColor = hexToMonkeyC(layout.background.color);

  const elementCodes = sorted.map((el) => generateElementCode(el)).join('\n');

  return `${allImports.map((i) => `import ${i};`).join('\n')}

class ${cn}View extends WatchUi.WatchFace {

    function initialize() {
        WatchFace.initialize();
    }

    function onLayout(dc as Dc) as Void {
        // Programmatic layout — no XML layout file required
    }

    function onShow() as Void {
    }

    function onHide() as Void {
    }

    function onExitSleep() as Void {
    }

    function onEnterSleep() as Void {
    }

    function onUpdate(dc as Dc) as Void {
        // Clear with background color
        dc.setColor(${bgColor}, ${bgColor});
        dc.clear();
${elementCodes}
    }

}
`;
}

export function generateManifest(layout: WatchfaceLayout, cn: string): string {
  const device = DEVICES[layout.device];
  const appId = 'c3c35bd0-3d7f-4d93-90b3-' + Math.random().toString(16).substring(2, 14).padEnd(12, '0');

  const permissions = new Set<string>(['Fit']);
  layout.elements.forEach((el) => {
    if (['heart_rate', 'hr_chart', 'steps', 'steps_chart', 'body_battery', 'distance'].includes(el.type)) {
      permissions.add('ActivityMonitor');
      permissions.add('SensorHistory');
    }
    if (el.type === 'vo2max') permissions.add('UserProfile');
    if (el.type === 'bluetooth' || el.type === 'notifications') permissions.add('Communications');
  });

  return `<?xml version="1.0"?>
<iq:manifest xmlns:iq="http://www.garmin.com/xml/connectiq" version="3">
    <iq:application
        entry="${cn}App"
        id="${appId}"
        launchType="WATCHFACE"
        minSdkVersion="8.1.0"
        name="@Strings.AppName"
        type="watchface"
        version="1.0.0">
        <iq:products>
            <iq:product id="${device.partNumber}"/>
        </iq:products>
        <iq:permissions>
${[...permissions].map((p) => `            <iq:uses-permission id="${p}"/>`).join('\n')}
        </iq:permissions>
        <iq:languages>
            <iq:language>eng</iq:language>
        </iq:languages>
    </iq:application>
</iq:manifest>
`;
}

export function generateStringsXML(layout: WatchfaceLayout): string {
  return `<strings>
    <string id="AppName">${layout.name}</string>
</strings>
`;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export interface GeneratedProject {
  /** filename → file contents */
  files: Record<string, string>;
  className: string;
}

export function generateProject(layout: WatchfaceLayout): GeneratedProject {
  const cn = className(layout.name) || 'MyWatchface';

  const files: Record<string, string> = {
    'manifest.xml': generateManifest(layout, cn),
    'source/WatchFaceApp.mc': generateAppMC(cn),
    'source/WatchFaceView.mc': generateViewMC(layout, cn),
    'resources/strings/strings.xml': generateStringsXML(layout),
    'README.md': generateReadme(layout, cn),
  };

  return { files, className: cn };
}

function generateReadme(layout: WatchfaceLayout, cn: string): string {
  return `# ${layout.name}

Generated by **Garmin Watchface Builder** — https://garmincreator.app

## Installation

### Option A: Sideload (Developer)

1. Install [VS Code](https://code.visualstudio.com/) and the [Monkey C extension](https://marketplace.visualstudio.com/items?itemName=garmin.monkey-c)
2. Install the [Garmin Connect IQ SDK](https://developer.garmin.com/connect-iq/sdk/)
3. Open this folder in VS Code
4. Press \`F5\` to build and run in the simulator, or use \`Build for Device\` to create a \`.prg\` file
5. Copy the \`.prg\` file to your watch at \`GARMIN/Apps/\` via USB

### Option B: Connect IQ Store
To publish, submit via [Garmin Developer Portal](https://developer.garmin.com/).

## Target Device
- **${DEVICES[layout.device].name}** (${layout.resolution[0]}×${layout.resolution[1]} px, ${DEVICES[layout.device].displayType.toUpperCase()})

## Widgets
${layout.elements.map((el) => `- ${el.type.replace(/_/g, ' ')}`).join('\n')}

## Requirements
- Garmin Connect IQ SDK ≥ 8.1.0
- MonkeyC extension for VS Code

---
*Generated ${new Date().toISOString().split('T')[0]}*
`;
}
