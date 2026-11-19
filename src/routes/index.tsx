import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import palaceLine from "@/assets/palace-line.png";
import { CelebrationsSection } from "@/components/invite/CelebrationsSection";
import { InvitationSection } from "@/components/invite/InvitationSection";
import { RsvpSection } from "@/components/invite/RsvpSection";
import { VenueSection } from "@/components/invite/VenueSection";
import { PetalField } from "@/components/invite/Ornaments";

const TITLE = "Parth & Namrata — Wedding Celebrations, Rajkot";
const DESCRIPTION =
  "Save the date for the wedding celebrations of Parth & Namrata in Rajkot — celebrations, venue details and RSVP.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvitationExperience,
});

const EASE = [0.22, 0.61, 0.24, 1] as const;

function InvitationExperience() {
  function scrollTo(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <PetalField />

      <div className="relative z-10">
        <InvitationSection />
        <CelebrationsSection />
        <VenueSection />
        <RsvpSection />

        {/* Quiet Closing Scene */}
        <footer className="relative border-t border-gold/25 pt-6 pb-14 text-center overflow-hidden">
          <div className="relative mx-auto w-full max-w-5xl px-0 py-2">
            <img
              src={palaceLine}
              alt="Palace Illustration"
              aria-hidden="true"
              loading="lazy"
              width={1920}
              height={640}
              className="pointer-events-none mx-auto w-full min-w-[100%] scale-105 sm:scale-100 object-cover red-palace-silhouette opacity-95 transition-all"
            />
          </div>

          <div className="mt-2 flex flex-col items-center justify-center gap-1">
            <p className="font-display italic text-lg sm:text-xl text-burgundy font-medium">
              See you in Rajkot.
            </p>
            <p className="font-creative text-base sm:text-lg tracking-widest text-burgundy font-bold mt-0.5">
              P &times; N
            </p>
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-burgundy/80 font-bold mt-0.5">
              24 &mdash; 25 &middot; 02 &middot; 27
            </p>
          </div>
        </footer>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollTo("rsvp")}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
        className="btn-3d-primary fixed bottom-5 right-5 z-40 !px-5 !py-3 text-[0.62rem] tracking-[0.2em] shadow-2xl"
      >
        RSVP
      </motion.button>
    </main>
  );
}
