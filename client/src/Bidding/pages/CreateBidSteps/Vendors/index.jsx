import React, { useState, useMemo } from 'react';
import VendorSelectionTab from './VendorSelectionTab';
import VendorDocumentsTab from './VendorDocumentsTab';
import VendorChatTab from './VendorChatTab';

export default function Vendors({ onBack, onNext, bidData, setBidData }) {
  const [activeTab, setActiveTab] = useState('selection'); // 'selection' | 'documents' | 'chat'

  // Chat message persistence: { [threadKey]: [ { sender, senderName, text, timestamp } ] }
  const [chatMessages, setChatMessages] = useState({});

  // Deep-link state for Chat tab (e.g. when triggered from document update)
  const [chatPreload, setChatPreload] = useState({
    vendorId: null,
    text: '',
  });

  const lots = bidData.lots || [];

  // Compute summary metrics
  const uniqueVendors = useMemo(() => {
    const map = new Map();
    lots.forEach(lot => {
      (lot.indents || []).forEach(indent => {
        (indent.vendors || []).forEach(v => {
          map.set(String(v.id || v.vendorId || v.name), v);
        });
      });
    });
    return Array.from(map.values());
  }, [lots]);

  const docStats = useMemo(() => {
    let total = 0;
    let needsUpdate = 0;

    lots.forEach(lot => {
      (lot.indents || []).forEach(indent => {
        total += (indent.commonDocuments || []).length;
        (indent.vendors || []).forEach(v => {
          const vDocs = v.documents || [];
          total += vDocs.length;
          needsUpdate += vDocs.filter(d => d.status === 'Update Needed').length;
        });
      });
    });

    return { total: Math.max(total, 4), needsUpdate };
  }, [lots]);

  const handleSendMessage = ({ threadKey, vendorId, isBroadcast, text, allVendorIds }) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      sender: 'user',
      senderName: 'You (Procurement)',
      text,
      timestamp: timeStr,
    };

    setChatMessages(prev => {
      const next = { ...prev };
      if (isBroadcast && allVendorIds) {
        // Post to broadcast thread and all individual vendor threads
        next['broadcast'] = [...(next['broadcast'] || []), newMsg];
        allVendorIds.forEach(vId => {
          next[String(vId)] = [...(next[String(vId)] || []), newMsg];
        });
      } else {
        const key = threadKey || String(vendorId);
        next[key] = [...(next[key] || []), newMsg];
      }
      return next;
    });
  };

  const handleRequestChatRevision = ({ vendorId, text }) => {
    setChatPreload({ vendorId, text });
    setActiveTab('chat');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header & Metrics Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30">
              Step 4: Vendor Segment
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-300 text-xs font-medium">Bidding Collaboration Hub</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Vendor Selection, Document Compliance & Pre-Bid Chat
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Invite vendors to lots/indents, control document exchanges, and resolve pre-bid queries in real time.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 min-w-[110px]">
            <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Invited Vendors</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{uniqueVendors.length}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 min-w-[120px]">
            <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Tracked Docs</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-white">{docStats.total}</span>
              {docStats.needsUpdate > 0 && (
                <span className="text-[10px] font-bold text-amber-300">({docStats.needsUpdate} need update)</span>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 min-w-[120px]">
            <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Query Window</p>
            <p className="text-xs font-bold text-emerald-300 mt-1">
              Active until {bidData.queryDeadline || '2026-11-12'}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Pill Tabs */}
      <div className="flex border-b border-slate-200 gap-2 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('selection')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'selection'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>1. Vendor Selection & Roster</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] ${
            activeTab === 'selection' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {uniqueVendors.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>2. Document Updation & Compliance</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] ${
            activeTab === 'documents' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {docStats.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>3. Pre-Bid Chat & Inquiries</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] ${
            activeTab === 'chat' ? 'bg-blue-700 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Live
          </span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="pt-1">
        {activeTab === 'selection' && (
          <VendorSelectionTab
            bidData={bidData}
            setBidData={setBidData}
            onSwitchTab={(targetTab) => setActiveTab(targetTab)}
          />
        )}

        {activeTab === 'documents' && (
          <VendorDocumentsTab
            bidData={bidData}
            setBidData={setBidData}
            onRequestChatRevision={handleRequestChatRevision}
          />
        )}

        {activeTab === 'chat' && (
          <VendorChatTab
            bidData={bidData}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            initialTargetVendorId={chatPreload.vendorId}
            initialText={chatPreload.text}
          />
        )}
      </div>
    </div>
  );
}
