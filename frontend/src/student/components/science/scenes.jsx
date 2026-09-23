import React from 'react'

// Thirteen illustrated cartoon environments for the Science Adventure World.
// Colors come from the theme palette via CSS custom properties
// (--sci-sky-top / --sci-sky-bottom / --sci-ground / --sci-accent) — the
// gradient background is painted by the scene container in science.css.

function Hills({ fill, rx = 320, ry = 130, cx = 400, cy = 470, opacity = 0.9 }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} opacity={opacity} />
}

function Cloud({ cx, cy, sx = 1 }) {
  return (
    <g transform={`translate(${cx - 40} ${cy - 14}) scale(${sx})`} fill="#ffffff" opacity={0.85}>
      <ellipse cx={20} cy={14} rx={26} ry={14} />
      <ellipse cx={48} cy={10} rx={22} ry={16} />
      <ellipse cx={74} cy={16} rx={20} ry={11} />
    </g>
  )
}

function Stars() {
  const pts = [
    [60, 40], [150, 90], [310, 30], [420, 60], [540, 36], [700, 70], [760, 150], [210, 140], [610, 130], [360, 110],
  ]
  return (
    <g fill="#fff2bd">
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1.8 : 2.6} opacity={i % 3 ? 0.6 : 0.95} />
      ))}
    </g>
  )
}

export function ForestScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--sci-ground)" rx={360} ry={150} cx={200} cy={480} opacity={0.5} />
      <Hills fill="var(--sci-accent)" rx={300} ry={120} cx={620} cy={490} opacity={0.4} />
      <Cloud cx={120} cy={70} />
      <Cloud cx={640} cy={100} sx={0.7} />
      <g>
        <path d="M120 430 Q150 470 130 480 L110 480 Q120 460 120 430 Z" fill="#4b6b3c" opacity="0.9" />
        <path d="M130 420 Q120 300 200 280 Q280 300 270 420 Q230 400 200 410 Q160 400 130 420 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="3" strokeLinejoin="round" />
        <rect x="193" y="410" width="16" height="66" rx="8" fill="#7a4f2b" />
      </g>
      <g>
        <path d="M620 460 Q600 480 610 490 L640 490 Q640 470 620 460 Z" fill="#5a7a4a" opacity="0.85" />
        <path d="M630 430 Q640 360 710 350 Q780 360 790 430 Q750 420 710 430 Q670 420 630 430 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth="3" strokeLinejoin="round" />
        <rect x="703" y="420" width="15" height="66" rx="7" fill="#8d6e63" />
      </g>
      <ellipse cx={560} cy={385} rx={70} ry={40} fill="#42a5f5" opacity={0.85} />
      <ellipse cx={560} cy={380} rx={56} ry={32} fill="#64b5f6" opacity={0.9} />
      <path d="M120 452 Q200 430 300 452" stroke="#66bb6a" strokeWidth="6" fill="none" opacity="0.7" strokeLinecap="round" />
      <path d="M360 470 Q460 448 560 470" stroke="#66bb6a" strokeWidth="5" fill="none" opacity="0.6" strokeLinecap="round" />
      <g transform="translate(720 250)">
        <path d="M0 26 Q6 14 20 12 Q34 14 40 26 Q30 24 20 26 Q10 24 0 26 Z" fill="#ffd54f" stroke="#b8860b" strokeWidth="2.4" />
        <circle cx="20" cy="18" r="2.6" fill="#b8860b" />
        <path d="M2 34 L0 30 M6 36 L6 30" stroke="#b8860b" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function BodyLabScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={120} y={70} width={560} height={320} rx={24} fill="#ffffff" opacity={0.28} />
      <rect x={120} y={70} width={560} height={320} rx={24} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.6} />
      <path d="M96 300 L144 264 L192 300 L144 330 Z" fill="#ffffff" opacity={0.35} />
      <path d="M608 300 L656 264 L704 300 L656 330 Z" fill="#ffffff" opacity={0.35} />
      <path d="M220 262 Q320 210 420 264" stroke="#e57373" strokeWidth={10} fill="none" opacity={0.95} strokeLinecap="round" />
      <path d="M300 154 Q192 154 185 268 Q182 356 280 380 Q400 406 440 316 Q478 226 400 180 Q360 150 300 154 Z" fill="#f5b7b1" stroke="#c96b60" strokeWidth={4} strokeLinejoin="round" />
      <path d="M300 154 Q408 154 415 268 Q418 356 320 380 Q200 406 160 316 Q122 226 200 180 Q240 150 300 154 Z" fill="#f5b7b1" stroke="#c96b60" strokeWidth={4} strokeLinejoin="round" />
      <g transform="translate(600 120)">
        <circle cx="0" cy="0" r="26" fill="#67c6f5" stroke="#2e6fb0" strokeWidth="4" />
        <path d="M-20 -8 Q-10 -16 0 -10 Q10 -6 12 -14 Q24 -12 28 -2 Q14 6 0 2 Q-18 -2 -20 -8 Z" fill="#66bb6a" />
        <path d="M2 -26 Q6 -16 2 -6 Q-2 4 -8 14 Q-14 8 -10 -4 Q-8 -16 2 -26 Z" fill="#66bb6a" />
      </g>
      <g transform="translate(180 110)">
        <rect x="0" y="0" width="120" height="90" rx="10" fill="#ffffff" opacity={0.75} />
        <path d="M14 30 Q60 14 106 30 M14 52 Q60 42 96 52 M14 40 Q60 30 96 40" stroke="#78909c" strokeWidth="4" fill="none" opacity={0.7} />
        <circle cx="100" cy="10" r="6" fill="#e57373" />
      </g>
    </svg>
  )
}

