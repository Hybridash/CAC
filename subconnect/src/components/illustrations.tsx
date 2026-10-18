/**
 * SubConnect illustration set.
 * Flat, soft, cartoon-style drawings built only from the app palette so the style stays uniform.
 * Pass `title` for meaningful images (rendered as accessible alt text); omit it for decorative use.
 */
import type { ReactNode } from "react";

const C = {
  ground: "#eceee9",
  blob: "#e9eef6",
  blue: "#c9d6ea",
  mid: "#8fa7cb",
  primary: "#3f5f8f",
  paper: "#ffffff",
  line: "#d5dae1",
  gray: "#9aa3ad",
  dark: "#4a5560",
  accent: "#d9a98f",
  accentDeep: "#a4532f",
  skin: "#e6c3a5",
  hair: "#5b4a42",
  wood: "#c8b49b",
  green: "#a9c4b2",
};

function Svg({ title, children, viewBox = "0 0 200 160" }: { title?: string; children: ReactNode; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} className="h-auto w-full" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

const Ground = () => <ellipse cx="100" cy="146" rx="82" ry="9" fill={C.ground} />;

export function BookIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="76" r="62" fill={C.blob} />
      <Ground />
      <path d="M100 52 C82 42 58 42 40 48 V124 C58 118 82 118 100 128 Z" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <path d="M100 52 C118 42 142 42 160 48 V124 C142 118 118 118 100 128 Z" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <path d="M100 52 V128" stroke={C.mid} strokeWidth="2" />
      {[64, 76, 88, 100].map((y) => (
        <g key={y}>
          <path d={`M52 ${y} C64 ${y - 4} 78 ${y - 4} 90 ${y}`} stroke={C.blue} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d={`M110 ${y} C122 ${y - 4} 136 ${y - 4} 148 ${y}`} stroke={C.blue} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      ))}
      <path d="M128 40 v26 l6 -5 l6 5 v-26 z" fill={C.accent} />
    </Svg>
  );
}

export function ChalkboardIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="74" r="62" fill={C.blob} />
      <Ground />
      <path d="M62 112 L52 146 M138 112 L148 146" stroke={C.wood} strokeWidth="5" strokeLinecap="round" />
      <rect x="36" y="30" width="128" height="86" rx="6" fill={C.wood} />
      <rect x="43" y="37" width="114" height="72" rx="3" fill="#5f7a72" />
      <path d="M55 56 h40 M55 70 h58 M55 84 h30" stroke="#e8ede9" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <path d="M122 60 l8 8 l14 -16" stroke="#e8ede9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
      <rect x="70" y="112" width="60" height="5" rx="2" fill={C.wood} />
      <rect x="82" y="108" width="14" height="4" rx="1.5" fill={C.paper} />
    </Svg>
  );
}

export function TeacherDeskIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="72" r="62" fill={C.blob} />
      <Ground />
      {/* person */}
      <path d="M72 108 C72 84 84 74 100 74 C116 74 128 84 128 108 Z" fill={C.primary} />
      <circle cx="100" cy="56" r="15" fill={C.skin} />
      <path d="M85 54 C85 40 115 38 116 54 C112 47 98 46 85 54 Z" fill={C.hair} />
      <circle cx="94" cy="58" r="1.6" fill={C.dark} />
      <circle cx="106" cy="58" r="1.6" fill={C.dark} />
      <path d="M96 64 q4 3 8 0" stroke={C.dark} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* desk */}
      <rect x="40" y="104" width="120" height="10" rx="3" fill={C.wood} />
      <rect x="48" y="114" width="8" height="30" fill={C.wood} />
      <rect x="144" y="114" width="8" height="30" fill={C.wood} />
      {/* laptop and apple */}
      <path d="M106 104 l6 -22 h30 l-6 22 z" fill={C.gray} />
      <circle cx="124" cy="93" r="3" fill={C.paper} opacity="0.7" />
      <rect x="58" y="92" width="26" height="12" rx="2" fill={C.paper} stroke={C.line} />
      <circle cx="152" cy="98" r="6" fill={C.accent} />
      <path d="M152 92 q2 -4 5 -4" stroke={C.green} strokeWidth="2" fill="none" />
    </Svg>
  );
}

export function CalendarIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="74" r="62" fill={C.blob} />
      <Ground />
      <rect x="48" y="36" width="104" height="100" rx="10" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <path d="M48 46 a10 10 0 0 1 10 -10 h84 a10 10 0 0 1 10 10 v14 h-104 z" fill={C.primary} />
      <rect x="68" y="28" width="6" height="16" rx="3" fill={C.dark} />
      <rect x="126" y="28" width="6" height="16" rx="3" fill={C.dark} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => (
          <rect key={`${r}-${c}`} x={60 + c * 17} y={70 + r * 15} width="11" height="9" rx="2" fill={r === 1 && c === 2 ? C.accent : C.blue} />
        )),
      )}
    </Svg>
  );
}

