import React, { useState } from 'react'
import { SBtn, SInput } from '../ui'
import { FiCheckCircle, FiXCircle, FiPlay, FiRefreshCcw, FiAward } from 'react-icons/fi'

const CLASS_5_MATHS = [
  { q: "What is 15 + 28?", a: 43 },
  { q: "How many sides does a Pentagon have?", a: 5 },
  { q: "What is 12 x 4?", a: 48 },
  { q: "If you have 10 apples and give away 3, how many are left?", a: 7 },
  { q: "What is 100 divided by 4?", a: 25 },
  { q: "Smallest 3rd digit number?", a: 100 },
  { q: "Sum of 250 + 250?", a: 500 },
  { q: "Half of 60?", a: 30 },
]

export default function MathQuiz() {
  const [current, setCurrent] = useState(0)
  const [ans, setAns] = useState('')
  const [feedback, setFeedback] = useState(null) // 'correct' or 'wrong'
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const handleCheck = (e) => {
    e.preventDefault()
    if (parseInt(ans) === CLASS_5_MATHS[current].a) {
      setFeedback('correct')
      setScore(score + 1)
    } else {
      setFeedback('wrong')
    }
  }

  const handleNext = () => {
    if (current < CLASS_5_MATHS.length - 1) {
      setCurrent(current + 1)
      setAns('')
      setFeedback(null)
    } else {
      setFinished(true)
    }
  }

  const reset = () => {
    setCurrent(0)
    setAns('')
    setFeedback(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div style={{ textAlign: 'center', padding: 40, background: 'var(--s-primary-l)', borderRadius: 24 }}>
        <FiAward size={48} color="var(--s-primary)" style={{ marginBottom: 16 }} />
        <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--s-primary)' }}>Quiz Complete!</h3>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--s-text2)' }}>You scored {score} out of {CLASS_5_MATHS.length}</p>
        <SBtn onClick={reset} style={{ marginTop: 20 }}>
          <FiRefreshCcw /> Try Again
        </SBtn>
      </div>
    )
  }

  const q = CLASS_5_MATHS[current]

  return (
    <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--s-border)', padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-primary)', background: 'var(--s-primary-l)', padding: '6px 14px', borderRadius: 12 }}>
          Question {current + 1} / {CLASS_5_MATHS.length}
        </span>
        <span style={{ fontWeight: 800, color: 'var(--s-text3)' }}>Score: {score}</span>
      </div>

      <h4 style={{ fontSize: 22, fontWeight: 800, color: 'var(--s-text)', marginBottom: 24, lineHeight: 1.4 }}>
        {q.q}
      </h4>

      <form onSubmit={handleCheck} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <SInput 
          type="number" 
          placeholder="Enter your answer..." 
          value={ans} 
          onChange={e => setAns(e.target.value)}
          disabled={feedback !== null}
          style={{ flex: 1 }}
        />
        <SBtn type="submit" disabled={feedback !== null || !ans}>Check</SBtn>
      </form>

      {feedback && (
        <div style={{ 
          padding: 16, borderRadius: 16, 
          background: feedback === 'correct' ? '#dcfce7' : '#fee2e2', 
          color: feedback === 'correct' ? '#166534' : '#991b1b',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeUp 0.3s ease-out'
        }}>
          {feedback === 'correct' ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
          <span style={{ fontWeight: 700 }}>
            {feedback === 'correct' ? "Awesome! That's correct!" : `Oops! The correct answer was ${q.a}`}
          </span>
          <SBtn variant="white" size="sm" onClick={handleNext} style={{ marginLeft: 'auto' }}>
            Next <FiPlay />
          </SBtn>
        </div>
      )}
    </div>
  )
}