export function KitchenScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={60} y={100} width={680} height={330} rx={18} fill="#ffffff" opacity={0.26} />
      <rect x={60} y={306} width={680} height={124} rx={12} fill="#a1887f" opacity={0.9} />
      <rect x={80} y={120} width={200} height={14} rx={7} fill="#5d4037" />
      <g transform="translate(140 170)">
        <path d="M0 0 L64 0 L52 44 Q32 52 14 44 Z" fill="#e8c15a" stroke="#b8860b" strokeWidth="4" strokeLinejoin="round" />
        <path d="M62 0 L80 44" stroke="#b8860b" strokeWidth="4" strokeLinecap="round" />
        <rect x="24" y="12" width="16" height="16" rx="3" fill="#fb8c00" opacity="0.8" />
      </g>
      <g transform="translate(420 300)">
        <path d="M0 120 Q0 60 46 34 Q92 60 92 120 Z" fill="#ffe0b2" stroke="#b06a00" strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="46" cy="30" rx="44" ry="10" fill="#d7a86a" stroke="#b06a00" strokeWidth="4" />
        <path d="M28 36 Q28 66 40 96 M64 36 Q64 66 52 96" stroke="#b06a00" strokeWidth="3" fill="none" opacity="0.5" />
      </g>
      <g transform="translate(560 240)">
        <path d="M100 96 Q104 20 60 0 Q90 40 78 96 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="38" cy="8" r="10" fill="#ef5350" />
        <circle cx="56" cy="60" r="12" fill="#ffd54f" />
        <circle cx="84" cy="48" r="9" fill="#fb8c00" />
        <rect x="56" y="96" width="40" height="12" rx="5" fill="#8d99a3" stroke="#5c6b76" strokeWidth="3" />
      </g>
      <g transform="translate(640 420)">
        <rect x="0" y="0" width="120" height="18" rx="8" fill="#66bb6a" stroke="#2e7d32" strokeWidth="3.4" />
        <circle cx="120" cy="9" r="9" fill="#66bb6a" stroke="#2e7d32" strokeWidth="3.4" />
      </g>
    </svg>
  )
}

