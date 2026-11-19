import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  Download,
  Loader2,
  LogOut,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Check,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  Car,
  Plane,
  Train,
  Bus,
  MapPin,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  createInvitationGroup,
  updateInvitationGroup,
  deleteInvitationGroup,
  createRsvpResponse,
  updateRsvpResponse,
  deleteRsvpResponse,
  getAdminOverview,
} from "@/lib/admin.functions";
import { attendanceLabel, daysLabel } from "@/lib/wedding";
import { Monogram } from "@/components/invite/Ornaments";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "RSVP Dashboard — Parth & Namrata" },
      {
        name: "description",
        content: "Track RSVPs, invitation groups and guest counts.",
      },
      { property: "og:title", content: "RSVP Dashboard — Parth & Namrata" },
      {
        property: "og:description",
        content: "Track RSVPs and invitation groups.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Response = {
  id: string;
  full_name: string;
  mobile: string;
  attendance: "yes" | "some" | "no" | "unsure";
  adults: number;
  children: number;
  attending_days: string;
  travel_mode: string | null;
  travel_city: string | null;
  arrival_date: string | null;
  arrival_time?: string | null;
  message: string | null;
  created_at: string;
};

type Group = {
  id: string;
  name: string;
  side: string;
  guest_count: number;
  invited_days: string;
  contact_mobile: string | null;
  notes: string | null;
};

function AdminPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fetchOverview = useServerFn(getAdminOverview);
  const addGroup = useServerFn(createInvitationGroup);
  const removeGroup = useServerFn(deleteInvitationGroup);
  const removeResponse = useServerFn(deleteRsvpResponse);

  const [activeTab, setActiveTab] = useState<"responses" | "groups">(
    "responses",
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [deletedResponseIds, setDeletedResponseIds] = useState<Set<string>>(
    new Set(),
  );
  const [deletedGroupIds, setDeletedGroupIds] = useState<Set<string>>(
    new Set(),
  );
  const [editingRsvp, setEditingRsvp] = useState<Response | null>(null);
  const [showAddRsvpModal, setShowAddRsvpModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const addRsvpFn = useServerFn(createRsvpResponse);
  const updateRsvpFn = useServerFn(updateRsvpResponse);
  const updateGroupFn = useServerFn(updateInvitationGroup);

  function notify(type: "success" | "error", text: string) {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  }

  const [draft, setDraft] = useState({
    name: "",
    side: "both" as "bride" | "groom" | "both",
    guestCount: 2,
    invitedDays: "both" as "24" | "25" | "both",
    contactMobile: "",
    notes: "",
  });

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview({}),
  });

  async function handleDeleteResponse(r: Response) {
    if (
      !confirm(
        `Are you sure you want to delete the RSVP record for "${r.full_name}"?`,
      )
    ) {
      return;
    }
    setDeletedResponseIds((prev) => new Set([...prev, r.id]));
    notify("success", `RSVP for "${r.full_name}" deleted.`);

    try {
      try {
        await removeResponse({ data: { id: r.id } });
      } catch (serverErr) {
        console.warn("Server delete warning:", serverErr);
      }
      const { error } = await supabase
        .from("rsvp_responses")
        .delete()
        .eq("id", r.id);
      if (error) console.warn("Client delete warning:", error);
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    } catch (err) {
      setDeletedResponseIds((prev) => {
        const next = new Set(prev);
        next.delete(r.id);
        return next;
      });
      notify(
        "error",
        `Could not delete: ${err instanceof Error ? err.message : "Error"}`,
      );
    }
  }

  async function handleDeleteGroup(g: Group) {
    if (
      !confirm(
        `Are you sure you want to delete invitation group "${g.name || "Group"}"?`,
      )
    ) {
      return;
    }
    setDeletedGroupIds((prev) => new Set([...prev, g.id]));
    notify("success", `Group "${g.name}" deleted.`);

    try {
      try {
        await removeGroup({ data: { id: g.id } });
      } catch (serverErr) {
        console.warn("Server delete warning:", serverErr);
      }
      const { error } = await supabase
        .from("invitation_groups")
        .delete()
        .eq("id", g.id);
      if (error) console.warn("Client delete warning:", error);
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    } catch (err) {
      setDeletedGroupIds((prev) => {
        const next = new Set(prev);
        next.delete(g.id);
        return next;
      });
      notify(
        "error",
        `Could not delete group: ${err instanceof Error ? err.message : "Error"}`,
      );
    }
  }

  async function handleSaveEditedRsvp(updated: Response) {
    setIsMutating(true);
    try {
      try {
        await updateRsvpFn({
          data: {
            id: updated.id,
            fullName: updated.full_name,
            mobile: updated.mobile,
            attendance: updated.attendance,
            adults: Number(updated.adults) || 1,
            children: Number(updated.children) || 0,
            attendingDays: updated.attending_days,
            travelMode: updated.travel_mode || null,
            travelCity: updated.travel_city || null,
            arrivalDate: updated.arrival_date || null,
            arrivalTime: updated.arrival_time || null,
            message: updated.message || null,
          },
        });
      } catch (serverErr) {
        console.warn("Server update warning:", serverErr);
      }

      const { error } = await supabase
        .from("rsvp_responses")
        .update({
          full_name: updated.full_name,
          mobile: updated.mobile,
          attendance: updated.attendance,
          adults: Number(updated.adults) || 1,
          children: Number(updated.children) || 0,
          attending_days: updated.attending_days,
          travel_mode: updated.travel_mode || null,
          travel_city: updated.travel_city || null,
          arrival_date: updated.arrival_date || null,
          arrival_time: updated.arrival_time || null,
          message: updated.message || null,
        })
        .eq("id", updated.id);

      if (error) console.warn("Client update warning:", error);

      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      setEditingRsvp(null);
      notify("success", `Updated RSVP for "${updated.full_name}".`);
    } catch (err) {
      notify(
        "error",
        `Could not update: ${err instanceof Error ? err.message : "Error"}`,
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleCreateRsvp(newRsvp: {
    fullName: string;
    mobile: string;
    attendance: "yes" | "some" | "unsure" | "no";
    adults: number;
    children: number;
    attendingDays: string;
    travelMode?: string;
    travelCity?: string;
    arrivalDate?: string;
    arrivalTime?: string;
    message?: string;
  }) {
    setIsMutating(true);
    try {
      try {
        await addRsvpFn({
          data: {
            fullName: newRsvp.fullName,
            mobile: newRsvp.mobile,
            attendance: newRsvp.attendance,
            adults: newRsvp.adults,
            children: newRsvp.children,
            attendingDays: newRsvp.attendingDays,
            travelMode: newRsvp.travelMode || null,
            travelCity: newRsvp.travelCity || null,
            arrivalDate: newRsvp.arrivalDate || null,
            arrivalTime: newRsvp.arrivalTime || null,
            message: newRsvp.message || null,
          },
        });
      } catch (serverErr) {
        console.warn("Server create warning:", serverErr);
      }

      const { error } = await supabase.from("rsvp_responses").insert({
        full_name: newRsvp.fullName,
        mobile: newRsvp.mobile,
        attendance: newRsvp.attendance,
        adults: newRsvp.adults,
        children: newRsvp.children,
        attending_days: newRsvp.attendingDays,
        travel_mode: newRsvp.travelMode || null,
        travel_city: newRsvp.travelCity || null,
        arrival_date: newRsvp.arrivalDate || null,
        arrival_time: newRsvp.arrivalTime || null,
        message: newRsvp.message || null,
      });

      if (error) console.warn("Client create warning:", error);

      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      setShowAddRsvpModal(false);
      notify("success", `Added guest RSVP for "${newRsvp.fullName}".`);
    } catch (err) {
      notify(
        "error",
        `Could not add RSVP: ${err instanceof Error ? err.message : "Error"}`,
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleSaveEditedGroup(updated: Group) {
    setIsMutating(true);
    try {
      try {
        await updateGroupFn({
          data: {
            id: updated.id,
            name: updated.name,
            side: updated.side as "bride" | "groom" | "both",
            guestCount: Number(updated.guest_count) || 1,
            invitedDays: updated.invited_days as "24" | "25" | "both",
            contactMobile: updated.contact_mobile || "",
            notes: updated.notes || "",
          },
        });
      } catch (serverErr) {
        console.warn("Server update group warning:", serverErr);
      }

      const { error } = await supabase
        .from("invitation_groups")
        .update({
          name: updated.name,
          side: updated.side,
          guest_count: Number(updated.guest_count) || 1,
          invited_days: updated.invited_days,
          contact_mobile: updated.contact_mobile || null,
          notes: updated.notes || null,
        })
        .eq("id", updated.id);

      if (error) console.warn("Client update group warning:", error);

      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      setEditingGroup(null);
      notify("success", `Updated invitation group "${updated.name}".`);
    } catch (err) {
      notify(
        "error",
        `Could not update group: ${err instanceof Error ? err.message : "Error"}`,
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    setIsMutating(true);
    try {
      try {
        await addGroup({ data: draft });
      } catch (serverErr) {
        console.warn("Server add group warning:", serverErr);
      }

      const slug = `${draft.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;

      const { error } = await supabase.from("invitation_groups").insert({
        name: draft.name,
        slug,
        side: draft.side,
        guest_count: draft.guestCount,
        invited_days: draft.invitedDays,
        contact_mobile: draft.contactMobile || null,
        notes: draft.notes || null,
      });

      if (error) console.warn("Client add group warning:", error);

      setShowForm(false);
      setDraft({
        name: "",
        side: "both",
        guestCount: 2,
        invitedDays: "both",
        contactMobile: "",
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      notify("success", `Added invitation group "${draft.name}".`);
    } catch (err) {
      notify(
        "error",
        `Could not create group: ${err instanceof Error ? err.message : "Error"}`,
      );
    } finally {
      setIsMutating(false);
    }
  }

  const responses = useMemo(
    () =>
      ((data?.responses ?? []) as Response[]).filter(
        (r) => !deletedResponseIds.has(r.id),
      ),
    [data?.responses, deletedResponseIds],
  );
  const groups = useMemo(
    () =>
      ((data?.groups ?? []) as Group[]).filter((g) => !deletedGroupIds.has(g.id)),
    [data?.groups, deletedGroupIds],
  );

  const summary = useMemo(() => {
    const attendingList = responses.filter(
      (r) => r.attendance === "yes" || r.attendance === "some",
    );
    const totalHeads = attendingList.reduce(
      (sum, r) => sum + (Number(r.adults) || 0) + (Number(r.children) || 0),
      0,
    );
    const totalAdults = attendingList.reduce(
      (sum, r) => sum + (Number(r.adults) || 0),
      0,
    );
    const totalChildren = attendingList.reduce(
      (sum, r) => sum + (Number(r.children) || 0),
      0,
    );
    const declinedCount = responses.filter((r) => r.attendance === "no").length;
    const unsureCount = responses.filter(
      (r) => r.attendance === "unsure",
    ).length;
    const totalInvited = groups.reduce(
      (sum, g) => sum + (Number(g.guest_count) || 0),
      0,
    );

    return {
      totalResponses: responses.length,
      attendingGroups: attendingList.length,
      totalHeads,
      totalAdults,
      totalChildren,
      declined: declinedCount,
      unsure: unsureCount,
      invitedGroups: groups.length,
      totalInvited,
      pending: Math.max(0, groups.length - responses.length),
    };
  }, [responses, groups]);

  const eventBreakdown = useMemo(() => {
    const counts = {
      carnival: 0,
      sur_sandhya: 0,
      wedding: 0,
      reception: 0,
    };
    for (const r of responses) {
      if (r.attendance === "yes" || r.attendance === "some") {
        const evs = parseEventsList(r.attending_days);
        const pax = (Number(r.adults) || 1) + (Number(r.children) || 0);
        if (evs.includes("carnival")) counts.carnival += pax;
        if (evs.includes("sur_sandhya")) counts.sur_sandhya += pax;
        if (evs.includes("wedding")) counts.wedding += pax;
        if (evs.includes("reception")) counts.reception += pax;
      }
    }
    return counts;
  }, [responses]);

  const travelBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      Car: 0,
      Flight: 0,
      Train: 0,
      Bus: 0,
      Other: 0,
    };
    for (const r of responses) {
      if (r.attendance === "yes" || r.attendance === "some") {
        const mode = r.travel_mode?.trim();
        if (mode && counts[mode] !== undefined) {
          counts[mode]++;
        } else if (mode) {
          counts.Other++;
        }
      }
    }
    return counts;
  }, [responses]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return responses.filter((r) => {
      const matchesFilter = filter === "all" || r.attendance === filter;
      const matchesSearch =
        !q ||
        r.full_name.toLowerCase().includes(q) ||
        r.mobile.includes(q) ||
        (r.travel_mode ?? "").toLowerCase().includes(q) ||
        (r.travel_city ?? "").toLowerCase().includes(q) ||
        (r.arrival_date ?? "").toLowerCase().includes(q) ||
        (r.attending_days ?? "").toLowerCase().includes(q) ||
        (r.message ?? "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [responses, search, filter]);

  function parseEventsList(raw?: string | null): string[] {
    if (!raw) return [];
    if (raw === "all" || raw === "both") {
      return ["carnival", "sur_sandhya", "wedding", "reception"];
    }
    if (raw === "24") return ["carnival", "sur_sandhya"];
    if (raw === "25") return ["wedding", "reception"];
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  function renderEventBadges(raw?: string | null) {
    const events = parseEventsList(raw);
    if (events.length === 0) {
      return <span className="text-warmgrey text-xs">&mdash;</span>;
    }

    const eventMeta: Record<string, { label: string; icon: string }> = {
      carnival: { label: "Carnival", icon: "🎪" },
      sur_sandhya: { label: "Sur Sandhya", icon: "✨" },
      wedding: { label: "Wedding", icon: "💍" },
      reception: { label: "Reception", icon: "🥂" },
    };

    return (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {events.map((id) => {
          const info = eventMeta[id] ?? { label: id, icon: "🎉" };
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-md bg-ivory-deep/80 border border-gold/30 px-1.5 py-0.5 text-[0.66rem] font-medium text-burgundy whitespace-nowrap"
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
            </span>
          );
        })}
      </div>
    );
  }

  function exportCsv() {
    const header = [
      "Guest Name",
      "Mobile Number",
      "Attendance Status",
      "Adults",
      "Children",
      "Total Pax",
      "Events Attending",
      "Travel Mode",
      "Travelling From",
      "Arrival Date",
      "Arrival Time",
      "Message / Wishes",
      "Submitted At",
    ];

    const rows = visible.map((r) => [
      r.full_name,
      r.mobile,
      attendanceLabel(r.attendance),
      r.adults || 0,
      r.children || 0,
      (Number(r.adults) || 0) + (Number(r.children) || 0),
      parseEventsList(r.attending_days).join(", ") || "All",
      r.travel_mode || "-",
      r.travel_city || "-",
      r.arrival_date || "-",
      r.arrival_time || "-",
      (r.message ?? "").replace(/\s+/g, " "),
      new Date(r.created_at).toLocaleString(),
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `parth-namrata-rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    localStorage.removeItem("pn_admin_authed");
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    navigate({ to: "/auth", replace: true });
  }

  function getCleanPhone(raw: string) {
    return raw.replace(/[^0-9+]/g, "");
  }

  function renderTravelBadge(
    mode: string | null,
    city?: string | null,
    date?: string | null,
    time?: string | null,
  ) {
    if (!mode && !city && !date && !time) return null;

    let icon = <MapPin size={11} className="shrink-0 text-gold-deep" />;
    if (mode === "Car") {
      icon = <Car size={11} className="shrink-0 text-amber-700" />;
    } else if (mode === "Flight") {
      icon = <Plane size={11} className="shrink-0 text-sky-700" />;
    } else if (mode === "Train") {
      icon = <Train size={11} className="shrink-0 text-indigo-700" />;
    } else if (mode === "Bus") {
      icon = <Bus size={11} className="shrink-0 text-emerald-700" />;
    }

    return (
      <div className="flex flex-col gap-0.5 text-left">
        {mode && (
          <span className="inline-flex items-center gap-1 rounded-md bg-ivory-deep/80 border border-gold/30 px-2 py-0.5 text-[0.7rem] font-medium text-burgundy w-fit">
            {icon}
            <span>{mode}</span>
          </span>
        )}
        {city && (
          <span className="text-[0.68rem] text-charcoal/85">
            From: <strong className="font-medium text-burgundy">{city}</strong>
          </span>
        )}
        {(date || time) && (
          <span className="text-[0.64rem] text-warmgrey">
            {date} {time ? `@ ${time}` : ""}
          </span>
        )}
      </div>
    );
  }

  function renderStatusBadge(attendance: string) {
    if (attendance === "yes") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100/90 px-2.5 py-0.5 text-[0.68rem] font-semibold text-emerald-800 whitespace-nowrap">
          <CheckCircle2 size={11} /> Attending
        </span>
      );
    }
    if (attendance === "some") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100/90 px-2.5 py-0.5 text-[0.68rem] font-semibold text-amber-900 whitespace-nowrap">
          <Users size={11} /> Partially
        </span>
      );
    }
    if (attendance === "unsure") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[0.68rem] font-semibold text-blue-800 whitespace-nowrap">
          <Clock size={11} /> Not Sure
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose/30 bg-rose/15 px-2.5 py-0.5 text-[0.68rem] font-semibold text-burgundy whitespace-nowrap">
        <XCircle size={11} /> Declined
      </span>
    );
  }

  return (
    <main className="min-h-screen bg-background font-sans text-charcoal pb-20">
      {/* Top Header */}
      <header className="border-b border-gold/30 bg-ivory/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3.5 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <Monogram size={34} />
            <div className="min-w-0">
              <p className="text-[0.55rem] sm:text-[0.58rem] uppercase tracking-[0.24em] text-gold-deep font-semibold truncate">
                Wedding Desk
              </p>
              <h1 className="font-creative text-lg sm:text-2xl font-semibold text-burgundy truncate">
                RSVP Dashboard
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gold/50 bg-ivory-deep/80 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[0.62rem] sm:text-[0.68rem] uppercase tracking-[0.16em] font-medium text-burgundy transition-all hover:bg-burgundy hover:text-ivory shadow-sm"
          >
            <LogOut size={12} strokeWidth={1.6} />
            <span className="hidden xs:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-2xl border text-xs sm:text-sm font-medium transition-all ${
            notification.type === "success"
              ? "bg-emerald-900/95 text-emerald-100 border-emerald-500/60 backdrop-blur-md"
              : "bg-rose-900/95 text-rose-100 border-rose-500/60 backdrop-blur-md"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-300 shrink-0" />
          )}
          <span>{notification.text}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-2 rounded p-0.5 hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-3.5 pt-5 sm:px-6">
        {error && (
          <div className="mb-5 rounded-xl border border-destructive/40 bg-destructive/5 p-3.5 text-xs sm:text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Could not load dashboard data."}
          </div>
        )}

        {isPending ? (
          <div className="my-20 flex flex-col items-center justify-center gap-3 text-gold-deep">
            <Loader2 className="animate-spin" size={30} strokeWidth={1.5} />
            <p className="text-xs uppercase tracking-[0.2em] text-warmgrey font-medium">
              Loading RSVP records…
            </p>
          </div>
        ) : (
          <>
            {/* Stat Cards - Mobile 2-column, Tablet 3, Desktop 5 */}
            <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-xl sm:rounded-2xl border border-gold/40 bg-card p-3 sm:p-4.5 shadow-sm transition-all hover:border-gold/70">
                <div className="flex items-center justify-between text-gold-deep">
                  <span className="text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-warmgrey">
                    Responses
                  </span>
                  <Users size={15} strokeWidth={1.5} />
                </div>
                <p className="font-display mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-medium text-burgundy tabular-nums">
                  {summary.totalResponses}
                </p>
                <p className="mt-0.5 text-[0.68rem] text-warmgrey truncate">
                  {summary.attendingGroups} attending
                </p>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-gold/40 bg-card p-3 sm:p-4.5 shadow-sm transition-all hover:border-gold/70">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-warmgrey">
                    Guests Coming
                  </span>
                  <UserCheck size={15} strokeWidth={1.5} />
                </div>
                <p className="font-display mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-medium text-emerald-800 tabular-nums">
                  {summary.totalHeads}
                </p>
                <p className="mt-0.5 text-[0.68rem] text-warmgrey truncate">
                  {summary.totalAdults}A &middot; {summary.totalChildren}C
                </p>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-gold/40 bg-card p-3 sm:p-4.5 shadow-sm transition-all hover:border-gold/70">
                <div className="flex items-center justify-between text-rose">
                  <span className="text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-warmgrey">
                    Declined
                  </span>
                  <XCircle size={15} strokeWidth={1.5} />
                </div>
                <p className="font-display mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-medium text-burgundy tabular-nums">
                  {summary.declined}
                </p>
                <p className="mt-0.5 text-[0.68rem] text-warmgrey truncate">
                  Cannot attend
                </p>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-gold/40 bg-card p-3 sm:p-4.5 shadow-sm transition-all hover:border-gold/70">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-warmgrey">
                    Not Sure
                  </span>
                  <Clock size={15} strokeWidth={1.5} />
                </div>
                <p className="font-display mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-medium text-amber-900 tabular-nums">
                  {summary.unsure}
                </p>
                <p className="mt-0.5 text-[0.68rem] text-warmgrey truncate">
                  Pending status
                </p>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-gold/40 bg-card p-3 sm:p-4.5 shadow-sm transition-all hover:border-gold/70 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-gold-deep">
                  <span className="text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-warmgrey">
                    Invited Groups
                  </span>
                  <CheckCircle2 size={15} strokeWidth={1.5} />
                </div>
                <p className="font-display mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-medium text-burgundy tabular-nums">
                  {summary.invitedGroups}
                </p>
                <p className="mt-0.5 text-[0.68rem] text-warmgrey truncate">
                  {summary.totalInvited} invited total
                </p>
              </div>
            </section>

            {/* Event Attendance Breakdown Bar */}
            {responses.length > 0 && (
              <div className="mt-3 rounded-xl border border-gold/30 bg-card p-3 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-warmgrey">
                    Celebration Events Attendance (Guest Headcount)
                  </p>
                  <span className="text-[0.62rem] text-gold-deep font-medium">
                    Eventwise guest counts
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {[
                    {
                      label: "Carnival",
                      icon: "🎪",
                      count: eventBreakdown.carnival,
                      sub: "24 Feb · Morning",
                    },
                    {
                      label: "Sur Sandhya",
                      icon: "✨",
                      count: eventBreakdown.sur_sandhya,
                      sub: "24 Feb · Sangeet",
                    },
                    {
                      label: "The Wedding",
                      icon: "💍",
                      count: eventBreakdown.wedding,
                      sub: "25 Feb · Pheras",
                    },
                    {
                      label: "The Reception",
                      icon: "🥂",
                      count: eventBreakdown.reception,
                      sub: "25 Feb · Dinner",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-gold/20 bg-ivory/60 p-2.5 flex flex-col items-center justify-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{item.icon}</span>
                        <p className="font-display text-lg sm:text-xl font-medium text-burgundy tabular-nums">
                          {item.count}
                        </p>
                      </div>
                      <p className="text-[0.62rem] font-semibold text-gold-deep uppercase tracking-[0.12em] mt-0.5">
                        {item.label}
                      </p>
                      <p className="text-[0.58rem] text-warmgrey mt-0.5">
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Travel / Logistics Breakdown Bar */}
            {responses.length > 0 && (
              <div className="mt-3 rounded-xl border border-gold/30 bg-card p-3 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-warmgrey">
                    Guest Travel & Arrival Breakdown
                  </p>
                  <span className="text-[0.62rem] text-gold-deep font-medium">
                    For guest pickup & arrangements
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    {
                      label: "Car",
                      icon: <Car size={13} className="text-amber-700" />,
                      count: travelBreakdown.Car,
                      sub: "Road / Taxi",
                    },
                    {
                      label: "Flight",
                      icon: <Plane size={13} className="text-sky-700" />,
                      count: travelBreakdown.Flight,
                      sub: "Air Arrival",
                    },
                    {
                      label: "Train",
                      icon: <Train size={13} className="text-indigo-700" />,
                      count: travelBreakdown.Train,
                      sub: "Rail Arrival",
                    },
                    {
                      label: "Bus",
                      icon: <Bus size={13} className="text-emerald-700" />,
                      count: travelBreakdown.Bus,
                      sub: "Bus / Coach",
                    },
                    {
                      label: "Other",
                      icon: <MapPin size={13} className="text-gold-deep" />,
                      count: travelBreakdown.Other,
                      sub: "Local / Other",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-gold/20 bg-ivory/60 p-2 flex flex-col items-center justify-center"
                    >
                      <div className="flex items-center gap-1">
                        {item.icon}
                        <p className="font-display text-base sm:text-lg font-medium text-burgundy tabular-nums">
                          {item.count}
                        </p>
                      </div>
                      <p className="text-[0.58rem] font-semibold text-gold-deep uppercase tracking-[0.1em] mt-0.5">
                        {item.label}
                      </p>
                      <p className="hidden xs:block text-[0.55rem] text-warmgrey">
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-gold/30 pb-3">
              <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("responses")}
                  className={`rounded-xl px-3 sm:px-4 py-2 text-[0.68rem] sm:text-[0.7rem] uppercase tracking-[0.16em] font-semibold text-center transition-all ${
                    activeTab === "responses"
                      ? "bg-burgundy text-ivory shadow-sm"
                      : "bg-ivory-deep/60 text-warmgrey hover:text-burgundy"
                  }`}
                >
                  Responses ({responses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("groups")}
                  className={`rounded-xl px-3 sm:px-4 py-2 text-[0.68rem] sm:text-[0.7rem] uppercase tracking-[0.16em] font-semibold text-center transition-all ${
                    activeTab === "groups"
                      ? "bg-burgundy text-ivory shadow-sm"
                      : "bg-ivory-deep/60 text-warmgrey hover:text-burgundy"
                  }`}
                >
                  Groups ({groups.length})
                </button>
              </div>

              {activeTab === "groups" && (
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/60 bg-burgundy px-3.5 py-2 text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-ivory shadow-sm hover:bg-burgundy-deep"
                >
                  <Plus size={14} /> New Group
                </button>
              )}
            </div>

            {/* TAB 1: RESPONSES */}
            {activeTab === "responses" && (
              <section className="mt-4 space-y-4">
                {/* Search & Filter Toolbar - Fully Responsive */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-warmgrey"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search guest name, mobile, or message…"
                      className="w-full rounded-xl border border-gold/40 bg-card pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-warmgrey/60"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:flex items-center gap-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full sm:w-auto rounded-xl border border-gold/40 bg-card px-2.5 py-2.5 text-xs text-charcoal outline-none focus:border-gold"
                    >
                      <option value="all">All ({responses.length})</option>
                      <option value="yes">Attending</option>
                      <option value="some">Partially</option>
                      <option value="unsure">Not Sure</option>
                      <option value="no">Declined</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowAddRsvpModal(true)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/70 bg-burgundy px-3 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ivory shadow-sm hover:bg-burgundy-deep transition-all cursor-pointer"
                    >
                      <Plus size={13} strokeWidth={2} />
                      <span className="whitespace-nowrap">Add RSVP</span>
                    </button>

                    <button
                      type="button"
                      onClick={exportCsv}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/60 bg-gradient-to-b from-ivory to-ivory-deep px-3 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-burgundy shadow-sm hover:bg-ivory-deep"
                    >
                      <Download size={13} strokeWidth={1.6} />
                      <span className="whitespace-nowrap">Export CSV</span>
                    </button>
                  </div>
                </div>

                {visible.length === 0 ? (
                  <div className="rounded-2xl border border-gold/30 bg-card p-8 sm:p-12 text-center text-warmgrey">
                    <Users
                      size={28}
                      className="mx-auto text-gold-deep opacity-60 mb-2"
                    />
                    <p className="font-display text-base sm:text-lg text-burgundy">
                      No responses match your search
                    </p>
                    <p className="text-xs text-warmgrey mt-1">
                      Try changing your search term or filter selection.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* MOBILE CARD VIEW (< 768px) */}
                    <div className="block md:hidden space-y-3">
                      {visible.map((r) => {
                        const isAttending =
                          r.attendance === "yes" || r.attendance === "some";
                        const cleanPhone = getCleanPhone(r.mobile);

                        return (
                          <div
                            key={r.id}
                            className="rounded-xl border border-gold/35 bg-card p-4 shadow-sm space-y-2.5"
                          >
                            {/* Card Header: Name + Status */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-burgundy text-[0.95rem]">
                                  {r.full_name}
                                </h3>
                                <p className="font-mono text-xs text-charcoal/80 mt-0.5">
                                  {r.mobile}
                                </p>
                              </div>
                              {renderStatusBadge(r.attendance)}
                            </div>

                            {/* Attending Details Badges */}
                            {isAttending && (
                              <div className="space-y-1.5 pt-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {renderEventBadges(r.attending_days)}
                                </div>
                                <div>
                                  <span className="rounded-md border border-gold/30 bg-ivory-deep/70 px-2 py-0.5 text-[0.7rem] font-medium text-charcoal">
                                    {r.adults} Adults
                                    {r.children ? ` · ${r.children} Kids` : ""}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Arrival / Travel Info */}
                            {isAttending &&
                              (r.travel_mode ||
                                r.travel_city ||
                                r.arrival_date ||
                                r.arrival_time) && (
                                <div className="rounded-lg border border-gold/25 bg-ivory-deep/40 p-2.5">
                                  {renderTravelBadge(
                                    r.travel_mode,
                                    r.travel_city,
                                    r.arrival_date,
                                    r.arrival_time,
                                  )}
                                </div>
                              )}

                            {/* Message / Wish */}
                            {r.message && (
                              <div className="rounded-lg border border-gold/25 bg-ivory/70 p-2.5 text-xs italic text-warmgrey leading-relaxed">
                                &ldquo;{r.message}&rdquo;
                              </div>
                            )}

                            {/* Card Footer: Date + WhatsApp / Call / Delete Actions */}
                            <div className="flex items-center justify-between border-t border-gold/15 pt-2.5">
                              <span className="text-[0.65rem] text-warmgrey">
                                {new Date(r.created_at).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  },
                                )}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {cleanPhone && (
                                  <>
                                    <a
                                      href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-1 rounded-lg border border-emerald-600/30 bg-emerald-50 px-2 py-1 text-[0.68rem] font-medium text-emerald-800 hover:bg-emerald-100"
                                    >
                                      <MessageCircle size={11} /> WhatsApp
                                    </a>
                                    <a
                                      href={`tel:${cleanPhone}`}
                                      className="flex items-center gap-1 rounded-lg border border-gold/40 bg-ivory px-2 py-1 text-[0.68rem] font-medium text-gold-deep hover:bg-ivory-deep"
                                    >
                                      <Phone size={11} /> Call
                                    </a>
                                  </>
                                )}
                                <button
                                  type="button"
                                  title="Edit RSVP"
                                  onClick={() => setEditingRsvp(r)}
                                  className="rounded-lg border border-gold/30 p-1.5 text-warmgrey hover:border-gold hover:text-burgundy"
                                >
                                  <Edit2 size={12} strokeWidth={1.6} />
                                </button>
                                <button
                                  type="button"
                                  title="Delete RSVP"
                                  onClick={() => handleDeleteResponse(r)}
                                  className="rounded-lg border border-gold/30 p-1.5 text-warmgrey hover:border-destructive hover:text-destructive"
                                >
                                  <Trash2 size={12} strokeWidth={1.6} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DESKTOP TABLE VIEW (>= 768px) */}
                    <div className="hidden md:block rounded-2xl border border-gold/30 bg-card overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-[0.84rem]">
                          <thead>
                            <tr className="border-b border-gold/30 bg-ivory-deep/40 text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-gold-deep">
                              <th className="px-4 py-3.5">Guest</th>
                              <th className="px-4 py-3.5">Contact</th>
                              <th className="px-4 py-3.5">Attendance</th>
                              <th className="px-4 py-3.5">Events</th>
                              <th className="px-4 py-3.5">Guests</th>
                              <th className="px-4 py-3.5">
                                Arrival / Logistics
                              </th>
                              <th className="px-4 py-3.5">Submitted</th>
                              <th className="px-4 py-3.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gold/15">
                            {visible.map((r) => {
                              const isAttending =
                                r.attendance === "yes" ||
                                r.attendance === "some";
                              const cleanPhone = getCleanPhone(r.mobile);

                              return (
                                <tr
                                  key={r.id}
                                  className="transition-colors hover:bg-ivory/50"
                                >
                                  {/* Guest Name & Message */}
                                  <td className="px-4 py-3.5 align-top">
                                    <div className="font-semibold text-burgundy text-[0.92rem]">
                                      {r.full_name}
                                    </div>
                                    {r.message && (
                                      <p className="mt-1 max-w-[18rem] text-[0.78rem] italic text-warmgrey leading-relaxed">
                                        &ldquo;{r.message}&rdquo;
                                      </p>
                                    )}
                                  </td>

                                  {/* Contact with WhatsApp & Call shortcuts */}
                                  <td className="px-4 py-3.5 align-top">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs tabular-nums text-charcoal">
                                        {r.mobile}
                                      </span>
                                      {cleanPhone && (
                                        <div className="flex items-center gap-1">
                                          <a
                                            href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Chat on WhatsApp"
                                            className="rounded-md border border-emerald-600/30 bg-emerald-50 p-1 text-emerald-700 hover:bg-emerald-100"
                                          >
                                            <MessageCircle size={12} />
                                          </a>
                                          <a
                                            href={`tel:${cleanPhone}`}
                                            title="Call Guest"
                                            className="rounded-md border border-gold/40 bg-ivory p-1 text-gold-deep hover:bg-ivory-deep"
                                          >
                                            <Phone size={12} />
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Attendance Status Badge */}
                                  <td className="px-4 py-3.5 align-top">
                                    {renderStatusBadge(r.attendance)}
                                  </td>

                                  {/* Attending Events */}
                                  <td className="px-4 py-3.5 align-top">
                                    {isAttending ? (
                                      renderEventBadges(r.attending_days)
                                    ) : (
                                      <span className="text-warmgrey text-xs">
                                        &mdash;
                                      </span>
                                    )}
                                  </td>

                                  {/* Guest Count */}
                                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                                    {isAttending ? (
                                      <span className="font-medium text-charcoal tabular-nums text-xs">
                                        {r.adults} Adults
                                        {r.children
                                          ? ` · ${r.children} Kids`
                                          : ""}
                                      </span>
                                    ) : (
                                      <span className="text-warmgrey text-xs">
                                        &mdash;
                                      </span>
                                    )}
                                  </td>

                                  {/* Arrival / Travel Logistics */}
                                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                                    {isAttending &&
                                    (r.travel_mode ||
                                      r.travel_city ||
                                      r.arrival_date ||
                                      r.arrival_time) ? (
                                      renderTravelBadge(
                                        r.travel_mode,
                                        r.travel_city,
                                        r.arrival_date,
                                        r.arrival_time,
                                      )
                                    ) : (
                                      <span className="text-warmgrey text-xs">
                                        &mdash;
                                      </span>
                                    )}
                                  </td>

                                  {/* Date */}
                                  <td className="px-4 py-3.5 align-top text-xs text-warmgrey whitespace-nowrap">
                                    {new Date(r.created_at).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </td>

                                  {/* Delete Action */}
                                  <td className="px-4 py-3.5 align-top text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        title="Edit RSVP"
                                        onClick={() => setEditingRsvp(r)}
                                        className="rounded-lg border border-gold/30 p-1.5 text-warmgrey transition-colors hover:border-gold hover:text-burgundy cursor-pointer"
                                      >
                                        <Edit2 size={13} strokeWidth={1.6} />
                                      </button>
                                      <button
                                        type="button"
                                        title="Delete RSVP"
                                        onClick={() => handleDeleteResponse(r)}
                                        className="rounded-lg border border-gold/30 p-1.5 text-warmgrey transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                      >
                                        <Trash2 size={13} strokeWidth={1.6} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* TAB 2: INVITATION GROUPS */}
            {activeTab === "groups" && (
              <section className="mt-4 space-y-4">
                {showForm && (
                  <form
                    onSubmit={handleCreateGroup}
                    className="rounded-2xl border border-gold/40 bg-card p-4 sm:p-6 shadow-sm space-y-4"
                  >
                    <h3 className="font-creative text-lg sm:text-xl font-semibold text-burgundy">
                      Add New Invitation Group
                    </h3>
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <div>
                        <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                          Group Name
                        </label>
                        <input
                          required
                          value={draft.name}
                          onChange={(e) =>
                            setDraft({ ...draft, name: e.target.value })
                          }
                          className="mt-1.5 w-full rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
                          placeholder="e.g. Panjwani Family"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                          Side
                        </label>
                        <select
                          value={draft.side}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              side: e.target.value as
                                "bride" | "groom" | "both",
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
                        >
                          <option value="groom">Groom’s Side</option>
                          <option value="bride">Bride’s Side</option>
                          <option value="both">Both Sides</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                          Expected Guest Count
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={draft.guestCount}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              guestCount: parseInt(e.target.value) || 1,
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                          Invited Days
                        </label>
                        <select
                          value={draft.invitedDays}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              invitedDays: e.target.value as
                                "24" | "25" | "both",
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
                        >
                          <option value="both">Both Days — 24 & 25 Feb</option>
                          <option value="24">
                            24 Feb — Carnival & Sur Sandhya
                          </option>
                          <option value="25">
                            25 Feb — Wedding & Reception
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                          Contact Mobile (Optional)
                        </label>
                        <input
                          value={draft.contactMobile}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              contactMobile: e.target.value,
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                          Notes / Requirements (Optional)
                        </label>
                        <input
                          value={draft.notes}
                          onChange={(e) =>
                            setDraft({ ...draft, notes: e.target.value })
                          }
                          className="mt-1.5 w-full rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
                          placeholder="e.g. Requires ground floor room"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={isMutating}
                        className="rounded-xl border border-gold/70 bg-burgundy px-4 py-2.5 text-xs uppercase tracking-[0.16em] font-semibold text-ivory shadow-sm hover:bg-burgundy-deep disabled:opacity-50 cursor-pointer"
                      >
                        {isMutating ? "Saving…" : "Save Group"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="rounded-xl border border-gold/40 px-3.5 py-2.5 text-xs uppercase tracking-[0.16em] font-medium text-warmgrey hover:text-burgundy"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {groups.length === 0 ? (
                  <div className="rounded-2xl border border-gold/30 bg-card p-8 sm:p-12 text-center text-warmgrey">
                    <Users
                      size={28}
                      className="mx-auto text-gold-deep opacity-60 mb-2"
                    />
                    <p className="font-display text-base sm:text-lg text-burgundy">
                      No invitation groups added yet
                    </p>
                    <p className="text-xs text-warmgrey mt-1">
                      Create groups to organize families and track pending
                      responses.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.map((g) => (
                      <div
                        key={g.id}
                        className="rounded-xl sm:rounded-2xl border border-gold/35 bg-card p-4 sm:p-5 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-creative text-base sm:text-lg font-semibold text-burgundy">
                              {g.name || "Invitation Group"}
                            </h4>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                title={`Edit ${g.name || "group"}`}
                                onClick={() => setEditingGroup(g)}
                                className="rounded-lg border border-gold/30 p-1.5 text-warmgrey hover:border-gold hover:text-burgundy"
                              >
                                <Edit2 size={13} strokeWidth={1.6} />
                              </button>
                              <button
                                type="button"
                                title={`Delete ${g.name || "group"}`}
                                onClick={() => handleDeleteGroup(g)}
                                className="rounded-lg border border-gold/30 p-1.5 text-warmgrey hover:border-destructive hover:text-destructive"
                              >
                                <Trash2 size={13} strokeWidth={1.6} />
                              </button>
                            </div>
                          </div>
                          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-gold-deep font-semibold">
                            {g.guest_count || 0} guests &middot;{" "}
                            {daysLabel(g.invited_days)} &middot;{" "}
                            {g.side || "both"}
                          </p>
                          {g.contact_mobile && (
                            <p className="mt-2 text-xs font-mono text-charcoal">
                              {g.contact_mobile}
                            </p>
                          )}
                          {g.notes && (
                            <p className="mt-2 text-xs italic text-warmgrey leading-relaxed">
                              {g.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      {/* MODAL 1: Edit RSVP Record */}
      {editingRsvp && (
        <EditRsvpModalDialog
          rsvp={editingRsvp}
          onClose={() => setEditingRsvp(null)}
          onSave={handleSaveEditedRsvp}
          isSaving={isMutating}
        />
      )}

      {/* MODAL 2: Add Guest RSVP Record */}
      {showAddRsvpModal && (
        <AddRsvpModalDialog
          onClose={() => setShowAddRsvpModal(false)}
          onCreate={handleCreateRsvp}
          isSaving={isMutating}
        />
      )}

      {/* MODAL 3: Edit Invitation Group */}
      {editingGroup && (
        <EditGroupModalDialog
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSave={handleSaveEditedGroup}
          isSaving={isMutating}
        />
      )}
    </main>
  );
}

const ALL_EVENTS = [
  { id: "carnival", label: "Carnival", time: "24 Feb (Day 1 Morning)" },
  { id: "sur_sandhya", label: "Sur Sandhya", time: "24 Feb (Day 1 Evening)" },
  { id: "wedding", label: "The Wedding", time: "25 Feb (Day 2 Evening)" },
  { id: "reception", label: "The Reception", time: "25 Feb (Day 2 Night)" },
];

function EditRsvpModalDialog({
  rsvp,
  onClose,
  onSave,
  isSaving,
}: {
  rsvp: Response;
  onClose: () => void;
  onSave: (updated: Response) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Response>({ ...rsvp });
  const [events, setEvents] = useState<string[]>(() => {
    const raw = rsvp.attending_days;
    if (!raw || raw === "all" || raw === "both") {
      return ["carnival", "sur_sandhya", "wedding", "reception"];
    }
    if (raw === "24") return ["carnival", "sur_sandhya"];
    if (raw === "25") return ["wedding", "reception"];
    return raw.split(",").map((s) => s.trim().toLowerCase());
  });

  function toggleEvent(id: string) {
    setEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const attendingDays =
      events.length === 4
        ? "all"
        : events.length === 0
          ? "none"
          : events.join(",");
    onSave({
      ...form,
      attending_days: attendingDays,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-gold/45 bg-ivory p-5 sm:p-7 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-gold/30 pb-3">
          <div>
            <h3 className="font-creative text-lg sm:text-xl font-semibold text-burgundy">
              Edit RSVP Details
            </h3>
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-gold-deep">
              Record ID: {rsvp.id.slice(0, 8)}…
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-warmgrey hover:bg-gold/15 hover:text-burgundy cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Guest Name *
              </label>
              <input
                required
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Contact Mobile *
              </label>
              <input
                required
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Attendance
              </label>
              <select
                value={form.attendance}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attendance: e.target.value as Response["attendance"],
                  })
                }
                className="w-full rounded-xl border border-gold/40 bg-card px-3 py-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="yes">Attending (Yes)</option>
                <option value="some">Partially (Some)</option>
                <option value="unsure">Not Sure (Unsure)</option>
                <option value="no">Declined (No)</option>
              </select>
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Adults
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={form.adults}
                onChange={(e) =>
                  setForm({
                    ...form,
                    adults: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Children
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={form.children}
                onChange={(e) =>
                  setForm({
                    ...form,
                    children: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Attending Events */}
          <div>
            <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1.5">
              Celebrations Attending
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map((ev) => {
                const checked = events.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => toggleEvent(ev.id)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                      checked
                        ? "border-[#E5C158] bg-burgundy text-ivory"
                        : "border-gold/30 bg-card text-charcoal"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold leading-tight">
                        {ev.label}
                      </p>
                      <p
                        className={`text-[0.62rem] leading-tight ${checked ? "text-gold-light" : "text-warmgrey"}`}
                      >
                        {ev.time}
                      </p>
                    </div>
                    {checked && <Check size={14} className="text-[#E5C158]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel Logistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Travel Mode
              </label>
              <select
                value={form.travel_mode || ""}
                onChange={(e) =>
                  setForm({ ...form, travel_mode: e.target.value || null })
                }
                className="w-full rounded-xl border border-gold/40 bg-card px-2.5 py-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="">None / Not set</option>
                <option value="Car">Car</option>
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                From City
              </label>
              <input
                value={form.travel_city || ""}
                onChange={(e) =>
                  setForm({ ...form, travel_city: e.target.value || null })
                }
                placeholder="e.g. Rajkot"
                className="w-full rounded-xl border border-gold/40 bg-card px-2.5 py-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Arrival Date
              </label>
              <input
                type="date"
                min="2027-02-01"
                max="2027-02-28"
                value={form.arrival_date || ""}
                onChange={(e) =>
                  setForm({ ...form, arrival_date: e.target.value || null })
                }
                className="w-full rounded-xl border border-gold/40 bg-card px-2.5 py-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Arrival Time
              </label>
              <input
                type="time"
                value={form.arrival_time || ""}
                onChange={(e) =>
                  setForm({ ...form, arrival_time: e.target.value || null })
                }
                className="w-full rounded-xl border border-gold/40 bg-card px-2.5 py-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
              Note / Wishes
            </label>
            <textarea
              rows={2}
              value={form.message || ""}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value || null })
              }
              placeholder="Wishes, note, or stay requirement…"
              className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gold/25">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-gold/40 px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium text-warmgrey hover:text-burgundy cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl border border-gold/70 bg-burgundy px-5 py-2 text-xs uppercase tracking-[0.14em] font-semibold text-ivory shadow-sm hover:bg-burgundy-deep disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddRsvpModalDialog({
  onClose,
  onCreate,
  isSaving,
}: {
  onClose: () => void;
  onCreate: (data: {
    fullName: string;
    mobile: string;
    attendance: "yes" | "some" | "unsure" | "no";
    adults: number;
    children: number;
    attendingDays: string;
    travelMode?: string;
    travelCity?: string;
    arrivalDate?: string;
    arrivalTime?: string;
    message?: string;
  }) => void;
  isSaving: boolean;
}) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [attendance, setAttendance] = useState<
    "yes" | "some" | "unsure" | "no"
  >("yes");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [events, setEvents] = useState<string[]>([
    "carnival",
    "sur_sandhya",
    "wedding",
    "reception",
  ]);
  const [travelMode, setTravelMode] = useState("");
  const [travelCity, setTravelCity] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [message, setMessage] = useState("");

  function toggleEvent(id: string) {
    setEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const attendingDays =
      events.length === 4
        ? "all"
        : events.length === 0
          ? "none"
          : events.join(",");
    onCreate({
      fullName,
      mobile,
      attendance,
      adults,
      children,
      attendingDays,
      travelMode: travelMode || undefined,
      travelCity: travelCity || undefined,
      arrivalDate: arrivalDate || undefined,
      arrivalTime: arrivalTime || undefined,
      message: message || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-gold/45 bg-ivory p-5 sm:p-7 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-gold/30 pb-3">
          <div>
            <h3 className="font-creative text-lg sm:text-xl font-semibold text-burgundy">
              Add Guest RSVP Record
            </h3>
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-gold-deep">
              Record a response received by phone or in person
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-warmgrey hover:bg-gold/15 hover:text-burgundy cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Guest Name *
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Bhai"
                className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Contact Mobile *
              </label>
              <input
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Attendance
              </label>
              <select
                value={attendance}
                onChange={(e) =>
                  setAttendance(e.target.value as "yes" | "some" | "unsure" | "no")
                }
                className="w-full rounded-xl border border-gold/40 bg-card px-3 py-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="yes">Attending (Yes)</option>
                <option value="some">Partially (Some)</option>
                <option value="unsure">Not Sure (Unsure)</option>
                <option value="no">Declined (No)</option>
              </select>
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Adults
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Children
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Attending Events */}
          <div>
            <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1.5">
              Celebrations Attending
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map((ev) => {
                const checked = events.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => toggleEvent(ev.id)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                      checked
                        ? "border-[#E5C158] bg-burgundy text-ivory"
                        : "border-gold/30 bg-card text-charcoal"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold leading-tight">
                        {ev.label}
                      </p>
                      <p
                        className={`text-[0.62rem] leading-tight ${checked ? "text-gold-light" : "text-warmgrey"}`}
                      >
                        {ev.time}
                      </p>
                    </div>
                    {checked && <Check size={14} className="text-[#E5C158]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel Logistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Travel Mode
              </label>
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value)}
                className="w-full rounded-xl border border-gold/40 bg-card px-2.5 py-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="">None / Not set</option>
                <option value="Car">Car</option>
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                From City
              </label>
              <input
                value={travelCity}
                onChange={(e) => setTravelCity(e.target.value)}
                placeholder="e.g. Ahmedabad"
                className="w-full rounded-xl border border-gold/40 bg-card px-2.5 py-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Arrival Date
              </label>
              <input
                type="date"
                min="2027-02-01"
                max="2027-02-28"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full rounded-xl border border-gold/40 bg-card px-2.5 py-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
                Arrival Time
              </label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full rounded-xl border border-gold/40 bg-card px-2.5 py-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-1">
              Note / Wishes
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Wishes, note, or stay requirement…"
              className="w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gold/25">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-gold/40 px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium text-warmgrey hover:text-burgundy cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl border border-gold/70 bg-burgundy px-5 py-2 text-xs uppercase tracking-[0.14em] font-semibold text-ivory shadow-sm hover:bg-burgundy-deep disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving…" : "Add RSVP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditGroupModalDialog({
  group,
  onClose,
  onSave,
  isSaving,
}: {
  group: Group;
  onClose: () => void;
  onSave: (updated: Group) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Group>({ ...group });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-gold/45 bg-ivory p-5 sm:p-7 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-gold/30 pb-3">
          <div>
            <h3 className="font-creative text-lg sm:text-xl font-semibold text-burgundy">
              Edit Invitation Group
            </h3>
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-gold-deep">
              Group ID: {group.id.slice(0, 8)}…
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-warmgrey hover:bg-gold/15 hover:text-burgundy cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                Group Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                Side
              </label>
              <select
                value={form.side}
                onChange={(e) => setForm({ ...form, side: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              >
                <option value="groom">Groom’s Side</option>
                <option value="bride">Bride’s Side</option>
                <option value="both">Both Sides</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                Expected Guest Count
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.guest_count}
                onChange={(e) =>
                  setForm({
                    ...form,
                    guest_count: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                Invited Days
              </label>
              <select
                value={form.invited_days}
                onChange={(e) =>
                  setForm({ ...form, invited_days: e.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              >
                <option value="both">Both Days — 24 & 25 Feb</option>
                <option value="24">24 Feb — Carnival & Sur Sandhya</option>
                <option value="25">25 Feb — Wedding & Reception</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                Contact Mobile (Optional)
              </label>
              <input
                value={form.contact_mobile || ""}
                onChange={(e) =>
                  setForm({ ...form, contact_mobile: e.target.value || null })
                }
                className="mt-1.5 w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold font-mono"
              />
            </div>
            <div>
              <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                Notes / Requirements (Optional)
              </label>
              <input
                value={form.notes || ""}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value || null })
                }
                className="mt-1.5 w-full rounded-xl border border-gold/40 bg-card px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gold/25">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-gold/40 px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium text-warmgrey hover:text-burgundy cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl border border-gold/70 bg-burgundy px-5 py-2 text-xs uppercase tracking-[0.14em] font-semibold text-ivory shadow-sm hover:bg-burgundy-deep disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
