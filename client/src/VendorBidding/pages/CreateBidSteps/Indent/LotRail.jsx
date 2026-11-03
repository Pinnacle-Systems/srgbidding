import React from 'react';
import { countUpdateNeeded, getLotVendors, plural } from './indentHelpers';

/** Left-hand list of all lots; selecting one fills the workspace on the right. */
export default function LotRail({ lots, selectedLotId, onSelect }) {
  return (
    <nav
      aria-label="Lots"
      className="md:w-[232px] md:shrink-0 max-h-44 md:max-h-none flex flex-col min-h-0 bg-white border border-slate-200 rounded-lg overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
        <span>Lots</span>
        <span className="px-1.5 rounded-full bg-slate-200 text-slate-700 font-medium normal-case tracking-normal">
          {lots.length}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
        {lots.map((lot, index) => {
          const indents = lot.indents || [];
          const selected = lot.id === selectedLotId;
          const updateCount = countUpdateNeeded(indents);
          const isDraft = lot.status === 'Draft';

          return (
            <button
              key={lot.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(lot.id)}
              className={`block w-full text-left rounded-lg border border-l-4 px-2.5 py-2 transition-colors ${selected
                ? 'bg-teal-50 border-teal-200 border-l-teal-700'
                : 'bg-white border-slate-200 border-l-transparent hover:bg-slate-50'
                }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900">Lot {index + 1}</span>
                <span
                  className={`px-2 rounded-full border text-[11px] font-medium leading-[18px] ${isDraft
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                >
                  {lot.status || 'Open'}
                </span>
                {lot.unreadCount > 0 && (
                  <span className="ml-auto px-1.5 rounded-full bg-orange-700 text-white text-[11px] font-semibold leading-[18px]">
                    {lot.unreadCount} unread
                  </span>
                )}
              </span>
              <span className="block mt-0.5 text-xs text-slate-700 truncate">{lot.name}</span>
              {/* <span className="flex items-center justify-between gap-2 mt-0.5 text-[11px] text-slate-600">
                <span>
                  {plural(indents.length, 'indent')} · {plural(getLotVendors(indents).length, 'vendor')}
                </span>
                {updateCount > 0 && (
                  <span className="text-amber-700" title={`${updateCount} document(s) need update`}>
                    ▲ {updateCount}
                  </span>
                )}
              </span> */}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
