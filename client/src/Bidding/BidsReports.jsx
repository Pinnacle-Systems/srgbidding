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

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Page numbers with ellipses, e.g. 1 … 4 5 6 … 12
const getPageItems = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
};

export default function Bids({ setCurrentView, setEditingBidId, onOpenCommunications }) {
  const { data: allBidData, isLoading, refetch } = useGetBidsQuery({ params: {} });
  const [deleteBid] = useDeleteBidMutation();

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBidForView, setSelectedBidForView] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Pagination (page is clamped, so deleting the last row of a page never leaves an empty page)
  const totalItems = filteredBids.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedBids = filteredBids.slice(startIndex, startIndex + pageSize);
  const showingFrom = totalItems === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, totalItems);

  // Any filter change goes back to page 1
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
  };
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

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

  const pageBtnBase =
    "inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md border text-xs font-medium transition-colors";
  const pageBtnIdle = "bg-white border-slate-300 text-slate-700 hover:bg-slate-50";
  const pageBtnOff = "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white";

  return (
    <div className="animate-in fade-in duration-500 h-full min-h-[420px] flex flex-col gap-2 pl-5 pr-1 py-1">

      {/* ───────── Header: search · status filter · actions ───────── */}
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by Bid No, Title..."
              aria-label="Search bids"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-8 bg-white border border-slate-300 rounded-lg pl-9 pr-8 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by status">
            {filterTabs.map((tab) => {
              const count = tabCounts[tab] || 0;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleTabChange(tab)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 ${isActive
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 rounded-full font-bold leading-4 ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            aria-label="Refresh bids list"
            title="Refresh Bids List"
            className="inline-flex items-center justify-center w-8 h-8 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 rounded-lg shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              if (setEditingBidId) setEditingBidId(null);
              if (setCurrentView) setCurrentView("create");
            }}
            className="inline-flex items-center gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white px-3.5 rounded-lg font-semibold text-xs transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Bid</span>
          </button>
        </div>
      </header>

      {/* ───────── Body: reports table (scrolls; header row stays pinned) + footer pagination ───────── */}
      <section className="flex-1 min-h-0 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 px-4 py-2.5 w-12 text-center">#</th>
                <th scope="col" className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 px-4 py-2.5">Bid Code</th>
                <th scope="col" className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 px-4 py-2.5">Title</th>
                <th scope="col" className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 px-4 py-2.5">Status</th>
                <th scope="col" className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 px-4 py-2.5">Lots &amp; Indents</th>
                <th scope="col" className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 px-4 py-2.5">Vendors</th>
                <th scope="col" className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 px-4 py-2.5">Quotes In</th>
                <th scope="col" className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 px-4 py-2.5">Submission Deadline</th>
                <th scope="col" className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 px-4 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {pagedBids.map((bid, idx) => {
                const stats = getBidStats(bid);
                const deadline = formatDeadline(bid.submissionDeadline || bid.closingDate);
                const bidCode = bid.docId || bid.bidNo || `BID-${bid.id}`;

                return (
                  <tr
                    key={bid.id}
                    className={`border-b border-slate-100 hover:bg-blue-50/50 transition-colors ${idx % 2 ? "bg-slate-50/60" : "bg-white"}`}
                  >
                    <td className="px-4 py-1.5 text-center text-slate-500">{startIndex + idx + 1}</td>

                    <td className="px-4 py-1.5 font-mono font-bold text-slate-900">{bidCode}</td>

                    <td className="px-4 py-1.5">
                      <div className="font-semibold text-slate-800 max-w-xs truncate" title={bid.name}>
                        {bid.name || "Untitled Bid"}
                      </div>
                    </td>

                    <td className="px-4 py-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusColor(bid.status)}`}>
                        {bid.status || "DRAFT"}
                      </span>
                    </td>

                    <td className="px-4 py-1.5">
                      <span className="font-semibold text-slate-800">{stats.totalLots} Lots</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-slate-600">{stats.totalIndents} Items</span>
                    </td>

                    <td className="px-4 py-1.5 font-medium text-slate-700">{stats.totalVendors} Invited</td>

                    <td className="px-4 py-1.5 font-semibold text-slate-800">{stats.quotesIn}</td>

                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{deadline.text}</span>
                        {deadline.badge && (
                          <span className={`inline-block text-[10px] font-bold px-1.5 rounded border whitespace-nowrap ${deadline.badgeColor}`}>
                            {deadline.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-1 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedBidForView(bid)}
                          title="View Bid Details"
                          aria-label={`View details of ${bidCode}`}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenCommunications) {
                              onOpenCommunications(bid.id);
                            } else if (setCurrentView) {
                              if (setEditingBidId) setEditingBidId(bid.id);
                              setCurrentView("communications");
                            }
                          }}
                          title="Pre-Bid Chats & Vendor Documents Hub"
                          aria-label={`Open chats and documents for ${bidCode}`}
                          className="p-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditBid(bid)}
                          title="Edit Bid"
                          aria-label={`Edit ${bidCode}`}
                          className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBid(bid)}
                          title="Delete Bid"
                          aria-label={`Delete ${bidCode}`}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {isLoading && (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-slate-500">Loading bids…</td>
                </tr>
              )}

              {!isLoading && totalItems === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                    <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium text-sm text-slate-700">No bids found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery ? "Try refining your search query." : `There are no bids under "${activeTab}" status.`}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: range · page size · pagination */}
        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Showing <b className="font-semibold text-slate-900">{showingFrom}–{showingTo}</b> of{" "}
              <b className="font-semibold text-slate-900">{totalItems}</b> {totalItems === 1 ? "bid" : "bids"}
            </span>
            <label className="flex items-center gap-1.5">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-7 bg-white border border-slate-300 rounded-md px-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
          </div>

          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
              className={`${pageBtnBase} ${pageBtnIdle} ${pageBtnOff}`}
            >
              «
            </button>
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className={`${pageBtnBase} ${pageBtnIdle} ${pageBtnOff}`}
            >
              ‹ Prev
            </button>

            {getPageItems(currentPage, totalPages).map((item, i) =>
              item === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-slate-500" aria-hidden="true">…</span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={`${pageBtnBase} ${item === currentPage
                    ? "bg-blue-600 border-blue-600 text-white"
                    : pageBtnIdle
                    }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className={`${pageBtnBase} ${pageBtnIdle} ${pageBtnOff}`}
            >
              Next ›
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
              className={`${pageBtnBase} ${pageBtnIdle} ${pageBtnOff}`}
            >
              »
            </button>
          </nav>
        </footer>
      </section>

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
