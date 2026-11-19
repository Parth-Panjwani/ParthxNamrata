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
    <section id="venue" className="canvas relative pb-14 sm:pb-20">
      <header className="flex flex-col items-center text-center">
        <span className="eyebrow tracking-royal mb-1 text-gold-deep">
          The Destination
        </span>
        <h2 className="font-creative text-2xl sm:text-3xl font-bold tracking-widest text-burgundy uppercase">
          The Venue
        </h2>
        <Divider className="mt-3" />
      </header>

      <motion.article
        {...rise}
        className="paper inner-frame grain relative mt-6 sm:mt-10 overflow-hidden rounded-3xl shadow-lift border border-gold/45"
      >
        <div className="relative group overflow-hidden">
          <img
            src={venueImage}
            alt="Prabhu Farms & Resort, Rajkot"
            loading="lazy"
            width={1280}
            height={960}
            className="h-48 w-full object-cover sm:h-64 brightness-95"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, oklch(0.28 0.093 16 / 0.55) 0%, transparent 60%)",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="relative px-5 py-6 text-center sm:px-8 sm:py-8">
          <CornerFlourishes />

          <h3 className="font-creative text-xl sm:text-2xl font-bold text-burgundy">
            {VENUE.name}
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm font-display italic text-burgundy/80 font-semibold">
            {VENUE.subtitle}
          </p>

          <p className="mx-auto mt-2 max-w-sm text-[0.8rem] sm:text-[0.86rem] leading-relaxed text-charcoal/85 font-medium">
            {VENUE.address}
          </p>

          <div className="mt-6 flex justify-center">
            <a
              href={VENUE.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-3d-primary inline-flex items-center justify-center gap-2 !px-7 !py-3 text-[0.68rem] tracking-[0.22em] whitespace-nowrap"
            >
              <span className="relative z-10 whitespace-nowrap">
                View Location
              </span>
              <ArrowUpRight size={13} strokeWidth={2.4} />
            </a>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
