import React, { useEffect, useRef, useState } from 'react'
import { LISTEN_SENTENCES } from '../../data/english/englishSentences'
import { recordEnglishActivity } from '../../services/englishService'
import { STAR_REWARDS, badgeByKey } from '../../data/english/englishRewards'
import { speak, stopSpeaking, recognitionSupported, createRecognition } from '../../utils/speech'
import { useStudentAuth } from '../../context/StudentAuthContext'
import EnglishNav from './EnglishNav'
import EnglishBuddy from './EnglishBuddy'
import EngArt from './art'
import { BADGE_ART, SCENE_EMOJI_ART } from './artIcons'
import './english.css'

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const keyWords = (sentence) => normalize(sentence).split(' ')

// Word-by-word containment: every key word of the sentence must appear in the
// spoken (or typed) answer — extra words are totally fine.
const wordsContained = (sentence, transcript) => {
  const spoken = normalize(transcript).split(' ')
  if (!spoken.length) return false
  return keyWords(sentence).every((w) => spoken.includes(w))
}

const ERROR_MSGS = {
  'not-allowed': {
    state: 'explaining',
    typing: true,
    msg: 'The microphone needs a little permission. You can type your answer instead — that helps too!',
  },
  'no-speech': {
    state: 'explaining',
    typing: false,
    msg: 'I did not hear anything — try speaking a little closer to the mic, or type your answer.',
  },
  network: {
    state: 'explaining',
    typing: true,
    msg: 'The microphone service is offline right now — typing works fine!',
  },
  'audio-capture': {
    state: 'explaining',
    typing: false,
    msg: 'The mic could not catch your voice — try once more, or type your answer.',
  },
  aborted: {
    state: 'encouraging',
    typing: false,
    msg: 'That listening session stopped early — let us try again!',
  },
  unsupported: {
    state: 'explaining',
    typing: true,
    msg: 'This browser does not have the microphone helper — typing your answer works great!',
  },
}

