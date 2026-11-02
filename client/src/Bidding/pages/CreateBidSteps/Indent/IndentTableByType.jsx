import React from 'react';
import Swal from 'sweetalert2';
import {
  TYPE_COLUMNS,
  buildGridTemplate,
  DOC_STATE_META,
  docState,
  getIndentDocsCount,
  getIndentVendorDocs,
  indentNeedsUpdate,
  plural,
  sumQtyByUom,
  vendorName,
} from './indentHelpers';

const DocIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z M14 3v5h5" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a8 8 0 01-11.6 7.1L4 20l1.1-4.2A8 8 0 1121 12z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/**
 * Compact table for one indent type ("all" shows shared columns only).
 * Renders the scrolling grid (sticky header) and a totals footer, so it must
 * sit inside a flex-column parent with a bounded height.
 */
export default function IndentTableByType({
  indents = [],
  typeKey = 'all',
  lotId,
  onOpenChat,
  onOpenDrawer,
  onRemoveIndent,
}) {
  const columns = TYPE_COLUMNS[typeKey] || TYPE_COLUMNS.all;
  const template = buildGridTemplate(typeKey);

  const handleOpenAction = (indent, tab) => {
    if (onOpenDrawer) {
      onOpenDrawer(indent, tab);
    } else if (onOpenChat) {
      onOpenChat(indent);
    }
  };

  const handleRemove = async (indent) => {
    if (!onRemoveIndent) return;
    const label = indent.docId || indent.id;
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Remove indent?',
      text: `${label} will be removed from this lot.`,
      showCancelButton: true,
      confirmButtonText: 'Remove',
      confirmButtonColor: '#dc2626',
    });
    if (result.isConfirmed) onRemoveIndent(lotId, indent.id);
  };

  const qtyTotal = sumQtyByUom(indents);

  return (
    <>
      <div className="flex-1 min-h-0 overflow-auto border-t border-slate-200">
        <div style={{ minWidth: 1120 }}>
          {/* Sticky header */}
          <div
            className="sticky top-0 z-10 grid items-center h-8 bg-slate-200 text-xs font-semibold text-slate-800 border-b border-slate-300"
            style={{ gridTemplateColumns: template }}
          >
            <div className="px-2 text-center">#</div>
            <div className="px-2">Indent</div>
            {columns.map((c) => (
              <div key={c.label} className={`px-2 truncate ${c.align === 'right' ? 'text-right' : ''}`}>
                {c.label}
              </div>
            ))}
            <div className="px-2">Vendors</div>
            <div className="px-2">Docs</div>
            <div className="px-2 text-right">Actions</div>
          </div>

          {indents.length === 0 && (
            <div className="py-10 text-center text-xs text-slate-500">No indents match this filter.</div>
          )}

          {indents.map((indent, idx) => {
            const vendors = indent.vendors || [];
            const names = vendors.map(vendorName);
            const state = DOC_STATE_META[docState(getIndentVendorDocs(indent))];
            const docsCount = getIndentDocsCount(indent);
            const needsUpdate = indentNeedsUpdate(indent);
            const indentLabel = indent.docId || indent.id;
            const docsLabel = `Documents for ${indentLabel}: ${docsCount}${needsUpdate ? ', update needed' : ''}`;

            return (
              <div
                key={indent.id}
                className={`grid items-center h-[30px] text-xs text-slate-700 border-b border-slate-100 hover:bg-teal-50/70 transition-colors ${
                  idx % 2 ? 'bg-slate-50/80' : 'bg-white'
                }`}
                style={{ gridTemplateColumns: template }}
              >
                <div className="px-2 text-center text-slate-500">{idx + 1}</div>
                <div className="px-2 font-mono text-[11.5px] font-semibold text-slate-900 truncate" title={String(indentLabel)}>
                  {indentLabel}
                </div>

                {columns.map((c) => {
                  const value = c.value(indent);
                  return (
                    <div
                      key={c.label}
                      title={value}
                      className={`px-2 truncate ${c.align === 'right' ? 'text-right tabular-nums font-medium' : ''} ${
                        c.strong ? 'font-medium text-slate-900' : ''
                      }`}
                    >
                      {value}
                    </div>
                  );
                })}

                {/* Vendors: first vendor + "+N"; click opens the documents drawer */}
                <button
                  type="button"
                  onClick={() => handleOpenAction(indent, 'docs')}
                  title={names.length ? names.join(', ') : 'No vendors'}
                  className="flex items-center gap-1.5 h-full px-2 min-w-0 text-left hover:text-teal-800"
                >
                  <span className={`text-[10px] leading-none ${state.cls}`} aria-hidden="true">{state.glyph}</span>
                  <span className="truncate">{names[0] || '-'}</span>
                  {names.length > 1 && (
                    <span className="shrink-0 px-1.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-medium">
                      +{names.length - 1}
                    </span>
                  )}
                  <span className="sr-only">{`Document status: ${state.label}`}</span>
                </button>

                {/* Docs */}
                <div className="px-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAction(indent, 'docs')}
                    aria-label={docsLabel}
                    title={docsLabel}
                    className={`inline-flex items-center gap-1 h-6 px-2 rounded-md border text-[11px] font-medium transition-colors ${
                      needsUpdate
                        ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-teal-50 hover:border-teal-600 hover:text-teal-800'
                    }`}
                  >
                    <DocIcon />
                    {docsCount}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 px-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAction(indent, 'chat')}
                    aria-label={`Chat with vendors for ${indentLabel}`}
                    className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-teal-300 text-teal-800 bg-white hover:bg-teal-50 text-[11px] font-medium transition-colors"
                  >
                    <ChatIcon />
                    Chat
                  </button>
                  {onRemoveIndent && (
                    <button
                      type="button"
                      onClick={() => handleRemove(indent)}
                      aria-label={`Remove ${indentLabel} from lot`}
                      title="Remove from lot"
                      className="inline-flex items-center justify-center w-6 h-6 rounded-md text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: totals + document-status legend */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3.5 py-2 bg-slate-200 border-t border-slate-300 text-xs font-semibold text-slate-800">
        <span>Total {plural(indents.length, 'indent')}</span>
        <span className="font-normal text-[11px] text-slate-700">
          Docs: <span className="text-emerald-700">●</span> ready &nbsp;
          <span className="text-amber-700">▲</span> update needed &nbsp;
          <span className="text-blue-700">◐</span> in review &nbsp;
          <span className="text-slate-500">○</span> none
        </span>
        <span>{qtyTotal ? `Qty ${qtyTotal}` : ''}</span>
      </div>
    </>
  );
}
