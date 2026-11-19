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
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  createInvitationGroup,
  deleteInvitationGroup,
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
      { name: "description", content: "Track RSVPs, invitation groups and guest counts." },
      { property: "og:title", content: "RSVP Dashboard — Parth & Namrata" },
      { property: "og:description", content: "Track RSVPs and invitation groups." },
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
  attending_days: "24" | "25" | "both";
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

  const [activeTab, setActiveTab] = useState<"responses" | "groups">("responses");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
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

  const create = useMutation({
    mutationFn: () => addGroup({ data: draft }),
    onSuccess: () => {
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
    },
  });

  const destroy = useMutation({
    mutationFn: (id: string) => removeGroup({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

  const destroyResponse = useMutation({
    mutationFn: (id: string) => removeResponse({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

  const responses = (data?.responses ?? []) as Response[];
  const groups = (data?.groups ?? []) as Group[];

  const summary = useMemo(() => {
    const attendingList = responses.filter((r) => r.attendance === "yes" || r.attendance === "some");
    const totalHeads = attendingList.reduce(
      (sum, r) => sum + (Number(r.adults) || 0) + (Number(r.children) || 0),
      0,
    );
    const totalAdults = attendingList.reduce((sum, r) => sum + (Number(r.adults) || 0), 0);
    const totalChildren = attendingList.reduce((sum, r) => sum + (Number(r.children) || 0), 0);
    const declinedCount = responses.filter((r) => r.attendance === "no").length;
    const unsureCount = responses.filter((r) => r.attendance === "unsure").length;
    const totalInvited = groups.reduce((sum, g) => sum + (Number(g.guest_count) || 0), 0);

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

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return responses.filter((r) => {
      const matchesFilter = filter === "all" || r.attendance === filter;
      const matchesSearch =
        !q ||
        r.full_name.toLowerCase().includes(q) ||
        r.mobile.includes(q) ||
        (r.message ?? "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [responses, search, filter]);

  function exportCsv() {
    const header = [
      "Guest Name",
      "Mobile Number",
      "Attendance Status",
      "Adults",
      "Children",
      "Total Pax",
      "Attending Days",
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
      daysLabel(r.attending_days),
      (r.message ?? "").replace(/\s+/g, " "),
      new Date(r.created_at).toLocaleString(),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
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

      <div className="mx-auto max-w-6xl px-3.5 pt-5 sm:px-6">
        {error && (
          <div className="mb-5 rounded-xl border border-destructive/40 bg-destructive/5 p-3.5 text-xs sm:text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load dashboard data."}
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

            {/* Day Breakdown Bar */}
            {responses.length > 0 && (
              <div className="mt-3 rounded-xl border border-gold/30 bg-card p-3 sm:p-4 shadow-sm">
                <p className="text-[0.58rem] sm:text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-warmgrey mb-2">
                  Day Attendance Breakdown
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    {
                      label: "Both Days",
                      count: responses.filter(
                        (r) =>
                          (r.attendance === "yes" || r.attendance === "some") &&
                          r.attending_days === "both",
                      ).length,
                      sub: "24 & 25 Feb",
                    },
                    {
                      label: "Day 1 Only",
                      count: responses.filter(
                        (r) =>
                          (r.attendance === "yes" || r.attendance === "some") &&
                          r.attending_days === "24",
                      ).length,
                      sub: "Carnival · Sur Sandhya",
                    },
                    {
                      label: "Day 2 Only",
                      count: responses.filter(
                        (r) =>
                          (r.attendance === "yes" || r.attendance === "some") &&
                          r.attending_days === "25",
                      ).length,
                      sub: "Wedding · Reception",
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-gold/20 bg-ivory/60 p-2">
                      <p className="font-display text-lg sm:text-xl font-medium text-burgundy tabular-nums">
                        {item.count}
                      </p>
                      <p className="text-[0.58rem] font-semibold text-gold-deep uppercase tracking-[0.12em]">
                        {item.label}
                      </p>
                      <p className="text-[0.58rem] text-warmgrey mt-0.5">{item.sub}</p>
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
                    <Users size={28} className="mx-auto text-gold-deep opacity-60 mb-2" />
                    <p className="font-display text-base sm:text-lg text-burgundy">No responses match your search</p>
                    <p className="text-xs text-warmgrey mt-1">Try changing your search term or filter selection.</p>
                  </div>
                ) : (
                  <>
                    {/* MOBILE CARD VIEW (< 768px) */}
                    <div className="block md:hidden space-y-3">
                      {visible.map((r) => {
                        const isAttending = r.attendance === "yes" || r.attendance === "some";
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
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="rounded-md border border-gold/30 bg-ivory-deep/70 px-2 py-0.5 text-[0.7rem] font-medium text-burgundy">
                                  {daysLabel(r.attending_days)}
                                </span>
                                <span className="rounded-md border border-gold/30 bg-ivory-deep/70 px-2 py-0.5 text-[0.7rem] font-medium text-charcoal">
                                  {r.adults} Adults{r.children ? ` · ${r.children} Kids` : ""}
                                </span>
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
                                {new Date(r.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
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
                                  title="Delete RSVP"
                                  onClick={() => {
                                    if (confirm(`Delete RSVP record for ${r.full_name}?`)) {
                                      destroyResponse.mutate(r.id);
                                    }
                                  }}
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
                              <th className="px-4 py-3.5">Days</th>
                              <th className="px-4 py-3.5">Guests</th>
                              <th className="px-4 py-3.5">Submitted</th>
                              <th className="px-4 py-3.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gold/15">
                            {visible.map((r) => {
                              const isAttending = r.attendance === "yes" || r.attendance === "some";
                              const cleanPhone = getCleanPhone(r.mobile);

                              return (
                                <tr key={r.id} className="transition-colors hover:bg-ivory/50">
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

                                  {/* Attending Days */}
                                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                                    {isAttending ? (
                                      <span className="rounded-md bg-ivory-deep/80 border border-gold/30 px-2 py-0.5 text-[0.72rem] font-medium text-burgundy">
                                        {daysLabel(r.attending_days)}
                                      </span>
                                    ) : (
                                      <span className="text-warmgrey text-xs">&mdash;</span>
                                    )}
                                  </td>

                                  {/* Guest Count */}
                                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                                    {isAttending ? (
                                      <span className="font-medium text-charcoal tabular-nums text-xs">
                                        {r.adults} Adults{r.children ? ` · ${r.children} Kids` : ""}
                                      </span>
                                    ) : (
                                      <span className="text-warmgrey text-xs">&mdash;</span>
                                    )}
                                  </td>

                                  {/* Date */}
                                  <td className="px-4 py-3.5 align-top text-xs text-warmgrey whitespace-nowrap">
                                    {new Date(r.created_at).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </td>

                                  {/* Delete Action */}
                                  <td className="px-4 py-3.5 align-top text-right">
                                    <button
                                      type="button"
                                      title="Delete RSVP"
                                      onClick={() => {
                                        if (confirm(`Delete RSVP record for ${r.full_name}?`)) {
                                          destroyResponse.mutate(r.id);
                                        }
                                      }}
                                      className="rounded-lg border border-gold/30 p-1.5 text-warmgrey transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 size={13} strokeWidth={1.6} />
                                    </button>
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
                    onSubmit={(e) => {
                      e.preventDefault();
                      create.mutate();
                    }}
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
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
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
                            setDraft({ ...draft, side: e.target.value as "bride" | "groom" | "both" })
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
                            setDraft({ ...draft, guestCount: parseInt(e.target.value) || 1 })
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
                              invitedDays: e.target.value as "24" | "25" | "both",
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
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
                          value={draft.contactMobile}
                          onChange={(e) => setDraft({ ...draft, contactMobile: e.target.value })}
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
                          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-xs sm:text-sm text-charcoal outline-none focus:border-gold"
                          placeholder="e.g. Requires ground floor room"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={create.isPending}
                        className="rounded-xl border border-gold/70 bg-burgundy px-4 py-2.5 text-xs uppercase tracking-[0.16em] font-semibold text-ivory shadow-sm hover:bg-burgundy-deep disabled:opacity-50"
                      >
                        {create.isPending ? "Saving…" : "Save Group"}
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
                    <Users size={28} className="mx-auto text-gold-deep opacity-60 mb-2" />
                    <p className="font-display text-base sm:text-lg text-burgundy">No invitation groups added yet</p>
                    <p className="text-xs text-warmgrey mt-1">Create groups to organize families and track pending responses.</p>
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
                            <button
                              type="button"
                              title={`Delete ${g.name || "group"}`}
                              onClick={() => {
                                if (confirm(`Delete group "${g.name || "Invitation Group"}"?`)) {
                                  destroy.mutate(g.id);
                                }
                              }}
                              className="rounded-lg border border-gold/30 p-1.5 text-warmgrey hover:border-destructive hover:text-destructive"
                            >
                              <Trash2 size={13} strokeWidth={1.6} />
                            </button>
                          </div>
                          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-gold-deep font-semibold">
                            {g.guest_count || 0} guests &middot; {daysLabel(g.invited_days)} &middot; {g.side || "both"}
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
    </main>
  );
}
