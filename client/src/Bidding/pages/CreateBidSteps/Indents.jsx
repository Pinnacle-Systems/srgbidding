import React, { useState } from 'react';
import { useGetInternalIndentIssueQuery } from '../../../redux/uniformService/InternalIndent';

const mockIndents = [
  { id: 'IND-1043', type: 'Yarn', typeColor: 'bg-amber-100 text-amber-800', desc: '40s · CVC 60/40 · Single · Navy, 2500 kg' },
  { id: 'IND-1061', type: 'Spares & Dyes', typeColor: 'bg-rose-200 text-rose-900', desc: "SP-884 · Fong's · Circulation pump seal kit, 6 set" },
  { id: 'IND-1062', type: 'Yarn', typeColor: 'bg-amber-100 text-amber-800', desc: '24s · Polyester · Single · Raw White, 3000 kg' },
  { id: 'IND-1042', type: 'Yarn', typeColor: 'bg-amber-100 text-amber-800', desc: '30s · 100% Cotton · Single · Optical White, 4000 kg' },
  { id: 'IND-1051', type: 'Fabric', typeColor: 'bg-teal-100 text-teal-800', desc: 'Single Jersey · 180 · 66" · Black · Bio-wash, 1800 kg' }
];



export default function Indents({ onBack, onNext, bidData, setBidData }) {


  const {
    data: internalIndentData,
    isFetching,
    isLoading,
  } = useGetInternalIndentIssueQuery({
    params: {},
  });

  console.log(internalIndentData, "internalIndentData")

  const [activeLotId, setActiveLotId] = useState(null);
  const [modalSelections, setModalSelections] = useState([]);
  const [viewMode, setViewMode] = useState("list");

  const openModal = (lot) => {
    setActiveLotId(lot.id);
    setModalSelections(lot.indents.map(i => i.id));
  };

  const closeModal = () => {
    setActiveLotId(null);
    setModalSelections([]);
  };

  const toggleSelection = (indentId) => {
    setModalSelections(prev =>
      prev.includes(indentId) ? prev.filter(id => id !== indentId) : [...prev, indentId]
    );
  };

  const assignSelected = () => {
    const dataSource = internalIndentData?.data || mockIndents;
    const selectedObjects = dataSource.filter(ind => modalSelections.includes(ind.id));
    setBidData(prev => ({
      ...prev,
      lots: prev.lots.map(lot =>
        lot.id === activeLotId ? { ...lot, indents: selectedObjects } : lot
      )
    }));
    closeModal();
  };

  const removeIndent = (lotId, indentId) => {
    setBidData(prev => ({
      ...prev,
      lots: prev.lots.map(lot =>
        lot.id === lotId ? { ...lot, indents: lot.indents.filter(i => i.id !== indentId) } : lot
      )
    }));
  };

  const activeLot = bidData.lots.find(l => l.id === activeLotId);
  const dataSource = internalIndentData?.data || mockIndents;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-md font-semibold text-slate-800">Assign Indents to Lots</h3>
          <p className="text-sm text-slate-500">Select a lot and assign multiple indents to it.</p>
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
        </div>
      </div>

      {bidData.lots.length === 0 ? (
        <div className="p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm">
          Please go back and create at least one lot first.
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {bidData.lots.map((lot, index) => (
            <div key={lot.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-slate-800">Lot {index + 1}: {lot.name}</span>
                <button
                  onClick={() => openModal(lot)}
                  className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                >
                  + Assign Indents
                </button>
              </div>

              <div className="p-4">
                {lot.indents && lot.indents.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      lot.indents.reduce((acc, indent) => {
                        const type = indent.indentType || indent.type || 'Other';
                        if (!acc[type]) acc[type] = [];
                        acc[type].push(indent);
                        return acc;
                      }, {})
                    ).map(([type, group]) => {
                      // Determine styles based on type
                      let bgClass = "bg-slate-100";
                      let textClass = "text-slate-800";
                      let borderClass = "border-slate-200";

                      if (type.includes("Yarn")) {
                        bgClass = "bg-amber-100/60";
                        textClass = "text-amber-900";
                        borderClass = "border-amber-200";
                      } else if (type.includes("Spares")) {
                        bgClass = "bg-rose-100/80";
                        textClass = "text-rose-900";
                        borderClass = "border-rose-200";
                      } else if (type.includes("Fabric")) {
                        bgClass = "bg-teal-100/60";
                        textClass = "text-teal-900";
                        borderClass = "border-teal-200";
                      }

                      return (
                        <div key={type} className={`border ${borderClass} rounded-lg overflow-hidden`}>
                          <div className={`${bgClass} px-4 py-2.5 flex items-center gap-2 border-b ${borderClass}`}>
                            <div className={`w-2 h-2 rounded-full ${textClass.replace('text-', 'bg-')}`}></div>
                            <span className={`font-bold text-sm ${textClass}`}>{type} Indents ({group.length})</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className={`bg-slate-50/50 text-slate-500 border-b ${borderClass} text-xs`}>
                                <tr>
                                  <th className="px-4 py-2 font-medium">Indent</th>
                                  {type.includes("Yarn") ? (
                                    <>
                                      <th className="px-4 py-2 font-medium">Count</th>
                                      <th className="px-4 py-2 font-medium">Composition</th>
                                      <th className="px-4 py-2 font-medium">Ply</th>
                                      <th className="px-4 py-2 font-medium">Shade</th>
                                      <th className="px-4 py-2 font-medium text-right">Qty</th>
                                      <th className="px-4 py-2 font-medium">UOM</th>
                                    </>
                                  ) : type.includes("Spares") ? (
                                    <>
                                      <th className="px-4 py-2 font-medium">Part / Dye code</th>
                                      <th className="px-4 py-2 font-medium">Brand</th>
                                      <th className="px-4 py-2 font-medium">Specification</th>
                                      <th className="px-4 py-2 font-medium text-right">Qty</th>
                                      <th className="px-4 py-2 font-medium">UOM</th>
                                    </>
                                  ) : (
                                    <th className="px-4 py-2 font-medium">Details</th>
                                  )}
                                  <th className="px-4 py-2 font-medium text-right"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {group.map((indent) => {
                                  const displayId = indent.docId || indent.id;
                                  const rawDesc = indent.remarks || indent.desc || '';

                                  // Mock parser for the screenshot format
                                  let cols = [];
                                  if (type.includes("Yarn") && rawDesc.includes('·')) {
                                    const parts = rawDesc.split('·').map(p => p.trim());
                                    const lastParts = parts[parts.length - 1].split(',').map(p => p.trim());
                                    const qtyUom = lastParts[1] ? lastParts[1].split(' ') : ['-', '-'];
                                    cols = [
                                      <td key="1" className="px-4 py-2.5">{parts[0]}</td>,
                                      <td key="2" className="px-4 py-2.5">{parts[1]}</td>,
                                      <td key="3" className="px-4 py-2.5">{parts[2]}</td>,
                                      <td key="4" className="px-4 py-2.5">{lastParts[0]}</td>,
                                      <td key="5" className="px-4 py-2.5 text-right">{qtyUom[0]}</td>,
                                      <td key="6" className="px-4 py-2.5">{qtyUom[1]}</td>
                                    ];
                                  } else if (type.includes("Spares") && rawDesc.includes('·')) {
                                    const parts = rawDesc.split('·').map(p => p.trim());
                                    const lastParts = parts[parts.length - 1].split(',').map(p => p.trim());
                                    const qtyUom = lastParts[1] ? lastParts[1].trim().split(' ') : ['-', '-'];
                                    cols = [
                                      <td key="1" className="px-4 py-2.5">{parts[0]}</td>,
                                      <td key="2" className="px-4 py-2.5">{parts[1]}</td>,
                                      <td key="3" className="px-4 py-2.5">{lastParts[0]}</td>,
                                      <td key="4" className="px-4 py-2.5 text-right">{qtyUom[0]}</td>,
                                      <td key="5" className="px-4 py-2.5">{qtyUom[1]}</td>
                                    ];
                                  } else {
                                    cols = [<td key="1" className="px-4 py-2.5 text-slate-500">{rawDesc}</td>];
                                  }

                                  return (
                                    <tr key={indent.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-4 py-2.5 font-medium text-slate-900">{displayId}</td>
                                      {cols}
                                      <td className="px-4 py-2.5 text-right">
                                        <button
                                          onClick={() => removeIndent(lot.id, indent.id)}
                                          className="text-slate-400 hover:text-red-500 transition-colors text-xs font-medium"
                                          title="Remove Indent"
                                        >
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 py-6 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                    No indents assigned to this lot yet.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bidData.lots.map((lot, index) => {
            const totalIndents = lot.indents ? lot.indents.length : 0;
            const typeSummary = lot.indents ? lot.indents.reduce((acc, indent) => {
              const type = indent.indentType || indent.type || 'Other';
              if (!acc[type]) acc[type] = 0;
              acc[type]++;
              return acc;
            }, {}) : {};

            return (
              <div key={lot.id} className="border border-slate-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Lot {index + 1}: {lot.name}</h4>
                  <p className="text-sm text-slate-500 mb-4">Total Indents: <span className="font-semibold text-slate-700">{totalIndents}</span></p>

                  {totalIndents > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(typeSummary).map(([type, count]) => {
                        let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
                        if (type.includes("Yarn")) badgeClass = "bg-amber-50 text-amber-800 border-amber-200";
                        if (type.includes("Spares")) badgeClass = "bg-rose-50 text-rose-800 border-rose-200";
                        if (type.includes("Fabric")) badgeClass = "bg-teal-50 text-teal-800 border-teal-200";

                        return (
                          <span key={type} className={`border text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
                            {type}: {count}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => openModal(lot)}
                  className="w-full text-center text-sm text-blue-600 font-medium border border-blue-200 hover:bg-blue-50 py-2 rounded-lg transition-colors mt-2"
                >
                  {totalIndents > 0 ? "Manage Indents" : "+ Assign Indents"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Overlay */}
      {activeLotId && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Assign indents to {activeLot?.name}</h2>
              <p className="text-sm text-slate-500">Select from existing indent requests</p>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {isLoading || isFetching ? (
                <div className="py-12 flex justify-center text-slate-400">Loading indents...</div>
              ) : (
                <div className="space-y-3">
                  {dataSource.map((indent) => {
                    const isSelected = modalSelections.includes(indent.id);
                    const displayId = indent.docId || indent.id;
                    const type = indent.indentType || indent.type || 'Indent';
                    const desc = indent.remarks || indent.desc || 'No description available';
                    const typeColor = 'bg-slate-100 text-slate-700';

                    return (
                      <div
                        key={indent.id}
                        onClick={() => toggleSelection(indent.id)}
                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-slate-800 bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'}`}
                      >
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }} // Handled by div click
                            className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-base">{displayId}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor}`}>
                              {type}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={assignSelected}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors shadow-sm"
              >
                Assign selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
