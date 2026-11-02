import React, { useState, useMemo, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

// Realistic fallback dataset mirroring user's exact structure (3 Lots, 5 Indents, 19 Vendors)
export const DEMO_COMMUNICATIONS_BID = {
  id: 101,
  docId: 'SRG/2026/BID/1',
  bidNo: 'BID-2026-01',
  bidTitle: 'Summer Yarn & Fabric Procurement 2026',
  name: 'Summer Yarn & Fabric Procurement 2026',
  status: 'PUBLISHED',
  submissionDeadline: '2026-11-20T17:00:00.000Z',
  queryDeadline: '2026-11-12T17:00:00.000Z',
  lots: [
    {
      id: 1,
      lotNumber: '1',
      name: 'Lot 1 - Combed & Carded Yarn',
      indents: [
        {
          id: 101,
          docId: 'IND-YRN-001',
          item_name: '30s Combed Cotton Knitting Yarn',
          category: 'Yarn',
          department: 'Knitting Unit 1',
          qty: 12000,
          uom: 'KGS',
          count: '30s Ne',
          blend: '100% Combed Cotton',
          shade: 'Super White',
          requiredBy: '2026-11-30',
          commonDocuments: [
            { id: 'c1', title: 'Technical Yarn Parameter Specs', fileName: 'Yarn_Specs_30s_v1.0.pdf', fileSize: '1.4 MB', uploadDate: '2026-10-14' },
            { id: 'c2', title: 'Quality & CSP Penalty Clauses', fileName: 'Yarn_Quality_Penalty_Clauses.pdf', fileSize: '850 KB', uploadDate: '2026-10-14' }
          ],
          vendors: [
            {
              id: 1,
              vendorId: 1,
              name: 'Kovai Yarns & Spinners',
              phone: '+91 98421 11223',
              city: 'Coimbatore',
              status: 'INVITED',
              documents: [
                { id: 'd101_1', title: 'Mill CSP & Hairiness Test Certificate', fileName: 'Kovai_CSP_LabReport_v1.0.pdf', fileSize: '2.1 MB', version: '1.0', status: 'Pending Review', uploadDate: '2026-10-16 10:30' },
                { id: 'd101_2', title: 'OEKO-TEX Standard 100 Certificate', fileName: 'Kovai_OekoTex_2026.pdf', fileSize: '3.4 MB', version: '1.0', status: 'Approved', uploadDate: '2026-10-15 14:20' }
              ]
            },
            {
              id: 2,
              vendorId: 2,
              name: 'Annai Spinners Mills',
              phone: '+91 94432 55667',
              city: 'Dindigul',
              status: 'INVITED',
              documents: [
                { id: 'd101_3', title: 'Mill CSP & Quality Report', fileName: 'Annai_Spinners_LabReport_v1.0.pdf', fileSize: '1.9 MB', version: '1.0', status: 'Update Needed', uploadDate: '2026-10-16 09:15' }
              ]
            },
            {
              id: 3,
              vendorId: 3,
              name: 'Sri Murugan Mills Ltd',
              phone: '+91 98940 99881',
              city: 'Tirupur',
              status: 'INVITED',
              documents: [
                { id: 'd101_4', title: 'TDS & Quality Parameters', fileName: 'Murugan_TDS_30s_v1.0.pdf', fileSize: '1.5 MB', version: '1.0', status: 'Approved', uploadDate: '2026-10-15 16:40' }
              ]
            }
          ]
        },
        {
          id: 102,
          docId: 'IND-YRN-002',
          item_name: '40s Carded Weaving Yarn',
          category: 'Yarn',
          department: 'Weaving Unit 2',
          qty: 8500,
          uom: 'KGS',
          count: '40s Ne',
          blend: '100% Carded Cotton',
          shade: 'Raw White',
          requiredBy: '2026-12-05',
          commonDocuments: [
            { id: 'c3', title: 'Technical Carded Yarn Specs', fileName: 'Carded_Yarn_Specs_40s.pdf', fileSize: '1.2 MB', uploadDate: '2026-10-14' }
          ],
          vendors: [
            {
              id: 4,
              vendorId: 4,
              name: 'Prime Spinners Ltd',
              phone: '+91 97880 22334',
              city: 'Erode',
              status: 'INVITED',
              documents: [
                { id: 'd102_1', title: 'Lab Tensile Strength Certificate', fileName: 'Prime_Tensile_Cert_v1.0.pdf', fileSize: '2.5 MB', version: '1.0', status: 'Pending Review', uploadDate: '2026-10-16 11:45' }
              ]
            },
            {
              id: 5,
              vendorId: 5,
              name: 'Premier Textiles Group',
              phone: '+91 98433 77889',
              city: 'Coimbatore',
              status: 'INVITED',
              documents: [
                { id: 'd102_2', title: 'Standard Mill Quality Spec Sheet', fileName: 'Premier_Quality_v1.0.pdf', fileSize: '1.8 MB', version: '1.0', status: 'Approved', uploadDate: '2026-10-15 17:10' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      lotNumber: '2',
      name: 'Lot 2 - Knitted Fabric Lots',
      indents: [
        {
          id: 201,
          docId: 'IND-FBC-101',
          item_name: 'Single Jersey 100% Cotton Bio-Washed',
          category: 'Fabric',
          department: 'Garmenting Unit',
          qty: 15000,
          uom: 'KGS',
          gsm: '160 GSM',
          width: '32 inch Open Width',
          blend: '100% Combed Cotton',
          requiredBy: '2026-12-10',
          commonDocuments: [
            { id: 'c4', title: 'Single Jersey Knitting & Shrinkage Norms', fileName: 'SJ_160GSM_Norms.pdf', fileSize: '1.6 MB', uploadDate: '2026-10-14' }
          ],
          vendors: [
            { id: 6, vendorId: 6, name: 'Best Corp Textiles', phone: '+91 98422 11001', city: 'Tirupur', status: 'INVITED', documents: [] },
            { id: 7, vendorId: 7, name: 'Eastman Exports Global', phone: '+91 98422 22002', city: 'Tirupur', status: 'INVITED', documents: [] },
            { id: 8, vendorId: 8, name: 'Jayram Knit Process', phone: '+91 98422 33003', city: 'Erode', status: 'INVITED', documents: [] },
            { id: 9, vendorId: 9, name: 'Cotton Blossom Garments', phone: '+91 98422 44004', city: 'Perundurai', status: 'INVITED', documents: [] },
            { id: 10, vendorId: 10, name: 'SCM Garments Mills', phone: '+91 98422 55005', city: 'Tirupur', status: 'INVITED', documents: [] }
          ]
        },
        {
          id: 202,
          docId: 'IND-FBC-102',
          item_name: 'Rib 1x1 95/5 Cotton Lycra Tubular Fabric',
          category: 'Fabric',
          department: 'Garmenting Unit',
          qty: 10000,
          uom: 'KGS',
          gsm: '220 GSM',
          width: '34 inch Tubular',
          blend: '95% Cotton / 5% Spandex',
          requiredBy: '2026-12-15',
          commonDocuments: [
            { id: 'c5', title: 'Rib 1x1 Lycra Recovery Guidelines', fileName: 'Rib_Recovery_Specs.pdf', fileSize: '2.0 MB', uploadDate: '2026-10-14' }
          ],
          vendors: [
            { id: 1, vendorId: 1, name: 'Kovai Yarns & Spinners', phone: '+91 98421 11223', city: 'Coimbatore', status: 'INVITED', documents: [{ id: 'd202_1', title: 'Lycra Recovery & Elasticity Test Report', fileName: 'Kovai_Rib_Lycra_Report_v1.0.pdf', fileSize: '2.4 MB', version: '1.0', status: 'Pending Review', uploadDate: '2026-10-16 11:24' }] },
            { id: 11, vendorId: 11, name: 'Tirupur Knitters Consortium', phone: '+91 98423 66006', city: 'Tirupur', status: 'INVITED', documents: [] },
            { id: 12, vendorId: 12, name: 'Lotus Fabrics India', phone: '+91 98423 77007', city: 'Tirupur', status: 'INVITED', documents: [] },
            { id: 13, vendorId: 13, name: 'Apex Knits International', phone: '+91 98423 88008', city: 'Erode', status: 'INVITED', documents: [] },
            { id: 14, vendorId: 14, name: 'Texmo Mills & Processing', phone: '+91 98423 99009', city: 'Coimbatore', status: 'INVITED', documents: [] },
            { id: 15, vendorId: 15, name: 'Surya Textiles Group', phone: '+91 98424 00110', city: 'Karur', status: 'INVITED', documents: [] },
            { id: 16, vendorId: 16, name: 'Balaji Fabrics Private Ltd', phone: '+91 98424 11221', city: 'Dindigul', status: 'INVITED', documents: [] }
          ]
        }
      ]
    },
    {
      id: 3,
      lotNumber: '3',
      name: 'Lot 3 - Dyes & Dyeing Auxiliaries',
      indents: [
        {
          id: 301,
          docId: 'IND-DYE-050',
          item_name: 'Reactive Red 195 High Exhaustion Dye',
          category: 'Dyes & Chemicals',
          department: 'Dyeing Plant Unit 3',
          qty: 2500,
          uom: 'KGS',
          ciCas: 'Reactive Red 195',
          strength: '150% Crude Standard',
          hazard: 'Non-Hazardous Class',
          requiredBy: '2026-11-25',
          commonDocuments: [
            { id: 'c6', title: 'MSDS & Eco-Toxicity Standard Guidelines', fileName: 'MSDS_ReactiveRed195.pdf', fileSize: '3.1 MB', uploadDate: '2026-10-14' }
          ],
          vendors: [
            { id: 17, vendorId: 17, name: 'Classic Dyes & Chemicals', phone: '+91 98425 22332', city: 'Ahmedabad', status: 'INVITED', documents: [{ id: 'd301_1', title: 'ZDHC Level 3 Gateway Certificate', fileName: 'Classic_ZDHC_Cert_v1.0.pdf', fileSize: '1.7 MB', version: '1.0', status: 'Approved', uploadDate: '2026-10-15 15:30' }] },
            { id: 18, vendorId: 18, name: 'Rainbow Chemical Synthetics', phone: '+91 98425 33443', city: 'Mumbai', status: 'INVITED', documents: [] }
          ]
        }
      ]
    }
  ]
};

export default function BiddingCommunicationsHub({
  bidData: initialBidData,
  isEmbedded = false,
  onBack,
}) {
  // Normalize input or fallback to the complete 3 Lots / 5 Indents / 19 Vendors dataset
  const bid = useMemo(() => {
    if (initialBidData && Array.isArray(initialBidData.lots) && initialBidData.lots.length > 0) {
      return initialBidData;
    }
    return DEMO_COMMUNICATIONS_BID;
  }, [initialBidData]);

  const lots = bid.lots || [];

  // Flatten all threads with composite key: `${indentId}_${vendorId}`
  const allThreads = useMemo(() => {
    const list = [];
    lots.forEach((lot) => {
      (lot.indents || []).forEach((indent) => {
        (indent.vendors || []).forEach((vendor) => {
          const threadKey = `${indent.id}_${vendor.id || vendor.vendorId}`;
          const docs = vendor.documents || [];
          const hasPendingDocs = docs.some((d) => d.status === 'Pending Review');
          const hasUpdateNeeded = docs.some((d) => d.status === 'Update Needed');

          list.push({
            threadKey,
            lotId: lot.id,
            lotNumber: lot.lotNumber,
            lotName: lot.name || `Lot ${lot.lotNumber}`,
            indentId: indent.id,
            indentDocId: indent.docId || `IND-${indent.id}`,
            itemName: indent.item_name || 'Item',
            category: indent.category || 'General',
            department: indent.department || 'General',
            qty: indent.qty,
            uom: indent.uom,
            specs: {
              count: indent.count,
              blend: indent.blend,
              shade: indent.shade,
              gsm: indent.gsm,
              width: indent.width,
              ciCas: indent.ciCas,
              strength: indent.strength,
            },
            vendorId: vendor.id || vendor.vendorId,
            vendorName: vendor.name || vendor.label || `Vendor #${vendor.id}`,
            vendorCity: vendor.city || 'India',
            documents: docs,
            hasPendingDocs,
            hasUpdateNeeded,
            commonDocuments: indent.commonDocuments || [],
          });
        });
      });
    });
    return list;
  }, [lots]);

  // Scope & Filter State
  const [activeFilterTab, setActiveFilterTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'PENDING_DOCS'
  const [selectedLotId, setSelectedLotId] = useState('ALL');
  const [selectedIndentId, setSelectedIndentId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLots, setExpandedLots] = useState({ 1: true, 2: true, 3: true });

  // Active Thread Selection
  const [selectedThreadKey, setSelectedThreadKey] = useState(
    allThreads[0]?.threadKey || '101_1'
  );

  // Active Workspace Sub-Tab: 'chat' | 'docs'
  const [workspaceTab, setWorkspaceTab] = useState('chat');

  // Sealed Document Lockdown Toggle Setting
  const [sealDocumentsPolicy, setSealDocumentsPolicy] = useState(true);
  const [simulatePostDeadline, setSimulatePostDeadline] = useState(false);

  // Specifications popover toggle
  const [showSpecsModal, setShowSpecsModal] = useState(false);

  // Chat Conversations State: { [threadKey]: [ { id, sender, senderName, text, timestamp, docAttachment } ] }
  const [conversations, setConversations] = useState({
    '101_1': [
      { id: 1, sender: 'system', senderName: 'Bid System', text: 'Pre-bid clarification window opened for Lot 1 > Indent 1 (30s Combed Cotton). All communications are recorded for compliance.', timestamp: '10:00 AM' },
      { id: 2, sender: 'vendor', senderName: 'Kovai Yarns', text: 'Good morning Procurement Team. We have reviewed the CSP tolerance. Can we submit our Mill Quality Test Certificate by tomorrow evening?', timestamp: '10:18 AM' },
      { id: 3, sender: 'buyer', senderName: 'You (Procurement Admin)', text: 'Yes Kovai Yarns, that is acceptable. Please ensure the CSP does not fall below 2,850.', timestamp: '10:30 AM' },
      { id: 4, sender: 'vendor', senderName: 'Kovai Yarns', text: 'Understood. We have attached our latest test report below for your review.', timestamp: '10:45 AM', docAttachment: { title: 'Mill CSP & Hairiness Test Certificate', fileName: 'Kovai_CSP_LabReport_v1.0.pdf', fileSize: '2.1 MB', status: 'Pending Review' } }
    ],
    '101_2': [
      { id: 1, sender: 'system', senderName: 'Bid System', text: 'Pre-bid thread initialized with Annai Spinners Mills.', timestamp: '09:00 AM' },
      { id: 2, sender: 'vendor', senderName: 'Annai Spinners', text: 'Please clarify delivery timeline for Lot 1. Is staggered delivery allowed?', timestamp: '09:15 AM' },
      { id: 3, sender: 'buyer', senderName: 'You (Procurement Admin)', text: 'Staggered delivery of 3,000 kg every 7 days is mandatory. Please upload updated compliance document.', timestamp: '09:30 AM' }
    ],
    '202_1': [
      { id: 1, sender: 'system', senderName: 'Bid System', text: 'Pre-bid thread initialized for Lot 2 > Indent 4 (Rib 1x1 Fabric).', timestamp: '11:00 AM' },
      { id: 2, sender: 'vendor', senderName: 'Kovai Yarns', text: 'Hi, we uploaded the Lycra recovery certificate for this indent.', timestamp: '11:25 AM', docAttachment: { title: 'Lycra Recovery & Elasticity Test Report', fileName: 'Kovai_Rib_Lycra_Report_v1.0.pdf', fileSize: '2.4 MB', status: 'Pending Review' } }
    ]
  });

  // Track unread flags per thread
  const [unreadMap, setUnreadMap] = useState({
    '101_1': true,
    '101_2': true,
    '202_1': true,
  });

  // Chat input
  const [inputText, setInputText] = useState('');
  const [isBroadcastChecked, setIsBroadcastChecked] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedThreadKey]);

  // Current active thread object
  const activeThread = useMemo(() => {
    return allThreads.find((t) => t.threadKey === selectedThreadKey) || allThreads[0];
  }, [allThreads, selectedThreadKey]);

  // Clear unread on thread selection
  const handleSelectThread = (threadKey) => {
    setSelectedThreadKey(threadKey);
    setUnreadMap((prev) => ({ ...prev, [threadKey]: false }));
  };

  // Filtered threads list based on Left Pane selection
  const filteredThreads = useMemo(() => {
    return allThreads.filter((t) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.vendorName.toLowerCase().includes(q);
        const matchesIndent = t.indentDocId.toLowerCase().includes(q) || t.itemName.toLowerCase().includes(q);
        const matchesLot = t.lotName.toLowerCase().includes(q);
        if (!matchesName && !matchesIndent && !matchesLot) return false;
      }

      // Lot filter
      if (selectedLotId !== 'ALL' && String(t.lotId) !== String(selectedLotId)) {
        return false;
      }

      // Indent filter
      if (selectedIndentId !== 'ALL' && String(t.indentId) !== String(selectedIndentId)) {
        return false;
      }

      // Quick tab filter
      if (activeFilterTab === 'UNREAD') {
        return Boolean(unreadMap[t.threadKey]);
      }
      if (activeFilterTab === 'PENDING_DOCS') {
        return t.hasPendingDocs || t.hasUpdateNeeded;
      }

      return true;
    });
  }, [allThreads, searchQuery, selectedLotId, selectedIndentId, activeFilterTab, unreadMap]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const unreadCount = Object.values(unreadMap).filter(Boolean).length;
    let pendingDocsCount = 0;
    allThreads.forEach((t) => {
      if (t.hasPendingDocs || t.hasUpdateNeeded) pendingDocsCount++;
    });
    return {
      totalVendors: allThreads.length,
      unreadCount,
      pendingDocsCount,
      lotsCount: lots.length,
    };
  }, [allThreads, unreadMap, lots]);

  // Deadline check (simulated or real)
  const isDeadlineExpired = simulatePostDeadline || (bid.submissionDeadline && new Date() > new Date(bid.submissionDeadline));

  // Sending message
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'buyer',
      senderName: 'You (Procurement Admin)',
      text: inputText.trim(),
      timestamp: timeStr,
      isBroadcast: isBroadcastChecked,
    };

    if (isBroadcastChecked && activeThread) {
      // Broadcast to all vendor threads in this specific indent
      const siblingThreads = allThreads.filter((t) => t.indentId === activeThread.indentId);
      setConversations((prev) => {
        const next = { ...prev };
        siblingThreads.forEach((st) => {
          next[st.threadKey] = [...(next[st.threadKey] || []), { ...newMsg, broadcastTag: `Broadcast to all ${siblingThreads.length} vendors in ${activeThread.indentDocId}` }];
        });
        return next;
      });

      Swal.fire({
        icon: 'success',
        title: 'Broadcast Sent',
        text: `Clarification dispatched to all ${siblingThreads.length} vendors participating in ${activeThread.indentDocId}.`,
        timer: 1800,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    } else {
      // 1-on-1 thread
      setConversations((prev) => ({
        ...prev,
        [selectedThreadKey]: [...(prev[selectedThreadKey] || []), newMsg],
      }));
    }

    setInputText('');
    setIsBroadcastChecked(false);
  };

  // Quick Action: Request Document Revision via Chat
  const handleRequestRevisionPrompt = (docTitle) => {
    setWorkspaceTab('chat');
    const prompt = `Hi ${activeThread.vendorName}, please provide an updated revision for "${docTitle}". The current submission does not meet technical compliance guidelines.`;
    setInputText(prompt);
  };

  // Document Approval Action
  const handleApproveDocument = (docId) => {
    Swal.fire({
      icon: 'success',
      title: 'Document Approved',
      text: 'Technical document verified and approved for bidding qualification.',
      timer: 1800,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  };

  const toggleLotExpand = (lotId) => {
    setExpandedLots((prev) => ({ ...prev, [lotId]: !prev[lotId] }));
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[640px] overflow-hidden font-sans animate-in fade-in duration-300">
      
      {/* ─────────────────────────────────────────────────────────────────
          TOP COMMAND BAR: Bid Info, Deadlines, Sealed Toggle, Metrics
         ───────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
              title="Go Back"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {bid.docId || bid.bidNo || 'BID-2026-01'}
              </span>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-md">
                {bid.bidTitle || bid.name || 'Bidding Communications & Compliance'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {bid.status || 'PUBLISHED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Multi-Lot Pre-Bid Communications • 3 Lots • 5 Indents • 19 Participating Vendors
            </p>
          </div>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center gap-3">
          {/* Query Deadline Countdown */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs">
            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-amber-800 font-semibold text-[11px]">
              Query Deadline: 12 Nov, 17:00
            </span>
          </div>

          {/* Sealed Document Logic Switcher (Simulation / Setting) */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setSimulatePostDeadline(false)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                !simulatePostDeadline
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Pre-deadline: Vendor documents are sealed until deadline"
            >
              🔒 Sealed Mode (Pre-Deadline)
            </button>
            <button
              type="button"
              onClick={() => setSimulatePostDeadline(true)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                simulatePostDeadline
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Post-deadline: Documents unseal for evaluation"
            >
              🔓 Unsealed (Evaluation)
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TRI-PANE WORKSPACE BODY
         ───────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ===============================================================
            PANE 1: SCOPE & HIERARCHY NAVIGATOR (Width: ~280px)
           =============================================================== */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          
          {/* Quick Smart Filters */}
          <div className="p-3 border-b border-slate-100 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Activity Queues
            </div>
            
            <button
              type="button"
              onClick={() => {
                setActiveFilterTab('ALL');
                setSelectedLotId('ALL');
                setSelectedIndentId('ALL');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilterTab === 'ALL' && selectedLotId === 'ALL' && selectedIndentId === 'ALL'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>All Vendor Activity</span>
              </div>
              <span className="bg-slate-200/80 text-slate-700 font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                {allThreads.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('UNREAD')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilterTab === 'UNREAD'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Unread Queries</span>
              </div>
              <span className="bg-red-100 text-red-700 font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {metrics.unreadCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('PENDING_DOCS')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilterTab === 'PENDING_DOCS'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Docs Pending Review</span>
              </div>
              <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {metrics.pendingDocsCount}
              </span>
            </button>
          </div>

          {/* Collapsible Lots & Indents Tree */}
          <div className="p-3 flex-1 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Lot & Indent Hierarchy
            </div>

            <div className="space-y-1.5">
              {lots.map((lot) => {
                const isExpanded = Boolean(expandedLots[lot.id]);
                const lotVendorCount = (lot.indents || []).reduce(
                  (acc, ind) => acc + (ind.vendors ? ind.vendors.length : 0),
                  0
                );
                const isLotSelected = selectedLotId === lot.id && selectedIndentId === 'ALL';

                return (
                  <div key={lot.id} className="rounded-lg border border-slate-100 overflow-hidden">
                    {/* Lot Header */}
                    <div
                      className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${
                        isLotSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 font-semibold'
                      }`}
                      onClick={() => {
                        setSelectedLotId(lot.id);
                        setSelectedIndentId('ALL');
                        setActiveFilterTab('ALL');
                      }}
                    >
                      <div className="flex items-center gap-1.5 truncate text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLotExpand(lot.id);
                          }}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <svg
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <span className="truncate">{lot.name || `Lot ${lot.lotNumber}`}</span>
                      </div>
                      <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono shrink-0">
                        {lotVendorCount} v
                      </span>
                    </div>

                    {/* Indents List under this Lot */}
                    {isExpanded && (
                      <div className="pl-4 pr-1 py-1 space-y-0.5 bg-white divide-y divide-slate-50">
                        {(lot.indents || []).map((indent) => {
                          const isIndentSelected = selectedIndentId === indent.id;
                          const vendorCount = (indent.vendors || []).length;

                          return (
                            <button
                              key={indent.id}
                              type="button"
                              onClick={() => {
                                setSelectedLotId(lot.id);
                                setSelectedIndentId(indent.id);
                                setActiveFilterTab('ALL');
                              }}
                              className={`w-full text-left py-1.5 px-2 rounded flex items-center justify-between text-xs transition-colors ${
                                isIndentSelected
                                  ? 'bg-blue-600 text-white font-semibold'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <div className="truncate pr-1">
                                <span className={`font-mono text-[10px] block ${isIndentSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                                  {indent.docId || `IND-${indent.id}`}
                                </span>
                                <span className="truncate block text-[11px] leading-tight">
                                  {indent.item_name}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                                  isIndentSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {vendorCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ===============================================================
            PANE 2: THREAD & ACTIVITY QUEUE (Width: ~340px)
           =============================================================== */}
        <section className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Search Box inside Scope */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/50">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter vendor, indent, query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
              <span>Showing {filteredThreads.length} of {allThreads.length} threads</span>
              {selectedIndentId !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedIndentId('ALL')}
                  className="text-blue-600 hover:underline"
                >
                  Clear Indent Filter
                </button>
              )}
            </div>
          </div>

          {/* Thread Card List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-xs font-semibold text-slate-600">No active threads</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Adjust your filters or lot selection.</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.threadKey === selectedThreadKey;
                const isUnread = unreadMap[thread.threadKey];
                const threadMsgs = conversations[thread.threadKey] || [];
                const lastMsg = threadMsgs[threadMsgs.length - 1];

                return (
                  <div
                    key={thread.threadKey}
                    onClick={() => handleSelectThread(thread.threadKey)}
                    className={`p-3 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'bg-blue-50/60 border-l-blue-600'
                        : 'hover:bg-slate-50 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Unread query" />
                        )}
                        <h4 className={`text-xs truncate ${isSelected ? 'font-bold text-blue-900' : 'font-semibold text-slate-800'}`}>
                          {thread.vendorName}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {lastMsg?.timestamp || '10:00 AM'}
                      </span>
                    </div>

                    {/* Breadcrumb Chip: Lot > Indent */}
                    <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {thread.lotNumber ? `Lot ${thread.lotNumber}` : 'Lot'} &gt; {thread.indentDocId}
                      </span>
                      {thread.hasPendingDocs && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          Docs Pending
                        </span>
                      )}
                      {thread.hasUpdateNeeded && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                          Update Needed
                        </span>
                      )}
                    </div>

                    {/* Preview Snippet */}
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : 'No messages exchanged yet.'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ===============================================================
            PANE 3: CONTEXTUAL WORKSPACE (Flex-1)
           =============================================================== */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden">
          
          {/* Header Context Bar: Item Specifications & Direct Context */}
          {activeThread && (
            <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-3 shrink-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                      {activeThread.lotName} &gt; {activeThread.indentDocId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeThread.itemName}
                    </h3>
                  </div>

                  {/* Summary Spec Line */}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 flex-wrap">
                    <span className="font-semibold text-slate-800">
                      Qty: {Number(activeThread.qty || 0).toLocaleString()} {activeThread.uom}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">Dept: {activeThread.department}</span>
                    <span>•</span>
                    <span className="text-slate-500">Vendor: <strong>{activeThread.vendorName}</strong> ({activeThread.vendorCity})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSpecsModal(true)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Item Specs</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Chat ⇄ Documents */}
              <div className="flex items-center gap-4 border-b border-slate-200 pt-3 -mb-3">
                <button
                  type="button"
                  onClick={() => setWorkspaceTab('chat')}
                  className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    workspaceTab === 'chat'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Pre-Bid Chat & Clarifications</span>
                  <span className="bg-slate-200/80 text-slate-700 font-mono text-[10px] px-1.5 py-0.2 rounded-full">
                    {(conversations[activeThread.threadKey] || []).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceTab('docs')}
                  className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    workspaceTab === 'docs'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Vendor Documents & Compliance</span>
                  <span className="bg-blue-100 text-blue-800 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {activeThread.documents.length}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* MAIN WORKSPACE BODY */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            {workspaceTab === 'chat' ? (
              
              /* -------------------------------------------------------------
                 SUB-TAB 1: CHAT FEED & MESSAGE STREAM
                 ------------------------------------------------------------- */
              <div className="flex flex-col h-full space-y-4">
                
                {/* Notice banner for Sealed Bidding */}
                {!isDeadlineExpired && sealDocumentsPolicy && (
                  <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5">
                    <span className="text-base shrink-0">🔒</span>
                    <div>
                      <strong className="font-bold">Sealed Bidding In Effect:</strong> Technical submissions from {activeThread.vendorName} are encrypted & sealed. Document contents will unlock automatically for Procurement evaluation on <strong>12 Nov 2026, 17:00 hrs</strong>. You can answer queries and provide pre-bid guidance below.
                    </div>
                  </div>
                )}

                {/* Message Bubbles List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {(conversations[activeThread.threadKey] || []).map((msg) => {
                    const isMe = msg.sender === 'buyer';
                    const isSystem = msg.sender === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="inline-block px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[11px] font-medium">
                            {msg.text} • {msg.timestamp}
                          </span>
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
                          {msg.isBroadcast && (
                            <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                              Broadcast
                            </span>
                          )}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-xl p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* Inline Document Attachment Card */}
                          {msg.docAttachment && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/80 bg-slate-50/80 p-2 rounded-lg text-slate-800">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 truncate">
                                  <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <div className="truncate">
                                    <p className="font-bold text-xs truncate">{msg.docAttachment.title}</p>
                                    <span className="text-[10px] text-slate-500">{msg.docAttachment.fileName} ({msg.docAttachment.fileSize})</span>
                                  </div>
                                </div>

                                {!isDeadlineExpired && sealDocumentsPolicy ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold shrink-0">
                                    🔒 Sealed
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleApproveDocument(1)}
                                      className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRequestRevisionPrompt(msg.docAttachment.title)}
                                      className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold hover:bg-amber-200"
                                    >
                                      Request Revision
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <form onSubmit={handleSendMessage} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <div className="flex items-center justify-between text-xs mb-2 text-slate-500">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isBroadcastChecked}
                        onChange={(e) => setIsBroadcastChecked(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-slate-700">
                        Broadcast to all vendors in this Indent ({activeThread.indentDocId})
                      </span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Vendors cannot see other vendors' identities
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Reply to ${activeThread.vendorName} or clarify specifications...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Send</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </form>

              </div>
            ) : (
              
              /* -------------------------------------------------------------
                 SUB-TAB 2: VENDOR DOCUMENTS & COMPLIANCE TABLE
                 ------------------------------------------------------------- */
              <div className="space-y-6">
                
                {/* 1. Common Specifications Provided by Buyer */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>1. Buyer Specifications & Guidelines (Common)</span>
                  </h4>

                  <div className="space-y-2">
                    {activeThread.commonDocuments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No common guidelines uploaded for this indent.</p>
                    ) : (
                      activeThread.commonDocuments.map((cd) => (
                        <div key={cd.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-lg">📄</span>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-800 truncate">{cd.title}</p>
                              <span className="text-[10px] text-slate-400">{cd.fileName} • {cd.fileSize} • Uploaded {cd.uploadDate}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => Swal.fire('Downloaded', `Downloading ${cd.fileName}`, 'info')}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 shadow-2xs"
                          >
                            Download
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Documents Uploaded by This Vendor */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>2. Vendor Compliance Submissions ({activeThread.vendorName})</span>
                    </h4>

                    {/* Sealed Status Indicator */}
                    {!isDeadlineExpired && sealDocumentsPolicy ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                        <span>🔒</span> Sealed until 12 Nov, 17:00
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <span>🔓</span> Unsealed for Evaluation
                      </span>
                    )}
                  </div>

                  {activeThread.documents.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs font-medium text-slate-600">No documents submitted yet</p>
                      <p className="text-[11px] text-slate-400 mt-1">Vendor has not uploaded technical certificates for this indent.</p>
                      <button
                        type="button"
                        onClick={() => handleRequestRevisionPrompt('Technical Test Certificate')}
                        className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                      >
                        Request Document via Chat
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeThread.documents.map((doc) => {
                        const isSealed = !isDeadlineExpired && sealDocumentsPolicy;

                        return (
                          <div
                            key={doc.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              doc.status === 'Update Needed'
                                ? 'border-red-200 bg-red-50/30'
                                : doc.status === 'Approved'
                                ? 'border-emerald-200 bg-emerald-50/20'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-xs text-slate-900">{doc.title}</h5>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                    v{doc.version || '1.0'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {isSealed ? (
                                    <span className="italic text-slate-400">File encrypted until deadline</span>
                                  ) : (
                                    `${doc.fileName} (${doc.fileSize})`
                                  )}
                                  <span> • Submitted {doc.uploadDate}</span>
                                </p>
                              </div>

                              <div>
                                {isSealed ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                    🔒 Sealed Submission
                                  </span>
                                ) : (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      doc.status === 'Approved'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : doc.status === 'Update Needed'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {doc.status}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions Toolbar */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              {isSealed ? (
                                <p className="text-[11px] text-slate-400 italic">
                                  Review actions unlock automatically when submission deadline passes.
                                </p>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveDocument(doc.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRequestRevisionPrompt(doc.title)}
                                    className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold transition-colors"
                                  >
                                    ⚠️ Request Revision
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRequestRevisionPrompt(doc.title)}
                                className="text-xs text-blue-600 hover:underline font-semibold"
                              >
                                Discuss in Chat &rarr;
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          ITEM SPECIFICATIONS MODAL / POPUP
         ───────────────────────────────────────────────────────────────── */}
      {showSpecsModal && activeThread && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">
                  {activeThread.lotName} &gt; {activeThread.indentDocId}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                  {activeThread.itemName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSpecsModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Indent Category</span>
                <span className="font-bold text-slate-800">{activeThread.category}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Indent Quantity</span>
                <span className="font-bold text-slate-800">{Number(activeThread.qty || 0).toLocaleString()} {activeThread.uom}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Requesting Department</span>
                <span className="font-bold text-slate-800">{activeThread.department}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Invited Vendors</span>
                <span className="font-bold text-slate-800">
                  {allThreads.filter((t) => t.indentId === activeThread.indentId).length} Vendors Participating
                </span>
              </div>
            </div>

            {/* Technical Parameters */}
            <div className="space-y-1.5 text-xs">
              <h5 className="font-bold text-slate-700 text-xs">Technical Parameters:</h5>
              <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100 space-y-1 text-slate-600">
                {Object.entries(activeThread.specs).map(([k, v]) => {
                  if (!v) return null;
                  return (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-400 capitalize">{k}:</span>
                      <span className="font-semibold text-slate-800">{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSpecsModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
