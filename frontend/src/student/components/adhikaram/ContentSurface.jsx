import React, { Fragment } from 'react'
import KuralCard from './KuralCard'
import KuralDetail from './KuralDetail'
import AdhikaramNav from './AdhikaramNav'

const CARD_STYLES = ['storybook', 'notebook', 'board', 'chatbubble']

export default function ContentSurface({
  adhikaram,
  openKuralId,
  onOpenKural,
  onCloseKural,
  onNavigate,
  onAllWorlds,
}) {
  const { kurals = [], navigation = {}, section, nameTamil, nameEn, number, intro } = adhikaram

  return (
    <div className="adh-content">
      <header className="adh-intro">
        <span className="adh-intro-eyebrow">
          {section} · Chapter {number}
        </span>
        <h1 className="adh-intro-title">{nameTamil}</h1>
        <p className="adh-intro-en">{nameEn}</p>
        <p className="adh-intro-text">{intro}</p>
      </header>

      <div className="adh-kural-grid">
        {kurals.map((kur, i) => {
          const open = kur.id === openKuralId
          return (
            <Fragment key={kur.id}>
              <KuralCard
                kural={kur}
                cardStyle={CARD_STYLES[i % CARD_STYLES.length]}
                isOpen={open}
                onOpen={onOpenKural}
              />
              {open && <KuralDetail kural={kur} onClose={onCloseKural} />}
            </Fragment>
          )
        })}
      </div>

      <AdhikaramNav
        previousId={navigation.previousId}
        nextId={navigation.nextId}
        previousName={navigation.previousName}
        nextName={navigation.nextName}
        onNavigate={onNavigate}
        onAllWorlds={onAllWorlds}
      />
    </div>
  )
}