export function MaterialsScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={90} y={90} width={620} height={310} rx={18} fill="#ffffff" opacity={0.24} />
      <rect x={140} y={130} width={520} height={24} rx={8} fill="#78909c" opacity={0.9} />
      <rect x={126} y={152} width={10} height={210} fill="#546e7a" />
      <rect x={664} y={152} width={10} height={210} fill="#546e7a" />
      <g transform="translate(180 190)">
        <path d="M14 6 L34 6 L28 56 L20 56 Z" fill="#9575cd" stroke="#5e35b1" strokeWidth="3.6" strokeLinejoin="round" />
        <path d="M20 12 L34 12" stroke="#5e35b1" strokeWidth="3" opacity="0.5" />
      </g>
      <g transform="translate(280 190)">
        <rect x="0" y="4" width="48" height="52" rx="6" fill="#bce3f7" stroke="#0277bd" strokeWidth="3.6" />
        <path d="M8 18 L40 18 M10 32 L36 32" stroke="#4fc3f7" strokeWidth="3" />
      </g>
      <g transform="translate(390 190)">
        <rect x="0" y="6" width="52" height="46" rx="8" fill="#c9884e" stroke="#8d5a2b" strokeWidth="3.6" />
        <path d="M10 18 Q26 14 42 18 M10 30 Q26 26 42 30" stroke="#8d5a2b" strokeWidth="2.4" opacity="0.6" />
      </g>
      <g transform="translate(510 190)">
        <rect x="6" y="8" width="40" height="44" rx="8" fill="#b0bec5" stroke="#455a64" strokeWidth="3.6" />
        <path d="M10 20 Q26 18 42 20 M10 32 Q26 30 42 32" stroke="#455a64" strokeWidth="2.4" opacity="0.6" />
      </g>
      <g transform="translate(600 190)">
        <path d="M8 56 Q10 26 24 8 Q40 26 42 56 Q32 52 24 54 Q16 52 8 56 Z" fill="#ffcc80" stroke="#b06a00" strokeWidth="3.6" strokeLinejoin="round" />
      </g>
      <g transform="translate(620 300)">
        <path d="M44 8 L56 14 L50 24 L40 30 L42 46 Q24 52 16 42 Q20 28 24 18 Z" fill="#ffd54f" stroke="#b8860b" strokeWidth="3.2" strokeLinejoin="round" />
      </g>
      <g transform="translate(200 320)">
        <circle cx="0" cy="0" r="20" fill="#ff6347" stroke="#b71c1c" strokeWidth="3.6" />
        <rect x="-10" y="-20" width="20" height="22" rx="8" fill="#ffffff" />
        <rect x="-10" y="-2" width="20" height="22" rx="8" fill="#ffffff" />
      </g>
    </svg>
  )
}

