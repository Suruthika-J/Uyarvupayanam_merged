// Original cartoon guide for the Science Adventure — Young Scientist Tara in
// a white lab coat and goggles, plus a tiny robot assistant "Bo". Original
// artwork, no photographs.

export function ScienceGuide({ className = '', bot = true }) {
  return (
    <svg className={`sci-guide ${className}`} viewBox="0 0 64 64" role="img" aria-label="Young scientist Tara">
      <circle cx="32" cy="17" r="10" fill="#e6aa6a" stroke="#a06a3a" strokeWidth="2.4" />
      <path d="M24 12 Q32 3 40 12 Q44 8 37 6 Q33 3 29 5 Q25 8 24 12 Z" fill="#5d4037" />
      <path d="M31 7 L33 11 M33 8 L37 8 M31 10 L29 12" stroke="#5d4037" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="28.5" cy="16" r="1.8" fill="#2f3a1f" />
      <circle cx="35.5" cy="16" r="1.8" fill="#2f3a1f" />
      <path d="M27 23 Q32 26 37 23" stroke="#a06a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M23 27 Q21 40 25 52 L30 52 L30 40 L32 46 L33 34 L36 52 L42 52 Q46 40 42 27 Z" fill="#ffffff" stroke="#c9d4de" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M30 52 Q28 58 24 60 Q26 62 32 62 Q38 62 40 60 Q36 58 34 52 Z" fill="#5d8a8a" stroke="#2c5353" strokeWidth="1.8" />
      <circle cx="32" cy="50" r="4" fill="#ffb74d" stroke="#b06a00" strokeWidth="1.6" />
      <g transform="rotate(-18 48 46)">
        <circle cx="48" cy="46" r="8" fill="none" stroke="#7a6a5a" strokeWidth="2.6" />
        <path d="M52 50 L58 56" stroke="#7a6a5a" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {bot ? (
        <g transform="translate(8 40)">
          <rect x="0" y="4" width="14" height="12" rx="4" fill="#90caf9" stroke="#33608f" strokeWidth="2" />
          <circle cx="4.5" cy="10" r="2.2" fill="#ffffff" />
          <circle cx="9.5" cy="10" r="2.2" fill="#ffffff" />
          <rect x="4" y="16" width="6" height="6" rx="2" fill="#6488af" />
          <path d="M-3 6 L0 8 M-3 14 L0 12" stroke="#33608f" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M17 8 L14 10 M17 12 L14 10" stroke="#33608f" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ) : null}
    </svg>
  )
}

export default ScienceGuide