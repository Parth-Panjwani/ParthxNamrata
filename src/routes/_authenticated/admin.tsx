import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Loader2, LogOut, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  createInvitationGroup,
  deleteInvitationGroup,
  deleteRsvpResponse,
  getAdminOverview,
} from "@/lib/admin.functions";
import { attendanceLabel, daysLabel } from "@/lib/wedding";

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
  attendance: "yes" | "some" | "no" | "maybe";
  adults: number;
  children: number;
  attending_days: "24" | "25" | "both";
  travel_city: string | null;
  arrival_date: string | null;
  travel_mode: string | null;
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

const card = "hairline-gold bg-card p-5 shadow-paper";
const input =
  "w-full border border-gold/40 bg-ivory/80 px-3 py-2.5 text-[0.85rem] text-charcoal outline-none focus:border-gold";

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
      setDraft({ name: "", side: "both", guestCount: 2, invitedDays: "both", contactMobile: "", notes: "" });
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
    const attending = responses.filter((r) => r.attendance === "yes" || r.attendance === "some");
    return {
      total: responses.length,
      attending: attending.length,
      declined: responses.filter((r) => r.attendance === "no").length,
      heads: attending.reduce((sum, r) => sum + (Number(r.adults) || 0) + (Number(r.children) || 0), 0),
      invited: groups.reduce((sum, g) => sum + (Number(g.guest_count) || 0), 0),
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
        (r.travel_city ?? "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [responses, search, filter]);

  function exportCsv() {
    const header = [
      "Name",
      "Mobile",
      "Attendance",
      "Adults",
      "Children",
      "Days",
      "Travel City",
      "Travel Mode",
      "Arrival Date",
      "Message",
      "Submitted",
    ];
    const rows = visible.map((r) => [
      r.full_name,
      r.mobile,
      attendanceLabel(r.attendance),
      r.adults,
      r.children,
      daysLabel(r.attending_days),
      r.travel_city ?? "",
      r.travel_mode ?? "",
      r.arrival_date ?? "",
      (r.message ?? "").replace(/\s+/g, " "),
      new Date(r.created_at).toLocaleString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `rsvp-responses-${new Date().toISOString().slice(0, 10)}.csv`;
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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Wedding Desk</p>
          <h1 className="font-display truncate text-3xl text-burgundy">RSVP Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex shrink-0 items-center gap-2 border border-gold/50 px-4 py-2.5 text-[0.6rem] uppercase tracking-[0.22em] text-burgundy hover:bg-ivory-deep/60"
        >
          <LogOut size={13} strokeWidth={1.5} /> Sign out
        </button>
      </header>

      {error && (
        <p className="mt-8 border border-destructive/40 bg-destructive/5 px-4 py-3 text-[0.82rem] text-destructive">
          {error instanceof Error ? error.message : "Could not load the dashboard."}
        </p>
      )}

      {isPending ? (
        <div className="mt-16 flex justify-center text-gold-deep">
          <Loader2 className="animate-spin" strokeWidth={1.4} />
        </div>
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Responses", summary.total],
              ["Attending", summary.attending],
              ["Guests coming", summary.heads],
              ["Declined", summary.declined],
              ["Groups invited", summary.invited],
              ["Pending RSVP", summary.pending],
            ].map(([label, value]) => (
              <div key={String(label)} className={card}>
                <p className="font-display text-3xl text-burgundy tabular-nums">{value}</p>
                <p className="mt-1 text-[0.55rem] uppercase tracking-[0.2em] text-warmgrey">{label}</p>
              </div>
            ))}
          </section>

          <div className="mt-8 flex gap-2">
            {(["responses", "groups"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`border px-5 py-2.5 text-[0.6rem] uppercase tracking-[0.24em] transition-colors ${
                  activeTab === t
                    ? "border-gold/70 bg-burgundy text-ivory"
                    : "border-gold/40 text-warmgrey hover:text-burgundy"
                }`}
              >
                {t === "responses" ? "Responses" : "Invitation Groups"}
              </button>
            ))}
          </div>

          {activeTab === "responses" ? (
            <section className="mt-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={14}
                    strokeWidth={1.5}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-warmgrey"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, mobile or city"
                    className={`${input} pl-9`}
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className={`${input} w-auto`}
                >
                  <option value="all">All responses</option>
                  <option value="yes">Attending</option>
                  <option value="some">Partially attending</option>
                  <option value="unsure">Not sure</option>
                  <option value="no">Cannot attend</option>
                </select>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="flex items-center gap-2 border border-gold/60 bg-ivory-deep/60 px-4 py-2.5 text-[0.6rem] uppercase tracking-[0.22em] text-burgundy hover:bg-ivory-deep"
                >
                  <Download size={13} strokeWidth={1.5} /> Export CSV
                </button>
              </div>

              {visible.length === 0 ? (
                <p className={`${card} mt-5 text-center text-[0.85rem] text-warmgrey`}>
                  No responses match this view yet.
                </p>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[52rem] border-collapse text-left text-[0.82rem]">
                    <thead>
                      <tr className="border-b border-gold/40 text-[0.55rem] uppercase tracking-[0.2em] text-gold-deep">
                        {["Guest", "Mobile", "Attending", "Days", "Pax", "Travel", "Arrival", "Submitted", "Action"].map(
                          (h) => (
                            <th key={h} className="px-3 py-3 font-normal">
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((r) => (
                        <tr key={r.id} className="border-b border-gold/20 align-top">
                          <td className="px-3 py-3">
                            <span className="font-display text-base text-burgundy">{r.full_name}</span>
                            {r.message && (
                              <p className="mt-1 max-w-[16rem] text-[0.75rem] italic text-warmgrey">
                                “{r.message}”
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3 tabular-nums">{r.mobile}</td>
                          <td className="px-3 py-3">{attendanceLabel(r.attendance)}</td>
                          <td className="px-3 py-3">{daysLabel(r.attending_days)}</td>
                          <td className="px-3 py-3 tabular-nums">
                            {r.adults}A · {r.children}C
                          </td>
                          <td className="px-3 py-3">
                            {r.travel_city || "—"}
                            {r.travel_mode ? ` · ${r.travel_mode}` : ""}
                          </td>
                          <td className="px-3 py-3">
                            {r.arrival_date || "—"}
                          </td>
                          <td className="px-3 py-3 text-warmgrey">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              aria-label="Delete response"
                              onClick={() => {
                                if (confirm(`Delete RSVP for ${r.full_name}?`)) {
                                  destroyResponse.mutate(r.id);
                                }
                              }}
                              className="border border-gold/30 p-1.5 text-warmgrey hover:border-destructive/60 hover:text-destructive"
                            >
                              <Trash2 size={13} strokeWidth={1.5} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            <section className="mt-6">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 border border-gold/70 bg-burgundy px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.24em] text-ivory hover:bg-burgundy-deep"
                >
                  <Plus size={14} /> New Group
                </button>
              </div>

              {showForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                  className={`${card} mt-4 space-y-4`}
                >
                  <h3 className="font-display text-xl text-burgundy">Add Invitation Group</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[0.6rem] uppercase tracking-[0.2em] text-gold-deep">
                        Group Name
                      </label>
                      <input
                        required
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        className={input}
                        placeholder="e.g. Panjwani Family"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] uppercase tracking-[0.2em] text-gold-deep">
                        Side
                      </label>
                      <select
                        value={draft.side}
                        onChange={(e) =>
                          setDraft({ ...draft, side: e.target.value as "bride" | "groom" | "both" })
                        }
                        className={input}
                      >
                        <option value="groom">Groom’s Side</option>
                        <option value="bride">Bride’s Side</option>
                        <option value="both">Both Sides</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[0.6rem] uppercase tracking-[0.2em] text-gold-deep">
                        Guest Count
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={draft.guestCount}
                        onChange={(e) => setDraft({ ...draft, guestCount: parseInt(e.target.value) || 1 })}
                        className={input}
                      />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] uppercase tracking-[0.2em] text-gold-deep">
                        Invited Days
                      </label>
                      <select
                        value={draft.invitedDays}
                        onChange={(e) =>
                          setDraft({ ...draft, invitedDays: e.target.value as "24" | "25" | "both" })
                        }
                        className={input}
                      >
                        <option value="both">Both Days (24 & 25 Feb)</option>
                        <option value="24">24th Feb Only (Haldi & Sangeet)</option>
                        <option value="25">25th Feb Only (Wedding & Reception)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[0.6rem] uppercase tracking-[0.2em] text-gold-deep">
                        Contact Mobile (Optional)
                      </label>
                      <input
                        value={draft.contactMobile}
                        onChange={(e) => setDraft({ ...draft, contactMobile: e.target.value })}
                        className={input}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] uppercase tracking-[0.2em] text-gold-deep">
                        Notes (Optional)
                      </label>
                      <input
                        value={draft.notes}
                        onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                        className={input}
                        placeholder="e.g. Requires ground floor room"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={create.isPending}
                      className="border border-gold/70 bg-burgundy px-5 py-2.5 text-[0.62rem] uppercase tracking-[0.24em] text-ivory hover:bg-burgundy-deep disabled:opacity-50"
                    >
                      {create.isPending ? "Saving…" : "Save Group"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="border border-gold/40 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.24em] text-warmgrey hover:text-burgundy"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {groups.length === 0 ? (
                <p className={`${card} mt-5 text-center text-[0.85rem] text-warmgrey`}>
                  No invitation groups yet.
                </p>
              ) : (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {groups.map((g) => (
                    <li key={g.id} className={`${card} flex items-start justify-between gap-3`}>
                      <div className="min-w-0">
                        <p className="font-display text-lg text-burgundy">{g.name || "Invitation Group"}</p>
                        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-warmgrey">
                          {g.guest_count || 0} guests · {daysLabel(g.invited_days)} · {g.side || "both"}
                        </p>
                        {g.contact_mobile && (
                          <p className="mt-1 text-[0.78rem] text-charcoal">{g.contact_mobile}</p>
                        )}
                        {g.notes && <p className="mt-1 text-[0.78rem] italic text-warmgrey">{g.notes}</p>}
                      </div>
                      <button
                        type="button"
                        aria-label={`Delete ${g.name || "group"}`}
                        onClick={() => {
                          if (confirm(`Delete group "${g.name || "Invitation Group"}"?`)) {
                            destroy.mutate(g.id);
                          }
                        }}
                        className="shrink-0 border border-gold/40 p-2 text-warmgrey hover:border-destructive/60 hover:text-destructive"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