export function ParticleScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" strokeWidth={30} opacity={0.28}>
        <line x1={70} y1={90} x2={170} y2={90} stroke="#ffffff" />
        <line x1={640} y1={60} x2={740} y2={60} stroke="#ffffff" />
        <line x1={90} y1={320} x2={200} y2={320} stroke="#ffffff" />
        <line x1={600} y1={370} x2={700} y2={370} stroke="#ffffff" />
      </g>
      <circle cx={120} cy={90} r={7} fill="#e57373" className="sci-pulse" />
      <circle cx={150} cy={90} r={7} fill="#4fc3f7" className="sci-pulse" />
      <circle cx={670} cy={60} r={7} fill="#81c784" className="sci-pulse" />
      <circle cx={710} cy={60} r={7} fill="#ffb74d" className="sci-pulse" />
      <g transform="translate(400 240)">
        <ellipse cx={0} cy={40} rx={64} ry={26} fill="#8fc2e3" opacity={0.9} stroke="#33608f" strokeWidth={4} />
        <path d="M-64 40 L64 40 Q64 20 44 8 L44 -40 Q44 -64 8 -64 L-8 -64 Q-44 -64 -44 -40 L-44 8 Q-64 20 -64 40 Z" fill="#cde8f7" stroke="#33608f" strokeWidth={4} strokeLinejoin="round" />
        <path d="M-44 8 Q-22 -6 0 6 Q22 18 44 8" stroke="#66bb6a" strokeWidth={5} fill="none" opacity={0.9} />
        <circle cx={-16} cy={16} r={3.4} fill="#e57373" className="sci-pulse" />
        <circle cx={16} cy={20} r={3.4} fill="#4fc3f7" className="sci-pulse" />
        <circle cx={0} cy={26} r={3} fill="#81c784" className="sci-pulse" />
        <path d="M-44 -40 Q-22 -52 0 -44 Q22 -36 44 -40" stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.5} />
        <path d="M8 -64 Q8 -120 16 -140 M-8 -64 Q-8 -120 -16 -140" stroke="#33608f" strokeWidth={5} opacity={0.6} fill="none" strokeLinecap="round" />
        <path d="M16 -128 Q56 -128 56 -108 M-16 -128 Q-56 -128 -56 -108" stroke="#33608f" strokeWidth={5} opacity={0.6} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function WaterScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Cloud cx={140} cy={70} />
      <Cloud cx={640} cy={90} sx={0.8} />
      <g transform="translate(600 150)">
        <path d="M10 80 Q16 40 30 28 Q44 40 50 80 L40 0 Q20 0 12 6 Z" fill="#8d99a3" stroke="#5c6b76" strokeWidth={4} strokeLinejoin="round" />
        <path d="M0 80 Q6 40 20 28" stroke="#5c6b76" strokeWidth={4} fill="none" />
        <path d="M16 60 Q26 30 24 8 M32 60 Q38 30 34 8" stroke="#b3e5fc" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      <path d="M0 300 Q160 260 320 290 Q520 320 800 280 L800 450 L0 450 Z" fill="#42a5f5" />
      <path d="M0 310 Q180 280 340 306 Q520 330 800 296" stroke="#b3e5fc" strokeWidth={6} fill="none" opacity={0.7} />
      <path d="M40 380 Q140 350 240 378 M300 400 Q420 372 540 400 M560 360 Q660 334 760 358" stroke="#b3e5fc" strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
      <g transform="translate(150 330)">
        <rect x="0" y="0" width="30" height="34" rx="4" fill="#b3e5fc" opacity={0.95} stroke="#5c9acf" strokeWidth={3.4} />
        <path d="M8 60 Q0 40 4 24 M20 62 Q16 40 18 20" stroke="#b3e5fc" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
      </g>
      <g transform="translate(660 330)">
        <circle cx="0" cy="0" r="18" fill="#ffd54f" stroke="#b8860b" strokeWidth={4} />
        <path d="M0 -26 L0 -34 M0 26 L0 34 M-26 0 L-34 0 M26 0 L34 0 M-18 -18 L-24 -24 M18 18 L24 24 M18 -18 L24 -24 M-18 18 L-24 24" stroke="#fb8c00" strokeWidth={3.4} strokeLinecap="round" />
        <path d="M8 34 Q0 24 4 14" stroke="#b3e5fc" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
      </g>
    </svg>
  )
}

