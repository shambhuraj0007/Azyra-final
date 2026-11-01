'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { extractDomain } from '../lib/data';

interface FaviconImageProps {
  url?: string;
  domain?: string;
  fallback?: string;
  className?: string;
  size?: number;
  alt?: string;
}

export default function FaviconImage({
  url = '',
  domain = '',
  fallback = '🚀',
  className = 'w-6 h-6',
  size = 128,
  alt = 'Startup favicon',
}: FaviconImageProps) {
  const [providerIndex, setProviderIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const resolvedDomain = domain || (url ? extractDomain(url) : '');

  // Reset state when url or domain changes
  useEffect(() => {
    setProviderIndex(0);
    setLoaded(false);
    setHasError(false);
  }, [resolvedDomain]);

  // Robust multi-provider cascade: Google V2 -> Icon Horse -> Unavatar -> Direct Domain Favicon
  const providers = resolvedDomain && resolvedDomain.includes('.')
    ? [
        `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${resolvedDomain}&size=${size}`,
        `https://icon.horse/icon/${resolvedDomain}`,
        `https://unavatar.io/${resolvedDomain}?fallback=false`,
        `https://${resolvedDomain}/favicon.ico`,
      ]
    : [];

  const handleImageError = () => {
    if (providerIndex < providers.length - 1) {
      setProviderIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (!resolvedDomain || !resolvedDomain.includes('.') || hasError || providers.length === 0) {
    if (fallback) {
      return (
        <span className={`inline-flex items-center justify-center ${className} select-none font-bold text-sm`}>
          {fallback}
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center justify-center bg-surfaceElevated rounded-lg ${className}`}>
        <Globe className="w-4 h-4 text-textMuted" />
      </span>
    );
  }

  const currentSrc = providers[providerIndex];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      {!loaded && (
        <span className="absolute inset-0 flex items-center justify-center text-xs opacity-60 select-none animate-pulse">
          {fallback || '🌐'}
        </span>
      )}
      <img
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        loading="eager"
        crossOrigin="anonymous"
        onLoad={() => setLoaded(true)}
        onError={handleImageError}
        className={`${className} object-contain rounded-lg transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
