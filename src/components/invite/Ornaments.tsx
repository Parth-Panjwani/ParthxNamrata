import lotusCrest from "@/assets/lotus-crest.png";

/** Fine gold rule with a lotus diamond at its centre. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/70 sm:w-24" />
      <svg width="34" height="14" viewBox="0 0 34 14" className="text-gold">
        <path
          d="M17 1c2.2 2.6 5 4.4 8.6 5.5C22 7.6 19.2 9.4 17 12c-2.2-2.6-5-4.4-8.6-5.5C12 5.4 14.8 3.6 17 1Z"
          fill="currentColor"
          opacity="0.85"
        />
        <circle cx="3" cy="6.6" r="1.4" fill="currentColor" opacity="0.7" />
        <circle cx="31" cy="6.6" r="1.4" fill="currentColor" opacity="0.7" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/70 sm:w-24" />
    </div>
  );
}

/** Layered P&N monogram using public/monogram.png asset with blend mode for seamless background. */
export function Monogram({ size = 100, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/monogram.png"
      alt="Parth & Namrata monogram"
      width={size}
      height={size}
      className={`h-auto shrink-0 object-contain mix-blend-multiply opacity-95 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** The generated foil crest — used as a section flourish. */
export function Crest({ className = "", width = 210 }: { className?: string; width?: number }) {
  return (
    <img
      src={lotusCrest}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={1024}
      height={768}
      className={`mx-auto h-auto opacity-90 mix-blend-multiply ${className}`}
      style={{ width }}
    />
  );
}

/** Corner filigree for framed cards. */
export function CornerFlourishes() {
  return (
    <>
      {(
        [
          ["top-2 left-2", ""],
          ["top-2 right-2", "scale-x-[-1]"],
          ["bottom-2 left-2", "scale-y-[-1]"],
          ["bottom-2 right-2", "scale-[-1]"],
        ] as const
      ).map(([pos, flip]) => (
        <svg
          key={pos}
          viewBox="0 0 60 60"
          className={`pointer-events-none absolute h-8 w-8 text-gold/70 ${pos} ${flip}`}
          aria-hidden="true"
        >
          <path
            d="M2 26C2 12 12 2 26 2M2 34c8 0 14-2 18-6s6-10 6-18M10 44c10-1 17-4 22-9s8-12 9-22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="44" cy="16" r="1.6" fill="currentColor" />
        </svg>
      ))}
    </>
  );
}

const PETALS = [
  { left: "6%", delay: 0, dur: 15, size: 13, drift: "9vw", o: 0.5 },
  { left: "22%", delay: 3.4, dur: 18, size: 10, drift: "-6vw", o: 0.38 },
  { left: "38%", delay: 7.1, dur: 16, size: 15, drift: "12vw", o: 0.45 },
  { left: "54%", delay: 1.8, dur: 19, size: 11, drift: "-10vw", o: 0.33 },
  { left: "69%", delay: 9.6, dur: 17, size: 14, drift: "7vw", o: 0.42 },
  { left: "84%", delay: 5.2, dur: 20, size: 9, drift: "-8vw", o: 0.3 },
  { left: "94%", delay: 12, dur: 16, size: 12, drift: "-14vw", o: 0.36 },
];

/** Slow floating rose petals — ambient, never distracting. */
export function PetalField() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.45,
            opacity: p.o,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            ["--drift" as string]: p.drift,
          }}
        >
          <svg viewBox="0 0 20 30" className="h-full w-full text-rose">
            <path
              d="M10 0C15 8 20 14 20 20c0 6-4.5 10-10 10S0 26 0 20C0 14 5 8 10 0Z"
              fill="currentColor"
              opacity="0.55"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