export function SkyScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Cloud cx={110} cy={80} />
      <Cloud cx={520} cy={110} sx={0.7} />
      <g transform="translate(600 150)">
        <path d="M0 56 L26 12 L44 40 L20 56 L30 76 L52 46 L66 92 L0 56 Z" fill="#ffd54f" stroke="#b8860b" strokeWidth={4} strokeLinejoin="round" />
        <path d="M20 56 Q30 80 34 96 Q44 96 48 88" stroke="#b8860b" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(200 180)">
        <path d="M0 40 Q40 0 90 24 Q120 34 130 60 Q120 56 100 54 Q130 80 120 108 Q96 84 80 74 Q80 104 64 122 Q60 92 52 78 Q48 114 28 130 Q30 92 40 76 Q8 92 -4 74 Q4 56 0 40 Z" fill="#ef5350" stroke="#c62828" strokeWidth={3.4} strokeLinejoin="round" />
      </g>
      <g transform="translate(420 420)">
        <rect x="0" y="0" width="8" height="34" rx="3" fill="#5d4037" />
        <ellipse cx="4" cy="-4" rx="26" ry="34" fill="#ffffff" stroke="#c9d4de" strokeWidth={4} />
      </g>
      <path d="M60 420 Q200 380 340 420 M300 430 Q440 390 560 430 M560 420 Q660 392 740 418" stroke="#66bb6a" strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round" />
      <g transform="translate(660 380)">
        <path d="M2 60 L10 54 L10 30 Q10 14 4 6 L2 4 L6 8 Q10 0 12 2 Q18 14 18 30 L18 54 L26 60 Z" fill="#8d99a3" stroke="#5c6b76" strokeWidth={3.4} strokeLinejoin="round" />
        <path d="M10 30 L10 10" stroke="#5c6b76" strokeWidth={3.4} strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function ForceScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(90 300)">
        <path d="M0 90 L120 0 L200 90 Z" fill="#ef5350" stroke="#c62828" strokeWidth={4} strokeLinejoin="round" />
        <line x1="0" y1="90" x2="200" y2="90" stroke="#c62828" strokeWidth={4} />
        <circle cx="150" cy="32" r="18" fill="#4fc3f7" stroke="#0288d1" strokeWidth={4} />
        <path d="M0 90 Q60 70 120 90" stroke="#ef9a9a" strokeWidth={4} fill="none" opacity={0.7} />
      </g>
      <rect x={40} y={420} width={720} height={16} rx={7} fill="#90a4ae" stroke="#607d8b" strokeWidth={3} />
      <g transform="translate(540 210)">
        <path d="M0 60 L10 6 Q12 0 18 0 L38 0 Q44 0 46 6 L56 60 Q40 52 28 54 Q16 52 0 60 Z" fill="#4fc3f7" stroke="#0288d1" strokeWidth={4} />
        <circle cx="19" cy="10" r="5" fill="#ffffff" />
        <circle cx="35" cy="10" r="5" fill="#ffffff" />
      </g>
      <g transform="translate(320 260)">
        <path d="M0 40 L60 40 Q66 40 70 46 L70 66 Q70 72 64 72 L-6 72 Q-12 72 -12 66 L-12 46 Z" fill="#ff7043" stroke="#d84315" strokeWidth={4} />
        <circle cx="-12" cy="72" r="12" fill="#546e7a" stroke="#263238" strokeWidth={3.4} />
        <circle cx="70" cy="72" r="12" fill="#546e7a" stroke="#263238" strokeWidth={3.4} />
        <path d="M6 -6 L54 -6 L44 -40 L16 -40 Z" fill="#ffcc80" stroke="#b06a00" strokeWidth={3.4} strokeLinejoin="round" />
      </g>
      <g transform="translate(700 180)">
        <rect x="0" y="0" width="26" height="26" rx="5" fill="#ef5350" stroke="#b71c1c" strokeWidth={3.4} />
        <rect x="0" y="26" width="26" height="26" rx="5" fill="#ffffff" />
        <path d="M40 12 L64 12 L64 36 L40 36 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth={3} />
        <path d="M48 12 L48 36 M40 24 L64 24" stroke="#ffffff" strokeWidth={3} />
      </g>
      <path d="M180 300 Q260 250 320 270 Q380 290 420 240 Q460 190 520 180" stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.7} strokeDasharray="8 10" />
    </svg>
  )
}

