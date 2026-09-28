import React from 'react'

// Six illustrated cartoon worlds for the Adhikaram Theme System.
// Each scene fills the sky/ground band of the world; the animated sky
// gradient, drifting decorations and child characters are separate layers.
// Colors come from the theme palette via CSS custom properties.

function Hills({ fill, h = 110, flip = false }) {
  return (
    <ellipse
      cx={flip ? 150 : 650}
      cy={450 - h}
      rx={300}
      ry={h}
      fill={fill}
      opacity={0.9}
    />
  )
}

export function SunriseScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--adh-ground)" h={150} />
      <Hills fill="var(--adh-accent)" h={95} flip />
      <Hills fill="var(--adh-ground)" h={62} flip />
      {/* sun */}
      <circle cx={640} cy={120} r={58} fill="var(--adh-accent)" opacity={0.95} />
      <circle cx={640} cy={120} r={84} fill="none" stroke="var(--adh-accent)" strokeWidth={5} opacity={0.35} />
      {/* temple tower (gopuram) */}
      <g fill="var(--adh-ground)">
        <rect x={95} y={235} width={130} height={215} rx={8} />
        <rect x={70} y={300} width={180} height={26} rx={6} />
        <rect x={75} y={345} width={170} height={26} rx={6} />
        <path d="M160 118 L235 215 L85 215 Z" />
        <rect x={150} y={176} width={20} height={40} rx={4} />
        <rect x={140} y={245} width={25} height={40} rx={5} />
        <rect x={185} y={245} width={25} height={40} rx={5} />
      </g>
      {/* ven-chirappu flags */}
      <rect x={158} y={122} width={4} height={56} fill="var(--adh-accent)" />
      <path d="M162 124 L208 136 L162 148 Z" fill="var(--adh-accent)" />
      {/* birds */}
      <path d="M320 90 q10 -12 20 0 q10 -12 20 0" stroke="#fff" strokeWidth={3} fill="none" opacity={0.85} />
      <path d="M470 150 q8 -10 16 0 q8 -10 16 0" stroke="#fff" strokeWidth={3} fill="none" opacity={0.7} />
    </svg>
  )
}

export function RainScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--adh-ground)" h={140} />
      <ellipse cx={180} cy={415} rx={130} ry={20} fill="#bcd8e4" opacity={0.85} />
      <ellipse cx={560} cy={420} rx={100} ry={16} fill="#bcd8e4" opacity={0.8} />
      <ellipse cx={330} cy={430} rx={70} ry={12} fill="#bcd8e4" opacity={0.7} />
      {/* distant field */}
      <rect x={0} y={330} width={800} height={14} fill="var(--adh-ground)" opacity={0.9} />
      {/* sprouting saplings */}
      <g stroke="#9fd07f" strokeWidth={5} fill="none" strokeLinecap="round">
        <path d="M90 415 v-38" />
        <path d="M120 412 v-30" />
        <path d="M420 418 v-34" />
        <path d="M470 416 v-28" />
      </g>
      <g fill="#7fbf62">
        <ellipse cx={90} cy={368} rx={14} ry={8} />
        <ellipse cx={120} cy={374} rx={11} ry={7} />
        <ellipse cx={420} cy={376} rx={13} ry={8} />
        <ellipse cx={470} cy={380} rx={10} ry={6} />
      </g>
      {/* grey clouds edge */}
      <ellipse cx={140} cy={70} rx={95} ry={34} fill="#7d97a5" opacity={0.55} />
      <ellipse cx={660} cy={95} rx={80} ry={28} fill="#7d97a5" opacity={0.5} />
      {/* little house behind rain */}
      <g fill="var(--adh-ground)" opacity={0.85}>
        <rect x={630} y={300} width={120} height={150} rx={6} />
        <path d="M620 305 L690 245 L760 305 Z" />
      </g>
      <rect x={672} y={360} width={36} height={40} rx={4} fill="#ffe9b8" />
    </svg>
  )
}

