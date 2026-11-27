import React, { useState } from "react";
import Swal from "sweetalert2";
import { getImageUrlPath } from "../../Constants";
import { useUploadVendorDocumentMutation } from "../../redux/uniformService/BiddingService";

export default function VendorQuotationForm({ item, onBack, onSaved }) {
  const [uploadDoc, { isLoading: isUploadingDoc }] = useUploadVendorDocumentMutation();

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

  // Existing uploaded files from IndentVendorsUpload
  const existingFiles = (vendorUploads || []).filter((u) => u.filePath || u.fileName);

  // New rows added by vendor: each item is { id, file, name, size, remarks }
  const [newRows, setNewRows] = useState([]);

  const specEntries = Object.entries(specs).filter(
    ([, val]) => val !== null && val !== undefined && val !== "",
  );

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Add a new empty row
  const handleAddNewRow = () => {
    const newRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      file: null,
      name: "",
      size: 0,
      remarks: "",
    };
    setNewRows((prev) => [...prev, newRow]);
  };

  // Multi-file selector adds rows for each selected file
  const handleMultipleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const rowsFromFiles = files.map((file, index) => ({
      id: `row-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
      file,
      name: file.name,
      size: file.size,
      remarks: "",
    }));

    setNewRows((prev) => [...prev, ...rowsFromFiles]);
    e.target.value = ""; // Reset file input
  };

  // File chosen for a specific new row
  const handleFileChangeForRow = (rowId, file) => {
    if (!file) return;
    setNewRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              file,
              name: file.name,
              size: file.size,
            }
          : r,
      ),
    );
  };

  // Remarks changed for a new row
  const handleRemarksChangeForRow = (rowId, remarks) => {
    setNewRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, remarks } : r)),
    );
  };

  // Delete a new row
  const handleDeleteNewRow = (rowId) => {
    setNewRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  // Save new attachments
  const handleSave = async (e) => {
    e?.preventDefault();

    // Find new rows with a valid file
    const validRows = newRows.filter((r) => r.file !== null);

    if (validRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Attachments to Save",
        text: "Please add at least one attachment file before clicking Save.",
        confirmButtonColor: "#059669",
      });
      return;
    }

    try {
      const formData = new FormData();
      const remarksList = [];

      validRows.forEach((row) => {
        formData.append("files", row.file);
        remarksList.push(row.remarks?.trim() || "");
      });

      formData.append("remarks", JSON.stringify(remarksList));

      const res = await uploadDoc({
        biddingIndentId,
        formData,
      }).unwrap();

      const createdCount = res?.data?.length || validRows.length;

      Swal.fire({
        icon: "success",
        title: "Saved Successfully",
        text: `${createdCount} attachment(s) have been saved to your allocated bid.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setNewRows([]);

      if (onSaved) {
        onSaved();
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      console.error("Save attachments error:", err);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err?.data?.message || err?.message || "Could not save attachments. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const totalAttachmentsCount = existingFiles.length + newRows.length;
  const unsavedValidCount = newRows.filter((r) => r.file !== null).length;

  const maxExistingVersion = existingFiles.reduce(
    (max, f) => Math.max(max, f.quoteVersion || 1),
    0
  );
  const nextVersion = maxExistingVersion > 0 ? maxExistingVersion + 1 : 1;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-auto w-full">
      {/* Top Header / Action Bar - Compact & Full Width */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6 sm:py-3 flex-shrink-0 sticky top-0 z-10 shadow-xs w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 w-full">
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              onClick={onBack}
              disabled={isUploadingDoc}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors flex-shrink-0"
              title="Back to list"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[11px] px-2 py-0.5 bg-blue-50 border border-blue-200 rounded font-bold text-blue-800">
                  {bidNo || `BID-${item?.bidId || item?.biddingIndentId}`}
                </span>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  Upload Attachments: {itemName}
                </h1>
                {category && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600">
                    {category}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {bidName ? `${bidName} • ` : ""}Attach quotation and quality documents for this allocated item.
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={onBack}
              disabled={isUploadingDoc}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUploadingDoc || unsavedValidCount === 0}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {isUploadingDoc ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    Save Attachments {unsavedValidCount > 0 ? `(${unsavedValidCount})` : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Compact Spacing */}
      <div className="p-3 sm:p-4 w-full space-y-3">
        {/* Top Section: Material Specifications & Requirements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full">
          <div className="px-3.5 py-2 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                ℹ
              </span>
              <h3 className="text-xs font-bold text-slate-800">
                Material Specifications & Requirements
              </h3>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
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

          <div className="p-3 sm:p-3.5 space-y-2.5">
            {/* Unified Single Row for Quantity, Tender Info, Allocated Item & Technical Parameters */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 p-2.5 px-3.5 rounded-lg bg-slate-50/70 border border-slate-100">
              {/* Requested Quantity */}
              <div className="flex-shrink-0">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Requested Quantity
                </span>
                <span className="text-base sm:text-lg font-extrabold text-slate-900 block leading-tight">
                  {qty}{" "}
                  <span className="text-xs font-semibold text-slate-600">
                    {uom || "Units"}
                  </span>
                </span>
              </div>

              <div className="h-7 w-px bg-slate-200 hidden sm:block flex-shrink-0" />

              {/* Item Category */}
              <div className="flex-shrink-0">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Item Category
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate leading-tight mt-0.5">
                  {category || "General"}
                </span>
              </div>

              <div className="h-7 w-px bg-slate-200 hidden sm:block flex-shrink-0" />

              {/* Tender Reference */}
              <div className="flex-shrink-0">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Tender Reference
                </span>
                <span className="text-xs sm:text-sm font-bold text-blue-700 block font-mono truncate leading-tight mt-0.5">
                  {bidNo || "BID"}
                </span>
              </div>

              <div className="h-7 w-px bg-slate-200 hidden sm:block flex-shrink-0" />

              {/* Allocated Item */}
              <div className="flex-shrink-0 max-w-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Allocated Item
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate leading-tight mt-0.5" title={itemName}>
                  {itemName}
                </span>
              </div>

              {/* Technical Parameters (Count, Blend, Shade, etc.) in the SAME row */}
              {specEntries.map(([key, val]) => (
                <React.Fragment key={key}>
                  <div className="h-7 w-px bg-slate-200 hidden sm:block flex-shrink-0" />
                  <div className="flex-shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate leading-tight mt-0.5" title={String(val)}>
                      {String(val)}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Buyer Terms / Instructions */}
            {terms && (
              <div className="px-3 py-2 rounded-lg bg-blue-50/40 border border-blue-100 text-xs">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] block mb-0.5">
                  Buyer Instructions & Terms:
                </span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px]">{terms}</p>
              </div>
            )}

            {/* Buyer TDS Documents */}
            {buyerDocuments.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Buyer Technical Drawings & TDS ({buyerDocuments.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {buyerDocuments.map((doc, idx) => (
                    <a
                      key={idx}
                      href={getImageUrlPath(doc.filePath || doc.fileName)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-[11px] font-semibold text-blue-600 shadow-xs transition-colors"
                    >
                      <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="max-w-[200px] truncate">{doc.fileName || "Buyer_Doc.pdf"}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Unified Attachments Table (Full Width & Responsive) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full">
          <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                📁
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                  Upload Attachments
                </h3>
                <p className="text-[10px] text-slate-500">
                  All documents uploaded for this indent item (Total: {totalAttachmentsCount})
                </p>
              </div>
            </div>

            {/* Action Buttons: Add Row & Choose Multiple Files */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleAddNewRow}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Row</span>
              </button>

              <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Choose Files (Multiple)</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                  onChange={handleMultipleFilesSelected}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Unified Attachments Table */}
          <div className="p-3 sm:p-3.5">
            {totalAttachmentsCount === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 text-lg">
                  📎
                </div>
                <h5 className="text-xs font-bold text-slate-700">No Attachments Added Yet</h5>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-md mx-auto">
                  Click <strong>"Add Row"</strong> to add an attachment row, or click <strong>"Choose Files (Multiple)"</strong> to select and attach multiple files at once.
                </p>
                <div className="mt-3 flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddNewRow}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <span>+ Add New Row</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-xs">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-2.5 py-2 w-10 text-center">
                        #
                      </th>
                      <th scope="col" className="px-2.5 py-2 w-16 text-center">
                        Version
                      </th>
                      <th scope="col" className="px-3 py-2 w-2/5">
                        Attachment / File
                      </th>
                      <th scope="col" className="px-3 py-2 w-2/5">
                        Remarks / Document Description
                      </th>
                      <th scope="col" className="px-3 py-2 w-32 text-center">
                        Status / Date
                      </th>
                      <th scope="col" className="px-2.5 py-2 w-16 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs bg-white">
                    {/* 1. Previously Uploaded Files */}
                    {existingFiles.map((doc, idx) => (
                      <tr key={`existing-${doc.id || idx}`} className="hover:bg-slate-50/70 transition-colors bg-slate-50/30">
                        <td className="px-2.5 py-2 text-center text-slate-400 font-semibold text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="px-2.5 py-2 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            v{doc.quoteVersion || 1}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[9px] flex-shrink-0 uppercase">
                              {(doc.fileName || "DOC").split(".").pop()}
                            </div>
                            <div className="truncate max-w-sm sm:max-w-md">
                              <p className="font-semibold text-slate-800 truncate text-xs" title={doc.fileName}>
                                {doc.fileName || "Uploaded_Document"}
                              </p>
                              <a
                                href={getImageUrlPath(doc.filePath || doc.fileName)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 hover:underline font-medium inline-flex items-center space-x-0.5"
                              >
                                <span>View / Download</span>
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-slate-600 text-xs">{doc.remarks || "—"}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Uploaded
                          </span>
                          {doc.date && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(doc.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </td>
                        <td className="px-2.5 py-2 text-center">
                          <a
                            href={getImageUrlPath(doc.filePath || doc.fileName)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded inline-flex items-center transition-colors"
                            title="Download attachment"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                    ))}

                    {/* 2. New / Staged Rows */}
                    {newRows.map((row, idx) => {
                      const rowNumber = existingFiles.length + idx + 1;
                      const hasFile = row.file !== null;

                      return (
                        <tr key={row.id} className="hover:bg-blue-50/40 transition-colors bg-white">
                          <td className="px-2.5 py-2 text-center text-slate-500 font-bold text-[11px]">
                            {rowNumber}
                          </td>
                          <td className="px-2.5 py-2 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              v{nextVersion}
                            </span>
                          </td>

                          {/* File Selection Cell */}
                          <td className="px-3 py-2">
                            {hasFile ? (
                              <div className="flex items-center justify-between space-x-2 bg-blue-50/60 p-1.5 px-2 rounded-lg border border-blue-200">
                                <div className="flex items-center space-x-1.5 truncate">
                                  <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] flex-shrink-0 uppercase">
                                    {(row.name || "DOC").split(".").pop()}
                                  </div>
                                  <div className="truncate">
                                    <p className="font-semibold text-slate-800 text-xs truncate max-w-[200px]" title={row.name}>
                                      {row.name}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-medium">
                                      {formatFileSize(row.size)}
                                    </p>
                                  </div>
                                </div>
                                <label className="cursor-pointer text-[10px] text-blue-700 hover:text-blue-900 font-semibold px-1.5 py-0.5 rounded hover:bg-blue-100 flex-shrink-0">
                                  Change
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                                    onChange={(e) => handleFileChangeForRow(row.id, e.target.files[0])}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="cursor-pointer flex items-center justify-center space-x-1.5 py-1 px-2.5 rounded-lg border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 text-slate-600 transition-colors">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs font-semibold text-blue-600">Select File</span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                                  onChange={(e) => handleFileChangeForRow(row.id, e.target.files[0])}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </td>

                          {/* Remarks Input Cell */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              placeholder="Enter remarks (e.g. Quality Test Certificate / Quote Sheet)"
                              value={row.remarks}
                              onChange={(e) => handleRemarksChangeForRow(row.id, e.target.value)}
                              className="w-full px-2.5 py-1 text-xs text-slate-800 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>

                          {/* Status Cell */}
                          <td className="px-3 py-2 text-center">
                            {hasFile ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                ● Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-slate-100 text-slate-500">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Action Cell: Delete Row Button */}
                          <td className="px-2.5 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteNewRow(row.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete row"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="mt-3 pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAddNewRow}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Row</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isUploadingDoc}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Back to List
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUploadingDoc || unsavedValidCount === 0}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {isUploadingDoc ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>
                        Save {unsavedValidCount > 0 ? `(${unsavedValidCount})` : ""}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