export function TheatreScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={60} y={40} width={680} height={360} rx={12} fill="var(--sci-theatre)" />
      <path d="M60 40 L740 40 L736 400 L64 400 Z" fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.3} />
      <path d="M60 40 L250 120 M740 40 L550 120 L60 40 Z" fill="#8d6e63" stroke="#4e342e" strokeWidth={4} transform="translate(0 0)" />
      <path d="M60 40 L250 120 M740 40 L550 120 Z" stroke="#ffffff" strokeWidth={4} opacity={0.5} />
      <path d="M60 40 L250 120 L240 130 L70 52 Z" fill="#a1887f" opacity={0.9} />
      <path d="M740 40 L550 120 L560 130 L730 52 Z" fill="#a1887f" opacity={0.9} />
      <ellipse cx={400} cy={300} rx={220} ry={150} fill="#fff59d" opacity={0.55} />
      <ellipse cx={400} cy={260} rx={160} ry={110} fill="#fffde7" opacity={0.65} />
      <g transform="translate(400 270)">
        <circle cx="0" cy="0" r="46" fill="#ffc107" stroke="#b8860b" strokeWidth={4} />
        <path d="M-8 -6 L8 -6 L8 6 L-8 6 Z M-8 6 L0 52 L8 6 Z" fill="#8d99a3" stroke="#5c6b76" strokeWidth={3.4} strokeLinejoin="round" />
        <path d="M-28 20 Q-34 34 -46 40 M28 20 Q34 34 46 40" stroke="#757575" strokeWidth={4} fill="none" opacity={0.8} />
      </g>
      <g transform="translate(520 400)">
        <rect x="0" y="0" width="22" height="7" rx="3" fill="#8b8b8b" />
        <rect x="1" y="7" width="20" height="20" rx="5" fill="#616161" />
      </g>
    </svg>
  )
}

export function SpaceScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Stars />
      <g transform="translate(300 130)">
        <ellipse cx="0" cy="150" rx="110" ry="30" fill="none" stroke="#5b8def" strokeWidth={5} opacity={0.5} />
        <circle cx="-60" cy="0" r="26" fill="#ffe082" stroke="#f5b916" strokeWidth={4} />
        <path d="M-60 -34 A26 26 0 0 1 -66 26 A60 60 0 0 0 -76 -10 A42 42 0 0 1 -80 -26 Z" fill="#bfa24a" opacity={0.8} />
        <circle cx="-48" cy="-8" r="6" fill="#8f9fb0" opacity={0.8} />
        <circle cx="-78" cy="-22" r="4" fill="#8f9fb0" opacity={0.8} />
      </g>
      <g transform="translate(620 240)" className="sci-float">
        <path d="M0 -70 Q20 -10 22 30 Q22 46 12 50 L-12 50 Q-22 46 -22 30 Q-20 -10 0 -70 Z" fill="#90caf9" stroke="#33608f" strokeWidth={4} strokeLinejoin="round" />
        <circle cx="0" cy="0" r="16" fill="#33608f" />
        <path d="M0 46 L0 70 M-16 50 L-16 74 M16 50 L16 74" stroke="#ff7043" strokeWidth={5} strokeLinecap="round" />
        <path d="M-22 42 L-60 50 L-22 58 Z M22 42 L60 50 L22 58 Z" fill="#ef5350" stroke="#b71c1c" strokeWidth={3} strokeLinejoin="round" />
        <path d="M8 24 Q30 30 44 46 M-8 16 Q-34 24 -48 42" stroke="#ffd54f" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(520 90)">
        <ellipse cx="0" cy="40" rx="52" ry="16" fill="none" stroke="#7ee0b8" strokeWidth={5} opacity={0.7} transform="rotate(-14)" />
        <circle cx="0" cy="34" r="22" fill="#a5e8ce" stroke="#4ab08a" strokeWidth={4} />
        <path d="M-30 28 Q-12 20 4 28 Q20 34 26 22 Q34 40 40 52 Q10 56 -20 50 Z" fill="#66bb6a" />
        <path d="M8 -12 Q14 4 10 24" stroke="#66bb6a" strokeWidth={5} />
      </g>
      <rect x={370} y={390} width={14} height={60} rx={6} fill="#8d99a3" />
      <g transform="translate(377 378)">
        <path d="M0 0 L40 -14 Q16 -6 14 -26 L0 0 Z" fill="#ef9a9a" stroke="#c62828" strokeWidth={3} strokeLinejoin="round" />
        <circle cx="38" cy="-16" r="6" fill="#ffd54f" />
      </g>
    </svg>
  )
}

