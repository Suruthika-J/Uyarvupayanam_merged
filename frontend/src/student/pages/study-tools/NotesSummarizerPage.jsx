import React, { useState } from 'react'
import axios from 'axios'
import { SCard, SInput, SBtn, SLoader } from '../../components/ui'
import { FiBookOpen, FiZap, FiFileText, FiCheckCircle } from 'react-icons/fi'

export default function NotesSummarizerPage() {
  const [notesText, setNotesText] = useState('')
  const [subject, setSubject] = useState('Computer Science Core')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSummarize = async () => {
    if (!notesText || notesText.length < 20) return
    setLoading(true)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.post(
        'http://localhost:5000/api/study-tools/summarize',
        { notesText, subject },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success && res.data.summary) {
        setSummary(res.data.summary)
      }
    } catch (err) {
      console.warn('Notes summarize error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiZap size={14} /> AI Notes & Lecture Document Summarizer
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Academic Notes & Document Summarizer
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Paste lecture notes or study text to extract executive summaries, key definitions, and exam points.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">
        {/* Input Form */}
        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>
            Paste Notes / Material Text
          </h3>

          <SInput
            label="Subject Name"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Operating Systems, Data Mining"
            style={{ marginBottom: 16 }}
          />

          <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
            Raw Study Notes / Lecture Text *
          </label>
          <textarea
            rows={12}
            value={notesText}
            onChange={e => setNotesText(e.target.value)}
            placeholder="Paste your raw lecture notes, chapter text, or PDF study material here..."
            style={{
              width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--s-border)',
              fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: 16
            }}
          />

          <SBtn variant="primary" onClick={handleSummarize} disabled={loading || notesText.length < 20} style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }}>
            {loading ? <SLoader label="Summarizing notes..." /> : '⚡ Generate AI Notes Summary'}
          </SBtn>
        </SCard>

        {/* Summary Output */}
        <SCard style={{ padding: 24, borderRadius: 20, background: '#fff' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>
            Summary & Revision Output
          </h3>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <SLoader label="Extracting key definitions & exam points..." />
            </div>
          ) : summary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-primary)', margin: '0 0 6px' }}>{summary.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--s-text2)', lineHeight: 1.6 }}>{summary.executiveSummary}</p>
              </div>

              {summary.keyConcepts?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 6 }}>Key Definitions:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {summary.keyConcepts.map((kc, idx) => (
                      <div key={idx} style={{ padding: 10, background: '#ede9fe', borderRadius: 10, fontSize: 12 }}>
                        <strong style={{ color: '#6d28d9' }}>{kc.concept}:</strong> {kc.definition}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {summary.examImportantPoints?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: 6 }}>Exam High-Yield Points:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {summary.examImportantPoints.map((pt, idx) => (
                      <div key={idx} style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>• {pt}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--s-text3)', textAlign: 'center', padding: '60px 0' }}>
              Paste lecture notes on the left and click Generate AI Summary to view executive points.
            </div>
          )}
        </SCard>
      </div>
    </div>
  )
}
