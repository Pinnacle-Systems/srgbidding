import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { useGetBidsQuery, useDeleteBidMutation } from "../redux/uniformService/BiddingService";
import BidViewModal from "./BidReportViewModal";

const filterTabs = ["All", "Draft", "Published", "Closing", "Awarded", "Closed", "Cancelled"];

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "PUBLISHED": return "bg-blue-100 text-blue-700 border-blue-200";
    case "CLOSING": return "bg-amber-100 text-amber-700 border-amber-200";
    case "AWARDED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "CLOSED": return "bg-slate-100 text-slate-700 border-slate-200";
    case "DRAFT": return "bg-purple-100 text-purple-700 border-purple-200";
    case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const formatDeadline = (dateStr) => {
  if (!dateStr) return { text: "Not set", badge: null, badgeColor: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { text: dateStr, badge: null, badgeColor: "" };

  const now = new Date();
  const diffHours = (d - now) / (1000 * 60 * 60);

  const formattedDate = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

  if (diffHours < 0) {
    return { text: formattedDate, badge: "Expired", badgeColor: "bg-slate-100 text-slate-500 border-slate-200" };
  } else if (diffHours < 24) {
    return { text: formattedDate, badge: "Closing Today", badgeColor: "bg-red-100 text-red-700 border-red-200" };
  } else if (diffHours < 48) {
    return { text: formattedDate, badge: "Closing Soon", badgeColor: "bg-amber-100 text-amber-700 border-amber-200" };
  } else {
    const daysLeft = Math.ceil(diffHours / 24);
    return { text: formattedDate, badge: `${daysLeft}d left`, badgeColor: "bg-blue-50 text-blue-600 border-blue-200" };
  }
};

const getBidStats = (bid) => {
  const lots = bid.BiddingLots || [];
  const indents = lots.flatMap((l) => l.BiddingIndent || []);
  const vendorsMap = new Map();
  let quotesCount = 0;

  indents.forEach((ind) => {
    ind.BiddingIndentvendors?.forEach((v) => {
      const vId = v.vendorId || v.id;
      if (vId && !vendorsMap.has(vId)) {
        vendorsMap.set(vId, v.status);
        if (v.status === "QUOTED" || v.status === "Submitted") {
          quotesCount++;
        }
      }
    });
  });

  const totalVendors = vendorsMap.size;
  return {
    totalLots: lots.length,
    totalIndents: indents.length,
    totalVendors,
    quotesIn: totalVendors > 0 ? `${quotesCount} of ${totalVendors}` : "-"
  };
};

export default function Bids({ setCurrentView, setEditingBidId, onOpenCommunications }) {
  const { data: allBidData, isLoading, refetch } = useGetBidsQuery({ params: {} });
  const [deleteBid] = useDeleteBidMutation();

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBidForView, setSelectedBidForView] = useState(null);

  const bidsList = allBidData?.data || [];

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const total = bidsList.length;
    const published = bidsList.filter((b) => b.status?.toUpperCase() === "PUBLISHED").length;
    const drafts = bidsList.filter((b) => b.status?.toUpperCase() === "DRAFT").length;
    const closingSoon = bidsList.filter((b) => {
      if (b.status?.toUpperCase() !== "PUBLISHED") return false;
      const dl = b.submissionDeadline || b.closingDate;
      if (!dl) return false;
      const diff = (new Date(dl) - new Date()) / (1000 * 60 * 60);
      return diff > 0 && diff <= 48;
    }).length;

    return { total, published, drafts, closingSoon };
  }, [bidsList]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { All: bidsList.length };
    filterTabs.forEach((tab) => {
      if (tab !== "All") {
        counts[tab] = bidsList.filter((b) => b.status?.toUpperCase() === tab.toUpperCase()).length;
      }
    });
    return counts;
  }, [bidsList]);

  // Filtered and Searched Bids
  const filteredBids = useMemo(() => {
    return bidsList.filter((bid) => {
      // Status match
      const statusMatch =
        activeTab === "All" || bid.status?.toUpperCase() === activeTab.toUpperCase();

      // Search query match
      const query = searchQuery.trim().toLowerCase();
      const searchMatch =
        !query ||
        bid.docId?.toLowerCase().includes(query) ||
        bid.bidNo?.toLowerCase().includes(query) ||
        bid.name?.toLowerCase().includes(query);

      return statusMatch && searchMatch;
    });
  }, [bidsList, activeTab, searchQuery]);

  // Action: Edit
  const handleEditBid = (bid) => {
    if (setEditingBidId) {
      setEditingBidId(bid.id);
    }
    if (setCurrentView) {
      setCurrentView("create");
    }
  };

  // Action: Delete
  const handleDeleteBid = async (bid) => {
    const isDraft = bid.status?.toUpperCase() === "DRAFT";
    const bidIdentifier = bid.docId || bid.bidNo || `#${bid.id}`;

    const result = await Swal.fire({
      title: isDraft ? "Delete Draft Bid?" : "Delete This Bid?",
      text: isDraft
        ? `Are you sure you want to permanently delete draft ${bidIdentifier}?`
        : `Bid ${bidIdentifier} is currently ${bid.status}. Deleting will remove all lot and vendor configurations.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteBid(bid.id).unwrap();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `Bid ${bidIdentifier} deleted successfully.`,
          timer: 1800,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: err?.data?.message || err?.message || "Could not delete this bid.",
        });
      }
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-full space-y-2 pl-5">

      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mt-1">
        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by Bid No, Title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-sm shadow-sm transition-colors"
            title="Refresh Bids List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (setEditingBidId) setEditingBidId(null);
              if (setCurrentView) setCurrentView("create");
            }}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Bid</span>
          </button>
        </div>
      </div>



      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pl-3">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => {
            const count = tabCounts[tab] || 0;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${isActive
                  ? "bg-blue-50 text-blue-700 border-blue-300 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>


      </div>

      {/* Bids Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden  ">
        <div className="overflow-x-auto ">
          <table className="w-full text-left text-sm whitespace-nowrap ">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">Bid Code</th>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Lots & Indents</th>
                <th className="px-5 py-3 font-semibold">Vendors</th>
                <th className="px-5 py-3 font-semibold">Quotes In</th>
                <th className="px-5 py-3 font-semibold">Submission Deadline</th>
                <th className="px-5 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBids?.map((bid) => {
                const stats = getBidStats(bid);
                const deadline = formatDeadline(bid.submissionDeadline || bid.closingDate);
                const bidCode = bid.docId || bid.bidNo || `BID-${bid.id}`;

                return (
                  <tr key={bid.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-1 font-mono font-bold text-slate-900 text-xs">
                      {bidCode}
                    </td>

                    <td className="px-5 py-1">
                      <div className="font-semibold text-slate-800 max-w-xs truncate" title={bid.name}>
                        {bid.name || "Untitled Bid"}
                      </div>

                    </td>

                    <td className="px-5 py-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(bid.status)}`}>
                        {bid.status || "DRAFT"}
                      </span>
                    </td>

                    <td className="px-5 py-1 text-xs">
                      <span className="font-semibold text-slate-800">{stats.totalLots} Lots</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-slate-500">{stats.totalIndents} Items</span>
                    </td>

                    <td className="px-5 py-1 text-xs font-medium text-slate-700">
                      {stats.totalVendors} Invited
                    </td>

                    {/* Quotes In */}
                    <td className="px-5 py-1 text-xs">
                      <span className="font-semibold text-slate-800">{stats.quotesIn}</span>
                    </td>

                    <td className="px-5 py-1 text-xs flex flex-row gap-3">
                      <div className="font-medium text-slate-800">{deadline.text}</div>
                      {deadline.badge && (
                        <span className={` w-10 inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border ${deadline.badgeColor}`}>
                          {deadline.badge}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-1 text-center">
                      <div className="inline-flex items-center gap-1.5">

                        <button
                          onClick={() => setSelectedBidForView(bid)}
                          title="View Bid Details"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => {
                            if (onOpenCommunications) {
                              onOpenCommunications(bid.id);
                            } else if (setCurrentView) {
                              if (setEditingBidId) setEditingBidId(bid.id);
                              setCurrentView("communications");
                            }
                          }}
                          title="Pre-Bid Chats & Vendor Documents Hub"
                          className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleEditBid(bid)}
                          title="Edit Bid"
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDeleteBid(bid)}
                          title="Delete Bid"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredBids?.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium text-sm text-slate-600">No bids found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery ? "Try refining your search query." : `There are no bids under "${activeTab}" status.`}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selectedBidForView && (
        <BidViewModal
          bid={selectedBidForView}
          isOpen={Boolean(selectedBidForView)}
          onClose={() => setSelectedBidForView(null)}
          onEdit={(bid) => {
            setSelectedBidForView(null);
            handleEditBid(bid);
          }}
        />
      )}

    </div>
  );
}
