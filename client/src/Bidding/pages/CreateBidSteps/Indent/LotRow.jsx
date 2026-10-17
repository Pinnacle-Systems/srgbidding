import React, { useState } from 'react';
import IndentCard from './IndentCard';
import IndentTableByType from './IndentTableByType';

export default function LotRow({
  lot,
  index,
  isExpanded,
  onToggleExpand,
  onOpenAssignModal,
  onOpenChat,
  onOpenDrawer,
  onRemoveIndent,
}) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All types');

  const indents = lot.indents || [];

  // Category breakdown calculation
  const typeSummary = indents.reduce((acc, ind) => {
    const cat = ind.category || ind.indentType || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const uniqueTypes = Object.keys(typeSummary);

  // Unique vendors calculation
  const uniqueVendorIds = new Set();
  indents.forEach(ind => {
    (ind.vendors || []).forEach(v => uniqueVendorIds.add(v.id || v.name));
  });
  const totalVendors = uniqueVendorIds.size || 0;

  // Filtered indents based on category pill
  const filteredIndents = activeCategoryFilter === 'All types'
    ? indents
    : indents.filter(ind => (ind.category || ind.indentType) === activeCategoryFilter);

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all">
      {/* Lot Overview Header Row (Image 1) */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-2 flex-1">
          {/* Title */}
          <h4 className="font-bold text-slate-900 text-base">
            Lot {index + 1}: {lot.name}
          </h4>

          {/* Badges Row (Image 1) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* {Object.entries(typeSummary).map(([cat, count]) => (
              <span
                key={cat}
                className="px-2.5 py-0.5 rounded-full font-medium bg-teal-50 text-teal-800 border border-teal-200/80"
              >
                {cat} {count}
              </span>
            ))} */}

            {/* Mixed lot badge */}
            <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {uniqueTypes.length > 1 ? `Mixed lot: ${uniqueTypes.length} types` : `${uniqueTypes[0] || 'Single type'} lot`}
            </span>

            {/* Indents IDs summary badge */}
            {/* {indents.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">
                {indents.length} indents: {indents.map(i => i.docId || i.id).join(', ')}
              </span>
            )} */}

            {/* Vendors summary badge */}
            <span className="px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {totalVendors} vendors
            </span>

            {/* Status Badge */}
            <span
              className={`px-2.5 py-0.5 rounded-full font-semibold ${lot.status === 'Draft'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
            >
              {lot.status || 'Open'}
            </span>

            {/* Unread badge */}
            {lot.unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-orange-500 text-white text-[11px] shadow-sm animate-pulse">
                {lot.unreadCount} unread
              </span>
            )}
          </div>
        </div>

        {/* Actions: Assign Indents & Show/Hide Toggle */}
        <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenAssignModal(lot)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors"
          >
            + Assign Indents
          </button>

          <button
            type="button"
            onClick={() => onToggleExpand(lot.id)}
            className="px-4 py-1.5 rounded-lg font-semibold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
          >
            {isExpanded ? 'Hide indents' : 'Show indents'}
          </button>
        </div>
      </div>

      {/* Expanded Section (Image 2) */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white animate-in fade-in duration-200">
          {/* Sub-header Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* View Switcher: Indent cards vs Table by type */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 w-fit">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'cards'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Indent cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'table'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Table by type
              </button>
            </div>
          </div>

          {/* Info Banner (Image 2) */}
          {/* <div className="bg-teal-50/60 border border-teal-200/80 text-teal-900 rounded-lg px-4 py-2 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              This lot has {uniqueTypes.length} indent type{uniqueTypes.length !== 1 ? 's' : ''}. Each indent keeps its own headers and its own vendors.
            </span>
          </div> */}

          {/* Category Filter Pills (Image 2) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('All types')}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${activeCategoryFilter === 'All types'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
            >
              All types
            </button>

            {uniqueTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveCategoryFilter(type)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${activeCategoryFilter === type
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* View 1: Indent Cards Grid */}
          {viewMode === 'cards' ? (
            filteredIndents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No indents found for this filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIndents.map(indent => (
                  <IndentCard
                    key={indent.id}
                    indent={indent}
                    lotId={lot.id}
                    onOpenChat={onOpenChat}
                    onOpenDrawer={onOpenDrawer}
                    onRemoveIndent={onRemoveIndent}
                  />
                ))}
              </div>
            )
          ) : (
            /* View 2: Table by Type */
            <IndentTableByType
              indents={filteredIndents}
              lotId={lot.id}
              onOpenChat={onOpenChat}
              onOpenDrawer={onOpenDrawer}
              onRemoveIndent={onRemoveIndent}
            />
          )}
        </div>
      )}
    </div>
  );
}
