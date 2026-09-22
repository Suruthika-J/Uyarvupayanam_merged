import React, { useState, useEffect } from 'react'
import SectionHeader, { SubSection } from '../../components/class5/redesign/SectionHeader'
import SeasonalBanner from '../../components/class5/redesign/SeasonalBanner'
import VideoCardGrid from '../../components/class5/redesign/VideoCardGrid'
import EventsList from '../../components/class5/redesign/EventsList'
import FutureMapGenerator from '../../components/class5/redesign/FutureMapGenerator'
import { getSeasonalEvents, getVideos, getEvents, attendEvent, getSkillProfile } from '../../services/class5DiscoveryService'
import { SAlert } from '../../components/ui'

export default function RealWorldPage() {
  const [seasonal, setSeasonal] = useState(null)
  const [videos, setVideos] = useState(null)
  const [events, setEvents] = useState(null)
  const [attended, setAttended] = useState({})
  const [alert, setAlert] = useState('')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let mounted = true
    getSeasonalEvents().then((se) => mounted && setSeasonal(se?.[0] || null))
    getVideos().then((v) => mounted && setVideos(v))
    getEvents().then((e) => mounted && setEvents(e))
    getSkillProfile().then((p) => mounted && setProfile(p))
    return () => { mounted = false }
  }, [])

  const handleAttend = async (ev) => {
    setAlert('')
    try {
      const res = await attendEvent(ev.id)
      setAttended((prev) => ({ ...prev, [ev.id]: true }))
      setAlert(res?.success ? `✓ You attended "${ev.title}"!` : `Could not confirm attendance for "${ev.title}".`)
      setTimeout(() => setAlert(''), 4000)
    } catch {
      setAlert(`Could not confirm attendance for "${ev.title}".`)
    }
  }

  const featured = (videos || []).filter((v) => v.featured)

  return (
    <div>
      <SectionHeader
        eyebrow="🌍 Real World"
        title="Real people, real work, real stories"
        subtitle="Watch short stories from real careers, catch live events, and learn why every skill you play matters in the real world."
      />

      <SeasonalBanner
        event={seasonal}
        onExplore={() => window.alert(`Seasonal event: ${seasonal?.title} — meet five careers and earn the Festival Explorer badge!`)}
      />

      <SubSection
        title="Career stories"
        subtitle="Short films made for curious minds — watch one a day."
      >
      </SubSection>
      <VideoCardGrid videos={featured.length ? featured : videos} loading={!videos} />

      <SubSection title="More from the world of work" subtitle="Every career world has its own story.">
      </SubSection>
      <VideoCardGrid videos={videos || []} loading={!videos} />

      <SubSection title="Live & recorded events" subtitle="Join real people from real careers — live or anytime.">
      </SubSection>
      <EventsList events={events} onAttend={handleAttend} attendedState={attended} />

      {alert && <div style={{ marginTop: 14 }}><SAlert type="success">{alert}</SAlert></div>}

      <SubSection title="Draw your future map" subtitle="A poster of your home world and the worlds you explored together.">
      </SubSection>
      <FutureMapGenerator profile={profile} />
    </div>
  )
}