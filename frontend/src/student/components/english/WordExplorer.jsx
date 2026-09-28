import React, { useEffect, useRef, useState } from 'react'
import { VOCAB_CATEGORIES, VOCAB_CATEGORY_BY_ID, pickWrongWords } from '../../data/english/englishVocabulary'
import { recordEnglishActivity } from '../../services/englishService'
import { STAR_REWARDS, badgeByKey } from '../../data/english/englishRewards'
import { speak, stopSpeaking } from '../../utils/speech'
import { useStudentAuth } from '../../context/StudentAuthContext'
import EnglishNav from './EnglishNav'
import EnglishBuddy from './EnglishBuddy'
import EngArt from './art'
import { TOPIC_ART, CATEGORY_ART, BADGE_ART, LEVEL_ART, SCENE_EMOJI_ART } from './artIcons'
import './english.css'

// eslint-disable-next-line no-misleading-character-class -- intentional: strips emoji + variation selectors
const noEmoji = (s = '') => s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/gu, '').replace(/\s+/g, ' ').trim()

const PRAISES = ['Super! You know it!', 'Wonderful — that is the word!', 'Great job — spot on!', 'Fantastic — you got it!']
const randomPraise = () => PRAISES[Math.floor(Math.random() * PRAISES.length)]

const shuffle = (arr) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

