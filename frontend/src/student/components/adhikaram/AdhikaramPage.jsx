import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAdhikaram, getAdhikaramList } from '../../services/adhikaramService'
import BackgroundLayer from './BackgroundLayer'
import CharacterLayer from './CharacterLayer'
import DecorationLayer from './DecorationLayer'
import ContentSurface from './ContentSurface'
import './adhikaram.css'

const DEFAULT_PALETTE = {
  skyTop: '#2b2147',
  skyBottom: '#ffb37b',
  ground: '#5a4664',
  accent: '#ffc66b',
  cardBg: '#fff6e7',
  cardAccent: '#c98a3d',
}

export default function AdhikaramPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [adhikaram, setAdhikaram] = useState(null)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [fading, setFading] = useState(false)
  const [openKuralId, setOpenKuralId] = useState(null)
  const busyRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setNotFound(false)
      const [detail, all] = await Promise.all([getAdhikaram(id), getAdhikaramList()])
      if (cancelled) return
      setList(Array.isArray(all) ? all : [])
      if (detail) {
        setAdhikaram(detail)
        busyRef.current = false
        setFading(false)
      } else {
        setAdhikaram(null)
        setNotFound(true)
        busyRef.current = false
        setFading(false)
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const hasDetail = openKuralId != null

  function goToWorld(nextId) {
    if (!nextId || busyRef.current) return
    busyRef.current = true
    setFading(true)
    setOpenKuralId(null)
    window.setTimeout(() => {
      navigate(`/student/class5/adhikaram/${nextId}`)
    }, 360)
  }

  function goToPicker() {
    if (busyRef.current) return
    busyRef.current = true
    setFading(true)
    setOpenKuralId(null)
    window.setTimeout(() => {
      navigate('/student/class5/adhikaram')
    }, 360)
  }

  const display = adhikaram
  const palette = display?.theme?.palette || DEFAULT_PALETTE
  const environment = display?.theme?.environment || 'sunrise'
  const animation = display?.theme?.animation || 'drift'

  const prevName = list.find((a) => String(a.id) === String(display?.navigation?.previousId))?.nameTamil
  const nextName = list.find((a) => String(a.id) === String(display?.navigation?.nextId))?.nameTamil
  const navigation = display
    ? { ...display.navigation, previousName: prevName, nextName }
    : {}

  const paletteStyle = {
    '--adh-sky-top': palette.skyTop,
    '--adh-sky-bottom': palette.skyBottom,
    '--adh-ground': palette.ground,
    '--adh-accent': palette.accent,
    '--adh-card-bg': palette.cardBg,
    '--adh-card-accent': palette.cardAccent,
  }

  if (loading && !display) {
    return (
      <div className="adhikaram-root" style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }}>
        <div className="adh-skeleton" aria-label="Loading world" role="status">
          <div className="adh-skel-block" style={{ top: '6%', height: 150 }} />
          <div className="adh-skel-block" style={{ top: '34%', height: 90 }} />
          <div className="adh-skel-block" style={{ top: '52%', height: 90 }} />
        </div>
      </div>
    )
  }

  if (notFound || !display) {
    return (
      <div className="adhikaram-root" style={{ ...paletteStyle, minHeight: 'clamp(420px, 50vh, 620px)' }}>
        <BackgroundLayer environment={environment} />
        <div className="adh-content">
          <div className="adh-intro">
            <span className="adh-intro-eyebrow">World not found</span>
            <p className="adh-intro-text">
              We could not find that Kural world. It may have been renamed or is not part of this six-chapter
              collection yet.
            </p>
            <div className="kural-detail-actions">
              <button type="button" className="adh-btn adh-btn-primary" onClick={goToPicker}>
                Back to all worlds
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`adhikaram-root${fading ? ' is-fading' : ''}${hasDetail ? ' has-detail' : ''}`}
      style={{ ...paletteStyle, minHeight: 'clamp(640px, 70vh, 900px)' }}
    >
      <div className="adh-scene" key={adhikaram.id}>
        <BackgroundLayer environment={environment} />
        <DecorationLayer environment={environment} animation={animation} />
        <CharacterLayer environment={environment} animation={animation} />
      </div>

      <ContentSurface
        adhikaram={{ ...display, navigation }}
        openKuralId={openKuralId}
        onOpenKural={setOpenKuralId}
        onCloseKural={() => setOpenKuralId(null)}
        onNavigate={goToWorld}
        onAllWorlds={goToPicker}
      />
    </div>
  )
}