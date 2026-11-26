import React, { useState, useMemo } from "react";
import { getCommonParams } from "../../Utils/helper";
import { useGetVendorAllocatedItemsQuery } from "../../redux/uniformService/BiddingService";
import VendorQuotationForm from "./VendorQuotationForm";

export default function VendorAllocatedItems() {
  const { partyId } = getCommonParams();

  // RTK Query hook
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

  // Form View State: when an item is selected, we switch from list view to full quotation form
  const [selectedItemForForm, setSelectedItemForForm] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, QUOTED

  // Metrics
  const totalAllocated = items.length;
  const quotedCount = items.filter((it) => it.quotedPrice !== null && it.quotedPrice !== undefined).length;
  const pendingCount = totalAllocated - quotedCount;

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (
        selectedCategory !== "ALL" &&
        (item.category || "").toUpperCase() !== selectedCategory.toUpperCase()
      ) {
        return false;
      }

      // Status filter
      const isQuoted = item.quotedPrice !== null && item.quotedPrice !== undefined;
      if (statusFilter === "PENDING" && isQuoted) return false;
      if (statusFilter === "QUOTED" && !isQuoted) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const bidNo = (item.bidNo || "").toLowerCase();
        const itemName = (item.itemName || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const specsStr = Object.values(item.specs || {})
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          bidNo.includes(term) ||
          itemName.includes(term) ||
          category.includes(term) ||
          specsStr.includes(term)
        );
      }

      return true;
    });
  }, [items, selectedCategory, statusFilter, searchTerm]);

  // If vendor selected an item to edit / quote, render the full Quotation Form
  if (selectedItemForForm) {
    return (
      <VendorQuotationForm
        item={selectedItemForForm}
        onBack={() => setSelectedItemForForm(null)}
        onSaved={() => {
          setSelectedItemForForm(null);
          refetch();
        }}
      />
    );
  }

  // Calculate deadline remaining text
  const getDeadlineBadge = (deadlineStr) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
          Expired
        </span>
      );
    }
    if (diffDays <= 2) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 animate-pulse">
          {diffDays === 0 ? "Due Today" : `${diffDays}d left`}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
        {diffDays} days left
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Allocated Indent Items</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                Vendor Portal
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Material items allocated to your company. Click Edit to view full specifications, submit prices, and attach quality documents.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
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

      {/* Filter and Search Bar */}
      <div className="px-6 py-3 bg-white/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "YARN", "FABRIC", "MACHINE SPARES", "DYES & CHEMICALS", "GENERAL"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Right side: Status Filter & Search */}
        <div className="flex items-center space-x-2">
          {/* Status Segmented Control */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "ALL" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({totalAllocated})
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "PENDING" ? "bg-white text-amber-800 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("QUOTED")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "QUOTED" ? "bg-white text-emerald-800 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Quoted ({quotedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search bid no, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-2.5 top-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading allocated items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-64 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl mb-3">
              📦
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Allocated Items Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {items.length === 0
                ? "No published indent items have been allocated to your organization yet."
                : "No items match your selected filter or search criteria."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5 w-16">
                    S.No
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Bid Reference
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Material Item
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Required Qty
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Deadline
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Quote Status
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.map((item, idx) => {
                  const isQuoted = item.quotedPrice !== null && item.quotedPrice !== undefined;
                  const buyerDocCount = (item.buyerDocuments || []).length;
                  const uploadCount = (item.vendorUploads || []).filter((u) => u.filePath || u.fileName).length;

                  return (
                    <tr
                      key={item.biddingIndentId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* S.No */}
                      <td className="px-5 py-4 text-slate-400 font-medium">
                        {idx + 1}
                      </td>

                      {/* Bid Reference */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md font-bold text-blue-800 shadow-sm inline-block">
                          {item.bidNo || `BID-${item.bidId || item.biddingIndentId}`}
                        </span>
                        {item.bidName && (
                          <span className="block text-[11px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                            {item.bidName}
                          </span>
                        )}
                      </td>

                      {/* Material Item & Category */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                            {(item.itemName || "IT").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {item.itemName}
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              {item.category && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                  {item.category}
                                </span>
                              )}
                              {buyerDocCount > 0 && (
                                <span className="inline-flex items-center text-[10px] text-blue-600 font-medium">
                                  • {buyerDocCount} TDS
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Required Qty & UOM */}
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {item.qty}{" "}
                        <span className="text-xs font-semibold text-slate-500">
                          {item.uom || "Units"}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="px-5 py-4">
                        <div>
                          <div className="text-slate-700 font-medium">
                            {item.deadlines?.submission
                              ? new Date(item.deadlines.submission).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </div>
                          <div className="mt-0.5">
                            {getDeadlineBadge(item.deadlines?.submission)}
                          </div>
                        </div>
                      </td>

                      {/* Quote Status */}
                      <td className="px-5 py-4">
                        {isQuoted ? (
                          <div>
                            <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-xs">
                              ₹ {parseFloat(item.quotedPrice).toFixed(2)}
                              <span className="text-[10px] font-normal text-emerald-600 ml-1">
                                / {item.uom || "Unit"}
                              </span>
                            </div>
                            {uploadCount > 0 && (
                              <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                                {uploadCount} file(s) attached
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold text-xs">
                            ● Action Needed
                          </span>
                        )}
                      </td>

                      {/* Actions: Edit button opens the new Quotation Form */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedItemForForm(item)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors inline-flex items-center space-x-1.5 ${
                            isQuoted
                              ? "bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>{isQuoted ? "Edit Quote" : "Quote Price"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
