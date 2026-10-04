import React from 'react'
import SkillGamePage from './SkillGamePage'

// The starter diagnostic reuses the full game engine in diagnostic mode
// (same shell, hints, resume and completion — just the special 8-task set).
export default function SkillDiagnosticPage() {
  return <SkillGamePage mode="diagnostic" />
}