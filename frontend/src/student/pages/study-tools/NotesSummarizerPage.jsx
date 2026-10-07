import React, { useState } from 'react'
import axiosInstance from '../../../config/axios'
import { SCard, SInput, SBtn, AIGenerating, AIFailure } from '../../components/ui'
import {
  FiBookOpen,
  FiZap,
  FiFileText,
  FiCheckCircle,
  FiCpu,
  FiCopy,
  FiCheck,
  FiAward,
  FiHelpCircle,
  FiBookmark,
  FiList
} from 'react-icons/fi'

const SAMPLE_PRESETS = {
  'DBMS': `DEADLOCK = Transactions waiting for each other indefinitely.
NORMALIZATION = Reduces redundancy and anomalies.
DENORMALIZATION = Adds controlled redundancy for performance.
DBA = Database Administrator.
RTO = Maximum acceptable recovery time.
RPO = Maximum acceptable data loss measured in time.
CAP = Consistency, Availability, Partition Tolerance.`,
  'Operating Systems': `PROCESS = Program in execution with PID and PCB.
THREAD = Lightweight unit of CPU execution sharing memory.
MUTEX = Mutual exclusion lock for single thread access.
SEMAPHORE = Signaling variable for managing multi-resource access.
VIRTUAL MEMORY = Uses paging and swapping to extend RAM.`,
  'Data Structures': `ARRAY = Contiguous memory elements indexed 0 to N-1.
LINKED LIST = Dynamic nodes connected via pointers.
STACK = LIFO (Last In First Out) used in function calls.
QUEUE = FIFO (First In First Out) used in task scheduling.
BINARY SEARCH TREE = Left node < Root < Right node.`
}

