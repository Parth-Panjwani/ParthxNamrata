import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Monogram } from "./Ornaments";

type Stage = "idle" | "glow" | "break" | "open" | "rise" | "done";

const SEQUENCE: { next: Stage; after: number }[] = [
  { next: "break", after: 650 },
  { next: "open", after: 450 },
  { next: "rise", after: 750 },
  { next: "done", after: 950 },
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
        className="pointer-events-none absolute -inset-x-[25%] -inset-y-[20%] -z-10 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(229,193,88,0.4) 0%, rgba(107,18,34,0.25) 55%, transparent 100%)",
        }}
        animate={{ scale: opening ? 1.2 : [1, 1.05, 1], opacity: opening ? 0.75 : [0.45, 0.6, 0.45] }}
        transition={{ duration: opening ? 1.2 : 4, repeat: opening ? 0 : Infinity, ease: "easeInOut" }}
      />

      <div
        className="relative mx-auto select-none rounded-2xl shadow-envelope w-full max-w-[360px]"
        style={{
          aspectRatio: "1.44 / 1",
          perspective: 1400,
          backgroundColor: "#671224",
        }}
      >
        {/* ── Main Envelope Back Pocket ── */}
        <div className="absolute inset-0 rounded-2xl bg-[#671224] grain overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35" />
        </div>

        {/* ── Invitation Card Inside ── */}
        <motion.div
          className="paper inner-frame absolute left-[5%] right-[5%] grid place-items-center rounded-xl shadow-lift"
          style={{ top: "8%", height: "84%", zIndex: rising ? 25 : 5 }}
          initial={{ y: "6%" }}
          animate={{ y: rising ? "-64%" : "6%" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <div className="flex flex-col items-center justify-center gap-1 px-4 text-center">
            <Monogram size={72} />
            <p className="text-[0.62rem] uppercase tracking-[0.28em] text-gold-deep font-semibold mt-1.5">
              24 &mdash; 25 FEB 2027
            </p>
          </div>
        </motion.div>

        {/* ── Envelope Front Bottom Fold Pocket ── */}
        <div
          className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden"
          aria-hidden="true"
        >
          {/* Bottom Pocket Polygon with Luxury Texture */}
          <div
            className="absolute inset-0 bg-[#5A0F1F]"
            style={{
              clipPath: "polygon(0 0, 0 100%, 100% 100%, 100% 0, 50% 60%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5" />
          </div>

          {/* Corner Gold Filigree Motifs */}
          <svg viewBox="0 0 415 288" className="absolute inset-0 h-full w-full pointer-events-none">
            {/* Bottom-left corner accent */}
            <path
              d="M 6 270 Q 20 270 20 256 M 6 278 Q 30 278 30 250"
              fill="none"
              stroke="#E5C158"
              strokeWidth="1.2"
              opacity="0.5"
            />
            {/* Bottom-right corner accent */}
            <path
              d="M 409 270 Q 395 270 395 256 M 409 278 Q 385 278 385 250"
              fill="none"
              stroke="#E5C158"
              strokeWidth="1.2"
              opacity="0.5"
            />
          </svg>

          {/* Gold Foil Seam Trim SVG */}
          <svg viewBox="0 0 410 285" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="goldSeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F7DF94" />
                <stop offset="35%" stopColor="#E5C158" />
                <stop offset="70%" stopColor="#AA7C11" />
                <stop offset="100%" stopColor="#F7DF94" />
              </linearGradient>
            </defs>

            {/* Diagonal Gold Foil Seams */}
            <path
              d="M 0 0 L 205 171 L 410 0"
              fill="none"
              stroke="url(#goldSeamGrad)"
              strokeWidth="2.4"
              opacity="0.85"
            />
            <path
              d="M 0 285 L 205 171 L 410 285"
              fill="none"
              stroke="url(#goldSeamGrad)"
              strokeWidth="2.4"
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
          transition={{ duration: 0.9, ease: EASE }}
          aria-hidden="true"
        >
          <div
            className="h-full w-full bg-[#6B1225]"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          >
            <div className="h-full w-full bg-gradient-to-b from-white/12 via-transparent to-black/25" />
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
          {/* Subtle Ambient Seal Aura */}
          <motion.div
            className="pointer-events-none absolute -inset-3 rounded-full opacity-60 blur-md"
            style={{
              background: "radial-gradient(circle, rgba(247,223,148,0.7) 0%, rgba(229,193,88,0.2) 60%, transparent 100%)",
            }}
            animate={broken ? { opacity: 0, scale: 1.6 } : { scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={broken ? { duration: 0.3 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.button
            type="button"
            onClick={() => stage === "idle" && setStage("glow")}
            disabled={stage !== "idle"}
            aria-label="Tap to open invitation"
            className="group relative grid h-16 w-16 place-items-center rounded-full cursor-pointer disabled:cursor-default"
            style={{
              background:
                "radial-gradient(circle at 30% 28%, #FFF8DC 0%, #F5D77F 25%, #D4AF37 60%, #8C6208 85%, #422E00 100%)",
              boxShadow:
                "0 10px 25px rgba(0,0,0,0.55), 0 0 25px rgba(229,193,88,0.45), inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.65)",
              border: "1.5px solid #FDF0B2",
            }}
            animate={broken ? { opacity: 0, scale: 1.35, rotate: 12 } : { opacity: 1, scale: [1, 1.03, 1] }}
            transition={
              broken
                ? { duration: 0.4, ease: EASE }
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            }
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
          >
            {/* Scalloped Wax Ring Details */}
            <span
              className="absolute inset-[3px] rounded-full border border-dashed border-[#FFF8DC]/60"
              aria-hidden="true"
            />
            <span
              className="absolute inset-[6px] rounded-full border border-gold-deep/30"
              aria-hidden="true"
            />

            {/* Embossed Royal Lotus Diamond Crest */}
            <svg viewBox="0 0 40 40" className="h-7 w-7 text-[#3B2800] transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_1px_1px_rgba(255,248,220,0.6)]">
              <path
                d="M 20 5 C 21 11 25 14 31 16 C 25 18 21 21 20 27 C 19 21 15 18 9 16 C 15 14 19 11 20 5 Z"
                fill="currentColor"
                opacity="0.95"
              />
              <circle cx="20" cy="16" r="1.8" fill="currentColor" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* ── Tactile Tap To Open Prompt ── */}
      <motion.div
        className="mt-7 flex flex-col items-center"
        animate={{ opacity: stage === "idle" || stage === "glow" ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <button
          type="button"
          onClick={() => stage === "idle" && setStage("glow")}
          disabled={stage !== "idle"}
          className="group flex flex-col items-center gap-1.5 text-center cursor-pointer disabled:cursor-default"
        >
          <span className="text-[0.68rem] uppercase tracking-[0.32em] text-burgundy font-semibold transition-all group-hover:text-gold-deep group-hover:tracking-[0.36em]">
            Tap to open
          </span>
          <span className="h-px w-12 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60 transition-all duration-300 group-hover:w-20 group-hover:opacity-100" />
        </button>
      </motion.div>
    </div>
  );
}
