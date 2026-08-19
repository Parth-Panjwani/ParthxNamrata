import { motion } from "framer-motion";
import { Navigation, Phone } from "lucide-react";
import venueImage from "@/assets/venue.jpg";
import { VENUE } from "@/lib/wedding";
import { CornerFlourishes, Divider } from "./Ornaments";

export function VenueSection() {
  return (
    <section id="venue" className="canvas relative pb-16">
      <header className="flex flex-col items-center text-center">
        <p className="eyebrow text-[0.62rem] tracking-[0.3em] text-gold-deep font-semibold whitespace-nowrap">
          Location
        </p>
        <h2 className="font-creative mt-1.5 text-2xl font-semibold text-burgundy sm:text-3xl whitespace-nowrap">
          The Venue
        </h2>
        <Divider className="mt-4" />
      </header>

      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}
        className="paper inner-frame grain relative mt-6 overflow-hidden rounded-3xl shadow-lift"
      >
        <div className="relative">
          <img
            src={venueImage}
            alt="Prabhu Farms & Resort, Rajkot"
            loading="lazy"
            width={1280}
            height={960}
            className="h-48 w-full object-cover sm:h-56 brightness-95"
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

        <div className="relative px-5 py-6 text-center sm:px-8 sm:py-7">
          <CornerFlourishes />
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold-deep font-semibold whitespace-nowrap">
            {VENUE.tagline}
          </p>
          <h3 className="font-creative mt-1.5 text-xl sm:text-2xl font-semibold text-burgundy whitespace-nowrap">
            {VENUE.name}
          </h3>
          <p className="mt-0.5 text-xs text-warmgrey">
            {VENUE.subtitle}
          </p>

          <p className="mx-auto mt-2.5 max-w-[20rem] text-[0.82rem] leading-relaxed text-warmgrey">
            {VENUE.address}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
            <a
              href={VENUE.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-3d-primary flex w-full sm:w-auto items-center justify-center gap-2 !px-5 !py-3 text-[0.65rem] tracking-[0.18em] whitespace-nowrap"
            >
              <Navigation size={13} strokeWidth={1.6} />
              <span className="relative z-10 whitespace-nowrap">Get Directions</span>
            </a>
            <a
              href={`tel:${VENUE.contactPhone}`}
              className="btn-3d-secondary flex w-full sm:w-auto items-center justify-center gap-2 !px-5 !py-3 text-[0.65rem] tracking-[0.18em] whitespace-nowrap"
            >
              <Phone size={13} strokeWidth={1.6} />
              <span className="relative z-10 whitespace-nowrap">Call Host</span>
            </a>
          </div>
        </div>
      </motion.article>
    </section>
  );
}
