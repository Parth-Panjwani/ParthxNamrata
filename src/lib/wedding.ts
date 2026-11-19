export const COUPLE = {
  bride: "Namrata Asnani",
  groom: "Parth Panjwani",
  brideShort: "Namrata",
  groomShort: "Parth",
  monogram: "P & N",
} as const;

export const WEDDING_DATE_LABEL = "24 & 25 February 2027";
/** Baraat / Wedding start muhurat for countdown */
export const WEDDING_START_ISO = "2027-02-24T10:00:00+05:30";

export const QUOTE =
  "Two beautiful days filled with love, laughter and lifelong memories.";

export type CelebrationEvent = {
  time: string; // e.g. "10:00 AM"
  label: string; // fancy display name
  sublabel: string; // short descriptor
  icon: string; // emoji
};

export type CelebrationDay = {
  dayNum: string;
  dayName: string;
  dateNum: string;
  month: string;
  year: string;
  fullDate: string;
  events: CelebrationEvent[];
};

export const CELEBRATION_DATES: CelebrationDay[] = [
  {
    dayNum: "Day 01",
    dayName: "Wednesday",
    dateNum: "24",
    month: "February",
    year: "2027",
    fullDate: "Wednesday, 24 February 2027",
    events: [
      {
        time: "Morning",
        label: "Carnival",
        sublabel: "The Grand Celebration",
        icon: "🎪",
      },
      {
        time: "Evening",
        label: "Sur Sandhya",
        sublabel: "The Sangeet Celebration",
        icon: "✨",
      },
    ],
  },
  {
    dayNum: "Day 02",
    dayName: "Thursday",
    dateNum: "25",
    month: "February",
    year: "2027",
    fullDate: "Thursday, 25 February 2027",
    events: [
      {
        time: "Evening",
        label: "The Wedding",
        sublabel: "Sacred Vows & Pheras",
        icon: "💍",
      },
      {
        time: "Followed By",
        label: "The Reception",
        sublabel: "Celebration & Dinner",
        icon: "🥂",
      },
    ],
  },
];

export const EVENTS_NOTE =
  "Detailed timings and further details will be shared closer to the celebrations.";

export const VENUE = {
  name: "Prabhu Farms & Resort",
  subtitle: "By King's Kraft, Rajkot",
  tagline: "Celebration Lawns & Resort",
  address: "Prabhu Farms & Resort By King's Kraft, Rajkot, Gujarat",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Prabhu+Farms+%26+Resort+By+King%E2%80%99s+Kraft+Rajkot",
  contactName: "Host",
  contactPhone: "+919879184143",
  contactPhoneLabel: "+91 98791 84143",
};

export const ATTENDANCE_OPTIONS = [
  { value: "yes", label: "Attending" },
  { value: "some", label: "Few Family Members" },
  { value: "unsure", label: "Not Sure" },
  { value: "no", label: "Cannot Attend" },
] as const;

export const DAY_OPTIONS = [
  { value: "both", label: "Both Days" },
  { value: "24", label: "24 Feb — Carnival & Sur Sandhya" },
  { value: "25", label: "25 Feb — Wedding & Reception" },
] as const;

export const TRAVEL_MODES = ["Flight", "Train", "Car", "Bus", "Other"] as const;

export function attendanceLabel(value: string) {
  return ATTENDANCE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function daysLabel(value: string) {
  return DAY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
