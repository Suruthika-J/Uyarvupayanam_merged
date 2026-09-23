import React from 'react'
import './english.css'

// The English Adventure Buddy — a friendly little owl who never scolds.
// He has six moods and every one of them is kind:
//   happy        normal cheer, wings resting
//   thinking     looks up, wing to chin (a floating "?" follows him)
//   encouraging  big open smile, both wings up
//   celebrating  closed-happy eyes + confetti around him
//   explaining   open talking mouth (subtle bounce)
//   listening    tufts up, sound waves beside his head
//
// Props:
//   state     one of the moods above            (default 'happy')
//   message   text for the speech bubble        (default '')
//   size      'sm' | 'md' | 'lg'                (default 'md')
//   center    centre the bubble under the art   (default false)
//   children  (optional) extra content inside the bubble

const SIZES = { sm: 58, md: 88, lg: 122 }

const STATE_MSG = {
  happy: 'Hello! Shall we play an English game together?',
  thinking: 'Let me think about that with you...',
  encouraging: 'Great try! That is really good thinking!',
  celebrating: 'Hooray! You did it!',
  explaining: 'Here is the little rule, let us look together.',
  listening: 'I am all ears — go ahead, speak!',
}

function OwlEyes({ state }) {
  if (state === 'celebrating') {
    return (
      <React.Fragment>
        <path d="M32 46 Q36 41 40 46" stroke="#0f4c75" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M80 46 Q84 41 88 46" stroke="#0f4c75" strokeWidth="4" strokeLinecap="round" fill="none" />
      </React.Fragment>
    )
  }
  if (state === 'thinking') {
    return (
      <React.Fragment>
        <circle cx="37" cy="44" r="6" fill="#0f4c75" />
        <circle cx="85" cy="44" r="6" fill="#0f4c75" />
        <path d="M42 37 L47 45" stroke="#0f4c75" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M90 37 L85 45" stroke="#0f4c75" strokeWidth="3.4" strokeLinecap="round" />
      </React.Fragment>
    )
  }
  return (
    <React.Fragment>
      <circle cx="37" cy="47" r="6.5" fill="#0f4c75" />
      <circle cx="85" cy="47" r="6.5" fill="#0f4c75" />
      <circle cx="39" cy="44.5" r="2" fill="#fff" />
      <circle cx="87" cy="44.5" r="2" fill="#fff" />
    </React.Fragment>
  )
}

function OwlMouth({ state }) {
  // beak sits between the face plates at x≈60
  if (state === 'explaining') {
    return (
      <React.Fragment>
        <path d="M55 55 L65 55 L60 63 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="60" cy="73" rx="5.5" ry="3.2" fill="#0f4c75" />
      </React.Fragment>
    )
  }
  if (state === 'celebrating' || state === 'encouraging') {
    return (
      <React.Fragment>
        <path
          d="M54 54 Q60 51 66 54 L62 64 Q58 60 54 54 Z"
          fill="#f59e0b"
          stroke="#b45309"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M52 72 Q60 79 68 72 Q60 77 52 72 Z" fill="#0f4c75" />
      </React.Fragment>
    )
  }
  if (state === 'thinking') {
    return (
      <React.Fragment>
        <path d="M55 55 L65 55 L60 62 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="60" cy="72" r="2.6" fill="#0f4c75" />
      </React.Fragment>
    )
  }
  return (
    <React.Fragment>
      <path d="M55 55 L65 55 L60 62 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="2" strokeLinejoin="round" />
      <path d="M55 71 Q60 76 65 71" stroke="#0f4c75" strokeWidth="3" strokeLinecap="round" fill="none" />
    </React.Fragment>
  )
}

function OwlBook() {
  // tiny storybook tucked under the wing while explaining
  return (
    <g transform="translate(62 92)">
      <path d="M0 0 L2 5 L-4 6 L-2 1 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.4" />
      <path d="M-6 8 L-8 12 L-2 13 L0 9 Z" fill="#f87171" stroke="#9f1239" strokeWidth="1.4" />
    </g>
  )
}

