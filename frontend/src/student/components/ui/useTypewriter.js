import { useState, useEffect, useRef } from 'react'

// Reveals `text` progressively like generative AI output.
// Adapts reveal speed to the size of the text so short replies feel
// deliberate and long documents don't take forever.
export function useTypewriter(text, { speed = 10, startDelay = 180 } = {}) {
  const [display, setDisplay] = useState('')
  const [done, setDone] = useState(!text)
  const timer = useRef(null)

  useEffect(() => {
    if (!text) {
      setDisplay('')
      setDone(true)
      return
    }
    setDisplay('')
    setDone(false)

    const total = text.length
    // Smaller delay for longer text => faster reveal, feels natural.
    const baseDelay = total > 900 ? 2 : total > 400 ? 4 : speed
    const chunk = total > 400 ? 2 : 1
    let i = 0

    const step = () => {
      if (i >= total) {
        setDone(true)
        return
      }
      i = Math.min(i + chunk, total)
      setDisplay(text.slice(0, i))
      const jitter = Math.random() * 7
      timer.current = setTimeout(step, baseDelay + jitter)
    }

    const id = setTimeout(step, startDelay)
    return () => {
      clearTimeout(id)
      clearTimeout(timer.current)
    }
  }, [text, speed, startDelay])

  return { text: display, done }
}
