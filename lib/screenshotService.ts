/**
 * lib/screenshotService.ts
 *
 * Captures high-fidelity screenshots of submitted social media post URLs
 * using local headless Chrome/Edge or cloud headless fallback.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export interface ScreenshotResult {
  success: boolean;
  imageBuffer?: Buffer;
  localPath?: string;
  screenshotUrl?: string;
  error?: string;
}

/**
 * Finds available Chrome or Edge browser executable on Windows/Linux/Mac
 */
function getBrowserExecutablePath(): string | null {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ];
    for (const c of candidates) {
      if (fs.existsSync(/*turbopackIgnore: true*/ c)) return c;
    }
  } else {
    const candidates = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ];
    for (const c of candidates) {
      if (fs.existsSync(/*turbopackIgnore: true*/ c)) return c;
    }
  }

  return null;
}

/**
 * Captures a screenshot of the post URL
 */
export async function capturePostScreenshot(url: string): Promise<ScreenshotResult> {
  const browserPath = getBrowserExecutablePath();
  const tmpDir = os.tmpdir();
  const filename = `post_snap_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
  const outPath = path.join(tmpDir, filename);

  if (browserPath) {
    try {
      // Execute headless browser to snap the page
      const cmd = [
        `"${browserPath}"`,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--window-size=1280,850',
        '--disable-blink-features=AutomationControlled',
        '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"',
        `--screenshot="${outPath}"`,
        `"${url}"`,
      ].join(' ');

      await execAsync(cmd, { timeout: 18000 });

      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
        const imageBuffer = fs.readFileSync(outPath);
        return {
          success: true,
          imageBuffer,
          localPath: outPath,
          screenshotUrl: `data:image/png;base64,${imageBuffer.toString('base64')}`,
        };
      }
    } catch (err: any) {
      console.warn('Headless browser screenshot warning:', err.message);
      // If local file was still partially written
      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
        const imageBuffer = fs.readFileSync(outPath);
        return {
          success: true,
          imageBuffer,
          localPath: outPath,
          screenshotUrl: `data:image/png;base64,${imageBuffer.toString('base64')}`,
        };
      }
    }
  }

  // Fallback: Secondary public snapshot endpoint
  try {
    const fallbackUrl = `https://image.thum.io/get/width/1200/crop/800/${url}`;
    const res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const arr = await res.arrayBuffer();
      const imageBuffer = Buffer.from(arr);
      fs.writeFileSync(outPath, imageBuffer);
      return {
        success: true,
        imageBuffer,
        localPath: outPath,
        screenshotUrl: fallbackUrl,
      };
    }
  } catch (e: any) {
    console.warn('Fallback screenshot proxy failed:', e.message);
  }

  return {
    success: false,
    error: 'Could not capture screenshot of the specified post URL',
  };
}
