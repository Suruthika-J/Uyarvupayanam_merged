import React, { useState } from 'react'
import SectionHeader from '../../components/class5/redesign/SectionHeader'
import SortingQuiz from '../../components/class5/redesign/SortingQuiz'
import { SAlert } from '../../components/ui'

// Standalone full-screen sorting quiz (also reachable from Discover Me).
export default function SortingQuizPage() {
  const [completed, setCompleted] = useState(false)
  return (
    <div>
      <SectionHeader
        eyebrow="Discover Me · Sort Quiz"
        title="Which career world suits you?"
        subtitle="Answer honestly — this quiz tunes your starting world and strength radar."
      />
      <SortingQuiz onCompleted={() => setCompleted(true)} />
      {completed && (
        <div style={{ marginTop: 20 }}>
          <SAlert type="success">Your world is saved! Head to Skill Quests to grow your strengths.</SAlert>
        </div>
      )}
    </div>
  )
}