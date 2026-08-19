import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import palaceLine from "@/assets/palace-line.png";
import { Envelope } from "@/components/invite/Envelope";
import { CelebrationsSection } from "@/components/invite/CelebrationsSection";
import { InvitationSection } from "@/components/invite/InvitationSection";
import { RsvpSection } from "@/components/invite/RsvpSection";
import { VenueSection } from "@/components/invite/VenueSection";
import { CornerFlourishes, Divider, Monogram, PetalField } from "@/components/invite/Ornaments";

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
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  const open = useCallback(() => setOpened(true), []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <PetalField />

      <AnimatePresence>
        {!opened && (
          <motion.section
            key="envelope"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-5 py-8"
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <button
              type="button"
              onClick={open}
              className="btn-3d-secondary absolute right-4 top-4 z-10 !px-4 !py-2 text-[0.58rem] tracking-[0.2em]"
            >
              Skip
            </button>

            <motion.div
              className="paper inner-frame grain relative mx-auto flex w-full max-w-[440px] flex-col items-center px-5 py-7 sm:px-8 sm:py-8 rounded-3xl shadow-lift text-center"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <CornerFlourishes />

              {/* Monogram Crest Medallion */}
              <div className="relative p-2 rounded-full border border-gold/45 bg-gradient-to-b from-gold/20 via-ivory to-ivory-deep shadow-[0_0_24px_rgba(212,175,55,0.22)]">
                <Monogram size={78} />
              </div>

              {/* Names only (no date on outer card) */}
              <h1 className="font-creative mt-3.5 mb-5 text-2xl sm:text-3xl font-semibold tracking-wider text-burgundy">
                Parth &amp; Namrata
              </h1>

              {/* Centered Royal Envelope */}
              <div className="w-full">
                <Envelope onOpened={open} />
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ opacity: opened ? 1 : 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: opened ? 0.2 : 0 }}
        className="relative z-10"
        aria-hidden={!opened}
      >
        <InvitationSection />
        <CelebrationsSection />
        <VenueSection />
        <RsvpSection />

        {/* Quiet Closing Scene */}
        <footer className="relative border-t border-gold/20 pt-8 pb-16 text-center">
          <div className="relative mx-auto w-full max-w-4xl px-4 py-2 opacity-85">
            <img
              src={palaceLine}
              alt="Palace Illustration"
              aria-hidden="true"
              loading="lazy"
              width={1920}
              height={640}
              className="pointer-events-none mx-auto w-full max-w-4xl opacity-90 transition-all filter drop-shadow-[0_4px_12px_rgba(184,138,26,0.25)]"
            />
          </div>

          <div className="mt-4 flex flex-col items-center justify-center gap-1">
            <p className="font-display italic text-lg sm:text-xl text-burgundy font-normal">
              See you in Rajkot.
            </p>
            <p className="font-creative text-base sm:text-lg tracking-widest text-gold-deep font-semibold mt-1">
              P &times; N
            </p>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-warmgrey font-medium mt-0.5">
              24 &mdash; 25 &middot; 02 &middot; 27
            </p>
          </div>
        </footer>
      </motion.div>

      {opened && (
        <motion.button
          type="button"
          onClick={() => scrollTo("rsvp")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.8 }}
          className="btn-3d-primary fixed bottom-5 right-5 z-40 !px-5 !py-3 text-[0.62rem] tracking-[0.2em] shadow-2xl"
        >
          RSVP
        </motion.button>
      )}
    </main>
  );
}
