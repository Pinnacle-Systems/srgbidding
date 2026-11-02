import React, { useState, useMemo } from 'react';
import { DEMO_COMMUNICATIONS_BID } from '../pages/Communications/BiddingCommunicationsHub';

export default function VendorBidsList({ onOpenWorkspace, currentVendorName = 'Kovai Yarns & Spinners' }) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample vendor invitations list
  const invitedBids = useMemo(() => {
    return [
      {
        id: DEMO_COMMUNICATIONS_BID.id,
        bidNo: DEMO_COMMUNICATIONS_BID.docId,
        title: DEMO_COMMUNICATIONS_BID.bidTitle,
        status: 'PUBLISHED',
        queryDeadline: '12 Nov 2026, 17:00 hrs',
        submissionDeadline: '20 Nov 2026, 17:00 hrs',
        daysLeft: 3,
        // The 2 indents Kovai Yarns is invited to
        assignedIndents: [
          {
            indentId: 101,
            lot: 'Lot 1',
            indentDocId: 'IND-YRN-001',
            itemName: '30s Combed Cotton Knitting Yarn',
            qty: '12,000 KGS',
            status: 'Pending Review',
            unreadMsgs: 1,
          },
          {
            indentId: 202,
            lot: 'Lot 2',
            indentDocId: 'IND-FBC-102',
            itemName: 'Rib 1x1 95/5 Cotton Lycra Tubular Fabric',
            qty: '10,000 KGS',
            status: 'Upload Needed',
            unreadMsgs: 0,
          }
        ],
        buyerCompany: 'SRG Apparels & Textiles Ltd',
        deliveryLocation: 'Tirupur & Perundurai Units',
      },
      {
        id: 102,
        bidNo: 'SRG/2026/BID/2',
        title: 'Autumn Organic Melange Yarn Sourcing',
        status: 'ACTIVE',
        queryDeadline: '18 Nov 2026, 18:00 hrs',
        submissionDeadline: '25 Nov 2026, 17:00 hrs',
        daysLeft: 9,
        assignedIndents: [
          {
            lot: 'Lot 1',
            indentDocId: 'IND-YRN-045',
            itemName: '30s Grey Melange 85/15 Organic Yarn',
            qty: '8,000 KGS',
            status: 'Approved',
            unreadMsgs: 0,
          }
        ],
        buyerCompany: 'SRG Apparels & Textiles Ltd',
        deliveryLocation: 'Coimbatore Unit 1',
      }
    ];
  }, []);

  const filteredBids = invitedBids.filter((bid) => {
    if (activeTab === 'Action Required') {
      return bid.assignedIndents.some((i) => i.status === 'Upload Needed' || i.unreadMsgs > 0);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        bid.bidNo.toLowerCase().includes(q) ||
        bid.title.toLowerCase().includes(q) ||
        bid.assignedIndents.some((i) => i.itemName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Vendor Portal
              </span>
              <span className="text-xs text-slate-400">Logged in as:</span>
              <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {currentVendorName}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1.5 tracking-tight">
              My Active Bid Invitations & Tender Items
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Review technical specifications, upload required compliance test certificates, clarify queries with SRG Procurement, and submit your sealed price quotes per assigned indent.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] uppercase text-blue-200 font-bold block">Assigned Items</span>
              <span className="text-xl font-extrabold text-white">3 Indents</span>
            </div>
            <div className="bg-amber-500/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-400/30 text-center">
              <span className="text-[10px] uppercase text-amber-300 font-bold block">Action Needed</span>
              <span className="text-xl font-extrabold text-amber-300">1 Document</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5">
          {['All', 'Action Required', 'Closing Soon'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Search by Bid No, Title, Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
      </div>

      {/* Bids List Cards */}
      <div className="space-y-4">
        {filteredBids.map((bid) => (
          <div
            key={bid.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 space-y-4"
          >
            {/* Bid Card Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200">
                    {bid.bidNo}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {bid.status}
                  </span>
                  <span className="text-xs text-slate-400">• Buyer: <strong className="text-slate-700">{bid.buyerCompany}</strong></span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {bid.title}
                </h3>
              </div>

              {/* Deadlines */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Query Deadline</span>
                  <span className="text-xs font-bold text-amber-700">{bid.queryDeadline}</span>
                </div>
                <div className="border-l border-slate-200 pl-3">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Submission Closes</span>
                  <span className="text-xs font-bold text-slate-900">{bid.submissionDeadline}</span>
                </div>
              </div>
            </div>

            {/* Assigned Indents Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Assigned Items ({bid.assignedIndents.length} Indents)
                </span>
                <span className="text-[11px] text-slate-500">
                  You are participating exclusively in the following items:
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bid.assignedIndents.map((indent, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenWorkspace(bid, indent.indentId, 'quote')}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-[11px] font-bold text-slate-700">
                          {indent.lot} &gt; {indent.indentDocId}
                        </span>
                        
                        {/* Status Chip */}
                        {indent.status === 'Upload Needed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            Upload TDS Required
                          </span>
                        ) : indent.status === 'Pending Review' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Documents Under Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Compliant & Ready
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {indent.itemName}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Requirement: <strong className="text-slate-800 font-semibold">{indent.qty}</strong> • Delivery: {bid.deliveryLocation}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                      {indent.unreadMsgs > 0 ? (
                        <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          1 New Reply from Buyer
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">All queries caught up</span>
                      )}

                      <span className="text-xs text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>₹ Submit Quote &amp; Docs &rarr;</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">
                🔒 Sealed Bidding: Your price quote and documents remain confidential.
              </span>

              <button
                type="button"
                onClick={() => onOpenWorkspace(bid, bid.assignedIndents[0]?.indentId, 'quote')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <span>Enter Bid Workspace &amp; Submit Quotation</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
