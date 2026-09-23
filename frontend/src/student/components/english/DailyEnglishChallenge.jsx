import React, { useEffect, useRef, useState } from 'react'
import EnglishNav from './EnglishNav'
import EnglishBuddy from './EnglishBuddy'
import EngArt from './art'
import { BADGE_ART, SCENE_EMOJI_ART, TOPIC_ART, WRITING_TOPIC_ART } from './artIcons'
import { getEnglishDaily, getEnglishProgress, recordEnglishActivity } from '../../services/englishService'
import { STAR_REWARDS, badgeByKey } from '../../data/english/englishRewards'
import { GRAMMAR_TOPICS, getGrammarBank, shuffle } from '../../data/english/englishGrammar'
import { randomWritingTopic } from '../../data/english/englishWritingTopics'
import { randomSpeakingScene } from '../../data/english/englishSpeakingScenes'
import { LISTEN_SENTENCES } from '../../data/english/englishSentences'
import { countWords } from '../../utils/writingAnalysis'
import { speak, stopSpeaking } from '../../utils/speech'
import './english.css'

// Today's mission rotates by weekday (see englishService DAILY_CYCLE).
// Each mission kind plays a small mini-activity right inside the card, and
// finishing it counts as Round 1 of the Weekly Explorer Challenge.
const MISSION_CONFIG = {
  write: { art: 'pencil', title: "Writer's Mission", prompt: 'Write 3 sentences about your day.', kind: 'writing' },
  speak: { art: 'mic', title: "Speaker's Mission", prompt: 'Say one line about today.', kind: 'speak' },
  grammar: { art: 'puzzle', title: "Thinker's Mission", prompt: 'Solve 5 quick grammar questions.', kind: 'grammar' },
  picture: { art: 'palette', title: 'Picture Mission', prompt: 'Describe this picture in 2–3 sentences.', kind: 'picture' },
  listen: { art: 'ear', title: "Listener's Mission", prompt: 'Listen and repeat 3 sentences.', kind: 'listen' },
  story: { art: 'book', title: 'Story Mission', prompt: 'Write a mini story (6+ sentences).', kind: 'story' },
  weekend: { art: 'sparkle', title: 'Free Choice Mission', prompt: 'Pick your favourite mission — writing, speaking or grammar!', kind: 'weekend' },
}

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WRITE_MIN = 8
const STORY_MIN = 20
const PICTURE_MIN = 8
const SPEAK_MIN = 4

// Small tappable word helpers so a stuck writer always has a door open.
function WordChips({ words, onPick }) {
  if (!words || !words.length) return null
  return (
    <div className="eng-words">
      {words.map((w) => (
        <button key={w} type="button" className="eng-word-chip" onClick={() => onPick(w)}>
          {w} +
        </button>
      ))}
    </div>
  )
}

