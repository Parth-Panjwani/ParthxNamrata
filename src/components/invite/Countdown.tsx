import { useEffect, useState } from "react";
import { WEDDING_START_ISO } from "@/lib/wedding";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

export function Countdown() {
  const target = new Date(WEDDING_START_ISO).getTime();
  // Start from a stable value so SSR markup matches the first client render,
  // then take over on the client.
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const values = t ? [t.days, t.hours, t.minutes, t.seconds] : [0, 0, 0, 0];


  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {UNITS.map((unit, i) => (
        <div
          key={unit}
          className="hairline-gold relative bg-ivory/70 px-1 py-3 text-center sm:py-4"
        >
          <div className="font-display text-2xl leading-none text-burgundy tabular-nums sm:text-3xl">
            {String(values[i]).padStart(2, "0")}
          </div>
          <div className="mt-1.5 text-[0.5rem] uppercase tracking-[0.22em] text-warmgrey sm:text-[0.6rem]">
            {unit}
          </div>
        </div>
      ))}
    </div>
  );
}
