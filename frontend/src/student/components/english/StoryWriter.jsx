import React, { useEffect, useState } from 'react'
import EnglishNav from './EnglishNav'
import EnglishBuddy from './EnglishBuddy'
import { WRITING_TOPICS, randomWritingTopic } from '../../data/english/englishWritingTopics'
import { STAR_REWARDS, badgeByKey } from '../../data/english/englishRewards'
import { recordEnglishActivity } from '../../services/englishService'
import analyzeText, { countWords, countSentences } from '../../utils/writingAnalysis'
import { speak, stopSpeaking } from '../../utils/speech'
import { useStudentAuth } from '../../context/StudentAuthContext'
import EngArt from './art'
import { WRITING_TOPIC_ART, SCENE_EMOJI_ART, BADGE_ART } from './artIcons'
import './english.css'

// Strip emoji glyphs so scene captions and copy stay plain text — the cartoon
// art strip replaces the visuals.
const noEmoji = (s = '') =>
  // eslint-disable-next-line no-misleading-character-class
  s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/gu, '').replace(/\s+/g, ' ').trim()

const sceneArtKeys = (s = '') =>
  (s.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || [])
    .map((e) => SCENE_EMOJI_ART[e])
    .filter(Boolean)
    .slice(0, 4)

const MISTAKE_NAMES = {
  capital: 'Capital letters',
  punctuation: 'Punctuation',
  aVsAn: 'A / An',
  verbAgree: 'is / are / has / have',
  plural: 'Plural words',
  spelling: 'Spelling',
  runOn: 'Long sentences',
  empty: 'Getting started',
}

const DIFFICULTY = { 1: 'Easy', 2: 'Medium', 3: 'Challenge' }

// Story Writer — a kid-friendly writing studio. Buddy analyses gently and
// never marks a story "wrong": every finding is a warm suggestion.

