import React from 'react'

// Eight illustrated cartoon environments for the World Explorer (Social Science).
// Colors come from the theme palette via CSS custom properties
// (--soc-sky-top / --soc-sky-bottom / --soc-ground / --soc-accent).

function Hills({ fill, rx = 300, ry = 130, cx = 650, cy = 440, opacity = 0.9 }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} opacity={opacity} />
}

function Cloud({ cx, cy, sx = 1 }) {
  return (
    <g transform={`translate(${cx - 40} ${cy - 14}) scale(${sx})`} fill="#ffffff" opacity={0.8}>
      <ellipse cx={20} cy={14} rx={26} ry={14} />
      <ellipse cx={48} cy={10} rx={22} ry={16} />
      <ellipse cx={74} cy={16} rx={20} ry={11} />
    </g>
  )
}

function Birds({ d, y }) {
  return (
    <path d={`M${d} q10 -12 20 0 q10 -12 20 0`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.85} transform={`translate(0 ${y})`} />
  )
}

function Star({ x, y, r = 2.4, opacity = 0.85 }) {
  return <circle cx={x} cy={y} r={r} fill="#fff2bd" opacity={opacity} className="soc-scene-star" />
}

export function SpaceScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {[
        [60, 40], [140, 90], [300, 30], [420, 60], [540, 40], [700, 70], [760, 150], [200, 140], [620, 130], [350, 110],
      ].map(([x, y], i) => (
        <Star key={i} x={x} y={y} r={i % 2 ? 1.8 : 2.6} opacity={i % 3 ? 0.7 : 0.95} />
      ))}
      <circle cx={700} cy={360} r={120} fill="url(#socSpaceGlow)" />
      <defs>
        <radialGradient id="socSpaceGlow">
          <stop offset="0%" stopColor="#a778ff" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#a778ff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={380} cy={380} rx={90} ry={26} fill="none" stroke="#a778ff" strokeWidth={5} opacity={0.5} transform="rotate(-18 380 380)" />
      <circle cx={380} cy={350} r={58} fill="#ffd27a" stroke="#e08a2b" strokeWidth={4} />
      <circle cx={368} cy={344} r={5} fill="#e08a2b" opacity={0.6} />
      <path d="M348 356 Q380 368 410 354" stroke="#e08a2b" strokeWidth={3.4} fill="none" opacity={0.6} />
      <g transform="rotate(24 380 350)">
        <path d="M380 350 L380 270" stroke="#ffb35c" strokeWidth={4} strokeLinecap="round" />
        <path d="M380 272 L420 262 L380 268 Z" fill="#ff9d6b" />
      </g>
      <circle cx={586} cy={92} r={30} fill="#4d9de0" stroke="#3a8fd0" strokeWidth={3} />
      <path d="M570 86 Q580 80 592 84 Q598 88 596 96 Q588 94 578 92 Z" fill="#6ea85c" />
      <ellipse cx={150} cy={120} rx={40} ry={14} fill="none" stroke="#7ec7ce" strokeWidth={4} transform="rotate(16 150 120)" />
      <circle cx={150} cy={115} r={19} fill="#9fd8de" stroke="#5ba5ad" strokeWidth={3} />
      <Birds d={300} y={70} />
    </svg>
  )
}

export function EarthViewScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--soc-ground)" rx={340} ry={140} cx={170} cy={470} />
      <Hills fill="var(--soc-accent)" rx={300} ry={120} cx={640} cy={480} opacity={0.5} />
      <Cloud cx={90} cy={80} />
      <Cloud cx={560} cy={110} sx={0.7} />
      <Birds d={340} y={90} />
      <g className="soc-scene-spin">
        <ellipse cx={400} cy={250} rx={95} ry={26} fill="none" stroke="#ffcf6b" strokeWidth={5} opacity={0.6} transform="rotate(-14 400 250)" />
        <circle cx={400} cy={225} r={72} fill="#4d9de0" stroke="#2e6fb0" strokeWidth={5} />
        <path d="M336 210 Q372 200 400 206 Q424 212 428 198 Q452 200 460 214 Q430 228 404 222 Q370 216 338 228 Z" fill="#6ea85c" />
        <path d="M402 153 Q410 200 402 246 Q398 300 414 386 Q392 386 384 330 Q386 226 402 153 Z" fill="#6ea85c" />
        <ellipse cx={400} cy={225} rx={72} ry={72} fill="#0b1030" opacity={0.22} className="soc-scene-night" />
      </g>
      <rect x={160} y={330} width={20} height={10} rx={4} fill="#6b8a6b" transform="rotate(-14 170 335)" />
      <rect x={160} y={314} width={7} height={26} rx={3} fill="#7a4f2b" />
    </svg>
  )
}

