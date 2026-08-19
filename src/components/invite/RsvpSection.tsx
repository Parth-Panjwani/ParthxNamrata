import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ArrowRight, Check, Heart, Loader2 } from "lucide-react";
import { submitRsvp, updateRsvp, checkRsvpExists } from "@/lib/rsvp.functions";
import { CornerFlourishes, Divider } from "./Ornaments";

const STORAGE_KEY = "pn-rsvp";

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  mobile: z.string().trim().default(""),
  attendance: z.enum(["yes", "unsure", "no"]),
  adults: z.coerce.number().int().min(1).max(50).default(2),
  children: z.coerce.number().int().min(0).max(50).default(0),
  attendingDays: z.enum(["24", "25", "both"]).default("both"),
  message: z.string().trim().default(""),
});

type FormValues = z.input<typeof formSchema>;
type Saved = { id: string; values: z.output<typeof formSchema> };

const EASE = [0.22, 0.61, 0.24, 1] as const;

const ATTENDANCE_CHOICES = [
  { value: "yes", label: "Obviously." },
  { value: "unsure", label: "Still figuring it out." },
  { value: "no", label: "Sadly, can't make it." },
] as const;

const DAY_CHOICES = [
  { value: "both", label: "Both" },
  { value: "24", label: "24 Feb" },
  { value: "25", label: "25 Feb" },
] as const;

