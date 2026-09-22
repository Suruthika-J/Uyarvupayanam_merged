import React, { useState, useEffect } from 'react'
import SectionHeader, { SubSection } from '../../components/class5/redesign/SectionHeader'
import WeeklyChallengeCard from '../../components/class5/redesign/WeeklyChallengeCard'
import GameCardGrid from '../../components/class5/redesign/GameCardGrid'
import { getCurrentChallenge, getGames } from '../../services/class5DiscoveryService'

export default function SkillQuestsPage() {
  const [challenge, setChallenge] = useState(null)
  const [games, setGames] = useState(null)

  useEffect(() => {
    let mounted = true
    getCurrentChallenge().then((c) => mounted && setChallenge(c))
    getGames().then((g) => mounted && setGames(g))
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <SectionHeader
        eyebrow="🎯 Skill Quests"
        title="Level up one small skill at a time"
        subtitle="Five-minute challenges and playable quests — each one grows the strengths on your radar."
      />

      <SubSection title="This week's 5-minute try-it" subtitle="One tiny task. Helps you live like a real career person.">
      </SubSection>
      <WeeklyChallengeCard challenge={challenge} worldTag={challenge?.worldTag} />

      <SubSection title="Quest arcade" subtitle="Pick a category and play — every quest adds XP to your squad goal.">
      </SubSection>
      <GameCardGrid games={games} loading={!games} />
    </div>
  )
}