export function IndiaScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--soc-ground)" rx={360} ry={150} cx={400} cy={480} opacity={0.9} />
      <Cloud cx={120} cy={80} />
      <Cloud cx={620} cy={120} sx={0.7} />
      <Birds d={300} y={110} />
      <path d="M320 120 L520 120 L520 420 Q420 380 320 420 Z" fill="#f2c98a" stroke="#e0b96a" strokeWidth={4} />
      <path d="M340 150 L500 150 L500 400 Q420 366 340 400 Z" fill="#fde8c8" stroke="#e0b96a" strokeWidth={2.4} opacity={0.9} />
      <circle cx={430} cy={240} r={10} fill="#e0664f" />
      <path d="M460 170 L600 120" stroke="#e0b96a" strokeWidth={3} fill="none" />
      <circle cx={605} cy={118} r={8} fill="#e0664f" />
      <path d="M120 120 H180 V168 Q168 148 150 148 Q132 148 120 168 Z" fill="#ff9d6b" stroke="#e0783f" strokeWidth={3} />
      <rect x={120} y={86} width={60} height={6} rx={3} fill="#7a4f2b" />
      <path d="M150 102 L150 120" stroke="#7a4f2b" strokeWidth={4} />
    </svg>
  )
}

export function GeographyScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--soc-ground)" rx={300} ry={150} cx={220} cy={480} />
      <Hills fill="var(--soc-accent)" rx={330} ry={130} cx={640} cy={470} opacity={0.55} />
      <Cloud cx={90} cy={70} />
      <Cloud cx={600} cy={90} sx={0.6} />
      <Birds d={360} y={80} />
      <g className="soc-scene-spin">
        <ellipse cx={320} cy={250} rx={80} ry={22} fill="none" stroke="#ff9f6b" strokeWidth={5} opacity={0.65} transform="rotate(-14 320 250)" />
        <circle cx={320} cy={228} r={62} fill="#57b8d8" stroke="#2f83a8" strokeWidth={4.4} />
        <path d="M266 220 Q296 212 318 218 Q338 222 342 212 Q362 214 370 226 Q344 236 326 231 Q298 226 270 236 Z" fill="#6ea85c" />
        <path d="M322 166 Q330 216 322 258 Q318 306 330 350 Q306 350 302 306 Q304 222 322 166 Z" fill="#6ea85c" />
        <path d="M320 166 Q320 270 320 348" stroke="#e0664f" strokeWidth={3.4} strokeDasharray="7 8" fill="none" />
      </g>
      <g transform="translate(560 240)">
        <circle cx={0} cy={0} r={52} fill="#fff7e3" stroke="#b0883f" strokeWidth={4} />
        <path d="M0 -38 L8 0 L0 38 L-8 0 Z" fill="#e0664f" stroke="#a84a33" strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M0 38 L8 0 L0 14 Z" fill="#e9efe0" stroke="#a84a33" strokeWidth={1.8} strokeLinejoin="round" />
        <path d="M-8 0 L0 14 L8 0 L0 -18 Z" fill="#ffffff" stroke="#a84a33" strokeWidth={1.6} strokeLinejoin="round" />
      </g>
      <rect x={120} y={330} width={90} height={60} rx={8} fill="#fde8c8" stroke="#e0b96a" strokeWidth={3.4} />
      <path d="M132 340 Q150 350 152 342 Q166 336 168 344 Q184 340 198 346 M132 358 Q150 366 158 356 M132 370 Q148 378 160 370" fill="none" stroke="#3a7a50" strokeWidth={2.4} />
      <path d="M176 366 L180 370 L184 366 Q180 358 176 366 Z" fill="#e0664f" />
    </svg>
  )
}

