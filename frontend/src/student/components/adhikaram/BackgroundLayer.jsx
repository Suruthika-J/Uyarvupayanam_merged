import React from 'react'
import { SCENES } from '../../data/adhikaramEnvironments'
import { SunriseScene } from './scenes'

// Paints the sky gradient + the world's artwork silhouette.
export default function BackgroundLayer({ environment }) {
  const Scene = SCENES[environment] || SunriseScene
  return (
    <>
      <div className="adh-bg-sky" />
      <div className="adh-bg-scene">
        <Scene />
      </div>
    </>
  )
}