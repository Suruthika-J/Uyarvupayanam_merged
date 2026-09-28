import React from 'react'

// Base artwork for the "tap the part of the picture" (image-map) questions.
// The MapQuestion renderer draws a tappable hotspot button at every seeded
// x%/y% coordinate, so each artwork here is drawn so its key objects sit
// EXACTLY under those hotspots. viewBox is 800x500 and the frame is 100% wide,
// so: art pixel = hotspot percentage * 8 (x) / * 5 (y).
//   solar: sun(400,250) mercury(544,250) venus(624,250) earth(704,250) saturn(760,210)
//   india: tn(688,420) kl(648,450) ka(640,350) mh(544,330) dl(400,190) gj(320,280) up(448,210) wb(544,250)
//   globe: equator(240,250) north(240,60) south(240,440) ocean(624,310)
// Kept in a component module (repo fast-refresh rule).

export function SolarMap() {
  const sun = { cx: 400, cy: 250 }
  const orbit = (rx, ry, opacity) => (
    <ellipse cx={sun.cx} cy={sun.cy} rx={rx} ry={ry} fill="none" stroke="#a778ff" strokeWidth={4} opacity={opacity} strokeDasharray="12 12" />
  )
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={0} y={0} width={800} height={500} fill="#0b1030" />
      {[
        [60, 50], [150, 90], [250, 40], [520, 60], [120, 180], [300, 130], [640, 90], [760, 150], [90, 300], [230, 330], [700, 340], [600, 420],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 2 : 3} fill="#fff2bd" opacity={i % 3 ? 0.7 : 0.95} />
      ))}
      <ellipse cx={sun.cx} cy={sun.cy} rx={480} ry={160} fill="none" stroke="#2b2b63" strokeWidth={2} opacity={0.8} />

      {orbit(144, 44, 0.75)}
      {orbit(224, 66, 0.6)}
      {orbit(304, 86, 0.5)}
      {orbit(364, 100, 0.4)}

      <g transform={`translate(${sun.cx} ${sun.cy})`}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i * 36 * Math.PI) / 180
          return (
            <line
              key={i}
              x1={Math.cos(a) * 72}
              y1={Math.sin(a) * 62}
              x2={Math.cos(a) * 92}
              y2={Math.sin(a) * 82}
              stroke="#ffb35c"
              strokeWidth={3.4}
              strokeLinecap="round"
            />
          )
        })}
        <circle r={66} fill="#ffd27a" stroke="#e08a2b" strokeWidth={5} />
        <circle cx={-20} cy={-22} r={11} fill="#e08a2b" opacity={0.5} />
        <circle cx={20} cy={18} r={7} fill="#e08a2b" opacity={0.5} />
        <circle cx={-14} cy={24} r={5} fill="#e08a2b" opacity={0.5} />
      </g>

      <g className="soc-map-orbit">
        <circle cx={544} cy={250} r={17} fill="#b8a27f" stroke="#7c6a4a" strokeWidth={3} />
        <circle cx={520} cy={242} r={4} fill="#7c6a4a" opacity={0.65} />
        <circle cx={624} cy={250} r={22} fill="#e7c06a" stroke="#a8843f" strokeWidth={3} />
        <circle cx={608} cy={238} r={6} fill="#cfa660" opacity={0.7} />
        <circle cx={704} cy={250} r={25} fill="#4d9de0" stroke="#2e6fb0" strokeWidth={3} />
        <path d="M688 244 Q700 236 708 242 Q714 248 708 254 Q700 250 690 252 Z" fill="#6ea85c" />
        <circle cx={760} cy={210} r={18} fill="#d9a05f" stroke="#a06a3a" strokeWidth={3.4} />
        <ellipse cx={760} cy={210} rx={36} ry={10} fill="none" stroke="#c08a52" strokeWidth={3.6} transform="rotate(-14 760 210)" />
      </g>
    </svg>
  )
}