export default function WordExplorer() {
  const { isAuthenticated } = useStudentAuth()

  const [mode, setMode] = useState('browse') // 'browse' | 'quiz'
  const [activeCatId, setActiveCatId] = useState(VOCAB_CATEGORIES[0].id)
  const [seen, setSeen] = useState(() => new Set())
  const [buddy, setBuddy] = useState({
    state: 'happy',
    message: 'Tap any word card to see it and hear it — I will say it with you!',
  })

  const [round, setRound] = useState(0)
  const [quiz, setQuiz] = useState(null)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [finalStars, setFinalStars] = useState(0)
  const [newBadges, setNewBadges] = useState([])

  const usedWordsRef = useRef([])
  const awardedRef = useRef(false)

  const activeCategory = VOCAB_CATEGORY_BY_ID[activeCatId] || VOCAB_CATEGORIES[0]

  useEffect(() => () => stopSpeaking(), [])

  function markSeen(word) {
    setSeen((prev) => {
      if (prev.has(word)) return prev
      const next = new Set(prev)
      next.add(word)
      return next
    })
  }

  function loadQuestion() {
    const pool = activeCategory.words.filter((w) => !usedWordsRef.current.includes(w.word))
    const src = pool.length ? pool : activeCategory.words
    const word = src[Math.floor(Math.random() * src.length)]
    usedWordsRef.current.push(word.word)
    const wrongs = pickWrongWords(word.word, activeCatId, 3).map((w) => w.word)
    const options = Array.from(new Set([word.word, ...wrongs]))
    setQuiz({ word: word.word, emoji: word.emoji, sentence: word.sentence, options: shuffle(options) })
    setPicked(null)
    markSeen(word.word)
    setBuddy({ state: 'thinking', message: 'Which word does this picture show? Take a gentle guess!' })
  }

  function startQuiz() {
    usedWordsRef.current = []
    awardedRef.current = false
    setNewBadges([])
    setScore(0)
    setRound(0)
    setQuizDone(false)
    setMode('quiz')
    loadQuestion()
  }

  function handleAnswer(option) {
    if (picked || !quiz) return
    setPicked(option)
    if (option === quiz.word) {
      setScore((s) => s + 1)
      setBuddy({ state: 'celebrating', message: randomPraise() })
    } else {
      setBuddy({ state: 'encouraging', message: `Good try! ${quiz.word} is the one — let's meet again soon!` })
    }
  }

  function handleNext() {
    if (round + 1 >= 5) {
      finishQuiz()
    } else {
      setRound((r) => r + 1)
      loadQuestion()
    }
  }

  async function finishQuiz() {
    if (awardedRef.current) {
      setQuizDone(true)
      return
    }
    awardedRef.current = true
    setFinalStars(score === 5 ? 3 : score >= 3 ? 2 : 1)
    setQuizDone(true)
    setBuddy({
      state: 'celebrating',
      message: 'Word Quiz complete! Your new word friends are cheering for you!',
    })
    try {
      const res = await recordEnglishActivity({ activity: 'vocabulary', stars: STAR_REWARDS.vocabulary, completed: true })
      if (res && res.newBadges && res.newBadges.length) setNewBadges(res.newBadges)
    } catch {
      /* the service already falls back to this device's storage */
    }
  }

  function playAgain() {
    awardedRef.current = false
    setNewBadges([])
    setScore(0)
    setRound(0)
    setQuizDone(false)
    usedWordsRef.current = []
    loadQuestion()
  }

  function goBrowse() {
    setMode('browse')
    setQuizDone(false)
    setBuddy({
      state: 'happy',
      message: 'Tap word cards to see and hear them — then try the quiz when you are ready!',
    })
  }

  function handleCardClick(w) {
    speak(`${w.word}. ${w.sentence}`)
    markSeen(w.word)
  }

  function handleCatClick(id) {
    setActiveCatId(id)
    if (mode === 'quiz') setMode('browse')
  }

  const seenCount = activeCategory.words.filter((w) => seen.has(w.word)).length

  return (
    <div className="eng-root" style={{ '--eng-accent': activeCategory.color }}>
      <EnglishNav current="vocabulary" />

      <header className="eng-hero">
        <span className="eng-eyebrow">Class 5 · Word Explorer</span>
        <h1 className="eng-h1">Word Explorer</h1>
        <p className="eng-lede">
          210 picture words across 14 worlds — tap a card to see, hear and keep it forever.
        </p>
        {!isAuthenticated && (
          <p className="eng-guest-note">
            <EngArt k="owl" size={22} /> Explore freely! Sign in to keep your stars, badges and streak.
          </p>
        )}
      </header>

      {newBadges.map((key) => {
        const b = badgeByKey(key)
        return (
          <div key={key} className="eng-earned" role="status">
            <span className="eng-earned-emoji" aria-hidden="true"><EngArt k={BADGE_ART[b.key] || 'star'} size={20} /></span>
            <span>New badge! {b.name}</span>
          </div>
        )
      })}

      <div className="eng-cat-tabs">
        {VOCAB_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`eng-cat-tab${activeCatId === cat.id ? ' active' : ''}`}
            style={activeCatId === cat.id ? { '--eng-accent': cat.color } : undefined}
            onClick={() => handleCatClick(cat.id)}
          >
            <EngArt k={CATEGORY_ART[cat.id] || 'book'} size={18} /> {noEmoji(cat.name)}
          </button>
        ))}
      </div>

      {mode === 'browse' && (
        <>
          <div className="eng-between eng-mb">
            <span className="eng-chip"><EngArt k={CATEGORY_ART[activeCategory.id] || 'book'} size={14} /> {noEmoji(activeCategory.name)}</span>
            <span className="eng-chip eng-chip-soft"><EngArt k="check" size={14} /> {seenCount} of {activeCategory.words.length} met</span>
          </div>

          <div className="eng-word-grid">
            {activeCategory.words.map((w) => (
              <button
                key={w.word}
                type="button"
                className="eng-word-card"
                style={{ '--eng-accent': activeCategory.color }}
                onClick={() => handleCardClick(w)}
              >
                <span className="eng-letter-tile" style={{ '--eng-accent': activeCategory.color || 'var(--s-primary)' }}>{w.word[0].toUpperCase()}</span>
                <span className="eng-word-text">{w.word}</span>
                <span className="eng-word-sent" style={{ color: 'var(--eng-accent)' }}>{w.sentence}</span>
                {seen.has(w.word) && (
                  <span className="eng-chip eng-chip-soft" style={{ marginTop: 8 }}><EngArt k="check" size={14} /> seen</span>
                )}
              </button>
            ))}
          </div>

          <div className="eng-center eng-mt">
            <button type="button" className="eng-btn eng-btn-primary" onClick={startQuiz}>
              <EngArt k="target" size={18} /> Play word quiz
            </button>
          </div>

          <div className="eng-mt">
            <EnglishBuddy state={buddy.state} message={buddy.message} />
          </div>
        </>
      )}

      {mode === 'quiz' && !quizDone && quiz && (
        <div style={{
          background: '#fff',
          border: '1.5px solid #e8eef5',
          borderRadius: 26,
          padding: 24,
          boxShadow: '0 14px 30px -18px rgba(15, 76, 117, 0.25)',
        }}>
          <div className="eng-between">
            <span className="eng-chip"><EngArt k={CATEGORY_ART[activeCategory.id] || 'book'} size={14} /> {noEmoji(activeCategory.name)}</span>
            <span className="eng-chip eng-chip-soft">Question {round + 1} of 5</span>
          </div>

          <div className="eng-quiz-emoji" aria-hidden="true"><EngArt k={CATEGORY_ART[activeCategory.id] || 'book'} size={84} /></div>

          <div className="eng-quiz-opts">
            {quiz.options.map((opt) => {
              const isCorrect = opt === quiz.word
              const isPicked = picked === opt
              const cls = ['eng-quiz-opt']
              if (picked) {
                if (isCorrect) cls.push('correct')
                else if (isPicked) cls.push('try-again')
              }
              return (
                <button
                  key={opt}
                  type="button"
                  className={cls.join(' ')}
                  disabled={Boolean(picked)}
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {picked && quiz.word === picked && (
            <p className="eng-explain good">
              You found it! {quiz.word} — &quot;{quiz.sentence}&quot;
            </p>
          )}
          {picked && quiz.word !== picked && (
            <p className="eng-explain hint">
              Good try! The trick is the picture shows <strong>{quiz.word}</strong> — &quot;{quiz.sentence}&quot;
            </p>
          )}

          <div className="eng-dots">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`eng-dot${i < round ? ' done' : i === round ? ' now' : ''}`} />
            ))}
          </div>

          {picked && (
            <div className="eng-between eng-mt">
              <span />
              <button type="button" className="eng-btn eng-btn-primary" onClick={handleNext}>
                {round + 1 >= 5 ? 'See my stars' : 'Next question →'}
              </button>
            </div>
          )}

          <div className="eng-mt">
            <EnglishBuddy state={buddy.state} message={buddy.message} />
          </div>
        </div>
      )}

      {mode === 'quiz' && quizDone && (
        <div className="eng-round-summary">
          <EngArt k="trophy" size={46} />
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 22, color: '#1e293b', margin: '10px 0 4px' }}>
            Word Quiz complete!
          </h2>
          <div className="eng-summary-score">{score} / 5</div>
          <div className="eng-stars">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`eng-star${i <= finalStars ? ' on' : ''}`}><EngArt k="star" size={26} /></span>
            ))}
          </div>
          <p className="eng-lede" style={{ margin: '12px auto 18px', maxWidth: 480 }}>
            {finalStars === 3
              ? 'Flawless! Every single word — wow!'
              : finalStars === 2
                ? 'So close to perfect — brilliant work!'
                : 'You gave it your best — every try counts!'}
          </p>
          <div className="eng-row eng-center" style={{ justifyContent: 'center' }}>
            <button type="button" className="eng-btn eng-btn-primary" onClick={playAgain}><EngArt k="arrows" size={18} /> Play again</button>
            <button type="button" className="eng-btn eng-btn-ghost" onClick={goBrowse}><EngArt k="book" size={18} /> Back to words</button>
          </div>
        </div>
      )}
    </div>
  )
}