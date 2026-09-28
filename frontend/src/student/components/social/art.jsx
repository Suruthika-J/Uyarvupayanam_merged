// SOCIAL_ART — small original cartoon icons used across the World Explorer
// (discoveries, image-choice options, scene props). Kept in one component so
// it can be imported from both data/mirrors and renderers.

const art = {
  sun: (
    <g>
      <circle cx="32" cy="32" r="14" fill="#ffd27a" stroke="#e08a2b" strokeWidth="3" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180
        const x1 = 32 + Math.cos(a) * 21
        const y1 = 32 + Math.sin(a) * 21
        const x2 = 32 + Math.cos(a) * 27
        const y2 = 32 + Math.sin(a) * 27
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffb35c" strokeWidth="3.5" strokeLinecap="round" />
      })}
      <circle cx="26" cy="28" r="2.4" fill="#a3562b" />
      <circle cx="38" cy="28" r="2.4" fill="#a3562b" />
      <path d="M24 37 Q32 43 40 37" stroke="#a3562b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  ),
  'planet-mercury': (
    <g>
      <circle cx="32" cy="32" r="12" fill="#b8a27f" stroke="#7c6a4a" strokeWidth="3" />
      <circle cx="28" cy="27" r="3" fill="#8f7c5c" opacity="0.6" />
      <circle cx="37" cy="35" r="2" fill="#6e5d42" opacity="0.5" />
    </g>
  ),
  'planet-venus': (
    <g>
      <circle cx="32" cy="32" r="14" fill="#e7c06a" stroke="#a8843f" strokeWidth="3" />
      <circle cx="27" cy="27" r="3.5" fill="#d0a646" opacity="0.7" />
      <circle cx="39" cy="38" r="2.5" fill="#a8843f" opacity="0.5" />
    </g>
  ),
  'planet-earth': (
    <g>
      <circle cx="32" cy="32" r="15" fill="#4d9de0" stroke="#2e6fb0" strokeWidth="3" />
      <path d="M18 27 Q24 22 30 24 Q36 26 37 22 Q44 24 45 30 Q37 32 30 30 Q22 30 18 34 Z" fill="#6ea85c" />
      <path d="M32 17 Q36 24 33 32 Q30 40 36 47 Q29 46 26 39 Q27 30 32 17 Z" fill="#6ea85c" />
      <path d="M19 38 Q25 36 30 39 Q26 45 22 46 Z" fill="#6ea85c" />
    </g>
  ),
  'planet-mars': (
    <g>
      <circle cx="32" cy="32" r="13" fill="#d9795a" stroke="#a84a33" strokeWidth="3" />
      <circle cx="27" cy="27" r="3" fill="#b65a40" opacity="0.6" />
      <circle cx="38" cy="36" r="2.4" fill="#a84a33" opacity="0.5" />
    </g>
  ),
  'planet-jupiter': (
    <g>
      <circle cx="32" cy="32" r="16" fill="#d9a05f" stroke="#a06a3a" strokeWidth="3" />
      <path d="M17 30 Q32 26 47 30" stroke="#c08a52" strokeWidth="3.4" fill="none" opacity="0.85" />
      <path d="M17 38 Q32 34 47 38" stroke="#a06a3a" strokeWidth="2.6" fill="none" opacity="0.6" />
      <circle cx="27" cy="23" r="2.2" fill="#c08a52" opacity="0.5" />
    </g>
  ),
  'planet-saturn': (
    <g>
      <circle cx="32" cy="32" r="12" fill="#e0b96a" stroke="#b0883f" strokeWidth="3" />
      <ellipse cx="32" cy="32" rx="26" ry="9" fill="none" stroke="#cfa657" strokeWidth="4.4" transform="rotate(-18 32 32)" />
      <circle cx="28" cy="28" r="2.2" fill="#a8843f" opacity="0.6" />
    </g>
  ),
  'planet-uranus': (
    <g>
      <circle cx="32" cy="32" r="13" fill="#9fd8de" stroke="#5ba5ad" strokeWidth="3" />
      <ellipse cx="32" cy="32" rx="25" ry="5" fill="none" stroke="#7ec7ce" strokeWidth="2.6" transform="rotate(75 32 32)" />
      <circle cx="27" cy="27" r="2.4" fill="#6bb4bc" opacity="0.6" />
    </g>
  ),
  'planet-neptune': (
    <g>
      <circle cx="32" cy="32" r="13" fill="#5b7bd9" stroke="#3b57ad" strokeWidth="3" />
      <circle cx="27" cy="28" r="3" fill="#4563b0" opacity="0.6" />
    </g>
  ),
  globe: (
    <g>
      <ellipse cx="32" cy="33" rx="20" ry="20" fill="#4d9de0" stroke="#2e6fb0" strokeWidth="3" />
      <path d="M20 26 Q26 21 32 24 Q38 27 38 22 Q42 25 44 29" fill="#6ea85c" />
      <path d="M33 13 Q36 23 32 33 Q29 41 36 49 Q28 49 24 42 Q25 33 33 13 Z" fill="#6ea85c" />
      <path d="M17 14 Q23 24 20 35 Q18 41 16 45" stroke="#2e6fb0" strokeWidth="2" fill="none" />
      <path d="M45 18 Q41 30 44 43" stroke="#2e6fb0" strokeWidth="2" fill="none" />
      <path d="M29 45 Q34 32 38 16" stroke="#2e6fb0" strokeWidth="1.8" fill="none" />
      <path d="M22 24 Q30 28 42 26 M20 38 Q30 34 42 37" stroke="#9fd0ea" strokeWidth="1.6" fill="none" opacity="0.7" />
    </g>
  ),
  'globe-daynight': (
    <g>
      <circle cx="32" cy="32" r="20" fill="#4d9de0" stroke="#2e6fb0" strokeWidth="3" />
      <path d="M17 25 Q24 20 30 23 Q37 12 45 22 Q47 28 45 34 Q34 38 26 33 Q20 30 17 25 Z" fill="#6ea85c" />
      <path d="M32 12 Q37 24 32 40 Q27 48 22 42 Q24 20 32 12 Z" fill="#0b1030" opacity="0.55" />
      <path d="M40 14 Q44 26 42 40 Q38 46 32 44" stroke="#0b1030" strokeWidth="2.4" fill="none" opacity="0.4" />
      <circle cx="48" cy="42" r="4" fill="#ffd27a" />
      <line x1="48" y1="36" x2="48" y2="34" stroke="#ffd27a" strokeWidth="1.6" />
      <line x1="54" y1="42" x2="56" y2="42" stroke="#ffd27a" strokeWidth="1.6" />
    </g>
  ),
  ocean: (
    <g>
      <path d="M6 30 Q18 22 30 30 Q42 38 56 28 L57 54 Q42 62 28 56 Q14 62 6 54 Z" fill="#3f7fc4" stroke="#2e6fb0" strokeWidth="3" />
      <path d="M12 36 Q20 32 28 36 M34 32 Q44 28 52 33" stroke="#bfe3ff" strokeWidth="2.6" fill="none" />
      <path d="M16 46 Q26 42 36 47 M40 44 Q48 41 54 45" stroke="#bfe3ff" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M10 26 Q18 30 24 23 Q28 16 35 18 Q40 13 46 17 Q50 12 55 16" stroke="#7cc0f0" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  mountain: (
    <g>
      <path d="M6 50 L20 20 L28 36 L36 12 L48 44 L56 26 L60 50 Z" fill="#8aa05a" stroke="#5f7a3e" strokeWidth="3" strokeLinejoin="round" />
      <path d="M36 12 L32 21 L40 21 Z" fill="#ffffff" stroke="#cfd8e6" strokeWidth="1.6" />
      <path d="M14 42 L26 31 L34 42 Z" fill="#6f8a4c" />
      <path d="M8 54 Q32 48 56 54" stroke="#5f7a3e" strokeWidth="3" fill="none" />
    </g>
  ),
  desert: (
    <g>
      <path d="M6 44 Q20 38 34 43 Q46 39 58 43 L58 56 Q38 50 20 54 Q12 52 6 54 Z" fill="#e7c06a" stroke="#c09a3f" strokeWidth="2.6" />
      <path d="M10 40 Q16 30 22 40" fill="none" stroke="#d0a646" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 38 Q48 26 56 38" fill="none" stroke="#d0a646" strokeWidth="3" strokeLinecap="round" />
      <circle cx="14" cy="20" r="8" fill="#ffd27a" stroke="#e08a2b" strokeWidth="2.4" />
      <path d="M12 16 L36 14" stroke="#e08a2b" strokeWidth="2" />
    </g>
  ),
  forest: (
    <g>
      {Array.from({ length: 5 }).map((_, i) => {
        const x = 10 + i * 11
        return (
          <g key={i}>
            <rect x={x + 3.4} y="40" width="4.4" height="12" fill="#7a4a2b" stroke="#5f3a1f" strokeWidth="1.6" />
            <path d={`M${x - 4} 40 L${x + 6} 22 L${x + 14} 40 Z`} fill="#4f9d6b" stroke="#3a7a50" strokeWidth="2" strokeLinejoin="round" />
            <path d={`M${x - 2} 33 L${x + 6} 18 L${x + 13} 33 Z`} fill="#6db681" stroke="#4f9d6b" strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        )
      })}
      <path d="M6 54 Q32 48 58 54" stroke="#3a7a50" strokeWidth="3" fill="none" />
    </g>
  ),
  river: (
    <g>
      <path d="M8 14 Q22 24 16 34 Q10 44 24 52 Q38 58 56 50" fill="none" stroke="#3f7fc4" strokeWidth="8" strokeLinecap="round" />
      <path d="M14 20 Q20 26 16 32 M20 44 Q30 50 42 48" stroke="#bfe3ff" strokeWidth="2.4" fill="none" />
    </g>
  ),
  compass: (
    <g>
      <circle cx="32" cy="32" r="20" fill="#fff7e3" stroke="#b0883f" strokeWidth="3.4" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="#e0b96a" strokeWidth="1.6" />
      <path d="M32 18 L38 32 L32 46 L26 32 Z" fill="#e0664f" stroke="#a84a33" strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 46 L38 32 L32 32 Z" fill="#fff3d6" stroke="#a84a33" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M26 32 L32 32 L32 46 Z" fill="#ffffff" stroke="#a84a33" strokeWidth="1.6" strokeLinejoin="round" />
    </g>
  ),
  map: (
    <g>
      <path d="M12 16 L26 12 L40 18 L52 12 L52 50 L40 54 L26 48 L12 53 Z" fill="#f2c98a" stroke="#b0883f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M25 14 L24 47 M40 19 L40 53" stroke="#b0883f" strokeWidth="1.8" />
      <path d="M18 24 Q22 26 24 23 M32 26 Q36 28 38 25 M20 36 Q24 38 26 35" stroke="#4f9d6b" strokeWidth="2" fill="none" />
      <circle cx="33" cy="33" r="2.6" fill="#e0664f" />
    </g>
  ),
  cave: (
    <g>
      <path d="M6 50 Q14 22 26 20 Q44 18 52 26 Q58 34 58 50 Z" fill="#6e4a2b" stroke="#52351f" strokeWidth="3" />
      <ellipse cx="32" cy="38" rx="13" ry="12" fill="#0f0c08" stroke="#52351f" strokeWidth="2.6" />
      <circle cx="26" cy="22" r="3" fill="#e0664f" opacity="0.7" />
    </g>
  ),
  fire: (
    <g>
      <path d="M32 8 Q44 26 40 42 Q37 53 28 54 Q18 54 17 44 Q16 34 25 26 Q27 36 31 40 Q30 28 32 8 Z" fill="#e0664f" stroke="#a84a33" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M27 40 Q33 48 31 54" fill="none" stroke="#ffb35c" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M20 14 L22 18 M46 20 L44 24 M50 34 L54 36" stroke="#e0664f" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  wheel: (
    <g>
      <circle cx="32" cy="32" r="18" fill="#7a4a2b" stroke="#5f3a1f" strokeWidth="4" />
      <circle cx="32" cy="32" r="4.5" fill="#5f3a1f" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45 * Math.PI) / 180
        return <line key={i} x1={32} y1={32} x2={32 + Math.cos(a) * 16} y2={32 + Math.sin(a) * 16} stroke="#5f3a1f" strokeWidth="2.6" />
      })}
    </g>
  ),
  seal: (
    <g>
      <rect x="14" y="14" width="36" height="36" rx="5" fill="#6e8a4c" stroke="#3a5a2b" strokeWidth="3" />
      <text x="32" y="26" textAnchor="middle" fontSize="8" fill="#fff3d6" fontWeight="bold">INDUS</text>
      <path d="M22 34 L30 28 L38 34 L34 39 L28 39 Z" fill="#fff3d6" stroke="#3a5a2b" strokeWidth="1.6" />
      <circle cx="24" cy="31" r="1.6" fill="#3a5a2b" />
      <circle cx="40" cy="31" r="1.6" fill="#3a5a2b" />
      <circle cx="32" cy="28" r="1.6" fill="#3a5a2b" />
    </g>
  ),
  fort: (
    <g>
      <path d="M10 50 L10 30 L16 26 L16 50 Z M22 50 L22 22 L28 18 L28 50 Z M34 50 L34 18 L40 22 L40 50 Z M46 50 L46 26 L52 30 L52 50 Z" fill="#c9a25a" stroke="#8a6a3a" strokeWidth="2.6" strokeLinejoin="round" />
      <rect x="16" y="36" width="6" height="14" fill="#6e4a2b" />
      <rect x="40" y="36" width="6" height="14" fill="#6e4a2b" />
      <path d="M8 50 Q32 54 56 50" stroke="#8a6a3a" strokeWidth="3" fill="none" />
      <path d="M32 14 L32 10" stroke="#8a6a3a" strokeWidth="2.4" />
    </g>
  ),
  coin: (
    <g>
      <circle cx="32" cy="32" r="18" fill="#e7c06a" stroke="#a8843f" strokeWidth="3.2" />
      <circle cx="32" cy="32" r="13" fill="none" stroke="#c09a3f" strokeWidth="1.6" />
      <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#8a6a2b">₹1</text>
    </g>
  ),
  'tool-axe': (
    <g>
      <path d="M14 30 L20 34 L16 42 L10 40 Z" fill="#7a4a2b" stroke="#5f3a1f" strokeWidth="2" />
      <rect x="18" y="28" width="13" height="4" rx="2" fill="#8a6a3a" stroke="#5f3a1f" strokeWidth="1.6" />
      <rect x="24" y="25" width="4" height="9" rx="1.6" fill="#8a6a3a" stroke="#5f3a1f" strokeWidth="1.6" />
      <path d="M32 30 Q32 44 30 54 L34 54 Q32 44 32 30 Z" fill="#a06424" stroke="#6e4a2b" strokeWidth="2" />
      <rect x="31" y="39" width="9" height="6" rx="2.6" fill="#ffd27a" stroke="#e08a2b" strokeWidth="1.6" />
    </g>
  ),
  charkha: (
    <g>
      <circle cx="32" cy="30" r="16" fill="none" stroke="#2f8f6e" strokeWidth="3.4" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45 * Math.PI) / 180
        return <line key={i} x1={32} y1={30} x2={32 + Math.cos(a) * 16} y2={30 + Math.sin(a) * 16} stroke="#2f8f6e" strokeWidth="2" />
      })}
      <path d="M32 46 L32 56" stroke="#6e4a2b" strokeWidth="3.4" />
      <path d="M40 42 L48 50" stroke="#8a6a3a" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  flag: (
    <g>
      <rect x="14" y="12" width="6" height="42" rx="2" fill="#b0883f" stroke="#8a6a3a" strokeWidth="1.8" />
      <path d="M20 14 L50 14 L50 24 L20 24 Z" fill="#ff8a3d" />
      <path d="M20 24 L50 24 L50 34 L20 34 Z" fill="#f5efea" />
      <path d="M20 34 L50 34 L50 44 L20 44 Z" fill="#4f9d6b" />
      <circle cx="35" cy="29" r="4.2" fill="none" stroke="#2f5aa8" strokeWidth="1.8" />
    </g>
  ),
  peacock: (
    <g>
      <path d="M32 20 Q24 10 12 14 Q18 22 14 30 Q20 24 32 20 Z" fill="#2f8f6e" stroke="#1f6a50" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="20" cy="21" r="2" fill="#ffd27a" />
      <path d="M32 22 Q40 28 48 22 Q40 20 32 22" fill="none" stroke="#2f5aa8" strokeWidth="2.4" />
      <path d="M30 24 Q28 40 24 52 L30 50 Q34 38 34 26 Z" fill="#2f5aa8" stroke="#1f4a8a" strokeWidth="2" strokeLinejoin="round" />
      <path d="M34 26 Q38 40 42 50 L36 50 Q32 38 34 26 Z" fill="#3b6ac0" stroke="#2f5aa8" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="24" cy="48" r="3.4" fill="#e0664f" />
      <circle cx="38" cy="46" r="3" fill="#ffb35c" />
      <circle cx="30" cy="30" r="1.8" fill="#ffd27a" />
    </g>
  ),
  lotus: (
    <g>
      <path d="M32 14 Q24 20 26 28 Q32 32 38 28 Q40 20 32 14 Z" fill="#e88fb0" stroke="#c96a92" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M22 22 Q18 28 24 34 Q30 36 32 30 Z" fill="#f5a8c7" stroke="#c96a92" strokeWidth="2" strokeLinejoin="round" />
      <path d="M42 22 Q46 28 40 34 Q34 36 32 30 Z" fill="#f5a8c7" stroke="#c96a92" strokeWidth="2" strokeLinejoin="round" />
      <path d="M28 40 Q32 44 36 40 Q32 48 28 40 Z" fill="#4f9d6b" stroke="#3a7a50" strokeWidth="2" />
      <path d="M32 44 L32 54 M28 42 L20 48 M36 42 L44 48" stroke="#4f9d6b" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  'taj-mahal': (
    <g>
      <rect x="18" y="34" width="28" height="17" rx="2" fill="#f5efea" stroke="#c9c0b0" strokeWidth="2.4" />
      <rect x="27" y="44" width="10" height="7" fill="#e6ded2" stroke="#c9c0b0" strokeWidth="1.8" />
      <circle cx="32" cy="15" r="5" fill="#f5efea" stroke="#c9c0b0" strokeWidth="2" />
      <path d="M32 10 L32 4" stroke="#c9c0b0" strokeWidth="2" />
      <path d="M20 34 L18 44 M44 34 L46 44" stroke="#c9c0b0" strokeWidth="2" />
      <path d="M24 26 L22 34 M40 26 L42 34" stroke="#c9c0b0" strokeWidth="2" />
      <path d="M14 44 Q32 50 50 44 Q32 56 14 44 Z" fill="#c1b6a4" stroke="#a49a88" strokeWidth="2" />
    </g>
  ),
  school: (
    <g>
      <path d="M32 20 L14 30 L32 40 L50 30 Z" fill="#5b8def" stroke="#3b63c0" strokeWidth="2.6" strokeLinejoin="round" />
      <rect x="24" y="36" width="16" height="15" fill="#f5efea" stroke="#a49a88" strokeWidth="2.4" />
      <rect x="29.5" y="42" width="5" height="9" fill="#3b63c0" />
      <path d="M18 30 L18 42 M14 34 L14 42" stroke="#3b63c0" strokeWidth="2.4" />
      <rect x="36" y="12" width="8" height="5" rx="1.6" fill="#ffd27a" stroke="#e08a2b" strokeWidth="1.6" />
    </g>
  ),
  hospital: (
    <g>
      <rect x="16" y="18" width="32" height="32" rx="3" fill="#f5efea" stroke="#a49a88" strokeWidth="2.6" />
      <rect x="27" y="34" width="10" height="16" fill="#e6ded2" stroke="#a49a88" strokeWidth="1.8" />
      <circle cx="32" cy="41" r="6" fill="#e0664f" stroke="#a84a33" strokeWidth="2" />
      <path d="M32 32 L32 50 M22 41 L42 41" stroke="#d94a3f" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  ),
  police: (
    <g>
      <circle cx="32" cy="20" r="9" fill="#e6aa6a" stroke="#a06a3a" strokeWidth="2.4" />
      <path d="M28 14 Q32 9 36 14 L34 12 L30 12 Z" fill="#2f5aa8" stroke="#1f4a8a" strokeWidth="1.6" />
      <path d="M23 47 L20 28 Q28 21 44 28 L41 47 Q32 51 23 47 Z" fill="#2f5aa8" stroke="#1f4a8a" strokeWidth="2.6" strokeLinejoin="round" />
      <rect x="27" y="46" width="10" height="6" rx="2" fill="#1f4a8a" />
      <line x1="32" y1="21" x2="32" y2="26" stroke="#a06a3a" strokeWidth="2" />
    </g>
  ),
  municipality: (
    <g>
      <rect x="14" y="40" width="36" height="10" rx="2.4" fill="#c9c0b0" stroke="#a49a88" strokeWidth="2.4" />
      <rect x="20" y="24" width="24" height="16" fill="#f5efea" stroke="#a49a88" strokeWidth="2" />
      <path d="M32 14 L20 24 L44 24 Z" fill="#5b8def" stroke="#3b63c0" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="32" cy="18" r="2" fill="#ffd27a" />
      <rect x="28" y="33" width="8" height="7" fill="#e6ded2" stroke="#a49a88" strokeWidth="1.6" />
      <rect x="20" y="44" width="7" height="6" fill="#8a8068" opacity="0.5" />
      <rect x="34" y="44" width="7" height="6" fill="#8a8068" opacity="0.5" />
    </g>
  ),
  market: (
    <g>
      <path d="M10 34 L26 24 L42 34 L26 44 Z" fill="#e8b45a" stroke="#b0883f" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M42 34 L58 24 L58 44 Z" fill="#5b8def" stroke="#3b63c0" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="20" y="46" width="24" height="8" fill="#a49a88" stroke="#8a8068" strokeWidth="1.8" />
      <circle cx="20" cy="42" r="3.4" fill="#e0664f" />
      <circle cx="28" cy="40" r="3.4" fill="#ffce57" />
      <circle cx="36" cy="42" r="3.4" fill="#4f9d6b" />
      <rect x="47" y="20" width="3" height="11" rx="1.4" fill="#a8843f" />
      <rect x="57" y="20" width="3" height="11" rx="1.4" fill="#a8843f" />
    </g>
  ),
  traffic: (
    <g>
      <rect x="28" y="18" width="8" height="38" rx="2.4" fill="#6e6e6e" stroke="#4a4a4a" strokeWidth="2" />
      <rect x="24" y="8" width="16" height="26" rx="5" fill="#4a4a4a" />
      <circle cx="32" cy="16" r="4" fill="#e0664f" />
      <circle cx="32" cy="26" r="4" fill="#ffce57" />
      <circle cx="32" cy="36" r="4" fill="#4f9d6b" />
      <path d="M10 52 L26 44 M54 52 L38 44" stroke="#8a8a8a" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  tree: (
    <g>
      <rect x="29" y="34" width="7" height="18" rx="2.6" fill="#7a4a2b" stroke="#5f3a1f" strokeWidth="2" />
      <path d="M32 8 Q16 18 18 36 Q26 42 46 34 Q48 18 32 8 Z" fill="#4f9d6b" stroke="#3a7a50" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="26" cy="24" r="3.4" fill="#6db681" />
      <circle cx="38" cy="30" r="3" fill="#3a7a50" opacity="0.7" />
    </g>
  ),
  wildlife: (
    <g>
      <path d="M12 26 Q18 30 20 38 L16 52 L24 52 L26 41 Q32 44 38 41 L40 52 L48 52 L44 36 Q50 28 52 30 Q48 26 40 26 Q32 20 20 24 Z" fill="#6e8a4c" stroke="#3a5a2b" strokeWidth="2.6" strokeLinejoin="round" />
      <ellipse cx="22" cy="28" rx="4" ry="3.4" fill="#d9a05f" />
      <ellipse cx="42" cy="28" rx="4" ry="3.4" fill="#d9a05f" />
      <circle cx="24" cy="26" r="1.6" fill="#2f3a1f" />
      <circle cx="40" cy="26" r="1.6" fill="#2f3a1f" />
    </g>
  ),
  recycle: (
    <g>
      <path d="M32 16 L56 22 L52 42 Q44 44 32 46 L28 32 Z" fill="#4f9d6b" stroke="#3a7a50" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M32 46 L8 40 L12 20 Q20 18 32 16 Z" fill="#f2c98a" stroke="#b0883f" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M12 20 L52 42 M56 22 L8 40" stroke="#2f3a1f" strokeWidth="1.6" strokeDasharray="4 3" />
      <path d="M30 24 L36 30 M36 30 L30 34 M36 30 L40 26" fill="none" stroke="#e0664f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  'clean-river': (
    <g>
      <path d="M8 14 Q22 24 16 34 Q10 44 24 52 Q38 58 56 50" fill="none" stroke="#3f7fc4" strokeWidth="8" strokeLinecap="round" />
      <path d="M14 20 Q20 26 16 32 M20 44 Q30 50 42 48" stroke="#bfe3ff" strokeWidth="2.2" fill="none" />
      <path d="M24 34 Q32 30 40 34" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M12 14 L14 10 M50 16 L52 13" stroke="#2f3a1f" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="20" r="2.4" fill="#4f9d6b" />
    </g>
  ),
  sunshine: (
    <g>
      <circle cx="32" cy="32" r="12" fill="#ffd27a" stroke="#e08a2b" strokeWidth="3" />
      <line x1="32" y1="8" x2="32" y2="14" stroke="#ffb35c" strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="50" x2="32" y2="56" stroke="#ffb35c" strokeWidth="3" strokeLinecap="round" />
      <line x1="8" y1="32" x2="14" y2="32" stroke="#ffb35c" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="32" x2="56" y2="32" stroke="#ffb35c" strokeWidth="3" strokeLinecap="round" />
      <line x1="15" y1="15" x2="19" y2="19" stroke="#ffb35c" strokeWidth="3" strokeLinecap="round" />
      <line x1="45" y1="45" x2="49" y2="49" stroke="#ffb35c" strokeWidth="3" strokeLinecap="round" />
      <line x1="15" y1="49" x2="19" y2="45" stroke="#ffb35c" strokeWidth="3" strokeLinecap="round" />
      <line x1="45" y1="19" x2="49" y2="15" stroke="#ffb35c" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
}

export function SocialArt({ k, size = 64, className = '' }) {
  const node = art[k] || art.sun
  return (
    <svg
      className={`soc-art soc-art-${k} ${className}`}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
    >
      {node}
    </svg>
  )
}

export const SOCIAL_ART_KEYS = Object.keys(art)

export default SocialArt