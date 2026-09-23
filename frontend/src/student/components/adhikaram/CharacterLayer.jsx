import React from 'react'
import { CHARACTERS } from '../../data/adhikaramEnvironments'
import { ChildWave } from './characters'

// Places the environment's child figure into the world.
export default function CharacterLayer({ environment, animation }) {
  const Kid = CHARACTERS[environment] || ChildWave
  const animClass = animation ? ` adh-anim-${animation}` : ''
  return (
    <div className={`adh-char${animClass}`} aria-hidden="true">
      <div className="adh-char-figure" style={{ width: 170, right: '6%', bottom: '4%' }}>
        <Kid />
      </div>
    </div>
  )
}