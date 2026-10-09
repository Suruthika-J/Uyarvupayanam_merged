import React, { useRef, useEffect, useState, useCallback } from 'react'
import { FiVideo, FiVideoOff, FiShield, FiSmartphone, FiEye, FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiCamera, FiSliders } from 'react-icons/fi'

/**
 * FocusCameraDetector Component
 *
 * Full Hardware Camera Pipeline:
 * - cameraPermission: 'idle' | 'requesting' | 'granted' | 'denied' | 'error'
 * - streamState: 'none' | 'active' | 'stopped'
 * - videoState: 'waiting' | 'connecting' | 'metadata-ready' | 'playing' | 'error'
 * - frameState: 'waiting' | 'available'
 * - faceState: 'unknown' | 'waiting-frames' | 'detecting' | 'detected' | 'not-detected' | 'unavailable'
 * - cameraState: 'OFF' | 'REQUESTING' | 'CONNECTING' | 'RUNNING' | 'ERROR'
 *
 * PRIVACY GUARANTEE:
 * - 100% On-Device Local Processing in Browser RAM.
 * - Video frames are never recorded or sent to any backend server.
 */
export default function FocusCameraDetector({
  active = true,
  autoStart = true,
  detectionMode = 'FULL MONITORING', // 'STANDARD' | 'CAMERA' | 'FULL MONITORING'
  onEventTriggered,
  onSignalStateChange,
  onDistractionDetected,
  onAwayDetected
}) {
  // Granular States
  const [cameraPermission, setCameraPermission] = useState('idle')
  const [streamState, setStreamState] = useState('none')
  const [videoState, setVideoState] = useState('waiting')
  const [frameState, setFrameState] = useState('waiting')
  const [faceState, setFaceState] = useState('unknown')
  const [cameraState, setCameraState] = useState('OFF') // 'OFF' | 'REQUESTING' | 'CONNECTING' | 'RUNNING' | 'ERROR'
  const [errorMessage, setErrorMessage] = useState('')

  // Hardware Camera Device Selection
  const [availableDevices, setAvailableDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  // Real-time video dimensions and diagnostic state
  const [videoDiagnostics, setVideoDiagnostics] = useState({
    videoWidth: 0,
    videoHeight: 0,
    readyState: 0,
    paused: true,
    trackStatus: 'none',
    fps: 0,
    lastFrameTime: null
  })

  // Signal State for Parent UI
  const [signals, setSignals] = useState({
    facePresent: false,
    headDirection: 'FORWARD', // 'FORWARD' | 'LOOKING_AWAY' | 'HEAD_DOWN'
    phoneDetected: false,
    possiblePhone: false,
    detectorAvailable: false
  })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const detectionLoopRef = useRef(null)
  const frameCountRef = useRef(0)
  const lastFpsCheckRef = useRef(Date.now())

  // Tracking state refs (avoids re-triggering effects on state mutation)
  const trackingRef = useRef({
    noFaceStart: null,
    lookingAwayStart: null,
    headDownStart: null,
    phoneStart: null,
    consecutivePhoneFrames: 0,
    activePhoneEvent: false,
    activeAwayEvent: false,
    activeMissingEvent: false
  })

  // Enumerate Video Devices on Mount
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInputs = devices.filter(d => d.kind === 'videoinput')
        setAvailableDevices(videoInputs)
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId)
        }
      }).catch(() => {})
    }
  }, [selectedDeviceId])

  // ── 1. Stop Camera & Complete Resource Cleanup ────────────────────────────
  const stopCamera = useCallback(() => {
    console.log('[CAMERA] Stopping camera stream & canceling detection loop...')

    if (detectionLoopRef.current) {
      clearInterval(detectionLoopRef.current)
      detectionLoopRef.current = null
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop()
          console.log('[CAMERA] Stopped track:', track.label)
        })
      } catch (e) {}
      mediaStreamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }

    trackingRef.current = {
      noFaceStart: null,
      lookingAwayStart: null,
      headDownStart: null,
      phoneStart: null,
      consecutivePhoneFrames: 0,
      activePhoneEvent: false,
      activeAwayEvent: false,
      activeMissingEvent: false
    }

    setCameraPermission('idle')
    setStreamState('stopped')
    setVideoState('waiting')
    setFrameState('waiting')
    setFaceState('unknown')
    setCameraState('OFF')
    setErrorMessage('')

    setVideoDiagnostics({
      videoWidth: 0,
      videoHeight: 0,
      readyState: 0,
      paused: true,
      trackStatus: 'none',
      fps: 0,
      lastFrameTime: null
    })

    const offSignals = {
      facePresent: false,
      headDirection: 'FORWARD',
      phoneDetected: false,
      possiblePhone: false,
      detectorAvailable: false
    }
    setSignals(offSignals)
    if (onSignalStateChange) onSignalStateChange(offSignals)
  }, [onSignalStateChange])

  // ── 2. Start Detection Loop (Single Loop Guard & Non-Zero Frame Check) ────
  const startDetectionLoop = useCallback(() => {
    if (detectionLoopRef.current) return
    console.log('[CAMERA] Starting single frame detection loop...')

    const FACE_MISSING_GRACE = 5 // seconds
    const LOOKING_AWAY_THRESHOLD = 8 // seconds
    const PHONE_CONFIRMATION_FRAMES = 6 // ~500ms confirmation for fast detection

    detectionLoopRef.current = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || !mediaStreamRef.current || !mediaStreamRef.current.active) return

      // Verify actual video dimensions & ready state before processing frames
      if (video.paused || video.ended || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        setFrameState('waiting')
        setFaceState('waiting-frames')
        return
      }

      const W = 160, H = 120
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      try {
        ctx.drawImage(video, 0, 0, W, H)
        const imgData = ctx.getImageData(0, 0, W, H)
        const data = imgData.data

        let totalLuminance = 0
        let faceSkinPixels = 0
        let centralDarkPixels = 0
        let leftSideDarkPixels = 0
        let rightSideDarkPixels = 0
        let leftSum = 0, rightSum = 0, topSum = 0, bottomSum = 0

        for (let y = 0; y < H; y += 2) {
          for (let x = 0; x < W; x += 2) {
            const idx = (y * W + x) * 4
            const r = data[idx], g = data[idx + 1], b = data[idx + 2]
            const lum = 0.299 * r + 0.587 * g + 0.114 * b
            totalLuminance += lum

            // Skin color range heuristic
            const isSkin = (r > 60 && g > 40 && b > 20 && r > g && r > b && (Math.max(r, g, b) - Math.min(r, g, b) > 15))
            if (isSkin) {
              faceSkinPixels++
              if (x < W / 2) leftSum++
              else rightSum++
              if (y < H / 2) topSum++
              else bottomSum++
            }

            // Dark object sampling (Phone to ear or Phone in hand)
            if (lum < 45 && r < 50 && g < 50 && b < 50) {
              // 1. Lower central box (holding phone in hand/chest)
              if (y > H * 0.5 && x >= W * 0.22 && x <= W * 0.78) {
                centralDarkPixels++
              }
              // 2. Left side ear region (holding phone to left ear)
              if (y >= H * 0.2 && y <= H * 0.85 && x < W * 0.35) {
                leftSideDarkPixels++
              }
              // 3. Right side ear region (holding phone to right ear)
              if (y >= H * 0.2 && y <= H * 0.85 && x > W * 0.65) {
                rightSideDarkPixels++
              }
            }
          }
        }

        const sampleCount = (W * H) / 4
        const avgLum = totalLuminance / sampleCount
        const skinRatio = faceSkinPixels / sampleCount
        
        const sideSampleCount = ((W * 0.35) * (H * 0.65)) / 4
        const leftSideRatio = leftSideDarkPixels / Math.max(1, sideSampleCount)
        const rightSideRatio = rightSideDarkPixels / Math.max(1, sideSampleCount)
        const centralSampleCount = ((W * 0.56) * (H * 0.5)) / 4
        const centralDarkRatio = centralDarkPixels / Math.max(1, centralSampleCount)

        // Verify non-black valid frames
        if (avgLum < 2 && skinRatio === 0) {
          setFrameState('waiting')
          setFaceState('waiting-frames')
          return
        }

        // Frames are verified available!
        setFrameState('available')
        setCameraState('RUNNING')

        // FPS & Diagnostics Tracking
        frameCountRef.current++
        const now = Date.now()
        if (now - lastFpsCheckRef.current >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / (now - lastFpsCheckRef.current))
          frameCountRef.current = 0
          lastFpsCheckRef.current = now

          const track = mediaStreamRef.current?.getVideoTracks()[0]
          setVideoDiagnostics({
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState,
            paused: video.paused,
            trackStatus: track ? track.readyState : 'none',
            fps,
            lastFrameTime: new Date().toLocaleTimeString()
          })
        }

        const tr = trackingRef.current
        const isFacePresent = avgLum > 10 && skinRatio > 0.035
        setFaceState(isFacePresent ? 'detected' : 'not-detected')

        if (!isFacePresent) {
          if (!tr.noFaceStart) tr.noFaceStart = now
          const missingSecs = (now - tr.noFaceStart) / 1000

          if (missingSecs > FACE_MISSING_GRACE) {
            const sev = missingSecs > 30 ? 'HIGH' : missingSecs > 15 ? 'MEDIUM' : 'LOW'
            if (!tr.activeMissingEvent) {
              tr.activeMissingEvent = true
              if (onEventTriggered) {
                onEventTriggered({
                  eventType: 'FACE_MISSING',
                  severity: sev,
                  duration: Math.round(missingSecs),
                  confidence: 0.88,
                  reason: `No face detected for ${Math.round(missingSecs)}s`
                })
              }
              if (onAwayDetected) onAwayDetected('No face in camera frame')
            }
          }
        } else {
          tr.noFaceStart = null
          tr.activeMissingEvent = false
        }

        // Head Direction Pose
        let headDir = 'FORWARD'
        if (isFacePresent) {
          const lrRatio = leftSum / Math.max(1, rightSum)
          const tbRatio = topSum / Math.max(1, bottomSum)

          if (lrRatio > 2.8 || lrRatio < 0.35) headDir = 'LOOKING_AWAY'
          else if (tbRatio < 0.32) headDir = 'HEAD_DOWN'
        }

        // Sustained Looking Away
        if (headDir === 'LOOKING_AWAY') {
          if (!tr.lookingAwayStart) tr.lookingAwayStart = now
          const awaySecs = (now - tr.lookingAwayStart) / 1000

          if (awaySecs >= LOOKING_AWAY_THRESHOLD && !tr.activeAwayEvent) {
            tr.activeAwayEvent = true
            if (onEventTriggered) {
              onEventTriggered({
                eventType: 'LOOKING_AWAY',
                severity: awaySecs > 20 ? 'MEDIUM' : 'LOW',
                duration: Math.round(awaySecs),
                confidence: 0.85,
                reason: 'Head turned away from screen for sustained period'
              })
            }
            if (onDistractionDetected) onDistractionDetected('Head turned away')
          }
        } else {
          tr.lookingAwayStart = null
          tr.activeAwayEvent = false
        }

        // Sustained Head Down
        if (headDir === 'HEAD_DOWN') {
          if (!tr.headDownStart) tr.headDownStart = now
        } else {
          tr.headDownStart = null
        }

        // Dual Phone Detection: Detects Phone to Ear (Calling) AND Phone in Hand (Texting)
        let phoneInFrame = false
        let possiblePhone = false

        if (detectionMode === 'FULL MONITORING') {
          const isPhoneToEar = isFacePresent && (leftSideRatio > 0.16 || rightSideRatio > 0.16)
          const isPhoneInHand = centralDarkRatio > 0.16 || (headDir === 'HEAD_DOWN' && centralDarkRatio > 0.08)

          if (isPhoneToEar || isPhoneInHand) {
            phoneInFrame = true
          } else if (leftSideRatio > 0.10 || rightSideRatio > 0.10 || centralDarkRatio > 0.08) {
            possiblePhone = true
          }

          if (phoneInFrame || possiblePhone) {
            tr.consecutivePhoneFrames++
          } else {
            tr.consecutivePhoneFrames = Math.max(0, tr.consecutivePhoneFrames - 1)
          }

          if (tr.consecutivePhoneFrames >= PHONE_CONFIRMATION_FRAMES) {
            if (!tr.phoneStart) tr.phoneStart = now
            const phoneSecs = (now - tr.phoneStart) / 1000

            if (!tr.activePhoneEvent) {
              tr.activePhoneEvent = true
              if (onEventTriggered) {
                onEventTriggered({
                  eventType: 'PHONE_DETECTED',
                  severity: 'HIGH',
                  duration: Math.round(phoneSecs),
                  confidence: 0.85,
                  reason: isPhoneToEar ? 'Phone call posture (phone held to ear)' : 'Handheld phone distraction detected'
                })
              }
              if (onDistractionDetected) onDistractionDetected(isPhoneToEar ? 'Phone call detected' : 'Phone distraction detected')
            }
          } else {
            if (tr.activePhoneEvent) {
              tr.activePhoneEvent = false
              if (onEventTriggered) {
                onEventTriggered({
                  eventType: 'PHONE_USAGE_ENDED',
                  severity: 'LOW',
                  duration: Math.round((now - (tr.phoneStart || now)) / 1000),
                  reason: 'Phone removed from camera frame'
                })
              }
            }
            if (tr.consecutivePhoneFrames === 0) {
              tr.phoneStart = null
            }
          }
        }

        const newSignals = {
          facePresent: isFacePresent,
          headDirection: headDir,
          phoneDetected: tr.activePhoneEvent,
          possiblePhone: possiblePhone && !tr.activePhoneEvent,
          detectorAvailable: true
        }

        setSignals(newSignals)
        if (onSignalStateChange) onSignalStateChange(newSignals)

      } catch (e) {
        console.warn('[CAMERA] Frame analysis error:', e.message)
      }
    }, 80) // ~12 FPS
  }, [detectionMode, onEventTriggered, onSignalStateChange, onDistractionDetected, onAwayDetected])

  // ── 3. Attach Stream & Bind Video Metadata & Playing Handlers ────────────
  const attachStreamToVideo = useCallback((stream) => {
    const video = videoRef.current
    if (!video) {
      console.error('[CAMERA] videoRef.current is not mounted in DOM!')
      return
    }

    console.log('[CAMERA] Attaching stream to video element srcObject...')
    video.srcObject = stream

    const checkAndStartRunning = () => {
      if (!video) return false
      if (video.videoWidth > 0 && video.videoHeight > 0 && !video.paused) {
        console.log(`[CAMERA] Video confirmed running with non-zero dimensions: ${video.videoWidth}x${video.videoHeight}`)
        setFrameState('available')
        setCameraState('RUNNING')
        startDetectionLoop()
        return true
      }
      return false
    }

    const handleVideoReady = async () => {
      console.log(`[CAMERA] video event readyState=${video.readyState}, dims=${video.videoWidth}x${video.videoHeight}`)
      setVideoState('metadata-ready')

      try {
        await video.play()
        console.log('[CAMERA] video.play() succeeded. Paused:', video.paused)
        setVideoState('playing')

        if (!checkAndStartRunning()) {
          // Poll up to 20 times (2 seconds) until videoWidth > 0
          let attempts = 0
          const pollInterval = setInterval(() => {
            attempts++
            if (checkAndStartRunning() || attempts > 20) {
              clearInterval(pollInterval)
            }
          }, 100)
        }
      } catch (err) {
        console.error('[CAMERA] video.play() failed:', err.message)
        setVideoState('error')
        setCameraState('ERROR')
        setErrorMessage(`Video playback error: ${err.message}`)
      }
    }

    video.onloadedmetadata = handleVideoReady
    video.onloadeddata = handleVideoReady
    video.oncanplay = handleVideoReady
    video.onplaying = handleVideoReady

    if (video.readyState >= 1) {
      handleVideoReady()
    }
  }, [startDetectionLoop])

  // Keep a ref to stopCamera so unmount cleanup effect never causes infinite loops on state changes
  const stopCameraRef = useRef(stopCamera)
  useEffect(() => {
    stopCameraRef.current = stopCamera
  }, [stopCamera])

  // ── 4. Enable Camera Handler (Hardware Stream Validation & Fallback) ──────
  const enableCamera = useCallback(async () => {
    if (cameraState === 'REQUESTING' || cameraState === 'CONNECTING') return

    console.log('[CAMERA] Initiating enableCamera flow...')
    setCameraPermission('requesting')
    setCameraState('REQUESTING')
    setErrorMessage('')
    setFaceState('waiting-frames')

    try {
      // 1. Validate existing stream
      let stream = mediaStreamRef.current
      if (stream && stream.active) {
        const tracks = stream.getVideoTracks()
        if (tracks.length > 0 && tracks[0].readyState === 'live') {
          console.log('[CAMERA] Reusing existing active stream:', tracks[0].label)
          setCameraPermission('granted')
          setStreamState('active')
          setCameraState('CONNECTING')
          attachStreamToVideo(stream)
          return
        }
      }

      // 2. Request getUserMedia stream with fallback for constraints
      const constraints = {
        video: (selectedDeviceId && selectedDeviceId !== 'default') ? {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 640 },
          height: { ideal: 480 }
        } : {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      }

      console.log('[CAMERA] Calling getUserMedia with constraints:', constraints)
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (firstErr) {
        console.warn('[CAMERA] Constrained getUserMedia failed, trying fallback { video: true }...', firstErr.message)
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }

      if (!stream || !stream.active) {
        throw new Error('Acquired camera stream is not active.')
      }

      const videoTracks = stream.getVideoTracks()
      if (videoTracks.length === 0 || videoTracks[0].readyState !== 'live') {
        throw new Error('No live video track available in camera stream.')
      }

      console.log('[CAMERA] getUserMedia SUCCESS. Track label:', videoTracks[0].label)
      mediaStreamRef.current = stream

      setCameraPermission('granted')
      setStreamState('active')
      setCameraState('CONNECTING')

      attachStreamToVideo(stream)

    } catch (err) {
      console.error('[CAMERA] getUserMedia error:', err.name, err.message)
      setCameraPermission(err.name === 'NotAllowedError' ? 'denied' : 'error')
      setCameraState('ERROR')
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied in browser. Enable camera permissions in your browser bar.'
          : `Camera error: ${err.message}`
      )
    }
  }, [cameraState, selectedDeviceId, attachStreamToVideo])

  // ── Auto-Start Effect on Active Session ──────────────────────────────────
  useEffect(() => {
    if (active && autoStart && cameraState === 'OFF' && cameraPermission !== 'denied' && cameraPermission !== 'error') {
      console.log('[CAMERA] Auto-starting camera for active focus session...')
      enableCamera()
    }
  }, [active, autoStart, cameraState, cameraPermission, enableCamera])

  // Lifecycle cleanup ONLY on unmount or active=false (uses ref to prevent state-change teardown)
  useEffect(() => {
    if (!active) {
      stopCameraRef.current()
    }
    return () => {
      stopCameraRef.current()
    }
  }, [active])

  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 16,
      padding: '16px 20px',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.1)',
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        
        {/* Left Status Information */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: cameraState === 'RUNNING' ? '#059669' : cameraState === 'CONNECTING' || cameraState === 'REQUESTING' ? '#d97706' : cameraState === 'ERROR' ? '#dc2626' : '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            {cameraState === 'RUNNING' ? <FiVideo size={20} /> : cameraState === 'CONNECTING' || cameraState === 'REQUESTING' ? <FiRefreshCw className="spin" size={20} /> : <FiVideoOff size={20} />}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              {detectionMode === 'FULL MONITORING' ? 'Camera & Phone Distraction Detection' : 'Camera Attention Detection'}
              {cameraState === 'RUNNING' && (
                <span style={{
                  fontSize: 10,
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontWeight: 800,
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  ● LIVE • 100% Local Privacy
                </span>
              )}
            </div>

            {/* Granular Honest Status Messages */}
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {cameraState === 'OFF' && 'Camera is disabled'}
              {cameraState === 'REQUESTING' && 'Requesting camera permission...'}
              {cameraState === 'CONNECTING' && 'Camera connecting, waiting for video frames...'}
              {cameraState === 'RUNNING' && '✓ Camera Running • Local Face Detection Active'}
              {cameraState === 'ERROR' && (errorMessage || 'Camera permission denied or camera error.')}
            </div>
          </div>
        </div>

        {/* Right Controls & Honest Signals */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          
          {/* Signal Badges */}
          <div style={{ display: 'flex', gap: 8 }}>
            {cameraState === 'RUNNING' ? (
              <>
                <span style={{ fontSize: 11, background: signals.facePresent ? '#065f46' : '#991b1b', color: '#fff', padding: '4px 10px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiEye size={12} /> {signals.facePresent ? 'Face Detected' : 'No Face'}
                </span>
                {signals.phoneDetected && (
                  <span style={{ fontSize: 11, background: '#991b1b', color: '#fff', padding: '4px 10px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiSmartphone size={12} /> Phone Detected
                  </span>
                )}
              </>
            ) : (
              <span style={{ fontSize: 11, background: '#334155', color: '#94a3b8', padding: '4px 10px', borderRadius: 12, fontWeight: 700 }}>
                Camera — Disabled
              </span>
            )}
          </div>

          {/* Action Button Matching cameraState */}
          {cameraState === 'OFF' && (
            <button type="button" onClick={enableCamera}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Enable Camera
            </button>
          )}

          {cameraState === 'REQUESTING' && (
            <button type="button" disabled
              style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiRefreshCw className="spin" size={14} /> Requesting Permission...
            </button>
          )}

          {cameraState === 'CONNECTING' && (
            <button type="button" disabled
              style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiRefreshCw className="spin" size={14} /> Connecting...
            </button>
          )}

          {cameraState === 'RUNNING' && (
            <button type="button" onClick={stopCamera}
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Disable Camera
            </button>
          )}

          {cameraState === 'ERROR' && (
            <button type="button" onClick={enableCamera}
              style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Try Again
            </button>
          )}
        </div>
      </div>

      {/* Video Element & Live Camera Preview (ALWAYS MOUNTED IN DOM) */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          
          {/* Mirrored Live Video Element */}
          <div style={{ position: 'relative', width: 160, height: 120, borderRadius: 12, overflow: 'hidden', background: '#000', border: '1px solid #334155', flexShrink: 0 }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: 'block',
                opacity: cameraState === 'RUNNING' ? 1 : 0.2,
                transition: 'opacity 0.3s ease'
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Video Box Placeholder Overlay */}
            {cameraState === 'OFF' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 11, fontWeight: 700, gap: 4 }}>
                <FiVideoOff size={20} />
                Camera Off
              </div>
            )}

            {cameraState === 'CONNECTING' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: 10, fontWeight: 700, gap: 4, padding: 8, textAlign: 'center' }}>
                <FiRefreshCw className="spin" size={16} />
                Connecting frames...
              </div>
            )}

            {cameraState === 'RUNNING' && (
              <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(5, 150, 105, 0.85)', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} /> LIVE
              </div>
            )}
          </div>

          {/* Privacy Note & Hardware Settings */}
          <div style={{ fontSize: 11, color: '#64748b', flex: 1, minWidth: 240, lineHeight: 1.5 }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiShield size={13} /> Strict Zero-Storage Local Guarantee
            </div>
            Processed 100% locally in browser RAM. Video frames are never recorded or sent to any server.

            {/* Camera Device Selector if multiple cameras exist */}
            {availableDevices.length > 1 && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCamera size={12} color="#94a3b8" />
                <select
                  value={selectedDeviceId}
                  onChange={e => { setSelectedDeviceId(e.target.value); stopCamera() }}
                  style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 600, outline: 'none' }}>
                  {availableDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Developer Diagnostics Toggle */}
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={() => setShowDiagnostics(!showDiagnostics)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0 }}>
                <FiSliders size={11} /> {showDiagnostics ? 'Hide Camera Diagnostics' : 'Show Camera Diagnostics'}
              </button>
            </div>

            {showDiagnostics && (
              <div style={{ marginTop: 6, background: '#1e293b', borderRadius: 8, padding: 10, fontFamily: 'monospace', fontSize: 10, color: '#a5b4fc', lineHeight: 1.6 }}>
                [CAMERA DIAGNOSTICS]<br />
                State: {cameraState} | Permission: {cameraPermission}<br />
                Stream: {streamState} | Video: {videoState}<br />
                Resolution: {videoDiagnostics.videoWidth} × {videoDiagnostics.videoHeight}<br />
                ReadyState: {videoDiagnostics.readyState} | Playing: {!videoDiagnostics.paused ? 'TRUE' : 'FALSE'}<br />
                Track Status: {videoDiagnostics.trackStatus} | FPS: {videoDiagnostics.fps}<br />
                Frames: {frameState} | Face: {faceState}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