export function WarmHomeScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--adh-ground)" h={135} />
      <Hills fill="var(--adh-accent)" h={70} flip />
      {/* moon */}
      <circle cx={640} cy={95} r={40} fill="#ffe9b8" />
      <circle cx={628} cy={86} r={36} fill="var(--adh-sky-top)" opacity={0.55} />
      {/* cozy home */}
      <g>
        <rect x={250} y={240} width={260} height={210} rx={12} fill="var(--adh-ground)" />
        <path d="M230 250 L380 165 L530 250 Z" fill="#7a4a3a" />
        <path d="M230 250 L380 165 L530 250 Z" fill="none" stroke="#5d3429" strokeWidth={6} />
        {/* warm windows */}
        <rect x={300} y={290} width={64} height={58} rx={8} fill="#ffe9b8" />
        <rect x={396} y={290} width={64} height={58} rx={8} fill="#ffe9b8" />
        <rect x={300} y={380} width={64} height={58} rx={8} fill="#ffe9b8" />
        <rect x={300 + 96} y={380} width={64} height={58} rx={8} fill="#ffe9b8" opacity={0.65} />
        <rect x={330} y={272} width={10} height={325 - 272} rx={3} fill="#5d3429" />
        <rect x={366} y={272} width={10} height={325 - 272} rx={3} fill="#5d3429" />
        <rect x={330} y={290} width={46} height={10} rx={3} fill="#5d3429" />
        {[330, 376].map((x) => (
          <line key={x} x1={x + 13} y1={290} x2={x + 13} y2={348} stroke="#5d3429" strokeWidth={6} />
        ))}
        <circle cx={380} cy={258} r={9} fill="#e2636f" opacity={0.9} />
      </g>
      {/* lamp glow posts */}
      <g>
        <rect x={120} y={330} width={8} height={70} rx={3} fill="#7a4a3a" />
        <circle cx={124} cy={322} r={16} fill="#ffd34d" />
        <rect x={650} y={340} width={8} height={64} rx={3} fill="#7a4a3a" />
        <circle cx={654} cy={332} r={16} fill="#ffd34d" />
      </g>
      {/* bushes */}
      <circle cx={690} cy={335} r={30} fill="var(--adh-ground)" opacity={0.9} />
      <circle cx={720} cy={345} r={22} fill="var(--adh-ground)" opacity={0.8} />
    </svg>
  )
}

export function ClassroomScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* floor */}
      <Hills fill="var(--adh-ground)" h={120} />
      <rect x={0} y={360} width={800} height={90} fill="var(--adh-ground)" />
      {/* window with sunlight */}
      <g>
        <rect x={56} y={70} width={170} height={150} rx={10} fill="#dff3ff" stroke="#ffffff" strokeWidth={10} />
        <rect x={56 + 14} y={70 + 14} width={170 - 28} height={150 - 28} rx={4} fill="#e8f8ff" />
        <line x1={56 + 85} y1={70} x2={56 + 85} y2={220} stroke="#ffffff" strokeWidth={10} />
        <line x1={56} y1={70 + 75} x2={226} y2={70 + 75} stroke="#ffffff" strokeWidth={10} />
      </g>
      {/* chalkboard */}
      <g>
        <rect x={250} y={90} width={260} height={170} rx={10} fill="#2f6fa3" />
        <rect x={250 + 10} y={90 + 10} width={260 - 20} height={170 - 20} rx={6} fill="#3f82b8" />
        <path d="M292 150 l26 0 l-13 18 Z" fill="#ffffff" opacity={0.85} />
        <circle cx={420} cy={140} r={10} fill="#ffd34d" />
        <line x1={470} y1={226} x2={455} y2={210} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
        <rect x={250 + 95} y={258} width={70} height={14} rx={4} fill="#e2636f" />
      </g>
      {/* desk + books */}
      <g>
        <rect x={470} y={310} width={180} height={16} rx={6} fill="#8a5a34" />
        <rect x={500} y={326} width={14} height={80} rx={4} fill="#6f4226" />
        <rect x={606} y={326} width={14} height={80} rx={4} fill="#6f4226" />
        <rect x={496} y={282} width={52} height={28} rx={4} fill="#e2636f" />
        <rect x={546} y={272} width={46} height={38} rx={4} fill="#2f6fa3" />
        <rect x={596} y={285} width={40} height={25} rx={4} fill="#f2953f" />
        <path d="M560 340 l14 -26 l14 0 z" fill="#2f9e6b" opacity={0.9} />
      </g>
      {/* paper plane */}
      <g fill="#ffffff">
        <path d="M704 132 l40 8 l-40 16 Z" opacity={0.9} />
        <path d="M704 132 l40 8 l-8 4 Z" fill="#cfe6f5" />
      </g>
    </svg>
  )
}

