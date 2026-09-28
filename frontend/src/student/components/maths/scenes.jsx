import React from 'react'

// Eleven illustrated cartoon environments for the Math Adventure World map.
// Each scene fills the full-bleed sky/ground band of a world or map node.
// Colors come from the theme palette via CSS custom properties
// (--mth-sky-top / --mth-sky-bottom / --mth-ground / --mth-accent).

function Hills({ fill, rx = 300, ry = 130, cx = 650, cy = 440, opacity = 0.9 }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} opacity={opacity} />
}

function Cloud({ cx, cy, sx = 1 }) {
  return (
    <g transform={`translate(${cx - 40} ${cy - 14}) scale(${sx})`} fill="#ffffff" opacity={0.75}>
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

export function CastleScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--mth-ground)" rx={360} ry={150} cx={150} cy={460} />
      <Hills fill="var(--mth-accent)" rx={300} ry={120} cx={680} cy={470} opacity={0.55} />
      <Cloud cx={120} cy={80} />
      <Cloud cx={560} cy={120} sx={0.7} />
      <Birds d={300} y={70} />
      {/* castle body */}
      <g fill="var(--mth-ground)">
        <rect x={250} y={210} width={300} height={240} rx={14} />
        <rect x={210} y={240} width={380} height={30} rx={8} />
        <path d="M280 212 L335 150 L390 212 Z" />
        <path d="M415 212 L470 150 L525 212 Z" />
        {/* crenellations */}
        {[255, 295, 335, 375, 415, 455, 495].map((x) => (
          <rect key={x} x={x} y={196} width={22} height={20} rx={4} />
        ))}
      </g>
      {/* tower windows */}
      <g fill="var(--mth-accent)">
        <rect x={340} y={280} width={34} height={48} rx={10} />
        <rect x={426} y={280} width={34} height={48} rx={10} />
        <circle cx={495} cy={300} r={12} />
        <circle cx={305} cy={300} r={12} />
      </g>
      {/* banner */}
      <rect x={530} y={150} width={5} height={90} fill="var(--mth-accent)" />
      <path d="M535 152 L590 172 L535 192 Z" fill="var(--mth-accent)" />
      {/* open gate */}
      <path d="M370 450 L370 392 A30 30 0 0 1 430 392 L430 450 Z" fill="#2a2247" />
    </svg>
  )
}

export function ValleyScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--mth-ground)" rx={340} ry={140} cx={200} cy={470} />
      <Hills fill="var(--mth-accent)" rx={320} ry={110} cx={620} cy={480} opacity={0.5} />
      <Hills fill="var(--mth-ground)" rx={240} ry={80} cx={400} cy={460} opacity={0.92} />
      <Cloud cx={80} cy={90} />
      <Cloud cx={520} cy={60} sx={0.6} />
      {/* fruit trees */}
      <rect x={120} y={300} width={14} height={70} rx={6} fill="#7a4f2b" />
      <circle cx={127} cy={272} r={42} fill="#5fae58" />
      <circle cx={112} cy={286} r={7} fill="var(--mth-accent)" />
      <circle cx={138} cy={268} r={7} fill="var(--mth-accent)" />
      <rect x={630} y={310} width={14} height={66} rx={6} fill="#7a4f2b" />
      <circle cx={637} cy={282} r={44} fill="#4f9c96" />
      <circle cx={622} cy={296} r={7} fill="var(--mth-accent)" />
      <circle cx={648} cy={278} r={7} fill="var(--mth-accent)" />
      <Birds d={340} y={120} />
    </svg>
  )
}

