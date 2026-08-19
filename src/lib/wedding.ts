export const COUPLE = {
  bride: "Namrata Asnani",
  groom: "Parth Panjwani",
  brideShort: "Namrata",
  groomShort: "Parth",
  monogram: "P & N",
} as const;

export const WEDDING_DATE_LABEL = "24 & 25 February 2027";
/** Baraat / Wedding start muhurat for countdown */
export const WEDDING_START_ISO = "2027-02-24T12:00:00+05:30";

export const QUOTE = "Two beautiful days filled with love, laughter and lifelong memories.";

export type CelebrationEvent = {
  title: string;
  description: string;
  icon: "haldi" | "sangeet" | "wedding" | "reception";
};

export const CELEBRATIONS: {
  date: string;
  dayName: string;
  fullDate: string;
  events: CelebrationEvent[];
}[] = [
  {
    date: "24/02/2027",
    dayName: "Wednesday",
    fullDate: "Wednesday, 24 February 2027",
    events: [
      {
        title: "Haldi + Carnival",
        description: "Colours, music & poolside chaos.",
        icon: "haldi",
      },
      {
        title: "Sangeet Night",
        description: "Music, moves & a little friendly competition.",
        icon: "sangeet",
      },
    ],
  },
  {
    date: "25/02/2027",
    dayName: "Thursday",
    fullDate: "Thursday, 25 February 2027",
    events: [
      {
        title: "Wedding & Reception",
        description: "Baraat. Pheras. Dinner. And the beginning of forever.",
        icon: "wedding",
      },
    ],
  },
];

export const VENUE = {
  name: "Prabhu Farms & Resort",
  subtitle: "By King’s Kraft, Rajkot",
  tagline: "Celebration Lawns & Resort",
  address: "Prabhu Farms & Resort By King’s Kraft, Rajkot, Gujarat",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Prabhu+Farms+%26+Resort+By+King%E2%80%99s+Kraft+Rajkot",
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
  { value: "24", label: "24/02/2027" },
  { value: "25", label: "25/02/2027" },
] as const;

export const TRAVEL_MODES = ["Flight", "Train", "Car", "Bus", "Other"] as const;

export function attendanceLabel(value: string) {
  return ATTENDANCE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function daysLabel(value: string) {
  return DAY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
