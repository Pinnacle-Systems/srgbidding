import React, { useMemo } from 'react';
import Swal from 'sweetalert2';
import SearchableTableCellSelect from '../../../../HostelStore/Components/ReusableComponents/SearchableTableCellSelect';
import SearchableTableMultiCellSelect from '../../../../HostelStore/Components/ReusableComponents/SearchableTableMultiCellSelect';
import { dropDownListObject } from '../../../../Utils/contructObject';
import { useGetPartyQuery } from '../../../../redux/services/PartyMasterService';
import { useGetIndentTypeMasterByNameQuery } from '../../../../redux/uniformService/IndentTypeMasterService';
import {
  YarnHeaders,
  YarnRowCells,
  FabricHeaders,
  FabricRowCells,
  SparesHeaders,
  SparesRowCells,
  DyesHeaders,
  DyesRowCells,
  GeneralHeaders,
  GeneralRowCells,
} from './IndentTables';
import {
  DOC_STATE_META,
  docState,
  getIndentDocsCount,
  getIndentVendorDocs,
  indentNeedsUpdate,
  plural,
  sumQtyByUom,
  getIndentCategory,
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

const headerClasses = "px-2 py-1.5 text-left text-[11px] font-bold text-slate-700 tracking-wider border border-gray-300";
const cellClasses = "px-0.5 py-0 border border-gray-300 relative text-[11px] ";
const inputClasses = "w-full h-6 border border-transparent bg-transparent px-1.5 text-[11px] text-gray-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded transition-all placeholder:text-gray-400";
const numInputClasses = `${inputClasses} text-right`;

/**
 * Modular IndentTableByType:
 * - Row cells split per type into IndentTables/ (Yarn, Fabric, Spares, Dyes, General)
 * - SearchableTableMultiCellSelect for vendor add / remove
 * - Dynamic custom fields per Indent Type (via IndentTypeMaster)
 * - State synchronization via onUpdateIndent
 */
export default function IndentTableByType({
  indents = [],
  typeKey = 'all',
  activeTypeName = 'All',
  lotId,
  onOpenChat,
  onOpenDrawer,
  onRemoveIndent,
  onUpdateIndent,
}) {
  // Determine effective schema type name for dynamic custom fields
  const schemaTypeName = useMemo(() => {
    const raw = (activeTypeName || typeKey || '').toLowerCase();
    if (raw.includes('yarn')) return 'Yarn';
    if (raw.includes('fabric')) return 'Fabric';
    if (raw.includes('spare') || raw.includes('machine')) return 'Spares';
    if (raw.includes('dye') || raw.includes('chem')) return 'Dyes & Chemical';
    if (raw.includes('general')) return 'General';
    if (indents.length > 0) {
      const firstCat = (getIndentCategory(indents[0]) || '').toLowerCase();
      if (indents.every((i) => (getIndentCategory(i) || '').toLowerCase() === firstCat)) {
        if (firstCat.includes('yarn')) return 'Yarn';
        if (firstCat.includes('fabric')) return 'Fabric';
        if (firstCat.includes('spare') || firstCat.includes('machine')) return 'Spares';
        if (firstCat.includes('dye') || firstCat.includes('chem')) return 'Dyes & Chemical';
        return 'General';
      }
    }
    return '';
  }, [activeTypeName, typeKey, indents]);

  // Master vendor list
  const { data: partyList } = useGetPartyQuery({ params: {} });

  // Dynamic schema for custom fields
  const { data: dynamicSchemaResponse } = useGetIndentTypeMasterByNameQuery(schemaTypeName, {
    skip: !schemaTypeName,
  });

  const dynamicFields = useMemo(() => {
    let schema = dynamicSchemaResponse?.data?.fieldSchema || [];
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (e) {
        schema = [];
      }
    }
    return Array.isArray(schema) ? schema : [];
  }, [dynamicSchemaResponse]);

  // Party options for multi-vendor select
  const partyOptions = useMemo(() => {
    const list = partyList?.data?.filter((p) => p.active !== false) || [];
    return dropDownListObject(list, 'name', 'id');
  }, [partyList]);

  // Field change handler
  const handleFieldChange = (indent, field, value, additionalUpdates = {}) => {
    if (!onUpdateIndent) return;
    onUpdateIndent(lotId, indent.id, {
      [field]: value,
      ...additionalUpdates,
    });
  };

  // Custom field change handler
  const handleCustomFieldChange = (indent, fieldName, value) => {
    if (!onUpdateIndent) return;
    const currentCustom = { ...(indent.customData || {}) };
    currentCustom[fieldName] = value;
    onUpdateIndent(lotId, indent.id, {
      customData: currentCustom,
    });
  };

  // Vendor assignment handler (Add/Remove vendors)
  const handleVendorsChange = (indent, selectedOptions) => {
    if (!onUpdateIndent) return;
    const normalizedVendors = (selectedOptions || []).map((opt) => {
      const vId =
        typeof opt === 'object' && opt !== null
          ? opt.value !== undefined
            ? opt.value
            : opt.vendorId !== undefined
              ? opt.vendorId
              : opt.id
          : opt;
      const partyObj = partyList?.data?.find((p) => String(p.id) === String(vId));
      const vName =
        typeof opt === 'object' && opt !== null
          ? opt.label || opt.name || partyObj?.name
          : partyObj?.name || `Vendor ${vId}`;
      const existingVendor = (indent.vendors || []).find(
        (v) => String(v.id) === String(vId) || String(v.vendorId) === String(vId)
      );
      return {
        id: vId,
        vendorId: vId,
        name: vName,
        label: vName,
        documents: existingVendor ? existingVendor.documents || [] : [],
        status: existingVendor?.status || 'INVITED',
      };
    });

    onUpdateIndent(lotId, indent.id, {
      vendors: normalizedVendors,
      IndentItemVendors: normalizedVendors,
    });
  };

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
        <div style={{ minWidth: 1500 }}>
          <table className="w-full border-collapse bg-white">
            <thead className="bg-slate-200 sticky top-0 z-10 text-slate-700">
              <tr>
                <th className={`${headerClasses} w-10 text-center`}>#</th>
                <th className={`${headerClasses} w-64`}>Indent</th>
                {typeKey === 'all' && <th className={`${headerClasses} w-24`}>Type</th>}

                {/* Type-Specific Column Headers */}
                {typeKey === 'yarn' && <YarnHeaders headerClasses={headerClasses} />}
                {typeKey === 'fabric' && <FabricHeaders headerClasses={headerClasses} />}
                {typeKey === 'spares' && <SparesHeaders headerClasses={headerClasses} />}
                {typeKey === 'dyes' && <DyesHeaders headerClasses={headerClasses} />}
                {(typeKey === 'general' || typeKey === 'all') && (
                  <GeneralHeaders headerClasses={headerClasses} />
                )}

                {/* Dynamic Custom Fields */}
                {dynamicFields.map((field) => (
                  <th key={field.name} className={`${headerClasses} w-32`}>
                    {field.label || field.name}
                  </th>
                ))}

                {/* Vendors Column */}
                <th className={`${headerClasses} w-56`}>Vendors</th>

                {/* Qty Column */}
                <th className={`${headerClasses} w-24 text-right`}>Qty</th>

                {/* Docs Column */}
                <th className={`${headerClasses} w-16 text-center`}>Docs</th>

                {/* Actions Column */}
                <th className={`${headerClasses} w-24 text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {indents.length === 0 ? (
                <tr>
                  <td
                    colSpan={10 + dynamicFields.length}
                    className="py-10 text-center text-xs text-slate-500 border border-gray-200"
                  >
                    No indents match this filter.
                  </td>
                </tr>
              ) : (
                indents.map((indent, idx) => {
                  const state = DOC_STATE_META[docState(getIndentVendorDocs(indent))];
                  const docsCount = getIndentDocsCount(indent);
                  const needsUpdate = indentNeedsUpdate(indent);
                  const indentLabel = indent.docId || indent.id;
                  const docsLabel = `Documents for ${indentLabel}: ${docsCount}${needsUpdate ? ', update needed' : ''
                    }`;

                  return (
                    <tr
                      key={indent.id}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                        } hover:bg-teal-50/60 transition-colors group`}
                    >
                      {/* S.No */}
                      <td className="px-2 py-1 border border-gray-300 text-center text-slate-500 font-medium">
                        {idx + 1}
                      </td>

                      {/* Indent ID */}
                      <td
                        className="px-2 py-1 border border-gray-300 font-mono text-[11px] font-semibold text-slate-900 truncate"
                        title={String(indentLabel)}
                      >
                        {indentLabel}
                      </td>

                      {/* Type Column (All view) */}
                      {typeKey === 'all' && (
                        <td className="px-2 py-1 border border-gray-300 text-slate-600 truncate">
                          {getIndentCategory(indent)}
                        </td>
                      )}

                      {/* --- MODULAR TYPE ROW CELLS --- */}
                      {typeKey === 'yarn' && (
                        <YarnRowCells
                          indent={indent}
                          cellClasses={cellClasses}
                          onFieldChange={handleFieldChange}
                        />
                      )}

                      {typeKey === 'fabric' && (
                        <FabricRowCells
                          indent={indent}
                          cellClasses={cellClasses}
                          inputClasses={inputClasses}
                          onFieldChange={handleFieldChange}
                        />
                      )}

                      {typeKey === 'spares' && (
                        <SparesRowCells
                          indent={indent}
                          cellClasses={cellClasses}
                          inputClasses={inputClasses}
                          onFieldChange={handleFieldChange}
                        />
                      )}

                      {typeKey === 'dyes' && (
                        <DyesRowCells
                          indent={indent}
                          cellClasses={cellClasses}
                          inputClasses={inputClasses}
                          onFieldChange={handleFieldChange}
                        />
                      )}

                      {(typeKey === 'general' || typeKey === 'all') && (
                        <GeneralRowCells
                          indent={indent}
                          cellClasses={cellClasses}
                          inputClasses={inputClasses}
                          onFieldChange={handleFieldChange}
                        />
                      )}

                      {/* --- DYNAMIC CUSTOM FIELDS CELLS --- */}
                      {dynamicFields.map((field) => {
                        const customVal = indent.customData?.[field.name] ?? '';
                        if (field.type === 'select') {
                          const options = field.options
                            ? field.options.split(',').map((o) => ({ id: o.trim(), name: o.trim() }))
                            : [];
                          return (
                            <td key={field.name} className={cellClasses}>
                              <SearchableTableCellSelect
                                value={customVal}
                                options={dropDownListObject(options, 'name', 'id')}
                                onChange={(nextVal) => handleCustomFieldChange(indent, field.name, nextVal)}
                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                              />
                            </td>
                          );
                        }
                        return (
                          <td key={field.name} className={cellClasses}>
                            <input
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                              value={customVal}
                              onChange={(e) => handleCustomFieldChange(indent, field.name, e.target.value)}
                              className={field.type === 'number' ? numInputClasses : inputClasses}
                              placeholder={field.label || field.name}
                            />
                          </td>
                        );
                      })}

                      {/* --- VENDORS MULTI-SELECT CELL --- */}
                      <td className={cellClasses}>
                        <SearchableTableMultiCellSelect
                          value={indent.vendors || []}
                          options={partyOptions}
                          onChange={(nextValues) => handleVendorsChange(indent, nextValues)}
                          placeholder="Select vendors..."
                          className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                        />
                      </td>

                      {/* --- QTY CELL --- */}
                      <td className={cellClasses}>
                        <input
                          type="number"
                          value={indent.qty ?? ''}
                          onChange={(e) => handleFieldChange(indent, 'qty', Number(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          className={numInputClasses}
                          placeholder="0.00"
                        />
                      </td>

                      {/* --- DOCS BADGE / DRAWER TRIGGER --- */}
                      <td className="px-2 py-1 border border-gray-300 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(indent, 'docs')}
                          aria-label={docsLabel}
                          title={docsLabel}
                          className={`inline-flex items-center gap-1 h-6 px-1.5 rounded-md border text-[11px] font-medium transition-colors ${needsUpdate
                            ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-teal-50 hover:border-teal-600 hover:text-teal-800'
                            }`}
                        >
                          <span className={`text-[9px] leading-none ${state.cls}`} aria-hidden="true">
                            {state.glyph}
                          </span>
                          <DocIcon />
                          <span>{docsCount}</span>
                        </button>
                      </td>

                      {/* --- ACTIONS (Chat + Remove) --- */}
                      <td className="px-2 py-1 border border-gray-300 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenAction(indent, 'chat')}
                            aria-label={`Chat with vendors for ${indentLabel}`}
                            title="Chat with vendors"
                            className="inline-flex items-center gap-1 h-6 px-1.5 rounded-md border border-teal-300 text-teal-800 bg-white hover:bg-teal-50 text-[11px] font-medium transition-colors"
                          >
                            <ChatIcon />
                            <span>Chat</span>
                          </button>
                          {onRemoveIndent && (
                            <button
                              type="button"
                              onClick={() => handleRemove(indent)}
                              aria-label={`Remove ${indentLabel} from lot`}
                              title="Remove from lot"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <CloseIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
