import { motion } from "framer-motion";
import { CELEBRATION_DATES } from "@/lib/wedding";
import { Divider } from "./Ornaments";

const EASE = [0.22, 0.61, 0.24, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

/** High-craft custom SVG motifs for Indian wedding events — sharp, vector-crisp, elegant */
function EventMotif({ type }: { type: string }) {
  if (type === "carnival") {
    return (
      <svg viewBox="0 0 40 40" className="h-6 w-6 text-gold-deep" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Sunburst / Festive Chakra */}
        <circle cx="20" cy="20" r="7" strokeWidth="1.8" />
        <circle cx="20" cy="20" r="2.5" fill="currentColor" />
        <path d="M20 5v4M20 31v4M5 20h4M31 20h4M9.5 9.5l3 3M27.5 27.5l3 3M9.5 30.5l3-3M27.5 12.5l3-3" />
      </svg>
    );
  }
  if (type === "sangeet") {
    return (
      <svg viewBox="0 0 40 40" className="h-6 w-6 text-gold-deep" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Veena / Classical Music Notes */}
        <path d="M12 28a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM28 24a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="currentColor" fillOpacity="0.2" />
        <path d="M16 24V8l16-4v16M16 14l16-4" />
      </svg>
    );
  }
  if (type === "wedding") {
    return (
      <svg viewBox="0 0 40 40" className="h-6 w-6 text-gold-deep" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Sacred Mangalsutra / Interlocking rings with Kalash gem */}
        <circle cx="16" cy="22" r="7" strokeWidth="1.8" />
        <circle cx="24" cy="22" r="7" strokeWidth="1.8" />
        <path d="M20 12l2.5-3.5h-5z" fill="currentColor" />
        <path d="M20 5v3.5" />
      </svg>
    );
  }
  // Reception / Celebration
  return (
    <svg viewBox="0 0 40 40" className="h-6 w-6 text-gold-deep" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* Royal Goblet / Diya of joy */}
      <path d="M12 8h16l-2 10a6 6 0 0 1-12 0z" fill="currentColor" fillOpacity="0.2" />
      <path d="M20 24v8M14 32h12M12 8l8-4 8 4" />
      <circle cx="20" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

function getMotifKey(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("carnival")) return "carnival";
  if (l.includes("sandhya") || l.includes("sangeet")) return "sangeet";
  if (l.includes("wedding")) return "wedding";
  return "reception";
}

export function CelebrationsSection() {
  return (
    <section id="the-plan" className="canvas relative pb-14 sm:pb-20">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex flex-col items-center text-center"
      >
        <span className="eyebrow tracking-royal mb-1 text-gold-deep">The Functions</span>
        <h2 className="font-creative text-2xl sm:text-3xl font-bold tracking-widest text-burgundy uppercase">
          Celebrations
        </h2>
        <Divider className="mt-3" />
      </motion.header>

      <div className="mt-7 sm:mt-10 space-y-5">
        {CELEBRATION_DATES.map((day, dayIdx) => (
          <motion.article
            key={day.dayNum}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.75, ease: EASE, delay: dayIdx * 0.1 }}
            className="paper inner-frame grain relative rounded-3xl p-5 sm:p-7 shadow-lift border border-gold/45"
          >
            {/* Day Header - Crisp, High-Contrast */}
            <div className="flex flex-col items-center text-center mb-5">
              <span className="text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.28em] text-burgundy font-bold">
                {day.dayNum} &middot; {day.dayName}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-burgundy mt-0.5">
                {day.dateNum} {day.month} {day.year}
              </h3>
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-charcoal/70 font-semibold mt-0.5">
                Rajkot &middot; Gujarat
              </span>
            </div>

            <Divider className="mb-5 opacity-70" />

            {/* Events Grid - STRICT 2-column grid on ALL screens (including mobile) */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-20px" }}
              className="grid grid-cols-2 gap-2.5 sm:gap-4"
            >
              {day.events.map((evt, evtIdx) => {
                const motifType = getMotifKey(evt.label);
                return (
                  <motion.div
                    key={evtIdx}
                    variants={item}
                    className="group relative flex flex-col items-center text-center rounded-2xl border border-gold/45 bg-[#FDFBF7] p-3.5 sm:p-5 shadow-xs hover:border-gold hover:shadow-md transition-all duration-300"
                  >
                    {/* Clean Vector Gold Motif - No cheap emojis */}
                    <div className="mb-2.5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-gold/40 bg-ivory shadow-xs group-hover:scale-105 transition-transform duration-200">
                      <EventMotif type={motifType} />
                    </div>

                    <span className="text-[0.58rem] sm:text-[0.65rem] uppercase tracking-[0.24em] text-burgundy font-bold">
                      {evt.time}
                    </span>

                    <h4 className="font-creative text-sm sm:text-lg font-bold text-burgundy mt-1 tracking-wide leading-tight line-clamp-1">
                      {evt.label}
                    </h4>

                    <p className="font-sans text-[0.68rem] sm:text-[0.78rem] text-charcoal/75 mt-0.5 font-medium leading-tight line-clamp-2">
                      {evt.sublabel}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
