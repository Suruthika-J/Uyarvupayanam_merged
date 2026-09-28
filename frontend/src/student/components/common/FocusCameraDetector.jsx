import React, { useRef, useEffect, useState } from 'react'
import { FiVideo, FiVideoOff, FiAlertCircle, FiCheckCircle, FiShield } from 'react-icons/fi'

/**
 * FocusCameraDetector Component
 *
 * Privacy-first browser-only attention detector using HTML5 video & canvas frame diffing.
 *
 * PRIVACY GUARANTEE:
 * - Camera stream is accessed ONLY when enabled by user.
 * - All frame analysis is done locally in browser RAM using canvas context.
 * - NO video recordings or facial images are ever transmitted to any server or saved to disk.
 * - All media stream tracks are immediately stopped when component unmounts or session stops.
 */
export default function FocusCameraDetector({ active, onDistractionDetected, onAwayDetected }) {
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [permissionState, setPermissionState] = useState('prompt') // 'prompt' | 'granted' | 'denied' | 'error'
  const [statusMessage, setStatusMessage] = useState('Camera attention detection is optional.')
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const prevFrameRef = useRef(null)
  const awayTimerRef = useRef(null)
  const intervalRef = useRef(null)

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCameraEnabled(false)
    setStatusMessage('Camera attention detection turned off.')
  }

  const startCamera = async () => {
    try {
      setStatusMessage('Requesting camera permission...')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, frameRate: 15 } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraEnabled(true)
      setPermissionState('granted')
      setStatusMessage('Active • 100% On-Device Privacy Protection')
      startAnalysisLoop()
    } catch (err) {
      console.warn('FocusCameraDetector permission denied or error:', err.message)
      setPermissionState('denied')
      setCameraEnabled(false)
      setStatusMessage('Camera access denied or unavailable. Focus mode continuing with tab monitoring.')
    }
  }

  const startAnalysisLoop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      if (!ctx) return

      canvas.width = 160
      canvas.height = 120
      ctx.drawImage(video, 0, 0, 160, 120)

      try {
        const frame = ctx.getImageData(0, 0, 160, 120)
        const data = frame.data
        let currentLuminanceSum = 0

        // Grayscale luminance calculation
        for (let i = 0; i < data.length; i += 4) {
          currentLuminanceSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        }

        const avgLuminance = currentLuminanceSum / (160 * 120)

        // User Away Detection: extremely low or static luminance change pattern
        if (avgLuminance < 8) {
          // Low light or frame obscured / user away
          if (!awayTimerRef.current) {
            awayTimerRef.current = setTimeout(() => {
              if (onAwayDetected) onAwayDetected('User away from frame')
            }, 3500)
          }
        } else {
          if (awayTimerRef.current) {
            clearTimeout(awayTimerRef.current)
            awayTimerRef.current = null
          }
        }

        // Motion / Distraction Detection via frame diffing
        if (prevFrameRef.current) {
          let diffSum = 0
          const prev = prevFrameRef.current
          for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
            diffSum += Math.abs(data[i] - prev[i])
          }
          const avgDiff = diffSum / (data.length / 16)

          // Significant motion spikes indicates turning away or mobile interaction
          if (avgDiff > 42) {
            if (onDistractionDetected) onDistractionDetected('Head movement / shift detected')
          }
        }

        prevFrameRef.current = data
      } catch (e) {
        // Safe cross-origin fallback
      }
    }, 600)
  }

  // Handle active session stop/cleanup
  useEffect(() => {
    if (!active && cameraEnabled) {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [active])

  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 14,
      padding: '16px 20px',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.1)',
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: cameraEnabled ? '#059669' : '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            {cameraEnabled ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              Camera Attention Detection — Optional
              <span style={{
                fontSize: 10,
                background: 'rgba(52, 211, 153, 0.15)',
                color: '#34d399',
                padding: '2px 8px',
                borderRadius: 10,
                fontWeight: 800,
                border: '1px solid rgba(52, 211, 153, 0.3)'
              }}>
                100% On-Device Privacy
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {statusMessage}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={cameraEnabled ? stopCamera : startCamera}
          style={{
            background: cameraEnabled ? 'rgba(239, 68, 68, 0.2)' : '#0284c7',
            color: cameraEnabled ? '#fca5a5' : '#fff',
            border: cameraEnabled ? '1px solid rgba(239, 68, 68, 0.4)' : 'none',
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {cameraEnabled ? 'Disable Camera' : 'Enable Camera Detection'}
        </button>
      </div>

      {/* Hidden elements for browser processing */}
      <div style={{ display: cameraEnabled ? 'block' : 'none', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: 100, height: 75, borderRadius: 8, objectFit: 'cover', background: '#000' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ fontSize: 11, color: '#64748b', flex: 1 }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiShield size={13} /> Strict Zero-Storage Guarantee
            </div>
            Video frames are processed in-memory for head movement analysis. Raw video or facial images are never stored or uploaded.
          </div>
        </div>
      </div>
    </div>
  )
}
