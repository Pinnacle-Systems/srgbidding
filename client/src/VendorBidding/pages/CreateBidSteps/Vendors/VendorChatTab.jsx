import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function VendorChatTab({
  bidData,
  chatMessages = {},
  onSendMessage,
  initialTargetVendorId = null,
  initialText = ''
}) {
  const lots = bidData.lots || [];

  // Extract all unique vendors
  const uniqueVendors = useMemo(() => {
    const map = new Map();
    lots.forEach(lot => {
      (lot.indents || []).forEach(indent => {
        (indent.vendors || []).forEach(v => {
          const vKey = String(v.id || v.vendorId || v.name);
          if (!map.has(vKey)) {
            map.set(vKey, {
              id: v.id || v.vendorId || vKey,
              name: v.name || v.label || `Vendor ${vKey}`,
              lotName: lot.name || `Lot ${lot.id}`,
              indentDocId: indent.docId || `IND-${indent.id}`,
              itemName: indent.item_name || 'Item'
            });
          }
        });
      });
    });

    const list = Array.from(map.values());
    if (list.length === 0) {
      return [
        { id: 'v1', name: 'Kovai Yarns', lotName: 'Lot 1 - Yarn', indentDocId: 'IND-101', itemName: '30s Combed Cotton' },
        { id: 'v2', name: 'Annai Spinners', lotName: 'Lot 1 - Yarn', indentDocId: 'IND-101', itemName: '30s Combed Cotton' },
        { id: 'v3', name: 'Sri Murugan Mills', lotName: 'Lot 1 - Yarn', indentDocId: 'IND-102', itemName: '40s Carded Yarn' },
      ];
    }
    return list;
  }, [lots]);

  const [activeVendorId, setActiveVendorId] = useState(
    initialTargetVendorId || uniqueVendors[0]?.id || 'v1'
  );
  const [chatSearch, setChatSearch] = useState('');
  const [inputText, setInputText] = useState(initialText || '');
  const [isBroadcast, setIsBroadcast] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync if initial props change
  useEffect(() => {
    if (initialTargetVendorId) {
      setActiveVendorId(initialTargetVendorId);
    }
    if (initialText) {
      setInputText(initialText);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [initialTargetVendorId, initialText]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeVendorId]);

  const activeVendor = uniqueVendors.find(v => String(v.id) === String(activeVendorId)) || uniqueVendors[0];

  // Retrieve messages for active vendor (or broadcast)
  const currentThreadKey = isBroadcast ? 'broadcast' : String(activeVendor?.id || 'v1');
  const threadMessages = chatMessages[currentThreadKey] || [
    {
      sender: 'system',
      senderName: 'System',
      text: 'Pre-bid query window is open. You can send questions, clarifications, and document requests directly to vendors.',
      timestamp: '10:00 AM'
    },
    {
      sender: 'vendor',
      senderName: activeVendor?.name || 'Vendor',
      text: 'Good day! We have reviewed the specifications for this lot. What is the expected delivery schedule for Unit 1?',
      timestamp: '10:15 AM'
    },
    {
      sender: 'user',
      senderName: 'You (Procurement)',
      text: 'Delivery must be completed within 14 days from PO release in staggered batches of 2,500 kg.',
      timestamp: '10:30 AM'
    }
  ];

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (onSendMessage) {
      onSendMessage({
        threadKey: currentThreadKey,
        vendorId: activeVendor?.id,
        isBroadcast,
        text: inputText.trim(),
        allVendorIds: uniqueVendors.map(v => v.id)
      });
    }

    setInputText('');
  };

  const handleQuickPrompt = (promptText) => {
    setInputText(promptText);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const queryDeadline = bidData.queryDeadline || '2026-11-12';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[580px]">
      {/* Messenger Header Bar */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            💬
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Vendor Pre-Bid Communication Hub</h4>
            <p className="text-[11px] text-slate-500">Live chat, query resolutions, and official bid announcements</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Query Deadline: {queryDeadline}</span>
          </span>
        </div>
      </div>

      {/* Main 2-Pane Chat View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Vendor Threads List */}
        <div className="w-72 sm:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Thread Search */}
          <div className="p-2.5 border-b border-slate-200">
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Filter vendors..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Broadcast Channel Option */}
            <button
              type="button"
              onClick={() => {
                setIsBroadcast(true);
              }}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                isBroadcast
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isBroadcast ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                📢
              </div>
              <div className="truncate flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold truncate">All Vendors</p>
                  <span className={`text-[10px] ${isBroadcast ? 'text-blue-200' : 'text-slate-400'}`}>Public</span>
                </div>
                <p className={`text-[10px] truncate ${isBroadcast ? 'text-blue-100' : 'text-slate-400'}`}>
                  Broadcast official addendum
                </p>
              </div>
            </button>

            <div className="pt-2 pb-1 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Direct Vendor Threads ({uniqueVendors.length})
            </div>

            {/* Individual Vendor Threads */}
            {uniqueVendors
              .filter(v => v.name.toLowerCase().includes(chatSearch.toLowerCase()))
              .map((vendor) => {
                const isSelected = !isBroadcast && String(activeVendorId) === String(vendor.id);
                return (
                  <button
                    key={vendor.id}
                    type="button"
                    onClick={() => {
                      setIsBroadcast(false);
                      setActiveVendorId(vendor.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/70'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {vendor.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold truncate text-xs">{vendor.name}</p>
                        <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                          10:30 AM
                        </span>
                      </div>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {vendor.lotName} • {vendor.itemName}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Pane: Active Thread Chat Feed */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Active Thread Bar */}
          <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                {isBroadcast ? '📢' : (activeVendor?.name.slice(0, 2).toUpperCase() || 'V')}
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {isBroadcast ? 'Broadcast Channel (All Invited Vendors)' : activeVendor?.name}
                </h5>
                <p className="text-[11px] text-slate-500">
                  {isBroadcast
                    ? `Message will be delivered to ${uniqueVendors.length} vendors simultaneously`
                    : `Context: ${activeVendor?.lotName} • ${activeVendor?.itemName}`}
                </p>
              </div>
            </div>

            {!isBroadcast && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Active Thread
              </span>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 bg-slate-50/40 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-semibold shrink-0">Quick Queries:</span>
            {[
              'Please provide latest mill test report',
              'Kindly confirm delivery lead time',
              'Can you supply in cones or hank?',
              'Confirm acceptance of 45-day payment terms'
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(chip)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-600 hover:text-blue-700 whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message History Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/20">
            {threadMessages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const isSys = msg.sender === 'system';

              if (isSys) {
                return (
                  <div key={index} className="flex justify-center my-2">
                    <span className="px-3 py-1 rounded-full text-[11px] bg-slate-100 text-slate-600 border border-slate-200 max-w-md text-center">
                      ℹ️ {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                    {msg.senderName} • {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isBroadcast
                    ? 'Write announcement to all vendors...'
                    : `Message ${activeVendor?.name || 'vendor'}...`
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span>Send</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
