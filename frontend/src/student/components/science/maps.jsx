// PlantMap / BodyMap — cartoon diagram components used by the "image-map"
// question type (SciMap). Registers with data/scienceMaps.js. Art is drawn to
// match the hotspot percentages seeded server-side so the tappable dots sit on
// the parts: plant = root(50,82) stem(50,55) leaf(28,38) flower(50,16);
// body = brain(50,12) lungs(38,34) heart(62,38) stomach(50,58) bones(28,80).

export function PlantMap({ className = '' }) {
  return (
    <svg viewBox="0 0 100 108" className={className} preserveAspectRatio="xMidYMid meet" role="img" aria-label="A flowering plant in a pot">
      <defs>
        <linearGradient id="pm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dff3e0" />
          <stop offset="1" stopColor="#c8ecc9" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="108" fill="url(#pm-sky)" />

      {/* sun */}
      <circle cx="86" cy="10" r="7" fill="#ffd27a" className="sci-pulse" />
      {/* little sprout buddy */}
      <circle cx="14" cy="14" r="4" fill="#bfe3c0" opacity="0.8" />
      <circle cx="22" cy="10" r="3" fill="#bfe3c0" opacity="0.6" />

      {/* flower head at ~(50,16) */}
      <g transform="translate(50 16)">
        <ellipse cx="0" cy="-6" rx="5" ry="7" fill="#ffb3c7" />
        <ellipse cx="6" cy="0" rx="5" ry="7" fill="#ffc4d4" transform="rotate(72)" />
        <ellipse cx="0" cy="6" rx="5" ry="7" fill="#ffb3c7" transform="rotate(144)" />
        <ellipse cx="-6" cy="0" rx="5" ry="7" fill="#ffc4d4" transform="rotate(216)" />
        <circle cx="0" cy="0" r="3.6" fill="#f6a821" />
      </g>

      {/* stem to ~(50,70) */}
      <path d="M50 16 C49 36 50 55 50 70" stroke="#3f9e4d" strokeWidth={4} fill="none" strokeLinecap="round" />

      {/* leaf at ~(28,38) */}
      <path d="M50 38 C40 36 32 36 26 40 C34 46 44 46 50 42 Z" fill="#5cb85c" stroke="#3f9e4d" strokeWidth={1.6} strokeLinejoin="round" />

      {/* small right leaf */}
      <path d="M50 46 C57 43 64 45 68 49 C62 54 54 53 50 50 Z" fill="#6ec06e" stroke="#3f9e4d" strokeWidth={1.4} strokeLinejoin="round" />

      {/* pot + roots around ~(50,82) */}
      <path d="M38 70 L62 70 L58 96 L42 96 Z" fill="#d97b4a" stroke="#b9602f" strokeWidth={2} strokeLinejoin="round" />
      <rect x="36" y="66" width="28" height="6" rx="3" fill="#e8985f" stroke="#b9602f" strokeWidth={1.6} />
      <g stroke="#7a5230" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M50 74 C48 79 46 82 42 88" />
        <path d="M50 74 C52 80 55 84 58 88" />
        <path d="M50 74 C50 80 50 86 50 90" />
      </g>
    </svg>
  )
}

export function BodyMap({ className = '' }) {
  return (
    <svg viewBox="0 0 100 108" className={className} preserveAspectRatio="xMidYMid meet" role="img" aria-label="A cartoon human body">
      <defs>
        <linearGradient id="bm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4f2ff" />
          <stop offset="1" stopColor="#d3e9fb" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="108" fill="url(#bm-sky)" />

      {/* floor line */}
      <rect x="0" y="100" width="100" height="8" rx="4" fill="#eaf0dc" />

      {/* legs + bone hints around ~(28-42,80) */}
      <g stroke="#f6c6a8" strokeWidth={5.4} strokeLinecap="round" fill="none">
        <path d="M44 62 C43 72 42 78 40 86" />
        <path d="M56 62 C57 72 58 78 60 86" />
      </g>
      {/* leg bones */}
      <g stroke="#e7d9c4" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M41 74 C44 74 47 74 50 74 L54 76 C57 76 59 76 62 75" />
        <path d="M40 88 L52 88" />
        <path d="M48 90 L56 90" />
      </g>
      {/* shoes */}
      <ellipse cx="39" cy="89" rx="6" ry="3" fill="#7fae5b" />
      <ellipse cx="61" cy="89" rx="6" ry="3" fill="#7fae5b" />

      {/* torso */}
      <path d="M36 44 C34 54 36 62 38 66 C44 68 56 68 62 66 C64 62 66 54 64 44 C58 42 42 42 36 44 Z" fill="#ffd9b8" stroke="#eeb491" strokeWidth={1.8} strokeLinejoin="round" />

      {/* arms */}
      <g stroke="#f6c6a8" strokeWidth={4.4} strokeLinecap="round" fill="none">
        <path d="M37 48 C33 54 32 62 34 70" />
        <path d="M63 48 C67 54 68 62 66 70" />
      </g>

      {/* lungs at ~(38,34) */}
      <ellipse cx="40" cy="35" rx="7" ry="9" fill="#ff7f9c" opacity="0.85" className="sci-pulse" />
      <ellipse cx="60" cy="35" rx="7" ry="9" fill="#ff7f9c" opacity="0.85" />
      {/* heart at ~(62,38) */}
      <path d="M62 33 C60 30 56 31 56 35 C56 39 62 42 62 42 C62 42 68 39 68 35 C68 31 64 30 62 33 Z" fill="#e34c4c" className="sci-pulse" />
      {/* stomach at ~(50,58) */}
      <ellipse cx="50" cy="56" rx="8" ry="6" fill="#ffd27a" opacity="0.9" />

      {/* head + brain at ~(50,12) */}
      <circle cx="50" cy="14" r="11" fill="#ffe0c7" stroke="#eeb491" strokeWidth={1.8} />
      <path d="M44 10 C47 7 53 7 56 10 C59 13 59 17 56 19 C53 16 47 16 44 19 C41 17 41 13 44 10 Z" fill="#f6b8a0" opacity="0.9" />
      {/* hair */}
      <path d="M39 12 C39 6 42 3 50 3 C58 3 61 6 61 12 C58 9 42 9 39 12 Z" fill="#6b4a2f" />
      {/* eyes + smile */}
      <circle cx="46" cy="14" r="1.4" fill="#3a3a3a" />
      <circle cx="54" cy="14" r="1.4" fill="#3a3a3a" />
      <path d="M46 19 C48 21 52 21 54 19" stroke="#8a5a3a" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </svg>
  )
}