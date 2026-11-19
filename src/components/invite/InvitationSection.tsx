import { motion } from "framer-motion";
import { CornerFlourishes, Crest, Divider } from "./Ornaments";
import { Countdown } from "./Countdown";
import { COUPLE } from "@/lib/wedding";

const EASE = [0.22, 0.61, 0.24, 1] as const;

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function InvitationSection() {
  return (
    <section id="invitation" className="canvas relative pt-10 pb-14 sm:pt-16 sm:pb-20">
      {/* Luxury Royal Card */}
      <motion.article
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.0, ease: EASE, delay: 0.1 }}
        className="paper inner-frame grain relative px-6 py-10 sm:px-12 sm:py-14 rounded-3xl shadow-lift border border-gold/40"
      >
        <CornerFlourishes />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative flex flex-col items-center text-center z-10"
        >
          {/* Royal Crest Flourish - Clean, crisp, no odd glow or drop-shadow */}
          <motion.div variants={fadeUp}>
            <Crest width={130} className="opacity-95 mb-1" />
          </motion.div>

          {/* Together We Begin */}
          <motion.p
            variants={fadeUp}
            className="eyebrow tracking-royal mt-2 mb-3 text-gold-deep font-semibold"
          >
            Together We Begin
          </motion.p>

          {/* Couple Names */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center text-center mt-1"
          >
            <h1 className="font-creative text-4xl sm:text-6xl font-bold tracking-wider text-burgundy">
              {COUPLE.groomShort}
            </h1>

            <div className="my-2 sm:my-3 flex items-center justify-center gap-4">
              <span className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-gold to-gold-deep" />
              <span className="font-script text-3xl sm:text-4xl italic text-gold-deep select-none">&amp;</span>
              <span className="h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-gold to-gold-deep" />
            </div>

            <h1 className="font-creative text-4xl sm:text-6xl font-bold tracking-wider text-burgundy">
              {COUPLE.brideShort}
            </h1>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="font-display italic text-base sm:text-lg text-burgundy/85 mt-3 tracking-wide font-medium"
          >
            cordially invite you to celebrate their union
          </motion.p>

          <motion.div variants={fadeUp} className="w-full">
            <Divider className="my-5 sm:my-7" />
          </motion.div>

          {/* Date & Location */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center space-y-1"
          >
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-burgundy">
              24 &mdash; 25 February 2027
            </p>
            <p className="text-[0.72rem] sm:text-[0.78rem] uppercase tracking-[0.28em] text-burgundy/80 font-bold">
              Rajkot &middot; Gujarat
            </p>
          </motion.div>

          {/* Event Quick-Look Showcase Cards - 2 column grid on all devices */}
          <motion.div
            variants={fadeUp}
            className="mt-6 w-full max-w-sm grid grid-cols-2 gap-2.5 sm:gap-3"
          >
            {[
              {
                day: "24 Feb",
                title: "Carnival & Sangeet",
                sub: "Morning & Evening",
              },
              {
                day: "25 Feb",
                title: "Wedding & Reception",
                sub: "Evening Celebrations",
              },
            ].map((d) => (
              <div
                key={d.day}
                className="group relative rounded-xl border border-gold/50 bg-[#FBF7F0] p-3 text-center shadow-xs transition-all duration-300 hover:border-gold hover:shadow-sm"
              >
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-gold-deep font-bold">
                  {d.day}
                </p>
                <p className="font-creative text-xs sm:text-[0.82rem] text-burgundy font-bold mt-1">
                  {d.title}
                </p>
                <p className="font-sans text-[0.68rem] text-charcoal/70 mt-0.5 font-medium">
                  {d.sub}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Countdown Clock */}
          <motion.div variants={fadeUp} className="mt-6 w-full max-w-xs">
            <p className="text-[0.62rem] uppercase tracking-[0.26em] text-gold-deep font-bold mb-2">
              Counting Down
            </p>
            <Countdown />
          </motion.div>

          {/* Animated Scroll Indicator */}
          <motion.div
            variants={fadeUp}
            className="mt-7 flex flex-col items-center opacity-85 hover:opacity-100 transition-opacity animate-float-gentle"
          >
            <span className="text-[0.62rem] uppercase tracking-[0.28em] text-burgundy font-bold">
              Events Below &darr;
            </span>
          </motion.div>
        </motion.div>
      </motion.article>
    </section>
  );
}
