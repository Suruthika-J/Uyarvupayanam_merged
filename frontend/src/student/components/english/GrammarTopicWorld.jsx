import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EnglishNav from './EnglishNav'
import EnglishBuddy from './EnglishBuddy'
import EngArt from './art'
import { TOPIC_ART, CATEGORY_ART, BADGE_ART, LEVEL_ART, SCENE_EMOJI_ART } from './artIcons'
import { GRAMMAR_TOPIC_BY_ID, getGrammarBank, shuffle } from '../../data/english/englishGrammar'
import { STAR_REWARDS, DIFFICULTY_LABELS, badgeByKey } from '../../data/english/englishRewards'
import { recordEnglishActivity, recordGrammarAnswer } from '../../services/englishService'
import './english.css'

// GrammarTopicWorld — one grammar topic, one friendly round of 10 questions.
// SEE → THINK → TRY → FEEDBACK → RETRY → REWARD, never scolding.

// eslint-disable-next-line no-misleading-character-class -- intentional: strips emoji + variation selectors
const noEmoji = (s = '') => s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/gu, '').replace(/\s+/g, ' ').trim()

const ROUND_SIZE = 10
const PRAISE = ['Super!', 'You got it!', 'Shine on!', 'Brilliant!', 'That was great!']
const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)]

function buildRound(topicId, diff) {
  const bank = getGrammarBank(topicId).filter((q) => q.difficultyKey === diff)
  return shuffle(bank).slice(0, ROUND_SIZE)
}

