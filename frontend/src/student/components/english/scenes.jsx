// EnglishVista — the cartoon "Storybook Town" backdrop for the English
// Adventure hub. Original SVG artwork (no photos, no emoji): a warm story
// world with a giant open-book house, ABC blocks, a pencil signpost and a
// winding story trail. Mirrors the ScienceVista/SocialVista cartoon language.

import React from 'react'

export default function EnglishVista() {
  return (
    <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="eng-vista" aria-hidden="true">
      <defs>
        <linearGradient id="engVistaSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bde3ff" />
          <stop offset="100%" stopColor="#fdf3da" />
        </linearGradient>
        <linearGradient id="engVistaGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c3e2a8" />
          <stop offset="100%" stopColor="#8ec46e" />
        </linearGradient>
      </defs>

      {/* sky + sun + sparkles */}
      <rect x="0" y="0" width="1000" height="640" fill="url(#engVistaSky)" />
      <g className="eng-vista-sun">
        <circle cx="88" cy="76" r="30" fill="#ffd27a" stroke="#e08a2b" strokeWidth="4" />
        <circle cx="88" cy="76" r="40" fill="#ffe9b3" opacity="0.45" />
      </g>
      {[
        [170, 40], [280, 70], [360, 28], [470, 52], [560, 26], [660, 62], [760, 24], [880, 52], [960, 34],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 6} L${x + 3} ${y} L${x + 6} ${y - 6} L${x + 3} ${y - 1} Z`}
          fill="#fff2bd"
          opacity={0.95}
        />
      ))}

      {/* clouds */}
      <g className="eng-vista-cloud eng-vista-cloud-a">
        <ellipse cx="170" cy="128" rx="50" ry="23" fill="#ffffff" opacity="0.95" />
        <ellipse cx="204" cy="116" rx="36" ry="21" fill="#ffffff" opacity="0.95" />
        <ellipse cx="138" cy="120" rx="28" ry="17" fill="#ffffff" opacity="0.95" />
      </g>
      <g className="eng-vista-cloud eng-vista-cloud-b">
        <ellipse cx="900" cy="150" rx="54" ry="24" fill="#ffffff" opacity="0.92" />
        <ellipse cx="934" cy="138" rx="36" ry="20" fill="#ffffff" opacity="0.92" />
        <ellipse cx="866" cy="143" rx="30" ry="17" fill="#ffffff" opacity="0.92" />
      </g>

      {/* rolling hills + ground */}
      <rect x="0" y="470" width="1000" height="170" fill="url(#engVistaGround)" />
      <path d="M0 470 Q150 448 300 470 Q450 492 600 470 Q750 448 900 470 Q950 480 1000 472 L1000 640 L0 640 Z" fill="#7fb86f" opacity="0.55" />

      {/* winding story trail */}
      <path
        d="M-10 588 Q180 560 300 566 Q430 574 560 552 Q700 528 1010 546"
        fill="none"
        stroke="#f4e3b2"
        strokeWidth="26"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M-10 588 Q180 560 300 566 Q430 574 560 552 Q700 528 1010 546"
        fill="none"
        stroke="#e3c98a"
        strokeWidth="4"
        strokeDasharray="14 26"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* giant open-book house (library landmark, centre-left) */}
      <g transform="translate(300 200)">
        <path d="M-60 0 L0 -46 L60 0" stroke="#0f4c75" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M0 -46 Q-58 -20 -60 0 Q-30 12 0 0 Q30 12 60 0 Q58 -20 0 -46 Z" fill="#eef2f7" stroke="#0f4c75" strokeWidth="5" strokeLinejoin="round" />
        <path d="M0 -46 V0 M-60 0 Q-30 12 0 0 M0 0 Q30 12 60 0" stroke="#0f4c75" strokeWidth="5" fill="none" />
        <rect x="-42" y="-30" width="26" height="18" rx="4" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
        <circle cx="-29" cy="-21" r="6" fill="#f87171" stroke="#9f1239" strokeWidth="2.4" />
        <path d="M-6 -36 h22 v16 h-22 z" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
        <rect x="20" y="-34" width="24" height="20" rx="4" fill="#fb923c" stroke="#b45309" strokeWidth="3" />
        <circle cx="44" cy="-44" r="3" fill="#f87171" />
        <rect x="-16" y="0" width="32" height="56" rx="4" fill="#a78bfa" stroke="#5b21b6" strokeWidth="4" />
        <rect x="-9" y="8" width="18" height="40" rx="3" fill="#fde68a" stroke="#5b21b6" strokeWidth="2.6" />
        <circle cx="0" cy="28" r="2.6" fill="#5b21b6" />
        <circle cx="-30" cy="58" r="4" fill="#66bb6a" />
        <circle cx="34" cy="56" r="4" fill="#f472b6" />
      </g>

      {/* ABC block tower (right) */}
      <g transform="translate(700 300)">
        <rect x="-58" y="60" width="44" height="44" rx="8" fill="#f87171" stroke="#9f1239" strokeWidth="5" />
        <text x="-36" y="91" fontSize="26" fontWeight="900" fill="#fff" fontFamily="sans-serif">A</text>
        <rect x="-8" y="60" width="44" height="44" rx="8" fill="#4c8df5" stroke="#1e3a8a" strokeWidth="5" />
        <text x="14" y="91" fontSize="26" fontWeight="900" fill="#fff" fontFamily="sans-serif">B</text>
        <rect x="-24" y="12" width="52" height="44" rx="8" fill="#fbbf24" stroke="#b45309" strokeWidth="5" />
        <text x="-7" y="43" fontSize="26" fontWeight="900" fill="#fff" fontFamily="sans-serif">C</text>
      </g>

      {/* pencil signpost (left, near the daily pavilion) */}
      <g transform="translate(120 330)">
        <rect x="-9" y="0" width="18" height="150" rx="6" fill="#fbbf24" stroke="#b45309" strokeWidth="5" />
        <path d="M-9 0 L0 -24 L9 0 Z" fill="#f87171" stroke="#b45309" strokeWidth="4" strokeLinejoin="round" />
        <rect x="-34" y="-6" width="68" height="14" rx="7" fill="#fde68a" stroke="#b45309" strokeWidth="3" />
        <path d="M-34 4 Q0 -12 34 4" stroke="#b45309" strokeWidth="2.4" fill="none" />
        <circle cx="0" cy="170" r="13" fill="#a78bfa" stroke="#5b21b6" strokeWidth="4" />
      </g>

      {/* floating letters + quill */}
      <g fill="#4c8df5" opacity="0.9">
        <circle cx="560" cy="150" r="17" />
        <text x="553" y="157" fontSize="17" fontWeight="900" fill="#fff" fontFamily="sans-serif">G</text>
      </g>
      <g className="eng-vista-float">
        <path d="M470 200 L462 226 L484 216 Z" fill="#f472b6" opacity="0.9" />
      </g>
      <g>
        <path d="M620 120 Q600 140 600 154 Q612 146 618 138 Q622 130 620 120 Z" fill="#fde68a" stroke="#b45309" strokeWidth="2.4" />
      </g>

      {/* little trees + flowers on the meadow */}
      <g fill="#4f9d6b" stroke="#3a7a50" strokeWidth="2.8">
        <path d="M520 490 Q506 458 522 436 Q530 458 536 490 Z" />
        <path d="M130 500 Q118 470 132 450 Q140 470 146 500 Z" />
        <circle cx="420" cy="492" r="15" />
        <circle cx="840" cy="500" r="14" />
      </g>
      <rect x="26" y="492" width="7" height="16" rx="3" fill="#7a4f2b" />
      <g>
        <circle cx="26" cy="484" r="10" fill="#66bb6a" stroke="#2f6b2f" strokeWidth="3" />
        <circle cx="640" cy="508" r="9" fill="#a7f3d0" stroke="#2f6b2f" strokeWidth="3" />
      </g>
      <g fill="#f87171" stroke="#9f1239" strokeWidth="2">
        <circle cx="240" cy="516" r="5" />
        <circle cx="880" cy="522" r="5" />
        <circle cx="420" cy="522" r="5" />
      </g>
      <g fill="#fbbf24" stroke="#b45309" strokeWidth="2">
        <circle cx="252" cy="514" r="4" />
        <circle cx="890" cy="520" r="4" />
      </g>
    </svg>
  )
}