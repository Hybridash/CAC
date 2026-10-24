/** The ATP currency: a little adenosine with three phosphate "beads". */
export function AtpIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="ATP"
    >
      <circle cx="6" cy="12" r="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
      <path d="M11 12h2" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="14.5" cy="12" r="2.4" fill="#fcd34d" stroke="#b45309" strokeWidth="1.2" />
      <circle cx="19" cy="9" r="2.1" fill="#fcd34d" stroke="#b45309" strokeWidth="1.2" />
      <circle cx="19" cy="15.5" r="2.1" fill="#fcd34d" stroke="#b45309" strokeWidth="1.2" />
      <text x="6" y="14.6" textAnchor="middle" fontSize="7" fontWeight="900" fill="#78350f">
        A
      </text>
    </svg>
  );
}

export function NucleotideIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Nucleotides">
      <path d="M12 2l8 5v10l-8 5-8-5V7z" fill="#8fb1ce" stroke="#2b4a68" strokeWidth="1.5" />
      <path d="M8 9l8 6M16 9l-8 6" stroke="#ede9fe" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AtpAmount({ amount, prefix = '' }: { amount: number; prefix?: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-extrabold text-atp-dark">
      <AtpIcon size={18} />
      {prefix}
      {amount}
      <span className="sr-only"> ATP</span>
    </span>
  );
}
