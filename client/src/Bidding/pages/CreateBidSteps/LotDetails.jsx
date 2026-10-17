import React, { useState } from 'react';

export default function Lots({ onBack, onNext, bidData, setBidData }) {
  const [newLotName, setNewLotName] = useState("");
  const [viewMode, setViewMode] = useState("card"); // 'list' | 'card'
  const [isAdding, setIsAdding] = useState(false);

  const addLot = () => {
    if (!newLotName.trim()) return;
    setBidData(prev => ({
      ...prev,
      lots: [...prev.lots, { id: Date.now(), name: newLotName, indents: [] }]
    }));
    setNewLotName("");
    setIsAdding(false);
  };

  const removeLot = (id) => {
    setBidData(prev => ({
      ...prev,
      lots: prev.lots.filter(l => l.id !== id)
    }));
  };

  return (
    <div className="space-y-2">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-md font-semibold text-slate-800">Define Lots for this Bid</h3>
          <p className="text-sm text-slate-500">A bid can have multiple lots.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">

            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded transition-colors ${viewMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Card View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 font-medium text-sm flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Lot
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="flex flex-col sm:flex-row gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300 items-center">
          <input
            type="text"
            value={newLotName}
            onChange={(e) => setNewLotName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLot()}
            placeholder="Enter lot name (e.g. Lot 1 - Yarn)"
            className="flex-1 w-full bg-white border border-slate-300 text-slate-700 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={addLot} className="flex-1 sm:flex-none px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">Save</button>
            <button onClick={() => setIsAdding(false)} className="flex-1 sm:flex-none px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {bidData.lots.length === 0 && !isAdding && (
        <div className="text-sm text-slate-400 py-12 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          </div>
          No lots added yet.<br />Click "Add Lot" at the top right to create one.
        </div>
      )}

      {bidData.lots.length > 0 && (
        <div className={viewMode === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" : "space-y-3"}>
          {bidData.lots.map((lot, index) => (
            <div
              key={lot.id}
              className={`border border-slate-200 rounded-xl bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md ${viewMode === 'card' ? 'p-5 flex flex-col gap-4' : 'p-4 flex justify-between items-center'}`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lot {index + 1}</span>
                <span className="font-semibold text-slate-800 text-base">{lot.name}</span>
              </div>

              <div className={`flex items-center ${viewMode === 'card' ? 'justify-between mt-auto pt-4 border-t border-slate-100' : 'gap-4'}`}>
                {viewMode === 'card' && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium border border-slate-200">
                    {lot.indents?.length || 0} Indents assigned
                  </span>
                )}
                <button
                  onClick={() => removeLot(lot.id)}
                  className="text-red-500 text-sm font-medium hover:text-red-700 hover:underline flex items-center gap-1.5 p-1 rounded-md transition-colors hover:bg-red-50"
                  title="Remove Lot"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  {viewMode === 'card' ? 'Remove' : ''}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
