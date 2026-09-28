// NumberChar personalities: one accent color + one tiny personality trait
// per digit, shared across every Math Adventure World.
// Plain data file (no components) so NumberChar.jsx stays a pure component.

export const DIGIT_META = {
  0: { color: '#f3a6a6', trait: 'round and steady', animation: 'wobble' },
  1: { color: '#ffcf6b', trait: 'tall and busy', animation: 'stamp' },
  2: { color: '#a6e3c2', trait: 'curvy and tidy', animation: 'hop' },
  3: { color: '#ffb37b', trait: 'quick and jumpy', animation: 'bounce' },
  4: { color: '#8fb4f0', trait: 'square and sturdy', animation: 'thump' },
  5: { color: '#d6a6f0', trait: 'loud and proud', animation: 'pop' },
  6: { color: '#ffd166', trait: 'loopy and friendly', animation: 'spin' },
  7: { color: '#7fe0d8', trait: 'sleek and swift', animation: 'slide' },
  8: { color: '#f0b3d8', trait: 'round and steady', animation: 'wobble' },
  9: { color: '#b3e08f', trait: 'top-heavy and merry', animation: 'hang' },
}

export const DIGIT_COLORS = Object.fromEntries(
  Object.entries(DIGIT_META).map(([digit, meta]) => [digit, meta.color])
)