import React, { useState, useMemo, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { DEMO_COMMUNICATIONS_BID } from '../pages/Communications/BiddingCommunicationsHub';

export default function VendorIndentWorkspace({
  bidData = DEMO_COMMUNICATIONS_BID,
  initialIndentId = null,
  initialTab = 'quote',
  onBackToBids,
}) {
  // Demo Vendor Selector (allows testing different vendors' scoped views)
  const [selectedVendorPersona, setSelectedVendorPersona] = useState(1); // 1: Kovai (2 indents), 2: Annai (1 indent), 17: Classic Dyes (1 indent)

  const vendorPersonas = [
    { id: 1, name: 'Kovai Yarns & Spinners', city: 'Coimbatore', assignedCount: 2 },
    { id: 2, name: 'Annai Spinners Mills', city: 'Dindigul', assignedCount: 1 },
    { id: 17, name: 'Classic Dyes & Chemicals', city: 'Ahmedabad', assignedCount: 1 },
  ];

  const currentVendor = vendorPersonas.find((v) => v.id === selectedVendorPersona) || vendorPersonas[0];

  // Filter ONLY the indents where this vendor is invited
  const assignedIndents = useMemo(() => {
    const list = [];
    (bidData.lots || []).forEach((lot) => {
      (lot.indents || []).forEach((indent) => {
        const isInvited = (indent.vendors || []).some(
          (v) => Number(v.id || v.vendorId) === Number(selectedVendorPersona)
        );

        if (isInvited) {
          const vData = (indent.vendors || []).find(
            (v) => Number(v.id || v.vendorId) === Number(selectedVendorPersona)
          );
          list.push({
            lotId: lot.id,
            lotNumber: lot.lotNumber,
            lotName: lot.name || `Lot ${lot.lotNumber}`,
            indentId: indent.id,
            indentDocId: indent.docId || `IND-${indent.id}`,
            itemName: indent.item_name || 'Item',
            category: indent.category || 'General',
            department: indent.department || 'General',
            qty: indent.qty,
            uom: indent.uom || 'KGS',
            specs: {
              count: indent.count,
              blend: indent.blend,
              shade: indent.shade,
              gsm: indent.gsm,
              width: indent.width,
              ciCas: indent.ciCas,
              strength: indent.strength,
              requiredBy: indent.requiredBy,
            },
            commonDocuments: indent.commonDocuments || [],
            vendorDocuments: vData?.documents || [
              {
                id: `vdoc_${indent.id}`,
                title: 'Technical Data Sheet & Quality Certificate',
                fileName: `${currentVendor.name.split(' ')[0]}_TDS_v1.0.pdf`,
                fileSize: '1.8 MB',
                version: '1.0',
                status: 'Pending Review',
                uploadDate: '2026-10-16 11:30',
              }
            ],
          });
        }
      });
    });
    return list;
  }, [bidData, selectedVendorPersona, currentVendor]);
  console.log(assignedIndents, "assignedIndents")

  // Selected active indent inside workspace
  const [selectedIndentId, setSelectedIndentId] = useState(initialIndentId || assignedIndents[0]?.indentId || 101);

  // Synchronize when initialIndentId or vendor persona changes
  useEffect(() => {
    if (initialIndentId && assignedIndents.some((i) => i.indentId === initialIndentId)) {
      setSelectedIndentId(initialIndentId);
    } else if (assignedIndents.length > 0) {
      setSelectedIndentId(assignedIndents[0].indentId);
    }
  }, [assignedIndents, initialIndentId]);

  const activeIndent = useMemo(() => {
    return assignedIndents.find((i) => i.indentId === selectedIndentId) || assignedIndents[0];
  }, [assignedIndents, selectedIndentId]);

  // Workspace active tab: 'specs' | 'docs' | 'chat' | 'quote'
  const [activeTab, setActiveTab] = useState(initialTab || 'quote');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Vendor Chat messages per indent: { [indentId]: [ { id, sender, senderName, text, timestamp } ] }
  const [chatThreads, setChatThreads] = useState({
    101: [
      { id: 1, sender: 'system', senderName: 'Bid System', text: 'Pre-bid Q&A open for Lot 1 > Indent 1 (30s Combed Cotton). Messages are directly routed to SRG Procurement Team.', timestamp: '10:00 AM' },
      { id: 2, sender: 'vendor', senderName: 'You (Kovai Yarns)', text: 'Good morning Procurement Team. We have reviewed the CSP tolerance. Can we submit our Mill Quality Test Certificate by tomorrow evening?', timestamp: '10:18 AM' },
      { id: 3, sender: 'buyer', senderName: 'SRG Procurement Admin', text: 'Yes Kovai Yarns, that is acceptable. Please ensure the CSP does not fall below 2,850.', timestamp: '10:30 AM' },
      { id: 4, sender: 'buyer', senderName: 'SRG Procurement (Official Broadcast)', text: '📢 NOTICE TO ALL PARTICIPANTS: Staggered delivery in batches of 3,000 kg every 7 days is accepted.', timestamp: '10:45 AM', isBroadcast: true }
    ],
    202: [
      { id: 1, sender: 'system', senderName: 'Bid System', text: 'Pre-bid Q&A open for Lot 2 > Indent 4 (Rib 1x1 Fabric).', timestamp: '11:00 AM' },
      { id: 2, sender: 'vendor', senderName: 'You (Kovai Yarns)', text: 'Hello, what is the maximum shrinkage allowance after 3 washes?', timestamp: '11:15 AM' }
    ]
  });

  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatThreads, selectedIndentId]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'vendor',
      senderName: `You (${currentVendor.name.split(' ')[0]})`,
      text: messageInput.trim(),
      timestamp: timeStr,
    };

    setChatThreads((prev) => ({
      ...prev,
      [activeIndent?.indentId]: [...(prev[activeIndent?.indentId] || []), newMsg],
    }));

    setMessageInput('');
  };

  // Upload Simulation State
  const [uploadedDocs, setUploadedDocs] = useState({});
  const currentIndentDocs = uploadedDocs[activeIndent?.indentId] || activeIndent?.vendorDocuments || [];

  const handleSimulateUpload = () => {
    Swal.fire({
      title: 'Upload Test Certificate / TDS',
      html: `
        <div class="text-left space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Document Title</label>
            <input id="swal-title" class="w-full border p-2 rounded" placeholder="e.g. Lab Quality & CSP Test Certificate" value="Mill Test Certificate v2.0" />
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Select File (PDF)</label>
            <input type="file" id="swal-file" class="w-full text-xs text-slate-500" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload Document',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const title = document.getElementById('swal-title').value;
        if (!title) {
          Swal.showValidationMessage('Please provide a document title');
        }
        return { title };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newDoc = {
          id: `doc_${Date.now()}`,
          title: result.value.title,
          fileName: `${currentVendor.name.split(' ')[0]}_Cert_v2.0.pdf`,
          fileSize: '2.4 MB',
          version: '2.0',
          status: 'Pending Review',
          uploadDate: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setUploadedDocs((prev) => ({
          ...prev,
          [activeIndent.indentId]: [newDoc, ...(prev[activeIndent.indentId] || activeIndent.vendorDocuments)],
        }));

        Swal.fire('Uploaded', 'Your document has been securely submitted to SRG Procurement for compliance review.', 'success');
      }
    });
  };

  // Quotation Submission State
  const [unitRate, setUnitRate] = useState('245.00');
  const [gstRate, setGstRate] = useState('5');
  const [freightRate, setFreightRate] = useState('0.00');
  const [quoteRemarks, setQuoteRemarks] = useState('');
  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState(true);
  const [deliveryScheduleAccepted, setDeliveryScheduleAccepted] = useState(true);

  // Synchronize rate fields when active indent changes
  useEffect(() => {
    if (activeIndent) {
      if (submittedQuotes[activeIndent.indentId]) {
        setUnitRate(submittedQuotes[activeIndent.indentId].rate);
        setGstRate(submittedQuotes[activeIndent.indentId].gstRate || '5');
      } else {
        setUnitRate('');
        setGstRate(activeIndent.category === 'Chemicals' || activeIndent.category === 'Dyes' ? '18' : '5');
        setFreightRate('0.00');
      }
    }
  }, [activeIndent?.indentId]);

  // Uploaded quotation document per indent: { [indentId]: { fileName, fileSize, uploadDate } }
  const [quotationFiles, setQuotationFiles] = useState({
    101: {
      fileName: 'Kovai_Signed_Commercial_Quote_30s_v1.0.pdf',
      fileSize: '1.4 MB',
      uploadDate: '2026-10-16 11:40',
    }
  });

  // Submitted quotation records per indent: { [indentId]: { rate, total, doc, timestamp, isSubmitted } }
  const [submittedQuotes, setSubmittedQuotes] = useState({
    101: {
      rate: '245.00',
      gstRate: '5',
      total: '2940000',
      docName: 'Kovai_Signed_Commercial_Quote_30s_v1.0.pdf',
      timestamp: '2026-10-16 11:45',
      isSubmitted: true,
    }
  });

  const activeQuoteFile = quotationFiles[activeIndent?.indentId];
  const activeSubmittedQuote = submittedQuotes[activeIndent?.indentId];

  const totalBidAmount = useMemo(() => {
    const rate = parseFloat(unitRate) || 0;
    const qty = parseFloat(activeIndent?.qty) || 0;
    const gstPercent = parseFloat(gstRate) || 0;
    const freight = parseFloat(freightRate) || 0;
    const baseTotal = (rate + freight) * qty;
    const gstAmount = (baseTotal * gstPercent) / 100;
    return {
      baseTotal,
      gstAmount,
      grandTotal: baseTotal + gstAmount,
    };
  }, [unitRate, gstRate, freightRate, activeIndent]);

  const handleSimulateQuoteUpload = () => {
    Swal.fire({
      title: 'Attach Signed Quotation Document',
      html: `
        <div class="text-left space-y-3 text-xs">
          <p class="text-slate-500">Attach your official signed quotation on company letterhead (PDF / Excel, Max 10MB).</p>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Quotation Document Title / Reference</label>
            <input id="swal-quote-ref" class="w-full border p-2 rounded text-xs" placeholder="e.g. Quotation Ref #KY-2026-YRN01" value="Kovai_Official_Quotation_${activeIndent?.indentDocId || 'Quote'}.pdf" />
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Select File</label>
            <input type="file" id="swal-quote-file" class="w-full text-xs text-slate-500" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Attach Quotation',
      confirmButtonColor: '#059669',
      preConfirm: () => {
        const val = document.getElementById('swal-quote-ref').value;
        return val || `Official_Quote_${activeIndent?.indentDocId}.pdf`;
      }
    }).then((res) => {
      if (res.isConfirmed) {
        setQuotationFiles((prev) => ({
          ...prev,
          [activeIndent.indentId]: {
            fileName: res.value,
            fileSize: '1.6 MB',
            uploadDate: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        }));
        Swal.fire('Attached', 'Quotation document attached. It will be sealed upon submission.', 'success');
      }
    });
  };

  const handleSubmitQuote = (e) => {
    e.preventDefault();
    if (!unitRate || parseFloat(unitRate) <= 0) {
      Swal.fire('Invalid Rate', 'Please enter a valid price quote per unit.', 'error');
      return;
    }

    if (!activeQuoteFile) {
      Swal.fire({
        title: 'No Quotation Document Attached',
        text: 'Would you like to attach your official signed quotation document before submitting?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Attach Document',
        cancelButtonText: 'Proceed with Rate Only',
      }).then((res) => {
        if (res.isConfirmed) {
          handleSimulateQuoteUpload();
        } else {
          finalizeQuoteSubmission();
        }
      });
      return;
    }

    finalizeQuoteSubmission();
  };

  const finalizeQuoteSubmission = () => {
    Swal.fire({
      icon: 'question',
      title: 'Submit Sealed Quotation?',
      html: `
        <div class="text-left space-y-2 text-xs">
          <p><strong>Item:</strong> ${activeIndent.itemName} (${activeIndent.indentDocId})</p>
          <p><strong>Quoted Unit Rate:</strong> ₹ ${unitRate} / ${activeIndent.uom}</p>
          <p><strong>GST Applicable:</strong> ${gstRate}%</p>
          <p><strong>Total Landed Contract Value:</strong> ₹ ${totalBidAmount.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          <p><strong>Attached Document:</strong> ${activeQuoteFile?.fileName || 'None (Rate only)'}</p>
          <p class="text-slate-500 text-[11px] mt-2">🔒 Your bid is encrypted and sealed. No buyer or competitor can view your price until the official bid opening deadline.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm & Submit Sealed Quote',
      confirmButtonColor: '#059669',
    }).then((res) => {
      if (res.isConfirmed) {
        setSubmittedQuotes((prev) => ({
          ...prev,
          [activeIndent.indentId]: {
            rate: unitRate,
            gstRate,
            total: totalBidAmount.grandTotal,
            docName: activeQuoteFile?.fileName || 'Commercial Quote',
            timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSubmitted: true,
          }
        }));

        Swal.fire({
          icon: 'success',
          title: 'Quotation Submitted Successfully!',
          text: `Sealed quotation of ₹ ${unitRate}/${activeIndent.uom} and attached document recorded for ${activeIndent.indentDocId}.`,
        });
      }
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[640px] overflow-hidden font-sans animate-in fade-in duration-300">

      {/* ─────────────────────────────────────────────────────────────────
          TOP COMMAND BAR: Bid Context, Persona Switcher, Status
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {onBackToBids && (
            <button
              onClick={onBackToBids}
              type="button"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Return to My Bids"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>My Bids</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {bidData.docId || 'SRG/2026/BID/1'}
              </span>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-md">
                {bidData.bidTitle || 'Summer Yarn & Fabric Procurement 2026'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Active Bidding
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Vendor Participation Desk • Showing only items you are invited to bid on ({assignedIndents.length} Assigned Indents)
            </p>
          </div>
        </div>

        {/* Right Persona Switcher & Deadline */}
        <div className="flex items-center gap-3">
          {/* Query Deadline Countdown */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs">
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-amber-800 font-semibold text-[11px]">
              Query Deadline: 12 Nov, 17:00
            </span>
          </div>

          {/* Dev Mode Vendor Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Vendor:</span>
            <select
              value={selectedVendorPersona}
              onChange={(e) => setSelectedVendorPersona(Number(e.target.value))}
              className="bg-transparent font-bold text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              {vendorPersonas.map((vp) => (
                <option key={vp.id} value={vp.id}>
                  {vp.name} ({vp.assignedCount} Indents)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          2-PANE WORKSPACE BODY
         ───────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ===============================================================
            LEFT PANE: MY ASSIGNED INDENTS (Width: ~320px)
           =============================================================== */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                My Assigned Items
              </h3>
              <p className="text-[11px] text-slate-400">
                You are eligible to bid on {assignedIndents.length} items
              </p>
            </div>
            <span className="bg-blue-600 text-white font-mono text-xs px-2 py-0.5 rounded-full font-bold">
              {assignedIndents.length}
            </span>
          </div>

          {/* List of Indents Assigned to This Vendor */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
            {assignedIndents.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <p className="text-xs font-medium">No items assigned to your profile in this bid.</p>
              </div>
            ) : (
              assignedIndents.map((indent) => {
                const isSelected = indent.indentId === selectedIndentId;
                const msgs = chatThreads[indent.indentId] || [];
                const unreadCount = indent.indentId === 101 ? 1 : 0;

                return (
                  <div
                    key={indent.indentId}
                    onClick={() => setSelectedIndentId(indent.indentId)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {indent.lotName} &gt; {indent.indentDocId}
                      </span>

                      {unreadCount > 0 ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 animate-pulse">
                          1 New Reply
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">
                          {msgs.length} msgs
                        </span>
                      )}
                    </div>

                    <h4 className={`text-xs font-bold mt-1 line-clamp-1 ${isSelected ? 'text-blue-900' : 'text-slate-800'
                      }`}>
                      {indent.itemName}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="font-semibold text-slate-800">
                        {Number(indent.qty || 0).toLocaleString()} {indent.uom}
                      </span>
                      <span className="text-slate-400">
                        Due: {indent.specs.requiredBy || '2026-11-30'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>


        <main className="flex-1 bg-white flex flex-col overflow-hidden">

          {/* Header Context Bar: Active Indent Overview */}
          {activeIndent && (
            <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-3 shrink-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                      {activeIndent.lotName} &gt; {activeIndent.indentDocId}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {activeIndent.itemName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 flex-wrap">
                    <span>Target Quantity: <strong className="text-slate-900 font-semibold">{Number(activeIndent.qty).toLocaleString()} {activeIndent.uom}</strong></span>
                    <span>•</span>
                    <span>Category: <strong>{activeIndent.category}</strong></span>
                    <span>•</span>
                    <span>Delivery Location: <strong>Unit 1, Tirupur</strong></span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Eligible to Bid</span>
                  </span>
                </div>
              </div>

              {/* Navigation Sub-Tabs */}
              <div className="flex items-center gap-5 border-b border-slate-200 pt-3 -mb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'specs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>1. Specifications & Guidelines</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('docs')}
                  className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'docs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>2. Upload Documents & Compliance</span>
                  <span className="bg-blue-100 text-blue-800 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {currentIndentDocs.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'chat'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>3. Queries & Pre-Bid Chat</span>
                  <span className="bg-slate-200 text-slate-700 font-mono text-[10px] px-1.5 py-0.2 rounded-full">
                    {(chatThreads[activeIndent?.indentId] || []).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('quote')}
                  className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'quote'
                    ? 'border-emerald-600 text-emerald-700 font-extrabold'
                    : 'border-transparent text-emerald-700 hover:text-emerald-900'
                    }`}
                >
                  <span className="text-emerald-600 font-bold">₹</span>
                  <span>4. Commercial Quotation & Upload</span>
                  {activeSubmittedQuote ? (
                    <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                      ✓ Submitted
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                      Pending
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">

            {/* ─────────────────────────────────────────────────────────────
                TAB 1: SPECIFICATIONS & GUIDELINES
               ───────────────────────────────────────────────────────────── */}
            {activeTab === 'specs' && (
              <div className="space-y-5 max-w-4xl">
                {/* Technical Parameters Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Technical Item Specifications
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {Object.entries(activeIndent?.specs || {}).map(([k, v]) => {
                      if (!v) return null;
                      return (
                        <div key={k} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-slate-400 capitalize block text-[11px]">{k}</span>
                          <span className="font-bold text-slate-800 text-sm mt-0.5 block">{v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Common Guidelines Download */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Buyer Technical & Quality Guidelines (Downloads)
                  </h4>

                  <div className="space-y-2">
                    {(activeIndent?.commonDocuments || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No guideline attachments uploaded by buyer.</p>
                    ) : (
                      (activeIndent?.commonDocuments || []).map((cd) => (
                        <div key={cd.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📄</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{cd.title}</p>
                              <span className="text-[11px] text-slate-400">{cd.fileName} ({cd.fileSize})</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => Swal.fire('Downloaded', `Downloading ${cd.fileName}`, 'info')}
                            className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 shadow-2xs"
                          >
                            Download PDF
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 2: DOCUMENT UPLOAD & COMPLIANCE
               ───────────────────────────────────────────────────────────── */}
            {activeTab === 'docs' && (
              <div className="space-y-5 max-w-4xl">
                {/* Upload Dropzone */}
                <div className="bg-white rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 p-6 text-center space-y-3 transition-colors bg-blue-50/20">
                  <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Upload Required Compliance Certificate / TDS
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload lab test reports, OEKO-TEX, GOTS, or technical data sheets (PDF, Max 10MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateUpload}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
                  >
                    <span>Browse & Upload PDF</span>
                  </button>
                </div>

                {/* Submissions List */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    My Submitted Certificates ({currentIndentDocs.length})
                  </h4>

                  <div className="space-y-3">
                    {currentIndentDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📋</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs text-slate-900">{doc.title}</h5>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                                v{doc.version || '1.0'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                              {doc.fileName} ({doc.fileSize}) • Submitted on {doc.uploadDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${doc.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'Update Needed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                            }`}>
                            {doc.status}
                          </span>

                          <button
                            type="button"
                            onClick={handleSimulateUpload}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
                          >
                            Re-Upload Revision
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 3: PRE-BID QUERIES & DIRECT CHAT
               ───────────────────────────────────────────────────────────── */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full space-y-4 max-w-4xl">

                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {(chatThreads[activeIndent?.indentId] || []).map((msg) => {
                    const isMe = msg.sender === 'vendor';
                    const isSystem = msg.sender === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="inline-block px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[11px] font-medium">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    if (msg.isBroadcast) {
                      return (
                        <div key={msg.id} className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 my-2 shadow-2xs">
                          <div className="flex items-center gap-1.5 font-bold mb-1 text-purple-700">
                            <span>📢</span>
                            <span>{msg.senderName}</span>
                            <span className="text-[10px] text-purple-400 font-mono ml-auto">{msg.timestamp}</span>
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[11px] font-bold text-slate-700">
                            {msg.senderName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {msg.timestamp}
                          </span>
                        </div>

                        <div
                          className={`max-w-xl p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${isMe
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                            }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Vendor Message Input */}
                <form onSubmit={handleSendMessage} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Ask question or clarify specifications for ${activeIndent?.indentDocId}...`}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />

                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Send</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 4: SUBMIT PRICE QUOTATION
               ───────────────────────────────────────────────────────────── */}
            {activeTab === 'quote' && (
              <div className="max-w-3xl bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">

                {/* Header */}
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      Sealed Bidding Submission
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Commercial Quotation & Document Upload for {activeIndent?.indentDocId}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload your official signed quotation on company letterhead and enter your landed commercial rates. Your quotation is encrypted and sealed until the official bid opening deadline.
                  </p>
                </div>

                {/* 1. Active Submitted Quotation Card (If Already Submitted) */}
                {activeSubmittedQuote && (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                          Active Sealed Quotation on File
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold">
                        Submitted: {activeSubmittedQuote.timestamp}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-emerald-700/80 block text-[11px]">Quoted Unit Rate:</span>
                        <strong className="text-sm font-extrabold text-emerald-950">₹ {parseFloat(activeSubmittedQuote.rate).toFixed(2)} / {activeIndent.uom}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-700/80 block text-[11px]">Total Contract Value:</span>
                        <strong className="text-sm font-extrabold text-emerald-950">₹ {Number(activeSubmittedQuote.total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-700/80 block text-[11px]">Quotation Document:</span>
                        <span className="text-xs font-bold text-emerald-900 underline truncate block" title={activeSubmittedQuote.docName}>
                          📄 {activeSubmittedQuote.docName}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
                      <span>🔒 Status: Encrypted & Sealed. Buyers cannot view until deadline.</span>
                      <span className="font-semibold text-emerald-900 italic">You can revise rates below anytime before the deadline.</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmitQuote} className="space-y-5">

                  {/* 2. Quotation Document Upload Dropzone */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Official Quotation Document (Letterhead Signed PDF / Excel)</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Required for formal bid audit</span>
                    </div>

                    {activeQuoteFile ? (
                      <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-2xl">📄</span>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {activeQuoteFile.fileName}
                            </p>
                            <span className="text-[10px] text-slate-500">
                              {activeQuoteFile.fileSize} • Attached on {activeQuoteFile.uploadDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleSimulateQuoteUpload}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs"
                          >
                            Replace File
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQuotationFiles((prev) => {
                                const next = { ...prev };
                                delete next[activeIndent.indentId];
                                return next;
                              });
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={handleSimulateQuoteUpload}
                        className="p-6 rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/20 text-center cursor-pointer transition-all space-y-2"
                      >
                        <div className="w-10 h-10 mx-auto bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Click to Attach Signed Quotation Document (PDF / Excel)
                          </p>
                          <span className="text-[11px] text-slate-500">
                            Attach your formal quote with technical specs, warranty, and commercial terms
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Commercial Rate & Breakdown Inputs */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Commercial Rate Breakdown
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Basic Unit Rate (₹ per {activeIndent?.uom}) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={unitRate}
                            onChange={(e) => setUnitRate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-7 pr-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="245.00"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Applicable GST (%)
                        </label>
                        <select
                          value={gstRate}
                          onChange={(e) => setGstRate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="0">0% (Exempted)</option>
                          <option value="5">5% (Yarn / Fabric Standard)</option>
                          <option value="12">12%</option>
                          <option value="18">18% (Dyes / Chemicals Standard)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Freight & Delivery (₹ / {activeIndent?.uom})
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={freightRate}
                            onChange={(e) => setFreightRate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-7 pr-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Landed Cost Calculation Table */}
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Required Quantity:</span>
                      <span className="font-bold text-slate-900">{Number(activeIndent?.qty).toLocaleString()} {activeIndent?.uom}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Base Ex-Mill Value ({Number(activeIndent?.qty).toLocaleString()} × ₹{unitRate}):</span>
                      <span className="font-bold text-slate-900">₹ {totalBidAmount.baseTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    {parseFloat(gstRate) > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>GST ({gstRate}%):</span>
                        <span className="font-bold text-slate-900">+ ₹ {totalBidAmount.gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-emerald-200 flex justify-between text-sm font-extrabold text-emerald-950">
                      <span>Total Net Landed Contract Value:</span>
                      <span>₹ {totalBidAmount.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* 5. Terms Checkboxes */}
                  <div className="space-y-2 pt-1 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={paymentTermsAccepted}
                        onChange={(e) => setPaymentTermsAccepted(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>I confirm price validity for 30 days and accept 45-day PDC payment terms.</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={deliveryScheduleAccepted}
                        onChange={(e) => setDeliveryScheduleAccepted(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>I guarantee delivery strictly in staggered lots as specified by the buyer.</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!paymentTermsAccepted || !deliveryScheduleAccepted}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>{activeSubmittedQuote ? 'Update & Re-Submit Sealed Quotation' : 'Submit Encrypted & Sealed Bid Quotation'}</span>
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        </main>

      </div>

    </div>
  );
}
