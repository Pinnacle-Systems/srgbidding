import React, { useState, useEffect } from 'react';
import { useGetInternalIndentItemsQuery } from '../../../../redux/uniformService/InternalIndent';
import Modal from '../../../../UiComponents/Modal';
import { DEFAULT_DEMO_LOTS } from './demoLots';
import LotRow from './LotRow';
import IndentSelection from './IndentSelection';
import IndentChatDrawer from './IndentChatDrawer';

export { DEFAULT_DEMO_LOTS } from './demoLots';

export default function Indents({ onBack, onNext, bidData, setBidData }) {
  const { data: internalIndentData } = useGetInternalIndentItemsQuery({
    params: {},
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
  const [expandedLotId, setExpandedLotId] = useState(101); // Default expand Lot 1 as in Image 2

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
    item_name: ind.Yarn?.name || ind.Fabric?.name || ind.Item?.name || 'Item',
    count: ind.Counts?.name || ind.count || '-',
    blend: ind.YarnBlend?.name || ind.blend || '-',
    shade: ind.Color?.name || ind.shade || '-',
    qty: Number(ind.qty || 0),
    uom: typeof ind.Uom === 'object' ? ind.Uom?.name : (ind.uom || 'kg'),
    requiredBy: ind.requiredBy || ind.Indent?.requiredDate || '-',
    commonDocuments: ind.commonDocuments || [],
    vendors: (ind.vendors || ind.IndentItemVendors || []).map(v => ({
      id: v.vendorId !== undefined ? v.vendorId : v.id,
      name: v.name || v.label || v.Vendor?.name || `Vendor ${v.vendorId || v.id}`,
      label: v.label || v.name || v.Vendor?.name || `Vendor ${v.vendorId || v.id}`,
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

  const toggleExpandLot = (lotId) => {
    setExpandedLotId(prev => (prev === lotId ? null : lotId));
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

  return (
    <>
      {/* Indent Selection Modal */}
      <Modal
        isOpen={Boolean(activeLotId)}
        onClose={closeModal}
        widthClass="w-[90%] h-[90%]"
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

      <div className="space-y-4">
        {/* Step Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* <div>
            <h3 className="text-base font-bold text-slate-800">Assign Indents to Lots</h3>
            <p className="text-xs text-slate-500">Each lot keeps its own headers, assigned indents and vendor chats.</p>
          </div> */}
        </div>

        {/* Lots List */}
        {(!bidData.lots || bidData.lots.length === 0) ? (
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
          <div className="space-y-3">
            {bidData.lots.map((lot, index) => (
              <LotRow
                key={lot.id}
                lot={lot}
                index={index}
                isExpanded={expandedLotId === lot.id}
                onToggleExpand={toggleExpandLot}
                onOpenAssignModal={openModal}
                onOpenChat={handleOpenChat}
                onOpenDrawer={handleOpenDrawer}
                onRemoveIndent={removeIndent}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