export function ChatIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="74" r="62" fill={C.blob} />
      <Ground />
      <path d="M38 44 h78 a10 10 0 0 1 10 10 v34 a10 10 0 0 1 -10 10 h-56 l-14 14 v-14 h-8 a10 10 0 0 1 -10 -10 v-34 a10 10 0 0 1 10 -10 z" fill={C.primary} />
      <path d="M52 64 h52 M52 78 h36" stroke={C.paper} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <path d="M92 82 h62 a10 10 0 0 1 10 10 v26 a10 10 0 0 1 -10 10 h-4 v12 l-12 -12 h-46 a10 10 0 0 1 -10 -10 v-26 a10 10 0 0 1 10 -10 z" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <circle cx="112" cy="105" r="4" fill={C.accent} />
      <circle cx="126" cy="105" r="4" fill={C.accent} />
      <circle cx="140" cy="105" r="4" fill={C.accent} />
    </Svg>
  );
}

export function FilesIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="74" r="62" fill={C.blob} />
      <Ground />
      <rect x="70" y="30" width="70" height="90" rx="6" fill={C.paper} stroke={C.line} strokeWidth="2" transform="rotate(8 105 75)" />
      <path d="M44 56 a6 6 0 0 1 6 -6 h30 l8 10 h62 a6 6 0 0 1 6 6 v64 a6 6 0 0 1 -6 6 h-100 a6 6 0 0 1 -6 -6 z" fill={C.mid} />
      <path d="M44 72 a6 6 0 0 1 6 -6 h106 a6 6 0 0 1 6 6 v58 a6 6 0 0 1 -6 6 h-106 a6 6 0 0 1 -6 -6 z" fill={C.primary} />
      <rect x="86" y="92" width="36" height="8" rx="4" fill={C.blue} />
    </Svg>
  );
}

export function ClipboardIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="74" r="62" fill={C.blob} />
      <Ground />
      <rect x="56" y="32" width="88" height="110" rx="8" fill={C.wood} />
      <rect x="64" y="42" width="72" height="92" rx="4" fill={C.paper} />
      <rect x="82" y="26" width="36" height="14" rx="5" fill={C.gray} />
      {[60, 80, 100, 118].map((y, i) => (
        <g key={y}>
          <rect x="72" y={y - 5} width="10" height="10" rx="2" fill={i < 2 ? C.green : C.blue} />
          <path d={`M90 ${y} h36`} stroke={C.line} strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
    </Svg>
  );
}

export function BellIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="74" r="62" fill={C.blob} />
      <Ground />
      <path d="M100 34 c-22 0 -34 16 -34 38 v22 l-10 14 h88 l-10 -14 v-22 c0 -22 -12 -38 -34 -38 z" fill={C.mid} />
      <circle cx="100" cy="32" r="5" fill={C.primary} />
      <path d="M88 112 a12 12 0 0 0 24 0 z" fill={C.primary} />
      <path d="M82 60 q4 -10 14 -12" stroke={C.paper} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

export function SchoolIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="72" r="62" fill={C.blob} />
      <Ground />
      <rect x="44" y="72" width="112" height="72" fill={C.paper} stroke={C.line} strokeWidth="2" />
      <path d="M36 76 L100 36 L164 76 Z" fill={C.primary} />
      <rect x="88" y="104" width="24" height="40" rx="2" fill={C.mid} />
      {[56, 128].map((x) => (
        <g key={x}>
          <rect x={x} y="88" width="18" height="16" rx="2" fill={C.blue} />
          <rect x={x} y="114" width="18" height="16" rx="2" fill={C.blue} />
        </g>
      ))}
      <circle cx="100" cy="62" r="8" fill={C.paper} />
      <path d="M100 57 v5 l3 3" stroke={C.dark} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M100 36 v-14" stroke={C.dark} strokeWidth="2" />
      <path d="M100 22 h16 l-4 5 l4 5 h-16 z" fill={C.accent} />
    </Svg>
  );
}

export function PeopleIllustration({ title }: { title?: string }) {
  const Person = ({ x, shirt, hair }: { x: number; shirt: string; hair: string }) => (
    <g>
      <path d={`M${x - 24} 140 C${x - 24} 108 ${x - 12} 96 ${x} 96 C${x + 12} 96 ${x + 24} 108 ${x + 24} 140 Z`} fill={shirt} />
      <circle cx={x} cy="76" r="15" fill={C.skin} />
      <path d={`M${x - 15} 74 C${x - 15} 58 ${x + 15} 58 ${x + 15} 74 C${x + 8} 66 ${x - 8} 66 ${x - 15} 74 Z`} fill={hair} />
    </g>
  );
  return (
    <Svg title={title}>
      <circle cx="100" cy="74" r="62" fill={C.blob} />
      <Ground />
      <Person x={74} shirt={C.primary} hair={C.hair} />
      <Person x={126} shirt={C.accent} hair={C.dark} />
    </Svg>
  );
}

export function ClockIllustration({ title }: { title?: string }) {
  return (
    <Svg title={title}>
      <circle cx="100" cy="74" r="62" fill={C.blob} />
      <Ground />
      <circle cx="100" cy="80" r="46" fill={C.paper} stroke={C.mid} strokeWidth="6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <circle key={i} cx={100 + Math.sin(a) * 36} cy={80 - Math.cos(a) * 36} r={i % 3 === 0 ? 3 : 1.8} fill={C.gray} />;
      })}
      <path d="M100 80 V54 M100 80 L118 90" stroke={C.dark} strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="80" r="4" fill={C.accentDeep} />
    </Svg>
  );
}
