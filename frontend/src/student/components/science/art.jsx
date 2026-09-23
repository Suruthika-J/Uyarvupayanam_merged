// SCI_ART — small original cartoon icons used across the Science Adventure
// (discoveries, image-choice options, sort items, experiment props, hub place
// pins). Kept in one component so it can be imported from both data/mirrors
// and renderers. viewBox 0 0 64 64, same contract as the social module's art.

const art = {
  tree: (
    <g>
      <path d="M12 38 Q18 18 32 14 Q46 18 52 38 Q40 34 32 36 Q24 34 12 38 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="24" cy="28" r="4" fill="#43a047" opacity="0.8" />
      <circle cx="40" cy="26" r="3.2" fill="#43a047" opacity="0.8" />
      <rect x="29.5" y="36" width="5" height="16" rx="2.4" fill="#8d6e63" stroke="#5d4037" strokeWidth="2.4" />
    </g>
  ),
  leaf: (
    <g>
      <path d="M12 50 Q10 26 32 12 Q52 16 52 34 Q46 48 28 48 Q20 50 12 50 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 50 Q18 36 32 28 Q44 22 52 34" stroke="#2e7d32" strokeWidth="2" fill="none" />
      <path d="M24 44 Q30 34 40 28" stroke="#2e7d32" strokeWidth="1.6" fill="none" />
    </g>
  ),
  seed: (
    <g>
      <ellipse cx="32" cy="40" rx="13" ry="8" fill="#a0724a" stroke="#6e4a2b" strokeWidth="2.6" transform="rotate(-12 32 40)" />
      <path d="M36 34 Q30 10 36 6 Q42 10 36 34" fill="#a8e06a" stroke="#5f9e3c" strokeWidth="2.6" strokeLinejoin="round" />
    </g>
  ),
  stone: (
    <g>
      <path d="M10 42 Q12 28 24 26 Q38 22 46 30 Q54 36 54 44 Q44 52 30 52 Q18 52 10 42 Z" fill="#b8bcc4" stroke="#7a7f89" strokeWidth="3" strokeLinejoin="round" />
      <path d="M20 36 Q26 32 34 34" stroke="#7a7f89" strokeWidth="2" fill="none" opacity="0.7" />
    </g>
  ),
  frog: (
    <g>
      <ellipse cx="26" cy="26" rx="9" ry="7" fill="#66bb6a" stroke="#2e7d32" strokeWidth="2.4" />
      <ellipse cx="38" cy="26" rx="9" ry="7" fill="#66bb6a" stroke="#2e7d32" strokeWidth="2.4" />
      <circle cx="24" cy="24" r="2.4" fill="#1b5e20" />
      <circle cx="40" cy="24" r="2.4" fill="#1b5e20" />
      <path d="M24 36 Q32 46 40 36 Q48 34 48 40 L44 48 Q36 52 28 48 L20 44 Q18 36 24 36 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M24 37 Q28 52 22 58" stroke="#2e7d32" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  honeybee: (
    <g>
      <ellipse cx="32" cy="34" rx="12" ry="9" fill="#ffd54f" stroke="#b8860b" strokeWidth="2.6" />
      <path d="M22 30 L42 30 M22 36 L42 36" stroke="#b8860b" strokeWidth="2.6" />
      <circle cx="30" cy="28" r="2" fill="#1b5e20" />
      <ellipse cx="45" cy="26" rx="10" ry="5" fill="#e3f2fd" stroke="#90a4ae" strokeWidth="2.2" transform="rotate(-24 45 26)" />
      <line x1="8" y1="14" x2="22" y2="26" stroke="#90a4ae" strokeWidth="2" />
      <line x1="7" y1="22" x2="19" y2="30" stroke="#90a4ae" strokeWidth="2" />
    </g>
  ),
  heart: (
    <g>
      <path d="M32 54 C20 44 12 36 12 26 C12 18 18 12 25 12 C29 12 31 14 32 17 C33 14 35 12 39 12 C46 12 52 18 52 26 C52 36 44 44 32 54 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth="3" strokeLinejoin="round" />
      <path d="M20 26 Q26 22 32 26" stroke="#ffcdd2" strokeWidth="2" fill="none" opacity="0.8" />
    </g>
  ),
  lungs: (
    <g>
      <path d="M26 16 Q14 16 13 27 Q12 44 22 50 L29 50 Q25 40 25 30 Q25 22 26 16 Z" fill="#f28c9c" stroke="#a5465a" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M38 16 Q50 16 51 27 Q52 44 42 50 L35 50 Q39 40 39 30 Q39 22 38 16 Z" fill="#f28c9c" stroke="#a5465a" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M29 34 Q32 30 35 34 Q32 40 29 34 Z" fill="#ffffff" stroke="#a5465a" strokeWidth="2" />
      <path d="M32 16 L32 8" stroke="#a5465a" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  stomach: (
    <g>
      <path d="M22 14 Q14 16 13 30 Q12 48 24 52 Q38 54 42 40 Q46 24 38 20 Q34 16 30 14 Q24 12 22 14 Z" fill="#ffab91" stroke="#b74b2f" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M14 26 Q26 24 34 30" stroke="#ffe0b2" strokeWidth="2" fill="none" opacity="0.9" />
      <path d="M18 42 Q28 46 38 40" stroke="#ffe0b2" strokeWidth="2" fill="none" opacity="0.9" />
    </g>
  ),
  brain: (
    <g>
      <path d="M22 46 Q12 46 12 34 Q12 24 20 22 Q20 12 28 12 Q32 12 33 15 Q36 10 40 14 Q46 12 46 22 Q54 24 54 34 Q54 46 44 46 Q40 48 36 46 Q32 50 26 46 Q24 46 22 46 Z" fill="#ffe0b2" stroke="#ef6c00" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M20 30 Q25 28 27 34 Q29 40 24 41 M36 30 Q41 26 44 32 Q45 40 39 40" stroke="#ef6c00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M33 10 Q33 20 32 30 Q32 38 34 46" stroke="#ef6c00" strokeWidth="1.8" fill="none" />
    </g>
  ),
  bone: (
    <g>
      <path d="M22 16 Q20 10 25 8 Q29 6 32 13 Q35 6 41 8 Q45 10 42 16 Q48 18 47 23 Q46 28 40 27 Q36 30 34 32 L32 34 L30 32 Q28 30 24 27 Q18 28 17 23 Q17 18 22 16 Z" fill="#eceff1" stroke="#90a4ae" strokeWidth="2.4" strokeLinejoin="round" />
    </g>
  ),
  grain: (
    <g>
      <path d="M12 40 Q14 26 22 24 Q30 22 34 26 Q38 30 34 38 Q30 44 22 44 Q16 44 12 40 Z" fill="#f0c96a" stroke="#b8860b" strokeWidth="2.4" />
      <path d="M20 34 Q22 26 26 24" stroke="#d8a72f" strokeWidth="1.8" fill="none" />
      <path d="M34 12 Q36 16 40 14 Q44 18 42 22 Q48 22 50 26 Q54 26 52 32" stroke="#c9a24a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  dal: (
    <g>
      <circle cx="14" cy="14" r="3.4" fill="#e8c15a" stroke="#b8860b" strokeWidth="1.8" />
      <circle cx="30" cy="10" r="3" fill="#f0cd6c" stroke="#b8860b" strokeWidth="1.8" />
      <circle cx="44" cy="16" r="3.4" fill="#e6ba4e" stroke="#b8860b" strokeWidth="1.8" />
      <path d="M10 32 Q24 26 36 30 Q46 32 54 30 L54 48 Q36 54 20 50 Q12 48 10 46 Z" fill="#f7e08e" stroke="#c9a24a" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M30 38 Q32 40 30 42" stroke="#c9a24a" strokeWidth="1.6" fill="none" />
    </g>
  ),
  apple: (
    <g>
      <path d="M32 20 Q22 12 18 16 Q13 12 14 6 Q20 2 26 10 Q29 12 32 20 Q35 12 38 10 Q44 2 50 6 Q51 12 46 16 Q42 12 32 20 Z" fill="#2e7d32" stroke="#145214" strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
      <path d="M26 18 Q32 10 40 17 Q52 10 56 24 Q58 44 38 52 Q16 46 16 26 Q18 18 26 18 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M32 20 Q30 14 33 9" stroke="#6d4c41" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  ),
  carrot: (
    <g>
      <path d="M46 8 Q22 20 18 30 Q16 40 24 46 Q32 50 42 42 Q50 32 52 14 Z" fill="#fb8c00" stroke="#b06a00" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M26 22 Q30 28 26 34 Q22 38 26 42" stroke="#ffb74d" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M36 16 Q40 22 36 28 Q32 32 36 36" stroke="#ffb74d" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M44 8 Q39 6 35 8 M44 8 Q46 3 42 1 M44 8 Q48 5 50 8" stroke="#66bb6a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  banana: (
    <g>
      <path d="M18 12 Q8 28 14 44 Q20 52 32 52 Q42 50 46 44 Q36 44 24 40 Q12 30 18 12 Z" fill="#fdd835" stroke="#b8860b" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M22 18 Q18 26 20 34" stroke="#c9a24a" strokeWidth="1.8" fill="none" />
      <path d="M48 42 Q52 40 54 36" stroke="#b8860b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  water: (
    <g>
      <path d="M16 34 Q16 24 32 8 Q48 24 48 34 Q48 44 40 48 Q32 52 24 48 Q16 44 16 34 Z" fill="#29b6f6" stroke="#0277bd" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M24 34 Q29 38 34 34 M38 30 Q41 32 43 30" stroke="#b3e5fc" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  sweets: (
    <g>
      <path d="M20 14 Q8 30 14 46 Q22 52 32 44 Q10 32 20 14 Z" fill="#e91e63" stroke="#a60d46" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M44 14 Q56 30 50 46 Q42 52 32 44 Q54 32 44 14 Z" fill="#f06292" stroke="#a60d46" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M30 16 L34 12 M34 40 L38 44" stroke="#a60d46" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  chips: (
    <g>
      <path d="M24 14 L34 8 L42 20 L30 26 Z" fill="#f5c04a" stroke="#b8860b" strokeWidth="2" />
      <path d="M40 14 L50 12 L54 22 L44 26 Z" fill="#ffd54f" stroke="#b8860b" strokeWidth="2" />
      <path d="M18 26 L28 22 L34 34 L24 40 Z" fill="#fb8c00" stroke="#b06a00" strokeWidth="2" />
      <path d="M36 34 Q48 32 52 42 Q40 48 30 40 Z" fill="#ffb74d" stroke="#b06a00" strokeWidth="2" />
      <path d="M14 38 Q24 36 28 44 Q18 50 12 46 Z" fill="#f5c04a" stroke="#b8860b" strokeWidth="2" />
    </g>
  ),
  burger: (
    <g>
      <path d="M12 30 Q14 14 32 14 Q50 14 52 30 Q36 33 28 30 Q20 27 12 30 Z" fill="#ffb74d" stroke="#b06a00" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="20" cy="24" r="2.4" fill="#4e342e" />
      <circle cx="32" cy="22" r="2.4" fill="#4e342e" />
      <circle cx="44" cy="25" r="2.4" fill="#4e342e" />
      <rect x="16" y="30" width="32" height="8" rx="3" fill="#4caf50" stroke="#2e7d32" strokeWidth="2" />
      <rect x="18" y="40" width="28" height="8" rx="3" fill="#fdd835" stroke="#b8860b" strokeWidth="2" />
      <path d="M14 50 Q32 55 50 50" stroke="#b06a00" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  iron: (
    <g>
      <path d="M8 50 L28 12 L38 18 L26 46 Z" fill="#78909c" stroke="#455a64" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M28 12 L40 8 L50 14 L38 18 Z" fill="#b0bec5" stroke="#455a64" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="42" y="16" width="8" height="22" rx="3" fill="#5d8a8a" stroke="#2c5353" strokeWidth="2.2" />
    </g>
  ),
  cotton: (
    <g>
      <path d="M32 14 Q22 14 20 24 Q18 32 24 36 Q22 46 32 48 Q42 46 40 36 Q46 32 44 24 Q42 14 32 14 Z" fill="#ffffff" stroke="#cfd8dc" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M32 48 L32 56" stroke="#6d8a4c" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 48 Q36 52 40 52" stroke="#6d8a4c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M30 46 Q28 51 26 50" stroke="#6d8a4c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  ),
  glass: (
    <g>
      <path d="M16 8 L48 8 L42 30 Q40 54 32 56 Q24 54 22 30 Z" fill="#b3e5fc" stroke="#0277bd" strokeWidth="2.6" strokeLinejoin="round" opacity="0.9" />
      <path d="M20 14 L44 14 M22 24 Q28 26 44 24" stroke="#4fc3f7" strokeWidth="2" fill="none" />
    </g>
  ),
  wood: (
    <g>
      <rect x="10" y="14" width="46" height="34" rx="5" fill="#c9884e" stroke="#8d5a2b" strokeWidth="2.6" />
      <path d="M16 20 Q24 16 34 20 Q44 24 50 20 M16 30 Q26 26 38 30 Q46 32 50 30 M16 40 Q26 36 38 40" stroke="#8d5a2b" strokeWidth="1.8" fill="none" opacity="0.7" />
    </g>
  ),
  sponge: (
    <g>
      <path d="M12 30 Q12 18 26 16 Q34 14 44 18 Q54 20 54 32 Q56 46 40 48 Q28 50 18 46 Q10 42 12 30 Z" fill="#ffcc80" stroke="#b06a00" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="22" cy="28" r="2.4" fill="#b06a00" opacity="0.7" />
      <circle cx="40" cy="24" r="3" fill="#b06a00" opacity="0.7" />
      <circle cx="34" cy="40" r="2.6" fill="#b06a00" opacity="0.7" />
    </g>
  ),
  plastic: (
    <g>
      <path d="M12 22 Q20 14 34 16 Q46 14 52 22 L42 30 Q32 24 24 30 Z" fill="#9575cd" stroke="#5e35b1" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M42 30 Q40 48 32 52 Q24 48 24 30 Z" fill="#b39ddb" stroke="#5e35b1" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M18 22 Q26 18 36 20" stroke="#4527a0" strokeWidth="1.8" fill="none" opacity="0.6" />
    </g>
  ),
  magnet: (
    <g>
      <path d="M12 12 L24 12 L24 34 Q24 46 32 46 Q40 46 40 34 L40 12 L52 12 L52 34 Q52 54 32 54 Q12 54 12 34 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth="2.6" strokeLinejoin="round" />
      <rect x="18" y="12" width="10" height="18" rx="4" fill="#ffffff" />
      <rect x="36" y="12" width="10" height="18" rx="4" fill="#ffffff" />
    </g>
  ),
  paper: (
    <g>
      <rect x="14" y="8" width="38" height="48" rx="3" fill="#ffffff" stroke="#90a4ae" strokeWidth="2.4" />
      <path d="M20 20 Q28 18 36 20 M20 28 Q30 26 44 28 M20 36 Q32 34 44 36 M20 44 Q30 42 44 44" stroke="#90a4ae" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M44 8 L52 16 L50 30 L40 54" stroke="#ffb74d" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
    </g>
  ),
  ice: (
    <g>
      <path d="M32 4 L52 18 L32 32 L12 18 Z" fill="#b3e5fc" stroke="#4fc3f7" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M32 32 L32 60 M12 18 L32 32 L52 18 M22 11 L12 18 L22 25 M42 11 L52 18 L42 25" stroke="#4fc3f7" strokeWidth="2" fill="none" opacity="0.7" />
    </g>
  ),
  droplet: (
    <g>
      <path d="M32 6 Q50 26 50 40 Q50 52 38 54 Q26 56 16 48 Q8 40 14 28 Q20 16 32 6 Z" fill="#29b6f6" stroke="#0277bd" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="28" cy="30" r="3" fill="#b3e5fc" opacity="0.9" />
      <circle cx="38" cy="36" r="2.2" fill="#b3e5fc" opacity="0.7" />
    </g>
  ),
  steam: (
    <g>
      <path d="M22 30 Q14 14 32 6 Q50 14 42 30 Q52 40 32 50 Q24 40 22 30 Z" fill="#b0bec5" stroke="#78909c" strokeWidth="2.6" strokeLinejoin="round" opacity="0.9" />
      <path d="M26 20 L30 14 M38 20 L42 14 M32 8 L34 2" stroke="#cfd8dc" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  thermometer: (
    <g>
      <rect x="26" y="6" width="12" height="26" rx="6" fill="#ef5350" stroke="#b71c1c" strokeWidth="2.4" />
      <circle cx="32" cy="44" r="9" fill="#ef5350" stroke="#b71c1c" strokeWidth="2.6" />
      <path d="M32 14 L32 40" stroke="#ffcdd2" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  cloud: (
    <g>
      <path d="M16 44 Q8 44 9 34 Q10 24 22 24 Q26 12 38 16 Q48 14 50 26 Q58 26 56 36 Q54 44 44 44 Z" fill="#e3f2fd" stroke="#90a4ae" strokeWidth="2.6" strokeLinejoin="round" />
    </g>
  ),
  tap: (
    <g>
      <path d="M20 24 Q14 14 24 8 Q32 4 38 12 Q34 16 40 18 Z" fill="#b0bec5" stroke="#78909c" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="28" y="14" width="10" height="14" rx="4" fill="#78909c" />
      <path d="M14 28 H50 L46 34 H18 Z" fill="#8d99a3" stroke="#5c6b76" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M40 38 Q32 50 22 46 Q16 56 28 58 Z" fill="#29b6f6" stroke="#0277bd" strokeWidth="2.2" strokeLinejoin="round" />
    </g>
  ),
  river: (
    <g>
      <path d="M6 14 Q20 6 34 14 Q48 22 60 12 L60 26 Q44 34 30 26 Q16 18 6 28 Z" fill="#42a5f5" stroke="#1565c0" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M6 34 Q22 26 38 34 Q50 42 60 32" stroke="#1e88e5" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M6 44 Q24 38 42 44 Q52 50 60 44" stroke="#1e88e5" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M8 18 Q14 24 10 30 M24 12 Q22 18 26 22" stroke="#b3e5fc" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  waterfall: (
    <g>
      <path d="M20 6 Q30 4 40 8 L40 22 L20 22 Z" fill="#8d99a3" stroke="#5c6b76" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M22 24 Q26 34 22 44 Q26 34 26 24 M32 26 Q36 34 32 46 Q28 36 32 26" stroke="#29b6f6" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M16 46 Q32 40 48 46 L48 56 L16 56 Z" fill="#42a5f5" stroke="#1565c0" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 50 Q30 48 36 50" stroke="#b3e5fc" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  ball: (
    <g>
      <circle cx="32" cy="32" r="20" fill="#f5c04a" stroke="#b8860b" strokeWidth="3" />
      <path d="M18 22 Q28 16 44 24 M14 34 Q28 30 46 38 M20 46 Q28 42 40 48" stroke="#b8860b" strokeWidth="2.2" fill="none" />
    </g>
  ),
  seesaw: (
    <g>
      <path d="M14 50 L30 46 Q28 42 30 40 Q44 34 54 38 L50 46 Q40 42 34 45 L34 50 Z" fill="#8d6e63" stroke="#4e342e" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="31" y="44" width="6" height="12" rx="2" fill="#5d4037" stroke="#3e2723" strokeWidth="2" />
      <circle cx="22" cy="42" r="6" fill="#ef5350" stroke="#b71c1c" strokeWidth="2" />
      <circle cx="46" cy="38" r="6" fill="#29b6f6" stroke="#0277bd" strokeWidth="2" />
    </g>
  ),
  cart: (
    <g>
      <circle cx="18" cy="48" r="8" fill="#546e7a" stroke="#263238" strokeWidth="2.4" />
      <circle cx="46" cy="48" r="8" fill="#546e7a" stroke="#263238" strokeWidth="2.4" />
      <path d="M8 26 L56 18 L56 30 L24 34 L8 40 Z" fill="#ffb74d" stroke="#b06a00" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 34 L28 8" stroke="#b06a00" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 20 L30 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  ramp: (
    <g>
      <path d="M56 10 L16 50 L10 50 L14 44 L40 18 L48 10 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth="2.6" strokeLinejoin="round" />
      <rect x="6" y="50" width="54" height="7" rx="3" fill="#8d99a3" stroke="#5c6b76" strokeWidth="2" />
      <circle cx="40" cy="16" r="6" fill="#42a5f5" stroke="#1565c0" strokeWidth="2" />
    </g>
  ),
  balloon: (
    <g>
      <path d="M32 6 Q52 22 50 36 Q48 48 32 48 Q16 48 14 36 Q12 22 32 6 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M28 20 Q30 30 26 34" stroke="#ffcdd2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 48 L32 56" stroke="#b71c1c" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  kite: (
    <g>
      <path d="M32 8 L54 28 L32 58 L10 28 Z" fill="#ffd54f" stroke="#b8860b" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M32 8 L32 58 M18 24 L46 24" stroke="#b8860b" strokeWidth="1.8" fill="none" />
      <path d="M32 38 Q24 44 26 54 M32 40 Q40 46 38 56" stroke="#f06292" strokeWidth="1.8" fill="none" />
      <path d="M32 58 Q14 66 10 60 M32 58 Q46 62 50 56 M32 58 L30 66 M32 58 L36 64" stroke="#b8860b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  ),
  windmill: (
    <g>
      <rect x="30" y="18" width="5" height="38" rx="2.4" fill="#8d99a3" stroke="#5c6b76" strokeWidth="2" />
      <g className="sci-spin">
        <rect x="30" y="4" width="5" height="16" rx="2.4" fill="#2e8a4c" stroke="#14532c" strokeWidth="1.8" />
        <rect x="20" y="13" width="16" height="5" rx="2.4" fill="#2e8a4c" stroke="#14532c" strokeWidth="1.8" />
        <rect x="43" y="17" width="16" height="5" rx="2.4" fill="#2e8a4c" stroke="#14532c" strokeWidth="1.8" />
        <rect x="12" y="23" width="5" height="16" rx="2.4" fill="#2e8a4c" stroke="#14532c" strokeWidth="1.8" />
        <rect x="45" y="13" width="5" height="16" rx="2.4" fill="#2e8a4c" stroke="#14532c" strokeWidth="1.8" />
      </g>
      <circle cx="32" cy="18" r="3.4" fill="#546e7a" stroke="#263238" strokeWidth="1.6" />
    </g>
  ),
  pinwheel: (
    <g>
      <path d="M32 32 L32 12 Q40 14 44 22 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M32 32 L12 32 Q14 24 22 20 Z" fill="#f06292" stroke="#b71c1c" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M32 32 L52 32 Q50 40 42 44 Z" fill="#29b6f6" stroke="#0277bd" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M32 32 L32 52 Q24 50 20 42 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="3" fill="#ffffff" stroke="#546e7a" strokeWidth="1.6" />
      <rect x="30" y="48" width="4" height="10" rx="2" fill="#8d99a3" />
    </g>
  ),
  sun: (
    <g>
      <circle cx="32" cy="32" r="13" fill="#ffd54f" stroke="#b8860b" strokeWidth="2.6" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180
        return (
          <line
            key={i}
            x1={32 + Math.cos(a) * 19}
            y1={32 + Math.sin(a) * 19}
            x2={32 + Math.cos(a) * 26}
            y2={32 + Math.sin(a) * 26}
            stroke="#fb8c00"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        )
      })}
      <circle cx="26" cy="29" r="2.2" fill="#b8860b" />
      <circle cx="38" cy="29" r="2.2" fill="#b8860b" />
      <path d="M24 38 Q32 43 40 38" stroke="#b8860b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  ),
  lamp: (
    <g>
      <path d="M18 20 Q18 8 32 8 Q46 8 46 20 Q46 26 40 28 L24 28 Q18 26 18 20 Z" fill="#ffd54f" stroke="#b8860b" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M40 28 L42 36 L22 36 L24 28 Z" fill="#8d99a3" stroke="#5c6b76" strokeWidth="2" strokeLinejoin="round" />
      <rect x="20" y="38" width="24" height="5" rx="2.4" fill="#546e7a" />
      <rect x="30" y="43" width="4" height="11" rx="2" fill="#546e7a" />
      <path d="M26 28 Q26 30 28 30 M36 28 Q38 30 38 30" stroke="#ffe082" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  mirror: (
    <g>
      <rect x="18" y="10" width="28" height="44" rx="6" fill="#bce3f7" stroke="#546e7a" strokeWidth="2.6" />
      <path d="M24 16 L34 20 L36 30 L28 42 L22 40 Z" fill="#ffffff" opacity="0.9" />
      <circle cx="30" cy="26" r="2" fill="#90a4ae" opacity="0.8" />
      <path d="M25 34 Q29 37 33 34" stroke="#90a4ae" strokeWidth="1.8" fill="none" opacity="0.8" />
    </g>
  ),
  shadow: (
    <g>
      <circle cx="32" cy="22" r="8" fill="#ffd54f" stroke="#b8860b" strokeWidth="2.4" />
      <path d="M32 10 Q42 24 36 40 Q46 40 52 28 Q56 38 48 46" stroke="#fb8c00" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  bell: (
    <g>
      <path d="M32 8 Q26 10 24 18 Q22 30 16 34 L48 34 Q42 30 40 18 Q38 10 32 8 Z" fill="#f5c04a" stroke="#b8860b" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M32 38 Q34 42 34 44 Q34 48 30 49 Q26 48 26 44" stroke="#b8860b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="18" r="2" fill="#b8860b" />
    </g>
  ),
  drum: (
    <g>
      <path d="M12 20 L24 12 L52 12 L46 20 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth="2.6" strokeLinejoin="round" />
      <rect x="14" y="18" width="36" height="24" rx="4" fill="#e8c15a" stroke="#b8860b" strokeWidth="2.4" />
      <path d="M22 22 Q28 30 24 40 M36 22 Q42 30 38 40" stroke="#b8860b" strokeWidth="2" fill="none" />
      <circle cx="22" cy="14" r="2.4" fill="#b71c1c" />
      <circle cx="44" cy="14" r="2.4" fill="#b71c1c" />
    </g>
  ),
  earth: (
    <g>
      <circle cx="32" cy="32" r="20" fill="#42a5f5" stroke="#1565c0" strokeWidth="3" />
      <path d="M16 26 Q24 20 32 23 Q40 26 42 20 Q48 22 50 28 Q40 32 30 29 Q20 27 16 31 Z" fill="#66bb6a" />
      <path d="M33 12 Q37 24 32 36 Q28 48 26 50 Q22 44 23 34 Q24 22 33 12 Z" fill="#66bb6a" />
      <path d="M18 40 Q24 38 30 41 M44 34 Q40 42 36 44" stroke="#90caf9" strokeWidth="2" fill="none" opacity="0.9" />
    </g>
  ),
  moon: (
    <g>
      <path d="M40 8 Q52 18 50 32 Q48 46 34 52 Q22 56 14 48 Q26 52 34 46 Q46 38 43 26 Q40 16 40 8 Z" fill="#fff59d" stroke="#b8860b" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="34" cy="26" r="2.4" fill="#c9a24a" opacity="0.8" />
      <circle cx="42" cy="36" r="2" fill="#c9a24a" opacity="0.7" />
    </g>
  ),
  star: (
    <g>
      <path d="M32 6 L39 22 L56 24 L43 36 L47 53 L32 44 L17 53 L21 36 L8 24 L25 22 Z" fill="#ffd54f" stroke="#b8860b" strokeWidth="2.4" strokeLinejoin="round" />
    </g>
  ),
  rocket: (
    <g>
      <path d="M32 4 Q40 18 42 30 L42 46 Q42 50 38 50 L26 50 Q22 50 22 46 L22 30 Q24 18 32 4 Z" fill="#90caf9" stroke="#1565c0" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="32" cy="24" r="6" fill="#1565c0" />
      <path d="M32 42 L32 50 M26 46 L26 52 M38 46 L38 52" stroke="#ffb74d" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 42 L8 46 L22 50 Z M42 42 L56 46 L42 50 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth="2" strokeLinejoin="round" />
    </g>
  ),
  telescope: (
    <g>
      <path d="M8 54 L16 44 L34 24 L44 34 L24 54 Z" fill="#8d99a3" stroke="#5c6b76" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="40" cy="28" r="9" fill="#42a5f5" stroke="#1565c0" strokeWidth="2.4" />
      <path d="M14 54 L8 54 L8 50 L16 44" stroke="#5c6b76" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <circle cx="40" cy="28" r="3.4" fill="#fff59d" />
    </g>
  ),
  recycle: (
    <g>
      <path d="M14 30 L20 12 L26 16 L22 28 Z M28 16 L22 12 L28 6 L38 8 L38 14 L28 16 Z M34 22 L46 18 L48 26 L40 34 L36 30 Z M44 34 L52 26 L56 34 L52 44 L46 42 Z M36 52 L28 48 L28 40 L34 38 L38 46 Z M20 48 L16 38 L20 32 L28 36 L26 42 Z" fill="#43a047" stroke="#1b5e20" strokeWidth="2.4" strokeLinejoin="round" />
    </g>
  ),
  bin: (
    <g>
      <path d="M18 14 L46 14 L42 56 L22 56 Z" fill="#78909c" stroke="#37474f" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M14 20 L50 20 Z" fill="none" stroke="#37474f" strokeWidth="2.4" />
      <rect x="26" y="6" width="12" height="6" rx="2.4" fill="#90a4ae" stroke="#37474f" strokeWidth="2" />
      <path d="M26 28 L30 48 M38 28 L34 48" stroke="#cfd8dc" strokeWidth="2" fill="none" />
    </g>
  ),
  factory: (
    <g>
      <rect x="6" y="30" width="52" height="24" rx="3" fill="#b0bec5" stroke="#455a64" strokeWidth="2.6" />
      <rect x="12" y="40" width="8" height="14" fill="#78909c" />
      <rect x="28" y="40" width="8" height="14" fill="#78909c" />
      <rect x="44" y="40" width="8" height="14" fill="#78909c" />
      <path d="M12 30 L16 20 L24 30 L30 14 L38 30 L46 18 L52 30 Z" fill="#546e7a" stroke="#263238" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M8 26 Q16 20 24 27 Q32 34 42 26 Q50 18 58 22" stroke="#90a4ae" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  ),
  polybag: (
    <g>
      <path d="M16 14 L48 14 L46 52 Q32 56 18 52 Z" fill="#bbd7e8" stroke="#4a6f87" strokeWidth="2.4" strokeLinejoin="round" opacity="0.95" />
      <path d="M24 14 Q24 8 32 8 Q40 8 40 14" stroke="#4a6f87" strokeWidth="2.2" fill="none" />
      <path d="M26 24 Q32 28 38 24" stroke="#8fb4cc" strokeWidth="2" fill="none" />
    </g>
  ),
  rainbow: (
    <g>
      <path d="M10 44 Q30 14 54 44" stroke="#ef5350" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M16 44 Q32 22 48 44" stroke="#fb8c00" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M22 44 Q32 30 42 44" stroke="#fdd835" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M27 44 Q32 37 37 44" stroke="#66bb6a" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  ),
  storm: (
    <g>
      <path d="M14 38 Q6 38 7 28 Q8 18 20 20 Q24 10 36 14 Q46 12 48 24 Q56 24 54 33 Q52 40 44 40 Z" fill="#90a4ae" stroke="#546e7a" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M36 40 Q40 48 36 52 M28 44 Q32 50 28 56" stroke="#ffd54f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M14 44 Q20 42 24 46 Q28 48 32 44" stroke="#b0bec5" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  umbrella: (
    <g>
      <path d="M32 8 Q16 12 12 30 Q12 36 20 36 L20 24 Q24 22 26 26 Q18 34 34 36 Q50 36 52 24 L44 36 Q52 36 52 30 Q48 12 32 8 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="30" y="36" width="4" height="12" rx="2" fill="#5d4037" />
      <path d="M30 46 Q30 52 26 54" stroke="#5d4037" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  windvane: (
    <g>
      <rect x="30" y="16" width="4" height="40" rx="2" fill="#8d99a3" />
      <g>
        <rect x="14" y="6" width="22" height="8" rx="3" fill="#ef5350" stroke="#b71c1c" strokeWidth="2" />
        <rect x="40" y="8" width="14" height="5" rx="2.5" fill="#42a5f5" stroke="#1565c0" strokeWidth="2" />
      </g>
      <circle cx="32" cy="16" r="3.4" fill="#f5c04a" stroke="#b8860b" strokeWidth="1.8" />
      <path d="M6 52 Q16 46 26 50 Q34 54 44 50 Q50 48 52 50" stroke="#546e7a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  testtube: (
    <g>
      <path d="M24 8 Q40 8 40 16 Q40 40 40 44 Q40 52 32 52 Q24 52 24 44 Q24 40 24 16 Z" fill="#b3e5fc" stroke="#0277bd" strokeWidth="2.4" strokeLinejoin="round" />
      <line x1="24" y1="20" x2="40" y2="20" stroke="#4fc3f7" strokeWidth="2" />
      <path d="M20 8 H44" stroke="#546e7a" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="18" cy="8" r="2" fill="#ef5350" />
    </g>
  ),
  flask: (
    <g>
      <path d="M26 8 L38 8 L36 30 L46 44 Q50 52 42 52 L22 52 Q14 52 18 44 L28 30 Z" fill="#cde8f7" stroke="#33608f" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 16 Q32 14 40 16" stroke="#8fc2e3" strokeWidth="2" fill="none" />
      <path d="M24 40 Q32 34 40 40" stroke="#66bb6a" strokeWidth="2.2" fill="none" />
      <path d="M18 28 Q24 26 28 30" stroke="#8fc2e3" strokeWidth="1.8" fill="none" />
    </g>
  ),
  magnifier: (
    <g>
      <circle cx="28" cy="28" r="14" fill="#e3f2fd" stroke="#33608f" strokeWidth="2.6" />
      <circle cx="28" cy="28" r="7" fill="#29b6f6" opacity="0.55" />
      <path d="M39 39 L54 54" stroke="#546e7a" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
  goggles: (
    <g>
      <circle cx="20" cy="32" r="10" fill="#e3f2fd" stroke="#33608f" strokeWidth="2.6" />
      <circle cx="44" cy="32" r="10" fill="#e3f2fd" stroke="#33608f" strokeWidth="2.6" />
      <path d="M28 26 L36 26" stroke="#546e7a" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 32 Q12 18 24 14 M52 32 Q52 18 40 14" stroke="#546e7a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="30" r="2.4" fill="#33608f" opacity="0.6" />
      <circle cx="42" cy="30" r="2.4" fill="#33608f" opacity="0.6" />
    </g>
  ),
  scale: (
    <g>
      <path d="M30 12 L34 12 L34 20 L38 20 L34 20 L34 28" stroke="#6d8a4c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M16 14 L34 8 L52 14 L46 20 L34 16 L22 20 Z" fill="#a8c08a" stroke="#5f7a3e" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="12" y="16" width="12" height="18" rx="3" fill="#ef9a9a" stroke="#c62828" strokeWidth="2" />
      <rect x="40" y="16" width="12" height="14" rx="3" fill="#90caf9" stroke="#1565c0" strokeWidth="2" />
      <path d="M14 38 Q32 34 50 38 L50 44 Q32 48 14 44 Z" fill="#8d99a3" stroke="#5c6b76" strokeWidth="2" strokeLinejoin="round" />
    </g>
  ),
}

export function SciArt({ k, size = 64, className = '', alt = '' }) {
  const node = art[k] || art.flask
  return (
    <svg
      className={`sci-art sci-art-${k} ${className}`}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={alt || undefined}
    >
      {node}
    </svg>
  )
}

export const SCI_ART_KEYS = Object.keys(art)

export default SciArt