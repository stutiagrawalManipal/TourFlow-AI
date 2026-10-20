import React, { useMemo } from 'react';
import { createQrMatrix } from '../utils/qrcode';

// Renders text as a scannable QR code (SVG)
export default function QRCode({ value, size = 176 }) {
  const modules = useMemo(() => createQrMatrix(value), [value]);
  const count = modules.length + 8; // 4-module quiet zone on each side

  let path = '';
  modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) path += `M${x + 4} ${y + 4}h1v1h-1z`;
    });
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${count} ${count}`} role="img" aria-label={`QR code: ${value}`} shapeRendering="crispEdges">
      <rect width={count} height={count} fill="#ffffff" />
      <path d={path} fill="#070c1a" />
    </svg>
  );
}
