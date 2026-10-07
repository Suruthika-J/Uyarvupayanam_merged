import React from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import './dailyChallenge.css'

// ─── The shared "Today's Challenge" card for all three Class 5 worlds ──────
//
// One component, three worlds. Each world passes its own `theme` so the card
// reuses that world's existing CSS classes (`mth-*`, `soc-*`, `sci-*`) and its
// existing artwork, which keeps the current Class 5 look identical rather than
// introducing a fourth visual language.
//
// States, all handled here so none of the three worlds can silently show an
// empty card:
//   loading -> neutral skeleton (no fake content)
//   error   -> the reason plus an explicit Try again button
//   ready   -> "Start Today's Challenge"
//   done    -> marked complete, and why
//
// The card only reads the shared hook's state. The question itself is never
// hardcoded - it always comes from the server for the requested subject.

export default function DailyChallengeCard({
  theme = {},
  daily,
  onStart,
  eyebrow = 'Fresh every day',
  title,
  blurb,
  art,
  startLabel = "Start Today's Challenge",
  className = '',
}) {
  const { loading, error, completed, attempts, reload } = daily

  const cls = (suffix) => [className, theme.card, theme.body, theme[`${suffix}`]].filter(Boolean).join(' ')
  const btn = (suffix) => [theme.btn, theme[`btn-${suffix}`]].filter(Boolean).join(' ')

  return (
    <section className={cls('')} aria-label={title}>
      {art ? <span className={theme.art} aria-hidden="true">{art}</span> : null}

      <div className={theme.body || 'c5dc-body'}>
        <span className={theme.eyebrow || 'c5dc-eyebrow'}>{completed ? 'Done for today' : eyebrow}</span>
        <h2 className={theme.title || 'c5dc-title'}>{title}</h2>

        {loading ? (
          <div className="c5dc-loading" role="status" aria-label="Loading today's challenge">
            <div className="c5dc-skel-line" />
            <div className="c5dc-skel-line is-short" />
            <div className="c5dc-skel-btn" />
          </div>
        ) : error ? (
          <>
            {/* A failed load must never look like "there is nothing today". */}
            <p className={theme.text || 'c5dc-text'} role="alert">
              {error}
            </p>
            <button type="button" className={btn('primary')} onClick={reload}>
              <FiRefreshCw size={15} aria-hidden="true" />
              Try again
            </button>
          </>
        ) : (
          <>
            <p className={theme.text || 'c5dc-text'}>{blurb}</p>

            {completed ? (
              <div className={theme.done || 'c5dc-done'}>
                <strong>Today&apos;s challenge is complete.</strong>{' '}
                {attempts > 1
                  ? `You took ${attempts} tries - come back tomorrow for a fresh one.`
                  : 'Come back tomorrow for a fresh one.'}
              </div>
            ) : null}

            <button type="button" className={btn('primary')} onClick={onStart} disabled={completed}>
              {completed ? "You've done today's" : startLabel}
            </button>
          </>
        )}
      </div>
    </section>
  )
}