export function PlaygroundScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--adh-ground)" h={150} />
      <Hills fill="var(--adh-accent)" h={75} flip />
      {/* tree */}
      <g>
        <rect x={92} y={300} width={26} height={110} rx={8} fill="#8a5a34" />
        <circle cx={105} cy={270} r={72} fill="#58b368" />
        <circle cx={60} cy={300} r={48} fill="#4ca55e" />
        <circle cx={150} cy={298} r={52} fill="#62bf74" />
      </g>
      {/* slide */}
      <g>
        <path d="M560 360 L660 220 L676 220 L596 360 Z" fill="#f2953f" />
        <path d="M560 360 L660 220 v-16 l-16 16 z" fill="#3e9a6b" />
        <rect x={566} y={300} width={12} height={60} rx={5} fill="#8a5a34" />
        <rect x={652} y={205} width={14} height={30} rx={5} fill="#8a5a34" />
        <path d="M574 360 q56 -18 112 0 l-8 14 q-48 -12 -96 0 Z" fill="#f2953f" />
      </g>
      {/* swings */}
      <g>
        <path d="M330 210 L300 370 M330 210 L360 370" stroke="#6f4226" strokeWidth={10} strokeLinecap="round" />
        <path d="M300 370 h60" stroke="#4dd0d6" strokeWidth={14} strokeLinecap="round" />
        <path d="M330 210 L362 240 L330 270 Z" fill="#f2953f" />
        {/* seat rope */}
        <line x1={352} y1={332} x2={360} y2={368} stroke="#6f4226" strokeWidth={5} />
        <line x1={308} y1={332} x2={300} y2={368} stroke="#6f4226" strokeWidth={5} />
      </g>
      {/* ball */}
      <circle cx={470} cy={400} r={20} fill="#e2636f" />
      <path d="M470 380 q14 12 0 24 q-14 -12 0 -24" fill="#ffffff" opacity={0.35} />
    </svg>
  )
}

export function FarmScene() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Hills fill="var(--adh-ground)" h={150} />
      <Hills fill="var(--adh-accent)" h={78} flip />
      {/* crop rows */}
      <g fill="var(--adh-accent)" opacity={0.9}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <ellipse key={i} cx={60 + i * 60} cy={382} rx={22} ry={9} />
        ))}
        {[0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5].map((i) => (
          <ellipse key={i} cx={30 + i * 60} cy={414} rx={20} ry={8} opacity={0.7} />
        ))}
      </g>
      {/* barn */}
      <g>
        <rect x={120} y={250} width={170} height={150} rx={8} fill="#e2636f" />
        <path d="M100 258 L205 170 L310 258 Z" fill="#b33a45" />
        <path d="M205 170 L205 250 L100 258 Z" fill="#d9525c" />
        <rect x={185} y={330} width={40} height={70} rx={5} fill="#5d3429" />
        <rect x={185 + 4} y={330 + 6} width={32} height={64} rx={4} fill="#8a5a34" />
        <line x1={185} y1={330} x2={225} y2={330} stroke="#5d3429" strokeWidth={5} />
      </g>
      {/* scarecrow */}
      <g>
        <rect x={430} y={300} width={12} height={90} rx={5} fill="#6f4226" />
        <rect x={376} y={290} width={120} height={18} rx={8} fill="#e2636f" />
        <rect x={410} y={272} width={52} height={34} rx={8} fill="#ffe9b8" />
        <circle cx={436} cy={286} r={3} fill="#5d3429" />
        <path d="M410 336 l26 26 l26 -26" fill="#f2953f" opacity={0.9} />
        <circle cx={436} cy={250} r={6} fill="#f2953f" />
      </g>
      {/* sun */}
      <circle cx={680} cy={110} r={46} fill="var(--adh-accent)" opacity={0.95} />
    </svg>
  )
}