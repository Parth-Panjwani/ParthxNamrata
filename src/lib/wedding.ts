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

export const CELEBRATIONS: { day: string; label: string; date: string; events: CelebrationEvent[] }[] = [
  {
    day: "Day 1",
    label: "Wednesday",
    date: "24 February 2027",
    events: [
      {
        title: "Haldi + Carnival",
        description: "Turmeric, music, pool party and festive celebrations.",
        icon: "haldi",
      },
      {
        title: "Sangeet Night",
        description: "An evening of dance performances, music & cocktails.",
        icon: "sangeet",
      },
    ],
  },
  {
    day: "Day 2",
    label: "Thursday",
    date: "25 February 2027",
    events: [
      {
        title: "Baraat & Wedding",
        description: "Royal procession followed by sacred vows & pheras.",
        icon: "wedding",
      },
      {
        title: "Reception & Dinner",
        description: "Celebration with the newlyweds followed by royal dinner.",
        icon: "reception",
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
  { value: "24", label: "24 Feb Only" },
  { value: "25", label: "25 Feb Only" },
] as const;

export const TRAVEL_MODES = ["Flight", "Train", "Car", "Bus", "Other"] as const;

export function attendanceLabel(value: string) {
  return ATTENDANCE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function daysLabel(value: string) {
  return DAY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