export function EcoScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--sci-ground)" rx={300} ry={120} cx={200} cy={480} opacity={0.5} />
      <Hills fill="var(--sci-accent)" rx={340} ry={140} cx={620} cy={490} opacity={0.45} />
      <Cloud cx={120} cy={70} />
      <Cloud cx={650} cy={110} sx={0.7} />
      <g>
        <rect x={140} y={300} width={18} height={120} rx={6} fill="#7a4f2b" />
        <path d="M140 320 Q128 240 200 220 Q268 240 256 320 Q220 300 200 310 Q166 300 140 320 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth={3} strokeLinejoin="round" />
      </g>
      <g>
        <rect x={620} y={320} width={15} height={100} rx={6} fill="#7a4f2b" />
        <path d="M622 336 Q610 270 676 250 Q738 270 730 336 Q700 320 676 326 Q648 320 622 336 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth={3} strokeLinejoin="round" />
      </g>
      <path d="M60 420 Q220 380 380 420 Q540 380 740 420" stroke="#66bb6a" strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round" />
      <g transform="translate(660 210)">
        <path d="M0 20 L16 8 L16 -12 Q16 -30 4 -36 Q12 -22 8 -10 L0 -16 Q-10 -30 -4 -36 Q-16 -28 -16 -12 L-16 8 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth={3} />
        <rect x="-6" y="12" width="12" height="5" rx="2.4" fill="#66bb6a" />
      </g>
      <g transform="translate(470 360)">
        <circle cx="0" cy="0" r="7" fill="#ffd54f" />
        <circle cx="14" cy="4" r="7" fill="#ffd54f" />
        <circle cx="28" cy="0" r="7" fill="#ffd54f" />
      </g>
      <g transform="translate(340 180)">
        <path d="M0 0 L22 0 M0 12 L22 12 M0 24 L14 24" stroke="#4fc3f7" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      </g>
    </svg>
  )
}

export function WeatherScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g stroke="#81d4fa" strokeWidth={3.4} opacity={0.9}>
        <line x1={180} y1={70} x2={180} y2={110} />
        <line x1={220} y1={80} x2={220} y2={120} />
        <line x1={480} y1={90} x2={480} y2={130} />
        <line x1={700} y1={70} x2={700} y2={110} />
      </g>
      <g transform="translate(160 130)">
        <path d="M0 0 Q-14 0 -13 -12 Q-12 -24 2 -24 Q8 -38 24 -32 Q36 -30 34 -16 Q44 -14 42 -4 Q40 2 30 2 Z" fill="#eceff1" stroke="#90a4ae" strokeWidth={4} strokeLinejoin="round" />
        <path d="M6 -6 L10 -14 L14 -6" fill="#ffd54f" transform="translate(30 6)" />
      </g>
      <g transform="translate(420 150)">
        <path d="M0 0 Q-14 0 -13 -12 Q-12 -24 2 -24 Q8 -38 24 -32 Q36 -30 34 -16 Q44 -14 42 -4 Q40 2 30 2 Z" fill="#cfd8dc" stroke="#90a4ae" strokeWidth={4} strokeLinejoin="round" />
        <path d="M10 8 Q16 18 10 26 M32 8 Q38 20 32 28" stroke="#ffd54f" strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <path d="M2 8 Q8 16 4 22 M20 10 Q26 20 20 28" stroke="#b0bec5" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(640 210)">
        <path d="M40 0 Q2 -10 -18 -34 Q8 -40 20 -28 Q40 -52 60 -28 Q76 -16 64 -8 Q88 -8 84 10 Q80 26 60 26 Q14 28 8 4 Z" fill="#90a4ae" stroke="#546e7a" strokeWidth={4} strokeLinejoin="round" />
        <path d="M32 70 Q26 54 32 44 M56 62 Q52 48 56 40" stroke="#ffd54f" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(120 380)">
        <rect x="0" y="0" width="14" height="8" rx="3" fill="#ef5350" />
        <rect x="1" y="8" width="12" height="10" rx="4" fill="#ffffff" />
      </g>
      <path d="M140 340 Q200 300 320 350" stroke="#4fc3f7" strokeWidth={5} fill="none" opacity={0.8} />
      <g transform="translate(360 360)">
        <path d="M0 20 Q14 4 24 20 M8 14 Q16 4 24 18" stroke="#ffd54f" strokeWidth={3} fill="none" opacity={0.7} />
      </g>
    </svg>
  )
}

