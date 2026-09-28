import React, { useState } from 'react'
import { resolveCourseImage } from '../../services/graduateCourseImageResolver'

/**
 * GraduateCourseImage
 * 
 * Reusable image component for Course Cards, Upskilling Modules, Career Recommendations,
 * and Learning Resources across the Graduate Portal.
 * 
 * Features:
 * - Topic-specific visual resolution
 * - Skeleton loading state
 * - Graceful onError fallback to SVG Data URI (Zero broken image icons)
 * - Accessibility alt attribute automatically generated from course title
 */
export default function GraduateCourseImage({
  course,
  title,
  height = 180,
  borderRadius = 12,
  style = {},
  showBadge = true,
  aspectRatio = '16/9'
}) {
  const resolved = resolveCourseImage(course || title)
  const [imgSrc, setImgSrc] = useState(resolved.imageUrl)
  const [loading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)

  const handleImageError = () => {
    if (!errored) {
      setErrored(true)
      setImgSrc(resolved.dataUriFallback)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        overflow: 'hidden',
        background: '#0f172a',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        ...style
      }}
    >
      {/* Loading Skeleton */}
      {loading && !errored && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
            backgroundSize: '200% 100%',
            animation: 'pulseSkeleton 1.5s infinite',
            zIndex: 1
          }}
        />
      )}

      {/* Course Image */}
      <img
        src={imgSrc}
        alt={resolved.altText}
        loading="lazy"
        onLoad={() => setLoading(false)}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          opacity: loading ? 0.3 : 1
        }}
      />

      {/* Topic Badge Overlay */}
      {showBadge && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            zIndex: 2,
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <span>{resolved.icon}</span>
          <span>{resolved.title}</span>
        </div>
      )}
    </div>
  )
}
