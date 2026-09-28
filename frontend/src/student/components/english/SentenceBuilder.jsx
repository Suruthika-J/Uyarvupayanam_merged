import React, { useEffect, useRef, useState } from 'react'
import { SENTENCE_LEVELS, sentencesForLevel } from '../../data/english/englishSentences'
import { recordEnglishActivity } from '../../services/englishService'
import { STAR_REWARDS, badgeByKey } from '../../data/english/englishRewards'
import { stopSpeaking } from '../../utils/speech'
import { useStudentAuth } from '../../context/StudentAuthContext'
import EnglishNav from './EnglishNav'
import EnglishBuddy from './EnglishBuddy'
import EngArt from './art'
import { BADGE_ART, SCENE_EMOJI_ART } from './artIcons'
import './english.css'

const LEVEL_SOFT = { 1: '#e6faf1', 2: '#fef5e0', 3: '#f3eeff' }

const shuffleTiles = (arr) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

function pickSet(levelValue, nextUsed) {
  const pool = sentencesForLevel(levelValue)
  const unused = pool.filter((s) => !nextUsed.includes(s.id))
  const src = unused.length ? unused : pool
  const set = src[Math.floor(Math.random() * src.length)]
  return { set, used: [...nextUsed, set.id] }
}

export default function SentenceBuilder() {
  const { isAuthenticated } = useStudentAuth()

  const [level, setLevel] = useState(1)
  const [currentSet, setCurrentSet] = useState(() => pickSet(1, []).set)
  const [available, setAvailable] = useState(() => (currentSet ? shuffleTiles(currentSet.tiles) : []))
  const [placed, setPlaced] = useState([])
  const [checked, setChecked] = useState(null) // null | 'right' | 'wrong'
  const [builtText, setBuiltText] = useState('')
  const [usedIds, setUsedIds] = useState(() => (currentSet ? [currentSet.id] : []))
  const [solvedInRound, setSolvedInRound] = useState(0)
  const [roundDone, setRoundDone] = useState(false)
  const [newBadges, setNewBadges] = useState([])
  const [buddy, setBuddy] = useState({
    state: 'happy',
    message: 'Pick a level, then tap the tiles in the right order to build shining sentences!',
  })

  const awardedRef = useRef(false)
  const timerRef = useRef(null)

  const activeLevel = SENTENCE_LEVELS.find((l) => l.level === level) || SENTENCE_LEVELS[0]

  function pickAndLoad(levelValue, nextUsed) {
    const { set, used } = pickSet(levelValue, nextUsed)
    setCurrentSet(set)
    setUsedIds(used)
    setAvailable(shuffleTiles(set.tiles))
    setPlaced([])
    setChecked(null)
    setBuiltText('')
  }

  useEffect(() => {
    return () => {
      stopSpeaking()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleLevelChange(nextLevel) {
    if (nextLevel === level) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setLevel(nextLevel)
    awardedRef.current = false
    setNewBadges([])
    setSolvedInRound(0)
    setRoundDone(false)
    setChecked(null)
    setBuddy({ state: 'happy', message: 'Fresh level! Build three sentences to earn your stars.' })
    pickAndLoad(nextLevel, [])
  }

  function handleTile(tile) {
    if (!currentSet || checked === 'right' || roundDone) return
    if (placed.length >= currentSet.tiles.length) return
    const idx = available.findIndex((t) => t === tile)
    if (idx === -1) return
    const nextAvailable = available.slice()
    nextAvailable.splice(idx, 1)
    setAvailable(nextAvailable)
    setPlaced([...placed, tile])
    setChecked(null)
    setBuiltText('')
  }

  function handleSlot(index) {
    if (!currentSet || checked === 'right' || roundDone) return
    const tile = placed[index]
    if (!tile) return
    setPlaced(placed.filter((_, i) => i !== index))
    setAvailable([...available, tile])
    setChecked(null)
    setBuiltText('')
  }

  function handleClear() {
    if (!currentSet || roundDone || placed.length === 0) return
    setAvailable([...available, ...placed])
    setPlaced([])
    setChecked(null)
    setBuiltText('')
  }

  async function finishRound() {
    if (awardedRef.current) {
      setRoundDone(true)
      return
    }
    awardedRef.current = true
    setRoundDone(true)
    setBuddy({
      state: 'celebrating',
      message: 'Three shining sentences! Round complete — you are a sentence star!',
    })
    try {
      const res = await recordEnglishActivity({ activity: 'sentence-builder', stars: STAR_REWARDS['sentence-builder'], completed: true })
      if (res && res.newBadges && res.newBadges.length) setNewBadges(res.newBadges)
    } catch {
      /* the service already falls back to this device's storage */
    }
  }

  function handleCheck() {
    if (!currentSet || placed.length === 0 || checked === 'right') return
    const built = placed.join(' ')
    const target = currentSet.sentence.trim()
    setBuiltText(built)
    if (built === target) {
      setChecked('right')
      setBuddy({ state: 'celebrating', message: 'Perfect sentence! You placed every word just right!' })
      const nextSolved = solvedInRound + 1
      setSolvedInRound(nextSolved)
      if (nextSolved >= 3) {
        timerRef.current = setTimeout(() => finishRound(), 1400)
      } else {
        timerRef.current = setTimeout(() => {
          setBuddy({
            state: 'happy',
            message: `That is ${nextSolved} down! ${3 - nextSolved} more to go — keep going!`,
          })
          pickAndLoad(level, [...usedIds, currentSet.id])
        }, 1600)
      }
    } else {
      setChecked('wrong')
      setBuddy({
        state: 'encouraging',
        message: 'Look at the word order — which word usually comes FIRST? Try sliding the tiles in a new order!',
      })
      setAvailable([...available, ...placed])
      setPlaced([])
    }
  }

  function newRound() {
    awardedRef.current = false
    setNewBadges([])
    setSolvedInRound(0)
    setRoundDone(false)
    setChecked(null)
    setBuddy({ state: 'happy', message: 'New round! Build three fresh sentences to earn your stars.' })
    pickAndLoad(level, [])
  }

  return (
    <div className="eng-root" style={{ '--eng-accent': activeLevel.color, '--eng-soft': LEVEL_SOFT[level] || '#e0eef6' }}>
      <EnglishNav current="sentence-builder" />

      <header className="eng-hero">
        <span className="eng-eyebrow">Class 5 · Sentence Builder</span>
        <h1 className="eng-h1">Sentence Builder</h1>
        <p className="eng-lede">Tap the word tiles in the right order to build shining sentences.</p>
        {!isAuthenticated && (
          <p className="eng-guest-note">
            Explore freely! Sign in to keep your stars, badges and streak.
          </p>
        )}
      </header>

      {newBadges.map((key) => {
        const b = badgeByKey(key)
        return (
          <div key={key} className="eng-earned" role="status">
            <span className="eng-earned-emoji" aria-hidden="true"><EngArt k={BADGE_ART[b.key] || 'star'} size={28} /></span>
            <span>New badge! {b.name}</span>
          </div>
        )
      })}

      <div className="eng-level-pick">
        {SENTENCE_LEVELS.map((l) => (
          <button
            key={l.level}
            type="button"
            className={`eng-level-opt${level === l.level ? ' active' : ''}`}
            onClick={() => handleLevelChange(l.level)}
          >
            <span className="eng-level-opt-emoji" aria-hidden="true"><EngArt k={SCENE_EMOJI_ART[l.emoji] || 'star'} size={22} /></span>
            <span className="eng-level-opt-name">{l.name}</span>
            <span className="eng-level-opt-sub">{l.minWords}–{l.maxWords} words</span>
          </button>
        ))}
      </div>

      {!roundDone && currentSet && (
        <div style={{
          background: '#fff',
          border: '1.5px solid #e8eef5',
          borderRadius: 26,
          padding: 22,
          boxShadow: '0 14px 30px -18px rgba(15, 76, 117, 0.25)',
        }}>
          <div className="eng-between">
            <span className="eng-chip"><EngArt k={SCENE_EMOJI_ART[activeLevel.emoji] || 'star'} size={16} /> {activeLevel.name}</span>
            <span className="eng-chip eng-chip-soft">Sentence {solvedInRound + 1} of 3</span>
          </div>

          <div className="eng-mt">
            <div className="eng-scene-emoji" aria-hidden="true"><EngArt k={SCENE_EMOJI_ART[currentSet.scene] || 'star'} size={56} /></div>
            <div className="eng-scene-label">{currentSet.sceneLabel}</div>
          </div>

          <div className="eng-slot-area">
            {currentSet.tiles.map((tile, i) => {
              const filled = placed[i]
              return (
                <button
                  key={`${tile}-${i}`}
                  type="button"
                  className={`eng-slot${filled ? ' filled' : ''}`}
                  onClick={() => handleSlot(i)}
                  disabled={!filled || checked === 'right'}
                >
                  {filled || '·'}
                </button>
              )
            })}
          </div>

          <div className="eng-tile-area">
            {available.map((tile, i) => (
              <button
                key={`${tile}-${i}`}
                type="button"
                className="eng-tile"
                onClick={() => handleTile(tile)}
                disabled={checked === 'right'}
              >
                {tile}
              </button>
            ))}
          </div>

          <p className={`eng-built${checked ? ` ${checked}` : ''}`}>{builtText}</p>

          <div className="eng-row eng-mt">
            <button
              type="button"
              className="eng-btn eng-btn-primary"
              onClick={handleCheck}
              disabled={placed.length === 0 || checked === 'right'}
            >
              Check my sentence
            </button>
            <button
              type="button"
              className="eng-btn eng-btn-ghost"
              onClick={handleClear}
              disabled={placed.length === 0 || checked === 'right'}
            >
              Clear
            </button>
          </div>

          <div className="eng-mt">
            <EnglishBuddy state={buddy.state} message={buddy.message} />
          </div>
        </div>
      )}

      {roundDone && (
        <div className="eng-round-summary">
          <EngArt k="blocks" size={46} />
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, color: '#1e293b', margin: '10px 0 4px' }}>
            Round complete!
          </h2>
          <p className="eng-lede" style={{ margin: '6px auto 12px', maxWidth: 480 }}>
            You built 3 shining sentences on the {activeLevel.name} level.
          </p>
          <div className="eng-stars">
            {[1, 2, 3].map((i) => (
              <span key={i} className="eng-star on"><EngArt k="star" size={26} /></span>
            ))}
          </div>
          <div className="eng-center eng-mt">
            <button type="button" className="eng-btn eng-btn-primary" onClick={newRound}>New round</button>
          </div>
          <div className="eng-mt">
            <EnglishBuddy state="celebrating" message="Three shining sentences! Ready for a new round?" />
          </div>
        </div>
      )}
    </div>
  )
}