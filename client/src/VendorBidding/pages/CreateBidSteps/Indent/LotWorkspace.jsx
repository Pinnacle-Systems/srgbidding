import React, { useMemo, useState } from 'react';
import IndentTableByType from './IndentTableByType';
import {
  DOC_STATE_META,
  countUpdateNeeded,
  docState,
  getDeptName,
  getIndentCategory,
  getLotVendors,
  getTypeKey,
  plural,
  vendorKey,
} from './indentHelpers';

const VENDOR_CHIP_LIMIT = 5;

/**
 * Right-hand workspace for the selected lot:
 *   header (title + Assign Indents) → vendor strip → type tabs + search → table.
 * Mount it with key={lot.id} so its filters reset when the lot changes.
 */
export default function LotWorkspace({
  lot,
  lotIndex,
  onOpenAssignModal,
  onOpenChat,
  onOpenDrawer,
  onRemoveIndent,
  onUpdateIndent,
}) {
  const [typeFilter, setTypeFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('');
  const [search, setSearch] = useState('');
  const [vendorsExpanded, setVendorsExpanded] = useState(false);

  const indents = lot.indents || [];
  const isDraft = lot.status === 'Draft';

  const lotVendors = useMemo(() => getLotVendors(indents), [indents]);
  const types = useMemo(
    () => Array.from(new Set(indents.map(getIndentCategory))),
    [indents]
  );
  const updateCount = useMemo(() => countUpdateNeeded(indents), [indents]);

  // Filters can point at something that was just removed — fall back gracefully.
  const activeVendor = lotVendors.some((v) => v.key === vendorFilter) ? vendorFilter : '';
  const activeType = types.includes(typeFilter) ? typeFilter : 'All';

  const vendorFiltered = activeVendor
    ? indents.filter((ind) => (ind.vendors || []).some((v) => vendorKey(v) === activeVendor))
    : indents;

  const tabs = [
    { label: 'All', count: vendorFiltered.length },
    ...types.map((t) => ({
      label: t,
      count: vendorFiltered.filter((ind) => getIndentCategory(ind) === t).length,
    })),
  ];

  const query = search.trim().toLowerCase();
  const visibleIndents = vendorFiltered
    .filter((ind) => activeType === 'All' || getIndentCategory(ind) === activeType)
    .filter(
      (ind) =>
        !query ||
        [
          ind.docId,
          ind.id,
          ind.item_name,
          getDeptName(ind),
          getIndentCategory(ind),
          ind.spec,
          ind.machine,
          ind.partNo,
          ind.make,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
    );

  const shownVendors = vendorsExpanded ? lotVendors : lotVendors.slice(0, VENDOR_CHIP_LIMIT);
  const hiddenVendorCount = lotVendors.length - VENDOR_CHIP_LIMIT;

  return (
    <section
      aria-label={`Lot ${lotIndex + 1} indents`}
      className="flex-1 min-w-0 min-h-0 flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden"
    >
      {/* Header: title, status, Assign Indents */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 truncate">
              Lot {lotIndex + 1} · {lot.name}
            </h2>
            {/* <span
              className={`px-2 rounded-full border text-[11px] font-medium leading-[18px] ${isDraft
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
            >
              {lot.status || 'Open'}
            </span> */}
          </div>
          {/* <p className="mt-0.5 text-xs text-slate-600">
            {plural(indents.length, 'indent')} · {plural(lotVendors.length, 'vendor')}
            {updateCount > 0 ? ` · ${updateCount} to update` : ''}
          </p> */}
        </div>

        <button
          type="button"
          onClick={() => onOpenAssignModal(lot)}
          className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 5v14M5 12h14" />
          </svg>
          Assign Indents
        </button>
      </div>

      {indents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 border-t border-slate-200 text-center p-8">
          <p className="text-sm font-medium text-slate-700">No indents assigned to this lot yet.</p>
          <p className="text-xs text-slate-500">Use “Assign Indents” to pick the indents for this lot.</p>
        </div>
      ) : (
        <>
          {/* Vendor strip — chips filter the table */}
          <div className="flex items-start gap-2 px-3.5 py-2 border-t border-slate-200">
            <span className="shrink-0 text-xs font-semibold text-slate-700 leading-[26px]">
              Vendors ({lotVendors.length})
            </span>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {shownVendors.map((v) => {
                const state = DOC_STATE_META[docState(v.docs)];
                const on = activeVendor === v.key;
                return (
                  <button
                    key={v.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setVendorFilter(on ? '' : v.key)}
                    title={`${v.name} · ${plural(v.count, 'indent')} · ${state.label} (click to filter)`}
                    className={`inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full border text-xs font-medium transition-colors ${on
                      ? 'bg-teal-700 border-teal-700 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-teal-50 hover:border-teal-600'
                      }`}
                  >
                    <span>{v.name}</span>
                    <span className={`text-[10px] leading-none ${on ? 'text-white' : state.cls}`} aria-hidden="true">
                      {state.glyph}
                    </span>
                    <span className="sr-only">{state.label}</span>
                  </button>
                );
              })}

              {hiddenVendorCount > 0 && (
                <button
                  type="button"
                  onClick={() => setVendorsExpanded((prev) => !prev)}
                  className="inline-flex items-center h-[26px] px-2.5 rounded-full border border-dashed border-slate-400 text-xs font-medium text-teal-800 hover:bg-teal-50 transition-colors"
                >
                  {vendorsExpanded ? 'Show less' : `+${hiddenVendorCount} more`}
                </button>
              )}

              {activeVendor && (
                <button
                  type="button"
                  onClick={() => setVendorFilter('')}
                  className="inline-flex items-center h-[26px] px-2 text-xs font-medium text-teal-800 underline"
                >
                  Clear vendor filter
                </button>
              )}
            </div>
          </div>

          {/* Type tabs + search */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3.5 border-t border-slate-200">
            <div className="flex flex-wrap gap-0.5" role="group" aria-label="Indent type">
              {tabs.map((t) => {
                const on = activeType === t.label;
                return (
                  <button
                    key={t.label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTypeFilter(t.label)}
                    className={`px-2.5 pt-2 pb-1.5 text-xs border-b-2 transition-colors ${on
                      ? 'border-teal-700 text-teal-800 font-semibold'
                      : 'border-transparent text-slate-600 font-medium hover:text-slate-900'
                      }`}
                  >
                    {t.label}
                    <span
                      className={`ml-1.5 inline-block min-w-[18px] px-1.5 rounded-full text-center text-[11px] font-medium ${on ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                        }`}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <label className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-500 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-200">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search indent, item, dept"
                aria-label="Search indents"
                className="w-48 bg-transparent outline-none text-xs text-slate-800 placeholder:text-slate-500"
              />
            </label>
          </div>

          <IndentTableByType
            indents={visibleIndents}
            typeKey={activeType === 'All' ? 'all' : getTypeKey(activeType)}
            activeTypeName={activeType}
            lotId={lot.id}
            onOpenChat={onOpenChat}
            onOpenDrawer={onOpenDrawer}
            onRemoveIndent={onRemoveIndent}
            onUpdateIndent={onUpdateIndent}
          />
        </>
      )}
    </section>
  );
}
