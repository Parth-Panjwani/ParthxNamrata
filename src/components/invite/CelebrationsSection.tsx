import { motion } from "framer-motion";
import { CELEBRATIONS } from "@/lib/wedding";
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

      <div className="relative mt-8 sm:mt-12 space-y-8 sm:space-y-10">
        {CELEBRATIONS.map((dayGroup) => (
          <motion.article
            key={dayGroup.date}
            {...rise}
            className="paper inner-frame grain relative rounded-3xl p-6 sm:p-10 shadow-lift"
          >
            <CornerFlourishes />

            {/* Date Header Banner */}
            <div className="flex flex-col items-center text-center border-b border-gold/30 pb-5">
              <span className="text-[0.62rem] sm:text-[0.68rem] uppercase tracking-[0.32em] text-gold-deep font-semibold">
                {dayGroup.dayName}
              </span>
              <h3 className="font-display mt-1 text-xl sm:text-2xl font-medium tracking-tight text-burgundy">
                {dayGroup.fullDate.replace(`${dayGroup.dayName}, `, "")}
              </h3>
            </div>

            {/* Editorial Events List */}
            <div className="mt-6 space-y-6 sm:space-y-8 divide-y divide-gold/15">
              {dayGroup.events.map((event, idx) => (
                <div
                  key={event.title}
                  className={`flex flex-col text-left ${idx > 0 ? "pt-6 sm:pt-8" : ""}`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="font-creative text-lg sm:text-xl font-semibold tracking-wide text-burgundy">
                      {event.title}
                    </h4>
                  </div>

                  <p className="mt-1.5 text-[0.85rem] sm:text-[0.92rem] leading-relaxed text-warmgrey">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