export default function StoryWriter() {
  const { isAuthenticated } = useStudentAuth()

  const [view, setView] = useState('pick') // 'pick' | 'write' | 'done'
  const [topic, setTopic] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [text, setText] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [newBadges, setNewBadges] = useState([])
  const [showModel, setShowModel] = useState(false)
  const [buddyState, setBuddyState] = useState('happy')
  const [buddyMsg, setBuddyMsg] = useState('')

  useEffect(() => {
    return () => stopSpeaking()
  }, [])

  function openTopic(next) {
    stopSpeaking()
    setSelectedId(next.id)
    setTopic(next)
    setView('write')
    setText('')
    setAnalysis(null)
    setSubmitted(false)
    setResult(null)
    setNewBadges([])
    setShowModel(false)
    setBuddyState('happy')
    setBuddyMsg('I can’t wait to read your story — every word you write is a win!')
  }

  function pickSurprise() {
    openTopic(randomWritingTopic())
  }

  function resetToPicker() {
    stopSpeaking()
    setView('pick')
    setTopic(null)
    setText('')
    setAnalysis(null)
    setSubmitted(false)
    setResult(null)
    setNewBadges([])
    setShowModel(false)
    setBuddyState('happy')
    setBuddyMsg('')
  }

  function addWord(word) {
    setText((prev) => (prev.trim() ? `${prev.trimEnd()} ${word} ` : `${word} `))
  }

  function listenStory() {
    if (!text.trim()) return
    stopSpeaking()
    speak(text.trim(), { rate: 0.9, pitch: 1.05 })
  }

  function handleAnalyze() {
    const a = analyzeText(text)
    setAnalysis(a)
    if (!text.trim()) {
      setBuddyState('encouraging')
      setBuddyMsg('Write at least one sentence and I will share my kindest tips with you.')
    } else if (a.issues.length === 0) {
      setBuddyState('explaining')
      setBuddyMsg('Wow — every line looks tidy and happy! Submit whenever you are ready.')
    } else if (a.issues.length <= 2) {
      setBuddyState('encouraging')
      setBuddyMsg('Great start! Give it a tiny polish and your story will sparkle.')
    } else {
      setBuddyState('encouraging')
      setBuddyMsg('Great start! Let us look at these friendly tips together, one at a time.')
    }
  }

  async function handleSubmit() {
    if (submitted) return
    const words = countWords(text)
    if (words < 10) {
      setBuddyState('encouraging')
      setBuddyMsg('A story is even more fun with 10+ words — keep going! Try adding one more sentence.')
      return
    }
    const a = analyzeText(text)
    const mistakes = a.issues.map((iss) => MISTAKE_NAMES[iss.type]).filter(Boolean)
    setAnalysis(a)
    setResult({ stars: a.stars })
    setSubmitted(true)
    setBuddyState('celebrating')
    setBuddyMsg('Hooray! Your whole story is finished — look at all those stars!')
    setView('done')
    try {
      const res = await recordEnglishActivity({
        activity: 'writing',
        stars: STAR_REWARDS.writing,
        completed: true,
        mistakes,
      })
      setNewBadges(res.newBadges || [])
    } catch {
      setNewBadges([])
    }
  }

  function renderPicker() {
    return (
      <div>
        <div style={{ margin: '4px 0 14px' }}>
          <span className="eng-eyebrow">Pick a topic</span>
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, color: '#1e293b', margin: '6px 0 0' }}>
            What story shall we write?
          </h2>
        </div>

        <div className="eng-topic-pick">
          {WRITING_TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`eng-topic-opt${t.id === selectedId ? ' active' : ''}`}
              onClick={() => openTopic(t)}
            >
              <span className="eng-topic-opt-emoji" aria-hidden="true">
                <EngArt k={WRITING_TOPIC_ART[t.id] || 'pencil'} size={30} />
              </span>
              <span className="eng-topic-opt-name">{t.title}</span>
            </button>
          ))}
          <button type="button" className="eng-topic-opt" onClick={pickSurprise}>
            <span className="eng-topic-opt-emoji" aria-hidden="true">
              <EngArt k="sparkle" size={30} />
            </span>
            <span className="eng-topic-opt-name">Surprise me!</span>
          </button>
        </div>

        <div className="eng-mt">
          <EnglishBuddy
            state="happy"
            message="Pick any topic you like — every story you write is a treasure, no matter how long or short!"
          />
        </div>
      </div>
    )
  }

  function renderWrite() {
    if (!topic) return null
    return (
      <div className="eng-prompt-card" style={{ '--eng-accent': topic.color, '--eng-soft': topic.soft }}>
        <div className="eng-scene-art" aria-label={topic.title}>
          {sceneArtKeys(topic.scene).map((k, i) => (
            <EngArt key={`${k}-${i}`} k={k} size={40} />
          ))}
        </div>
        <div className="eng-scene-label">{noEmoji(topic.scene)}</div>

        <div className="eng-between">
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 21, color: '#1e293b', margin: 0 }}>
            {topic.title}
          </h2>
          <span className="eng-chip eng-chip-soft">{DIFFICULTY[topic.difficulty]}</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: '#5b6b80', fontWeight: 700, margin: '8px 0 0' }}>
          {topic.prompt}
        </p>

        <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 15, color: '#1e293b', margin: '16px 0 0' }}>
          Get started
        </h3>
        <ul className="eng-hints">
          {topic.hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        <p style={{ fontSize: 12.5, fontWeight: 800, color: '#8ea0b4', margin: '12px 0 6px' }}>
          Useful words — tap to add to your story
        </p>
        <div className="eng-words">
          {topic.words.map((w) => (
            <button key={w} type="button" className="eng-word-chip" onClick={() => addWord(w)}>
              {w}
            </button>
          ))}
        </div>

        <div className="eng-mt">
          <button
            type="button"
            className="eng-btn eng-btn-soft eng-btn-sm"
            onClick={() => setShowModel((v) => !v)}
          >
            {showModel ? 'Hide the model idea' : 'Show me a model idea'}
          </button>
        </div>

        {showModel && (
          <div className="eng-mt">
            <div className="eng-model-box">
              <strong style={{ display: 'block', marginBottom: 6 }}>One way to write it:</strong>
              {topic.model}
            </div>
            <div className="eng-mt">
              <EnglishBuddy
                state="explaining"
                size="sm"
                message="Here is one way to write it — your story can be totally different!"
              />
            </div>
          </div>
        )}

        <div className="eng-mt">
          <textarea
            className="eng-editor"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Write your ${topic.title.toLowerCase()} story here...`}
            aria-label="Your story"
          />
          <div className="eng-editor-meta">
            <span>{countWords(text)} words · {countSentences(text)} sentences</span>
          </div>
        </div>

        <div className="eng-row" style={{ marginTop: 14 }}>
          <button type="button" className="eng-btn eng-btn-soft" onClick={listenStory} disabled={!text.trim()}>
            Listen to my story
          </button>
          <button type="button" className="eng-btn eng-btn-ghost" onClick={handleAnalyze}>
            Analyze my draft
          </button>
          <button type="button" className="eng-btn eng-btn-primary" onClick={handleSubmit}>
            Submit my story
          </button>
        </div>

        {analysis && !submitted && (
          <div className="eng-feedback">
            <h3 className="eng-feedback-head">Buddy’s kind tips</h3>
            {analysis.issues.length === 0 ? (
              <div className="eng-explain good">
                Everything looks tidy and happy — you are ready to submit!
              </div>
            ) : (
              analysis.issues.map((iss, i) => (
                <div className="eng-issue" key={`${iss.type}-${i}`}>
                  <strong>{MISTAKE_NAMES[iss.type] || 'Little tip'}</strong>
                  {iss.message}
                  <div className="eng-issue-tip">{iss.tip}</div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="eng-mt">
          <EnglishBuddy state={buddyState} size="md" message={buddyMsg} />
        </div>
      </div>
    )
  }

  function renderDone() {
    if (!topic || !result) return null
    return (
      <div className="eng-prompt-card" style={{ '--eng-accent': topic.color, '--eng-soft': topic.soft }}>
        <div className="eng-round-summary">
          <span className="eng-eyebrow">Story finished</span>
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 24, color: '#1e293b', margin: '6px 0 4px' }}>
            Story submitted!
          </h2>
          <p style={{ fontSize: 15, color: '#5b6b80', fontWeight: 700, margin: 0 }}>
            You earned
          </p>
          <div className="eng-summary-score">
            <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 8 }}>
              <EngArt k="star" size={30} />
            </span>
            {result.stars}
          </div>
          <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600, margin: '0 0 12px' }}>
            + {STAR_REWARDS.writing} adventure stars!
          </p>
          <div className="eng-stars" aria-label={`${result.stars} writing stars`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`eng-star${i < result.stars ? ' on' : ''}`} aria-hidden="true">
                <EngArt k="star" size={26} />
              </span>
            ))}
          </div>
        </div>

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
          <EnglishBuddy
            state="celebrating"
            size="md"
            message={`Hooray! “${topic.title}” is finished — and look at all those stars! I am so proud of you.`}
          />
        </div>

        <div className="eng-center eng-mt">
          <button type="button" className="eng-btn eng-btn-primary" onClick={resetToPicker}>
            Write another story
          </button>
        </div>
      </div>
    )
  }

  const accent = (topic && topic.color) || '#f97316'
  const soft = (topic && topic.soft) || '#fff4e6'

  return (
    <div className="eng-root" style={{ '--eng-accent': accent, '--eng-soft': soft }}>
      <EnglishNav current="writing" />

      <header className="eng-hero">
        <span className="eng-eyebrow">Class 5 · Story Writer</span>
        <h1 className="eng-h1">Story Writer</h1>
        <p className="eng-lede">
          Pick a topic, open your imagination, and write! Buddy gives you kind tips — never scary red marks.
        </p>
        {!isAuthenticated && (
          <p className="eng-guest-note">
            <EngArt k="owl" size={18} /> Exploring as a guest — sign in to keep your stars and badges safe!
          </p>
        )}
      </header>

      {view === 'pick' && renderPicker()}
      {view === 'write' && renderWrite()}
      {view === 'done' && renderDone()}
    </div>
  )
}