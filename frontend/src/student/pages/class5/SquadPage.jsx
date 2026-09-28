import React, { useState, useEffect } from 'react'
import SectionHeader, { SubSection } from '../../components/class5/redesign/SectionHeader'
import ExpeditionProgress from '../../components/class5/redesign/ExpeditionProgress'
import SpotlightCard from '../../components/class5/redesign/SpotlightCard'
import NudgeFeed from '../../components/class5/redesign/NudgeFeed'
import { getExpedition, getSpotlight, getNudges, contributeToExpedition } from '../../services/class5DiscoveryService'
import { SAlert } from '../../components/ui'

export default function SquadPage() {
  const [expedition, setExpedition] = useState(null)
  const [spotlight, setSpotlight] = useState(null)
  const [nudges, setNudges] = useState([])
  const [contributing, setContributing] = useState(false)
  const [toast, setToast] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    getExpedition().then((e) => mounted && setExpedition(e))
    getSpotlight().then((s) => mounted && setSpotlight(s))
    getNudges().then((n) => mounted && setNudges(n))
    return () => { mounted = false }
  }, [])

  const handleContribute = async () => {
    if (contributing) return
    setContributing(true)
    setError('')
    try {
      const res = await contributeToExpedition(expedition.id, { xp: 15 })
      if (res?.success) {
        setExpedition((prev) => ({
          ...prev,
          myXp: (prev.myXp || 0) + 15,
          currentXp: prev.currentXp + 15,
          pct: Math.min(100, prev.pct + 2),
        }))
        setToast(true)
        setTimeout(() => setToast(false), 3200)
      }
    } catch {
      setError('Could not add your XP right now. Please try again.')
    } finally {
      setContributing(false)
    }
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Squad"
        title="Grow together, not against each other"
        subtitle="Your class works as one crew. Every quest you play moves the whole group closer to unlocking fresh career worlds."
      />

      <SpotlightCard spotlight={spotlight} />

      <ExpeditionProgress
        expedition={expedition}
        onContribute={() => handleContribute()}
        contributedToast={toast}
      />

      {error && <div style={{ marginTop: 14 }}><SAlert type="error">{error}</SAlert></div>}

      <SubSection title="Mentor & family conversation starters" subtitle="Positive, effort-based questions — no marks, no comparison.">
      </SubSection>
      <NudgeFeed nudges={nudges} />
    </div>
  )
}