const labelClass = "block text-[0.62rem] sm:text-[0.66rem] uppercase tracking-[0.24em] text-gold-deep font-semibold";
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
    setValue,
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
  const attendingDays = watch("attendingDays");
  const adultsCount = watch("adults");
  const childrenCount = watch("children");

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
    const parsed = formSchema.parse(raw);
    try {
      const result =
        editing && saved
          ? await update({ data: { ...parsed, id: saved.id } })
          : await submit({ data: parsed });
      const record: Saved = { id: result.id, values: parsed };
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

  const showSuccess = saved && !editing;

  return (
    <section id="rsvp" className="canvas relative pb-20 sm:pb-28">
      <header className="flex flex-col items-center text-center">
        <h2 className="font-creative text-3xl sm:text-4xl font-semibold tracking-widest text-burgundy uppercase">
          Are You In?
        </h2>
        <Divider className="mt-4" />
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {showSuccess ? (
          <motion.article
            key="success"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="paper inner-frame grain relative mt-8 sm:mt-12 overflow-hidden px-6 py-10 sm:px-12 sm:py-14 text-center rounded-3xl shadow-lift"
          >
            <CornerFlourishes />

            <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#F7DF94] bg-[radial-gradient(circle_at_32%_32%,_#FFF4C2_0%,_#E5C158_38%,_#B88A1A_78%,_#594004_100%)] text-[#3D2700] shadow-[0_0_25px_rgba(229,193,88,0.35)]">
              {saved.values.attendance === "no" ? (
                <Heart size={20} strokeWidth={2.2} />
              ) : (
                <Check size={22} strokeWidth={2.4} />
              )}
            </div>

            {saved.values.attendance === "yes" && (
              <>
                <h3 className="font-creative mt-5 text-2xl sm:text-3xl font-semibold text-burgundy">
                  Perfect. See you in Rajkot. &hearts;
                </h3>
                <p className="font-display italic text-sm sm:text-base text-gold-deep mt-1.5">
                  We'll take care of the rest.
                </p>
              </>
            )}

            {saved.values.attendance === "unsure" && (
              <>
                <h3 className="font-creative mt-5 text-2xl sm:text-3xl font-semibold text-burgundy">
                  Noted with love, {saved.values.fullName.split(" ")[0]}.
                </h3>
                <p className="font-display italic text-sm sm:text-base text-gold-deep mt-1.5">
                  Let us know whenever you're ready.
                </p>
              </>
            )}

            {saved.values.attendance === "no" && (
              <>
                <h3 className="font-creative mt-5 text-2xl sm:text-3xl font-semibold text-burgundy">
                  You'll be dearly missed, {saved.values.fullName.split(" ")[0]}.
                </h3>
                <p className="font-display italic text-sm sm:text-base text-gold-deep mt-1.5">
                  Sending you our warmest love from afar.
                </p>
              </>
            )}

            <Divider className="my-6" />

            {saved.values.attendance === "yes" && (
              <div className="hairline-gold mx-auto max-w-sm rounded-xl bg-ivory/80 overflow-hidden shadow-sm text-left">
                <dl className="divide-y divide-gold/20">
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                      Guest
                    </dt>
                    <dd className="font-display text-sm text-burgundy">{saved.values.fullName}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                      Attending Days
                    </dt>
                    <dd className="font-display text-sm text-burgundy">
                      {saved.values.attendingDays === "both"
                        ? "Both Days (24 & 25 Feb)"
                        : `${saved.values.attendingDays} Feb 2027`}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                      Count
                    </dt>
                    <dd className="font-display text-sm text-burgundy">
                      {saved.values.adults} Adults
                      {saved.values.children > 0 ? `, ${saved.values.children} Children` : ""}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={startEdit}
                className="btn-3d-secondary w-full sm:w-auto !px-6 !py-3 text-[0.65rem] tracking-[0.2em] whitespace-nowrap"
              >
                Edit Response
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-block text-[0.6rem] uppercase tracking-[0.2em] text-warmgrey hover:text-burgundy transition-colors underline underline-offset-4 cursor-pointer whitespace-nowrap py-2"
              >
                Submit Another
              </button>
            </div>
          </motion.article>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="paper inner-frame grain relative mt-8 sm:mt-12 space-y-6 px-5 py-8 sm:px-10 sm:py-10 rounded-3xl shadow-lift"
          >
            <CornerFlourishes />

            {/* 3 Main Choice Cards */}
            <div>
              <label className={`${labelClass} text-center mb-3`}>
                Will you be celebrating with us?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {ATTENDANCE_CHOICES.map((choice) => {
                  const selected = attendance === choice.value;
                  return (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => setValue("attendance", choice.value)}
                      className={`relative cursor-pointer rounded-2xl p-3.5 text-center transition-all duration-300 border ${
                        selected
                          ? "border-[#E5C158] bg-gradient-to-r from-[#8B1A2D] via-[#671224] to-[#480A17] text-ivory shadow-md"
                          : "border-gold/40 bg-ivory/80 text-charcoal hover:border-gold hover:bg-ivory-deep/60"
                      }`}
                    >
                      <span className="font-display text-sm sm:text-base font-medium">
                        {choice.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progressive Fields */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5 pt-2"
            >
              {/* Name Input (Always shown) */}
              <div>
                <label className={labelClass} htmlFor="fullName">
                  Your Full Name
                </label>
                <input
                  id="fullName"
                  className={fieldClass}
                  placeholder="e.g. Parth Panjwani"
                  autoComplete="name"
                  {...register("fullName")}
                />
                <FieldError message={errors.fullName?.message} />
              </div>

              {/* Attending Guests Details */}
              {attendance === "yes" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-5 overflow-hidden"
                >
                  {/* Number of Attendees */}
                  <div>
                    <label className={labelClass}>Number Attending</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between rounded-xl border border-gold/45 bg-ivory/90 px-3 py-2">
                        <span className="text-xs text-charcoal font-medium">Adults</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setValue("adults", Math.max(1, (adultsCount || 1) - 1))}
                            className="h-7 w-7 rounded-lg border border-gold/40 bg-ivory text-burgundy font-semibold text-sm flex items-center justify-center hover:bg-gold/15 active:scale-95"
                          >
                            &minus;
                          </button>
                          <span className="w-5 text-center font-display text-base font-medium text-burgundy">
                            {adultsCount || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setValue("adults", Math.min(20, (adultsCount || 1) + 1))}
                            className="h-7 w-7 rounded-lg border border-gold/40 bg-ivory text-burgundy font-semibold text-sm flex items-center justify-center hover:bg-gold/15 active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-gold/45 bg-ivory/90 px-3 py-2">
                        <span className="text-xs text-charcoal font-medium">Children</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setValue("children", Math.max(0, (childrenCount || 0) - 1))}
                            className="h-7 w-7 rounded-lg border border-gold/40 bg-ivory text-burgundy font-semibold text-sm flex items-center justify-center hover:bg-gold/15 active:scale-95"
                          >
                            &minus;
                          </button>
                          <span className="w-5 text-center font-display text-base font-medium text-burgundy">
                            {childrenCount || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => setValue("children", Math.min(10, (childrenCount || 0) + 1))}
                            className="h-7 w-7 rounded-lg border border-gold/40 bg-ivory text-burgundy font-semibold text-sm flex items-center justify-center hover:bg-gold/15 active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Which Days */}
                  <div>
                    <label className={labelClass}>Which Days?</label>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {DAY_CHOICES.map((day) => {
                        const isDaySelected = attendingDays === day.value;
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => setValue("attendingDays", day.value)}
                            className={`cursor-pointer rounded-xl py-2.5 text-center text-[0.78rem] font-medium transition-all duration-200 border ${
                              isDaySelected
                                ? "border-[#E5C158] bg-gradient-to-r from-[#8B1A2D] via-[#671224] to-[#480A17] text-ivory shadow-sm"
                                : "border-gold/40 bg-ivory/90 text-charcoal hover:border-gold/80"
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {serverError && (
                <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-[0.75rem] text-destructive">
                  {serverError}
                </p>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-3d-primary flex w-full items-center justify-center gap-2 !py-3.5 text-[0.7rem] tracking-[0.22em] whitespace-nowrap cursor-pointer disabled:cursor-default"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10 whitespace-nowrap">
                        {editing
                          ? "Update RSVP"
                          : attendance === "yes"
                            ? "Confirm RSVP"
                            : attendance === "unsure"
                              ? "Keep Me Posted"
                              : "Send Warm Wishes"}
                      </span>
                      <ArrowRight size={14} strokeWidth={2} />
                    </>
                  )}
                </button>

                {editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="mt-3 w-full text-center text-[0.62rem] uppercase tracking-[0.2em] text-warmgrey hover:text-burgundy cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
