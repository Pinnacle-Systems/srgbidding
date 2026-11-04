import { useBiddingAuth } from '../../../Bidding/context/BiddingAuthContext';
import { getCommonParams } from '../../../Utils/helper';
import React, { useMemo } from 'react';

export default function ReviewAndPublish({ onBack, bidData, setBidData }) {
  const { role } = useBiddingAuth?.() || {};
  const { userRole, partyId, partyType } = getCommonParams();
  const isVendor = role === 'Vendor' || partyType?.toUpperCase() === 'VENDOR' || userRole?.toLowerCase() === 'vendor' || Boolean(!userRole && partyId);

  const lots = bidData.lots || [];

  const totalLots = lots.length;
  const totalIndents = lots.reduce((acc, lot) => acc + (lot.indents?.length || 0), 0);

  // Extract unique vendors across all lots
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

  const queryDeadline = bidData.queryDeadline || bidData.terms?.queryDeadline || '2026-11-12';
  const submissionDeadline = bidData.submissionDeadline || bidData.terms?.submissionDeadline || '2026-11-20';
  const termsTemplate = bidData.termsTemplate || bidData.terms?.termsTemplate || 'Standard Yarn Terms';

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{isVendor ? "Review Bid" : "Review & Publish Bid"}</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {isVendor
            ? "Please audit all bid details, lot groupings, indent specifications, and invited vendor documents."
            : "Please audit all bid details, lot groupings, indent specifications, and invited vendor documents before publishing."}
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Configured Lots</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalLots}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Assigned Indents</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalIndents}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Invited Vendors</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{uniqueVendors.length}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Tracked Documents</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{docStats.total}</span>
            {docStats.needsUpdate > 0 && (
              <span className="text-[11px] font-bold text-amber-600">({docStats.needsUpdate} need update)</span>
            )}
          </div>
        </div>
      </div>

      {/* Bid Details Review Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
          1. Bid Configuration & Timelines
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Bid Title / Description:</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{bidData.bidTitle || 'Untitled Bid'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Bid / Doc Number:</span>
            <p className="font-mono font-semibold text-slate-800 text-sm mt-0.5">{bidData.docId || bidData.bidNo || 'Auto Generated'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Terms Template:</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{termsTemplate}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Pre-Bid Query Deadline:</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{queryDeadline}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Bid Submission Deadline:</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{submissionDeadline}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Status:</span>
            <p className="mt-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Ready to Publish
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Lots & Vendors Audit Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
          2. Lots & Invited Vendors Audit
        </h4>

        {lots.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No lots configured.</p>
        ) : (
          <div className="space-y-3">
            {lots.map((lot, idx) => {
              const lotIndents = lot.indents || [];
              const lotVendorSet = new Set();
              lotIndents.forEach(ind => {
                (ind.vendors || []).forEach(v => lotVendorSet.add(v.name || v.label));
              });
              const lotVendorsList = Array.from(lotVendorSet);

              return (
                <div key={lot.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/60 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-2">
                    <span>Lot {idx + 1}: {lot.name}</span>
                    <span className="text-slate-500 font-normal">
                      {lotIndents.length} Indents • {lotVendorsList.length} Vendors
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-slate-400 font-medium mr-1">Vendors:</span>
                    {lotVendorsList.length === 0 ? (
                      <span className="text-amber-600 font-medium">No vendors invited yet</span>
                    ) : (
                      lotVendorsList.map((vName, vIdx) => (
                        <span
                          key={vIdx}
                          className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium"
                        >
                          {vName}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Readiness Checklist */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
        <h5 className="font-bold text-emerald-950 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{isVendor ? "Bid Summary & Readiness" : "Pre-Publish Readiness Checklist"}</span>
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>Bid parameters & deadlines configured</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{totalLots} lots defined with material specifications</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{uniqueVendors.length} vendors invited to bid</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>Pre-bid query channel and document repository active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
