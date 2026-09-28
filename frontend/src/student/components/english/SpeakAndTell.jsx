import React, { useEffect, useRef, useState } from 'react'
import EnglishNav from './EnglishNav'
import EnglishBuddy from './EnglishBuddy'
import { SPEAKING_SCENES, randomSpeakingScene } from '../../data/english/englishSpeakingScenes'
import { STAR_REWARDS, badgeByKey } from '../../data/english/englishRewards'
import { recordEnglishActivity } from '../../services/englishService'
import { countWords } from '../../utils/writingAnalysis'
import { createRecognition, recognitionSupported, stopSpeaking } from '../../utils/speech'
import { useStudentAuth } from '../../context/StudentAuthContext'
import EngArt from './art'
import { SCENE_ART, SCENE_EMOJI_ART, BADGE_ART } from './artIcons'
import './english.css'

// Speak & Tell — a no-judgement speaking studio. Children look at a cartoon
// scene and say (or type) whatever comes to mind. Buddy celebrates every try.

function pickDifferentScene(currentId) {
  const others = SPEAKING_SCENES.filter((s) => s.id !== currentId)
  return others.length ? others[Math.floor(Math.random() * others.length)] : randomSpeakingScene()
}

export default function SpeakAndTell() {
  const { isAuthenticated } = useStudentAuth()

  const [view, setView] = useState('pick') // 'pick' | 'talk'
  const [scene, setScene] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [micState, setMicState] = useState('idle') // idle | live | done | denied
  const [interim, setInterim] = useState('')
  const [transcript, setTranscript] = useState('')
  const [typed, setTyped] = useState('')
  const [spoken, setSpoken] = useState('')
  const [awarded, setAwarded] = useState(false)
  const [newBadges, setNewBadges] = useState([])
  const [showExample, setShowExample] = useState(false)
  const [fallbackNote, setFallbackNote] = useState('')
  const [buddyState, setBuddyState] = useState('happy')
  const [buddyMsg, setBuddyMsg] = useState('')
  const recRef = useRef(null)

  useEffect(() => {
    return () => {
      stopSpeaking()
      if (recRef.current) {
        try {
          recRef.current.stop()
        } catch {
          /* noop */
        }
      }
    }
  }, [])

  function stopRecognition() {
    if (recRef.current) {
      try {
        recRef.current.stop()
      } catch {
        /* noop */
      }
      recRef.current = null
    }
  }

  function openScene(next) {
    stopRecognition()
    stopSpeaking()
    setSelectedId(next.id)
    setScene(next)
    setView('talk')
    setMicState('idle')
    setInterim('')
    setTranscript('')
    setTyped('')
    setSpoken('')
    setAwarded(false)
    setNewBadges([])
    setShowExample(false)
    setFallbackNote('')
    setBuddyState('happy')
    setBuddyMsg('Look at the picture, take a breath, and tell me what you see!')
  }

  function backToPicker() {
    stopRecognition()
    stopSpeaking()
    setView('pick')
    setScene(null)
    setAwarded(false)
    setNewBadges([])
    setBuddyState('happy')
    setBuddyMsg('')
  }

  function tryAnotherScene() {
    openScene(pickDifferentScene(scene.id))
  }

  function handleMicError(code) {
    if (code === 'unsupported' || code === 'not-allowed' || code === 'audio-capture') {
      setMicState('denied')
      setTranscript('')
      setInterim('')
      setBuddyState('explaining')
      if (code === 'not-allowed') {
        setBuddyMsg('Buddy needs the microphone to hear you — please allow it in the browser, or type your answer below.')
        setFallbackNote('Mic permission is off — typing works perfectly!')
      } else if (code === 'audio-capture') {
        setBuddyMsg('Buddy cannot find a microphone on this device — typing your answer works just as well!')
        setFallbackNote('No microphone found — use the typing box below!')
      } else {
        setBuddyMsg('This browser does not support the microphone — no worries, typing your answer works perfectly!')
        setFallbackNote('Typing is always available below!')
      }
    } else if (code === 'no-speech') {
      setMicState('idle')
      setInterim('')
      setBuddyState('encouraging')
      setBuddyMsg('I did not hear anything — try a little closer, or type what you want to say.')
    } else if (code === 'network') {
      setMicState('idle')
      setInterim('')
      setBuddyState('explaining')
      setBuddyMsg('The mic service is offline — typing works perfectly!')
    } else if (code === 'aborted') {
      setMicState((s) => (s === 'live' ? 'done' : s))
    } else {
      setMicState('idle')
      setInterim('')
      setBuddyState('encouraging')
      setBuddyMsg('That one slipped away — try again, or type your answer below.')
    }
  }

  function onSpeechFinal(finalText) {
    const said = finalText.trim()
    stopRecognition()
    setTranscript(said)
    setInterim('')
    setMicState('done')
    setSpoken(said)
    setBuddyState('celebrating')
    setBuddyMsg(`Lovely! You said: “${said}”. You are thinking in English!`)
    finishAttempt()
  }

  async function finishAttempt() {
    if (awarded) return
    setAwarded(true)
    try {
      const res = await recordEnglishActivity({
        activity: 'speaking',
        stars: STAR_REWARDS.speaking,
        completed: true,
      })
      setNewBadges(res.newBadges || [])
    } catch {
      setNewBadges([])
    }
  }

  function handleTypedCheck() {
    const answer = typed.trim()
    if (countWords(answer) < 3) {
      setBuddyState('encouraging')
      setBuddyMsg('Three little words are all I need — what can you see in the picture?')
      return
    }
    stopRecognition()
    setInterim('')
    setMicState('done')
    setSpoken(answer)
    setBuddyState('celebrating')
    setBuddyMsg(`Lovely! You said: “${answer}”. You are thinking in English!`)
    finishAttempt()
  }

  function addWordToTyped(word) {
    setTyped((prev) => (prev.trim() ? `${prev.trimEnd()} ${word} ` : `${word} `))
  }

  function toggleMic() {
    if (micState === 'live') {
      stopRecognition()
      setMicState('done')
      return
    }
    stopRecognition()
    if (!recognitionSupported()) {
      handleMicError('unsupported')
      return
    }
    const rec = createRecognition({
      lang: 'en-IN',
      onFinal: (final) => onSpeechFinal(final),
      onInterim: (txt) => setInterim(txt),
      onEnd: () => {
        recRef.current = null
        setMicState((s) => (s === 'live' ? 'done' : s))
      },
      onError: (code) => handleMicError(code),
    })
    if (!rec) return // already told us via onError
    recRef.current = rec
    setInterim('')
    setTranscript('')
    setMicState('live')
    setBuddyState('listening')
    setBuddyMsg('I am all ears — go ahead!')
    try {
      rec.start()
    } catch {
      setMicState('idle')
      setBuddyState('encouraging')
      setBuddyMsg('That one did not start — try once more, or type your answer below.')
    }
  }

  function renderPicker() {
    return (
      <div>
        <div style={{ margin: '4px 0 14px' }}>
          <span className="eng-eyebrow">Pick a scene</span>
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, color: '#1e293b', margin: '6px 0 0' }}>
            What shall we talk about?
          </h2>
        </div>

        <div className="eng-topic-pick">
          {SPEAKING_SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`eng-topic-opt${s.id === selectedId ? ' active' : ''}`}
              onClick={() => openScene(s)}
            >
              <span className="eng-topic-opt-emoji" aria-hidden="true">
                <EngArt k={SCENE_ART[s.id] || 'star'} size={30} />
              </span>
              <span className="eng-topic-opt-name">{s.title}</span>
            </button>
          ))}
          <button type="button" className="eng-topic-opt" onClick={() => openScene(randomSpeakingScene())}>
            <span className="eng-topic-opt-emoji" aria-hidden="true">
              <EngArt k="sparkle" size={30} />
            </span>
            <span className="eng-topic-opt-name">Surprise me!</span>
          </button>
        </div>

        <div className="eng-mt">
          <EnglishBuddy
            state="happy"
            message="Pick any scene — there is no perfect answer. I am just happy to hear what you think!"
          />
        </div>
      </div>
    )
  }

  function renderTalk() {
    if (!scene) return null
    return (
      <div className="eng-prompt-card" style={{ '--eng-accent': scene.color, '--eng-soft': scene.soft }}>
        <div className="eng-scene-art" aria-label={scene.title}>
          {scene.art.map((emoji, i) => (
            <EngArt key={`${emoji}-${i}`} k={SCENE_EMOJI_ART[emoji] || 'star'} size={40} />
          ))}
        </div>

        <div className="eng-between">
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 21, color: '#1e293b', margin: 0 }}>
            {scene.title}
          </h2>
          <button
            type="button"
            className="eng-btn eng-btn-ghost eng-btn-sm"
            onClick={() => setShowExample((v) => !v)}
          >
            {showExample ? 'Hide example' : 'Show me an example'}
          </button>
        </div>

        {showExample && (
          <div className="eng-mt">
            <div className="eng-model-box">
              <strong style={{ display: 'block', marginBottom: 6 }}>One way to say it:</strong>
              {scene.trySaying}
            </div>
            <div className="eng-mt">
              <EnglishBuddy
                state="explaining"
                size="sm"
                message="Here is one idea — you can say it in your own words, any way you like!"
              />
            </div>
          </div>
        )}

        <p style={{ fontSize: 15, fontWeight: 700, color: '#334155', margin: '16px 0 0' }}>
          Things to think about
        </p>
        <ul className="eng-scene-questions">
          {scene.questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>

        <p style={{ fontSize: 12.5, fontWeight: 800, color: '#8ea0b4', margin: '12px 0 6px' }}>
          Helpful words — tap to add to your answer
        </p>
        <div className="eng-scene-words">
          {scene.words.map((w) => (
            <button key={w} type="button" className="eng-word-chip" onClick={() => addWordToTyped(w)}>
              {w}
            </button>
          ))}
        </div>

        <div className="eng-center" style={{ margin: '22px 0 6px' }}>
          <button
            type="button"
            className={`eng-mic${micState === 'live' ? ' live' : ''}${micState === 'denied' ? ' denied' : ''}`}
            onClick={toggleMic}
            aria-label={micState === 'live' ? 'Stop speaking' : 'Start speaking'}
          >
            <EngArt k="mic" size={28} />
          </button>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#64748b', margin: '10px 0 0' }}>
            {micState === 'live' ? 'Listening… tap to stop' : micState === 'done' ? 'Finished! Tap to say more' : 'Tap and speak'}
          </p>
        </div>

        {(interim || transcript) && (
          <div className={`eng-transcript${interim ? ' live' : ''}`}>
            {transcript || interim}
          </div>
        )}

        <div className="eng-mt">
          <label style={{ fontSize: 13, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 6 }}>
            Or type your answer
          </label>
          <textarea
            className="eng-editor"
            rows={2}
            style={{ minHeight: 70 }}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={`Tell me about the ${scene.title.toLowerCase()}…`}
            aria-label="Type your answer"
          />
          {fallbackNote && <p className="eng-fallback">{fallbackNote}</p>}
          <div className="eng-row" style={{ marginTop: 10 }}>
            <button type="button" className="eng-btn eng-btn-primary" onClick={handleTypedCheck} disabled={!typed.trim()}>
              Finish talking / Check
            </button>
          </div>
        </div>

        {spoken && (
          <div className="eng-explain good" style={{ marginTop: 16 }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>Wonderful sharing! You said:</strong>
            “{spoken}”
          </div>
        )}

        {newBadges.map((key) => {
          const b = badgeByKey(key)
          return (
            <div className="eng-earned" key={key} style={{ marginTop: 16 }}>
              <span className="eng-earned-emoji" aria-hidden="true">
                <EngArt k={BADGE_ART[key] || 'star'} size={24} />
              </span>
              <span>New badge! {b.name}</span>
            </div>
          )
        })}

        <div className="eng-mt">
          <EnglishBuddy state={buddyState} size="md" message={buddyMsg} />
        </div>

        {awarded && (
          <div className="eng-row" style={{ marginTop: 16 }}>
            <button type="button" className="eng-btn eng-btn-primary" onClick={tryAnotherScene}>
              Try another scene
            </button>
            <button type="button" className="eng-btn eng-btn-ghost" onClick={backToPicker}>
              Pick a scene
            </button>
          </div>
        )}
      </div>
    )
  }

  const accent = (scene && scene.color) || '#8b5cf6'
  const soft = (scene && scene.soft) || '#f3eeff'

  return (
    <div className="eng-root" style={{ '--eng-accent': accent, '--eng-soft': soft }}>
      <EnglishNav current="speaking" />

      <header className="eng-hero">
        <span className="eng-eyebrow">Class 5 · Speak & Tell</span>
        <h1 className="eng-h1">Speak & Tell</h1>
        <p className="eng-lede">
          Look at the picture, take a breath, and speak your mind — Buddy is a gentle listener.
        </p>
        {!isAuthenticated && (
          <p className="eng-guest-note">
            <EngArt k="owl" size={18} /> Exploring as a guest — sign in to keep your stars and badges safe!
          </p>
        )}
      </header>

      {view === 'pick' ? renderPicker() : renderTalk()}
    </div>
  )
}