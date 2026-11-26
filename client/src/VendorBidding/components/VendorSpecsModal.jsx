import React from "react";
import { getImageUrlPath } from "../../Constants";

export default function VendorSpecsModal({ isOpen, onClose, item, onOpenQuote }) {
  if (!isOpen || !item) return null;

  const {
    itemName,
    category,
    qty,
    uom,
    specs = {},
    deadlines = {},
    terms,
    buyerDocuments = [],
  } = item;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
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

  const specEntries = Object.entries(specs).filter(
    ([, val]) => val !== null && val !== undefined && val !== ""
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold text-lg">
              ℹ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {itemName || "Material Item"}
                </h3>
                {category && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical Specifications & Buyer Requirements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Quantity & Deadline Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Required Quantity
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {qty} <span className="text-sm font-semibold text-slate-600">{uom || "Units"}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
                Submission Deadline
              </span>
              <div className="text-sm font-bold text-amber-900 mt-1.5 flex items-center space-x-1.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDate(deadlines.submission)}</span>
              </div>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center space-x-1.5">
              <span>Technical Specifications</span>
              <span className="text-slate-400 font-normal">({specEntries.length})</span>
            </h4>
            {specEntries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specEntries.map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5 block truncate">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                Standard industry specifications apply for this item.
              </p>
            )}
          </div>

          {/* Buyer Instructions / Terms */}
          {terms && (
            <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1 flex items-center space-x-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Buyer Instructions / Terms</span>
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed mt-1">
                {terms}
              </p>
            </div>
          )}

          {/* Buyer Attached Documents (TDS / Drawings) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center space-x-1.5">
              <span>Technical Data Sheets & Drawings (TDS)</span>
              <span className="text-slate-400 font-normal">({buyerDocuments.length})</span>
            </h4>
            {buyerDocuments.length > 0 ? (
              <div className="space-y-2">
                {buyerDocuments.map((doc, idx) => {
                  const docUrl = getImageUrlPath(doc.filePath || doc.fileName);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          PDF
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {doc.fileName || "Buyer_Document.pdf"}
                          </p>
                          <p className="text-[10px] text-slate-400">Attached by Buyer</p>
                        </div>
                      </div>
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center space-x-1 flex-shrink-0 shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs font-medium text-slate-500">
                  No technical documents or drawings attached for this item
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
          {onOpenQuote && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQuote(item);
              }}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{item.quotedPrice ? "Update Price Quote" : "Quote Price"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
