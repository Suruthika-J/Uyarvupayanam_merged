import React, { useState } from 'react'
import {
  FiBarChart2, FiCheckCircle, FiChevronDown, FiChevronUp,
  FiClock, FiPlay, FiPause, FiRotateCcw, FiLayers, FiAlertCircle
} from 'react-icons/fi'

const QUESTIONS_DATA = [
  {
    id: 1,
    category: 'career-switch',
    domain: 'Career Transition',
    question: 'Why are you switching from Mechanical/Civil/Core into Software / Data Analytics?',
    idealAnswer: `“During my mechanical engineering coursework, I worked with MATLAB and finite element simulations, which sparked my deep interest in computational modeling and algorithms. I realized that my core passion lies in building software architectures and extracting actionable patterns from data. 

Over the last 6 months, I deliberately developed my foundations by completing hands-on projects in Python, SQL, and Full-Stack development. My engineering degree gave me rigorous mathematical intuition and systematic root-cause problem-solving, which I now directly channel into writing robust code and building scalable solutions.”`,
    whatTheyLookFor: 'Self-awareness, proactive learning evidence, genuine passion, and no bitterness towards original degree.',
    pitfall: 'Do NOT say “I switched because IT pays more money” or “Core has no jobs”. Focus on computational interest and active upskilling.'
  },
  {
    id: 2,
    category: 'behavioral',
    domain: 'STAR Framework',
    question: 'Tell me about a challenging technical bug or hurdle in your capstone project and how you solved it.',
    idealAnswer: `“• Situation: While developing my E-Commerce microservice project, concurrent order requests were causing race conditions and overselling inventory.
• Task: I needed to ensure atomicity in stock reduction without degrading checkout latency.
• Action: I researched distributed locks and implemented Redis-based distributed locking with TTL expirations, coupled with database transactions in PostgreSQL.
• Result: We simulated 2,000 concurrent checkout spikes with zero duplicate deductions, maintaining sub-150ms response latency.”`,
    whatTheyLookFor: 'Structured storytelling, technical depth, composure under ambiguity, and quantified business impact.',
    pitfall: 'Vague answers like “I just googled it and fixed it” without explaining the underlying mechanism or concurrency trade-offs.'
  },
  {
    id: 3,
    category: 'technical',
    domain: 'Software Engineering',
    question: 'What is the difference between SQL and NoSQL databases, and how do you decide which to use?',
    idealAnswer: `“SQL databases (like PostgreSQL, MySQL) are relational, schema-enforced, and strictly adhere to ACID transactions. They are optimal when data relationships are structured and consistency is non-negotiable, such as in payment processing or ledger systems.

NoSQL databases (like MongoDB, Cassandra, DynamoDB) offer flexible document or key-value schemas with horizontal scaling (BASE semantics). They excel in unstructured catalogs, caching, real-time telemetry, and high-velocity streaming data.”`,
    whatTheyLookFor: 'Clear trade-off understanding (ACID vs BASE, horizontal vs vertical scaling), not just memorized definitions.',
    pitfall: 'Stating that “NoSQL is faster than SQL” without context or knowledge of indexes.'
  },
  {
    id: 4,
    category: 'technical',
    domain: 'Data Analytics',
    question: 'How do you handle missing values and outliers in an analytics dataset before building a model?',
    idealAnswer: `“First, I quantify the volume and mechanism of missingness (MCAR, MAR, MNAR). If missing data is <5%, median/mode imputation or deletion may suffice. For substantial missing values, I evaluate KNN imputation or domain-specific logic.

For outliers, I utilize IQR thresholds (1.5 * IQR) or Z-score (>3 standard deviations), while inspecting whether they represent measurement noise or high-value anomalies (such as fraud transactions).”`,
    whatTheyLookFor: 'Methodical hygiene, understanding that outliers shouldn’t just be blindly discarded.',
    pitfall: 'Saying you simply delete all rows with missing values.'
  },
  {
    id: 5,
    category: 'hr',
    domain: 'HR & Culture',
    question: 'How do you explain a gap year or delay in placement after graduation?',
    idealAnswer: `“Following graduation, I took a deliberate and focused 6-month period to upskill and transition into modern software engineering. Instead of taking an unrelated role, I treated this period like a full-time job: I completed advanced curriculum in full-stack architecture, built and deployed 2 production-grade capstone projects, and solved 150+ LeetCode problems. 

This dedicated focus enabled me to build practical competencies that allow me to contribute immediately to your engineering sprints.”`,
    whatTheyLookFor: 'Ownership, accountability, and productive utilization of time.',
    pitfall: 'Being defensive or blaming college placement cells or recession.'
  }
]