export function LabScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={90} y={90} width={620} height={60} rx={10} fill="#ffffff" opacity={0.24} />
      <g transform="translate(130 120)">
        <g>
          <path d="M10 32 Q10 4 26 4 Q42 4 42 32 Q42 42 34 44 L18 44 Q10 42 10 32 Z" fill="#bce3f7" stroke="#33608f" strokeWidth={3.4} strokeLinejoin="round" />
          <line x1="10" y1="14" x2="42" y2="14" stroke="#4fc3f7" strokeWidth={3} />
          <path d="M18 28 Q26 24 34 28" stroke="#66bb6a" strokeWidth={3} fill="none" />
        </g>
        <g transform="translate(66 -4)">
          <path d="M8 6 Q24 6 34 12 Q42 24 36 40 Q46 48 38 52 Q22 56 18 44 Q12 28 8 6 Z" fill="#cde8f7" stroke="#33608f" strokeWidth={3.4} strokeLinejoin="round" />
        </g>
        <g transform="translate(120 8)">
          <path d="M0 0 L34 6 L22 44 Q-6 40 0 0 Z" fill="#ffd54f" stroke="#b8860b" strokeWidth={3.4} strokeLinejoin="round" />
          <circle cx="20" cy="20" r="4" fill="#fb8c00" />
        </g>
      </g>
      <g transform="translate(300 380)">
        <rect x="0" y="0" width="460" height="22" rx="11" fill="#8d6e63" stroke="#5d4037" strokeWidth={3.4} />
        <circle cx="60" cy="11" r="7" fill="#ef5350" className="sci-pulse" />
        <circle cx="120" cy="11" r="7" fill="#4fc3f7" className="sci-pulse" />
        <rect x="160" y="4" width="290" height="14" rx="7" fill="#5c8a5c" />
        <path d="M160 11 Q300 4 450 11" stroke="#a5d6a7" strokeWidth={3} fill="none" />
      </g>
      <g transform="translate(660 330)">
        <rect x="-4" y="0" width="16" height="60" rx="6" fill="#b0bec5" stroke="#607d8b" strokeWidth={3} />
        <g className="sci-float" style={{ animationDelay: '0.2s' }}>
          <circle cx="4" cy="-4" r="26" fill="#e8f4fb" stroke="#33608f" strokeWidth={3.4} />
          <ellipse cx="4" cy="-6" rx="18" ry="2.4" fill="#90caf9" transform="rotate(-14 4 -6)" />
          <path d="M-12 -14 L4 -8 L-6 -2" stroke="#33608f" strokeWidth={2.4} fill="none" opacity={0.8} />
        </g>
      </g>
      <g transform="translate(120 330)">
        <rect x="0" y="0" width="80" height="30" rx="6" fill="#fff" opacity={0.85} />
        <path d="M8 8 L36 8 M8 16 L28 16" stroke="#90a4ae" strokeWidth={3.4} />
        <path d="M44 8 L64 8 M44 16 L72 16 M44 24 L60 24" stroke="#90a4ae" strokeWidth={3.4} opacity={0.6} />
      </g>
    </svg>
  )
}