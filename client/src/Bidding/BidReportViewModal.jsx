import React, { useState } from "react";
import { getImageUrlPath } from "../Constants";

export default function BidViewModal({ bid, isOpen, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState("quotes"); // Default to quotes tab if quotes exist, else lots

  if (!isOpen || !bid) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not specified";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PUBLISHED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "CLOSING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "AWARDED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const totalLots = bid.BiddingLots?.length || 0;
  const allIndents = bid.BiddingLots?.flatMap((lot) => lot.BiddingIndent || []) || [];
  const totalIndents = allIndents.length;

  // Flatten all unique vendors & responses across indents
  const vendorMap = new Map();
  let totalQuotesCount = 0;
  let totalUploadsCount = 0;

  allIndents.forEach((ind) => {
    ind.BiddingIndentvendors?.forEach((v) => {
      const vId = v.vendorId || v.id;
      const uploads = v.indentVendorsUpload || [];
      const quoteRecord = uploads.find((u) => u.price !== null && u.price !== undefined);
      const docRecords = uploads.filter((u) => u.filePath || u.fileName);

      if (v.status === "QUOTED" || quoteRecord) {
        totalQuotesCount++;
      }
      totalUploadsCount += docRecords.length;

      const itemName = ind.Item?.name || ind.customData?.item_name || "Indent Item";
      const uomName = ind.Uom?.name || "Units";

      if (vId && !vendorMap.has(vId)) {
        vendorMap.set(vId, {
          id: vId,
          name: v.Vendor?.name || `Vendor #${vId}`,
          status: v.status || (quoteRecord ? "QUOTED" : "INVITED"),
          indentCount: 1,
          quotesCount: quoteRecord ? 1 : 0,
          quotes: quoteRecord
            ? [
                {
                  indentId: ind.id,
                  itemName,
                  qty: ind.qty,
                  uom: uomName,
                  price: quoteRecord.price,
                  remarks: quoteRecord.remarks,
                  date: quoteRecord.date,
                },
              ]
            : [],
          documents: [...docRecords],
        });
      } else if (vId && vendorMap.has(vId)) {
        const existing = vendorMap.get(vId);
        existing.indentCount += 1;
        if (v.status === "QUOTED") existing.status = "QUOTED";
        if (quoteRecord) {
          existing.quotesCount += 1;
          existing.quotes.push({
            indentId: ind.id,
            itemName,
            qty: ind.qty,
            uom: uomName,
            price: quoteRecord.price,
            remarks: quoteRecord.remarks,
            date: quoteRecord.date,
          });
        }
        existing.documents.push(...docRecords);
      }
    });
  });

  const vendorsList = Array.from(vendorMap.values());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md font-bold text-slate-800 shadow-sm">
              {bid.docId || bid.bidNo || `BID-${bid.id}`}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {bid.name || "Untitled Bid"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span>{totalLots} Lots ({totalIndents} Indents)</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">
                  {totalQuotesCount} Quotes Submitted
                </span>
                {totalUploadsCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-blue-700 font-semibold">
                      {totalUploadsCount} Docs Uploaded
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                bid.status
              )}`}
            >
              {bid.status || "DRAFT"}
            </span>

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(bid);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit Bid
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab("quotes")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === "quotes"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Vendor Quotes & Responses</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                totalQuotesCount > 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {totalQuotesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("lots")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "lots"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Lots & Items ({totalLots})
          </button>

          <button
            onClick={() => setActiveTab("vendors")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "vendors"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Invited Vendors ({vendorsList.length})
          </button>

          <button
            onClick={() => setActiveTab("terms")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "terms"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Terms & Deadlines
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-4">
          {/* TAB: VENDOR QUOTES & RESPONSES */}
          {activeTab === "quotes" && (
            <div className="space-y-6">
              {bid.BiddingLots?.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  No lots configured for this bid.
                </div>
              ) : (
                bid.BiddingLots?.map((lot, idx) => (
                  <div
                    key={lot.id || idx}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
                  >
                    <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs bg-slate-800 text-white px-2 py-0.5 rounded">
                          Lot {lot.lotNumber || idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 text-sm">
                          {lot.name || `Lot ${idx + 1}`}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {lot.BiddingIndent?.length || 0} Material Items
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200">
                      {lot.BiddingIndent?.map((ind, indIdx) => {
                        const custom = ind.customData || {};
                        const itemName = custom.item_name || ind.Item?.name || "Item";
                        const uomName = ind.Uom?.name || "Units";
                        const vendors = ind.BiddingIndentvendors || [];

                        return (
                          <div key={ind.id || indIdx} className="p-4 space-y-3">
                            {/* Indent Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  {custom.docId || ind.indentId ? `IND-${custom.docId || ind.indentId}` : `#${indIdx + 1}`}
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {itemName}
                                </h4>
                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {ind.indentType || custom.category || "General"}
                                </span>
                              </div>
                              <div className="text-sm font-bold text-slate-800">
                                Required: {ind.qty} {uomName}
                              </div>
                            </div>

                            {/* Vendor Submissions for this Indent */}
                            {vendors.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">
                                No vendors allocated to this indent item.
                              </p>
                            ) : (
                              <div className="space-y-2 mt-2">
                                {vendors.map((v) => {
                                  const uploads = v.indentVendorsUpload || [];
                                  const quoteRecord = uploads.find(
                                    (u) => u.price !== null && u.price !== undefined
                                  );
                                  const docRecords = uploads.filter(
                                    (u) => u.filePath || u.fileName
                                  );
                                  const isQuoted = v.status === "QUOTED" || Boolean(quoteRecord);

                                  return (
                                    <div
                                      key={v.id}
                                      className={`p-3.5 rounded-xl border transition-colors ${
                                        isQuoted
                                          ? "bg-emerald-50/40 border-emerald-200"
                                          : "bg-slate-50/70 border-slate-200"
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        {/* Vendor Info */}
                                        <div className="flex items-center space-x-3">
                                          <div
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                                              isQuoted
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-slate-200 text-slate-600"
                                            }`}
                                          >
                                            {(v.Vendor?.name || "V").slice(0, 2).toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="flex items-center space-x-2">
                                              <span className="font-bold text-slate-900 text-sm">
                                                {v.Vendor?.name || `Vendor #${v.vendorId}`}
                                              </span>
                                              <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                  isQuoted
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                                }`}
                                              >
                                                {isQuoted ? "Quoted" : "Pending Quote"}
                                              </span>
                                            </div>
                                            {quoteRecord?.date && (
                                              <p className="text-[11px] text-slate-400 mt-0.5">
                                                Submitted: {formatDate(quoteRecord.date)}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Quoted Price */}
                                        <div className="sm:text-right">
                                          {isQuoted && quoteRecord?.price ? (
                                            <div>
                                              <div className="text-base font-extrabold text-emerald-700">
                                                ₹ {parseFloat(quoteRecord.price).toFixed(2)}
                                                <span className="text-xs font-normal text-emerald-600 ml-1">
                                                  / {uomName}
                                                </span>
                                              </div>
                                              {ind.qty && (
                                                <div className="text-[11px] text-slate-500 font-medium">
                                                  Total: ₹{" "}
                                                  {(
                                                    parseFloat(quoteRecord.price) *
                                                    parseFloat(ind.qty)
                                                  ).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                              Awaiting Price
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Vendor Remarks */}
                                      {quoteRecord?.remarks && (
                                        <div className="mt-2.5 pt-2 border-t border-emerald-100 text-xs text-slate-700">
                                          <strong className="text-slate-800">Remarks: </strong>
                                          <span>{quoteRecord.remarks}</span>
                                        </div>
                                      )}

                                      {/* Vendor Uploaded Documents */}
                                      {docRecords.length > 0 && (
                                        <div className="mt-2.5 pt-2 border-t border-emerald-100">
                                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                                            Uploaded Documents ({docRecords.length}):
                                          </span>
                                          <div className="flex flex-wrap gap-2">
                                            {docRecords.map((doc, dIdx) => {
                                              const fileUrl = getImageUrlPath(
                                                doc.filePath || doc.fileName
                                              );
                                              return (
                                                <a
                                                  key={doc.id || dIdx}
                                                  href={fileUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-xs font-semibold text-blue-700 shadow-sm transition-colors"
                                                >
                                                  <svg
                                                    className="w-3.5 h-3.5 text-blue-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                    />
                                                  </svg>
                                                  <span className="truncate max-w-[200px]">
                                                    {doc.fileName || "Document.pdf"}
                                                  </span>
                                                  {doc.remarks && (
                                                    <span className="text-[10px] text-slate-400">
                                                      ({doc.remarks})
                                                    </span>
                                                  )}
                                                </a>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 1: LOTS & INDENTS */}
          {activeTab === "lots" && (
            <div className="space-y-4">
              {bid.BiddingLots?.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  No lots configured for this bid.
                </div>
              ) : (
                bid.BiddingLots?.map((lot, idx) => (
                  <div
                    key={lot.id || idx}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
                  >
                    <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs bg-slate-800 text-white px-2 py-0.5 rounded">
                          Lot {lot.lotNumber || idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 text-sm">
                          {lot.name || `Lot ${idx + 1}`}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {lot.BiddingIndent?.length || 0} Indents
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {lot.BiddingIndent?.map((ind, indIdx) => {
                        const custom = ind.customData || {};
                        const commonDocs = custom.commonDocuments || [];
                        const vendorDocs = custom.vendorDocuments || [];
                        const totalDocs =
                          commonDocs.length +
                          vendorDocs.reduce(
                            (acc, vd) => acc + (vd.documents?.length || 0),
                            0
                          );

                        // Responses summary
                        const vendors = ind.BiddingIndentvendors || [];
                        const quotedVendors = vendors.filter(
                          (v) =>
                            v.status === "QUOTED" ||
                            v.indentVendorsUpload?.some((u) => u.price !== null)
                        );

                        return (
                          <div
                            key={ind.id || indIdx}
                            className="p-4 hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                    {custom.docId || ind.indentId
                                      ? `IND-${custom.docId || ind.indentId}`
                                      : `#${indIdx + 1}`}
                                  </span>
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    {custom.item_name ||
                                      ind.Item?.name ||
                                      "Unspecified Item"}
                                  </h4>
                                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                    {ind.indentType ||
                                      custom.category ||
                                      "General"}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                  <span>
                                    Dept:{" "}
                                    <strong className="text-slate-700">
                                      {custom.department || "N/A"}
                                    </strong>
                                  </span>
                                  <span>
                                    Required By:{" "}
                                    <strong className="text-slate-700">
                                      {custom.requiredBy || "ASAP"}
                                    </strong>
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-base font-bold text-slate-900">
                                  {ind.qty || "0"} {ind.Uom?.name || "Units"}
                                </span>
                              </div>
                            </div>

                            {/* Specifications Row */}
                            {custom.specs &&
                              Object.values(custom.specs).some(Boolean) && (
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                                  {Object.entries(custom.specs).map(
                                    ([key, val]) => {
                                      if (!val) return null;
                                      return (
                                        <span
                                          key={key}
                                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px]"
                                        >
                                          <strong className="capitalize">
                                            {key}:
                                          </strong>{" "}
                                          {val}
                                        </span>
                                      );
                                    }
                                  )}
                                </div>
                              )}

                            {/* Vendor Responses Quick Strip */}
                            <div className="mt-2.5 flex items-center justify-between text-xs">
                              {quotedVendors.length > 0 ? (
                                <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span>
                                    {quotedVendors.length} of {vendors.length} vendor(s) quoted
                                  </span>
                                  <button
                                    onClick={() => setActiveTab("quotes")}
                                    className="text-blue-600 hover:underline font-normal text-xs ml-2"
                                  >
                                    View Prices →
                                  </button>
                                </div>
                              ) : (
                                <div className="text-slate-400 text-xs">
                                  {vendors.length} vendor(s) invited • Awaiting quotes
                                </div>
                              )}

                              {totalDocs > 0 && (
                                <span className="text-slate-500 text-[11px]">
                                  {totalDocs} buyer doc(s)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: VENDORS */}
          {activeTab === "vendors" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-800">
                  Invited Vendors Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Overview of all vendors participating across the indents in this bid with their quoted rates and documents.
                </p>
              </div>

              {vendorsList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No vendors invited yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {vendorsList.map((vendor, idx) => {
                    const isQuoted = vendor.status === "QUOTED" || vendor.quotesCount > 0;

                    return (
                      <div
                        key={vendor.id || idx}
                        className="p-4 hover:bg-slate-50 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ${
                                isQuoted
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {vendor.name?.charAt(0)?.toUpperCase() || "V"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">
                                {vendor.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                Allocated to {vendor.indentCount} indent item(s) •{" "}
                                <span
                                  className={
                                    isQuoted
                                      ? "text-emerald-700 font-semibold"
                                      : "text-amber-700"
                                  }
                                >
                                  {vendor.quotesCount} quoted
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                isQuoted
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {isQuoted ? "QUOTED" : "INVITED"}
                            </span>
                          </div>
                        </div>

                        {/* Quoted Items Preview */}
                        {vendor.quotes.length > 0 && (
                          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                              Submitted Quotes:
                            </span>
                            <div className="space-y-1">
                              {vendor.quotes.map((q, qIdx) => (
                                <div
                                  key={qIdx}
                                  className="flex items-center justify-between text-slate-700"
                                >
                                  <span>
                                    {q.itemName} ({q.qty} {q.uom})
                                  </span>
                                  <span className="font-bold text-emerald-700">
                                    ₹ {parseFloat(q.price).toFixed(2)} / {q.uom}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Uploaded Documents */}
                        {vendor.documents.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            <span className="text-[11px] text-slate-500 font-medium">
                              Files:
                            </span>
                            {vendor.documents.map((d, dIdx) => (
                              <a
                                key={d.id || dIdx}
                                href={getImageUrlPath(d.filePath || d.fileName)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-blue-400 text-blue-600 text-[11px] font-semibold"
                              >
                                <span>📄 {d.fileName || "File"}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TERMS & DEADLINES */}
          {activeTab === "terms" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Timeline & Milestones
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs text-slate-500 block">
                      Bid Creation Date
                    </label>
                    <span className="font-semibold text-slate-800">
                      {formatDate(bid.bidDate || bid.createdAt)}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block">
                      Query / Clarification Deadline
                    </label>
                    <span className="font-semibold text-amber-700">
                      {formatDate(bid.queryDeadline)}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block">
                      Submission Deadline
                    </label>
                    <span className="font-semibold text-blue-700">
                      {formatDate(bid.submissionDeadline || bid.closingDate)}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block">
                      Terms Template Used
                    </label>
                    <span className="font-semibold text-slate-800">
                      {bid.termsTemplate || "Standard Yarn Terms"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Policy, Delivery & Payment Terms
                </h3>

                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-56 overflow-y-auto">
                  {bid.description ||
                    "No specific policy terms defined for this bid."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
