import React, { useState } from 'react';

/**
 * Placeholder used when a destination has no photograph yet, or the photo fails to load.
 * A gradient with the destination name (generated, so it never needs a download).
 */
export function placeholderImage(name = '', id = 1) {
  const hue = (Number(id) * 47) % 360 || 200;
  const safe = String(name).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const fontSize = Math.min(36, Math.floor(1300 / Math.max(safe.length, 1)));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},45%,24%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 40) % 360},50%,10%)"/>
    </linearGradient></defs>
    <rect width="800" height="500" fill="url(#g)"/>
    <text x="400" y="260" font-family="sans-serif" font-size="${fontSize}" font-weight="700"
      fill="rgba(255,255,255,0.35)" text-anchor="middle">${safe}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Responsive, lazy-loaded destination photograph.
 * - srcset lets the browser download the smallest size that looks sharp
 * - loading="lazy" + decoding="async" so off-screen photos do not slow the page
 * - the parent decides the aspect ratio; object-cover crops consistently
 * - falls back to the placeholder if there is no photo or it fails to load
 */
export default function DestinationImage({ image, name, id, sizes = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw', priority = false, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <img
        src={placeholderImage(name, id)}
        alt={image && failed ? `${image.alt} (photo could not be loaded)` : `No photograph yet for ${name}`}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  const srcSet = (image.srcset || []).map((s) => `${s.url} ${s.width}w`).join(', ');
  return (
    <img
      src={image.url}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes : undefined}
      width={image.width || undefined}
      height={image.height || undefined}
      alt={image.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={priority ? 'high' : undefined}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}

// Credit line required by CC BY / BY-SA licences
export function ImageCredit({ image, className = '' }) {
  if (!image) return null;
  return (
    <p className={`text-[10px] text-slate-400 ${className}`}>
      Photo: {image.credit || 'Unknown'}
      {image.license && (
        <>
          {' • '}
          {image.licenseUrl ? (
            <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-300">{image.license}</a>
          ) : (
            image.license
          )}
        </>
      )}
      {image.sourceUrl && (
        <>
          {' • '}
          <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-300">Source</a>
        </>
      )}
    </p>
  );
}
