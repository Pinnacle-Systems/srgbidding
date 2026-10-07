import React from 'react';

export default function BidDetails({ onNext, bidData, setBidData }) {
  // Helper to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBidData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const totalLots = bidData.lots?.length || 0;
  const totalIndents = bidData.lots?.reduce((sum, lot) => sum + (lot.indents?.length || 0), 0) || 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Bid No.</label>
          <input
            type="text"
            name="bidNo"
            value={bidData.bidNo || ''}
            onChange={handleChange}
            placeholder="e.g. BID-2026-001"
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow"
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Bid Date</label>
          <input
            type="date"
            name="bidDate"
            value={bidData.bidDate || ''}
            onChange={handleChange}
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Bid Type</label>
          <select 
            name="bidType"
            value={bidData.bidType || 'Sealed Bid'}
            onChange={handleChange}
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow appearance-none"
          >
            <option value="Sealed Bid">Sealed Bid</option>
            <option value="Live Auction">Live Auction</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Bid Title</label>
          <input
            type="text"
            name="bidTitle"
            value={bidData.bidTitle || ''}
            onChange={handleChange}
            placeholder="e.g. Q4 Cotton Yarn Supply"
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow"
          />
        </div>

        <div className="md:col-span-4 mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Bid Overall Summary</label>
          <div className="flex gap-4">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Lots</p>
                <p className="text-2xl font-bold text-slate-800">{totalLots}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Indents</p>
                <p className="text-2xl font-bold text-slate-800">{totalIndents}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