export default function NotesSummarizerPage() {
  const [notesText, setNotesText] = useState('')
  const [subject, setSubject] = useState('DBMS')
  const [summary, setSummary] = useState(null)
  const [modelUsed, setModelUsed] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSummarize = async () => {
    if (!notesText || notesText.length < 20) return
    setLoading(true)
    setError('')
    setCopied(false)
    try {
      const res = await axiosInstance.post(
        '/study-tools/summarize',
        { notesText, subject }
      )
      if (res.data?.success && res.data.summary) {
        setSummary(res.data.summary)
        setModelUsed(res.data.modelUsed || res.data.summary.modelUsed || 'Groq (openai/gpt-oss-120b)')
      } else {
        setError('The AI couldn’t summarize this text. Try adjusting your notes.')
      }
    } catch (err) {
      console.warn('Notes summarize error:', err)
      setError('We couldn’t reach the summarizer. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const handlePreset = (subKey) => {
    setSubject(subKey)
    setNotesText(SAMPLE_PRESETS[subKey])
  }

  const handleCopyAnswer = () => {
    if (!summary) return
    const textToCopy = `=== ${summary.title || subject} ===
LLM Model Used: ${modelUsed || summary.modelUsed || 'Groq (openai/gpt-oss-120b)'}

📝 2-MARK EXAM DEFINITION:
${summary.examDefinition || summary.executiveSummary}

📌 HIGH-YIELD EXAM POINTS:
${(summary.examImportantPoints || []).map(p => '• ' + p).join('\n')}

🎯 SAMPLE EXAM QUESTION:
${summary.sampleExamQuestion || 'What are the core concepts of ' + subject + '?'}

✍️ EXAM MODEL ANSWER:
${summary.sampleExamAnswer || summary.executiveSummary}

⚡ QUICK REVISION BULLETS:
${(summary.quickRevisionBulletPoints || []).map(b => '• ' + b).join('\n')}
`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiZap size={14} /> AI Notes & Lecture Document Summarizer
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Academic Notes & Exam Answer Summarizer
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Convert raw lecture notes, chapter text, or PDF study material into <strong>exam-ready answers in simple English</strong> powered by LLMs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">
        {/* Input Form */}
        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiFileText size={18} color="var(--s-primary)" /> Paste Notes / Material Text
          </h3>

          {/* Quick Presets */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s-text3)', textTransform: 'uppercase', marginBottom: 6 }}>
              Quick Try Sample Notes:
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.keys(SAMPLE_PRESETS).map((presetKey) => (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => handlePreset(presetKey)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--s-border)',
                    background: subject === presetKey ? '#ede9fe' : '#f8fafc',
                    color: subject === presetKey ? '#6d28d9' : '#475569',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {presetKey}
                </button>
              ))}
            </div>
          </div>

          <SInput
            label="Subject Name"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. DBMS, Operating Systems, Computer Networks"
            style={{ marginBottom: 16 }}
          />

          <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
            Raw Study Notes / Lecture Text *
          </label>
          <textarea
            rows={12}
            value={notesText}
            onChange={e => setNotesText(e.target.value)}
            placeholder="Paste your raw lecture notes, chapter text, key definitions, or PDF study material here..."
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--s-border)',
              fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: 16,
              lineHeight: 1.5
            }}
          />

          <SBtn
            variant="primary"
            onClick={handleSummarize}
            disabled={loading || notesText.length < 20}
            style={{ width: '100%', justifyContent: 'center', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 800 }}
          >
            {loading ? 'Generating Exam-Ready Answers...' : '⚡ Generate AI Exam Answer Notes'}
          </SBtn>
        </SCard>

        {/* Summary Output */}
        <SCard style={{ padding: 24, borderRadius: 20, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiBookOpen size={18} color="#047857" /> Summary & Exam Answer Output
            </h3>
            {summary && (
              <button
                onClick={handleCopyAnswer}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: copied ? '#d1fae5' : '#f8fafc',
                  color: copied ? '#047857' : '#334155',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                {copied ? 'Copied Exam Answer!' : 'Copy Answer'}
              </button>
            )}
          </div>

          {loading ? (
            <AIGenerating
              label="Structuring Exam Answers in Easy English..."
              sub="Extracting 2-mark definitions, 5 & 10-mark points, and sample exam model answers..."
            />
          ) : error ? (
            <AIFailure
              title="Couldn’t summarize your notes"
              message={error}
              onRetry={handleSummarize}
              retryLabel="Retry Summarizer"
            />
          ) : summary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* LLM Model & Mode Badge */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)',
                  color: '#6d28d9', border: '1px solid #ddd6fe',
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800
                }}>
                  <FiCpu size={14} /> Model Used: {modelUsed || summary.modelUsed || 'Groq (openai/gpt-oss-120b)'}
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0',
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800
                }}>
                  <FiAward size={14} /> Exam Mode: Easy English
                </div>
              </div>

              {/* Title & Executive Summary */}
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-primary)', margin: '0 0 6px' }}>{summary.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--s-text2)', lineHeight: 1.6, margin: 0 }}>{summary.executiveSummary}</p>
              </div>

              {/* 2-Mark Exam Definition Callout */}
              {summary.examDefinition && (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 14
                }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#15803d', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <FiCheckCircle size={14} /> 📝 2-Mark Exam Definition (Write in Exam):
                  </div>
                  <p style={{ fontSize: 13, color: '#166534', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                    "{summary.examDefinition}"
                  </p>
                </div>
              )}

              {/* Key Terms & Definitions */}
              {summary.keyConcepts?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiBookmark size={14} /> Key Terms & Definitions:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {summary.keyConcepts.map((kc, idx) => (
                      <div key={idx} style={{ padding: 12, background: '#f8fafc', border: '1px solid var(--s-border)', borderRadius: 12, fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <strong style={{ color: '#6d28d9', fontSize: 13 }}>{kc.concept}</strong>
                        </div>
                        <div style={{ color: '#334155', lineHeight: 1.5, marginBottom: kc.examTip ? 6 : 0 }}>
                          {kc.definition}
                        </div>
                        {kc.examTip && (
                          <div style={{ fontSize: 11, color: '#047857', background: '#ecfdf5', padding: '4px 8px', borderRadius: 6, display: 'inline-block', fontWeight: 700 }}>
                            💡 Exam Writing Tip: {kc.examTip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Mark / 10-Mark High Yield Exam Points */}
              {summary.examImportantPoints?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiList size={14} /> 📌 High-Yield Points for 5-Mark / 10-Mark Answers:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f0fdf4', padding: 14, borderRadius: 12, border: '1px solid #bbf7d0' }}>
                    {summary.examImportantPoints.map((pt, idx) => (
                      <div key={idx} style={{ fontSize: 12.5, color: '#166534', fontWeight: 600, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: '#047857', fontWeight: 800 }}>•</span>
                        <span style={{ lineHeight: 1.5 }}>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Exam Question & Model Answer */}
              {(summary.sampleExamQuestion || summary.sampleExamAnswer) && (
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiHelpCircle size={14} color="var(--s-primary)" /> 🎯 Sample Exam Question & Direct Answer:
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-primary)', marginBottom: 8 }}>
                    {summary.sampleExamQuestion}
                  </div>
                  <div style={{
                    fontSize: 12.5, color: '#334155', background: '#fff', padding: 12, borderRadius: 8,
                    border: '1px solid #e2e8f0', whiteSpace: 'pre-line', lineHeight: 1.6, fontWeight: 500
                  }}>
                    {summary.sampleExamAnswer}
                  </div>
                </div>
              )}

              {/* Quick Last-Minute Revision Points */}
              {summary.quickRevisionBulletPoints?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiZap size={14} /> ⚡ Last-Minute Exam Memory Tricks:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {summary.quickRevisionBulletPoints.map((pt, idx) => (
                      <div key={idx} style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', padding: '8px 12px', borderRadius: 8, border: '1px solid #fef3c7', fontWeight: 700 }}>
                        ⚡ {pt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--s-text3)', textAlign: 'center', padding: '60px 20px' }}>
              Paste lecture notes on the left or click a sample preset, then click <strong>Generate AI Exam Answer Notes</strong> to view structured 2-mark definitions, 10-mark points, and model answers in easy English!
            </div>
          )}
        </SCard>
      </div>
    </div>
  )
}
