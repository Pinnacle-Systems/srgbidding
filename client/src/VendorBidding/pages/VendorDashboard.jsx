import React, { useMemo } from "react";
import { getCommonParams } from "../../Utils/helper";
import { useGetVendorAllocatedItemsQuery } from "../../redux/uniformService/BiddingService";

export default function VendorDashboard({ onNavigateToBids }) {
  const { partyId } = getCommonParams();

  const {
    data: responseData,
    isLoading,
    isFetching,
    refetch,
  } = useGetVendorAllocatedItemsQuery(
    { partyId },
    { skip: !partyId, refetchOnMountOrArgChange: true }
  );

  const items = useMemo(() => {
    return responseData?.data || [];
  }, [responseData]);

  // Metrics
  const totalAllocated = items.length;
  const quotedCount = items.filter(
    (it) => it.quotedPrice !== null && it.quotedPrice !== undefined
  ).length;
  const pendingCount = totalAllocated - quotedCount;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-auto">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2.5">
              <span>Vendor Dashboard</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                Overview
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Summary of material allocations and bidding response metrics.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center px-3.5 py-2 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${isFetching ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Body: Just the 3 Cards */}
      <div className="p-8 max-w-6xl mx-auto w-full">
        {isLoading ? (
          <div className="h-48 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading metrics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Total Allocated Items */}
            <div
              onClick={onNavigateToBids}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Allocated Items
                </span>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  📦
                </div>
              </div>
              <div className="text-4xl font-extrabold text-slate-900 mt-4">
                {totalAllocated}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Items invited by buyers</span>
                {onNavigateToBids && (
                  <span className="text-blue-600 font-semibold group-hover:underline">
                    View Items →
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Action Needed (Pending Quote) */}
            <div
              onClick={onNavigateToBids}
              className="p-6 rounded-2xl bg-white border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Action Needed (Pending Quote)
                </span>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  ⏳
                </div>
              </div>
              <div className="text-4xl font-extrabold text-amber-900 mt-4">
                {pendingCount}
              </div>
              <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-700">
                <span>Awaiting your quotation</span>
                {onNavigateToBids && (
                  <span className="text-amber-800 font-semibold group-hover:underline">
                    Quote Now →
                  </span>
                )}
              </div>
            </div>

            {/* Card 3: Quotes Submitted */}
            <div
              onClick={onNavigateToBids}
              className="p-6 rounded-2xl bg-white border border-emerald-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Quotes Submitted
                </span>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  ✓
                </div>
              </div>
              <div className="text-4xl font-extrabold text-emerald-900 mt-4">
                {quotedCount}
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-700">
                <span>Successfully submitted</span>
                {onNavigateToBids && (
                  <span className="text-emerald-800 font-semibold group-hover:underline">
                    Review →
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