export function HistoryScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--soc-ground)" rx={380} ry={180} cx={180} cy={500} />
      <Hills fill="var(--soc-accent)" rx={320} ry={130} cx={660} cy={480} opacity={0.5} />
      <path d="M0 220 Q120 160 260 180 Q240 260 120 300 Q40 310 0 300 Z" fill="#7a5230" stroke="#5f3a1f" strokeWidth={4} />
      <ellipse cx={140} cy={250} rx={52} ry={64} fill="#1c1410" stroke="#52351f" strokeWidth={3.4} />
      <ellipse cx={660} cy={210} rx={70} ry={44} fill="#ffffff" opacity={0.85} />
      <ellipse cx={660} cy={236} rx={80} ry={30} fill="#ffffff" opacity={0.9} />
      <path d="M580 210 L640 150 Q660 120 680 150 L740 210 Z" fill="#c9a25a" stroke="#8a6a3a" strokeWidth={4} strokeLinejoin="round" />
      <g className="soc-scene-fire">
        <path d="M520 340 Q528 300 518 270 Q512 250 522 246 Q534 262 532 282 Q540 268 544 284 Q548 300 540 320 Q538 336 544 352 Q530 348 524 338 Z" fill="#e0664f" stroke="#a84a33" strokeWidth={2.6} strokeLinejoin="round" />
        <path d="M524 330 Q532 352 528 362 Q524 368 519 362 Q522 350 516 336 Z" fill="#ffb35c" stroke="#e0664f" strokeWidth={2} strokeLinejoin="round" />
        <path d="M490 250 L492 244 M526 236 L528 230" stroke="#e0664f" strokeWidth={3} strokeLinecap="round" />
      </g>
      <rect x={296} y={380} width={30} height={50} rx={5} fill="#6b8a6b" transform="rotate(-12 312 405)" />
      <rect x={280} y={368} width={14} height={64} rx={6} fill="#7a4f2b" transform="rotate(-12 287 400)" />
      <Birds d={320} y={80} />
    </svg>
  )
}

export function FreedomScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--soc-accent)" rx={340} ry={150} cx={220} cy={480} opacity={0.4} />
      <Hills fill="var(--soc-ground)" rx={360} ry={170} cx={620} cy={500} />
      <Cloud cx={100} cy={80} />
      <path d="M0 400 L800 280" stroke="#d9c08a" strokeWidth={5} strokeDasharray="14 12" />
      <path d="M220 150 L220 440" stroke="#7a4f2b" strokeWidth={6} />
      <g transform="translate(220 150)">
        <rect x={0} y={0} width={150} height={34} fill="#ff9d6b" />
        <rect x={0} y={34} width={150} height={34} fill="#f5efea" />
        <rect x={0} y={68} width={150} height={34} fill="#3f9d6b" />
        <g transform="translate(75 51)">
          <circle r={14} fill="none" stroke="#2f5aa8" strokeWidth={4} />
          <path d="M73 46 L64 63 L87 63 Z" stroke="#2f5aa8" strokeWidth={0} />
          <line x1={61} y1={51} x2={89} y2={51} stroke="#2f5aa8" strokeWidth={2.6} />
          <line x1={75} y1={37} x2={75} y2={65} stroke="#2f5aa8" strokeWidth={2.6} />
          <line x1={65} y1={42} x2={85} y2={60} stroke="#2f5aa8" strokeWidth={2.6} />
          <line x1={85} y1={42} x2={65} y2={60} stroke="#2f5aa8" strokeWidth={2.6} />
        </g>
      </g>
      <g className="soc-scene-glow">
        <circle cx={620} cy={300} r={34} fill="#ffce57" stroke="#e08a2b" strokeWidth={4} />
        <circle cx={620} cy={300} r={48} fill="none" stroke="#ffce57" strokeWidth={6} opacity={0.5} />
        <path d="M606 292 L615 300 L620 288 L625 300 L634 292 Q626 318 618 318 Z" fill="#e0783f" />
      </g>
      <Birds d={350} y={100} />
    </svg>
  )
}

