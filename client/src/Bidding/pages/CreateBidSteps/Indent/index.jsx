import React, { useState, useEffect } from 'react';
import { useGetInternalIndentItemsQuery } from '../../../../redux/uniformService/InternalIndent';
import Modal from '../../../../UiComponents/Modal';
import { DEFAULT_DEMO_LOTS } from './demoLots';
import LotRail from './LotRail';
import LotWorkspace from './LotWorkspace';
import { countUpdateNeeded, getLotVendors } from './indentHelpers';
import IndentSelection from './IndentSelection';
import IndentChatDrawer from './IndentChatDrawer';

export { DEFAULT_DEMO_LOTS } from './demoLots';

export default function Indents({ onBack, onNext, bidData, setBidData }) {
  const { data: internalIndentData } = useGetInternalIndentItemsQuery({
    params: { status: "PUBLISHED" },
  });




  // Automatically initialize with demo lots if no lots exist yet
  // useEffect(() => {
  //   if (!bidData.lots || bidData.lots.length === 0) {
  //     setBidData(prev => ({
  //       ...prev,
  //       lots: DEFAULT_DEMO_LOTS
  //     }));
  //   }
  // }, []);

  console.log(bidData, "bidData")

  const [activeLotId, setActiveLotId] = useState(null);
  const [selectedLotId, setSelectedLotId] = useState(null); // null → first lot

  // Chat & Document drawer state
  const [chatDrawerState, setChatDrawerState] = useState({
    isOpen: false,
    indent: null,
    initialTab: 'docs', // 'chat' | 'docs'
  });

  // Conversation storage: { [`${indentId}_${vendorId}`]: [ { sender: 'user', senderName: 'Me', text: '...', timestamp: '12:30' } ] }
  const [chatMessages, setChatMessages] = useState({});

  const openModal = (lot) => {
    setActiveLotId(lot.id);
  };

  const closeModal = () => {
    setActiveLotId(null);
  };

  const normalizeIndent = (ind) => ({
    id: ind.id,
    docId: ind.Indent?.docId || ind.docId || `IND-${ind.id}`,
    category: ind.Indent?.indentType || ind.category || 'General',
    department: typeof ind.Indent?.Department === 'object'
      ? ind.Indent?.Department?.name
      : (ind.department || 'General'),
    item_name: ind.Yarn?.name || ind.Fabric?.name || ind.Item?.name || (typeof ind.item_name === 'object' ? ind.item_name?.name : ind.item_name) || 'Item',
    count: ind.Counts?.name || ind.count || '-',
    blend: ind.YarnBlend?.name || ind.blend || '-',
    shade: ind.Color?.name || ind.shade || '-',
    qty: Number(ind.qty || 0),
    uom: typeof ind.Uom === 'object' ? ind.Uom?.name : (ind.uom || 'kg'),
    requiredBy: ind.requiredBy || ind.Indent?.requiredDate || '-',
    commonDocuments: ind.commonDocuments || [],
    yarnId: ind.yarnId || ind.Yarn?.id || null,
    yarnBlendId: ind.yarnBlendId || ind.YarnBlend?.id || null,
    countsId: ind.countsId || ind.Counts?.id || null,
    colorId: ind.colorId || ind.Color?.id || null,
    uomId: ind.uomId || ind.Uom?.id || null,
    fabricId: ind.fabricId || ind.Fabric?.id || null,
    gsmId: ind.gsmId || ind.Gsm?.id || null,
    itemId: ind.itemId || ind.Item?.id || null,
    width: ind.width || '',
    make: ind.make || '',
    machine: ind.machine || '',
    partNo: ind.partNo || '',
    spec: ind.spec || '',
    ply: ind.ply || '',
    ciCas: ind.ciCas || ind.code || '',
    strength: ind.strength || '',
    hazard: ind.hazard || '',
    customData: ind.customData || {},
    vendors: (ind.vendors || ind.IndentItemVendors || []).map(v => ({
      id: v.vendorId !== undefined ? v.vendorId : (v.value !== undefined ? v.value : v.id),
      name: v.name || v.label || v.Vendor?.name || `Vendor ${v.vendorId || v.value || v.id}`,
      label: v.label || v.name || v.Vendor?.name || `Vendor ${v.vendorId || v.value || v.id}`,
      documents: v.documents || []
    }))
  });

  const assignSelected = (selectedObjects) => {
    // 1. Normalize every selected indent so docId, item_name, uom are flat & clean
    console.log(selectedObjects, "selectedObjects")
    const enriched = selectedObjects.map(ind => normalizeIndent(ind));

    setBidData(prev => ({
      ...prev,
      lots: prev.lots.map(lot =>
        lot.id === activeLotId ? { ...lot, indents: enriched } : lot
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

  const updateIndent = (lotId, indentId, updatedFields) => {
    setBidData(prev => ({
      ...prev,
      lots: (prev.lots || []).map(lot =>
        lot.id === lotId
          ? {
            ...lot,
            indents: (lot.indents || []).map(ind =>
              ind.id === indentId ? { ...ind, ...updatedFields } : ind
            )
          }
          : lot
      )
    }));
  };

  const handleOpenDrawer = (indent, tab = 'docs') => {
    setChatDrawerState({
      isOpen: true,
      indent,
      initialTab: tab,
    });
  };

  const handleOpenChat = (indent) => {
    handleOpenDrawer(indent, 'chat');
  };

  const handleCloseChat = () => {
    setChatDrawerState({
      isOpen: false,
      indent: null,
      initialTab: 'docs',
    });
  };

  const handleSendMessage = ({ indentId, vendorId, text, sendToAll, allVendorIds }) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      sender: 'user',
      senderName: 'You',
      text,
      timestamp: timeStr,
    };

    setChatMessages(prev => {
      const next = { ...prev };
      if (sendToAll && allVendorIds) {
        allVendorIds.forEach(vId => {
          const key = `${indentId}_${vId}`;
          next[key] = [...(next[key] || []), newMsg];
        });
      } else {
        const key = `${indentId}_${vendorId}`;
        next[key] = [...(next[key] || []), newMsg];
      }
      return next;
    });
  };

  const handleUpdateDocuments = ({ indentId, vendorId, documents, commonDocuments }) => {
    setBidData(prev => ({
      ...prev,
      lots: (prev.lots || []).map(lot => ({
        ...lot,
        indents: (lot.indents || []).map(ind => {
          if (ind.id !== indentId) return ind;

          if (vendorId === 'common') {
            return { ...ind, commonDocuments };
          }

          return {
            ...ind,
            commonDocuments: commonDocuments !== undefined ? commonDocuments : ind.commonDocuments,
            vendors: (ind.vendors || []).map(v => {
              if (v.id === vendorId) {
                return { ...v, documents };
              }
              return v;
            })
          };
        })
      }))
    }));

    // Real-time update in open drawer
    setChatDrawerState(prev => {
      if (!prev.indent || prev.indent.id !== indentId) return prev;
      if (vendorId === 'common') {
        return { ...prev, indent: { ...prev.indent, commonDocuments } };
      }
      return {
        ...prev,
        indent: {
          ...prev.indent,
          commonDocuments: commonDocuments !== undefined ? commonDocuments : prev.indent.commonDocuments,
          vendors: (prev.indent.vendors || []).map(v =>
            v.id === vendorId ? { ...v, documents } : v
          )
        }
      };
    });
  };

  const activeLot = (bidData.lots || []).find(l => l.id === activeLotId);
  const dataSource = internalIndentData?.data || [];

  // Lot shown in the workspace (falls back to the first lot, e.g. after a lot is removed)
  const lots = bidData.lots || [];
  const selectedLot = lots.find(l => l.id === selectedLotId) || lots[0];
  const selectedLotIndex = selectedLot ? lots.indexOf(selectedLot) : -1;

  // Summary line across all lots
  const allIndents = lots.flatMap(l => l.indents || []);
  const totalVendors = getLotVendors(allIndents).length;
  const totalUpdateNeeded = countUpdateNeeded(allIndents);

  return (
    <>
      {/* Indent Selection Modal */}
      <Modal
        isOpen={Boolean(activeLotId)}
        onClose={closeModal}
        widthClass="w-[96%] h-[94%] !p-2"
      >
        <IndentSelection
          matches={dataSource}
          title={activeLot?.name}
          initialSelected={activeLot?.indents || []}
          onConfirm={assignSelected}
          onClose={closeModal}
          allAssignedIds={
            (bidData.lots || [])
              .filter(l => l.id !== activeLotId)
              .flatMap(l => (l.indents || []).map(i => i.id))
          }
        />
      </Modal>

      {/* Unified Slide-over Vendor Collaboration Drawer (Chat + Documents) */}
      <IndentChatDrawer
        isOpen={chatDrawerState.isOpen}
        indent={chatDrawerState.indent}
        initialTab={chatDrawerState.initialTab}
        onClose={handleCloseChat}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        onUpdateDocuments={handleUpdateDocuments}
      />

      <div className="h-full min-h-[420px] flex flex-col gap-2">
        {(!selectedLot) ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm font-medium text-slate-600">No lots available.</p>
            <button
              onClick={() => setBidData(prev => ({ ...prev, lots: DEFAULT_DEMO_LOTS }))}
              className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors"
            >
              Load Demo Lots
            </button>
          </div>
        ) : (
          <>
            {/* Summary line */}
            {/* <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-xs text-slate-600">
                <b className="font-semibold text-slate-900">{lots.length}</b> lots ·{' '}
                <b className="font-semibold text-slate-900">{allIndents.length}</b> indents ·{' '}
                <b className="font-semibold text-slate-900">{totalVendors}</b> vendors
              </p>
              {totalUpdateNeeded > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-medium">
                  <span aria-hidden="true">▲</span>
                  {totalUpdateNeeded} {totalUpdateNeeded === 1 ? 'document needs' : 'documents need'} update
                </span>
              )}
            </div> */}

            {/* Lot list (left) + selected lot workspace (right) */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3">
              <LotRail
                lots={lots}
                selectedLotId={selectedLot.id}
                onSelect={setSelectedLotId}
              />
              <LotWorkspace
                key={selectedLot.id}
                lot={selectedLot}
                lotIndex={selectedLotIndex}
                onOpenAssignModal={openModal}
                onOpenChat={handleOpenChat}
                onOpenDrawer={handleOpenDrawer}
                onRemoveIndent={removeIndent}
                onUpdateIndent={updateIndent}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
