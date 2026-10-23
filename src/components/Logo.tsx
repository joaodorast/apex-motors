interface Props {
  className?: string;
  showWordmark?: boolean;
}

/** Símbolo APEX: um ápice geométrico aberto atravessado por uma linha de luz. */
export function ApexMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <path d="M3.5 28 16 4l12.5 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="miter" strokeMiterlimit="10" />
      <rect x="10.2" y="19.6" width="11.6" height="2.4" fill="#FF3048" />
    </svg>
  );
}

export function Logo({ className = '', showWordmark = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <ApexMark className="h-7 w-7 shrink-0" />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.05rem] font-extrabold tracking-[0.28em] [font-stretch:125%]">APEX</span>
          <span className="mt-1 font-mono text-[0.5rem] tracking-[0.62em] text-silver/70">MOTORS</span>
        </span>
      )}
    </span>
  );
}