export function CivicsScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--soc-ground)" rx={360} ry={120} cx={420} cy={470} />
      <Hills fill="var(--soc-accent)" rx={280} ry={90} cx={140} cy={460} opacity={0.5} />
      <Cloud cx={90} cy={80} />
      <Cloud cx={620} cy={110} sx={0.7} />
      <g>
        <rect x={90} y={240} width={90} height={130} rx={8} fill="#f5efea" stroke="#a49a88" strokeWidth={3.4} />
        <path d="M135 240 L90 280 L180 280 Z" fill="#5b8def" stroke="#3b63c0" strokeWidth={3} strokeLinejoin="round" />
        <rect x={124} y={300} width={22} height={70} rx={4} fill="#3b63c0" />
      </g>
      <g>
        <rect x={230} y={300} width={96} height={70} rx={8} fill="#f5efea" stroke="#a49a88" strokeWidth={3.4} />
        <rect x={268} y={324} width={20} height={46} rx={4} fill="#e6ded2" stroke="#a49a88" strokeWidth={2} />
        <circle cx={278} cy={334} r={9} fill="#e0664f" stroke="#a84a33" strokeWidth={2} />
        <path d="M278 325 L278 344 M268 334 L288 334" stroke="#d94a3f" strokeWidth={2.6} strokeLinecap="round" />
      </g>
      <g>
        <rect x={356} y={250} width={74} height={120} rx={8} fill="#f5efea" stroke="#a49a88" strokeWidth={3.4} />
        <rect x={356} y={214} width={12} height={40} rx={4} fill="#c9c0b0" transform="rotate(-12 362 234)" />
        <path d="M472 250 L472 240 L478 240 L478 244 Q488 244 492 234 L492 252 L478 254 L478 250 Z" fill="#5b8def" stroke="#3b63c0" strokeWidth={2.4} />
        <circle cx={472} cy={258} r={15} fill="#4f9d6b" />
        <circle cx={461} cy={256} r={9} fill="#8fd0c0" stroke="#4f9d6b" strokeWidth={2.4} />
      </g>
      <g transform="translate(560 300)">
        <rect x={0} y={70} width={10} height={46} rx={4} fill="#6b6b6b" stroke="#4a4a4a" strokeWidth={2.6} />
        <rect x={-6} y={8} width={22} height={66} rx={8} fill="#4a4a4a" />
        <circle cx={5} cy={24} r={7.4} fill="#e0664f" />
        <circle cx={5} cy={42} r={7.4} fill="#ffce57" />
        <circle cx={5} cy={60} r={7.4} fill="#4f9d6b" />
      </g>
      <rect x={200} y={380} width={420} height={14} rx={7} fill="#6e6e6e" transform="rotate(-4 410 387)" />
      <g className="soc-scene-bus" transform="translate(300 360) rotate(-4)">
        <rect x={0} y={-22} width={46} height={26} rx={6} fill="#e8b45a" stroke="#b0883f" strokeWidth={2.6} />
        <circle cx={12} cy={8} r={6} fill="#4a4a4a" />
        <circle cx={34} cy={8} r={6} fill="#4a4a4a" />
        <rect x={6} y={-16} width={8} height={8} rx={2} fill="#bfe3ff" opacity={0.9} />
      </g>
    </svg>
  )
}

export function NatureScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--soc-ground)" rx={340} ry={160} cx={200} cy={480} />
      <Hills fill="var(--soc-accent)" rx={380} ry={140} cx={660} cy={490} opacity={0.45} />
      <Cloud cx={110} cy={70} />
      <Cloud cx={600} cy={100} sx={0.6} />
      <Birds d={330} y={90} />
      <path d="M80 300 Q210 360 380 300 Q480 290 460 420 Q300 428 180 400 Q100 380 80 300 Z" fill="#3f7fc4" stroke="#2e6fb0" strokeWidth={4} />
      <path d="M120 320 Q180 352 240 320 M280 320 Q330 344 380 320" stroke="#bfe3ff" strokeWidth={3} fill="none" opacity={0.8} />
      <g>
        <rect x={520} y={280} width={16} height={80} rx={6} fill="#7a4f2b" />
        <circle cx={528} cy={248} r={58} fill="#4f9d6b" stroke="#3a7a50" strokeWidth={3.4} />
        <circle cx={508} cy={262} r={12} fill="#8fd0a0" opacity={0.8} />
        <circle cx={548} cy={238} r={10} fill="#3a7a50" opacity={0.8} />
      </g>
      <g>
        <rect x={648} y={300} width={14} height={70} rx={5} fill="#7a4f2b" />
        <circle cx={655} cy={274} r={48} fill="#5fae58" stroke="#3a8a50" strokeWidth={3} />
        <circle cx={640} cy={286} r={9} fill="#8fd0a0" />
      </g>
      <g className="soc-scene-sway">
        <path d="M400 420 Q396 380 404 350" stroke="#e8b45a" strokeWidth={8} strokeLinecap="round" />
        <circle cx={404} cy={344} r={9} fill="#ffce57" stroke="#e08a2b" strokeWidth={2.6} />
        <path d="M390 336 L404 324 L418 336 L410 352 L398 352 Z" fill="#ffce57" stroke="#e08a2b" strokeWidth={1.6} />
      </g>
      <g className="soc-scene-hop">
        <ellipse cx={140} cy={420} rx={26} ry={18} fill="#6e8a4c" stroke="#3a5a2b" strokeWidth={3} />
        <circle cx={120} cy={412} r={10} fill="#6e8a4c" stroke="#3a5a2b" strokeWidth={2.4} />
        <circle cx={118} cy={408} r={2.4} fill="#2f3a1f" />
        <circle cx={130} cy={410} r={8} fill="#8fa86b" opacity={0.8} />
      </g>
    </svg>
  )
}