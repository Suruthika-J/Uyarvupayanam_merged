// EngArt — cartoon SVG icon component for the English Adventure.
// viewBox 0 0 64 64. All icons live in ./artIcons (constants only, so fast
// refresh stays happy); this file only exports the component.

import React from 'react'
import { ART } from './artIcons'

export default function EngArt({ k, size = 44, className = '' }) {
  const icon = ART[k] || ART.star
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {icon}
    </svg>
  )
}