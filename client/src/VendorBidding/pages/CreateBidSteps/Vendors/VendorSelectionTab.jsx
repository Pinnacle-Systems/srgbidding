import React, { useState, useMemo } from 'react';
import { useGetPartyQuery } from '../../../../redux/services/PartyMasterService';
import { getCommonParams } from '../../../../Utils/helper';

export default function VendorSelectionTab({ bidData, setBidData, onSwitchTab }) {
  const { companyId } = getCommonParams();
  const { data: partyResponse, isLoading: isLoadingParties } = useGetPartyQuery({
    params: { companyId }
  });

  const availableParties = useMemo(() => {
    const list = Array.isArray(partyResponse?.data)
      ? partyResponse.data
      : (Array.isArray(partyResponse) ? partyResponse : []);
    return list.map(p => ({
      id: p.id,
      name: p.name || p.partyName || `Vendor #${p.id}`,
      phone: p.contactMobile || p.phone || '-',
      city: p.city || p.address || 'India',
      category: p.PartyCategory?.name || 'Supplier'
    }));
  }, [partyResponse]);

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [modalTargetLotId, setModalTargetLotId] = useState(null);
  const [modalTargetIndentId, setModalTargetIndentId] = useState(null);
  const [modalSearch, setModalSearch] = useState('');
  const [customVendorName, setCustomVendorName] = useState('');

  const lots = bidData.lots || [];

  // Flatten all unique vendors across lots/indents with their assignments
  const vendorRoster = useMemo(() => {
    const map = new Map();
    lots.forEach(lot => {
      (lot.indents || []).forEach(indent => {
        (indent.vendors || []).forEach(v => {
          const vKey = String(v.id || v.vendorId || v.name);
          if (!map.has(vKey)) {
            map.set(vKey, {
              id: v.id || v.vendorId || vKey,
              name: v.name || v.label || `Vendor ${vKey}`,
              status: v.status || 'INVITED',
              assignedLots: new Set(),
              assignedIndents: [],
              documentsCount: (v.documents || []).length,
              pendingDocs: (v.documents || []).filter(d => d.status === 'Update Needed').length,
            });
          }
          const entry = map.get(vKey);
          entry.assignedLots.add(lot.name || `Lot ${lot.id}`);
          entry.assignedIndents.push({
            lotId: lot.id,
            lotName: lot.name,
            indentId: indent.id,
            docId: indent.docId || `IND-${indent.id}`,
            itemName: indent.item_name || indent.category || 'Item'
          });
          entry.documentsCount = Math.max(entry.documentsCount, (v.documents || []).length);
        });
      });
    });

    return Array.from(map.values()).map(v => ({
      ...v,
      assignedLotsList: Array.from(v.assignedLots)
    }));
  }, [lots]);

  const filteredRoster = vendorRoster.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedLotId === 'all') return true;
    return v.assignedIndents.some(i => String(i.lotId) === String(selectedLotId));
  });

  // Assign vendor to a lot (all indents in that lot) or a specific indent
  const handleAssignVendor = (vendorObj, lotId, indentId = null) => {
    setBidData(prev => ({
      ...prev,
      lots: (prev.lots || []).map(lot => {
        if (lotId && String(lot.id) !== String(lotId)) return lot;

        return {
          ...lot,
          indents: (lot.indents || []).map(ind => {
            if (indentId && String(ind.id) !== String(indentId)) return ind;

            const existingVendors = ind.vendors || [];
            const alreadyExists = existingVendors.some(
              v => String(v.id || v.vendorId) === String(vendorObj.id)
            );

            if (alreadyExists) return ind;

            return {
              ...ind,
              vendors: [
                ...existingVendors,
                {
                  id: vendorObj.id,
                  vendorId: vendorObj.id,
                  name: vendorObj.name,
                  label: vendorObj.name,
                  status: 'INVITED',
                  documents: [
                    {
                      id: `doc-${Date.now()}-1`,
                      title: 'Standard Quality Compliance',
                      category: 'Compliance',
                      fileName: 'quality_compliance.pdf',
                      fileSize: '1.2 MB',
                      version: '1.0',
                      status: 'Up to Date',
                      uploadDate: new Date().toISOString().slice(0, 10)
                    }
                  ]
                }
              ]
            };
          })
        };
      })
    }));
  };

  // Remove vendor from indent or entire lot
  const handleRemoveVendor = (vendorId, lotId = null, indentId = null) => {
    setBidData(prev => ({
      ...prev,
      lots: (prev.lots || []).map(lot => {
        if (lotId && String(lot.id) !== String(lotId)) return lot;

        return {
          ...lot,
          indents: (lot.indents || []).map(ind => {
            if (indentId && String(ind.id) !== String(indentId)) return ind;

            return {
              ...ind,
              vendors: (ind.vendors || []).filter(
                v => String(v.id || v.vendorId || v.name) !== String(vendorId)
              )
            };
          })
        };
      })
    }));
  };

  const openInviteModal = (lotId = null, indentId = null) => {
    setModalTargetLotId(lotId || (lots[0]?.id || null));
    setModalTargetIndentId(indentId);
    setModalSearch('');
    setCustomVendorName('');
    setIsInviteModalOpen(true);
  };

  const handleAddCustomVendor = () => {
    if (!customVendorName.trim() || !modalTargetLotId) return;
    const newVendor = {
      id: `v-${Date.now()}`,
      name: customVendorName.trim()
    };
    handleAssignVendor(newVendor, modalTargetLotId, modalTargetIndentId);
    setCustomVendorName('');
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search invited vendors..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Lot Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter by Lot:</label>
            <select
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Lots ({lots.length})</option>
              {lots.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} ({(l.indents || []).length} indents)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Invite Vendor Button */}
        <button
          type="button"
          onClick={() => openInviteModal()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Invite / Add Vendor</span>
        </button>
      </div>

      {/* Lot-by-Lot Vendor Matrix Card View */}
      <div className="space-y-4">
        {lots.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
            No lots configured yet. Please define Lots and assign Indents in Steps 2 & 3 first.
          </div>
        ) : (
          lots.map((lot, index) => {
            if (selectedLotId !== 'all' && String(lot.id) !== String(selectedLotId)) return null;

            const indents = lot.indents || [];
            // Unique vendors in this lot
            const lotVendorsMap = new Map();
            indents.forEach(ind => {
              (ind.vendors || []).forEach(v => {
                lotVendorsMap.set(String(v.id || v.vendorId || v.name), v);
              });
            });
            const lotVendors = Array.from(lotVendorsMap.values());

            return (
              <div
                key={lot.id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Lot Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Lot {index + 1}
                      </span>
                      <h4 className="font-bold text-slate-800 text-base">{lot.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {indents.length} Indent items • {lotVendors.length} Vendors Invited
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openInviteModal(lot.id, null)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Invite to Lot</span>
                    </button>
                  </div>
                </div>

                {/* Indents & Vendor Assignment List inside this Lot */}
                <div className="p-4 space-y-4">
                  {indents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No indents assigned to this lot yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-100 rounded-lg">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Indent / Item</th>
                            <th className="py-2.5 px-3 font-semibold">Specs & Qty</th>
                            <th className="py-2.5 px-3 font-semibold">Assigned Vendors ({lotVendors.length})</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {indents.map((indent) => {
                            const indentVendors = indent.vendors || [];

                            return (
                              <tr key={indent.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-3 align-top">
                                  <div className="font-mono font-bold text-slate-900">
                                    {indent.docId || indent.id}
                                  </div>
                                  <div className="font-semibold text-slate-700 text-xs mt-0.5">
                                    {indent.item_name || 'Indent Item'}
                                  </div>
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {indent.category || indent.indentType || 'General'}
                                  </span>
                                </td>

                                <td className="py-3 px-3 align-top text-slate-600 space-y-0.5">
                                  {indent.count && <div><span className="text-slate-400">Count:</span> {indent.count}</div>}
                                  {indent.blend && <div><span className="text-slate-400">Blend:</span> {indent.blend}</div>}
                                  {indent.shade && <div><span className="text-slate-400">Shade:</span> {indent.shade}</div>}
                                  <div className="font-bold text-slate-900 mt-1">
                                    Qty: {Number(indent.qty || 0).toLocaleString()} {indent.uom || 'kg'}
                                  </div>
                                </td>

                                <td className="py-3 px-3 align-top">
                                  {indentVendors.length === 0 ? (
                                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200 inline-block">
                                      ⚠️ No vendors assigned yet
                                    </span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {indentVendors.map(vendor => (
                                        <div
                                          key={vendor.id}
                                          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-2.5 py-1 rounded-full text-[11px] border border-slate-200 transition-colors"
                                        >
                                          <span className="font-medium">{vendor.name || vendor.label}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveVendor(vendor.id, lot.id, indent.id)}
                                            className="text-slate-400 hover:text-red-500 rounded-full p-0.5 transition-colors"
                                            title="Unassign this vendor from this indent"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>

                                <td className="py-3 px-3 align-top text-right space-x-1.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => openInviteModal(lot.id, indent.id)}
                                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50 rounded-md font-semibold text-[11px] transition-colors"
                                  >
                                    + Add Vendor
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onSwitchTab('documents')}
                                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 rounded-md font-medium text-[11px] transition-colors"
                                    title="Manage documents for this indent"
                                  >
                                    Docs
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onSwitchTab('chat')}
                                    className="px-2.5 py-1 bg-white border border-teal-200 hover:border-teal-300 text-teal-700 hover:bg-teal-50 rounded-md font-medium text-[11px] transition-colors"
                                    title="Open chat for this indent"
                                  >
                                    Chat
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invite Vendor Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Invite Vendor to Bid</h3>
                <p className="text-xs text-slate-500">
                  Target: {modalTargetIndentId ? 'Selected Indent Item' : 'Entire Lot'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Select Lot if not chosen */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Assign to Lot:</label>
                <select
                  value={modalTargetLotId || ''}
                  onChange={(e) => setModalTargetLotId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                >
                  {lots.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Search master vendors */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Search Approved Vendor Master:</label>
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Type vendor name, city or contact..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Master Vendor Results List */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 rounded-lg p-1 bg-slate-50/50">
                {isLoadingParties ? (
                  <p className="text-xs text-slate-400 p-3 text-center">Loading vendor master...</p>
                ) : availableParties.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center">No master vendors found.</p>
                ) : (
                  availableParties
                    .filter(p => p.name.toLowerCase().includes(modalSearch.toLowerCase()) || p.city.toLowerCase().includes(modalSearch.toLowerCase()))
                    .slice(0, 15)
                    .map(party => (
                      <div
                        key={party.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-300 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{party.name}</p>
                          <p className="text-[11px] text-slate-400">{party.city} • {party.phone}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleAssignVendor(party, modalTargetLotId, modalTargetIndentId);
                            setIsInviteModalOpen(false);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                        >
                          + Select
                        </button>
                      </div>
                    ))
                )}
              </div>

              {/* Or Quick Custom Add */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Or Add Custom Vendor / Mill Name:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customVendorName}
                    onChange={(e) => setCustomVendorName(e.target.value)}
                    placeholder="e.g. Sri Murugan Textiles"
                    className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomVendor}
                    disabled={!customVendorName.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
