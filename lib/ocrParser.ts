/**
 * lib/ocrParser.ts
 *
 * Runs OCR on an image buffer or file using Tesseract.js,
 * extracting view counts, impressions, and engagement metrics
 * from social media screenshots (YouTube, X, Instagram, TikTok).
 */

import { createWorker } from 'tesseract.js';

export interface OcrResult {
  success: boolean;
  views: number;
  confidence: number;
  matchedSnippet?: string;
  rawText: string;
  botBlocked?: boolean;
  error?: string;
}

/**
 * Normalizes string like "15.4K", "1.2M", "15,391", or "420" into an integer.
 */
export function parseViewCountNumber(str: string): number {
  if (!str) return 0;
  const clean = str.trim().toUpperCase().replace(/,/g, '');
  
  if (clean.endsWith('K')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }
  if (clean.endsWith('M')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? 0 : Math.round(num * 1000000);
  }
  if (clean.endsWith('B')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? 0 : Math.round(num * 1000000000);
  }
  
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses full OCR text looking for view patterns:
 * e.g. "15,391 views", "15.2K Views", "45.2K plays", "Views: 1,420", "2.1M impressions"
 */
export function extractViewsFromOcrText(text: string): { views: number; snippet?: string; botBlocked: boolean } {
  if (!text) return { views: 0, botBlocked: false };

  // 1. Check for bot wall or login blockage
  const lower = text.toLowerCase();
  const botBlocked =
    lower.includes('recaptcha') ||
    lower.includes('unusual traffic') ||
    lower.includes('log in to continue') ||
    lower.includes('sign in to x') ||
    lower.includes('not a robot');

  // 2. High-precision regex patterns for social media metrics
  const patterns: RegExp[] = [
    // "15,391 views", "15.4K views", "45.2K plays", "1.2M impressions"
    /([\d,.]+\s*[KMkm]?)\s*(?:views|plays|replays|impressions|view)\b/i,
    // "Views: 15,391" or "Views 15.4K"
    /\b(?:views|plays|impressions)\s*[:•\-]?\s*([\d,.]+\s*[KMkm]?)/i,
    // Standalone metric badge e.g. "15.2K\nViews"
    /([\d,.]+\s*[KMkm]?)\s*\n\s*(?:views|plays)/i,
    // YouTube / X mobile badge e.g. "391 Views"
    /([0-9]{1,3}(?:,[0-9]{3})*|\d+(?:\.\d+)?[KMkm]?)\s*(?:views|plays)/i,
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match) {
      // Find the group containing numbers
      const numCandidate = match[1] && /\d/.test(match[1]) ? match[1] : match[2];
      if (numCandidate) {
        const val = parseViewCountNumber(numCandidate);
        if (val > 0) {
          return {
            views: val,
            snippet: match[0].trim(),
            botBlocked,
          };
        }
      }
    }
  }

  return { views: 0, botBlocked };
}

/**
 * Executes OCR on image buffer or path and extracts metrics
 */
export async function runOcrOnImage(imageBufferOrPath: Buffer | string): Promise<OcrResult> {
  let worker: any = null;
  try {
    worker = await createWorker('eng');
    const ret = await worker.recognize(imageBufferOrPath);
    await worker.terminate();

    const rawText = ret.data.text || '';
    const confidence = ret.data.confidence || 0;
    const { views, snippet, botBlocked } = extractViewsFromOcrText(rawText);

    return {
      success: true,
      views,
      confidence,
      matchedSnippet: snippet,
      rawText,
      botBlocked,
    };
  } catch (err: any) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (_) {}
    }
    return {
      success: false,
      views: 0,
      confidence: 0,
      rawText: '',
      error: err.message || 'OCR processing failed',
    };
  }
}
