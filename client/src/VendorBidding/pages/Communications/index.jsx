import React, { useState, useMemo, useEffect } from 'react';
import { useGetBidsQuery } from '../../../redux/uniformService/BiddingService';
import BiddingCommunicationsHub, { DEMO_COMMUNICATIONS_BID } from './BiddingCommunicationsHub';

export default function BiddingCommunicationsPage({
  initialBidId = null,
  onBackToBids,
}) {
  const { data: bidsResponse, isLoading: isLoadingBids, refetch } = useGetBidsQuery({ params: {} });
  const bidsList = bidsResponse?.data || [];

  // Determine active selected bid
  const [selectedBidId, setSelectedBidId] = useState(initialBidId || null);

  // If initialBidId prop changes, update selection
  useEffect(() => {
    if (initialBidId) {
      setSelectedBidId(initialBidId);
    }
  }, [initialBidId]);

  // Set default to first published bid or demo bid if none selected
  useEffect(() => {
    if (!selectedBidId && bidsList.length > 0) {
      const activeBid = bidsList.find((b) => b.status?.toUpperCase() === 'PUBLISHED') || bidsList[0];
      if (activeBid) {
        setSelectedBidId(activeBid.id);
      }
    }
  }, [bidsList, selectedBidId]);

  // Find the selected bid in the fetched list
  const activeBidData = useMemo(() => {
    if (!selectedBidId) return DEMO_COMMUNICATIONS_BID;

    const found = bidsList.find((b) => String(b.id) === String(selectedBidId));
    if (!found) return DEMO_COMMUNICATIONS_BID;

    // Transform raw server model if needed to match lots -> indents -> vendors shape
    if (Array.isArray(found.BiddingLots) && found.BiddingLots.length > 0) {
      return {
        ...found,
        lots: found.BiddingLots.map((lot) => ({
          id: lot.id,
          lotNumber: lot.lotNumber,
          name: lot.name || `Lot ${lot.lotNumber}`,
          indents: (lot.BiddingIndent || []).map((ind) => {
            const custom = ind.customData || {};
            return {
              id: ind.id,
              docId: custom.docId || ind.indentId || `IND-${ind.id}`,
              item_name: custom.item_name || ind.Item?.name || 'Item',
              category: ind.indentType || custom.category || 'General',
              department: custom.department || 'Knitting',
              qty: ind.qty || 0,
              uom: ind.Uom?.name || 'KGS',
              requiredBy: custom.requiredBy || '2026-11-30',
              commonDocuments: custom.commonDocuments || [],
              specs: custom.specs || {},
              vendors: (ind.BiddingIndentvendors || []).map((v) => ({
                id: v.vendorId || v.id,
                vendorId: v.vendorId || v.id,
                name: v.Vendor?.name || `Vendor #${v.vendorId || v.id}`,
                status: v.status || 'INVITED',
                documents: (custom.vendorDocuments || []).find((vd) => vd.vendorId === (v.vendorId || v.id))?.documents || [],
              })),
            };
          }),
        })),
      };
    }

    return found.lots && found.lots.length > 0 ? found : DEMO_COMMUNICATIONS_BID;
  }, [bidsList, selectedBidId]);

  return (
    <div className="p-4 space-y-4 max-w-full animate-in fade-in duration-300">
      
      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL: Switcher & Quick Navigation
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        
        {/* Left: Active Bid Selector Dropdown */}
        <div className="flex items-center gap-3">
          {onBackToBids && (
            <button
              onClick={onBackToBids}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Bids</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Active Bid:
            </span>

            <select
              value={selectedBidId || 'demo'}
              onChange={(e) => setSelectedBidId(e.target.value === 'demo' ? null : e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[280px]"
            >
              <option value="demo">
                ⭐ Demo: SRG/2026/BID/1 (3 Lots, 5 Indents, 19 Vendors)
              </option>

              {bidsList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.docId || b.bidNo || `BID #${b.id}`} — {b.name || 'Untitled Bid'} ({b.status || 'DRAFT'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Refresh & Help Tip */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh Bids & Activity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Auto-syncs live pre-bid chats & document uploads
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          TRI-PANE COMMUNICATIONS HUB
         ───────────────────────────────────────────────────────────── */}
      <BiddingCommunicationsHub
        bidData={activeBidData}
        onBack={onBackToBids}
      />

    </div>
  );
}
