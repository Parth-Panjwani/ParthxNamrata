import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Monogram } from "./Ornaments";

type Stage = "idle" | "glow" | "break" | "open" | "rise" | "done";

const SEQUENCE: { next: Stage; after: number }[] = [
  { next: "break", after: 800 },
  { next: "open", after: 550 },
  { next: "rise", after: 850 },
  { next: "done", after: 1100 },
];

const EASE = [0.22, 0.61, 0.24, 1] as const;

export function Envelope({ onOpened }: { onOpened: () => void }) {
  const [stage, setStage] = useState<Stage>("idle");

  useEffect(() => {
    if (stage === "idle") return;
    if (stage === "done") {
      onOpened();
      return;
    }
    const step = SEQUENCE[["glow", "break", "open", "rise"].indexOf(stage)];
    if (!step) return;
    const id = setTimeout(() => setStage(step.next), step.after);
    return () => clearTimeout(id);
  }, [stage, onOpened]);

  const opening = stage === "open" || stage === "rise" || stage === "done";
  const rising = stage === "rise" || stage === "done";
  const broken = stage === "break" || opening;

  return (
    <div className="relative w-full">
      {/* Ambient gold glow behind envelope */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[25%] -inset-y-[15%] -z-10 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(229,193,88,0.35) 0%, rgba(107,18,34,0.2) 60%, transparent 100%)",
        }}
        animate={{ scale: opening ? 1.15 : 1, opacity: opening ? 0.7 : 0.4 }}
        transition={{ duration: 1.4, ease: EASE }}
      />

      <div
        className="relative mx-auto select-none rounded-2xl shadow-envelope"
        style={{
          width: "min(86vw, 410px)",
          aspectRatio: "1.44 / 1",
          perspective: 1400,
          backgroundColor: "#671224",
        }}
      >
        {/* ── Main Envelope Back Pocket ── */}
        <div className="absolute inset-0 rounded-2xl bg-[#671224] grain overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
        </div>

        {/* ── Invitation Card Inside ── */}
        <motion.div
          className="paper inner-frame absolute left-[6%] right-[6%] grid place-items-center rounded-xl shadow-lift"
          style={{ top: "8%", height: "84%", zIndex: rising ? 25 : 5 }}
          initial={{ y: "6%" }}
          animate={{ y: rising ? "-62%" : "6%" }}
          transition={{ duration: 1.15, ease: EASE }}
        >
          <div className="flex flex-col items-center gap-1 px-4 text-center">
            <Monogram size={75} />
            <p className="eyebrow mt-1 text-[0.52rem] tracking-[0.3em] text-gold-deep font-semibold">Save the Date</p>
            <p className="font-creative text-lg font-semibold text-burgundy leading-tight">Parth &amp; Namrata</p>
            <p className="text-[0.58rem] uppercase tracking-[0.2em] text-warmgrey font-medium">24 &amp; 25 Feb 2027</p>
          </div>
        </motion.div>

        {/* ── Envelope Front Bottom Fold Pocket ── */}
        <div
          className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden"
          aria-hidden="true"
        >
          {/* Bottom Pocket Polygon */}
          <div
            className="absolute inset-0 bg-[#5A0F1F]"
            style={{
              clipPath: "polygon(0 0, 0 100%, 100% 100%, 100% 0, 50% 60%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
          </div>

          {/* Gold Foil Seam Trim SVG */}
          <svg viewBox="0 0 410 285" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="goldSeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F7DF94" />
                <stop offset="40%" stopColor="#D4AF37" />
                <stop offset="70%" stopColor="#AA7C11" />
                <stop offset="100%" stopColor="#F7DF94" />
              </linearGradient>
            </defs>

            {/* Diagonal Gold Foil Seams */}
            <path
              d="M 0 0 L 205 171 L 410 0"
              fill="none"
              stroke="url(#goldSeamGrad)"
              strokeWidth="2.5"
              opacity="0.8"
            />
            <path
              d="M 0 285 L 205 171 L 410 285"
              fill="none"
              stroke="url(#goldSeamGrad)"
              strokeWidth="2.5"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* ── Top Folding Flap with Crisp Gold Edge Trim ── */}
        <motion.div
          className="absolute left-0 top-0 w-full origin-top pointer-events-none"
          style={{
            height: "60%",
            transformStyle: "preserve-3d",
            zIndex: opening ? 8 : 30,
          }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: opening ? -168 : 0 }}
          transition={{ duration: 0.95, ease: EASE }}
          aria-hidden="true"
        >
          <div
            className="h-full w-full bg-[#6B1225]"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          >
            <div className="h-full w-full bg-gradient-to-b from-white/10 via-transparent to-black/20" />
          </div>

          {/* Flap Gold Foil Trim Edge */}
          <svg viewBox="0 0 410 171" className="absolute inset-0 h-full w-full">
            <path
              d="M 0 0 L 205 171 L 410 0"
              fill="none"
              stroke="url(#goldSeamGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* ── Center 3D Gold Wax Seal Stamp ── */}
        <div
          className="absolute left-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
          style={{ top: "58%" }}
        >
          <motion.button
            type="button"
            onClick={() => stage === "idle" && setStage("glow")}
            disabled={stage !== "idle"}
            aria-label="Break the seal and reveal dates"
            className="relative grid h-14 w-14 place-items-center rounded-full disabled:cursor-default"
            style={{
              background:
                "radial-gradient(circle at 32% 32%, #FFF4C2 0%, #E5C158 35%, #B88A1A 75%, #594004 100%)",
              boxShadow:
                "0 8px 20px rgba(0,0,0,0.5), inset 0 1.5px 3px rgba(255,255,255,0.8), inset 0 -2.5px 5px rgba(0,0,0,0.6)",
              border: "1.5px solid #F7DF94",
            }}
            animate={broken ? { opacity: 0, scale: 1.25 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Scalloped Wax Ring Details */}
            <span
              className="absolute inset-[3px] rounded-full border border-dashed border-yellow-100/50"
              aria-hidden="true"
            />

            {/* Embossed Floral Leaf Icon */}
            <svg viewBox="0 0 40 40" className="h-6 w-6 text-[#422E00]">
              <path
                d="M 20 6 C 21 11 24 14 30 16 C 24 18 21 21 20 26 C 19 21 16 18 10 16 C 16 14 19 11 20 6 Z"
                fill="currentColor"
                opacity="0.9"
              />
              <circle cx="20" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* ── Caption + Action Button ── */}
      <motion.div
        className="mt-8 flex flex-col items-center gap-3.5"
        animate={{ opacity: stage === "idle" || stage === "glow" ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <p className="font-display text-sm sm:text-base italic font-normal text-warmgrey">
          Tap the seal to reveal the dates &amp; celebrations
        </p>
        <button
          type="button"
          onClick={() => stage === "idle" && setStage("glow")}
          disabled={stage !== "idle"}
          className="btn-3d-primary group !px-9 !py-3.5 text-[0.7rem] tracking-[0.2em] whitespace-nowrap disabled:cursor-default"
        >
          <span className="relative z-10 whitespace-nowrap">Tap To Reveal</span>
          <span
            aria-hidden="true"
            className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-gold-light/45 to-transparent transition-transform duration-700 group-hover:translate-x-[300%]"
          />
        </button>
      </motion.div>
    </div>
  );
}
