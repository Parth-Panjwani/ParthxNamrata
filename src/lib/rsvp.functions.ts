import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const rsvpSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  mobile: z
    .string()
    .trim()
    .min(7, "Please enter a valid mobile number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) are allowed"),
  attendance: z.enum(["yes", "some", "unsure", "no"]),
  adults: z.number().int().min(0).max(50),
  children: z.number().int().min(0).max(50),
  attendingDays: z.enum(["24", "25", "both"]),
  travelCity: z.string().trim().max(120).optional().or(z.literal("")),
  travelMode: z.string().trim().max(40).optional().or(z.literal("")),
  arrivalDate: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

async function tryInsertRsvp(data: RsvpInput): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let payload: Record<string, any> = {
    full_name: data.fullName,
    guest_name: data.fullName,
    name: data.fullName,
    mobile: data.mobile,
    attendance: data.attendance,
    adults: data.adults,
    children: data.children,
    attending_days: data.attendingDays,
    travel_city: data.travelCity || null,
    travel_mode: data.travelMode || null,
    arrival_date: data.arrivalDate || null,
    message: data.message || null,
  };

  for (let attempt = 0; attempt < 8; attempt++) {
    const res = await supabaseAdmin.from("rsvp_responses").insert(payload as any).select("id").single();
    if (!res.error && res.data?.id) {
      return res.data.id;
    }

    const msg = res.error?.message || "";

    // If PostgreSQL throws NOT NULL constraint on an unexpected legacy column
    if (msg.includes("violates not-null constraint")) {
      const match = msg.match(/column "(.*?)"/);
      const col = match?.[1];
      if (col) {
        if (col.includes("name")) payload[col] = data.fullName;
        else if (col.includes("mobile") || col.includes("phone")) payload[col] = data.mobile;
        else if (col.includes("attend")) payload[col] = data.attendance;
        else if (col.includes("count") || col.includes("adult")) payload[col] = (data.adults || 0) + (data.children || 0);
        else payload[col] = "";
        continue;
      }
    }

    // If PostgREST throws column not found in schema cache
    if (msg.includes("Could not find the") && msg.includes("in the schema cache")) {
      const match = msg.match(/Could not find the '(.*?)' column/);
      const col = match?.[1];
      if (col && col in payload) {
        delete payload[col];
        continue;
      }
    }

    throw new Error(msg);
  }

  throw new Error("Failed to submit RSVP response after schema adaptation.");
}

async function tryUpdateRsvp(id: string, data: RsvpInput): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let payload: Record<string, any> = {
    full_name: data.fullName,
    guest_name: data.fullName,
    name: data.fullName,
    mobile: data.mobile,
    attendance: data.attendance,
    adults: data.adults,
    children: data.children,
    attending_days: data.attendingDays,
    travel_city: data.travelCity || null,
    travel_mode: data.travelMode || null,
    arrival_date: data.arrivalDate || null,
    message: data.message || null,
  };

  for (let attempt = 0; attempt < 8; attempt++) {
    const res = await supabaseAdmin.from("rsvp_responses").update(payload as any).eq("id", id);
    if (!res.error) return id;

    const msg = res.error?.message || "";

    if (msg.includes("violates not-null constraint")) {
      const match = msg.match(/column "(.*?)"/);
      const col = match?.[1];
      if (col) {
        if (col.includes("name")) payload[col] = data.fullName;
        else if (col.includes("mobile") || col.includes("phone")) payload[col] = data.mobile;
        else if (col.includes("attend")) payload[col] = data.attendance;
        else payload[col] = "";
        continue;
      }
    }

    if (msg.includes("Could not find the") && msg.includes("in the schema cache")) {
      const match = msg.match(/Could not find the '(.*?)' column/);
      const col = match?.[1];
      if (col && col in payload) {
        delete payload[col];
        continue;
      }
    }

    throw new Error(msg);
  }

  throw new Error("Failed to update RSVP response after schema adaptation.");
}

/**
 * Public endpoint: guests submit their RSVP.
 */
export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => rsvpSchema.parse(data))
  .handler(async ({ data }) => {
    const id = await tryInsertRsvp(data);
    return { id };
  });

/**
 * Public endpoint: a guest edits their own response.
 */
export const updateRsvp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    rsvpSchema.extend({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    await tryUpdateRsvp(id, rest);
    return { id };
  });

/**
 * Helper endpoint: check if a saved RSVP ID still exists in Supabase.
 */
export const checkRsvpExists = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("rsvp_responses")
      .select("id")
      .eq("id", data.id)
      .maybeSingle();
    return { exists: !error && !!row };
  });