export default function GrammarTopicWorld() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const topic = GRAMMAR_TOPIC_BY_ID[topicId]

  const [diff, setDiff] = useState('easy')
  const [round, setRound] = useState(() => buildRound(topicId, 'easy'))
  const [qIndex, setQIndex] = useState(0)
  const [status, setStatus] = useState('active') // active | retry | correct | revealed
  const [wrongPicks, setWrongPicks] = useState([])
  const [solved, setSolved] = useState(0)
  const [phase, setPhase] = useState('playing') // playing | saving | summary
  const [summary, setSummary] = useState(null) // { solved, stars, total }
  const [awardedKey, setAwardedKey] = useState(null) // diff already awarded this session
  const [earnedBadges, setEarnedBadges] = useState([])
  const [buddyState, setBuddyState] = useState('thinking')
  const [buddyMsg, setBuddyMsg] = useState('Take your time — read it twice if you like!')

  // Fresh easy round whenever the topic changes (adjust state during render)
  const [prevTopic, setPrevTopic] = useState(topicId)
  if (prevTopic !== topicId) {
    setPrevTopic(topicId)
    setDiff('easy')
    setRound(buildRound(topicId, 'easy'))
    setQIndex(0)
    setStatus('active')
    setWrongPicks([])
    setSolved(0)
    setPhase('playing')
    setSummary(null)
    setEarnedBadges([])
    setAwardedKey(null)
    setBuddyState('thinking')
    setBuddyMsg('Take your time — read it twice if you like!')
  }

  function addBadges(keys) {
    if (!keys || keys.length === 0) return
    setEarnedBadges((prev) => {
      const next = prev.slice()
      keys.forEach((k) => {
        if (k && !next.includes(k)) next.push(k)
      })
      return next
    })
  }

  function startRound(nextDiff, resetAward) {
    if (!topic) return
    setDiff(nextDiff)
    setRound(buildRound(topicId, nextDiff))
    setQIndex(0)
    setStatus('active')
    setWrongPicks([])
    setSolved(0)
    setPhase('playing')
    setSummary(null)
    setEarnedBadges([])
    setBuddyState('thinking')
    setBuddyMsg('Fresh round! Show me what you know')
    if (resetAward) setAwardedKey(null)
  }

  function handlePick(optionIndex) {
    if (phase !== 'playing') return
    if (status === 'correct' || status === 'revealed') return
    if (wrongPicks.includes(optionIndex)) return
    const q = round[qIndex]
    if (!q) return

    const isCorrect = q.options[optionIndex] === q.answer

    if (isCorrect) {
      if (status === 'active') {
        recordGrammarAnswer({ topicId, correct: true })
          .then((res) => addBadges(res && res.newBadges))
          .catch(() => {})
      }
      setSolved((s) => s + 1)
      setStatus('correct')
      setBuddyState('celebrating')
      setBuddyMsg(praise())
      return
    }

    const nextWrong = [...wrongPicks, optionIndex]
    setWrongPicks(nextWrong)

    if (status === 'active') {
      // First miss: one gentle hint, then a second chance
      recordGrammarAnswer({ topicId, correct: false })
        .then((res) => addBadges(res && res.newBadges))
        .catch(() => {})
      setStatus('retry')
      setBuddyState('encouraging')
      setBuddyMsg('Good try — you are learning! Have another look.')
    } else {
      // Second miss: gently reveal the right answer, no stinging
      setStatus('revealed')
      setBuddyState('explaining')
      setBuddyMsg('Almost! Now you know this trick — it will be easy next time!')
    }
  }

  function handleNext() {
    if (status !== 'correct' && status !== 'revealed') return
    if (qIndex + 1 >= round.length) {
      finishRound()
      return
    }
    setQIndex((i) => i + 1)
    setStatus('active')
    setWrongPicks([])
    setBuddyState('thinking')
    setBuddyMsg('Hmm, what do you think? Take your guess')
  }

  async function finishRound() {
    const total = round.length
    const stars = solved >= 8 ? 3 : solved >= 5 ? 2 : 1

    // This level was already awarded once — never double-award stars
    if (awardedKey === diff) {
      setSummary({ solved, stars, total })
      setPhase('summary')
      return
    }

    setPhase('saving')
    try {
      const res = await recordEnglishActivity({
        activity: 'grammar',
        stars: STAR_REWARDS.grammar,
        completed: true,
        mistakes: solved < 6 ? [topic.name] : [],
      })
      setAwardedKey(diff)
      addBadges(res && res.newBadges)
      setSummary({ solved, stars, total })
      setPhase('summary')
    } catch {
      setAwardedKey(diff)
      setSummary({ solved, stars, total })
      setPhase('summary')
    }
  }

  function changeLevel() {
    const keys = ['easy', 'medium', 'challenge']
    const next = keys[(keys.indexOf(diff) + 1) % keys.length]
    startRound(next, true)
  }

  if (!topic) {
    return (
      <div className="eng-root">
        <EnglishNav current="grammar" />
        <div className="eng-empty" style={{ marginTop: 20 }}>
          <div style={{ display: 'inline-flex' }}><EngArt k="compass" size={44} /></div>
          <p style={{ margin: '10px 0 16px' }}>Hmm, that world wandered off! Let&apos;s go back.</p>
          <button type="button" className="eng-btn eng-btn-primary" onClick={() => navigate('/student/class5/english/basics')}>
            Back to English Basics
          </button>
        </div>
      </div>
    )
  }

  const q = round[qIndex]
  const isDone = status === 'correct' || status === 'revealed'
  const correctIndex = q ? q.options.indexOf(q.answer) : -1

  return (
    <div className="eng-root">
      <EnglishNav current="grammar" />

      <header className="eng-hero">
        <span className="eng-eyebrow">Class 5 · English Basics</span>
        <h1 className="eng-h1">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, verticalAlign: 'middle' }}>
            <EngArt k={TOPIC_ART[topic.id] || 'book'} size={26} /> {noEmoji(topic.name)}
          </span>
        </h1>
        <p className="eng-lede">{noEmoji(topic.rule)}</p>
      </header>

      {earnedBadges.map((key) => {
        const b = badgeByKey(key)
        return (
          <div key={key} className="eng-earned">
            <span className="eng-earned-emoji"><EngArt k={BADGE_ART[b.key] || 'star'} size={20} /></span>
            <span>New badge! {b.name}</span>
          </div>
        )
      })}

      <section className="eng-lesson" aria-label={`Lesson: ${topic.name}`}>
        <div className="eng-lesson-rule">
          <EngArt k={TOPIC_ART[topic.id] || 'book'} size={18} /> {noEmoji(topic.name)}
        </div>
        <p className="eng-lesson-remember">Remember: {noEmoji(topic.remember)}</p>
        <p className="eng-lesson-tip"><EngArt k="sparkle" size={16} /> {noEmoji(topic.tip)}</p>
        <div className="eng-lesson-examples">
          {topic.examples.map((ex) => (
            <span key={ex} className="eng-lesson-example">
              {noEmoji(ex)}
            </span>
          ))}
        </div>
      </section>

      <div className="eng-diff-tabs">
        {['easy', 'medium', 'challenge'].map((d) => (
          <button
            key={d}
            type="button"
            className={`eng-diff-tab${diff === d ? ' active' : ''}`}
            aria-pressed={diff === d}
            onClick={() => startRound(d, d !== diff)}
          >
            {noEmoji(DIFFICULTY_LABELS[d])}
          </button>
        ))}
      </div>

      {round.length === 0 ? (
        <div className="eng-empty">
          <div style={{ display: 'inline-flex' }}><EngArt k="question" size={40} /></div>
          <p style={{ margin: '10px 0 16px' }}>This level has no questions yet — try another level!</p>
          <button type="button" className="eng-btn eng-btn-primary" onClick={() => navigate('/student/class5/english/basics')}>
            More topics
          </button>
        </div>
      ) : phase === 'saving' ? (
        <div className="eng-center" style={{ padding: '30px 0' }}>
          <EnglishBuddy state="thinking" size="lg" center message="Saving your round and counting your stars..." />
        </div>
      ) : phase === 'summary' && summary ? (
        <div className="eng-round-summary">
          <span className="eng-eyebrow"><EngArt k="trophy" size={16} /> Round complete</span>
          <div className="eng-summary-score">
            {summary.solved} of {summary.total}
          </div>
          <div className="eng-stars">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`eng-star${i < summary.stars ? ' on' : ''}`}>
                <EngArt k="star" size={26} />
              </span>
            ))}
          </div>
          <p style={{ fontWeight: 800, color: '#b45309', margin: '10px 0 4px' }}>
            {summary.stars === 3
              ? 'You are a Grammar Hero!'
              : summary.stars === 2
                ? 'Great round — keep that sparkle going!'
                : 'Every try is a step up!'}
          </p>
          <p className="eng-lede" style={{ margin: '0 auto' }}>
            {summary.stars === 3
              ? `You sailed through ${noEmoji(topic.name)} like a champion!`
              : `You are getting stronger at ${noEmoji(topic.name)} — one question at a time!`}
          </p>

          <div className="eng-row" style={{ justifyContent: 'center', marginTop: 20 }}>
            <button type="button" className="eng-btn eng-btn-primary" onClick={() => startRound(diff, false)}>
              Play again (same level)
            </button>
            <button type="button" className="eng-btn eng-btn-soft" onClick={changeLevel}>
              Change level
            </button>
            <button type="button" className="eng-btn eng-btn-ghost" onClick={() => navigate('/student/class5/english/basics')}>
              More topics
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="eng-row" style={{ alignItems: 'flex-start' }}>
            <div className="eng-qcard" style={{ flex: '1 1 320px', minWidth: 0 }}>
              <div className="eng-qindex">
                Question {qIndex + 1} of {round.length} · {noEmoji(topic.name)}
              </div>
              <div className="eng-qtext">{q.question}</div>

              <div className="eng-qopts">
                {q.options.map((opt, i) => {
                  const revealCorrect = i === correctIndex && isDone
                  const missed = wrongPicks.includes(i)
                  const cls = `eng-opt${revealCorrect ? ' correct' : ''}${!revealCorrect && missed ? ' try-again' : ''}`
                  return (
                    <button
                      key={`${q.id}-${i}`}
                      type="button"
                      className={cls}
                      disabled={isDone || missed}
                      onClick={() => handlePick(i)}
                    >
                      {noEmoji(opt)}
                    </button>
                  )
                })}
              </div>

              {status === 'correct' && (
                <div className="eng-explain good"><EngArt k="star" size={18} /> {q.explanation}</div>
              )}
              {status === 'retry' && (
                <div className="eng-explain hint">Good try! The trick is: {q.explanation}</div>
              )}
              {status === 'revealed' && (
                <div className="eng-explain hint">Almost! Look at this: {q.explanation}</div>
              )}

              {isDone && (
                <div className="eng-mt">
                  <button type="button" className="eng-btn eng-btn-primary eng-btn-block" onClick={handleNext}>
                    {qIndex + 1 >= round.length ? 'See my stars' : 'Next question →'}
                  </button>
                </div>
              )}
            </div>

            <div style={{ flex: '0 1 300px', minWidth: 220 }}>
              <EnglishBuddy state={buddyState} size="md" message={buddyMsg} />
            </div>
          </div>

          <div className="eng-dots" aria-label={`Question ${qIndex + 1} of ${round.length}`}>
            {round.map((rq, i) => (
              <span
                key={rq.id || i}
                className={`eng-dot${i < qIndex || (i === qIndex && isDone) ? ' done' : ''}${i === qIndex && !isDone ? ' now' : ''}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
