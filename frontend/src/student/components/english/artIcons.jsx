// ENG_ART — original cartoon SVG icons for the English Adventure.
// Same contract as the science/social art modules: viewBox 0 0 64 64,
// bold cartoon outlines, friendly colours, no photos, no emoji.
//
// <EngArt k="microphone" size={48} /> renders the icon at any size.
// Named artefact maps (ACTIVITY_ART, BADGE_ART, ...) turn data ids into
// art keys so every page can swap emoji for cartoon art in one step.

import React from 'react'

export const ART = {
  // ── Core activity icons ────────────────────────────────────────────
  pencil: (
    <g>
      <rect x="38" y="6" width="10" height="46" rx="5" transform="rotate(45 43 29)" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
      <path d="M51 12 L56 7 L58 9 L53 14 Z" fill="#f87171" stroke="#b45309" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="30" y="2" width="16" height="8" rx="3" fill="#f472b6" stroke="#b45309" strokeWidth="2.4" />
      <path d="M38 6 L45 22" stroke="#b45309" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </g>
  ),
  quill: (
    <g>
      <path d="M14 54 Q20 30 50 10 Q52 22 46 34 Q36 40 24 50 Z" fill="#f2f0f8" stroke="#63528e" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 46 Q34 34 44 22" stroke="#63528e" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M46 22 Q50 18 50 10" stroke="#63528e" strokeWidth="2.4" fill="none" />
      <path d="M13 56 Q16 52 18 49" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
  mic: (
    <g>
      <rect x="26" y="8" width="12" height="26" rx="6" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="3" />
      <path d="M20 26 Q20 38 32 38 Q44 38 44 26" stroke="#1e3a8a" strokeWidth="3.4" fill="none" />
      <rect x="29" y="38" width="6" height="12" rx="2" fill="#94a3b8" stroke="#1e3a8a" strokeWidth="2.4" />
      <path d="M24 50 Q32 56 40 50" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  ),
  megaphone: (
    <g>
      <path d="M8 26 Q14 18 26 16 L26 38 Q14 36 8 28 Z" fill="#f87171" stroke="#9f1239" strokeWidth="3" strokeLinejoin="round" />
      <path d="M26 16 L48 8 L48 46 L26 38 Z" fill="#fb923c" stroke="#9f1239" strokeWidth="3" strokeLinejoin="round" />
      <path d="M48 21 Q54 25 54 27 Q54 29 48 33" stroke="#9f1239" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M48 22 Q56 24 56 27" stroke="#9f1239" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  ),
  puzzle: (
    <g>
      <path d="M18 14 H34 V22 Q30 22 28 25 Q28 28 32 29 L34 29 Q34 33 38 33 Q42 33 42 29 L44 29 Q48 28 48 25 Q46 22 42 22 V14 H52 V46 H40 V40 Q40 36 36 36 Q32 36 32 40 V46 H18 Z" fill="#fb923c" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="35" cy="27" r="1.8" fill="#fff" opacity="0.9" />
    </g>
  ),
  book: (
    <g>
      <path d="M32 14 Q24 10 14 12 V50 Q24 48 32 52 Q40 48 50 50 V12 Q40 10 32 14 Z" fill="#eef2f7" stroke="#0f4c75" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 14 V52" stroke="#0f4c75" strokeWidth="3" />
      <path d="M20 22 H28 M20 30 H28 M20 38 H28 M36 22 H44 M36 30 H44 M36 38 H44" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  blocks: (
    <g>
      <rect x="14" y="36" width="18" height="18" rx="4" fill="#f87171" stroke="#9f1239" strokeWidth="3" />
      <rect x="36" y="36" width="18" height="18" rx="4" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="3" />
      <rect x="22" y="18" width="22" height="18" rx="4" fill="#fb923c" stroke="#b45309" strokeWidth="3" />
      <text x="23" y="49" fontSize="10" fontWeight="900" fill="#fff" fontFamily="sans-serif">A</text>
      <text x="45" y="49" fontSize="10" fontWeight="900" fill="#fff" fontFamily="sans-serif">B</text>
      <text x="31" y="31" fontSize="10" fontWeight="900" fill="#fff" fontFamily="sans-serif">C</text>
    </g>
  ),
  abc: (
    <g>
      <rect x="18" y="18" width="28" height="28" rx="8" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
      <text x="32" y="32" fontSize="9" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="sans-serif">AB</text>
      <text x="32" y="42" fontSize="9" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="sans-serif">C</text>
      <circle cx="14" cy="14" r="2.6" fill="#b45309" />
      <circle cx="50" cy="14" r="2.6" fill="#b45309" />
      <circle cx="14" cy="50" r="2.6" fill="#b45309" />
      <circle cx="50" cy="50" r="2.6" fill="#b45309" />
    </g>
  ),
  ear: (
    <g>
      <ellipse cx="32" cy="32" rx="22" ry="24" fill="#fbc4ab" stroke="#b9653d" strokeWidth="3" />
      <path d="M36 18 Q46 22 46 32 Q46 40 40 42 Q34 44 33 38 Q32 32 36 28 Q40 24 43 27" stroke="#b9653d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="20" r="2.2" fill="#f59e0b" />
      <circle cx="46" cy="48" r="2.4" fill="#f87171" />
    </g>
  ),
  calendar: (
    <g>
      <rect x="10" y="14" width="44" height="44" rx="9" fill="#ffffff" stroke="#0f4c75" strokeWidth="3" />
      <rect x="10" y="22" width="44" height="12" rx="4" fill="#fbbf24" stroke="#b45309" strokeWidth="2.4" />
      <path d="M20 12 V18 M44 12 V18" stroke="#0f4c75" strokeWidth="3.4" strokeLinecap="round" />
      <text x="18" y="50" fontSize="13" fontWeight="900" fill="#0f4c75" fontFamily="sans-serif">1</text>
      <path d="M30 50 L34 46 L40 46 L38 52 L40 58 L34 58 L30 54 L27 46" fill="#fbbf24" stroke="#b45309" strokeWidth="2" strokeLinejoin="round" opacity="0" />
      <circle cx="42" cy="46" r="5" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
    </g>
  ),
  chart: (
    <g>
      <rect x="10" y="38" width="10" height="16" rx="3" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="2.6" />
      <rect x="25" y="28" width="10" height="26" rx="3" fill="#34d399" stroke="#065f46" strokeWidth="2.6" />
      <rect x="40" y="18" width="10" height="36" rx="3" fill="#fbbf24" stroke="#b45309" strokeWidth="2.6" />
      <path d="M8 56 H56" stroke="#94a3b8" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M56 8 L56 16 M45 10 L56 8 L50 20" stroke="#f87171" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),

  // ── Rewards / status icons ─────────────────────────────────────────
  star: (
    <g>
      <path d="M32 6 L39 22 L56 24 L43 37 L48 54 L32 45 L16 54 L21 37 L8 24 L25 22 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="3" fill="#fff" opacity="0.85" />
    </g>
  ),
  trophy: (
    <g>
      <path d="M38 12 H50 V24 Q50 34 40 36 Q38 38 38 42 H26 Q26 38 24 36 Q14 34 14 24 V12 H26 V18 Q26 26 32 26 Q38 26 38 18 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <path d="M18 14 Q10 14 10 22 Q10 28 15 30" stroke="#fbbf24" strokeWidth="4.4" fill="none" strokeLinecap="round" />
      <path d="M46 14 Q54 14 54 22 Q54 28 49 30" stroke="#fbbf24" strokeWidth="4.4" fill="none" strokeLinecap="round" />
      <rect x="24" y="47" width="16" height="5" rx="2.4" fill="#b45309" />
      <rect x="18" y="53" width="28" height="5" rx="2.4" fill="#b45309" stroke="#92400e" strokeWidth="2" />
    </g>
  ),
  medal: (
    <g>
      <circle cx="26" cy="26" r="16" fill="#fbbf24" stroke="#b45309" strokeWidth="3.2" />
      <circle cx="26" cy="26" r="9" fill="none" stroke="#fff" strokeWidth="2.6" />
      <path d="M18 40 L22 54 L26 48 L30 54 L34 40" fill="#f87171" stroke="#9f1239" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="46" cy="14" r="2.4" fill="#fbbf24" />
    </g>
  ),
  crown: (
    <g>
      <path d="M10 46 L12 20 L24 30 L32 14 L40 30 L52 20 L54 46 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="32" cy="30" r="3.4" fill="#f87171" stroke="#9f1239" strokeWidth="2" />
      <rect x="14" y="47" width="36" height="6" rx="3" fill="#b45309" />
    </g>
  ),
  flame: (
    <g>
      <path d="M32 6 Q40 22 44 30 Q48 40 40 50 Q32 58 24 50 Q16 40 20 30 Q24 20 32 6 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="3" strokeLinejoin="round" />
      <path d="M26 44 Q24 52 32 54 Q38 52 38 46" stroke="#fde68a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  target: (
    <g>
      <circle cx="32" cy="32" r="23" fill="#eef2ff" stroke="#0f4c75" strokeWidth="3.2" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="#f87171" strokeWidth="3.4" />
      <circle cx="32" cy="32" r="6" fill="#0f4c75" />
      <path d="M50 14 L56 8 M56 14 L50 8" stroke="#f59e0b" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  ),
  sprout: (
    <g>
      <path d="M32 56 V34" stroke="#3f7d3a" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 38 Q14 30 20 16 Q34 20 32 38 Z" fill="#4caf50" stroke="#2f6b2f" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M32 42 Q48 34 46 18 Q34 24 32 42 Z" fill="#66bb6a" stroke="#2f6b2f" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M28 40 Q30 32 32 30" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
    </g>
  ),
  compass: (
    <g>
      <circle cx="32" cy="32" r="24" fill="#eef2ff" stroke="#0f4c75" strokeWidth="3.2" />
      <path d="M32 18 L38 44 L32 36 L26 44 Z" fill="#f87171" stroke="#9f1239" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="3" fill="#0f4c75" />
      <circle cx="32" cy="14" r="2" fill="#94a3b8" />
    </g>
  ),
  rocket: (
    <g>
      <path d="M32 6 L36 24 L40 40 L24 40 L28 24 Z" fill="#f87171" stroke="#9f1239" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="32" cy="22" r="5" fill="#cfe4ff" stroke="#9f1239" strokeWidth="2.2" />
      <path d="M24 40 L18 52 L28 44 Z" fill="#fb923c" stroke="#9f1239" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M40 40 L46 52 L36 44 Z" fill="#fb923c" stroke="#9f1239" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M32 40 L32 48" stroke="#9f1239" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 48 Q32 56 34 48" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  shield: (
    <g>
      <path d="M32 6 L52 13 V30 Q52 46 32 58 Q12 46 12 30 V13 Z" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M24 30 L30 36 L42 24" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  lock: (
    <g>
      <rect x="18" y="28" width="28" height="26" rx="6" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
      <path d="M32 36 V46" stroke="#b45309" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M23 28 V20 Q23 10 32 10 Q41 10 41 20 V28" stroke="#0f4c75" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  check: (
    <g>
      <circle cx="32" cy="32" r="26" fill="#34d399" stroke="#065f46" strokeWidth="3.2" />
      <path d="M20 33 L29 42 L45 23" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  home: (
    <g>
      <path d="M8 32 L32 12 L56 32" stroke="#0f4c75" strokeWidth="4.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 28 V52 H50 V28" fill="#fbbf24" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <rect x="26" y="38" width="12" height="14" rx="2" fill="#fff" stroke="#b45309" strokeWidth="2.6" />
      <path d="M38 12 Q41 16 41 20 M36 20 H38" stroke="#f87171" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  ),
  sparkle: (
    <g>
      <path d="M32 8 L36 26 L54 30 L36 34 L32 52 L28 34 L10 30 L28 26 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2.8" strokeLinejoin="round" />
      <circle cx="50" cy="12" r="2.6" fill="#f87171" />
      <circle cx="12" cy="50" r="2.6" fill="#4c8df5" />
    </g>
  ),
  bell: (
    <g>
      <path d="M32 10 Q22 10 22 20 V28 Q18 34 18 40 H46 Q46 34 42 28 V20 Q42 10 32 10 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <rect x="26" y="44" width="12" height="5" rx="2.4" fill="#b45309" />
      <circle cx="32" cy="52" r="4" fill="#f87171" stroke="#9f1239" strokeWidth="2" />
    </g>
  ),
  flag: (
    <g>
      <path d="M14 8 V58" stroke="#0f4c75" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M14 12 Q30 6 42 12 Q48 15 50 12 V34 Q40 38 30 35 Q20 32 14 34 Z" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="24" cy="21" r="3" fill="#fff" />
      <path d="M30 27 L40 23" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  chat: (
    <g>
      <path d="M8 16 Q8 10 14 10 H50 Q56 10 56 16 V32 Q56 38 50 38 H26 L16 48 L18 38 H14 Q8 38 8 32 Z" fill="#eef2ff" stroke="#0f4c75" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="22" cy="24" r="3" fill="#4c8df5" />
      <circle cx="32" cy="24" r="3" fill="#4c8df5" />
      <circle cx="42" cy="24" r="3" fill="#4c8df5" />
    </g>
  ),
  heart: (
    <g>
      <path d="M32 55 Q10 40 10 24 Q10 12 22 12 Q29 12 32 20 Q35 12 42 12 Q54 12 54 24 Q54 40 32 55 Z" fill="#f87171" stroke="#be123c" strokeWidth="3" strokeLinejoin="round" />
    </g>
  ),
  person: (
    <g>
      <circle cx="32" cy="16" r="11" fill="#fbc4ab" stroke="#b9653d" strokeWidth="3" />
      <path d="M12 56 Q14 38 32 38 Q50 38 52 56 Z" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 14 Q30 12 32 12 Q33 12 34 13" stroke="#7c3f1d" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  clock: (
    <g>
      <circle cx="32" cy="32" r="25" fill="#fff" stroke="#0f4c75" strokeWidth="3.4" />
      <path d="M32 14 V32 L44 38" stroke="#0f4c75" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="#f87171" />
    </g>
  ),
  box: (
    <g>
      <path d="M8 20 L32 8 L56 20 V44 L32 56 L8 44 Z" fill="#e8b571" stroke="#8a5a2b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M8 20 L32 32 L56 20 M32 32 V56" stroke="#8a5a2b" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <circle cx="45" cy="15" r="2.6" fill="#f87171" />
    </g>
  ),
  link: (
    <g>
      <path d="M24 40 L40 24" stroke="#0f4c75" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M14 40 Q8 34 8 28 Q8 19 17 19 L23 19 Q32 19 32 28" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 24 Q56 30 56 36 Q56 45 47 45 L41 45 Q32 45 32 36" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
  comma: (
    <g>
      <circle cx="32" cy="22" r="15" fill="#0f4c75" />
      <path d="M32 52 Q32 42 36 40 Q40 42 40 50 Q40 55 35 56 Q28 56 26 48" fill="#fbbf24" stroke="#b45309" strokeWidth="2.4" />
    </g>
  ),
  question: (
    <g>
      <rect x="14" y="14" width="36" height="36" rx="10" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="3.2" />
      <path d="M26 26 Q26 18 33 18 Q40 18 40 26 Q40 31 34 32 Q32 32 32 37" stroke="#fff" strokeWidth="4.4" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="45" r="2.6" fill="#fff" />
    </g>
  ),
  arrows: (
    <g>
      <path d="M10 30 H34 M26 20 L34 30 L26 40" fill="none" stroke="#f87171" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M54 34 H30 M38 24 L30 34 L38 44" fill="none" stroke="#4c8df5" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  leaf: (
    <g>
      <path d="M12 52 Q10 26 32 12 Q52 16 52 34 Q46 48 28 48 Q20 50 12 52 Z" fill="#66bb6a" stroke="#2f6b2f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 52 Q18 38 32 28 Q44 22 52 34" stroke="#2f6b2f" strokeWidth="2" fill="none" />
    </g>
  ),

  // ── Scene icons (sentences, listen, speaking, writing) ─────────────
  cat: (
    <g>
      <ellipse cx="32" cy="34" rx="18" ry="15" fill="#fb923c" stroke="#9f1239" strokeWidth="3" />
      <path d="M26 22 L20 12 L28 20 M38 22 L44 12 L36 20" stroke="#9f1239" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="32" r="2.2" fill="#fff" />
      <circle cx="38" cy="32" r="2.2" fill="#fff" />
      <circle cx="26.6" cy="32.6" r="1.1" fill="#1e293b" />
      <circle cx="38.6" cy="32.6" r="1.1" fill="#1e293b" />
      <path d="M28 41 Q32 44 36 41" stroke="#9f1239" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M20 34 H14 M44 34 H50" stroke="#9f1239" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),
  dog: (
    <g>
      <ellipse cx="32" cy="36" rx="17" ry="14" fill="#e8b571" stroke="#8a5a2b" strokeWidth="3" />
      <path d="M22 26 L16 14 L28 24 M42 26 L48 14 L36 24" stroke="#8a5a2b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="34" r="2.2" fill="#fff" />
      <circle cx="38" cy="34" r="2.2" fill="#fff" />
      <circle cx="26.6" cy="34.6" r="1.1" fill="#1e293b" />
      <circle cx="38.6" cy="34.6" r="1.1" fill="#1e293b" />
      <ellipse cx="32" cy="41" rx="4" ry="3" fill="#7c3f1d" />
    </g>
  ),
  sun: (
    <g>
      <circle cx="32" cy="32" r="15" fill="#fbbf24" stroke="#b45309" strokeWidth="3.2" />
      <g stroke="#f59e0b" strokeWidth="3.4" strokeLinecap="round">
        <path d="M32 6 V13 M32 51 V58 M6 32 H13 M51 32 H58 M13 13 L18 18 M46 46 L51 51 M51 13 L46 18 M18 46 L13 51" />
      </g>
      <path d="M26 30 Q28 26 32 26 Q34 27 35 30" stroke="#b45309" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  ),
  butterfly: (
    <g>
      <ellipse cx="26" cy="26" rx="15" ry="11" fill="#a78bfa" stroke="#5b21b6" strokeWidth="3" transform="rotate(-14 26 26)" />
      <ellipse cx="38" cy="26" rx="15" ry="11" fill="#c4b5fd" stroke="#5b21b6" strokeWidth="3" transform="rotate(14 38 26)" />
      <ellipse cx="28" cy="42" rx="9" ry="7" fill="#f472b6" stroke="#9d174d" strokeWidth="2.6" transform="rotate(-10 28 42)" />
      <ellipse cx="36" cy="42" rx="9" ry="7" fill="#fbcfe8" stroke="#9d174d" strokeWidth="2.6" transform="rotate(10 36 42)" />
      <rect x="30.4" y="20" width="3.2" height="30" rx="1.6" fill="#7c3f1d" />
      <path d="M29 20 Q32 16 35 20" stroke="#7c3f1d" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  apple: (
    <g>
      <circle cx="32" cy="36" r="17" fill="#f87171" stroke="#be123c" strokeWidth="3" />
      <path d="M32 22 Q32 14 27 11" stroke="#4d7c0f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M32 22 Q34 18 38 17" stroke="#4d7c0f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M30 27 Q32 33 35 30" stroke="#fff7ed" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.85" />
    </g>
  ),
  school: (
    <g>
      <path d="M8 26 L32 10 L56 26" stroke="#0f4c75" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="12" y="26" width="40" height="26" rx="4" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
      <path d="M24 52 V38 H40 V52" fill="#fff" stroke="#b45309" strokeWidth="2.6" />
      <circle cx="10" cy="28" r="2" fill="#f87171" />
      <circle cx="54" cy="28" r="2" fill="#f87171" />
      <rect x="26" y="10" width="12" height="10" rx="2" fill="#f87171" stroke="#9f1239" strokeWidth="2.4" />
    </g>
  ),
  bus: (
    <g>
      <rect x="6" y="14" width="52" height="34" rx="9" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
      <rect x="10" y="24" width="18" height="14" rx="3" fill="#dbeafe" stroke="#b45309" strokeWidth="2.4" />
      <rect x="36" y="24" width="18" height="14" rx="3" fill="#dbeafe" stroke="#b45309" strokeWidth="2.4" />
      <rect x="24" y="10" width="16" height="6" rx="3" fill="#f87171" stroke="#9f1239" strokeWidth="2.2" />
      <circle cx="19" cy="52" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2.6" />
      <circle cx="45" cy="52" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2.6" />
    </g>
  ),
  bird: (
    <g>
      <path d="M12 38 Q20 22 36 20 Q52 18 54 30 Q48 26 40 28 Q44 32 38 34 Q34 30 28 32 L30 40 Q24 44 18 44 Z" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="18" cy="36" r="2.2" fill="#fff" />
      <path d="M17 34 L24 31" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M26 40 L22 50 L30 46 Z" fill="#fb923c" stroke="#9f1239" strokeWidth="2.4" strokeLinejoin="round" />
    </g>
  ),
  milk: (
    <g>
      <path d="M26 8 H38 L38 14 H26 Z" fill="#cfe4ff" />
      <path d="M24 10 L20 50 Q20 54 24 54 H40 Q44 54 44 50 L40 10 Z" fill="#ffffff" stroke="#0f4c75" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 20 L30 34 M34 20 L36 34" stroke="#bfdbfe" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),
  rain: (
    <g>
      <path d="M12 40 Q12 32 20 32 Q22 22 32 22 Q42 22 44 32 Q52 32 52 40 L52 42 Q52 48 44 48 H18 Q12 48 12 42 Z" fill="#94a3b8" stroke="#475569" strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 52 L20 60 M32 52 L30 60 M42 52 L40 60" stroke="#4c8df5" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  ),
  ball: (
    <g>
      <circle cx="32" cy="32" r="23" fill="#ffffff" stroke="#1e293b" strokeWidth="3.4" />
      <path d="M32 9 L42 20 L54 20 M32 9 L22 20 L10 20 M10 20 L22 20 M54 20 L42 20 M22 20 L20 52 M42 20 L44 52 M20 52 Q32 60 44 52" stroke="#1e293b" strokeWidth="2.8" fill="none" />
    </g>
  ),
  swim: (
    <g>
      <path d="M8 44 Q20 34 32 42 Q44 50 56 40" stroke="#4c8df5" strokeWidth="4.4" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="22" r="8" fill="#fbc4ab" stroke="#b9653d" strokeWidth="2.8" />
      <path d="M16 32 L20 52 M20 38 Q26 42 30 38" stroke="#0f4c75" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M40 36 Q48 30 50 22" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  cake: (
    <g>
      <rect x="10" y="30" width="44" height="20" rx="4" fill="#f9a8d4" stroke="#be185d" strokeWidth="3" />
      <path d="M10 34 Q20 44 32 34 Q44 44 54 34" fill="#fff" stroke="#be185d" strokeWidth="2" />
      <rect x="26" y="12" width="12" height="20" rx="3" fill="#fbbf24" stroke="#b45309" strokeWidth="2.6" />
      <path d="M14 26 Q15 28 16 26 M20 24 Q21 26 22 24 M44 24 Q45 26 46 24 M40 27 Q41 29 42 27" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),
  bat: (
    <g>
      <path d="M12 14 L52 6 L48 20 L24 26 Z" fill="#e8b571" stroke="#8a5a2b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 26 L30 46 L34 46 L36 26" fill="#fbbf24" stroke="#b45309" strokeWidth="2.6" />
      <circle cx="48" cy="26" r="9" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
    </g>
  ),
  tree: (
    <g>
      <path d="M32 20 Q44 16 50 28 Q54 40 40 44 Q48 52 32 52 Q16 52 24 44 Q10 40 14 28 Q20 16 32 20 Z" fill="#66bb6a" stroke="#2f6b2f" strokeWidth="3" strokeLinejoin="round" />
      <rect x="29" y="52" width="6" height="10" rx="2.4" fill="#8a5a2b" stroke="#5d4037" strokeWidth="2.4" />
      <circle cx="24" cy="30" r="3" fill="#a7f3d0" opacity="0.9" />
      <circle cx="42" cy="34" r="2.6" fill="#a7f3d0" opacity="0.9" />
    </g>
  ),
  palette: (
    <g>
      <path d="M32 8 Q14 8 14 28 Q14 52 32 52 Q36 52 36 47 Q36 43 40 43 Q45 43 45 38 Q45 34 49 34 Q52 34 50 26 Q46 8 32 8 Z" fill="#ffffff" stroke="#0f4c75" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="23" cy="26" r="4" fill="#f87171" />
      <circle cx="34" cy="20" r="4" fill="#fbbf24" />
      <circle cx="45" cy="27" r="4" fill="#4c8df5" />
      <circle cx="44" cy="42" r="4" fill="#66bb6a" />
      <circle cx="26" cy="40" r="4" fill="#a78bfa" />
    </g>
  ),
  cycle: (
    <g>
      <circle cx="20" cy="40" r="13" fill="none" stroke="#1e293b" strokeWidth="3.4" />
      <circle cx="46" cy="40" r="13" fill="none" stroke="#1e293b" strokeWidth="3.4" />
      <path d="M20 40 L34 24 L46 40 M34 24 L30 40 M40 32 L34 24" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M20 40 L30 40 L32 34 M20 27 V33" stroke="#f87171" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M30 40 L46 40" stroke="#1e293b" strokeWidth="3.4" />
    </g>
  ),
  icecream: (
    <g>
      <path d="M16 22 Q16 8 32 8 Q48 8 48 22 Q48 32 32 32 Q16 32 16 22 Z" fill="#f9a8d4" stroke="#be185d" strokeWidth="3" strokeLinejoin="round" />
      <path d="M20 24 Q23 28 28 25" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M26 32 L30 54 Q32 58 34 54 L38 32 Z" fill="#e8b571" stroke="#8a5a2b" strokeWidth="3" strokeLinejoin="round" />
    </g>
  ),
  umbrella: (
    <g>
      <path d="M6 30 Q16 8 32 8 Q48 8 58 30 Q48 26 40 30 Q32 36 24 30 Q16 26 6 30 Z" fill="#f87171" stroke="#9f1239" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="32" cy="8" r="2.6" fill="#fbbf24" />
      <path d="M32 8 V52" stroke="#1e293b" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M20 58 Q26 54 32 58 Q38 54 44 58" stroke="#9f1239" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  kite: (
    <g>
      <path d="M12 48 L32 8 L48 40 L28 56 Z" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 8 L28 56 M12 48 L48 40 M32 8 L12 48 M32 8 L48 40" stroke="#a5b4fc" strokeWidth="2" fill="none" />
      <path d="M28 54 L40 64 M28 54 L20 64" stroke="#f87171" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),
  bowl: (
    <g>
      <path d="M8 30 Q16 24 32 22 Q48 24 56 30 L56 36 Q48 46 32 46 Q16 46 8 36 Z" fill="#fb923c" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <path d="M20 19 Q26 12 34 13 Q40 16 40 22 M28 14 Q33 9 38 13" stroke="#e5e7eb" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  ),
  cow: (
    <g>
      <ellipse cx="32" cy="30" rx="22" ry="17" fill="#ffffff" stroke="#334155" strokeWidth="3" />
      <circle cx="18" cy="18" r="6" fill="#ffffff" stroke="#334155" strokeWidth="2.6" />
      <circle cx="46" cy="18" r="6" fill="#ffffff" stroke="#334155" strokeWidth="2.6" />
      <path d="M20 22 Q24 17 27 23 Q31 15 34 22 M40 20 Q38 16 34 20" fill="#fca5a5" opacity="0.9" />
      <circle cx="26" cy="30" r="2.2" fill="#1e293b" />
      <circle cx="38" cy="30" r="2.2" fill="#1e293b" />
      <rect x="28" y="36" width="8" height="4" rx="2" fill="#f9a8d4" />
      <rect x="16" y="44" width="6" height="14" rx="3" fill="#e8b571" stroke="#8a5a2b" strokeWidth="2.2" />
      <rect x="42" y="44" width="6" height="14" rx="3" fill="#e8b571" stroke="#8a5a2b" strokeWidth="2.2" />
    </g>
  ),
  mount: (
    <g>
      <path d="M6 52 Q22 18 32 40 Q42 22 58 52 Z" fill="#66bb6a" stroke="#2f6b2f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M40 44 Q44 34 48 44" fill="#fff" opacity="0.9" />
      <path d="M8 52 H56" stroke="#4d7c0f" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 60 Q28 56 34 60 Q40 56 46 60" stroke="#4c8df5" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  moon: (
    <g>
      <path d="M40 8 Q54 24 44 50 Q30 56 18 44 Q34 48 38 34 Q42 20 40 8 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <path d="M26 16 Q24 12 26 8 M22 26 Q19 23 22 19" stroke="#fde68a" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),
  beach: (
    <g>
      <path d="M8 44 Q20 32 32 42 Q44 52 56 42 V56 H8 Z" fill="#fcd34d" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <path d="M8 29 Q16 12 32 12 Q48 12 56 29" stroke="#4c8df5" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M22 14 Q25 12 28 14 M32 10 Q35 8 38 10" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M10 36 Q14 33 18 36 M42 30 Q46 27 50 30" stroke="#4c8df5" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),
  ferris: (
    <g>
      <circle cx="32" cy="32" r="24" fill="none" stroke="#0f4c75" strokeWidth="3" />
      <path d="M8 56 L32 32 L56 56" stroke="#0f4c75" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M32 8 V56 M10 22 L54 46 M54 22 L10 46" stroke="#94a3b8" strokeWidth="2.4" />
      <circle cx="32" cy="8" r="2.4" fill="#4c8df5" />
      <circle cx="8" cy="52" r="2.4" fill="#f87171" />
      <circle cx="56" cy="52" r="2.4" fill="#34d399" />
      <rect x="14" y="54" width="36" height="5" rx="2.4" fill="#8a5a2b" />
    </g>
  ),
  door: (
    <g>
      <rect x="14" y="8" width="36" height="48" rx="5" fill="#e8b571" stroke="#8a5a2b" strokeWidth="3" />
      <rect x="21" y="14" width="22" height="36" rx="4" fill="#7c3f1d" />
      <circle cx="37" cy="33" r="2.6" fill="#fbbf24" stroke="#b45309" strokeWidth="1.6" />
      <circle cx="32" cy="10" r="2.6" fill="#f87171" />
    </g>
  ),
  elephant: (
    <g>
      <ellipse cx="36" cy="34" rx="18" ry="15" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
      <circle cx="12" cy="24" r="8" fill="#94a3b8" stroke="#475569" strokeWidth="2.8" />
      <path d="M18 22 Q28 16 36 20" fill="#94a3b8" stroke="#475569" strokeWidth="2.4" />
      <path d="M22 38 Q14 42 12 56 Q18 54 20 48 Q22 42 28 40" fill="#94a3b8" stroke="#475569" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="13" cy="24" r="1.8" fill="#1e293b" />
      <path d="M8 27 Q8 30 6 30" stroke="#475569" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <rect x="28" y="46" width="7" height="12" rx="3.4" fill="#64748b" />
      <rect x="40" y="46" width="7" height="12" rx="3.4" fill="#64748b" />
    </g>
  ),
  gift: (
    <g>
      <rect x="10" y="28" width="44" height="26" rx="5" fill="#f87171" stroke="#9f1239" strokeWidth="3" />
      <path d="M32 28 V54" stroke="#fbbf24" strokeWidth="4" />
      <path d="M32 24 Q22 14 20 20 Q20 27 32 27 Q44 27 44 20 Q42 13 32 24" fill="#fbbf24" stroke="#b45309" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M32 24 Q36 20 40 20" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.8" />
    </g>
  ),
  grapes: (
    <g>
      <circle cx="22" cy="34" r="7" fill="#a78bfa" stroke="#5b21b6" strokeWidth="2.6" />
      <circle cx="36" cy="34" r="7" fill="#a78bfa" stroke="#5b21b6" strokeWidth="2.6" />
      <circle cx="29" cy="42" r="7" fill="#a78bfa" stroke="#5b21b6" strokeWidth="2.6" />
      <circle cx="15" cy="42" r="7" fill="#c4b5fd" stroke="#5b21b6" strokeWidth="2.6" />
      <circle cx="43" cy="42" r="7" fill="#c4b5fd" stroke="#5b21b6" strokeWidth="2.6" />
      <circle cx="29" cy="51" r="6" fill="#8b5cf6" stroke="#5b21b6" strokeWidth="2.6" />
      <path d="M29 16 Q29 26 29 32" stroke="#3f6212" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M29 16 Q34 12 38 15" stroke="#3f6212" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  ),
  hands: (
    <g>
      <path d="M10 30 Q16 20 26 24 L26 40 Q20 38 16 40 Q12 42 10 38 Z" fill="#fbc4ab" stroke="#b9653d" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M54 30 Q48 20 38 24 L38 40 Q44 38 48 40 Q52 42 54 38 Z" fill="#fbc4ab" stroke="#b9653d" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M16 34 L48 34" stroke="#fbbf24" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="32" cy="30" r="3" fill="#f87171" />
      <circle cx="32" cy="42" r="3" fill="#4c8df5" />
    </g>
  ),
  lion: (
    <g>
      <circle cx="32" cy="34" r="17" fill="#fbbf24" stroke="#b45309" strokeWidth="3.2" />
      <path d="M10 24 Q6 14 16 12 M18 12 Q14 4 24 6 M26 7 Q25 0 32 4 M38 7 Q40 6 40 10" stroke="#b45309" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="26" cy="32" r="2.4" fill="#fff" />
      <circle cx="38" cy="32" r="2.4" fill="#fff" />
      <circle cx="26.7" cy="32.7" r="1.2" fill="#1e293b" />
      <circle cx="38.7" cy="32.7" r="1.2" fill="#1e293b" />
      <circle cx="32" cy="41" rx="3.4" ry="3" fill="#7c3f1d" />
      <path d="M24 44 Q32 48 40 44" stroke="#b45309" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M15 20 Q12 18 10 20 M49 20 Q52 18 54 20" stroke="#b45309" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  slide: (
    <g>
      <path d="M14 14 L50 14 L50 20 L20 20 L20 26 L44 26 L44 54 H34 M26 54 H22" stroke="#0f4c75" strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14 L14 8 H46 L46 14" stroke="#f87171" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="18" y="52" width="6" height="6" rx="2" fill="#fbbf24" />
      <rect x="40" y="52" width="8" height="6" rx="2" fill="#fbbf24" />
    </g>
  ),
  mango: (
    <g>
      <path d="M20 40 Q14 30 20 22 Q32 10 48 14 Q54 30 44 40 Q34 48 20 40 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <path d="M44 16 Q48 12 52 10" stroke="#3f6212" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M28 34 Q32 42 38 38" stroke="#fff7ed" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.8" />
    </g>
  ),
  grandma: (
    <g>
      <circle cx="32" cy="18" r="12" fill="#fbc4ab" stroke="#b9653d" strokeWidth="3" />
      <path d="M20 16 Q20 6 32 6 Q44 6 44 16" fill="#e5e7eb" stroke="#94a3b8" strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 22 Q26 27 32 22 Q38 27 42 22" stroke="#b9653d" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M14 56 Q18 36 32 36 Q46 36 50 56 Z" fill="#a78bfa" stroke="#5b21b6" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="26" cy="24" r="1.8" fill="#1e293b" />
      <circle cx="38" cy="24" r="1.8" fill="#1e293b" />
      <path d="M42 58 Q40 52 44 50" stroke="#fbbf24" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  tooth: (
    <g>
      <path d="M16 30 Q14 14 26 10 Q32 16 38 10 Q50 14 48 30 Q48 44 40 52 Q32 58 24 52 Q16 44 16 30 Z" fill="#ffffff" stroke="#0f4c75" strokeWidth="3" strokeLinejoin="round" />
      <rect x="21" y="12" width="6" height="12" rx="2.6" transform="rotate(28 24 18)" fill="#f87171" stroke="#be123c" strokeWidth="2.2" />
      <path d="M28 24 L36 24" stroke="#94a3b8" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),
  pan: (
    <g>
      <circle cx="22" cy="34" r="14" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
      <path d="M16 28 Q22 22 26 24 Q22 30 16 36 Q20 32 24 30 Q20 26 16 28 Z" fill="#f59e0b" />
      <path d="M36 32 L56 26" stroke="#0f172a" strokeWidth="3.6" strokeLinecap="round" />
    </g>
  ),
  monkey: (
    <g>
      <circle cx="32" cy="30" rx="17" ry="15" fill="#e8b571" stroke="#8a5a2b" strokeWidth="3" />
      <circle cx="22" cy="24" r="7" fill="none" stroke="#8a5a2b" strokeWidth="2.8" />
      <circle cx="42" cy="24" r="7" fill="none" stroke="#8a5a2b" strokeWidth="2.8" />
      <circle cx="22" cy="24" r="2.6" fill="#1e293b" />
      <circle cx="42" cy="24" r="2.6" fill="#1e293b" />
      <circle cx="25" cy="31" r="1.6" fill="#fff" />
      <circle cx="39" cy="31" r="1.6" fill="#fff" />
      <circle cx="32" cy="37" r="3.6" fill="#7c3f1d" />
      <path d="M14 40 Q8 52 16 52 Q22 52 22 44" stroke="#8a5a2b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M48 40 Q54 52 46 52 Q40 52 40 44" stroke="#8a5a2b" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  train: (
    <g>
      <rect x="14" y="28" width="36" height="18" rx="6" fill="#f87171" stroke="#9f1239" strokeWidth="3" />
      <rect x="38" y="12" width="16" height="18" rx="5" fill="#fb923c" stroke="#9f1239" strokeWidth="3" />
      <rect x="42" y="16" width="8" height="10" rx="2" fill="#dbeafe" stroke="#9f1239" strokeWidth="2" />
      <rect x="19" y="33" width="10" height="8" rx="2" fill="#dbeafe" stroke="#9f1239" strokeWidth="2" />
      <rect x="33" y="33" width="10" height="8" rx="2" fill="#dbeafe" stroke="#9f1239" strokeWidth="2" />
      <circle cx="22" cy="50" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2.6" />
      <circle cx="42" cy="50" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2.6" />
      <path d="M38 20 L52 14" stroke="#9f1239" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  rainbow: (
    <g>
      <path d="M8 44 Q8 20 32 20 Q56 20 56 44" stroke="#f87171" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M16 44 Q16 27 32 27 Q48 27 48 44" stroke="#fbbf24" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M24 44 Q24 34 32 34 Q40 34 40 44" stroke="#4c8df5" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M14 52 H50" stroke="#34d399" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  ),
  carrot: (
    <g>
      <path d="M14 52 Q8 38 18 26 Q32 12 50 14 Q48 32 34 44 Q24 52 16 51 Z" fill="#fb923c" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
      <path d="M20 30 Q14 26 12 18 M24 24 Q20 18 20 12 M29 19 Q27 12 29 8" stroke="#3f6212" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M30 40 Q33 45 37 42" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
    </g>
  ),
  shelf: (
    <g>
      <rect x="6" y="10" width="52" height="6" rx="3" fill="#e8b571" stroke="#8a5a2b" strokeWidth="2.6" />
      <rect x="6" y="28" width="52" height="6" rx="3" fill="#e8b571" stroke="#8a5a2b" strokeWidth="2.6" />
      <rect x="6" y="46" width="52" height="6" rx="3" fill="#e8b571" stroke="#8a5a2b" strokeWidth="2.6" />
      <rect x="10" y="8" width="8" height="14" rx="2" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="2" />
      <rect x="30" y="8" width="8" height="14" rx="2" fill="#f87171" stroke="#9f1239" strokeWidth="2" />
      <rect x="46" y="8" width="8" height="14" rx="2" fill="#34d399" stroke="#065f46" strokeWidth="2" />
      <rect x="14" y="10" width="10" height="16" rx="2" fill="#c4b5fd" stroke="#5b21b6" strokeWidth="2" />
      <rect x="36" y="10" width="10" height="16" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
    </g>
  ),
  basket: (
    <g>
      <path d="M10 36 Q14 24 26 24 H38 Q50 24 54 36 L54 42 Q52 54 40 54 H24 Q12 54 10 42 Z" fill="#e8b571" stroke="#8a5a2b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 34 H52" stroke="#8a5a2b" strokeWidth="2.6" />
      <path d="M22 24 Q16 14 22 8 M34 22 Q34 12 40 8" stroke="#8a5a2b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="20" r="5" fill="#f87171" stroke="#be123c" strokeWidth="2" />
      <circle cx="46" cy="18" r="5" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="2" />
    </g>
  ),
  shop: (
    <g>
      <rect x="10" y="22" width="44" height="32" rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="3" />
      <path d="M16 12 L32 6 L48 12" stroke="#0f4c75" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8" y="22" width="48" height="10" rx="3" fill="#fb923c" stroke="#b45309" strokeWidth="3" />
      <rect x="16" y="32" width="16" height="22" rx="2" fill="#fde68a" stroke="#b45309" strokeWidth="2.4" />
      <rect x="34" y="32" width="14" height="22" rx="2" fill="#fde68a" stroke="#b45309" strokeWidth="2.4" />
      <circle cx="26" cy="12" r="2.4" fill="#f87171" />
    </g>
  ),
  flower: (
    <g>
      <circle cx="32" cy="18" r="6" fill="#f87171" stroke="#be123c" strokeWidth="2.2" />
      <circle cx="20" cy="26" r="6" fill="#fb923c" stroke="#c2410c" strokeWidth="2.2" />
      <circle cx="44" cy="26" r="6" fill="#fb923c" stroke="#c2410c" strokeWidth="2.2" />
      <circle cx="26" cy="36" r="6" fill="#f472b6" stroke="#be185d" strokeWidth="2.2" />
      <circle cx="38" cy="36" r="6" fill="#f472b6" stroke="#be185d" strokeWidth="2.2" />
      <circle cx="32" cy="27" r="7" fill="#fbbf24" stroke="#b45309" strokeWidth="2.4" />
      <rect x="30" y="42" width="4" height="16" rx="2" fill="#3f6212" stroke="#365314" strokeWidth="2" />
    </g>
  ),
  flagParty: (
    <g>
      <path d="M24 8 V56" stroke="#0f4c75" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 10 Q34 6 44 12 Q36 16 24 12 Z" fill="#f87171" stroke="#9f1239" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="14" cy="20" r="2.6" fill="#fbbf24" />
      <circle cx="12" cy="32" r="2.6" fill="#4c8df5" />
      <circle cx="48" cy="24" r="2.6" fill="#34d399" />
      <circle cx="48" cy="40" r="2.6" fill="#a78bfa" />
    </g>
  ),
  'key': (
    <g>
      <circle cx="18" cy="40" r="11" fill="none" stroke="#fbbf24" strokeWidth="4" />
      <path d="M27 31 L52 6 L56 10 L42 24 L48 30 L44 34 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2.6" strokeLinejoin="round" />
    </g>
  ),
  owl: (
    <g>
      <ellipse cx="32" cy="42" rx="22" ry="24" fill="#7dd3fc" stroke="#0f4c75" strokeWidth="3" />
      <path d="M14 32 L6 14 L24 26 M50 32 L58 14 L40 26" stroke="#0f4c75" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="22" cy="32" rx="11" ry="15" fill="#e0f2fe" stroke="#0f4c75" strokeWidth="2" />
      <ellipse cx="42" cy="32" rx="11" ry="15" fill="#e0f2fe" stroke="#0f4c75" strokeWidth="2" />
      <circle cx="22" cy="33" r="4.4" fill="#0f4c75" />
      <circle cx="42" cy="33" r="4.4" fill="#0f4c75" />
      <circle cx="23.4" cy="31.6" r="1.4" fill="#fff" />
      <circle cx="43.4" cy="31.6" r="1.4" fill="#fff" />
      <path d="M30 40 L34 40 L32 45 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.8" strokeLinejoin="round" />
      <ellipse cx="32" cy="50" rx="13" ry="10" fill="#f0f9ff" stroke="#0f4c75" strokeWidth="1.8" />
      <path d="M26 62 L22 68 M26 62 L26 69 M26 62 L30 68 M38 62 L34 68 M38 62 L38 69 M38 62 L42 68" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
}

// ── id → art key maps ──────────────────────────────────────────────────────
// Fall back to 'star' if a key is unknown, so adding data never breaks a page.

export const ACTIVITY_ART = {
  writing: 'pencil',
  speaking: 'mic',
  grammar: 'puzzle',
  vocabulary: 'book',
  'sentence-builder': 'blocks',
  'listen-speak': 'ear',
  'daily-challenge': 'calendar',
  progress: 'chart',
}

export const BADGE_ART = {
  'first-step': 'sprout',
  'little-writer': 'quill',
  'brave-speaker': 'megaphone',
  'word-explorer': 'book',
  'grammar-hero': 'shield',
  'builder-buddy': 'blocks',
  'listener-star': 'ear',
  'daily-doer': 'calendar',
  'english-explorer': 'compass',
  'streak-3': 'flame',
  'streak-7': 'flame',
  champion: 'crown',
}

export const LEVEL_ART = {
  1: 'sprout',
  2: 'compass',
  3: 'rocket',
  4: 'star',
  5: 'trophy',
}

export const TOPIC_ART = {
  greetings: 'chat',
  pronouns: 'person',
  nouns: 'book',
  'singular-plural': 'blocks',
  'a-an-the': 'abc',
  'am-is-are': 'person',
  'has-have': 'book',
  'was-were': 'clock',
  'this-that-these-those': 'target',
  'there-is-are': 'tree',
  'present-simple': 'sun',
  'present-continuous': 'sparkle',
  'past-simple': 'book',
  'future-simple': 'rocket',
  prepositions: 'box',
  adjectives: 'palette',
  adverbs: 'sparkle',
  conjunctions: 'link',
  'question-words': 'question',
  'sentence-formation': 'blocks',
}

export const SCENE_ART = {
  park: 'tree',
  classroom: 'school',
  zoo: 'lion',
  market: 'shop',
  beach: 'beach',
  birthday: 'cake',
  playground: 'slide',
  library: 'shelf',
  'bus-stop': 'bus',
  'family-home': 'home',
  'rainy-day': 'rain',
  'sports-day': 'flag',
  picnic: 'basket',
  'vegetable-shop': 'carrot',
  'railway-station': 'train',
}

export const CATEGORY_ART = {
  animals: 'lion',
  fruits: 'apple',
  vegetables: 'carrot',
  school: 'school',
  family: 'heart',
  home: 'home',
  nature: 'tree',
  sports: 'ball',
  food: 'pan',
  places: 'shop',
  jobs: 'shield',
  feelings: 'sparkle',
  actions: 'sprout',
  transportation: 'bus',
}

// Sentence Builder sets + Listen & Speak cards are keyed by scene emoji in the
// data files; this map turns each emoji into a cartoon art key.
export const SCENE_EMOJI_ART = {
  '🐱': 'cat',
  '🐕': 'dog',
  '🌞': 'sun',
  '🦋': 'butterfly',
  '🍎': 'apple',
  '🏫': 'school',
  '🚌': 'bus',
  '🐦': 'bird',
  '🥛': 'milk',
  '🌧️': 'rain',
  '⚽': 'ball',
  '📖': 'book',
  '🏊': 'swim',
  '🎂': 'cake',
  '🏏': 'bat',
  '🌳': 'tree',
  '🎨': 'palette',
  '🚲': 'cycle',
  '🍦': 'icecream',
  '☔': 'umbrella',
  '🪁': 'kite',
  '🥣': 'bowl',
  '🐄': 'cow',
  '🏞️': 'mount',
  '🌙': 'moon',
  '🏖️': 'beach',
  '🎡': 'ferris',
  '🚪': 'door',
  '🐘': 'elephant',
  '🎁': 'gift',
  '🍇': 'grapes',
  '🤝': 'hands',
  '🦁': 'lion',
  '🛝': 'slide',
  '☀️': 'sun',
  '🥭': 'mango',
  '🐶': 'dog',
  '🐮': 'cow',
  '🌺': 'flower',
  '👵': 'grandma',
  '🚆': 'train',
  '🪥': 'tooth',
  '🥞': 'pan',
  '🐒': 'monkey',
  '🎤': 'mic',
  '⭐': 'star',
  '🏠': 'home',
  '🌈': 'rainbow',
  '🌿': 'leaf',
  '🌱': 'sprout',
}

export const WRITING_TOPIC_ART = {
  'my-family': 'heart',
  'my-best-friend': 'hands',
  'my-favourite-animal': 'lion',
  'my-school': 'school',
  'my-favourite-food': 'pan',
  'my-pet': 'dog',
  'a-rainy-day': 'rain',
  'my-grandmother': 'grandma',
  'the-park': 'tree',
  'my-favourite-festival': 'flag',
  'my-home': 'home',
  'after-school': 'clock',
  'my-favourite-game': 'ball',
  'a-trip-to-the-zoo': 'elephant',
  'when-i-grow-up': 'rocket',
  'all-about-me': 'person',
  'my-favourite-season': 'sun',
  'a-day-at-the-beach': 'beach',
  'my-teacher': 'book',
  'if-i-had-a-superpower': 'sparkle',
}

export function artKey(meta) {
  const key = meta && meta.art
  return key && ART[key] ? key : 'star'
}