import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAdminOverview = createServerFn({ method: "GET" }).handler(
  async () => {
    let responsesData: unknown[] = [];
    let groupsData: unknown[] = [];

    const withTimeout = async <T>(
      fn: () => Promise<T>,
      timeoutMs = 4500,
    ): Promise<T | null> => {
      return Promise.race([
        fn(),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), timeoutMs),
        ),
      ]);
    };

    try {
      const { supabaseAdmin } =
        await import("@/integrations/supabase/client.server");
      const res = await withTimeout(async () =>
        supabaseAdmin
          .from("rsvp_responses")
          .select("*")
          .order("created_at", { ascending: false }),
      );
      if (res && !res.error && res.data) {
        responsesData = res.data;
      }
    } catch (err) {
      console.error("rsvp_responses query error:", err);
    }

    try {
      const { supabaseAdmin } =
        await import("@/integrations/supabase/client.server");
      const res = await withTimeout(async () =>
        supabaseAdmin.from("invitation_groups").select("*").order("name"),
      );
      if (res && !res.error && res.data) {
        groupsData = res.data;
      }
    } catch (err) {
      console.error("invitation_groups query error:", err);
    }

    return { responses: responsesData, groups: groupsData };
  },
);

export const createInvitationGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(120),
        side: z.enum(["bride", "groom", "both"]),
        guestCount: z.number().int().min(1).max(200),
        invitedDays: z.enum(["24", "25", "both"]),
        contactMobile: z.string().trim().max(20).optional().or(z.literal("")),
        notes: z.string().trim().max(500).optional().or(z.literal("")),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const slug = `${data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabaseAdmin.from("invitation_groups").insert({
      name: data.name,
      slug,
      side: data.side,
      guest_count: data.guestCount,
      invited_days: data.invitedDays,
      contact_mobile: data.contactMobile || null,
      notes: data.notes || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateInvitationGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string(),
        name: z.string().trim().min(2).max(120),
        side: z.enum(["bride", "groom", "both"]),
        guestCount: z.number().int().min(1).max(200),
        invitedDays: z.enum(["24", "25", "both"]),
        contactMobile: z.string().trim().max(20).optional().or(z.literal("")),
        notes: z.string().trim().max(500).optional().or(z.literal("")),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("invitation_groups")
      .update({
        name: data.name,
        side: data.side,
        guest_count: data.guestCount,
        invited_days: data.invitedDays,
        contact_mobile: data.contactMobile || null,
        notes: data.notes || null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteInvitationGroup = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("invitation_groups")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createRsvpResponse = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(1, "Name is required"),
        mobile: z.string().trim().min(1, "Mobile is required"),
        attendance: z.enum(["yes", "some", "unsure", "no"]).default("yes"),
        adults: z.number().int().min(0).default(2),
        children: z.number().int().min(0).default(0),
        attendingDays: z.string().default("all"),
        travelMode: z.string().optional().nullable(),
        travelCity: z.string().optional().nullable(),
        arrivalDate: z.string().optional().nullable(),
        arrivalTime: z.string().optional().nullable(),
        message: z.string().optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("rsvp_responses")
      .insert({
        full_name: data.fullName,
        mobile: data.mobile,
        attendance: data.attendance,
        adults: data.adults,
        children: data.children,
        attending_days: data.attendingDays,
        travel_mode: data.travelMode || null,
        travel_city: data.travelCity || null,
        arrival_date: data.arrivalDate || null,
        arrival_time: data.arrivalTime || null,
        message: data.message || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, data: inserted };
  });

export const updateRsvpResponse = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string(),
        fullName: z.string().trim().min(1, "Name is required"),
        mobile: z.string().trim().min(1, "Mobile is required"),
        attendance: z.enum(["yes", "some", "unsure", "no"]),
        adults: z.number().int().min(0),
        children: z.number().int().min(0),
        attendingDays: z.string(),
        travelMode: z.string().optional().nullable(),
        travelCity: z.string().optional().nullable(),
        arrivalDate: z.string().optional().nullable(),
        arrivalTime: z.string().optional().nullable(),
        message: z.string().optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("rsvp_responses")
      .update({
        full_name: data.fullName,
        mobile: data.mobile,
        attendance: data.attendance,
        adults: data.adults,
        children: data.children,
        attending_days: data.attendingDays,
        travel_mode: data.travelMode || null,
        travel_city: data.travelCity || null,
        arrival_date: data.arrivalDate || null,
        arrival_time: data.arrivalTime || null,
        message: data.message || null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRsvpResponse = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("rsvp_responses")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, id: data.id };
  });
