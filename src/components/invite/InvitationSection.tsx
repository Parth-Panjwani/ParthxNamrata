import { motion } from "framer-motion";
import { CornerFlourishes, Crest, Divider } from "./Ornaments";
import { COUPLE } from "@/lib/wedding";

const rise = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.85, ease: [0.22, 0.61, 0.24, 1] as const },
};

export function InvitationSection() {
  return (
    <section id="invitation" className="canvas relative pt-12 pb-16 sm:pt-16 sm:pb-24">
      <motion.article
        {...rise}
        className="paper inner-frame grain relative px-6 py-12 sm:px-12 sm:py-16 rounded-3xl shadow-lift"
      >
        <CornerFlourishes />

        <div className="relative flex flex-col items-center text-center">
          {/* Subtle Royal Crest Flourish */}
          <Crest width={130} className="opacity-80 mb-2" />

          {/* Couple Names - Dominant Editorial Typography */}
          <div className="mt-4 flex flex-col items-center justify-center text-center">
            <h1 className="font-creative text-4xl sm:text-6xl font-semibold tracking-wide text-burgundy drop-shadow-[0_2px_4px_rgba(103,18,36,0.1)]">
              {COUPLE.groomShort}
            </h1>

            <div className="my-2 sm:my-3 flex items-center justify-center gap-4">
              <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-gold/80" />
              <span className="font-script text-3xl sm:text-4xl font-normal italic text-gold-deep">&amp;</span>
              <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-gold/80" />
            </div>

            <h1 className="font-creative text-4xl sm:text-6xl font-semibold tracking-wide text-burgundy drop-shadow-[0_2px_4px_rgba(103,18,36,0.1)]">
              {COUPLE.brideShort}
            </h1>
          </div>

          <p className="font-display italic text-base sm:text-lg text-gold-deep mt-4 tracking-wide">
            are getting married.
          </p>

          <Divider className="my-6 sm:my-8" />

          {/* Wedding Date & Location */}
          <div className="flex flex-col items-center space-y-1.5">
            <p className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-burgundy">
              24 &mdash; 25 February 2027
            </p>
            <p className="text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.28em] text-warmgrey font-medium">
              Rajkot &middot; Gujarat
            </p>
          </div>

          {/* Warm Warm Intimate Copy */}
          <p className="font-display italic text-sm sm:text-base text-warmgrey/90 mt-6 max-w-xs sm:max-w-sm leading-relaxed">
            Save the dates. We really want you there.
          </p>

          {/* Discreet Scroll Indicator */}
          <div className="mt-10 sm:mt-12 flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity">
            <span className="text-[0.58rem] uppercase tracking-[0.3em] text-gold-deep font-medium">
              Scroll &darr;
            </span>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