export function ForestScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--mth-ground)" rx={380} ry={180} cx={400} cy={470} />
      <ellipse cx={400} cy={430} rx={600} ry={30} fill="#274236" opacity={0.5} />
      <Cloud cx={150} cy={80} sx={0.6} />
      {/* trees */}
      {[120, 250, 560, 680].map((x, i) => (
        <g key={x}>
          <rect x={x} y={280} width={16} height={90} rx={6} fill="var(--mth-ground)" opacity={0.9} />
          <path d={`M${x - 34} 292 L${x + 8} ${212 - i * 14} L${x + 50} 292 Z`} fill="var(--mth-accent)" opacity={0.95} />
          <path d={`M${x - 24} 258 L${x + 8} ${196 - i * 14} L${x + 40} 258 Z`} fill="#7cbb73" opacity={0.9} />
        </g>
      ))}
      {/* bush */}
      <ellipse cx={430} cy={400} rx={60} ry={24} fill="#5fae58" opacity={0.85} />
      <ellipse cx={340} cy={412} rx={48} ry={18} fill="var(--mth-ground)" opacity={0.8} />
      {/* drifting leaf */}
      <path d="M520 180 q16 -10 32 0 q16 10 0 20 q-16 10 -32 0 Z" fill="var(--mth-accent)" opacity={0.8} />
      <Birds d={250} y={100} />
    </svg>
  )
}

export function CityScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={0} y={300} width={800} height={150} fill="var(--mth-ground)" />
      {/* skyline towers */}
      {[
        { x: 60, w: 90, h: 210, win: 3 },
        { x: 170, w: 70, h: 260, win: 4 },
        { x: 420, w: 100, h: 230, win: 4 },
        { x: 540, w: 80, h: 280, win: 4 },
        { x: 650, w: 90, h: 190, win: 3 },
      ].map((t) => (
        <g key={t.x}>
          <rect x={t.x} y={450 - t.h} width={t.w} height={t.h} fill="var(--mth-accent)" opacity={0.42} />
          <rect x={t.x} y={450 - t.h} width={t.w} height={t.h} fill="var(--mth-ground)" opacity={0.9} />
          <rect x={t.x + 6} y={450 - t.h + 14} width={t.w - 12} height={10} rx={4} fill="var(--mth-accent)" opacity={0.7} />
          {Array.from({ length: t.win }).map((_, i) =>
            Array.from({ length: t.win }).map((_, j) => (
              <rect
                key={`${i}-${j}`}
                x={t.x + 10 + j * 20}
                y={450 - t.h + 42 + i * 42}
                width={12}
                height={16}
                rx={3}
                fill="#ffe9b3"
                opacity={0.9}
              />
            ))
          )}
        </g>
      ))}
      {/* lit street */}
      <rect x={0} y={418} width={800} height={10} fill="var(--mth-accent)" opacity={0.5} />
      <circle cx={60} cy={270} r={2.5} fill="#ffe9b3" />
      <circle cx={96} cy={250} r={2.5} fill="#ffe9b3" />
      <circle cx={330} cy={280} r={2.5} fill="#ffe9b3" />
      <circle cx={700} cy={300} r={3} fill="#ffe9b3" />
      <Cloud cx={360} cy={70} />
      <Birds d={180} y={140} />
    </svg>
  )
}

export function CaveScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--mth-ground)" rx={400} ry={190} cx={400} cy={470} />
      {/* cave mountain */}
      <path
        d="M80 450 C 120 250 200 170 380 150 C 560 170 660 250 700 450 Z"
        fill="var(--mth-ground)"
        opacity={0.95}
      />
      <path d="M80 450 C 120 270 220 200 380 182 C 540 200 650 270 700 450 Z" fill="#2a1d16" opacity={0.6} />
      {/* cave opening */}
      <path d="M330 450 C 330 360 360 320 400 320 C 440 320 470 360 470 450 Z" fill="#140d0a" />
      {/* treasure glow */}
      <ellipse cx={400} cy={430} rx={70} ry={16} fill="var(--mth-accent)" opacity={0.8} />
      <circle cx={388} cy={420} r={14} fill="var(--mth-accent)" />
      <circle cx={412} cy={426} r={10} fill="#ffe9b3" />
      <circle cx={402} cy={408} r={8} fill="var(--mth-accent)" />
      {/* sparkling gems around */}
      <path d="M620 300 l12 -18 l12 18 l-12 18 Z" fill="var(--mth-accent)" opacity={0.9} />
      <path d="M660 330 l9 -14 l9 14 l-9 14 Z" fill="#ffe9b3" opacity={0.9} />
      <ellipse cx={640} cy={360} rx={30} ry={12} fill="#3a2717" opacity={0.8} />
      <Cloud cx={260} cy={80} sx={0.5} />
      <Birds d={480} y={60} />
    </svg>
  )
}

