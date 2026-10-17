import React, { useState, useMemo } from 'react';

export default function VendorDocumentsTab({ bidData, setBidData, onRequestChatRevision }) {
  const lots = bidData.lots || [];

  // Extract all unique vendors across lots/indents
  const uniqueVendors = useMemo(() => {
    const map = new Map();
    lots.forEach(lot => {
      (lot.indents || []).forEach(indent => {
        (indent.vendors || []).forEach(v => {
          const vKey = String(v.id || v.vendorId || v.name);
          if (!map.has(vKey)) {
            map.set(vKey, {
              id: v.id || v.vendorId || vKey,
              name: v.name || v.label || `Vendor ${vKey}`,
              documents: v.documents || []
            });
          }
        });
      });
    });
    return Array.from(map.values());
  }, [lots]);

  // Selected target: 'common' or vendorId
  const [selectedTargetId, setSelectedTargetId] = useState('common');
  const [docFilterStatus, setDocFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Upload/Edit Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'TDS',
    fileName: '',
    fileSize: '1.2 MB',
    version: '1.0',
    status: 'Up to Date',
    notes: ''
  });

  // Collect documents for the selected target
  const currentDocs = useMemo(() => {
    if (selectedTargetId === 'common') {
      // Gather common docs across indents
      const commonDocsMap = new Map();
      lots.forEach(lot => {
        (lot.indents || []).forEach(indent => {
          (indent.commonDocuments || []).forEach(doc => {
            commonDocsMap.set(doc.id || doc.title, {
              ...doc,
              indentDocId: indent.docId || `IND-${indent.id}`,
              itemName: indent.item_name || 'Item'
            });
          });
        });
      });

      // Default common docs if none added yet
      if (commonDocsMap.size === 0) {
        return [
          {
            id: 'c-doc-1',
            title: 'Technical Bid Specification Guidelines',
            category: 'Specification',
            fileName: 'Technical_Spec_Guidelines_v1.0.pdf',
            fileSize: '2.4 MB',
            version: '1.0',
            status: 'Up to Date',
            uploadDate: '2026-10-15',
            notes: 'Standard technical terms and delivery guidelines'
          },
          {
            id: 'c-doc-2',
            title: 'General Commercial Terms & Conditions',
            category: 'Compliance',
            fileName: 'General_Commercial_Terms_v1.0.pdf',
            fileSize: '1.1 MB',
            version: '1.0',
            status: 'Up to Date',
            uploadDate: '2026-10-15',
            notes: 'Payment terms: 45 days, Quality penalty clauses'
          }
        ];
      }
      return Array.from(commonDocsMap.values());
    } else {
      // Find docs for selected vendor
      const vendor = uniqueVendors.find(v => String(v.id) === String(selectedTargetId));
      return vendor?.documents || [
        {
          id: `vd-${selectedTargetId}-1`,
          title: 'Mill Quality Test Certificate',
          category: 'Test Certificate',
          fileName: `${(vendor?.name || 'vendor').replace(/\s+/g, '_')}_TestCert_v1.0.pdf`,
          fileSize: '1.8 MB',
          version: '1.0',
          status: 'Up to Date',
          uploadDate: '2026-10-14',
          notes: 'Lot test compliance certificate'
        },
        {
          id: `vd-${selectedTargetId}-2`,
          title: 'OEKO-TEX / ISO Standard Compliance',
          category: 'Compliance',
          fileName: 'ISO_Compliance_Certificate.pdf',
          fileSize: '850 KB',
          version: '1.0',
          status: 'Update Needed',
          uploadDate: '2026-09-10',
          notes: 'Expired on 2026-09-30. Revised certificate required.'
        }
      ];
    }
  }, [selectedTargetId, lots, uniqueVendors]);

  // Filtered documents
  const filteredDocs = currentDocs.filter(d => {
    const matchesSearch = d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (docFilterStatus === 'ALL') return true;
    return d.status === docFilterStatus;
  });

  const activeTargetVendor = uniqueVendors.find(v => String(v.id) === String(selectedTargetId));

  // Save new or updated document
  const handleSaveDoc = () => {
    if (!formData.title.trim()) return;

    const docPayload = {
      id: editingDocId || `doc-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      fileName: formData.fileName || `${formData.title.replace(/\s+/g, '_')}_v${formData.version}.pdf`,
      fileSize: formData.fileSize || '1.2 MB',
      version: formData.version || '1.0',
      status: formData.status || 'Up to Date',
      uploadDate: new Date().toISOString().slice(0, 10),
      notes: formData.notes || ''
    };

    setBidData(prev => ({
      ...prev,
      lots: (prev.lots || []).map(lot => ({
        ...lot,
        indents: (lot.indents || []).map(ind => {
          if (selectedTargetId === 'common') {
            const existing = ind.commonDocuments || [];
            const updated = editingDocId
              ? existing.map(d => d.id === editingDocId ? docPayload : d)
              : [...existing, docPayload];
            return { ...ind, commonDocuments: updated };
          } else {
            return {
              ...ind,
              vendors: (ind.vendors || []).map(v => {
                if (String(v.id || v.vendorId) === String(selectedTargetId)) {
                  const existing = v.documents || [];
                  const updated = editingDocId
                    ? existing.map(d => d.id === editingDocId ? docPayload : d)
                    : [...existing, docPayload];
                  return { ...v, documents: updated };
                }
                return v;
              })
            };
          }
        })
      }))
    }));

    setIsUploadModalOpen(false);
  };

  const handleStartReplace = (doc) => {
    const verNum = parseFloat(doc.version) || 1.0;
    const bumpedVer = (verNum + 0.1).toFixed(1);

    setFormData({
      title: doc.title,
      category: doc.category || 'TDS',
      fileName: `${doc.title.replace(/\s+/g, '_')}_v${bumpedVer}.pdf`,
      fileSize: doc.fileSize || '1.2 MB',
      version: bumpedVer,
      status: 'Up to Date',
      notes: `Updated revision replacing v${doc.version}`
    });
    setEditingDocId(doc.id);
    setIsUploadModalOpen(true);
  };

  const handleDeleteDoc = (docId) => {
    setBidData(prev => ({
      ...prev,
      lots: (prev.lots || []).map(lot => ({
        ...lot,
        indents: (lot.indents || []).map(ind => {
          if (selectedTargetId === 'common') {
            return {
              ...ind,
              commonDocuments: (ind.commonDocuments || []).filter(d => d.id !== docId)
            };
          } else {
            return {
              ...ind,
              vendors: (ind.vendors || []).map(v => {
                if (String(v.id || v.vendorId) === String(selectedTargetId)) {
                  return {
                    ...v,
                    documents: (v.documents || []).filter(d => d.id !== docId)
                  };
                }
                return v;
              })
            };
          }
        })
      }))
    }));
  };

  const handleRequestRevisionClick = (doc) => {
    if (onRequestChatRevision) {
      const vName = activeTargetVendor?.name || 'Vendor';
      const promptText = `Hi ${vName}, please share the updated revision for document "${doc.title}" (Current version: v${doc.version}).`;
      onRequestChatRevision({
        vendorId: selectedTargetId !== 'common' ? selectedTargetId : uniqueVendors[0]?.id,
        text: promptText
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 2-Column Split: Target Selector (Left) & Document Hub (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Side: Target Selector */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Select Document Scope</h4>
            <p className="text-[11px] text-slate-500">Pick common specs or a specific vendor</p>
          </div>

          <div className="p-2 space-y-1 max-h-[500px] overflow-y-auto">
            {/* Common Specs Option */}
            <button
              type="button"
              onClick={() => setSelectedTargetId('common')}
              className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                selectedTargetId === 'common'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <div>
                  <p>All Vendors (Common Specs)</p>
                  <p className={`text-[10px] font-normal ${selectedTargetId === 'common' ? 'text-blue-100' : 'text-slate-400'}`}>
                    General bid documents, T&C
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                selectedTargetId === 'common' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                Shared
              </span>
            </button>

            <div className="pt-2 pb-1 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Invited Vendors ({uniqueVendors.length})
            </div>

            {uniqueVendors.length === 0 ? (
              <p className="text-[11px] text-slate-400 p-2 italic">No vendors invited yet.</p>
            ) : (
              uniqueVendors.map(vendor => {
                const isSelected = String(selectedTargetId) === String(vendor.id);
                return (
                  <button
                    key={vendor.id}
                    type="button"
                    onClick={() => setSelectedTargetId(vendor.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {vendor.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate max-w-[150px]">
                        <p className="truncate">{vendor.name}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {vendor.documents?.length || 2} documents
                        </p>
                      </div>
                    </div>

                    {vendor.documents?.some(d => d.status === 'Update Needed') && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Document needs update" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Document Table & Actions */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {selectedTargetId === 'common'
                    ? 'Common Bid Documents & Guidelines'
                    : `Documents for: ${activeTargetVendor?.name || 'Vendor'}`}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {filteredDocs.length} files
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedTargetId === 'common'
                  ? 'These files will be accessible by every vendor invited to this bid.'
                  : 'Vendor-specific certifications, technical data sheets, and compliance documents.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingDocId(null);
                setFormData({
                  title: '',
                  category: 'TDS',
                  fileName: '',
                  fileSize: '1.2 MB',
                  version: '1.0',
                  status: 'Up to Date',
                  notes: ''
                });
                setIsUploadModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>+ Upload Document</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search document title or category..."
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Status:</span>
              {['ALL', 'Up to Date', 'Update Needed'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setDocFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    docFilterStatus === st
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Document Cards / Table */}
          <div className="p-4">
            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                No documents found for this selection. Click "+ Upload Document" to add one.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocs.map((doc) => {
                  const isUpdateNeeded = doc.status === 'Update Needed';

                  return (
                    <div
                      key={doc.id}
                      className="border border-slate-200 rounded-xl p-3.5 bg-white hover:border-slate-300 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {/* File Icon */}
                        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-xs shrink-0">
                          PDF
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {doc.title}
                            </h5>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              v{doc.version || '1.0'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              {doc.category || 'General'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isUpdateNeeded
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}>
                              {doc.status || 'Up to Date'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500">
                            {doc.fileName || 'document.pdf'} • {doc.fileSize || '1.2 MB'} • Uploaded: {doc.uploadDate || '2026-10-15'}
                          </p>

                          {doc.notes && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="font-semibold text-slate-700">Notes:</span> {doc.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {isUpdateNeeded && selectedTargetId !== 'common' && (
                          <button
                            type="button"
                            onClick={() => handleRequestRevisionClick(doc)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Request updated revision in Chat"
                          >
                            <svg className="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Request via Chat</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartReplace(doc)}
                          className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                          title="Upload new version"
                        >
                          Bump v+
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete document"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload / Edit Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {editingDocId ? 'Upload New Revision / Version' : 'Upload New Document'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Yarn Strength Test Report"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  >
                    <option value="TDS">TDS / Tech Sheet</option>
                    <option value="Test Certificate">Test Certificate</option>
                    <option value="Compliance">Compliance / ISO</option>
                    <option value="NDA">Signed NDA</option>
                    <option value="Quotation">Quotation Format</option>
                    <option value="Specification">Specification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                >
                  <option value="Up to Date">Up to Date</option>
                  <option value="Update Needed">Update Needed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attach File</label>
                <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 text-center hover:bg-slate-100 cursor-pointer transition-colors">
                  <p className="text-slate-600 font-medium">Click to select PDF or image file</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maximum file size: 25 MB</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional context or requirements..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDoc}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📄</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">{previewDoc.title}</h4>
                  <p className="text-[11px] text-slate-300">Version {previewDoc.version} • {previewDoc.category}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 text-center space-y-3 bg-slate-50">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 border border-red-200 flex items-center justify-center font-bold text-lg mx-auto shadow-sm">
                PDF
              </div>
              <p className="font-semibold text-slate-800 text-sm">{previewDoc.fileName}</p>
              <p className="text-xs text-slate-500">File size: {previewDoc.fileSize} • Uploaded on {previewDoc.uploadDate}</p>

              {previewDoc.notes && (
                <div className="text-left bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Notes:</span> {previewDoc.notes}
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
