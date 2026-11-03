import React, { useState } from 'react';

export default function IndentDocumentsView({
  indent,
  activeVendor,
  isCommonSelected,
  activeDocuments = [],
  commonDocs = [],
  onUpdateDocuments,
  onRequestDocUpdate,
}) {
  // Upload/Edit Document State
  const [isUploading, setIsUploading] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [docFormData, setDocFormData] = useState({
    title: '',
    category: 'TDS',
    fileName: '',
    fileSize: '1.2 MB',
    version: '1.0',
    status: 'Up to Date',
    notes: '',
  });

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);

  // Open upload form for new document
  const handleStartUpload = () => {
    setDocFormData({
      title: '',
      category: 'TDS',
      fileName: '',
      fileSize: '1.2 MB',
      version: '1.0',
      status: 'Up to Date',
      notes: '',
    });
    setEditingDocId(null);
    setIsUploading(true);
  };

  // Open replace / edit document form
  const handleStartReplace = (doc) => {
    // Auto-bump minor version e.g. "1.0" -> "1.1" or "2.0" -> "2.1"
    const verNum = parseFloat(doc.version) || 1.0;
    const bumpedVer = (verNum + 0.1).toFixed(1);

    setDocFormData({
      title: doc.title,
      category: doc.category || 'TDS',
      fileName: `${doc.title.replace(/\s+/g, '_')}_v${bumpedVer}.pdf`,
      fileSize: doc.fileSize || '1.1 MB',
      version: bumpedVer,
      status: 'Up to Date',
      notes: `Updated revision replacing v${doc.version}`,
    });
    setEditingDocId(doc.id);
    setIsUploading(true);
  };

  // Save document (either add new or update existing)
  const handleSaveDocument = (e) => {
    e.preventDefault();
    if (!docFormData.title.trim()) return;

    const timeStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    let updatedDocsList = [...activeDocuments];

    if (editingDocId) {
      // Update existing document
      updatedDocsList = updatedDocsList.map(doc => {
        if (doc.id === editingDocId) {
          return {
            ...doc,
            ...docFormData,
            updatedAt: timeStr,
            uploadedBy: 'Buyer (Updated)',
          };
        }
        return doc;
      });
    } else {
      // Add new document
      const newDoc = {
        id: `doc-${Date.now()}`,
        ...docFormData,
        fileName: docFormData.fileName || `${docFormData.title.replace(/\s+/g, '_')}_v${docFormData.version}.pdf`,
        updatedAt: timeStr,
        uploadedBy: 'Buyer',
      };
      updatedDocsList = [newDoc, ...updatedDocsList];
    }

    if (onUpdateDocuments) {
      onUpdateDocuments({
        indentId: indent.id,
        vendorId: activeVendor?.id,
        documents: updatedDocsList,
        commonDocuments: isCommonSelected ? updatedDocsList : commonDocs,
      });
    }

    setIsUploading(false);
    setEditingDocId(null);
  };

  // Delete document
  const handleDeleteDocument = (docId) => {
    const updatedDocsList = activeDocuments.filter(d => d.id !== docId);
    if (onUpdateDocuments) {
      onUpdateDocuments({
        indentId: indent.id,
        vendorId: activeVendor?.id,
        documents: updatedDocsList,
        commonDocuments: isCommonSelected ? updatedDocsList : commonDocs,
      });
    }
  };

  // Quick Status change toggle
  const handleStatusChange = (docId, newStatus) => {
    const updatedDocsList = activeDocuments.map(doc =>
      doc.id === docId ? { ...doc, status: newStatus } : doc
    );
    if (onUpdateDocuments) {
      onUpdateDocuments({
        indentId: indent.id,
        vendorId: activeVendor?.id,
        documents: updatedDocsList,
        commonDocuments: isCommonSelected ? updatedDocsList : commonDocs,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Stats & Upload CTA */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>Documents for</span>
            <span className="text-teal-700 font-bold underline decoration-teal-300">
              {isCommonSelected ? 'All Vendors (Common Specs)' : (activeVendor?.name || activeVendor?.label)}
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {activeDocuments.length} document{activeDocuments.length !== 1 ? 's' : ''} uploaded • {
              activeDocuments.filter(d => d.status === 'Up to Date').length
            } up to date
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isUploading) {
              setIsUploading(false);
            } else {
              handleStartUpload();
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isUploading
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isUploading ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            )}
          </svg>
          <span>{isUploading ? 'Cancel' : '+ Upload Document'}</span>
        </button>
      </div>

      {/* Upload / Replace Document Form Accordion */}
      {isUploading && (
        <form onSubmit={handleSaveDocument} className="p-4 bg-white border-2 border-teal-500/40 rounded-xl shadow-md space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{editingDocId ? 'Replace / Update Document Version' : 'Upload New Document'}</span>
            </h5>
            <span className="text-[11px] text-slate-400">PDF, DOCX, XLSX (Max 15MB)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={docFormData.title}
                onChange={e => setDocFormData({ ...docFormData, title: e.target.value })}
                placeholder="e.g. Technical Data Sheet (TDS)"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Document Category
              </label>
              <select
                value={docFormData.category}
                onChange={e => setDocFormData({ ...docFormData, category: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="TDS">Technical Data Sheet (TDS)</option>
                <option value="Compliance">Compliance & Certificate</option>
                <option value="Test Report">Test Report & Lab Dip</option>
                <option value="Quotation">Quotation & Pricing Breakdown</option>
                <option value="Specs">Technical Drawing / Spec</option>
                <option value="Other">Other Document</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Version Tag
              </label>
              <input
                type="text"
                value={docFormData.version}
                onChange={e => setDocFormData({ ...docFormData, version: e.target.value })}
                placeholder="e.g. 2.0"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={docFormData.status}
                onChange={e => setDocFormData({ ...docFormData, status: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Up to Date">Up to Date</option>
                <option value="Under Review">Under Review</option>
                <option value="Update Needed">Update Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                File Attachment
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocFormData({
                        ...docFormData,
                        fileName: file.name,
                        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                      });
                    }
                  }}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Revision Notes / Compliance Remarks
            </label>
            <textarea
              rows={2}
              value={docFormData.notes}
              onChange={e => setDocFormData({ ...docFormData, notes: e.target.value })}
              placeholder="e.g. Count tolerance adjusted to ±1.5% as requested by quality dept."
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{editingDocId ? 'Save Revision' : 'Upload Document'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Documents List */}
      {activeDocuments.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">No documents uploaded yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Upload technical specs, test sheets, compliance certs, or quotation forms for {isCommonSelected ? 'all vendors' : (activeVendor?.name || activeVendor?.label)}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartUpload}
            className="px-3.5 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 shadow-sm transition-colors"
          >
            + Upload First Document
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeDocuments.map(doc => {
            const isUpToDate = doc.status === 'Up to Date';
            const isUpdateNeeded = doc.status === 'Update Needed';
            const isUnderReview = doc.status === 'Under Review';

            return (
              <div
                key={doc.id}
                className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow transition-all space-y-2.5"
              >
                {/* Row 1: Document Title, Category, Version & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1">
                    {/* PDF/Doc icon */}
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 font-mono text-[10px] font-bold">
                      PDF
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-bold text-slate-900 leading-snug">
                          {doc.title}
                        </h5>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-semibold border border-slate-200">
                          v{doc.version || '1.0'}
                        </span>
                        {doc.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {doc.category}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 font-mono">
                        {doc.fileName || 'document.pdf'} • {doc.fileSize || '1.0 MB'}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill with Dropdown toggle */}
                  <div className="relative shrink-0">
                    <select
                      value={doc.status || 'Up to Date'}
                      onChange={e => handleStatusChange(doc.id, e.target.value)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors ${
                        isUpToDate
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isUpdateNeeded
                          ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                          : isUnderReview
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="Up to Date">✓ Up to Date</option>
                      <option value="Update Needed">⚠️ Update Needed</option>
                      <option value="Under Review">⏳ Under Review</option>
                      <option value="Expired">✕ Expired</option>
                    </select>
                  </div>
                </div>

                {/* Notes/Remarks if present */}
                {doc.notes && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{doc.notes}</span>
                  </div>
                )}

                {/* Row 2: Metadata & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-400">
                    Updated {doc.updatedAt} by <span className="font-medium text-slate-600">{doc.uploadedBy}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                      title="Preview Document"
                    >
                      <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View</span>
                    </button>

                    {/* Download Button */}
                    <a
                      href="#download"
                      onClick={e => {
                        e.preventDefault();
                        alert(`Downloading: ${doc.fileName}`);
                      }}
                      className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                      title="Download File"
                    >
                      <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download</span>
                    </a>

                    {/* Replace / Update Revision Button */}
                    <button
                      type="button"
                      onClick={() => handleStartReplace(doc)}
                      className="px-2 py-1 text-[11px] font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors flex items-center gap-1"
                      title="Upload newer version"
                    >
                      <svg className="w-3 h-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Update / Replace</span>
                    </button>

                    {/* Request Revision via Chat CTA */}
                    {!isCommonSelected && onRequestDocUpdate && (
                      <button
                        type="button"
                        onClick={() => onRequestDocUpdate(doc)}
                        className="px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors flex items-center gap-1"
                        title="Ask vendor for update in Chat"
                      >
                        <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Request in Chat</span>
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                      title="Delete document"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Footer info for Documents Tab */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 rounded-xl">
        <span>All documents are securely encrypted and version-tracked per vendor.</span>
        <button
          type="button"
          onClick={handleStartUpload}
          className="text-teal-700 font-bold hover:underline"
        >
          + Add Another
        </button>
      </div>

      {/* Document Preview Lightbox Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Preview Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                  PDF
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{previewDoc.title}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">v{previewDoc.version} • {previewDoc.fileName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Simulated Document Body */}
            <div className="p-6 bg-slate-100/50 space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3 font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Document Metadata & Verification</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    previewDoc.status === 'Up to Date'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {previewDoc.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                    <span className="font-medium">{previewDoc.category || 'TDS'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">FILE SIZE</span>
                    <span className="font-medium">{previewDoc.fileSize || '1.2 MB'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">LAST UPDATED</span>
                    <span className="font-medium">{previewDoc.updatedAt || 'Recently'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">UPLOADED BY</span>
                    <span className="font-medium">{previewDoc.uploadedBy || 'Vendor'}</span>
                  </div>
                </div>

                {previewDoc.notes && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                    <span className="font-bold block text-[10px] text-slate-400 uppercase">Remarks / Notes:</span>
                    {previewDoc.notes}
                  </div>
                )}
              </div>

              <div className="text-center py-4 text-xs text-slate-500">
                📄 Full PDF interactive viewer ready. Connect file storage URL to render PDF pages directly.
              </div>
            </div>

            {/* Preview Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setPreviewDoc(null);
                  handleStartReplace(previewDoc);
                }}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Upload Revision
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Downloading: ${previewDoc.fileName}`)}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