export function IslandScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--mth-accent)" rx={360} ry={120} cx={140} cy={150} opacity={0.4} />
      <Hills fill="var(--mth-accent)" rx={320} ry={100} cx={660} cy={140} opacity={0.35} />
      <Cloud cx={90} cy={70} />
      <Cloud cx={600} cy={50} sx={0.6} />
      <Birds d={120} y={120} />
      {/* sea */}
      <ellipse cx={400} cy={460} rx={440} ry={70} fill="var(--mth-ground)" opacity={0.9} />
      {/* island */}
      <ellipse cx={400} cy={420} rx={230} ry={45} fill="#d8b06a" />
      <ellipse cx={400} cy={412} rx={200} ry={38} fill="var(--mth-ground)" opacity={0.9} />
      {/* round hut */}
      <g>
        <rect x={360} y={360} width={80} height={52} rx={8} fill="#d9a45f" />
        <path d="M344 364 L400 316 L456 364 Z" fill="#c88a4a" />
        <circle cx={400} cy={342} r={5} fill="var(--mth-accent)" />
        <rect x={386} y={386} width={28} height={26} rx={5} fill="#5a422a" />
      </g>
      {/* palm */}
      <g>
        <path d="M520 410 q14 -70 -6 -110" stroke="#7a4f2b" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M512 304 q-40 -10 -52 -36 q46 2 58 22 Z" fill="#4f9c96" />
        <path d="M528 302 q44 -8 60 -28 q-48 -6 -62 12 Z" fill="#5fae58" />
        <path d="M516 312 q-6 -44 26 -56 q4 46 -22 60 Z" fill="#4f9c96" />
      </g>
    </svg>
  )
}

export function BakeryScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--mth-ground)" rx={360} ry={130} cx={200} cy={470} />
      <Hills fill="var(--mth-accent)" rx={320} ry={110} cx={640} cy={470} opacity={0.5} />
      <Cloud cx={560} cy={80} sx={0.6} />
      {/* oven glow */}
      <ellipse cx={400} cy={280} rx={180} ry={120} fill="var(--mth-accent)" opacity={0.28} />
      {/* bakery building */}
      <rect x={240} y={220} width={320} height={230} rx={16} fill="#d9a45f" />
      <rect x={260} y={240} width={280} height={30} rx={6} fill="#c88a4a" />
      <path d="M252 244 L400 160 L548 244 Z" fill="#b06f27" />
      <rect x={300} y={300} width={200} height={120} rx={10} fill="#fff0e4" />
      {/* window treats */}
      <circle cx={350} cy={340} r={22} fill="#ffe9b3" />
      <circle cx={350} cy={340} r={10} fill="#e2a23f" />
      <rect x={420} y={320} width={44} height={38} rx={8} fill="#ff8f70" />
      <rect x={438} y={330} width={10} height={10} rx={2} fill="#fff" opacity={0.85} />
      {/* door */}
      <rect x={420} y={360} width={40} height={60} rx={8} fill="#a86a52" />
      {/* steam wisps */}
      <path d="M330 300 q10 -18 0 -30 q-10 -12 0 -26" stroke="#fff" strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M470 296 q10 -18 0 -30 q-10 -12 0 -26" stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
      <Birds d={190} y={100} />
    </svg>
  )
}

