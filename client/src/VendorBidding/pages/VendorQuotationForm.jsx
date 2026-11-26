import React, { useState } from "react";
import Swal from "sweetalert2";
import { getImageUrlPath } from "../../Constants";
import {
  useSubmitVendorQuoteMutation,
  useUploadVendorDocumentMutation,
} from "../../redux/uniformService/BiddingService";

export default function VendorQuotationForm({ item, onBack, onSaved }) {
  const [submitQuote, { isLoading: isSubmittingQuote }] = useSubmitVendorQuoteMutation();
  const [uploadDoc, { isLoading: isUploadingDoc }] = useUploadVendorDocumentMutation();

  const isSaving = isSubmittingQuote || isUploadingDoc;

  // Form State
  const [price, setPrice] = useState(
    item?.quotedPrice !== null && item?.quotedPrice !== undefined ? String(item.quotedPrice) : ""
  );
  const [remarks, setRemarks] = useState(item?.quoteRemarks || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [docRemarks, setDocRemarks] = useState("");

  const {
    bidNo,
    bidName,
    itemName,
    category,
    qty,
    uom,
    specs = {},
    deadlines = {},
    terms,
    buyerDocuments = [],
    vendorUploads = [],
    biddingIndentId,
  } = item || {};

  const specEntries = Object.entries(specs).filter(
    ([, val]) => val !== null && val !== undefined && val !== ""
  );

  const numQty = parseFloat(qty) || 0;
  const numPrice = parseFloat(price) || 0;
  const totalAmount = numQty * numPrice;

  // Handle Save
  const handleSave = async (e) => {
    e?.preventDefault();

    if (!price || isNaN(numPrice) || numPrice <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Valid Price Required",
        text: "Please enter a valid quoted unit price greater than 0.",
        confirmButtonColor: "#059669",
      });
      return;
    }

    try {
      // 1. Submit price quote
      await submitQuote({
        biddingIndentId,
        body: {
          price: numPrice,
          remarks: remarks.trim(),
        },
      }).unwrap();

      // 2. Upload document if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("files", selectedFile);
        if (docRemarks.trim()) {
          formData.append("remarks", docRemarks.trim());
        }

        await uploadDoc({
          biddingIndentId,
          formData,
        }).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: "Saved Successfully",
        text: "Your quotation and documents have been submitted to the buyer.",
        timer: 1800,
        showConfirmButton: false,
      });

      if (onSaved) {
        onSaved();
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      console.error("Save quote error:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err?.data?.message || err?.message || "Could not save your quote. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-auto">
      {/* Top Breadcrumb / Action Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              disabled={isSaving}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Back to list"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-md font-bold text-blue-800">
                  {bidNo || `BID-${item?.bidId || item?.biddingIndentId}`}
                </span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Quotation Form: {itemName}
                </h1>
                {category && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                    {category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {bidName ? `${bidName} • ` : ""}Review specifications and submit your unit rate & quality documents.
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onBack}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Quotation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Card 1: Material Item & Technical Specifications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                ℹ
              </span>
              <h3 className="text-sm font-bold text-slate-800">
                Material Specifications & Requirements
              </h3>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Deadline:{" "}
              <strong className="text-slate-800">
                {deadlines.submission
                  ? new Date(deadlines.submission).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </strong>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Quantity Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Requested Quantity
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  {qty}{" "}
                  <span className="text-sm font-semibold text-slate-600">
                    {uom || "Units"}
                  </span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Item Category
                </span>
                <span className="text-base font-bold text-slate-800 mt-1 block">
                  {category || "General Material"}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Tender Reference
                </span>
                <span className="text-base font-bold text-blue-700 mt-1 block font-mono">
                  {bidNo || "BID"}
                </span>
              </div>
            </div>

            {/* Specifications Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Technical Parameters
              </h4>
              {specEntries.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {specEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-100"
                    >
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                  Standard specifications apply.
                </p>
              )}
            </div>

            {/* Buyer Terms / Instructions */}
            {terms && (
              <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 text-xs">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px] block mb-1">
                  Buyer Instructions & Terms:
                </span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{terms}</p>
              </div>
            )}

            {/* Buyer TDS Documents */}
            {buyerDocuments.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Buyer Technical Drawings & TDS ({buyerDocuments.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {buyerDocuments.map((doc, idx) => (
                    <a
                      key={idx}
                      href={getImageUrlPath(doc.filePath || doc.fileName)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs font-semibold text-blue-600 shadow-sm transition-colors"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>{doc.fileName || "Buyer_Doc.pdf"}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Vendor Submission Form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                ₹
              </span>
              <h3 className="text-sm font-bold text-emerald-900">
                Your Quotation & Document Submission
              </h3>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
              Price Only • No GST
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Price Quote Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quoted Unit Price (₹ / {uom || "Unit"}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                {numPrice > 0 && numQty > 0 && (
                  <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center space-x-1">
                    <span>Estimated Total:</span>
                    <strong className="text-sm">
                      ₹ {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="text-slate-500 font-normal">
                      ({qty} {uom} × ₹{numPrice})
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Commercial / Delivery Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Immediate dispatch, ex-mill Coimbatore, 30 days payment"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <span>Attach Quotation / Quality Document</span>
                <span className="text-slate-400 font-normal">(PDF, DOC, JPG, PNG)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Select File to Upload
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50"
                  />
                  {selectedFile && (
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">
                      ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Document Remarks / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Formal Quote Letter / Quality Test Certificate"
                    value={docRemarks}
                    onChange={(e) => setDocRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Previously Uploaded Documents */}
              {vendorUploads.filter((u) => u.filePath || u.fileName).length > 0 && (
                <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                    Previously Uploaded Files ({vendorUploads.filter((u) => u.filePath || u.fileName).length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {vendorUploads
                      .filter((u) => u.filePath || u.fileName)
                      .map((u, idx) => (
                        <a
                          key={u.id || idx}
                          href={getImageUrlPath(u.filePath || u.fileName)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="truncate max-w-[200px]">{u.fileName || "Uploaded_Document"}</span>
                          {u.remarks && <span className="text-[10px] text-slate-400">({u.remarks})</span>}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Back to List
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Quote...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Quote & Documents</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
