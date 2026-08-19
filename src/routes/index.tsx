import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import palaceLine from "@/assets/palace-line.png";
import { Envelope } from "@/components/invite/Envelope";
import { CelebrationsSection } from "@/components/invite/CelebrationsSection";
import { InvitationSection } from "@/components/invite/InvitationSection";
import { RsvpSection } from "@/components/invite/RsvpSection";
import { VenueSection } from "@/components/invite/VenueSection";
import { Divider, Monogram, PetalField } from "@/components/invite/Ornaments";
import { COUPLE, WEDDING_DATE_LABEL } from "@/lib/wedding";

const TITLE = "Parth & Namrata — 24 & 25 February 2027, Rajkot";
const DESCRIPTION =
  "A handcrafted invitation to the wedding of Parth & Namrata. Two days of celebrations in Rajkot on 24 & 25 February 2027 — celebrations, venue details and RSVP.";

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
            transition={{ duration: 0.9, ease: EASE }}
          >
            <button
              type="button"
              onClick={open}
              className="btn-3d-secondary absolute right-4 top-4 z-10 !px-4 !py-2 text-[0.58rem]"
            >
              Skip Invitation
            </button>

            <motion.div
              className="flex w-full flex-col items-center"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <div className="relative p-2.5 sm:p-3.5 rounded-full border border-gold/50 bg-gradient-to-b from-gold/15 via-ivory to-transparent shadow-[0_0_30px_rgba(212,175,55,0.25)]">
                <Monogram size={120} />
              </div>
              <p className="eyebrow mt-5 text-[0.62rem] tracking-[0.35em] text-gold-deep font-semibold">
                Save The Date
              </p>
              <h1 className="font-creative mt-2 text-center text-3xl font-semibold tracking-wide text-burgundy sm:text-4xl">
                Parth &amp; Namrata
              </h1>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.25em] text-warmgrey">
                24 &amp; 25 February 2027 &middot; Rajkot
              </p>
              <Divider className="mt-5" />

              <div className="mt-8 w-full">
                <Envelope onOpened={open} />
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ opacity: opened ? 1 : 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: opened ? 0.25 : 0 }}
        className="relative z-10"
        aria-hidden={!opened}
      >
        <InvitationSection onViewCelebrations={() => scrollTo("celebrations")} />
        <CelebrationsSection />
        <VenueSection />
        <RsvpSection />

        <footer className="relative border-t border-gold/25 pt-10 pb-16 text-center">
          <div className="relative mx-auto w-full max-w-5xl px-4 py-4">
            <img
              src={palaceLine}
              alt="Palace Illustration"
              aria-hidden="true"
              loading="lazy"
              width={1920}
              height={640}
              className="pointer-events-none mx-auto w-full max-w-5xl opacity-95 transition-all filter drop-shadow-[0_4px_16px_rgba(184,138,26,0.35)]"
            />
          </div>
          <div className="mt-2 flex flex-col items-center justify-center gap-0.5">
            <p className="font-creative text-2xl tracking-wider text-burgundy sm:text-3xl font-normal">
              {COUPLE.groom}
            </p>
            <div className="flex items-center gap-3 my-1">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold" />
              <span className="font-script text-3xl italic text-gold-deep">&amp;</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold" />
            </div>
            <p className="font-creative text-2xl tracking-wider text-burgundy sm:text-3xl font-normal">
              {COUPLE.bride}
            </p>
          </div>
          <p className="mt-3 text-[0.58rem] uppercase tracking-[0.3em] text-warmgrey">
            {WEDDING_DATE_LABEL}
          </p>
        </footer>
      </motion.div>

      {opened && (
        <motion.button
          type="button"
          onClick={() => scrollTo("rsvp")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 1 }}
          className="btn-3d-primary fixed bottom-5 right-5 z-40 !px-6 !py-3.5 text-[0.65rem]"
        >
          RSVP
        </motion.button>
      )}
    </main>
  );
}
