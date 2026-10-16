'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { extractDomain, getFaviconUrl } from '../lib/data';

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
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const resolvedDomain = domain || (url ? extractDomain(url) : '');
  const faviconSrc = resolvedDomain && resolvedDomain.includes('.')
    ? getFaviconUrl(resolvedDomain, size)
    : null;

  if (!faviconSrc || error) {
    if (fallback) {
      return (
        <span className={`inline-flex items-center justify-center ${className} select-none`}>
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

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {!loaded && (
        <span className="absolute inset-0 flex items-center justify-center text-xs opacity-50 select-none animate-pulse">
          {fallback || '🌐'}
        </span>
      )}
      <img
        src={faviconSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} object-contain rounded-lg transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
