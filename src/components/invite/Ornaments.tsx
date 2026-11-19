import lotusCrest from "@/assets/lotus-crest.png";

/** Fine gold rule with a lotus diamond at its centre. */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
    >
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
export function Monogram({
  size = 100,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
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
export function Crest({
  className = "",
  width = 210,
}: {
  className?: string;
  width?: number;
}) {
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

/** Corner filigree for framed cards with proportional inset and proper rounding. */
export function CornerFlourishes() {
  return (
    <>
      {(
        [
          ["top-3 left-3", ""],
          ["top-3 right-3", "scale-x-[-1]"],
          ["bottom-3 left-3", "scale-y-[-1]"],
          ["bottom-3 right-3", "scale-[-1]"],
        ] as const
      ).map(([pos, flip]) => (
        <svg
          key={pos}
          viewBox="0 0 40 40"
          className={`pointer-events-none absolute h-6 w-6 text-gold-deep/60 ${pos} ${flip}`}
          aria-hidden="true"
        >
          <path
            d="M 2 20 C 2 10 10 2 20 2 M 2 12 C 2 7 7 2 12 2 M 6 6 L 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="2" cy="2" r="1.5" fill="currentColor" />
        </svg>
      ))}
    </>
  );
}

const PETALS = [
  { left: "4%", delay: 0, dur: 14, size: 13, drift: "7vw", o: 0.55 },
  { left: "18%", delay: 3.2, dur: 18, size: 11, drift: "-6vw", o: 0.42 },
  { left: "32%", delay: 6.8, dur: 16, size: 15, drift: "10vw", o: 0.48 },
  { left: "48%", delay: 1.5, dur: 19, size: 12, drift: "-9vw", o: 0.38 },
  { left: "64%", delay: 9.1, dur: 17, size: 14, drift: "8vw", o: 0.46 },
  { left: "78%", delay: 4.8, dur: 20, size: 10, drift: "-7vw", o: 0.35 },
  { left: "92%", delay: 11.4, dur: 16, size: 13, drift: "-11vw", o: 0.4 },
];

const GOLD_DUST = [
  { left: "10%", top: "15%", delay: 0.5, dur: 4.2, size: 3 },
  { left: "25%", top: "45%", delay: 1.8, dur: 5.1, size: 4 },
  { left: "40%", top: "25%", delay: 2.4, dur: 3.8, size: 2.5 },
  { left: "60%", top: "70%", delay: 0.9, dur: 4.6, size: 3.5 },
  { left: "75%", top: "35%", delay: 3.1, dur: 5.5, size: 2.5 },
  { left: "88%", top: "60%", delay: 1.2, dur: 4.0, size: 3 },
  { left: "15%", top: "85%", delay: 2.7, dur: 4.9, size: 4 },
  { left: "92%", top: "18%", delay: 2.1, dur: 3.7, size: 2.5 },
];

/** Slow floating rose petals & twinkling gold starlight — ambient & deeply atmospheric. */
export function PetalField() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
      aria-hidden="true"
    >
      {/* Soft Ambient Radiance in Background */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(229,193,88,0.18)_0%,rgba(103,18,36,0.08)_50%,transparent_80%)] blur-2xl pointer-events-none"
        style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
      />

      {/* Floating Petals */}
      {PETALS.map((p, i) => (
        <span
          key={`petal-${i}`}
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
          <svg
            viewBox="0 0 20 30"
            className="h-full w-full text-rose drop-shadow-[0_2px_4px_rgba(103,18,36,0.25)]"
          >
            <path
              d="M10 0C15 8 20 14 20 20c0 6-4.5 10-10 10S0 26 0 20C0 14 5 8 10 0Z"
              fill="currentColor"
              opacity="0.65"
            />
          </svg>
        </span>
      ))}

      {/* Twinkling Gold Fireflies / Stardust */}
      {GOLD_DUST.map((d, i) => (
        <span
          key={`dust-${i}`}
          className="sparkle-dot"
          style={{
            left: d.left,
            top: d.top,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
