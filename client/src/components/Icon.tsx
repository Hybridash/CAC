import type { ReactNode } from 'react';
import type { CategoryId } from '@bioplay/shared';

/**
 * Bio Bites' cartoon icon set: chunky dark outlines, flat bright fills, a small highlight.
 * Drawn in a 48×48 box so every icon lines up and matches the avatar art style.
 */
const O = '#1e1b2e';
const line = {
  stroke: O,
  strokeWidth: 2.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const shine = (cx: number, cy: number, r = 2.2) => (
  <circle cx={cx} cy={cy} r={r} fill="#fff" opacity=".75" />
);

const ICONS = {
  home: (
    <>
      <path d="M10 22v18h28V22" fill="#fde68a" {...line} />
      <path d="M5 24L24 8l19 16" fill="#f87171" {...line} />
      <rect x="20" y="28" width="8" height="12" rx="2" fill="#b45309" {...line} />
      <rect x="30" y="25" width="5" height="5" rx="1" fill="#bae6fd" stroke={O} strokeWidth="2" />
    </>
  ),
  book: (
    <>
      <path d="M24 13c-5-4-12-4-18-2v26c6-2 13-2 18 2z" fill="#e0e7ff" {...line} />
      <path d="M24 13c5-4 12-4 18-2v26c-6-2-13-2-18 2z" fill="#c7d2fe" {...line} />
      <path
        d="M11 18h8M11 23h8M29 18h8M29 23h8"
        stroke="#0e7c6b"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  map: (
    <>
      <path d="M6 12l11-4 14 4 11-4v28l-11 4-14-4-11 4z" fill="#a7f3d0" {...line} />
      <path d="M17 8v28M31 12v28" stroke={O} strokeWidth="2" />
      <path d="M24 30c-4-5-6-8-6-11a6 6 0 0112 0c0 3-2 6-6 11z" fill="#ef4444" {...line} />
      <circle cx="24" cy="19" r="2.2" fill="#fff" />
    </>
  ),
  mystery: (
    <>
      <circle cx="20" cy="20" r="12" fill="#bae6fd" {...line} />
      <path d="M29 29l11 11" stroke={O} strokeWidth="6" strokeLinecap="round" />
      <path d="M29 29l11 11" stroke="#a16207" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M16.5 16.5a3.6 3.6 0 117 1.2c-1 1.4-3.5 1.8-3.5 4.3"
        fill="none"
        stroke="#4338ca"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="26" r="1.7" fill="#4338ca" />
      {shine(14, 14)}
    </>
  ),
  bag: (
    <>
      <path d="M9 16h30l-3 24H12z" fill="#f472b6" {...line} />
      <path d="M17 19v-5a7 7 0 0114 0v5" fill="none" {...line} />
      <path d="M17 27h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".8" />
    </>
  ),
  cards: (
    <>
      <rect
        x="7"
        y="11"
        width="20"
        height="28"
        rx="4"
        transform="rotate(-12 17 25)"
        fill="#c4b5fd"
        {...line}
      />
      <rect
        x="20"
        y="9"
        width="20"
        height="28"
        rx="4"
        transform="rotate(10 30 23)"
        fill="#fde68a"
        {...line}
      />
      <path
        d="M30 17l1.8 3.8 4.2.5-3 2.9.8 4.1-3.8-2-3.8 2 .8-4.1-3-2.9 4.2-.5z"
        fill="#f59e0b"
        stroke={O}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </>
  ),
  speaker: (
    <>
      <path d="M8 19h7l10-8v26l-10-8H8z" fill="#fde68a" {...line} />
      <path d="M31 18c3 3 3 9 0 12M35 14c5 5 5 15 0 20" fill="none" {...line} />
    </>
  ),
  speakerOff: (
    <>
      <path d="M8 19h7l10-8v26l-10-8H8z" fill="#e2e8f0" {...line} />
      <path d="M31 19l9 10M40 19l-9 10" {...line} />
    </>
  ),
  dice: (
    <>
      <rect x="9" y="9" width="30" height="30" rx="8" fill="#fff" {...line} />
      {[
        [17, 17],
        [31, 17],
        [24, 24],
        [17, 31],
        [31, 31],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2.8" fill="#ef4444" />
      ))}
    </>
  ),
  sun: (
    <>
      <g {...line}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={24 + Math.cos(a) * 14}
              y1={24 + Math.sin(a) * 14}
              x2={24 + Math.cos(a) * 20}
              y2={24 + Math.sin(a) * 20}
            />
          );
        })}
      </g>
      <circle cx="24" cy="24" r="10" fill="#fde047" {...line} />
      {shine(20, 20)}
    </>
  ),
  sparkle: (
    <>
      <path
        d="M22 6c1 9 3 12 12 13-9 1-11 4-12 13-1-9-3-12-12-13 9-1 11-4 12-13z"
        fill="#fde047"
        {...line}
      />
      <path
        d="M37 29c.5 4 1.5 5 5 5.5-3.5.5-4.5 1.5-5 5.5-.5-4-1.5-5-5-5.5 3.5-.5 4.5-1.5 5-5.5z"
        fill="#f9a8d4"
        stroke={O}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
  gem: (
    <>
      <path d="M14 10h20l7 10-17 20L7 20z" fill="#e879f9" {...line} />
      <path
        d="M7 20h34M18 10l-4 10 10 20 10-20-4-10"
        fill="none"
        stroke={O}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
  flame: (
    <>
      <path
        d="M24 42c-9 0-14-6-14-13 0-8 7-11 8-19 4 3 5 7 5 10 2-2 3-4 3-7 6 4 12 10 12 16 0 7-5 13-14 13z"
        fill="#fb923c"
        {...line}
      />
      <path
        d="M24 42c-4 0-7-3-7-7 0-4 4-6 5-10 3 3 9 5 9 10 0 4-3 7-7 7z"
        fill="#fde047"
        stroke={O}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
  trophy: (
    <>
      <path d="M15 8h18v10a9 9 0 01-18 0z" fill="#facc15" {...line} />
      <path d="M15 12H9a5 5 0 006 7M33 12h6a5 5 0 01-6 7" fill="none" {...line} />
      <path d="M21 27h6v6h-6zM15 40l3-7h12l3 7z" fill="#f59e0b" {...line} />
      {shine(20, 13)}
    </>
  ),
  lock: (
    <>
      <path
        d="M16 21v-5a8 8 0 0116 0v5"
        fill="none"
        stroke={O}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="11" y="21" width="26" height="20" rx="5" fill="#94a3b8" {...line} />
      <circle cx="24" cy="30" r="3" fill={O} />
      <path d="M24 31v5" stroke={O} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  check: (
    <>
      <circle cx="24" cy="24" r="17" fill="#22c55e" {...line} />
      <path
        d="M16 24l6 6 11-12"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  todo: (
    <circle
      cx="24"
      cy="24"
      r="16"
      fill="#fff"
      stroke="#94a3b8"
      strokeWidth="3"
      strokeDasharray="5 4"
    />
  ),
  bulb: (
    <>
      <path d="M17 30c-3-3-5-6-5-10a12 12 0 0124 0c0 4-2 7-5 10v4H17z" fill="#fde047" {...line} />
      <path d="M17 38h14M19 42h10" {...line} />
      <path d="M21 26l3 3 3-3" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      {shine(19, 15)}
    </>
  ),
  chat: (
    <>
      <path d="M8 12h32v20H22l-9 7v-7H8z" fill="#fff" {...line} />
      <circle cx="17" cy="22" r="2.3" fill="#0e7c6b" />
      <circle cx="24" cy="22" r="2.3" fill="#0e7c6b" />
      <circle cx="31" cy="22" r="2.3" fill="#0e7c6b" />
    </>
  ),
  party: (
    <>
      <path d="M8 40l8-24 16 16z" fill="#8fb1ce" {...line} />
      <path d="M12 28l8 8M14 22l12 12" stroke="#fde047" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M28 10l2 4M36 14l-3 3M38 24l-4-1" {...line} />
      <circle cx="40" cy="8" r="2" fill="#f472b6" />
      <circle cx="22" cy="8" r="2" fill="#22c55e" />
      <circle cx="42" cy="32" r="2" fill="#38bdf8" />
    </>
  ),
  pointer: <path d="M6 18h20V9l16 15-16 15v-9H6z" fill="#3fa692" {...line} />,
  star: (
    <>
      <path
        d="M24 6l5.5 11.5 12.5 1.6-9.2 8.7 2.3 12.4L24 34.2 12.9 40.2l2.3-12.4-9.2-8.7 12.5-1.6z"
        fill="#facc15"
        {...line}
      />
      {shine(19, 17)}
    </>
  ),
  phone: (
    <>
      <rect x="13" y="5" width="22" height="38" rx="5" fill="#e0e7ff" {...line} />
      <path
        d="M24 13v14M18 22l6 6 6-6"
        fill="none"
        stroke="#0e7c6b"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 37h8" {...line} />
    </>
  ),
  clock: (
    <>
      <circle cx="24" cy="24" r="17" fill="#fff" {...line} />
      <path d="M24 13v11l7 5" fill="none" {...line} />
    </>
  ),
  refresh: (
    <>
      <path
        d="M37 17A15 15 0 109 26"
        fill="none"
        stroke={O}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M38 8v10H28"
        fill="none"
        stroke={O}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  play: <path d="M15 9l24 15-24 15z" fill="#22c55e" {...line} />,
  pause: (
    <>
      <rect x="12" y="10" width="9" height="28" rx="2.5" fill="#94a3b8" {...line} />
      <rect x="27" y="10" width="9" height="28" rx="2.5" fill="#94a3b8" {...line} />
    </>
  ),
  bolt: <path d="M27 5L10 27h12l-3 16 18-23H25z" fill="#facc15" {...line} />,
  clipboard: (
    <>
      <rect x="10" y="9" width="28" height="34" rx="4" fill="#fef3c7" {...line} />
      <rect x="17" y="5" width="14" height="8" rx="3" fill="#a16207" {...line} />
      <path
        d="M16 22h16M16 29h16M16 36h9"
        stroke="#a16207"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </>
  ),
  warning: (
    <>
      <path d="M24 6l20 34H4z" fill="#fde047" {...line} />
      <path d="M24 18v10" {...line} />
      <circle cx="24" cy="34" r="2" fill={O} />
    </>
  ),
  target: (
    <>
      <circle cx="24" cy="24" r="17" fill="#fff" {...line} />
      <circle cx="24" cy="24" r="11" fill="#f87171" stroke={O} strokeWidth="2" />
      <circle cx="24" cy="24" r="5" fill="#fff" stroke={O} strokeWidth="2" />
    </>
  ),
  medal: (
    <>
      <path d="M16 4l6 14M32 4l-6 14" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
      <circle cx="24" cy="29" r="12" fill="#facc15" {...line} />
      <path
        d="M24 22l2 4.5 4.6.5-3.4 3 1 4.6-4.2-2.4-4.2 2.4 1-4.6-3.4-3 4.6-.5z"
        fill="#f59e0b"
        stroke={O}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </>
  ),
  pill: (
    <g transform="rotate(-35 24 24)">
      <path d="M24 16H14a8 8 0 000 16h10z" fill="#ef4444" />
      <path d="M24 16h10a8 8 0 010 16H24z" fill="#fff" />
      <rect x="6" y="16" width="36" height="16" rx="8" fill="none" {...line} />
      <path d="M24 16v16" stroke={O} strokeWidth="2.2" />
      <path d="M12 21h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".7" />
    </g>
  ),
  faceHappy: (
    <>
      <circle cx="24" cy="24" r="18" fill="#fde047" {...line} />
      <circle cx="18" cy="20" r="2.4" fill={O} />
      <circle cx="30" cy="20" r="2.4" fill={O} />
      <path d="M15 27q9 9 18 0" fill="none" stroke={O} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  faceOk: (
    <>
      <circle cx="24" cy="24" r="18" fill="#fde68a" {...line} />
      <circle cx="18" cy="21" r="2.4" fill={O} />
      <circle cx="30" cy="21" r="2.4" fill={O} />
      <path d="M17 31h14" stroke={O} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  faceSick: (
    <>
      <circle cx="24" cy="24" r="18" fill="#bef264" {...line} />
      <path d="M15 20l5 2M33 20l-5 2" stroke={O} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M17 33q7-5 14 0" fill="none" stroke={O} strokeWidth="2.6" strokeLinecap="round" />
      <rect
        x="31"
        y="27"
        width="14"
        height="5"
        rx="2.5"
        transform="rotate(-25 38 29)"
        fill="#fff"
        stroke={O}
        strokeWidth="2"
      />
      <rect
        x="40"
        y="23"
        width="4"
        height="5"
        rx="1"
        transform="rotate(-25 42 25)"
        fill="#ef4444"
      />
    </>
  ),
  stop: (
    <>
      <path d="M17 5h14l12 12v14L31 43H17L5 31V17z" fill="#ef4444" {...line} />
      <path d="M14 24h20" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  skull: (
    <>
      <path
        d="M24 6c-9 0-15 6-15 14 0 5 2 8 5 10v6h20v-6c3-2 5-5 5-10 0-8-6-14-15-14z"
        fill="#f1f5f9"
        {...line}
      />
      <circle cx="18" cy="21" r="4" fill={O} />
      <circle cx="30" cy="21" r="4" fill={O} />
      <path d="M24 26l-2 4h4z" fill={O} />
      <path d="M19 36v5M24 36v5M29 36v5" stroke={O} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  noEntry: (
    <>
      <circle cx="24" cy="24" r="18" fill="#ef4444" {...line} />
      <path d="M12 24h24" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  battery: (
    <>
      <rect x="6" y="14" width="32" height="20" rx="4" fill="#fff" {...line} />
      <rect x="38" y="20" width="5" height="8" rx="1.5" fill={O} />
      <rect x="10" y="18" width="24" height="12" rx="2" fill="#22c55e" />
      <path
        d="M23 18l-4 7h5l-3 5"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  scissors: (
    <>
      <circle cx="13" cy="35" r="6" fill="#fda4af" {...line} />
      <circle cx="35" cy="35" r="6" fill="#fda4af" {...line} />
      <path
        d="M17 30L34 7M31 30L14 7"
        fill="none"
        stroke={O}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M17 30L34 7M31 30L14 7"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </>
  ),
  // ---- category icons
  microscope: (
    <>
      <path d="M10 41h28" {...line} />
      <path d="M14 41c0-7 4-12 11-13" fill="none" {...line} />
      <rect
        x="20"
        y="7"
        width="9"
        height="20"
        rx="3"
        transform="rotate(-20 24 17)"
        fill="#34d399"
        {...line}
      />
      <rect x="22" y="30" width="12" height="5" rx="2" fill="#94a3b8" {...line} />
      <circle cx="31" cy="27" r="3" fill="#bae6fd" stroke={O} strokeWidth="2" />
    </>
  ),
  dna: (
    <>
      <path
        d="M15 6c18 6-18 12 0 18s-18 12 0 18"
        fill="none"
        stroke={O}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M33 6c-18 6 18 12 0 18s18 12 0 18"
        fill="none"
        stroke={O}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M15 6c18 6-18 12 0 18s-18 12 0 18"
        fill="none"
        stroke="#8fb1ce"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M33 6c-18 6 18 12 0 18s18 12 0 18"
        fill="none"
        stroke="#f472b6"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M19 15h10M19 33h10" stroke={O} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  flask: (
    <>
      <path d="M19 6h10M20 6v12L9 38a3 3 0 003 4h24a3 3 0 003-4L28 18V6" fill="#fff" {...line} />
      <path d="M13.5 30h21L38 37.5a2.5 2.5 0 01-2.3 3.5H12.3A2.5 2.5 0 0110 37.5z" fill="#fbbf24" />
      <path d="M19 6h10M20 6v12L9 38a3 3 0 003 4h24a3 3 0 003-4L28 18V6" fill="none" {...line} />
      <circle cx="21" cy="35" r="2" fill="#fff" />
      <circle cx="27" cy="33" r="1.4" fill="#fff" />
    </>
  ),
  heart: (
    <>
      <path
        d="M24 41S7 30 7 18a9 9 0 0117-4 9 9 0 0117 4c0 12-17 23-17 23z"
        fill="#fb7185"
        {...line}
      />
      {shine(15, 16, 2.6)}
    </>
  ),
  brain: (
    <>
      <path
        d="M12 30c-5-2-6-10-1-12 0-6 7-9 11-6 3-4 11-3 12 3 5 1 7 8 3 11 1 6-5 10-11 7-4 4-12 2-14-3z"
        fill="#f9a8d4"
        {...line}
      />
      <path
        d="M24 13v26M17 20c3 1 4 4 2 6M31 20c-3 1-4 4-2 6"
        fill="none"
        stroke="#be185d"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  shield: (
    <>
      <path d="M24 5l16 6v11c0 10-7 17-16 21C15 39 8 32 8 22V11z" fill="#60a5fa" {...line} />
      <path d="M24 16v14M17 23h14" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  microbe: (
    <>
      <path d="M38 30c4 2 4 6 8 6" fill="none" {...line} />
      <rect x="6" y="14" width="34" height="20" rx="10" fill="#a3e635" {...line} />
      <circle cx="15" cy="22" r="2.6" fill="#65a30d" />
      <circle cx="24" cy="27" r="2" fill="#65a30d" />
      <circle cx="31" cy="21" r="2.3" fill="#65a30d" />
      {shine(12, 19, 1.8)}
    </>
  ),
  sprout: (
    <>
      <path d="M24 42V22" {...line} />
      <path d="M24 26c-10 1-15-5-14-12 9-1 15 4 14 12z" fill="#4ade80" {...line} />
      <path d="M24 22c8 0 13-5 12-11-8-1-13 3-12 11z" fill="#86efac" {...line} />
      <path d="M12 42h24" {...line} />
    </>
  ),
  dino: (
    <>
      <path
        d="M8 38c2-8 6-12 14-12h8c3 0 5-3 5-7V12c0-3 2-5 5-5s4 2 4 4-2 3-4 3v6c0 9-4 15-12 16"
        fill="#fb923c"
        {...line}
      />
      <path d="M12 38v-5M20 38v-6M28 38v-5" {...line} />
      <path d="M8 38c0-3 1-5 2-6L4 34" fill="none" {...line} />
      <circle cx="40" cy="10" r="1.4" fill={O} />
    </>
  ),
  globe: (
    <>
      <circle cx="24" cy="24" r="17" fill="#38bdf8" {...line} />
      <path
        d="M14 14c4 1 5 4 3 6s1 5 4 5 3 4 1 7M30 9c-1 3 2 5 4 5s4 3 3 6M30 32c3-1 5 1 6 3"
        fill="none"
        stroke="#16a34a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {shine(17, 15)}
    </>
  ),
  egg: (
    <>
      <path d="M24 6c-9 0-15 15-15 23a15 15 0 0030 0c0-8-6-23-15-23z" fill="#fef3c7" {...line} />
      <path
        d="M13 27l5-3 4 4 5-4 4 3 5-3"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {shine(18, 16, 2.4)}
    </>
  ),
  octopus: (
    <>
      <path
        d="M12 30c-3 4-6 6-8 6M18 33c-1 4-3 7-5 8M30 33c1 4 3 7 5 8M36 30c3 4 6 6 8 6M24 34v8"
        fill="none"
        stroke={O}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M12 30c-3 4-6 6-8 6M18 33c-1 4-3 7-5 8M30 33c1 4 3 7 5 8M36 30c3 4 6 6 8 6M24 34v8"
        fill="none"
        stroke="#e879f9"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M10 26c0-12 6-20 14-20s14 8 14 20c-4 6-24 6-28 0z" fill="#e879f9" {...line} />
      <circle cx="19" cy="20" r="2.2" fill={O} />
      <circle cx="29" cy="20" r="2.2" fill={O} />
    </>
  ),
  // ---- lesson props
  candy: (
    <>
      <path d="M8 18l-5-4v20l5-4M40 18l5-4v20l-5-4" fill="#f87171" {...line} />
      <rect x="8" y="15" width="32" height="18" rx="3" fill="#7c2d12" {...line} />
      <rect x="14" y="15" width="20" height="18" fill="#ef4444" stroke={O} strokeWidth="2" />
      <path d="M18 22h12M18 27h8" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  soda: (
    <>
      <path d="M30 4l-3 9" {...line} />
      <path d="M13 13h22l-3 29H16z" fill="#ef4444" {...line} />
      <path d="M15 22h18" stroke="#fff" strokeWidth="5" />
      <path d="M13 13h22" {...line} />
      <path d="M15 22h18" stroke={O} strokeWidth="1.4" opacity=".3" />
    </>
  ),
  bread: (
    <>
      <path d="M10 40V22c-4-2-4-12 4-13 4-4 16-4 20 0 8 1 8 11 4 13v18z" fill="#fde68a" {...line} />
      <path
        d="M14 24c-2-1-2-6 2-7 3-3 13-3 16 0 4 1 4 6 2 7v12H14z"
        fill="#fffbeb"
        stroke="#d97706"
        strokeWidth="1.6"
      />
    </>
  ),
  oatmeal: (
    <>
      <path d="M6 22h36c0 11-8 18-18 18S6 33 6 22z" fill="#93c5fd" {...line} />
      <path d="M8 22c3-5 9-7 16-7s13 2 16 7" fill="#fde68a" {...line} />
      <circle cx="18" cy="19" r="1.6" fill="#a16207" />
      <circle cx="26" cy="18" r="1.6" fill="#a16207" />
      <circle cx="31" cy="20" r="1.6" fill="#345a80" />
      <path d="M33 8l-6 12" stroke="#94a3b8" strokeWidth="3.4" strokeLinecap="round" />
    </>
  ),
  apple: (
    <>
      <path
        d="M24 14c-6-4-16-2-16 10 0 10 7 18 12 18 2 0 3-1 4-1s2 1 4 1c5 0 12-8 12-18 0-12-10-14-16-10z"
        fill="#ef4444"
        {...line}
      />
      <path d="M24 14c0-4 1-7 3-9" fill="none" {...line} />
      <path d="M26 9c3-4 8-4 10-2-2 3-6 4-10 2z" fill="#22c55e" {...line} />
      {shine(15, 22, 2.6)}
    </>
  ),
  salad: (
    <>
      <path d="M8 18c-2-6 6-8 8-4 1-5 9-6 10-1 3-5 11-2 9 3 5-1 7 5 3 7" fill="#4ade80" {...line} />
      <circle cx="18" cy="19" r="3" fill="#ef4444" stroke={O} strokeWidth="2" />
      <circle cx="29" cy="19" r="2.6" fill="#facc15" stroke={O} strokeWidth="2" />
      <path d="M5 23h38c0 10-8 17-19 17S5 33 5 23z" fill="#fff" {...line} />
    </>
  ),
  steak: (
    <>
      <path
        d="M8 22c0-9 10-13 20-12 11 1 14 9 12 16-2 9-12 12-20 10C12 34 8 30 8 22z"
        fill="#be123c"
        {...line}
      />
      <path d="M30 19a5 5 0 11-1 10 5 5 0 011-10z" fill="#fde68a" stroke={O} strokeWidth="2" />
      <path
        d="M14 20c4-2 8-3 12-2"
        fill="none"
        stroke="#fda4af"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </>
  ),
  sneaker: (
    <>
      <path d="M6 34c0-6 2-14 6-16 4 3 9 3 12 0l8 10c4 1 11 2 11 6v4H6z" fill="#38bdf8" {...line} />
      <path d="M6 34h37v4H6z" fill="#fff" {...line} />
      <path d="M17 24l3 3M21 22l3 3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  syringe: (
    <>
      <path d="M33 6l9 9M37.5 10.5l-6 6" {...line} />
      <rect
        x="15"
        y="12"
        width="10"
        height="24"
        rx="2"
        transform="rotate(45 20 24)"
        fill="#e0f2fe"
        {...line}
      />
      <path d="M16 23l9 9" stroke="#38bdf8" strokeWidth="6" />
      <path d="M11 37l-6 6" {...line} />
    </>
  ),
  virus: (
    <>
      <g stroke={O} strokeWidth="2.4" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={24 + Math.cos(a) * 12}
              y1={24 + Math.sin(a) * 12}
              x2={24 + Math.cos(a) * 19}
              y2={24 + Math.sin(a) * 19}
            />
          );
        })}
      </g>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={24 + Math.cos(a) * 19}
            cy={24 + Math.sin(a) * 19}
            r="3"
            fill="#f87171"
            stroke={O}
            strokeWidth="2"
          />
        );
      })}
      <circle cx="24" cy="24" r="12" fill="#fb7185" {...line} />
      <circle cx="20" cy="22" r="2" fill={O} />
      <circle cx="28" cy="22" r="2" fill={O} />
      <path d="M20 29q4-3 8 0" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  grass: (
    <>
      <path
        d="M6 42c2-12 4-20 2-28 4 6 6 14 6 28M16 42c0-14 2-24 6-32 0 10 0 20 2 32M26 42c2-12 6-20 12-26-3 8-4 16-4 26M36 42c0-8 2-14 6-18"
        fill="#4ade80"
        {...line}
      />
      <path d="M4 42h40" {...line} />
    </>
  ),
  grasshopper: (
    <>
      <path d="M14 32l-6 8M22 34l-2 7M30 24l10 4-4 12" fill="none" {...line} />
      <path
        d="M8 27c0-5 6-9 16-9h6c5 0 9 3 9 6s-3 6-8 6H16c-5 0-8-1-8-3z"
        fill="#84cc16"
        {...line}
      />
      <circle cx="34" cy="21" r="5" fill="#a3e635" {...line} />
      <circle cx="35.5" cy="20" r="1.4" fill={O} />
      <path d="M36 16c2-5 6-7 9-7" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  frog: (
    <>
      <path d="M6 40c0-10 8-17 18-17s18 7 18 17z" fill="#4ade80" {...line} />
      <circle cx="16" cy="20" r="6" fill="#4ade80" {...line} />
      <circle cx="32" cy="20" r="6" fill="#4ade80" {...line} />
      <circle cx="16" cy="20" r="2.6" fill={O} />
      <circle cx="32" cy="20" r="2.6" fill={O} />
      <path d="M16 32q8 5 16 0" fill="none" stroke={O} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  snake: (
    <>
      <path
        d="M8 38c8 0 8-8 16-8s8 8 16 8M12 24c0-6 6-10 12-10"
        fill="none"
        stroke={O}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M8 38c8 0 8-8 16-8s8 8 16 8"
        fill="none"
        stroke="#22c55e"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M24 30c0-6-12-6-12-6" fill="none" stroke={O} strokeWidth="9" strokeLinecap="round" />
      <path
        d="M24 30c0-6-12-6-12-6"
        fill="none"
        stroke="#22c55e"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse cx="12" cy="19" rx="7" ry="5.5" fill="#22c55e" {...line} />
      <circle cx="10" cy="18" r="1.5" fill={O} />
      <path
        d="M5 21l-3 1 3 1"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  ),
  hawk: (
    <>
      <path
        d="M24 20C16 10 8 10 3 14c7 1 10 6 12 10M24 20c8-10 16-10 21-6-7 1-10 6-12 10"
        fill="#a16207"
        {...line}
      />
      <path d="M17 22c0-6 3-10 7-10s7 4 7 10v8l-7 8-7-8z" fill="#d97706" {...line} />
      <circle cx="24" cy="15" r="4.5" fill="#fef3c7" {...line} />
      <path d="M24 17l2 3h-3" fill="#facc15" stroke={O} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="22.5" cy="14.5" r="1.2" fill={O} />
    </>
  ),
  mushroom: (
    <>
      <rect x="18" y="24" width="12" height="16" rx="4" fill="#fef3c7" {...line} />
      <path d="M6 26C6 14 14 7 24 7s18 7 18 19z" fill="#ef4444" {...line} />
      <circle cx="16" cy="17" r="2.6" fill="#fff" />
      <circle cx="27" cy="13" r="2.2" fill="#fff" />
      <circle cx="33" cy="20" r="2.4" fill="#fff" />
    </>
  ),
  kidA: (
    <>
      <path d="M9 44c0-9 7-14 15-14s15 5 15 14z" fill="#38bdf8" {...line} />
      <circle cx="24" cy="19" r="11" fill="#d6a37c" {...line} />
      <path
        d="M13 17c1-8 7-10 11-10s10 2 11 10c-4-3-8-4-11-4s-7 1-11 4z"
        fill="#3f2a1d"
        {...line}
      />
      <circle cx="20" cy="20" r="1.6" fill={O} />
      <circle cx="28" cy="20" r="1.6" fill={O} />
      <path d="M20 25q4 3 8 0" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  kidB: (
    <>
      <path d="M9 44c0-9 7-14 15-14s15 5 15 14z" fill="#8fb1ce" {...line} />
      <circle cx="24" cy="19" r="11" fill="#fcd7b6" {...line} />
      <path
        d="M12 21c-1-10 5-14 12-14s13 4 12 14c-2-4-5-7-9-7-1 3-4 4-8 4-3 0-5 1-7 3z"
        fill="#ea580c"
        {...line}
      />
      <circle cx="20" cy="21" r="1.6" fill={O} />
      <circle cx="28" cy="21" r="1.6" fill={O} />
      <path d="M20 26q4 3 8 0" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 24,
  className = '',
  label,
  x,
  y,
}: {
  name: IconName;
  size?: number;
  className?: string;
  label?: string;
  /** Position when nested inside another SVG. */
  x?: number;
  y?: number;
}) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`inline-block shrink-0 align-middle ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {ICONS[name]}
    </svg>
  );
}

export const CATEGORY_ICON: Record<CategoryId, IconName> = {
  cell: 'microscope',
  genetics: 'dna',
  biochem: 'flask',
  physiology: 'heart',
  neuro: 'brain',
  immunology: 'shield',
  microbes: 'microbe',
  plants: 'sprout',
  evolution: 'dino',
  ecology: 'globe',
  development: 'egg',
  weird: 'octopus',
};

/** Topic art: the redrawn line set. See `CategoryArt`. */
export { CategoryArt as CategoryIcon } from './CategoryArt';

/** A checklist item used by lessons to show goals. */
export function GoalItem({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <li
      className={`chip gap-1.5 py-1 ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-ink-soft'}`}
    >
      <Icon name={done ? 'check' : 'todo'} size={18} />
      {children}
      <span className="sr-only">{done ? ' (done)' : ' (not done yet)'}</span>
    </li>
  );
}
