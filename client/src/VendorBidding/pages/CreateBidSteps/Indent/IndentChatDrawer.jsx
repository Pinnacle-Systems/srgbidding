import { useBiddingAuth } from '../../../../Bidding/context/BiddingAuthContext';
import { getCommonParams } from '../../../../Utils/helper';
import React, { useState, useEffect, useRef } from 'react';
import IndentDocumentsView from '../IndentDrawer/IndentDocumentsView';
import IndentMessagesView from '../IndentDrawer/IndentMessagesView';

export default function IndentChatDrawer({
  isOpen,
  indent,
  initialTab = 'docs',
  onClose,
  messages = {},
  onSendMessage,
  onUpdateDocuments,
}) {
  const { role } = useBiddingAuth?.() || {};
  const { userRole, partyId, partyType } = getCommonParams();
  const isVendor = role === 'Vendor' || partyType?.toUpperCase() === 'VENDOR' || userRole?.toLowerCase() === 'vendor' || Boolean(!userRole && partyId);

  const rawVendors = indent?.vendors || [];
  const vendors = (isVendor && partyId)
    ? (rawVendors.filter(v => String(v.id || v.vendorId) === String(partyId)).length > 0
        ? rawVendors.filter(v => String(v.id || v.vendorId) === String(partyId))
        : rawVendors)
    : rawVendors;
  const commonDocs = isVendor ? [] : (indent?.commonDocuments || []);

  const [activeTab, setActiveTab] = useState(initialTab || 'docs'); // 'chat' | 'docs'
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || null);
  const [inputText, setInputText] = useState('');

  const chatInputRef = useRef(null);

  // Synchronize initialTab and default vendor when drawer opens or indent changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (isVendor) {
      const myVendor = (partyId && vendors.find(v => String(v.id || v.vendorId) === String(partyId))) || vendors[0];
      if (myVendor) {
        setSelectedVendorId(myVendor.id);
      }
    } else {
      if (vendors.length > 0) {
        if (!selectedVendorId || (!vendors.some(v => v.id === selectedVendorId) && selectedVendorId !== 'common')) {
          setSelectedVendorId(vendors[0].id);
        }
      } else {
        setSelectedVendorId('common');
      }
    }
  }, [indent, initialTab, isVendor, partyId]);

  if (!isOpen || !indent) return null;

  const isCommonSelected = !isVendor && selectedVendorId === 'common';
  const activeVendor = isCommonSelected
    ? { id: 'common', name: 'All Vendors (Common Specs)', label: 'Common' }
    : (vendors.find(v => v.id === selectedVendorId) || vendors[0]);

  const activeDocuments = isCommonSelected
    ? (indent.commonDocuments || [])
    : (activeVendor?.documents || []);

  // Compute total documents across all vendors + common
  const totalVendorDocsCount = vendors.reduce(
    (sum, v) => sum + (v.documents ? v.documents.length : 0),
    0
  );
  const totalAllDocsCount = isVendor ? totalVendorDocsCount : (totalVendorDocsCount + commonDocs.length);

  const chatKey = `${indent.id}_${activeVendor?.id}`;
  const conversation = messages[chatKey] || [];

  // Switch to chat and prefill message requesting document update
  const handleRequestDocUpdate = (doc) => {
    setActiveTab('chat');
    if (isCommonSelected && vendors.length > 0) {
      setSelectedVendorId(vendors[0].id);
    }
    const vendorName = activeVendor?.name || activeVendor?.label || 'vendor';
    setInputText(`Hi ${vendorName}, please provide an updated revision for "${doc.title}" (Current: v${doc.version}).`);
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 100);
  };

  // Spec summary line
  const renderSpecSummary = () => {
    const cat = indent.category || indent.indentType || 'Item';
    let details = '';

    if (cat.includes('Yarn')) {
      details = `Count: ${indent.count || '-'} | Blend: ${indent.blend || '-'} | Shade: ${indent.shade || '-'} | Qty: ${Number(indent.qty || 0).toLocaleString()} kg`;
    } else if (cat.includes('Dyes')) {
      details = `CI: ${indent.ciCas || indent.code || '-'} | Strength: ${indent.strength || '150%'} | Hazard: ${indent.hazard || 'Standard'} | Qty: ${Number(indent.qty || 0).toLocaleString()} kg`;
    } else if (cat.includes('Spares')) {
      details = `Machine: ${indent.machine || '-'} | Part no: ${indent.partNo || '-'} | Make: ${indent.make || '-'} | Qty: ${Number(indent.qty || 0).toLocaleString()} nos`;
    } else if (cat.includes('Fabric')) {
      details = `Construction: ${indent.construction || '-'} | GSM: ${indent.gsm || '-'} | Width: ${indent.width || '-'} | Qty: ${Number(indent.qty || 0).toLocaleString()} ${indent.uom || ''}`;
    } else {
      details = `Spec: ${indent.spec || '-'} | Qty: ${Number(indent.qty || 0).toLocaleString()} ${indent.uom || ''}`;
    }

    return (
      <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {cat}
        </span>
        <span className="font-medium text-slate-700">{details}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-3xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          
          {/* Top Header: Indent Title, Code, Spec & Close Button */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {indent.item_name || indent.id}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-medium">
                    {indent.docId || indent.id}
                  </span>
                </div>
                {renderSpecSummary()}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
                title="Close drawer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Mode Tabs: Documents ⇄ Messages */}
            <div className="flex items-center gap-2 border-b border-slate-200 pt-1 -mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('docs')}
                className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === 'docs'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Vendor Documents</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'docs' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {totalAllDocsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === 'chat'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Messages & Queries</span>
                {conversation.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                )}
              </button>
            </div>
          </div>

          {/* Vendor Selector Tabs Sub-bar */}
          <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-thin shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              {activeTab === 'docs' ? 'Filter by:' : 'Vendor:'}
            </span>

            {/* Common Specs option (available only for Admin in Documents tab) */}
            {!isVendor && activeTab === 'docs' && (
              <button
                type="button"
                onClick={() => setSelectedVendorId('common')}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isCommonSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                <span>Common Specs</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isCommonSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {commonDocs.length}
                </span>
              </button>
            )}

            {/* Individual Vendor Pills */}
            {vendors.map(vendor => {
              const isActive = vendor.id === activeVendor?.id && !isCommonSelected;
              const vDocs = vendor.documents || [];
              const hasUpdateNeeded = vDocs.some(d => d.status === 'Update Needed');

              return (
                <button
                  key={vendor.id}
                  type="button"
                  onClick={() => setSelectedVendorId(vendor.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  <span>{vendor.label || vendor.name}</span>
                  {activeTab === 'docs' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {vDocs.length}
                    </span>
                  )}
                  {hasUpdateNeeded && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" title="Update required" />
                  )}
                </button>
              );
            })}
          </div>

          {/* MAIN BODY AREA: Delegated cleanly to either Document or Messages component */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {activeTab === 'docs' ? (
              <IndentDocumentsView
                indent={indent}
                activeVendor={activeVendor}
                isCommonSelected={isCommonSelected}
                activeDocuments={activeDocuments}
                commonDocs={commonDocs}
                onUpdateDocuments={onUpdateDocuments}
                onRequestDocUpdate={handleRequestDocUpdate}
              />
            ) : (
              <IndentMessagesView
                indent={indent}
                activeVendor={activeVendor}
                conversation={conversation}
                allVendors={vendors}
                onSendMessage={onSendMessage}
                inputText={inputText}
                setInputText={setInputText}
                chatInputRef={chatInputRef}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