export function IndiaMap() {
  const statePin = (x, y, label) => (
    <g key={label}>
      <circle cx={x} cy={y} r={16} fill="#ffffff" opacity={0.28} />
      <circle cx={x} cy={y} r={7} fill="#ffd27a" stroke="#e08a2b" strokeWidth={2.4} />
    </g>
  )
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={0} y={0} width={800} height={500} fill="#cde9d2" />
      <path d="M0 320 Q220 300 420 330 Q640 300 800 330 L800 0 L0 0 Z" fill="#b7d6d0" opacity={0.7} />
      <path d="M0 430 Q260 400 520 410 Q680 405 800 410 L800 500 L0 500 Z" fill="#8ab8c8" opacity={0.85} />
      <path d="M160 200 Q210 120 320 110 Q430 96 520 120 Q600 140 630 180 Q700 210 720 260 Q730 310 700 350 Q668 420 640 450 Q620 468 610 460 Q580 470 560 462 Q530 472 505 462 Q450 470 420 440 Q380 440 360 420 Q330 400 322 380 Q280 372 268 340 Q250 300 268 270 Q300 250 280 220 Z" fill="#f2c98a" stroke="#d9a05f" strokeWidth={5} strokeLinejoin="round" />
      <path d="M250 160 L300 150 L330 165" stroke="#cfd8e6" strokeWidth={8} fill="none" opacity={0.9} strokeLinecap="round" />
      <path d="M300 150 L320 300 L430 300" stroke="#cfd8e6" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
      <path d="M430 300 Q560 300 560 420" stroke="#3f7fc4" strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round" />
      {[
        [688, 420], [648, 450], [640, 350], [544, 330], [400, 190], [320, 280], [448, 210], [544, 250],
      ].map(([x, y]) => statePin(x, y))}
    </svg>
  )
}

export function GlobeMap() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={0} y={0} width={800} height={500} fill="#bfe3ff" />
      <path d="M0 350 Q200 330 420 345 Q640 360 800 340 L800 500 L0 500 Z" fill="#4d9de0" opacity={0.5} />
      <path d="M0 420 Q260 400 520 410 Q680 405 800 410 L800 500 L0 500 Z" fill="#2e6fb0" opacity={0.7} />
      <circle cx={240} cy={132} r={22} fill="#ffffff" opacity={0.9} />
      <circle cx={228} cy={126} r={14} fill="#ffffff" opacity={0.95} />
      <circle cx={256} cy={138} r={16} fill="#ffffff" opacity={0.8} />

      <circle cx={240} cy={240} r={150} fill="url(#socGlobeGrad)" stroke="#1f5d9e" strokeWidth={6} />
      <defs>
        <radialGradient id="socGlobeGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#7cc0f0" />
          <stop offset="100%" stopColor="#2e6fb0" />
        </radialGradient>
      </defs>
      <path d="M110 200 Q170 180 220 190 Q270 198 280 182 Q310 186 322 200 Q296 220 268 216 Q188 206 128 224 Z" fill="#6ea85c" />
      <path d="M240 90 Q272 170 240 260 Q218 340 252 388 Q214 386 196 340 Q190 210 240 90 Z" fill="#6ea85c" />
      <path d="M150 300 Q200 300 250 300 M150 320 Q200 320 250 320" stroke="#ffffff" strokeWidth={2.2} fill="none" opacity={0.5} />
      <ellipse cx={240} cy={240} rx={150} ry={32} fill="none" stroke="#ffcf6b" strokeWidth={5} opacity={0.85} transform="rotate(-10 240 240)" />
      <path d="M96 224 Q168 220 240 222 Q300 224 360 220" stroke="#ffcf6b" strokeWidth={3.4} strokeDasharray="10 9" fill="none" opacity={0.8} />

      <path d="M210 410 Q232 420 258 414 Q280 444 262 462 Q230 464 214 440 Q208 420 210 410 Z" fill="#ffffff" stroke="#b8d8f0" strokeWidth={3} />
      <circle cx={252} cy={428} r={5} fill="#5fae58" />
      <circle cx={232} cy={434} r={3.4} fill="#5fae58" />

      <path d="M560 300 q18 -14 36 0 q18 14 36 0" stroke="#bfe3ff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.95} />
      <path d="M590 330 q16 -12 32 0 q16 12 32 0" stroke="#dff0ff" strokeWidth={4.4} fill="none" strokeLinecap="round" opacity={0.8} />
      <path d="M620 366 q14 -11 28 0 q14 11 28 0" stroke="#bfe3ff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
      <circle cx={612} cy={308} r={5} fill="#dff0ff" />
    </svg>
  )
}

