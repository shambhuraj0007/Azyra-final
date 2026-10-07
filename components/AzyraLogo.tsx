'use client';

import Image from 'next/image';

interface AzyraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export default function AzyraLogo({
  size = 'md',
  showWordmark = true,
  className = '',
}: AzyraLogoProps) {
  const iconDimensions = {
    sm: { width: 26, height: 26, textClass: 'text-base tracking-[0.2em]' },
    md: { width: 34, height: 34, textClass: 'text-xl tracking-[0.25em]' },
    lg: { width: 44, height: 44, textClass: 'text-2xl tracking-[0.3em]' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Azyra Glyph Icon */}
      <div className="relative flex items-center justify-center shrink-0 rounded-xl bg-white p-1 shadow-md shadow-limeAccent/10 ring-1 ring-borderMuted transition-transform group-hover:scale-105">
        <Image
          src="/web-app-manifest-192x192.png"
          alt="Azyra Icon"
          width={iconDimensions.width}
          height={iconDimensions.height}
          className="object-contain rounded-lg"
          priority
        />
      </div>

      {/* Azyra Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center">
          <span
            className={`font-black text-textMain ${iconDimensions.textClass} leading-none font-heading`}
          >
            AZYRA
          </span>
        </div>
      )}
    </div>
  );
}