export function StationScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x={0} y={330} width={800} height={120} fill="var(--mth-ground)" />
      <Hills fill="var(--mth-accent)" rx={380} ry={90} cx={400} cy={340} opacity={0.35} />
      <Cloud cx={620} cy={70} sx={0.7} />
      {/* platform roof */}
      <rect x={120} y={140} width={560} height={22} rx={10} fill="var(--mth-accent)" opacity={0.9} />
      {/* pillars */}
      {[160, 300, 500, 640].map((x) => (
        <rect key={x} x={x} y={162} width={14} height={170} rx={5} fill="var(--mth-ground)" opacity={0.9} />
      ))}
      {/* station clock */}
      <circle cx={400} cy={200} r={42} fill="#fff" stroke="var(--mth-accent)" strokeWidth={8} />
      <line x1={400} y1={200} x2={400} y2={172} stroke="#25406b" strokeWidth={5} strokeLinecap="round" />
      <line x1={400} y1={200} x2={422} y2={212} stroke="#25406b" strokeWidth={4} strokeLinecap="round" />
      {/* platform */}
      <rect x={80} y={330} width={640} height={14} rx={5} fill="#5a6b82" />
      <rect x={80} y={328} width={640} height={6} rx={3} fill="var(--mth-accent)" opacity={0.85} />
      {/* train */}
      <g transform="translate(560 0)">
        <rect x={0} y={344} width={170} height={66} rx={14} fill="#3a7bb0" />
        <rect x={14} y={312} width={46} height={40} rx={8} fill="#ffd166" opacity={0.85} />
        <circle cx={34} cy={396} r={16} fill="#2b2b52" />
        <circle cx={34} cy={396} r={7} fill="#fff" />
        <circle cx={120} cy={396} r={16} fill="#2b2b52" />
        <circle cx={120} cy={396} r={7} fill="#fff" />
      </g>
      <Birds d={260} y={90} />
    </svg>
  )
}

export function MarketScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--mth-ground)" rx={420} ry={150} cx={400} cy={470} />
      <Cloud cx={110} cy={70} />
      <Cloud cx={640} cy={110} sx={0.6} />
      {/* stall awning */}
      {['#e07b39', '#ffd166', '#e2a23f'].map((c, i) => (
        <path key={c} d={`M${170 + i * 120} 200 L${170 + i * 120 + 70} 200 L${170 + i * 120 + 50} 330 L${170 + i * 120 + 20} 330 Z`} fill={c} opacity={0.92} />
      ))}
      <rect x={140} y={330} width={260} height={52} rx={6} fill="#a8612f" />
      <rect x={140} y={330} width={260} height={6} fill="var(--mth-accent)" />
      {/* goods on stall */}
      <circle cx={180} cy={318} r={12} fill="var(--mth-accent)" />
      <circle cx={204} cy={322} r={12} fill="#fff0a6" />
      <circle cx={230} cy={318} r={12} fill="var(--mth-accent)" />
      <rect x={270} y={300} width={30} height={24} rx={4} fill="#fff0a6" />
      <rect x={322} y={304} width={30} height={24} rx={4} fill="#ffe9b3" />
      <rect x={356} y={306} width={30} height={24} rx={4} fill="#fff0a6" />
      {/* hanging sign */}
      <rect x={360} y={120} width={90} height={54} rx={10} fill="#fff0a6" stroke="var(--mth-accent)" strokeWidth={4} />
      <text x={405} y={154} textAnchor="middle" fontSize={26} fill="#b8763f" fontWeight={800}>₹</text>
      <line x1={405} y1={118} x2={405} y2={104} stroke="#b8763f" strokeWidth={4} />
      <Birds d={300} y={80} />
    </svg>
  )
}