function StoryWriteActivity({ kind, onFinish }) {
  const [topic] = useState(() => randomWritingTopic())
  const [text, setText] = useState('')
  const words = countWords(text)
  const minWords = kind === 'story' ? STORY_MIN : WRITE_MIN
  const ready = words >= minWords
  const addWord = (w) => setText((t) => `${t ? `${t.trimEnd()} ` : ''}${w}`)

  return (
    <div>
      <div className="eng-between" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 38, lineHeight: 1 }} aria-hidden="true"><EngArt k={WRITING_TOPIC_ART[topic.id] || 'star'} size={40} /></div>
        <span className="eng-chip eng-chip-soft">{topic.title}</span>
      </div>
      <p style={{ fontSize: 14.5, color: '#334155', fontWeight: 700, margin: '0 0 4px' }}>{topic.prompt}</p>
      <ul className="eng-hints">
        {topic.hints.slice(0, 3).map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <WordChips words={topic.words} onPick={addWord} />
      <textarea
        className="eng-editor"
        style={{ marginTop: 12 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={kind === 'story' ? 'Once upon a time...' : 'Today I woke up and...'}
        aria-label="Write your sentences here"
      />
      <div className="eng-editor-meta">
        <span>{words} words</span>
        <span>{ready ? 'Beautiful — you are ready to finish!' : `${minWords - words} more words to shine`}</span>
      </div>
      <button type="button" className="eng-btn eng-btn-primary eng-btn-block eng-mt" disabled={!ready} onClick={onFinish}>
        {ready ? 'Finish mission' : 'Keep writing...'}
      </button>
    </div>
  )
}

function SceneWriteActivity({ kind, onFinish }) {
  const [scene] = useState(() => randomSpeakingScene())
  const [text, setText] = useState('')
  const words = countWords(text)
  const minWords = kind === 'picture' ? PICTURE_MIN : SPEAK_MIN
  const ready = words >= minWords
  const addWord = (w) => setText((t) => `${t ? `${t.trimEnd()} ` : ''}${w}`)

  return (
    <div>
      <div className="eng-scene-art" aria-hidden="true">
        {scene.art.map((e, i) => <EngArt key={`${e}-${i}`} k={SCENE_EMOJI_ART[e] || 'star'} size={40} />)}
      </div>
      <p style={{ textAlign: 'center', fontWeight: 800, color: '#475569', margin: '0 0 10px' }}>{scene.title}</p>
      <ul className="eng-scene-questions">
        {scene.questions.slice(0, 2).map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      {kind === 'speak' && (
        <div className="eng-row" style={{ margin: '0 0 10px' }}>
          <button type="button" className="eng-btn eng-btn-soft eng-btn-sm" onClick={() => speak(scene.trySaying)}>
            Hear an example
          </button>
          <span className="eng-fallback" style={{ margin: 0 }}>Say your line out loud — or type it below.</span>
        </div>
      )}
      <WordChips words={scene.words} onPick={addWord} />
      <textarea
        className="eng-editor"
        style={{ marginTop: 12 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={kind === 'picture' ? 'Describe what you see in this picture...' : 'For example: Today I played with my friends!'}
        aria-label="Write your sentences here"
      />
      <div className="eng-editor-meta">
        <span>{words} words</span>
        <span>{ready ? 'Super work — you are ready to finish!' : `${minWords - words} more words to go`}</span>
      </div>
      <button type="button" className="eng-btn eng-btn-primary eng-btn-block eng-mt" disabled={!ready} onClick={onFinish}>
        {ready ? 'Finish mission' : 'Keep going...'}
      </button>
    </div>
  )
}

function GrammarActivity({ onFinish }) {
  const [topic] = useState(() => GRAMMAR_TOPICS[Math.floor(Math.random() * GRAMMAR_TOPICS.length)])
  const [bank] = useState(() => shuffle(getGrammarBank(topic.id)).slice(0, 5))
  const [qIndex, setQIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const correctRef = useRef(0)
  const q = bank[qIndex]
  const isLast = qIndex >= bank.length - 1

  function choose(opt) {
    if (revealed) return
    setPicked(opt)
    setRevealed(true)
    if (opt === q.answer) correctRef.current += 1
  }

  function next() {
    if (isLast) {
      onFinish()
      return
    }
    setQIndex((i) => i + 1)
    setPicked(null)
    setRevealed(false)
  }

  return (
    <div className="eng-qcard">
      <div className="eng-qindex">
        <span>Question {qIndex + 1} of {bank.length}</span>
        <span className="eng-chip eng-chip-soft"><EngArt k={TOPIC_ART[topic.id] || 'star'} size={16} /> {topic.name}</span>
      </div>
      <p className="eng-qtext">{q.question}</p>
      <div className="eng-qopts">
        {q.options.map((opt) => {
          let cls = 'eng-opt'
          if (revealed && opt === q.answer) cls += ' correct'
          if (revealed && opt === picked && opt !== q.answer) cls += ' try-again'
          return (
            <button key={opt} type="button" className={cls} disabled={revealed} onClick={() => choose(opt)}>
              {opt}
            </button>
          )
        })}
      </div>
      {revealed && (
        <>
          <div className={`eng-explain ${picked === q.answer ? 'good' : 'hint'}`}>
            {picked === q.answer ? 'Great job! ' : 'Good thinking — here is the little trick: '}{q.explanation}
          </div>
          <button type="button" className="eng-btn eng-btn-primary eng-mt" onClick={next}>
            {isLast ? 'Finish mission' : 'Next question'}
          </button>
        </>
      )}
    </div>
  )
}

function ListenActivity({ onFinish }) {
  const [rows] = useState(() => shuffle(LISTEN_SENTENCES).slice(0, 3))
  const [done, setDone] = useState([])

  function markDone(i) {
    if (done.includes(i)) return
    const next = [...done, i]
    setDone(next)
    if (next.length >= rows.length) onFinish()
  }

  return (
    <div>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>
        Tap <strong>Play</strong> to hear the sentence, then say it in your head (or out loud!) and tap{' '}
        <strong>Done</strong>.
      </p>
      {rows.map((s, i) => {
        const isDone = done.includes(i)
        return (
          <div key={s.id} className="eng-listen-card" style={{ marginBottom: 10 }}>
            <span className="eng-listen-emoji" aria-hidden="true"><EngArt k={SCENE_EMOJI_ART[s.emoji] || 'star'} size={26} /></span>
            <span className="eng-listen-text">{s.text}</span>
            <span className="eng-listen-actions">
              <button type="button" className="eng-btn eng-btn-soft eng-btn-sm" onClick={() => speak(s.text)}>
                Play
              </button>
              <button type="button" className="eng-btn eng-btn-sm" disabled={isDone} onClick={() => markDone(i)}>
                Done
              </button>
            </span>
          </div>
        )
      })}
    </div>
  )
}

function WeekendPick({ onPick }) {
  const options = [
    { key: 'writing', art: 'pencil', label: 'Writing Mission' },
    { key: 'grammar', art: 'puzzle', label: 'Grammar Mission' },
    { key: 'speak', art: 'mic', label: 'Speaking Mission' },
  ]
  return (
    <div>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>
        It is Free Choice Day! Pick any mission — the stars are yours either way.
      </p>
      <div className="eng-row">
        {options.map((o) => (
          <button key={o.key} type="button" className="eng-btn eng-btn-soft" onClick={() => onPick(o.key)}>
            <EngArt k={o.art} size={18} /> {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function MissionActivity({ kind, onFinish }) {
  useEffect(() => () => stopSpeaking(), [])
  if (kind === 'grammar') return <GrammarActivity onFinish={onFinish} />
  if (kind === 'listen') return <ListenActivity onFinish={onFinish} />
  if (kind === 'picture') return <SceneWriteActivity kind="picture" onFinish={onFinish} />
  if (kind === 'speak') return <SceneWriteActivity kind="speak" onFinish={onFinish} />
  return <StoryWriteActivity kind={kind} onFinish={onFinish} />
}

// One mission per day + a Weekly Explorer Challenge (3 rounds, 50 bonus stars).
export default function DailyEnglishChallenge() {
  const [daily, setDaily] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  const [dailyDone, setDailyDone] = useState(false)
  const [kind, setKind] = useState(null)
  const [weekRounds, setWeekRounds] = useState(0)
  const [weeklyDone, setWeeklyDone] = useState(false)
  const [doneDays, setDoneDays] = useState([])
  const [badges, setBadges] = useState([])
  const [buddyState, setBuddyState] = useState('encouraging')
  const [buddyMessage, setBuddyMessage] = useState('Getting today&apos;s mission ready...')

  const [extraKind, setExtraKind] = useState(null)
  const [extraKey, setExtraKey] = useState(0)
  const [extraActive, setExtraActive] = useState(false)

  const dailyRecorded = useRef(false)
  const weeklyRecorded = useRef(false)
  const extraBusy = useRef(false)
  const weekRoundsRef = useRef(0)

  const dayIndex = daily ? daily.dayIndex : 0
  const cfg = daily ? MISSION_CONFIG[daily.activityKey] : null

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [d, p] = await Promise.all([getEnglishDaily(), getEnglishProgress()])
      if (cancelled) return
      setDaily(d)
      setProgress(p)
      const rounds = (p && p.weeklyChallenge && p.weeklyChallenge.rounds) || 0
      weekRoundsRef.current = rounds
      setWeekRounds(rounds)
      if (rounds >= 3) {
        weeklyRecorded.current = true
        setWeeklyDone(true)
      }
      if (d.done) {
        dailyRecorded.current = true
        setDailyDone(true)
        setDoneDays([d.dayIndex])
        setBuddyState('happy')
        setBuddyMessage('Done for today! Come back tomorrow.')
      } else {
        setBuddyState('encouraging')
        setBuddyMessage('Today&apos;s mission is waiting for you — let&apos;s go!')
      }
      const mission = MISSION_CONFIG[d.activityKey]
      if (mission && mission.kind !== 'weekend') setKind(mission.kind)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => () => stopSpeaking(), [])

  function collectBadges(list) {
    if (list && list.length) setBadges(list)
  }

  function markTodayDone() {
    setDoneDays((prev) => (prev.includes(dayIndex) ? prev : [...prev, dayIndex]))
  }

  // One call per round. Rounds 1-2 save the count (no stars); reaching 3 once
  // collects the 50 bonus stars, guarded by weeklyRecorded.
  async function advanceWeekly(gain) {
    const before = weekRoundsRef.current
    const next = Math.max(before, Math.min(before + gain, 3))
    weekRoundsRef.current = next
    setWeekRounds(next)
    if (next >= 3) {
      if (!weeklyRecorded.current) {
        weeklyRecorded.current = true
        setWeeklyDone(true)
        setBuddyState('celebrating')
        setBuddyMessage('You completed the Weekly Explorer Challenge!')
        try {
          const res = await recordEnglishActivity({
            activity: 'weekly-challenge',
            stars: STAR_REWARDS['weekly-challenge'],
            topic: 3,
            completed: true,
          })
          setProgress(res.state)
          collectBadges(res.newBadges)
        } catch {
          /* offline fallback keeps things friendly */
        }
      }
    } else if (next > before) {
      try {
        const res = await recordEnglishActivity({ activity: 'weekly-challenge', stars: 0, topic: next })
        setProgress(res.state)
        collectBadges(res.newBadges)
      } catch {
        /* offline fallback keeps things friendly */
      }
    }
  }

  async function finishDailyMission() {
    if (dailyRecorded.current) return
    dailyRecorded.current = true
    setDailyDone(true)
    markTodayDone()
    setBuddyState('celebrating')
    setBuddyMessage('Today&apos;s mission is done — see you tomorrow!')
    try {
      const res = await recordEnglishActivity({
        activity: 'daily-challenge',
        stars: STAR_REWARDS['daily-challenge'],
        completed: true,
        topic: daily.activityKey,
      })
      setProgress(res.state)
      collectBadges(res.newBadges)
    } catch {
      /* offline fallback keeps things friendly */
    }
    await advanceWeekly(1)
  }

  async function finishExtraMission() {
    if (extraBusy.current) return
    extraBusy.current = true
    const before = weekRoundsRef.current
    if (before >= 3) {
      setBuddyState('celebrating')
      setBuddyMessage('What a superstar! Your week is complete — keep playing just for fun!')
    } else if (before + 1 >= 3) {
      await advanceWeekly(1)
    } else {
      await advanceWeekly(1)
      const got = weekRoundsRef.current
      setBuddyState('celebrating')
      setBuddyMessage(`Round ${got} done! ${3 - got} more to finish the week — you have got this!`)
    }
    setExtraActive(false)
    setExtraKind(null)
  }

  function startExtraMission(k) {
    extraBusy.current = false
    setExtraKind(k)
    setExtraKey((n) => n + 1)
    setExtraActive(true)
    setBuddyState('encouraging')
    setBuddyMessage('Extra mission time! Every round brings you closer to the big prize.')
  }

  if (loading || !daily || !progress || !cfg) {
    return (
      <div className="eng-root">
        <EnglishNav current="daily-challenge" />
        <div className="eng-skeleton" role="status" aria-label="Loading daily challenge" />
      </div>
    )
  }

  const heroText = `${cfg.prompt} Finish today's mission for ${STAR_REWARDS['daily-challenge']} stars!`

  return (
    <div className="eng-root" style={{ '--eng-accent': '#14b8a6', '--eng-soft': '#e0faf6' }}>
      <EnglishNav current="daily-challenge" />

      <section className="eng-daily-hero" aria-label="Today's mission">
        <span className="eng-daily-hero-emoji" aria-hidden="true"><EngArt k="calendar" size={36} /></span>
        <div style={{ flex: 1 }}>
          <h2 className="eng-daily-hero-title">Today&apos;s English Mission</h2>
          <p className="eng-daily-hero-text">{heroText}</p>
          {dailyDone && (
            <span className="eng-chip" style={{ marginTop: 10, background: '#d9f3e8', color: '#047857' }}>
              Done for today! Come back tomorrow
            </span>
          )}
        </div>
      </section>

      <EnglishBuddy state={buddyState} message={buddyMessage} size="md" />

      {badges.length > 0 && (
        <div style={{ marginTop: 14 }}>
          {badges.map((key) => {
            const b = badgeByKey(key)
            return (
              <div key={key} className="eng-earned">
                <span className="eng-earned-emoji" aria-hidden="true"><EngArt k={BADGE_ART[b.key] || 'star'} size={28} /></span>
                <span>New badge! {b.name}</span>
              </div>
            )
          })}
        </div>
      )}

      <section className="eng-mission-card">
        <span className="eng-mission-tag">DAILY · <EngArt k={cfg.art} size={26} /></span>
        <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 20, color: '#1e293b', margin: '0 0 8px' }}>
          {cfg.title}
        </h3>
        {dailyDone ? (
          <div className="eng-center eng-mt">
            <div className="eng-stars" aria-label="Mission complete">
              <span className="eng-star on"><EngArt k="star" size={26} /></span>
              <span className="eng-star on"><EngArt k="star" size={26} /></span>
              <span className="eng-star on"><EngArt k="star" size={26} /></span>
            </div>
            <p style={{ fontWeight: 800, color: '#b45309', margin: '8px 0 0' }}>
              +{STAR_REWARDS['daily-challenge']} stars earned — mission complete!
            </p>
          </div>
        ) : kind ? (
          <MissionActivity key="daily-activity" kind={kind} onFinish={finishDailyMission} />
        ) : (
          <WeekendPick onPick={setKind} />
        )}
      </section>

      <section className="eng-weekly-card">
        <div className="eng-between">
          <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 18, color: '#1e293b', margin: 0 }}>
            Weekly Explorer Challenge
          </h3>
          <span className="eng-chip eng-chip-soft">{weekRounds}/3 rounds</span>
        </div>
        <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, margin: '8px 0 0' }}>
          Finish 3 missions this week (the Daily Mission counts as one) to earn {STAR_REWARDS['weekly-challenge']} bonus stars.
        </p>

        <div className="eng-rounds">
          {[1, 2, 3].map((r) => (
            <div
              key={r}
              className={`eng-round${weekRounds >= r ? ' done' : ''}${weekRounds + 1 === r && weekRounds < 3 ? ' now' : ''}`}
            >
              Round {r}
            </div>
          ))}
        </div>

        {weeklyDone && (
          <div className="eng-earned" style={{ margin: '10px 0 0' }}>
            <span className="eng-earned-emoji" aria-hidden="true"><EngArt k="trophy" size={28} /></span>
            <span>Week complete! Come back next week.</span>
          </div>
        )}

        <div className="eng-mt">
          {!dailyDone ? (
            <span className="eng-chip eng-chip-soft" style={{ fontSize: 13 }}>
              {`Finish today's Daily Mission first — it is Round 1 of your week!`}
            </span>
          ) : extraActive ? (
            <>
              <div className="eng-between eng-mb">
                <span className="eng-chip eng-chip-soft">
                  <EngArt k={extraKind === 'writing' ? 'pencil' : extraKind === 'grammar' ? 'puzzle' : 'mic'} size={16} />
                  {`Extra mission: ${extraKind === 'writing' ? 'Writing' : extraKind === 'grammar' ? 'Grammar' : 'Speaking'}`}
                </span>
                <button
                  type="button"
                  className="eng-btn eng-btn-ghost eng-btn-sm"
                  onClick={() => {
                    setExtraActive(false)
                    setExtraKind(null)
                  }}
                >
                  Stop
                </button>
              </div>
              <MissionActivity key={`extra-${extraKey}`} kind={extraKind} onFinish={finishExtraMission} />
            </>
          ) : (
            <>
              <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 10px' }}>
                {weekRounds >= 3
                  ? 'Your week is complete! You can still play more missions just for fun.'
                  : `Play another mini-mission to fill Round ${weekRounds + 1}:`}
              </p>
              <div className="eng-row">
                <button type="button" className="eng-btn eng-btn-soft" onClick={() => startExtraMission('writing')}>
                  <EngArt k="pencil" size={18} /> Writing
                </button>
                <button type="button" className="eng-btn eng-btn-soft" onClick={() => startExtraMission('grammar')}>
                  <EngArt k="puzzle" size={18} /> Grammar
                </button>
                <button type="button" className="eng-btn eng-btn-soft" onClick={() => startExtraMission('speak')}>
                  <EngArt k="mic" size={18} /> Speaking
                </button>
              </div>
            </>
          )}
        </div>

        <div className="eng-week-grid" aria-label="Your week at a glance">
          {WEEKDAY_LETTERS.map((letter, i) => (
            <div key={`${letter}-${i}`} className={`eng-week-day${i === dayIndex ? ' today' : ''}${doneDays.includes(i) ? ' done' : ''}`}>
              {letter}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}