function BuddyArt({ state, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Buddy is ${state}`}>
      {/* shadow */}
      <ellipse cx="60" cy="112" rx="26" ry="6" fill="#0f4c75" opacity="0.12" />

      {/* tufts (owl ears) */}
      <path d="M40 28 L34 10 L52 22 Z" fill="#0ea5e9" stroke="#0f4c75" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M80 28 L86 10 L68 22 Z" fill="#0ea5e9" stroke="#0f4c75" strokeWidth="2.4" strokeLinejoin="round" />

      {/* body */}
      <ellipse cx="60" cy="70" rx="38" ry="40" fill="#7dd3fc" stroke="#0f4c75" strokeWidth="3" />

      {/* belly */}
      <ellipse cx="60" cy="82" rx="24" ry="20" fill="#f0f9ff" stroke="#0f4c75" strokeWidth="2" opacity="0.95" />

      {/* wings */}
      {state === 'encouraging' || state === 'celebrating' ? (
        <React.Fragment>
          <path d="M24 60 Q12 48 17 36 Q25 48 32 54 Z" fill="#38bdf8" stroke="#0f4c75" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M96 60 Q108 48 103 36 Q95 48 88 54 Z" fill="#38bdf8" stroke="#0f4c75" strokeWidth="2.6" strokeLinejoin="round" />
        </React.Fragment>
      ) : state === 'thinking' ? (
        <React.Fragment>
          <path d="M97 72 Q110 76 108 64 Q104 70 98 68 Z" fill="#38bdf8" stroke="#0f4c75" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M23 72 Q10 76 12 64 Q16 70 22 68 Z" fill="#38bdf8" stroke="#0f4c75" strokeWidth="2.6" strokeLinejoin="round" />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <path d="M24 64 Q12 72 20 84 Q28 76 31 70 Z" fill="#38bdf8" stroke="#0f4c75" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M96 64 Q108 72 100 84 Q92 76 89 70 Z" fill="#38bdf8" stroke="#0f4c75" strokeWidth="2.6" strokeLinejoin="round" />
        </React.Fragment>
      )}

      {/* face plates */}
      <ellipse cx="38" cy="50" rx="16" ry="20" fill="#e0f2fe" stroke="#0f4c75" strokeWidth="2" />
      <ellipse cx="82" cy="50" rx="16" ry="20" fill="#e0f2fe" stroke="#0f4c75" strokeWidth="2" />

      <OwlEyes state={state} />
      <OwlMouth state={state} />
      {state === 'explaining' && <OwlBook />}
      {state === 'listening' && (
        <g stroke="#f59e0b" strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path d="M2 30 Q-6 40 0 52" />
          <path d="M116 30 Q122 40 116 52" />
        </g>
      )}

      {/* feet */}
      <path d="M48 108 L42 114 M48 108 L48 115 M48 108 L54 114" stroke="#f59e0b" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M72 108 L66 114 M72 108 L72 115 M72 108 L78 114" stroke="#f59e0b" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  )
}

function ThinkingBubble() {
  // pure-SVG floating "?" — no emoji anywhere
  return (
    <span className="eng-f-thinking" aria-hidden="true">
      <svg viewBox="0 0 40 40" width="30" height="30">
        <circle cx="20" cy="20" r="16" fill="#ffffff" stroke="#0f4c75" strokeWidth="2.6" />
        <path d="M15 15 Q15 10 20 10 Q25 10 25 15 Q25 19 20 20 Q20 23 20 25" stroke="#0f4c75" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="20" cy="29" r="1.8" fill="#0f4c75" />
      </svg>
    </span>
  )
}

function SoundWaves() {
  return (
    <span className="eng-f-sound" aria-hidden="true">
      <svg viewBox="0 0 40 40" width="24" height="24">
        <path d="M8 12 Q3 20 8 28" stroke="#f59e0b" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M16 8 Q9 20 16 32" stroke="#f59e0b" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <circle cx="22" cy="20" r="4" fill="#fb923c" />
      </svg>
    </span>
  )
}

export default function EnglishBuddy({ state = 'happy', message, size = 'md', center = false, children }) {
  const px = SIZES[size] || SIZES.md
  const shownMsg = message || STATE_MSG[state] || ''
  const isThinking = state === 'thinking'
  const celebrating = state === 'celebrating'

  return (
    <div className={`eng-buddy${center ? ' eng-buddy-center' : ''}`} data-state={state}>
      <span className="eng-floats">
        <BuddyArt state={state} size={px} />
        {isThinking && <ThinkingBubble />}
        {state === 'listening' && <SoundWaves />}
        {celebrating && (
          <span className="eng-confetti" aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </span>
        )}
      </span>

      {(shownMsg || children) && (
        <div className="eng-buddy-bubble">
          {shownMsg && <p style={{ margin: 0 }}>{shownMsg}</p>}
          {children}
        </div>
      )}
    </div>
  )
}