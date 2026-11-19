import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAdminOverview = createServerFn({ method: "GET" }).handler(
  async () => {
    let responsesData: unknown[] = [];
    let groupsData: unknown[] = [];

    const withTimeout = async <T>(
      fn: () => Promise<T>,
      timeoutMs = 3500,
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
        supabaseAdmin.from("invitation_groups").select("*"),
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
    return { ok: true };
  });
