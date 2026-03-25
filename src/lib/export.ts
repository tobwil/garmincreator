'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { WatchfaceLayout } from './types';
import { generateProject } from './codegen/monkeyc';

/**
 * Exports the watchface layout as a ZIP file containing a complete
 * Garmin Connect IQ project (Monkey C source code).
 */
export async function exportAsConnectIQ(layout: WatchfaceLayout): Promise<void> {
  const { files, className } = generateProject(layout);
  const zip = new JSZip();

  // Sanitize folder name
  const folderName = className.toLowerCase().replace(/[^a-z0-9]/g, '-');

  for (const [path, content] of Object.entries(files)) {
    zip.file(`${folderName}/${path}`, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${folderName}.zip`);
}

/**
 * Exports the watchface layout as a JSON file for later import.
 */
export function exportAsJSON(layout: WatchfaceLayout): void {
  const json = JSON.stringify(layout, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${layout.name.toLowerCase().replace(/\s+/g, '-')}.json`);
}

/**
 * Imports a watchface layout from a JSON file.
 * Returns a Promise that resolves with the parsed layout.
 */
export function importFromJSON(file: File): Promise<WatchfaceLayout> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layout = JSON.parse(e.target?.result as string) as WatchfaceLayout;
        resolve(layout);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
