import React, { useMemo, useRef, useState } from 'react'

/* ─────────────────────────────────────────────────────────────────────────
   Task renderers for the Class 8 Skill Adventure.
   The server grades every mechanic; these components only collect the raw
   answer and call onAnswer(value) — the server response is rendered by the
   game shell via `feedback` and `locked`.

   Every interactive element is a <button> so the whole game works by
   keyboard; tap-first interactions also support drag for pointer users.
   ───────────────────────────────────────────────────────────────────────── */

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ── Choice: pick one option ─────────────────────────────────────────── */
export function ChoiceTask({ task, onAnswer, locked }) {
  return (
    <div className="sk-options" role="group" aria-label={task.prompt}>
      {task.options.map((opt, i) => (
        <button
          key={i}
          type="button"
          className="sk-option"
          disabled={locked}
          onClick={() => onAnswer(i)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

/* ── Pattern: tap the item that continues the sequence ───────────────── */
export function PatternTask({ task, onAnswer, locked }) {
  return (
    <div>
      <div className="sk-chips" aria-label="Sequence">
        {task.sequence.map((s, i) => (
          <span key={i} className="sk-chip-item">{s}</span>
        ))}
        <span className="sk-chip-item q">?</span>
      </div>
      <div className="sk-options">
        {task.options.map((opt, i) => (
          <button key={i} type="button" className="sk-option" disabled={locked} onClick={() => onAnswer(i)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Decode: read the legend, then pick the meaning of a code ────────── */
export function DecodeTask({ task, onAnswer, locked }) {
  return (
    <div>
      <div className="sk-legend" aria-label="Code legend">
        {Object.entries(task.legend || {}).map(([sym, letter]) => (
          <span key={sym}><b>{sym}</b> = {letter}</span>
        ))}
      </div>
      <div>
        <span className="sk-code">{task.code}</span>
      </div>
      <div className="sk-options">
        {task.options.map((opt, i) => (
          <button key={i} type="button" className="sk-option" disabled={locked} onClick={() => onAnswer(i)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Order: tap steps in the correct order ───────────────────────────── */
export function OrderTask({ task, onAnswer, locked }) {
  const [pool, setPool] = useState(() => shuffle(task.steps.map((s) => s.id)))
  const [seq, setSeq] = useState([])

  const add = (id) => {
    setPool((p) => p.filter((x) => x !== id))
    setSeq((s) => [...s, id])
  }
  const remove = (id) => {
    setSeq((s) => s.filter((x) => x !== id))
    setPool((p) => [...p, id])
  }
  const reset = () => {
    setPool(shuffle(task.steps.map((s) => s.id)))
    setSeq([])
  }
  const ready = seq.length === task.steps.length && !locked

  return (
    <div>
      {task.intro && <p className="sk-task-sub">{task.intro}</p>}
      <div className="sk-tray-area">
        {seq.length === 0 && <span className="hint">Tap the steps below in the correct order.</span>}
        {seq.map((id) => {
          const label = task.steps.find((s) => s.id === id)?.label || ''
          return (
            <button key={id} type="button" className="sk-drag placed" disabled={locked} onClick={() => remove(id)}>
              {label}
            </button>
          )
        })}
      </div>
      <div className="sk-tray">
        {pool.map((id) => {
          const label = task.steps.find((s) => s.id === id)?.label || ''
          return (
            <button key={id} type="button" className="sk-drag" disabled={locked} onClick={() => add(id)}>
              {label}
            </button>
          )
        })}
      </div>
      <div className="sk-game-foot">
        <button type="button" className="sk-btn ghost small" onClick={reset} disabled={locked}>↺ Reset</button>
        <span className="sk-spacer" />
        <button type="button" className="sk-btn small" disabled={!ready} onClick={() => onAnswer(seq)}>
          Check order
        </button>
      </div>
    </div>
  )
}

/* ── Sort: move each item into its bucket ────────────────────────────── */
export function SortTask({ task, onAnswer, locked }) {
  const [selected, setSelected] = useState(null)
  const [placed, setPlaced] = useState({}) // itemId -> bucket id

  const remaining = task.items.filter((it) => placed[it.id] === undefined)
  const ready = remaining.length === 0 && !locked

  const drop = (bucketIdx) => {
    if (selected === null) return
    const bucketId = task.buckets[bucketIdx].id
    setPlaced((p) => ({ ...p, [selected]: bucketId }))
    setSelected(null)
  }
  const unplace = (id) => {
    setPlaced((p) => {
      const n = { ...p }
      delete n[id]
      return n
    })
    setSelected(null)
  }
  const reset = () => { setPlaced({}); setSelected(null) }

  return (
    <div>
      {task.intro && <p className="sk-task-sub">{task.intro}</p>}
      <div className="sk-buckets">
        {task.buckets.map((b, bi) => {
          const items = task.items.filter((it) => placed[it.id] === b.id)
          return (
            <div key={bi} className={`sk-bucket${selected !== null ? ' armed' : ''}`} role="button" tabIndex={selected !== null ? 0 : -1}
              onClick={() => drop(bi)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(bi) } }}>
              <div className="nm">{b.label} ({items.length})</div>
              <div className="items">
                {items.map((it) => (
                  <button key={it.id} type="button" className="sk-drag placed" disabled={locked} onClick={(e) => { e.stopPropagation(); unplace(it.id) }}>
                    {it.label}
                  </button>
                ))}
              </div>
              {items.length === 0 && <div style={{ fontSize: 11.5, color: '#9aa6b1' }}>drop here</div>}
            </div>
          )
        })}
      </div>
      <div className="sk-tray">
        {remaining.map((it) => (
          <button key={it.id} type="button" className={`sk-drag${selected === it.id ? ' selected' : ''}`}
            disabled={locked}
            onClick={() => setSelected(selected === it.id ? null : it.id)}
            aria-pressed={selected === it.id}>
            {it.label}
          </button>
        ))}
      </div>
      {selected !== null && <div className="sk-feed info"><span className="ic">👆</span><span>Now tap the bucket for “{task.items.find((x) => x.id === selected)?.label}”.</span></div>}
      <div className="sk-game-foot">
        <button type="button" className="sk-btn ghost small" onClick={reset} disabled={locked}>↺ Reset</button>
        <span className="sk-spacer" />
        <button type="button" className="sk-btn small" disabled={!ready} onClick={() => onAnswer({ ...placed })}>
          Check sorting
        </button>
      </div>
    </div>
  )
}

/* ── Match: connect each left item to its right partner ──────────────── */
export function MatchTask({ task, onAnswer, locked }) {
  const [selA, setSelA] = useState(null)
  const [pairs, setPairs] = useState({}) // aId -> { bId, bLabel }

  const right = useMemo(() => shuffle(task.pairs.map((p) => p.b)), [task.pairs])
  const leftUnpaired = task.pairs.filter((p) => !pairs[p.a.id])
  const ready = Object.keys(pairs).length === task.pairs.length && !locked

  const pickRight = (b) => {
    if (selA === null) return
    const a = task.pairs.find((p) => p.a.id === selA)
    if (!a) return
    // if this b is already used elsewhere, free it
    setPairs((cur) => {
      const next = { ...cur }
      Object.keys(next).forEach((k) => { if (next[k].bId === b.id) delete next[k] })
      next[selA] = { bId: b.id, bLabel: b.label }
      return next
    })
    setSelA(null)
  }
  const unlink = (aId) => {
    setPairs((cur) => { const n = { ...cur }; delete n[aId]; return n })
  }
  const reset = () => { setPairs({}); setSelA(null) }

  return (
    <div>
      {task.intro && <p className="sk-task-sub">{task.intro}</p>}
      {leftUnpaired.length > 0 && (
        <div className="sk-tray-area" style={{ marginBottom: 10 }}>
          <span className="hint">Step 1 — choose one item on the left.</span>
          {leftUnpaired.map((p) => (
            <button key={p.a.id} type="button" className={`sk-drag${selA === p.a.id ? ' selected' : ''}`}
              disabled={locked} onClick={() => setSelA(selA === p.a.id ? null : p.a.id)} aria-pressed={selA === p.a.id}>
              {p.a.label}
            </button>
          ))}
        </div>
      )}
      <div className="sk-tray-area">
        <span className="hint">Step 2 — tap its partner on the right (pairs appear below).</span>
        {right.map((b) => (
          <button key={b.id} type="button" className="sk-drag" disabled={locked} onClick={() => pickRight(b)}>
            {b.label}
          </button>
        ))}
      </div>
      {Object.keys(pairs).length > 0 && (
        <div className="sk-tray-area" style={{ marginTop: 10, borderColor: '#bfe3cf' }}>
          {task.pairs.filter((p) => pairs[p.a.id]).map((p) => (
            <button key={p.a.id} type="button" className="sk-drag placed" disabled={locked} onClick={() => unlink(p.a.id)}>
              {p.a.label} ↔ {pairs[p.a.id].bLabel}
            </button>
          ))}
        </div>
      )}
      <div className="sk-game-foot">
        <button type="button" className="sk-btn ghost small" onClick={reset} disabled={locked}>↺ Reset</button>
        <span className="sk-spacer" />
        <button type="button" className="sk-btn small" disabled={!ready} onClick={() => onAnswer(task.pairs.map((p) => ({ aId: p.a.id, bId: pairs[p.a.id]?.bId })))}>
          Check matches
        </button>
      </div>
    </div>
  )
}

/* ── Speak: record a short spoken reply (voluntary) ──────────────────── */
export function SpeakTask({ task, onAnswer, locked }) {
  const [rec, setRec] = useState(null) // 'idle' | 'recording' | 'done'
  const [navNote, setNavNote] = useState(false)
  const [err, setErr] = useState(null)
  const recRef = useRef(null)
  const chunks = useRef([])
  const timerRef = useRef(null)
  const [secs, setSecs] = useState(0)

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null }

  const start = () => {
    setErr(null)
    if (!navigator.mediaDevices?.getUserMedia) { setErr('Voice recording is not supported here — you can still mark your practice done.'); return }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mr = new MediaRecorder(stream)
      chunks.current = []
      mr.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data) }
      mr.onstop = () => {
        stopTimer()
        setRec('done')
        mr.stream.getTracks().forEach((t) => t.stop())
      }
      recRef.current = mr
      mr.start()
      setRec('recording')
      setSecs(0)
      timerRef.current = setInterval(() => setSecs((s) => s + 1), 1000)
    }).catch(() => setErr('Microphone not allowed — you can still mark your practice done.'))
  }
  const stop = () => { try { recRef.current?.stop() } catch (e) { stopTimer(); setRec('done') } }
  const done = () => {
    stop()
    if (navNote) navigator.vibrate?.(30)
    onAnswer({ done: true, recordable: rec === 'done' || navNote })
  }

  return (
    <div>
      {task.tips && (
        <div className="sk-feed info" style={{ marginTop: 0, marginBottom: 12 }}>
          <span className="ic">💬</span>
          <span>{task.tips.join(' · ')}</span>
        </div>
      )}
      <div className="sk-game-foot">
        {rec === 'idle' && <button type="button" className="sk-btn" onClick={start}>● Record your answer</button>}
        {rec === 'recording' && <button type="button" className="sk-btn danger" onClick={stop}>■ Stop ({secs}s)</button>}
        {rec === 'done' && <span className="sk-pill green">✓ Voice note saved for this round</span>}
        <label className="sk-pill" style={{ cursor: 'pointer', paddingTop: 6, paddingBottom: 6 }}>
          <input type="checkbox" checked={navNote} onChange={(e) => setNavNote(e.target.checked)}
            style={{ marginRight: 5 }} disabled={locked} />
          I practised by speaking aloud instead
        </label>
      </div>
      {err && <div className="sk-error" style={{ marginTop: 10 }}>⚠ {err}</div>}
      <div style={{ marginTop: 12, color: '#55626f', fontSize: 13 }}>No recording is stored or uploaded — the server only records that you practised.</div>
      <div className="sk-game-foot">
        <span className="sk-spacer" />
        <button type="button" className="sk-btn" disabled={locked || (!navNote && rec === 'idle')} onClick={done}>
          ✓ I&apos;m done practising
        </button>
      </div>
    </div>
  )
}

/* ── Create: short written reflection / product brief ────────────────── */
export function CreateTask({ task, onAnswer, locked }) {
  const [note, setNote] = useState('')
  const ready = note.trim().length >= 3 && !locked

  return (
    <div>
      {task.brief && <p className="sk-task-sub">{task.brief}</p>}
      <textarea
        className="sk-create-note"
        style={{
          width: '100%', minHeight: 90, borderRadius: 14, border: '1.5px solid #dfe7ec',
          padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', color: '#16212b',
        }}
        placeholder="Jot your idea here… (kept private, goal: stretch your imagination)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={locked}
        aria-label="Your idea"
      />
      <div style={{ marginTop: 10, color: '#55626f', fontSize: 13 }}>
        Perfect answers don&apos;t exist for this one — every sensible idea counts.
      </div>
      <div className="sk-game-foot">
        <span className="sk-spacer" />
        <button type="button" className="sk-btn" disabled={!ready} onClick={() => onAnswer({ done: true })}>
          ✓ Done with this idea
        </button>
      </div>
    </div>
  )
}

/* ── dispatch ────────────────────────────────────────────────────────── */
export default function TaskRenderer({ task, locked, onAnswer }) {
  switch (task.type) {
    case 'choice': return <ChoiceTask task={task} locked={locked} onAnswer={onAnswer} />
    case 'pattern': return <PatternTask task={task} locked={locked} onAnswer={onAnswer} />
    case 'decode': return <DecodeTask task={task} locked={locked} onAnswer={onAnswer} />
    case 'order': return <OrderTask task={task} locked={locked} onAnswer={onAnswer} />
    case 'sort': return <SortTask task={task} locked={locked} onAnswer={onAnswer} />
    case 'match': return <MatchTask task={task} locked={locked} onAnswer={onAnswer} />
    case 'speak': return <SpeakTask task={task} locked={locked} onAnswer={onAnswer} />
    case 'create': return <CreateTask task={task} locked={locked} onAnswer={onAnswer} />
    default: return <div className="sk-state">Unknown game step — please refresh.</div>
  }
}