import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Check, Loader2, Send } from "lucide-react";
import { submitRsvp, updateRsvp, checkRsvpExists } from "@/lib/rsvp.functions";
import {
  ATTENDANCE_OPTIONS,
  DAY_OPTIONS,
  attendanceLabel,
  daysLabel,
} from "@/lib/wedding";
import { CornerFlourishes, Crest, Divider } from "./Ornaments";

const STORAGE_KEY = "pn-rsvp";

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  mobile: z
    .string()
    .trim()
    .min(7, "Please enter a valid mobile number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) are allowed"),
  attendance: z.enum(["yes", "some", "unsure", "no"]),
  adults: z.coerce.number().int().min(0).max(50),
  children: z.coerce.number().int().min(0).max(50),
  attendingDays: z.enum(["24", "25", "both"]),
  message: z.string().trim().max(1000).optional(),
});

type FormValues = z.input<typeof formSchema>;
type Saved = { id: string; values: z.output<typeof formSchema> };

const EASE = [0.22, 0.61, 0.24, 1] as const;

const labelClass = "block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold";
const fieldClass =
  "mt-1.5 w-full rounded-xl border border-gold/45 bg-ivory/90 px-4 py-3 font-sans text-[0.88rem] text-charcoal outline-none transition-all duration-200 placeholder:text-warmgrey/50 shadow-sm focus:border-gold focus:bg-ivory focus:ring-2 focus:ring-gold/30";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="mt-1 text-[0.7rem] text-destructive">{message}</p>;
}

