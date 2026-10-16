import { NextRequest, NextResponse } from 'next/server';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ success: false, error: 'Missing url query param' }, { status: 400 });
  }

  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    const urlObj = new URL(targetUrl);
    // Disallow private or internal IPs for security
    if (
      urlObj.hostname === 'localhost' ||
      urlObj.hostname.startsWith('127.') ||
      urlObj.hostname.startsWith('192.168.') ||
      urlObj.hostname.startsWith('10.') ||
      urlObj.hostname.endsWith('.local')
    ) {
      return NextResponse.json(
        { success: false, error: 'Private addresses are restricted' },
        { status: 400 }
      );
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 AzyraBot/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(4500),
      redirect: 'follow',
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}`,
        fallbackDomain: urlObj.hostname.replace(/^www\./, ''),
      });
    }

    // Only read first 120KB to prevent memory exhaustion on giant HTML pages
    const reader = response.body?.getReader();
    let html = '';
    if (reader) {
      const decoder = new TextDecoder('utf-8');
      let bytesRead = 0;
      while (bytesRead < 120000) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        bytesRead += value.length;
        html += decoder.decode(value, { stream: true });
        // Stop early if closing head tag is reached
        if (html.includes('</head>')) break;
      }
      reader.cancel().catch(() => {});
    }

    let title = '';
    let description = '';
    let siteName = '';
    let iconUrl = '';

    // 1. og:site_name
    const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);
    if (ogSiteMatch) siteName = decodeHtmlEntities(ogSiteMatch[1]);

    // 2. og:title / twitter:title / <title>
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    const standardTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    if (ogTitleMatch) {
      title = decodeHtmlEntities(ogTitleMatch[1]);
    } else if (standardTitleMatch) {
      title = decodeHtmlEntities(standardTitleMatch[1]);
    }

    // 3. description / og:description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    if (ogDescMatch) {
      description = decodeHtmlEntities(ogDescMatch[1]);
    }

    // 4. Favicon / Apple touch icon link
    const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
                      html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i) ||
                      html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
    if (iconMatch) {
      const rawHref = iconMatch[1].trim();
      if (rawHref.startsWith('http://') || rawHref.startsWith('https://')) {
        iconUrl = rawHref;
      } else if (rawHref.startsWith('//')) {
        iconUrl = `https:${rawHref}`;
      } else if (rawHref.startsWith('/')) {
        iconUrl = `${urlObj.origin}${rawHref}`;
      } else {
        iconUrl = `${urlObj.origin}/${rawHref}`;
      }
    }

    const domain = urlObj.hostname.replace(/^www\./, '');

    return NextResponse.json({
      success: true,
      title: title || domain,
      siteName: siteName || domain,
      description: description || '',
      iconUrl: iconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      domain,
    });
  } catch (error: any) {
    const fallbackDomain = targetUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch metadata',
      fallbackDomain,
    });
  }
}