export default function GraduateInterviewPage() {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'career-switch', 'technical', 'behavioral', 'hr'
  const [openId, setOpenId] = useState(1)

  // Timer state for practice
  const [seconds, setSeconds] = useState(120)
  const [timerRunning, setTimerRunning] = useState(false)

  React.useEffect(() => {
    let interval = null
    if (timerRunning && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000)
    } else if (seconds === 0) {
      setTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [timerRunning, seconds])

  const toggleTimer = () => setTimerRunning(!timerRunning)
  const resetTimer = () => {
    setTimerRunning(false)
    setSeconds(120)
  }

  const filteredQuestions = activeTab === 'all'
    ? QUESTIONS_DATA
    : QUESTIONS_DATA.filter(q => q.category === activeTab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #431407 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fed7aa', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiBarChart2 size={16} /> Interview Excellence Hub
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Graduate Technical & Behavioral Interview Prep
          </h1>
          <p style={{ margin: 0, color: '#ffedd5', fontSize: 14, lineHeight: 1.5 }}>
            Master role-specific technical questions, learn to articulate career transitions with confidence, and practice timed STAR behavioral responses.
          </p>
        </div>

        {/* Practice Timer Widget */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 22px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fed7aa', textTransform: 'uppercase' }}>
            2-Minute Pitch Timer
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: seconds < 30 ? '#ef4444' : '#fff', fontFamily: 'monospace' }}>
            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={toggleTimer}
              style={{
                background: timerRunning ? '#ea580c' : '#16a34a',
                color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              {timerRunning ? <FiPause size={12} /> : <FiPlay size={12} />}
              {timerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              style={{
                background: 'rgba(255,255,255,0.2)', color: '#fff',
                border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
              }}
            >
              <FiRotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Questions' },
          { id: 'career-switch', label: '⚡ Career Switching Narrative' },
          { id: 'technical', label: '🛠️ Core Technical' },
          { id: 'behavioral', label: '🌟 STAR Behavioral' },
          { id: 'hr', label: '💼 HR & Career Gap Explanations' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px', borderRadius: 20, border: 'none',
              background: activeTab === tab.id ? '#0f172a' : '#f1f5f9',
              color: activeTab === tab.id ? '#fff' : '#475569',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Questions Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredQuestions.map((q) => {
          const isOpen = openId === q.id
          return (
            <div
              key={q.id}
              style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              {/* Question Header */}
              <div
                onClick={() => setOpenId(isOpen ? null : q.id)}
                style={{
                  padding: '18px 24px', cursor: 'pointer', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center', background: isOpen ? '#f8fafc' : '#fff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                    background: q.category === 'career-switch' ? '#f3e8ff' : '#eff6ff',
                    color: q.category === 'career-switch' ? '#7c3aed' : '#2563eb'
                  }}>
                    {q.domain}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    {q.question}
                  </span>
                </div>
                {isOpen ? <FiChevronUp size={18} color="#64748b" /> : <FiChevronDown size={18} color="#64748b" />}
              </div>

              {/* Accordion Body */}
              {isOpen && (
                <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f1f5f9', marginTop: 12 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: 6 }}>
                      Expert Recommended Answer Framework:
                    </div>
                    <div style={{
                      background: '#f8fafc', padding: 16, borderRadius: 10,
                      fontSize: 13.5, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      border: '1px solid #e2e8f0'
                    }}>
                      {q.idealAnswer}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 8, border: '1px solid #a7f3d0' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: '#065f46', marginBottom: 3 }}>
                        ✓ What Interviewers Evaluate:
                      </div>
                      <div style={{ fontSize: 12.5, color: '#047857', lineHeight: 1.4 }}>
                        {q.whatTheyLookFor}
                      </div>
                    </div>

                    <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8, border: '1px solid #fecaca' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: '#991b1b', marginBottom: 3 }}>
                        ⚠️ Common Pitfalls to Avoid:
                      </div>
                      <div style={{ fontSize: 12.5, color: '#b91c1c', lineHeight: 1.4 }}>
                        {q.pitfall}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