export function RsvpSection() {
  const submit = useServerFn(submitRsvp);
  const update = useServerFn(updateRsvp);
  const checkExists = useServerFn(checkRsvpExists);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      attendance: "yes",
      adults: 2,
      children: 0,
      attendingDays: "both",
      message: "",
    },
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Saved;
      if (parsed?.id) {
        setSaved(parsed);
        checkExists({ data: { id: parsed.id } })
          .then((res) => {
            if (!res?.exists) {
              localStorage.removeItem(STORAGE_KEY);
              setSaved(null);
            }
          })
          .catch(() => {});
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [checkExists]);

  const attendance = watch("attendance");
  const coming = attendance === "yes" || attendance === "some";

  function resetForm() {
    localStorage.removeItem(STORAGE_KEY);
    setSaved(null);
    setEditing(false);
    reset({
      fullName: "",
      mobile: "",
      attendance: "yes",
      adults: 2,
      children: 0,
      attendingDays: "both",
      message: "",
    });
  }

  const onSubmit = handleSubmit(async (raw) => {
    setServerError(null);
    const values = formSchema.parse(raw);
    try {
      const result =
        editing && saved
          ? await update({ data: { ...values, id: saved.id } })
          : await submit({ data: values });
      const record: Saved = { id: result.id, values };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      setSaved(record);
      setEditing(false);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  });

  function startEdit() {
    if (!saved) return;
    reset({ ...saved.values });
    setEditing(true);
  }

  async function share() {
    const url = window.location.origin;
    const text = `Parth & Namrata — 24 & 25 February 2027, Rajkot. Save the date:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Parth & Namrata", text, url });
        return;
      } catch {
        /* dismissed */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
  }

  const showSuccess = saved && !editing;

  return (
    <section id="rsvp" className="canvas relative pb-20">
      <header className="flex flex-col items-center text-center">
        <p className="eyebrow text-[0.62rem] tracking-[0.3em] text-gold-deep font-semibold whitespace-nowrap">
          Response
        </p>
        <h2 className="font-creative mt-1.5 text-2xl font-semibold text-burgundy sm:text-3xl whitespace-nowrap">
          RSVP
        </h2>
        <Divider className="mt-4" />
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {showSuccess ? (
          <motion.article
            key="success"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="paper inner-frame grain relative mt-6 overflow-hidden px-5 py-9 text-center sm:px-10 rounded-3xl shadow-lift"
          >
            <CornerFlourishes />

            <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#F7DF94] bg-[radial-gradient(circle_at_32%_32%,_#FFF4C2_0%,_#E5C158_38%,_#B88A1A_78%,_#594004_100%)] text-[#3D2700] shadow-[0_0_25px_rgba(229,193,88,0.4)]">
              <Check size={22} strokeWidth={2.4} />
            </div>

            <h3 className="font-creative mt-4 text-2xl font-semibold text-burgundy sm:text-3xl whitespace-nowrap">
              Thank you, {saved.values.fullName.split(" ")[0]}
            </h3>
            <p className="font-script mt-0.5 text-xl italic text-gold-deep whitespace-nowrap">
              Your response has been received.
            </p>

            <Divider className="mt-4" />

            {saved.values.message && (
              <div className="relative my-5 rounded-xl border border-gold/40 bg-ivory-deep/60 px-5 py-4 text-center">
                <p className="eyebrow text-[0.52rem] tracking-[0.25em] whitespace-nowrap">Your Message</p>
                <p className="font-display mt-1 text-sm italic text-burgundy font-normal sm:text-base">
                  &ldquo;{saved.values.message}&rdquo;
                </p>
              </div>
            )}

            <div className="hairline-gold mx-auto mt-5 max-w-sm rounded-xl bg-ivory/80 overflow-hidden shadow-sm text-left">
              <dl className="divide-y divide-gold/20">
                {[
                  ["Attendance", attendanceLabel(saved.values.attendance)],
                  ["Celebration Days", daysLabel(saved.values.attendingDays)],
                  ["Guests", `${saved.values.adults} Adults${saved.values.children ? `, ${saved.values.children} Children` : ""}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-gold-deep font-semibold whitespace-nowrap">{k}</dt>
                    <dd className="font-display text-sm font-normal text-burgundy whitespace-nowrap">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={startEdit}
                className="btn-3d-secondary w-full sm:w-auto !px-5 !py-2.5 text-[0.62rem] tracking-[0.16em] whitespace-nowrap"
              >
                Edit Response
              </button>
              <button
                type="button"
                onClick={share}
                className="btn-3d-primary w-full sm:w-auto !px-5 !py-2.5 text-[0.62rem] tracking-[0.16em] whitespace-nowrap"
              >
                Share
              </button>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="mt-5 inline-block text-[0.58rem] uppercase tracking-[0.2em] text-warmgrey hover:text-burgundy transition-colors underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              Submit Another Response
            </button>
          </motion.article>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="paper inner-frame grain relative mt-6 space-y-4 px-4 py-7 sm:px-8 rounded-2xl shadow-lift"
          >
            <CornerFlourishes />

            <div>
              <label className={labelClass} htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                className={fieldClass}
                placeholder="Your Name"
                autoComplete="name"
                {...register("fullName")}
              />
              <FieldError message={errors.fullName?.message} />
            </div>

            <div>
              <label className={labelClass} htmlFor="mobile">
                Mobile Number
              </label>
              <input
                id="mobile"
                type="tel"
                inputMode="tel"
                className={fieldClass}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                {...register("mobile")}
              />
              <FieldError message={errors.mobile?.message} />
            </div>

            <fieldset>
              <legend className={labelClass}>Will you be joining us?</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ATTENDANCE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gold/40 bg-ivory/90 px-3 py-2.5 text-center text-[0.75rem] font-medium text-charcoal transition-all duration-200 shadow-sm hover:border-gold/80 hover:bg-ivory-deep/60 has-checked:border-[#E5C158] has-checked:bg-gradient-to-r has-checked:from-[#8B1A2D] has-checked:via-[#671224] has-checked:to-[#480A17] has-checked:text-ivory has-checked:shadow-sm"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="sr-only"
                      {...register("attendance")}
                    />
                    <span className="whitespace-nowrap">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {coming && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelClass} htmlFor="adults">
                      Adults
                    </label>
                    <input
                      id="adults"
                      type="number"
                      min={0}
                      max={50}
                      className={fieldClass}
                      {...register("adults")}
                    />
                    <FieldError message={errors.adults?.message} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="children">
                      Children
                    </label>
                    <input
                      id="children"
                      type="number"
                      min={0}
                      max={50}
                      className={fieldClass}
                      {...register("children")}
                    />
                    <FieldError message={errors.children?.message} />
                  </div>
                </div>

                <fieldset>
                  <legend className={labelClass}>Attending Days</legend>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {DAY_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="cursor-pointer rounded-xl border border-gold/40 bg-ivory/90 px-1 py-2.5 text-center text-[0.72rem] font-medium text-charcoal transition-all duration-200 shadow-sm hover:border-gold/80 hover:bg-ivory-deep/60 has-checked:border-[#E5C158] has-checked:bg-gradient-to-r has-checked:from-[#8B1A2D] has-checked:via-[#671224] has-checked:to-[#480A17] has-checked:text-ivory has-checked:shadow-sm"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          className="sr-only"
                          {...register("attendingDays")}
                        />
                        <span className="whitespace-nowrap">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            <div>
              <label className={labelClass} htmlFor="message">
                Message for Couple (Optional)
              </label>
              <textarea
                id="message"
                rows={3}
                className={`${fieldClass} resize-none`}
                placeholder="A warm wish or blessing…"
                {...register("message")}
              />
              <FieldError message={errors.message?.message} />
            </div>

            {serverError && (
              <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-[0.75rem] text-destructive">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-3d-primary flex w-full items-center justify-center gap-2 !py-3.5 text-[0.68rem] tracking-[0.2em] whitespace-nowrap"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" strokeWidth={1.5} />
              ) : (
                <Send size={13} strokeWidth={1.5} />
              )}
              <span className="relative z-10 whitespace-nowrap">
                {editing ? "Update RSVP" : "Submit RSVP"}
              </span>
            </button>

            {editing && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="w-full text-center text-[0.65rem] uppercase tracking-[0.2em] text-warmgrey hover:text-burgundy whitespace-nowrap"
              >
                Cancel
              </button>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
