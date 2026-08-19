import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Music,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { CELEBRATIONS, type CelebrationEvent } from "@/lib/wedding";
import { Divider } from "./Ornaments";

const ICONS: Record<CelebrationEvent["icon"], typeof Sun> = {
  haldi: Sun,
  sangeet: Music,
  wedding: HeartHandshake,
  reception: Sparkles,
};

export function CelebrationsSection() {
  const [active, setActive] = useState(0);
  const day = CELEBRATIONS[active] ?? CELEBRATIONS[0]!;

  return (
    <section id="celebrations" className="canvas relative pb-16">
      <header className="flex flex-col items-center text-center">
        <p className="eyebrow text-[0.62rem] tracking-[0.3em] text-gold-deep font-semibold whitespace-nowrap">
          Itinerary
        </p>
        <h2 className="font-creative mt-1.5 text-2xl font-semibold text-burgundy sm:text-3xl whitespace-nowrap">
          Flow of Events
        </h2>
        <Divider className="mt-4" />
      </header>

      {/* Day Tabs */}
      <div
        className="mx-auto mt-6 max-w-xs rounded-2xl border border-gold/40 bg-ivory-deep/80 p-1 shadow-sm"
        role="tablist"
        aria-label="Celebration days"
      >
        <div className="grid grid-cols-2 gap-1">
          {CELEBRATIONS.map((d, i) => (
            <button
              key={d.day}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={`relative rounded-xl py-2.5 text-[0.65rem] uppercase tracking-[0.2em] font-medium transition-all duration-300 whitespace-nowrap ${
                active === i ? "text-ivory shadow-md" : "text-warmgrey hover:text-burgundy"
              }`}
            >
              {active === i && (
                <motion.span
                  layoutId="activeDayTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8B1A2D] via-[#671224] to-[#480A17]"
                  transition={{ duration: 0.35, ease: [0.22, 0.61, 0.24, 1] }}
                />
              )}
              <span className="relative z-10 font-semibold">{d.day} &middot; {d.label.slice(0, 3)}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-[0.65rem] uppercase tracking-[0.24em] text-gold-deep font-medium whitespace-nowrap">
        {day.date}
      </p>

      {/* Events List without Timings */}
      <div className="relative mt-6 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.24, 1] }}
            className="space-y-3"
          >
            {day.events.map((event) => {
              const Icon = ICONS[event.icon];
              return (
                <article
                  key={`${day.day}-${event.title}`}
                  className="paper inner-frame grain relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-paper"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 bg-gradient-to-br from-gold/20 via-ivory to-ivory-deep text-gold-deep shadow-sm">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-creative text-lg font-semibold text-burgundy sm:text-xl whitespace-nowrap overflow-hidden text-ellipsis">
                        {event.title}
                      </h3>
                      <p className="mt-0.5 text-[0.82rem] leading-snug text-warmgrey">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