export function WorkshopScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--mth-ground)" rx={380} ry={150} cx={220} cy={470} />
      <Hills fill="var(--mth-accent)" rx={340} ry={110} cx={640} cy={470} opacity={0.5} />
      <Cloud cx={120} cy={90} />
      <Cloud cx={600} cy={140} sx={0.55} />
      {/* workbench */}
      <rect x={150} y={300} width={500} height={22} rx={8} fill="var(--mth-ground)" />
      <rect x={170} y={322} width={22} height={110} rx={6} fill="var(--mth-ground)" opacity={0.9} />
      <rect x={610} y={322} width={22} height={110} rx={6} fill="var(--mth-ground)" opacity={0.9} />
      {/* rulers and blocks on bench */}
      <rect x={190} y={278} width={140} height={16} rx={6} fill="var(--mth-accent)" />
      <rect x={195} y={282} width={130} height={8} rx={3} fill="#cfae6b" opacity={0.7} />
      <rect x={360} y={270} width={30} height={30} rx={6} fill="#8fb4f0" />
      <rect x={398} y={276} width={30} height={24} rx={6} fill="#ffcf6b" />
      <rect x={436} y={280} width={30} height={20} rx={6} fill="#a6e3c2" />
      {/* measuring jug */}
      <path d="M520 264 L560 264 L570 300 L510 300 Z" fill="#cfe3f5" stroke="#4a78b0" strokeWidth={4} />
      <line x1={532} y1={272} x2={532} y2={296} stroke="#4a78b0" strokeWidth={3} />
      <line x1={548} y1={272} x2={548} y2={296} stroke="#4a78b0" strokeWidth={3} />
      {/* hanging scale */}
      <circle cx={80} cy={180} r={34} fill="var(--mth-accent)" opacity={0.35} />
      <circle cx={80} cy={180} r={26} fill="#fff" opacity={0.85} />
      <line x1={80} y1={206} x2={62} y2={250} stroke="#4a78b0" strokeWidth={4} />
      <line x1={80} y1={206} x2={98} y2={250} stroke="#4a78b0" strokeWidth={4} />
      <rect x={48} y={230} width={28} height={16} rx={4} fill="#e2a23f" />
      <rect x={84} y={236} width={28} height={16} rx={4} fill="#ff8f70" />
      <Birds d={220} y={110} />
    </svg>
  )
}

export function DetectiveScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--mth-ground)" rx={420} ry={165} cx={400} cy={470} />
      <Cloud cx={90} cy={60} sx={0.55} />
      {/* string lights */}
      <path d="M120 90 Q 260 130 400 90 T 680 90" stroke="#7fd8d8" strokeWidth={3} fill="none" opacity={0.8} />
      {[200, 280, 360, 440, 520, 600].map((x) => (
        <circle key={x} cx={x} cy={108} r={6} fill="#fff0a6" />
      ))}
      {/* detective board */}
      <rect x={130} y={200} width={540} height={210} rx={14} fill="#eaf2f7" stroke="#2e7c9c" strokeWidth={5} />
      {/* pinned chart - bar chart */}
      {[
        { x: 220, v: 140, c: '#7fd8d8' },
        { x: 300, v: 96, c: '#ffd166' },
        { x: 380, v: 120, c: '#8fb4f0' },
      ].map((b) => (
        <rect key={b.x} x={b.x} y={380 - b.v} width={52} height={b.v} rx={8} fill={b.c} opacity={0.9} />
      ))}
      {/* tally tallies */}
      {[250, 350, 450, 550].map((x, i) => (
        <g key={x} stroke="#456176" strokeWidth={5} strokeLinecap="round">
          <line x1={x} y1={240} x2={x} y2={262} />
          <line x1={x + 10} y1={240} x2={x + 10} y2={262} />
          <line x1={x + 20} y1={240} x2={x + 20} y2={262} />
          <line x1={x} y1={254} x2={x + 20} y2={254} />
          <line x1={x + 30} y1={240} x2={x + 30} y2={262} opacity={i < 2 ? 1 : 0.4} />
        </g>
      ))}
      {/* pins */}
      <circle cx={150} cy={218} r={7} fill="#ff8f70" />
      <circle cx={650} cy={218} r={7} fill="#ffcf6b" />
      <Birds d={500} y={70} />
    </svg>
  )
}