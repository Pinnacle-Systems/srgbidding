import React, { useMemo } from "react";
import { useBiddingAuth } from "./context/BiddingAuthContext";
import { useGetBidsQuery } from "../redux/uniformService/BiddingService";
import { computeDashboardStats, formatTimeLeft, CLOSING_SOON_HOURS, STATUS_ORDER } from "./bidDashboardStats";

const TONES = {
  blue: "text-blue-700 bg-blue-50 border-blue-200",
  amber: "text-amber-700 bg-amber-50 border-amber-200",
  emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
  purple: "text-purple-700 bg-purple-50 border-purple-200",
  red: "text-red-700 bg-red-50 border-red-200",
  slate: "text-slate-700 bg-slate-50 border-slate-200",
};

const STATUS_BAR = {
  DRAFT: "bg-purple-500",
  PUBLISHED: "bg-blue-500",
  CLOSING: "bg-amber-500",
  AWARDED: "bg-emerald-500",
  CLOSED: "bg-slate-500",
  CANCELLED: "bg-red-500",
};

const titleCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

export default function Dashboard({ setCurrentView }) {
  const { role } = useBiddingAuth();
  const { data, isLoading, isError, isFetching, refetch } = useGetBidsQuery({ params: {} });

  const stats = useMemo(() => computeDashboardStats(data?.data || []), [data]);
  const goBids = () => setCurrentView && setCurrentView("bids");

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="px-5 mt-6">
        <div className="max-w-md mx-auto text-center bg-white border border-red-200 rounded-lg p-8">
          <p className="text-sm font-semibold text-slate-800">Couldn't load dashboard data</p>
          <p className="text-xs text-slate-500 mt-1">Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // if (stats.total === 0) {
  //   return (
  //     <div className="px-5 mt-6">
  //       <div className="max-w-md mx-auto text-center bg-white border border-dashed border-slate-300 rounded-lg p-10">
  //         <p className="text-sm font-semibold text-slate-800">No bids yet</p>
  //         <p className="text-xs text-slate-500 mt-1">Create your first bid and its numbers will appear here.</p>
  //         <button
  //           type="button"
  //           onClick={() => setCurrentView && setCurrentView("create")}
  //           className="mt-4 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
  //         >
  //           Create Bid
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  const quoteValue = stats.vendorsInvited > 0 ? `${stats.quotesIn} / ${stats.vendorsInvited}` : "-";
  const maxCount = Math.max(1, ...STATUS_ORDER.map((s) => stats.counts[s]));

  return (
    <div className="space-y-3 animate-in fade-in duration-500 px-5 mt-3 pb-4">
      <header className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          Welcome back, <span className="font-semibold text-slate-700">{role}</span>. Here's what's happening.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 disabled:opacity-60"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {/* Stat cards: click through to the reports page */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
        <StatCard title="Published bids" value={stats.published} tone="blue" onClick={goBids} />
        <StatCard title={`Closing in ${CLOSING_SOON_HOURS}h`} value={stats.closingSoon} tone="amber" onClick={goBids} />
        <StatCard title="Overdue" value={stats.overdue} tone="red" onClick={goBids} hint="Past deadline, still published" />
        <StatCard title="Quotes received" value={quoteValue} tone="emerald" onClick={goBids} hint="Vendors who quoted / invited" />
        <StatCard title="Drafts" value={stats.drafts} tone="purple" onClick={goBids} />
        <StatCard title="Awarded" value={stats.awarded} tone="slate" onClick={goBids} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Closing soon */}
        <section className="xl:col-span-2 bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
            <h3 className="text-sm font-semibold text-slate-800">Bids closing soon</h3>
            <button type="button" onClick={goBids} className="text-xs text-blue-700 font-medium hover:underline">
              View all
            </button>
          </div>
          {stats.closingList.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No published bids with an upcoming deadline.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Bid</th>
                    <th className="px-4 py-2 font-semibold">Title</th>
                    <th className="px-4 py-2 font-semibold">Time left</th>
                    <th className="px-4 py-2 font-semibold">Quotes in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stats.closingList.map((r) => (
                    <tr key={r.bid.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono font-semibold text-slate-900">{r.code}</td>
                      <td className="px-4 py-2 max-w-[260px] truncate" title={r.title}>{r.title}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded border font-semibold ${r.hours <= CLOSING_SOON_HOURS ? TONES.amber : TONES.blue}`}>
                          {formatTimeLeft(r.hours)}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium">{r.invited > 0 ? `${r.quoted} of ${r.invited}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Bids by status */}
        <section className="bg-white rounded-md border border-slate-200 shadow-sm">
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/60">
            <h3 className="text-sm font-semibold text-slate-800">Bids by status</h3>
          </div>
          <ul className="p-4 space-y-2">
            {STATUS_ORDER.map((s) => (
              <li key={s} className="flex items-center gap-2 text-xs">
                <span className="w-20 text-slate-600">{titleCase(s)}</span>
                <span className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <span
                    className={`block h-full rounded-full ${STATUS_BAR[s]}`}
                    style={{ width: `${(stats.counts[s] / maxCount) * 100}%` }}
                  />
                </span>
                <span className="w-6 text-right font-semibold text-slate-800 tabular-nums">{stats.counts[s]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Needs attention */}
      <section className="bg-white rounded-md border border-slate-200 shadow-sm">
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Needs attention</h3>
          {stats.attentionTotal > 0 && (
            <span className="text-xs text-slate-500">
              Showing {stats.attention.length} of {stats.attentionTotal}
            </span>
          )}
        </div>
        {stats.attention.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500">Nothing needs attention right now.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {stats.attention.map((a, i) => (
              <li key={`${a.bid.id}-${i}`} className="px-4 py-2 flex items-center gap-3 text-xs">
                <span className={`shrink-0 px-2 py-0.5 rounded border font-semibold ${a.tone === "red" ? TONES.red : TONES.amber}`}>
                  {a.tone === "red" ? "Urgent" : "Check"}
                </span>
                <span className="font-mono font-semibold text-slate-900">{a.code}</span>
                <span className="truncate text-slate-600" title={a.title}>{a.title}</span>
                <span className="ml-auto text-slate-700 text-right">{a.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, tone, onClick, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className="text-left bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
    >
      <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">{title}</span>
      <span className={`mt-3 inline-block text-3xl font-black tracking-tight ${TONES[tone].split(" ")[0]}`}>{value}</span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="px-5 mt-4 space-y-3 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[84px] bg-slate-100 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 h-56 bg-slate-100 rounded-md" />
        <div className="h-56 bg-slate-100 rounded-md" />
      </div>
      <div className="h-32 bg-slate-100 rounded-md" />
    </div>
  );
}