export default function ListenSpeak() {
  const { isAuthenticated } = useStudentAuth()

  const [useTyping, setUseTyping] = useState(() => !recognitionSupported())
  const [doneIds, setDoneIds] = useState(() => new Set())
  const [listeningId, setListeningId] = useState(null)
  const [transcripts, setTranscripts] = useState({})
  const [typed, setTyped] = useState({})
  const [repeatedCount, setRepeatedCount] = useState(0)
  const [roundDone, setRoundDone] = useState(false)
  const [newBadges, setNewBadges] = useState([])
  const [buddy, setBuddy] = useState({
    state: 'happy',
    message: 'Hear the sentence, then say it back — Buddy is listening kindly.',
  })

  const recRef = useRef(null)
  const awardedRef = useRef(false)
  const sessionRef = useRef(0)

  const doneCount = doneIds.size

  function stopListening() {
    sessionRef.current += 1 // invalidate any running session callbacks
    if (recRef.current) {
      try {
        recRef.current.abort()
      } catch {
        /* noop */
      }
      recRef.current = null
    }
    setListeningId(null)
  }

  useEffect(() => {
    return () => {
      stopSpeaking()
      stopListening()
    }
  }, [])

  function markDone(id) {
    setDoneIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  function handleResult(card, transcript) {
    if (wordsContained(card.text, transcript)) {
      markDone(card.id)
      setRepeatedCount((c) => c + 1)
      setTranscripts((prev) => ({ ...prev, [card.id]: '' }))
      setTyped((prev) => ({ ...prev, [card.id]: '' }))
      setBuddy({ state: 'celebrating', message: 'You said it beautifully! I heard every word!' })
      if (!awardedRef.current) {
        const next = new Set(doneIds)
        if (!next.has(card.id)) next.add(card.id)
        if (next.size >= 3) {
          awardedRef.current = true
          stopListening()
          setRoundDone(true)
          setBuddy({
            state: 'celebrating',
            message: 'Three sentences said aloud — you are a natural listener and speaker!',
          })
          recordEnglishActivity({ activity: 'listen-speak', stars: STAR_REWARDS['listen-speak'], completed: true })
            .then((res) => {
              if (res && res.newBadges && res.newBadges.length) setNewBadges(res.newBadges)
            })
            .catch(() => {})
        }
      }
    } else {
      setBuddy({
        state: 'encouraging',
        message: `So close! You said "${transcript}" — the sentence has these words: ${keyWords(card.text).join(', ')}. Try once more!`,
      })
    }
  }

  function handleSayIt(card) {
    stopSpeaking()
    stopListening()
    const sid = sessionRef.current + 1
    sessionRef.current = sid
    setListeningId(card.id)
    setTranscripts((prev) => ({ ...prev, [card.id]: '' }))
    setBuddy({ state: 'listening', message: `I am all ears — say this sentence back: "${card.text}"!` })

    const rec = createRecognition({
      onInterim: (text) => {
        if (sid !== sessionRef.current) return
        setTranscripts((prev) => ({ ...prev, [card.id]: text }))
      },
      onFinal: (finalText) => {
        if (sid !== sessionRef.current) return
        setTranscripts((prev) => ({ ...prev, [card.id]: finalText }))
        setListeningId(null)
        handleResult(card, finalText)
      },
      onError: (code) => {
        if (sid !== sessionRef.current) return
        setListeningId(null)
        const info = ERROR_MSGS[code] || ERROR_MSGS.aborted
        setBuddy({ state: info.state, message: info.msg })
        if (info.typing) setUseTyping(true)
      },
      onEnd: () => {
        if (sid !== sessionRef.current) return
        setListeningId(null)
      },
    })

    if (!rec) return
    recRef.current = rec
    try {
      rec.start()
    } catch {
      setListeningId(null)
      setUseTyping(true)
      setBuddy({
        state: 'explaining',
        message: 'The microphone could not start — typing your answer works just as well!',
      })
    }
  }

  function handlePlay(card) {
    stopListening()
    stopSpeaking()
    speak(card.text)
    setBuddy({ state: 'happy', message: `Listen to this sentence — "${card.text}" — then say it back!` })
  }

  function handleTypedCheck(card) {
    const text = (typed[card.id] || '').trim()
    if (!text) return
    handleResult(card, text)
  }

  function keepPractising() {
    setRoundDone(false)
    setDoneIds(new Set())
    setTranscripts({})
    setBuddy({
      state: 'happy',
      message: 'You can keep practising more sentences — come back for the listening-star round any time!',
    })
  }

  return (
    <div className="eng-root" style={{ '--eng-accent': '#ec4899', '--eng-soft': '#fdeff6' }}>
      <EnglishNav current="listen-speak" />

      <header className="eng-hero">
        <span className="eng-eyebrow">Class 5 · Listen & Speak</span>
        <h1 className="eng-h1">Listen & Speak</h1>
        <p className="eng-lede">Hear the sentence, then say it back — Buddy is listening kindly.</p>
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

      {!roundDone && (
        <>
          <div className="eng-between eng-mb">
            <span className="eng-chip">{Math.min(3, doneCount)} of 3 said</span>
            <span className="eng-chip eng-chip-soft">{repeatedCount} lovely repeats</span>
          </div>

          <div className="eng-dots eng-mb">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`eng-dot${i < Math.min(3, doneCount) ? ' done' : ''}`} />
            ))}
          </div>

          {useTyping && (
            <p className="eng-fallback">
              No microphone? No problem — type the sentence you heard and press Check. Buddy compares it kindly!
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {LISTEN_SENTENCES.map((card) => {
              const isDone = doneIds.has(card.id)
              const isListening = listeningId === card.id
              const liveText = transcripts[card.id]
              return (
                <div
                  key={card.id}
                  className="eng-listen-card"
                  style={isListening ? { borderColor: '#ec4899' } : undefined}
                >
                  <span className="eng-listen-emoji" aria-hidden="true"><EngArt k={SCENE_EMOJI_ART[card.emoji] || 'star'} size={30} /></span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="eng-listen-text">{card.text}</div>
                    {isDone && (
                      <span className="eng-chip eng-chip-soft" style={{ marginTop: 6 }}>Said it</span>
                    )}
                    {liveText && (
                      <p className={`eng-transcript${isListening ? ' live' : ''}`} style={{ marginTop: 8 }}>
                        {liveText}
                      </p>
                    )}
                    {useTyping && !isDone && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                        <input
                          type="text"
                          value={typed[card.id] || ''}
                          placeholder="Type the sentence here..."
                          onChange={(e) => setTyped((prev) => ({ ...prev, [card.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTypedCheck(card)
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            border: '1.5px solid #dce5ee',
                            borderRadius: 14,
                            padding: '9px 14px',
                            fontSize: 14,
                            fontFamily: 'var(--s-font-body)',
                            outline: 'none',
                            background: '#fff',
                            color: '#1e293b',
                          }}
                        />
                        <button
                          type="button"
                          className="eng-btn eng-btn-sm eng-btn-soft"
                          onClick={() => handleTypedCheck(card)}
                          disabled={!((typed[card.id] || '').trim())}
                        >
                          Check
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="eng-listen-actions">
                    <button
                      type="button"
                      className="eng-btn eng-btn-sm eng-btn-ghost"
                      onClick={() => handlePlay(card)}
                      disabled={isListening}
                    >
                      Play
                    </button>
                    {!useTyping && !isDone && (
                      <button
                        type="button"
                        className={`eng-mic${isListening ? ' live' : ''}`}
                        style={{ width: 52, height: 52, fontSize: 22 }}
                        onClick={() => handleSayIt(card)}
                        aria-label={`Say it: ${card.text}`}
                      >
                        <EngArt k="mic" size={24} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="eng-mt">
            <EnglishBuddy state={buddy.state} message={buddy.message} />
          </div>
        </>
      )}

      {roundDone && (
        <div className="eng-round-summary">
          <EngArt k="ear" size={46} />
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, color: '#1e293b', margin: '10px 0 4px' }}>
            Listening Star round complete!
          </h2>
          <p className="eng-lede" style={{ margin: '6px auto 12px', maxWidth: 480 }}>
            You said {repeatedCount} sentence{repeatedCount === 1 ? '' : 's'} out loud — your ears and voice are growing so strong!
          </p>
          <div className="eng-stars">
            {[1, 2, 3].map((i) => (
              <span key={i} className="eng-star on"><EngArt k="star" size={26} /></span>
            ))}
          </div>
          <div className="eng-center eng-mt">
            <button type="button" className="eng-btn eng-btn-primary" onClick={keepPractising}>Keep practising</button>
          </div>
          <div className="eng-mt">
            <EnglishBuddy state="celebrating" message="Wonderful speaking! You can keep practising as much as you like." />
          </div>
        </div>
      )}
    </div>
  )
}