import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Countdown } from "./Countdown";
import { Crest, CornerFlourishes, Divider } from "./Ornaments";
import { COUPLE, WEDDING_DATE_LABEL } from "@/lib/wedding";

const rise = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.9, ease: [0.22, 0.61, 0.24, 1] as const },
};

export function InvitationSection({ onViewCelebrations }: { onViewCelebrations: () => void }) {
  return (
    <section id="invitation" className="canvas relative pt-10 pb-16 sm:pt-14 sm:pb-20">
      <motion.article
        {...rise}
        className="paper inner-frame grain relative px-5 py-9 sm:px-10 sm:py-12 rounded-3xl shadow-lift"
      >
        <CornerFlourishes />
        <div className="relative flex flex-col items-center text-center">
          <Crest width={140} />

          {/* Couple Name in 2 Lines with Elegant Spacing */}
          <div className="mt-5 flex flex-col items-center justify-center text-center">
            <h1 className="font-creative text-3xl font-semibold tracking-wider text-burgundy sm:text-5xl drop-shadow-[0_2px_4px_rgba(103,18,36,0.12)]">
              {COUPLE.groomShort}
            </h1>
            <div className="my-2.5 flex items-center justify-center gap-4">
              <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-gold" />
              <span className="font-script text-3xl sm:text-4xl font-normal italic text-gold-deep">&amp;</span>
              <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-gold" />
            </div>
            <h1 className="font-creative text-3xl font-semibold tracking-wider text-burgundy sm:text-5xl drop-shadow-[0_2px_4px_rgba(103,18,36,0.12)]">
              {COUPLE.brideShort}
            </h1>
          </div>

          <Divider className="mt-6" />

          {/* Minimal Single-line Date Card */}
          <div className="mt-6 w-full max-w-sm rounded-2xl border border-gold/45 bg-gradient-to-b from-ivory-deep/90 via-ivory to-ivory-deep/70 px-4 py-5 sm:px-6 shadow-sm">
            <p className="eyebrow text-[0.55rem] tracking-[0.28em] text-gold-deep whitespace-nowrap">
              We're Getting Married
            </p>
            <p className="font-display mt-1.5 text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-burgundy whitespace-nowrap">
              {WEDDING_DATE_LABEL}
            </p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.24em] text-warmgrey whitespace-nowrap font-medium">
              Rajkot &middot; Gujarat
            </p>
          </div>

          {/* Live Countdown */}
          <div className="mt-8 w-full max-w-sm">
            <Countdown />
          </div>

          {/* Single Clean Action Button */}
          <button
            type="button"
            onClick={onViewCelebrations}
            className="btn-3d-primary mt-8 flex items-center justify-center gap-2 !px-8 !py-3.5 text-[0.68rem] tracking-[0.22em] whitespace-nowrap"
          >
            <span className="relative z-10 whitespace-nowrap">View Celebrations</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </motion.article>
    </section>
  );
}
