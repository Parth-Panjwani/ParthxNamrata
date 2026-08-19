import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import venueImage from "@/assets/venue.jpg";
import { VENUE } from "@/lib/wedding";
import { CornerFlourishes, Divider } from "./Ornaments";

const rise = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.8, ease: [0.22, 0.61, 0.24, 1] as const },
};

export function VenueSection() {
  return (
    <section id="venue" className="canvas relative pb-16 sm:pb-24">
      <header className="flex flex-col items-center text-center">
        <h2 className="font-creative text-2xl font-semibold tracking-widest text-burgundy sm:text-3xl uppercase">
          The Place
        </h2>
        <Divider className="mt-4" />
      </header>

      <motion.article
        {...rise}
        className="paper inner-frame grain relative mt-8 sm:mt-12 overflow-hidden rounded-3xl shadow-lift"
      >
        <div className="relative">
          <img
            src={venueImage}
            alt="Prabhu Farms & Resort, Rajkot"
            loading="lazy"
            width={1280}
            height={960}
            className="h-52 w-full object-cover sm:h-64 brightness-95"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, oklch(0.28 0.093 16 / 0.45) 0%, transparent 60%)",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="relative px-6 py-8 text-center sm:px-10 sm:py-10">
          <CornerFlourishes />

          <h3 className="font-creative text-2xl sm:text-3xl font-semibold text-burgundy">
            {VENUE.name}
          </h3>
          <p className="mt-1 text-sm sm:text-base font-display italic text-gold-deep">
            {VENUE.subtitle}
          </p>

          <p className="mx-auto mt-4 max-w-sm text-[0.85rem] sm:text-[0.92rem] leading-relaxed text-warmgrey">
            {VENUE.address}
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href={VENUE.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-3d-primary inline-flex items-center justify-center gap-2 !px-8 !py-3.5 text-[0.7rem] tracking-[0.22em] whitespace-nowrap"
            >
              <span className="relative z-10 whitespace-nowrap">Get Directions</span>
              <ArrowUpRight size={14} strokeWidth={2} />
            </a>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
