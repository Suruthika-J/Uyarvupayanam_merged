// Speech helpers for English Adventure (Speak & Tell, Listen & Speak).
//
// Everything here is defensive: on browsers without the Web Speech API the
// components fall back to typing, and microphone permission errors are turned
// into kind, actionable messages instead of scary red errors.

// ── SpeechSynthesis (read aloud) ────────────────────────────────────────────
export const synthSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

// Speak a line with a friendly voice. Returns a stop() function.
export function speak(text, { rate = 0.9, pitch = 1.05, lang = 'en-IN', onEnd } = {}) {
  if (!synthSupported() || !text) return () => {}
  const synth = window.speechSynthesis
  synth.cancel() // don't let two voices talk at once

  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.rate = rate
  utter.pitch = pitch

  // Prefer an English voice that matches our calm teacher tone.
  const voices = synth.getVoices()
  const pick =
    voices.find((v) => /en[-_]IN/i.test(v.lang) && /female|zira|natural|google/i.test(v.name)) ||
    voices.find((v) => /en[-_]IN/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  if (pick) utter.voice = pick

  if (onEnd) {
    utter.onend = () => onEnd()
    utter.onerror = () => onEnd()
  }
  synth.speak(utter)
  return () => {
    try {
      synth.cancel()
    } catch {
      /* noop */
    }
  }
}

export const stopSpeaking = () => {
  if (synthSupported()) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* noop */
    }
  }
}

// ── SpeechRecognition (listen) ──────────────────────────────────────────────
export const recognitionSupported = () => {
  if (typeof window === 'undefined') return false
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  return Boolean(SR)
}

// Create a recognition session wired to friendly callbacks.
// Returns null when unsupported so callers can show the typing fallback.
//   onFinal(text)  -> a full recognized phrase (trustworthy)
//   onInterim(text)-> live while speaking (show in grey)
//   onEnd()        -> session finished (mutual with onFinal/onError)
//   onError(code)  -> 'not-allowed' | 'no-speech' | 'network' | 'aborted' | 'unknown'
export function createRecognition({ onFinal, onInterim, onEnd, onError, lang = 'en-IN' }) {
  if (!recognitionSupported()) {
    if (onError) onError('unsupported')
    return null
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  const rec = new SR()
  rec.lang = lang
  rec.interimResults = true
  rec.continuous = false
  rec.maxAlternatives = 1

  rec.onresult = (event) => {
    let interim = ''
    let final = ''
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const res = event.results[i]
      const transcript = res[0].transcript
      if (res.isFinal) final += transcript
      else interim += transcript
    }
    if (final && onFinal) onFinal(final.trim())
    else if (interim && onInterim) onInterim(interim.trim())
  }

  rec.onerror = (event) => {
    // A tiny error map for kind messages.
    let code = 'unknown'
    if (event.error) {
      const e = String(event.error)
      if (e === 'not-allowed' || e === 'service-not-allowed' || e === 'permission-denied') code = 'not-allowed'
      else if (e === 'no-speech') code = 'no-speech'
      else if (e === 'network') code = 'network'
      else if (e === 'aborted') code = 'aborted'
      else if (e === 'audio-capture') code = 'audio-capture'
    }
    if (onError) onError(code)
  }

  rec.onend = () => {
    if (onEnd) onEnd()
  }

  return rec
}