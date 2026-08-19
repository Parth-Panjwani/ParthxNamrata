import { motion } from "framer-motion";
import { CornerFlourishes, Divider } from "./Ornaments";

const rise = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.8, ease: [0.22, 0.61, 0.24, 1] as const },
};

export function CelebrationsSection() {
  return (
    <section id="the-plan" className="canvas relative pb-16 sm:pb-24">
      <header className="flex flex-col items-center text-center">
        <h2 className="font-creative text-2xl font-semibold tracking-widest text-burgundy sm:text-3xl uppercase">
          The Plan
        </h2>
        <Divider className="mt-4" />
      </header>

      <motion.article
        {...rise}
        className="paper inner-frame grain relative mt-8 sm:mt-12 rounded-3xl px-5 py-8 sm:px-10 sm:py-12 shadow-lift text-center"
      >
        <CornerFlourishes />

        {/* Minimal Subtitle */}
        <p className="font-display italic text-base sm:text-lg text-gold-deep mb-6 sm:mb-8">
          Two days of love, celebration, and togetherness.
        </p>

        {/* Two Celebration Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4 items-center">
          {/* Day 01 */}
          <div className="flex flex-col items-center text-center px-2">
            <span className="text-[0.62rem] sm:text-[0.68rem] uppercase tracking-[0.28em] text-gold-deep font-semibold">
              Day 01 &middot; Wednesday
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-burgundy mt-1.5">
              24 February 2027
            </h3>
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-warmgrey font-medium mt-1">
              Rajkot &middot; Gujarat
            </span>
          </div>

          {/* Day 02 */}
          <div className="flex flex-col items-center text-center px-2 sm:border-l sm:border-gold/35">
            <span className="text-[0.62rem] sm:text-[0.68rem] uppercase tracking-[0.28em] text-gold-deep font-semibold">
              Day 02 &middot; Thursday
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-burgundy mt-1.5">
              25 February 2027
            </h3>
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-warmgrey font-medium mt-1">
              Rajkot &middot; Gujarat
            </span>
          </div>
        </div>

        <Divider className="my-6 sm:my-8" />

        {/* Clean Editorial Note */}
        <p className="font-display italic text-sm sm:text-base text-warmgrey/90 max-w-sm sm:max-w-md mx-auto leading-relaxed">
          Detailed schedule of ceremonies, celebrations and timings will be shared closer to the dates.
        </p>
      </motion.article>
    </section>
  );
}
