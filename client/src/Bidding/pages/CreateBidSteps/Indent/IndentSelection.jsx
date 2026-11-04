import React, { useState, useMemo, useEffect } from 'react';

export const DEFAULT_INDENT_ITEMS = [
    // Yarn (3 items)
    {
        id: 'IND-3101',
        category: 'Yarn',
        department: 'Spinning',
        item_name: 'Cotton combed yarn',
        count: '40s',
        blend: '100% cotton',
        ply: 'Single',
        shade: 'Raw white',
        qty: 5000,
        uom: 'kg',
        requiredBy: '30 Oct',
        status: 'Approved',
    },
    {
        id: 'IND-3104',
        category: 'Yarn',
        department: 'Knitting',
        item_name: 'PC blend yarn',
        count: '30s',
        blend: '65/35 PC',
        ply: 'Single',
        shade: 'Grey melange',
        qty: 2500,
        uom: 'kg',
        requiredBy: '05 Nov',
        status: 'Approved',
    },
    {
        id: 'IND-3109',
        category: 'Yarn',
        department: 'Weaving',
        item_name: 'Polyester filament',
        count: '150D',
        blend: '100% poly',
        ply: '2 ply',
        shade: 'Dope dyed black',
        qty: 1200,
        uom: 'kg',
        requiredBy: '12 Nov',
        status: 'Approved',
    },

    // Fabric (2 items)
    {
        id: 'IND-3201',
        category: 'Fabric',
        department: 'Knitting',
        item_name: 'Single jersey knit',
        construction: '30s Combed',
        gsm: '180',
        width: '66"',
        shade: 'Bio-wash black',
        qty: 1800,
        uom: 'kg',
        requiredBy: '18 Nov',
        status: 'Approved',
    },
    {
        id: 'IND-3205',
        category: 'Fabric',
        department: 'Weaving',
        item_name: 'Cotton twill 2/1',
        construction: '40x40 / 130x70',
        gsm: '220',
        width: '58"',
        shade: 'Optical white',
        qty: 3500,
        uom: 'm',
        requiredBy: '22 Nov',
        status: 'Approved',
    },

    // Machine spares (3 items)
    {
        id: 'IND-3301',
        category: 'Machine spares',
        department: 'Maintenance',
        item_name: 'Circulation pump seal kit',
        partNo: 'SP-884',
        make: "Fong's",
        spec: 'Silicon carbide / viton',
        qty: 6,
        uom: 'set',
        requiredBy: '25 Oct',
        status: 'Approved',
    },
    {
        id: 'IND-3304',
        category: 'Machine spares',
        department: 'Spinning',
        item_name: 'Ring travelers',
        partNo: 'RT-C28',
        make: 'Bracker',
        spec: 'Sapphire finish C-shape',
        qty: 500,
        uom: 'nos',
        requiredBy: '08 Nov',
        status: 'Approved',
    },
    {
        id: 'IND-3310',
        category: 'Machine spares',
        department: 'Knitting',
        item_name: 'Knitting needles',
        partNo: 'VO 74.52',
        make: 'Groz-Beckert',
        spec: 'Cylinder needle gauge 28',
        qty: 250,
        uom: 'nos',
        requiredBy: '15 Nov',
        status: 'Approved',
    },

    // Dyes and chemicals (3 items)
    {
        id: 'IND-3402',
        category: 'Dyes and chemicals',
        department: 'Dyeing',
        item_name: 'Reactive red dye',
        code: 'DYE-RED-RGB',
        brand: 'Dystar',
        grade: 'Concentrated liquid',
        qty: 250,
        uom: 'kg',
        requiredBy: '28 Oct',
        status: 'Approved',
    },
    {
        id: 'IND-3406',
        category: 'Dyes and chemicals',
        department: 'Processing',
        item_name: 'Acetic acid 99%',
        code: 'CHM-AC-GLAC',
        brand: 'GNFC',
        grade: 'Glacial technical',
        qty: 1000,
        uom: 'kg',
        requiredBy: '02 Nov',
        status: 'Approved',
    },
    {
        id: 'IND-3411',
        category: 'Dyes and chemicals',
        department: 'Dyeing',
        item_name: 'Wetting agent',
        code: 'AUX-WET-100',
        brand: 'Archroma',
        grade: 'Eco non-ionic',
        qty: 450,
        uom: 'kg',
        requiredBy: '10 Nov',
        status: 'Approved',
    },

    // General (2 items)
    {
        id: 'IND-3501',
        category: 'General',
        department: 'Stores',
        item_name: 'Corrugated packing cartons',
        spec: '7-ply heavy duty 600x400x400mm',
        uom: 'pcs',
        qty: 800,
        requiredBy: '04 Nov',
        status: 'Approved',
    },
    {
        id: 'IND-3508',
        category: 'General',
        department: 'Security & Admin',
        item_name: 'Industrial safety gloves',
        spec: 'Cut-resistant Level 5 PU coated',
        uom: 'pairs',
        qty: 150,
        requiredBy: '12 Nov',
        status: 'Approved',
    },
];

const CATEGORIES = [
    { id: 'Yarn', label: 'Yarn', hint: 'Yarn indents are identified by count, blend and shade.' },
    { id: 'Fabric', label: 'Fabric', hint: 'Fabric indents are identified by construction, composition, GSM and width.' },
    { id: 'Machine spares', label: 'Machine spares', hint: 'Machine spares indents are identified by part number, machine make and model.' },
    { id: 'Dyes and chemicals', label: 'Dyes and chemicals', hint: 'Dyes and chemicals indents are identified by chemical code, brand and concentration.' },
    { id: 'General', label: 'General', hint: 'General indents are identified by item description, department and specification.' },
];

export const getDepartment = (item) => {
    const dept = item?.Indent?.Department || item?.department || item?.Department;
    if (!dept) return '-';
    if (typeof dept === 'object') return dept.name || '-';
    return String(dept);
};

export const getCategory = (item) => {
    const raw = item?.category || item?.Indent?.indentType || item?.indentType || item?.type || '';
    const lower = String(raw).toLowerCase();
    if (lower.includes('yarn')) return 'Yarn';
    if (lower.includes('fabric')) return 'Fabric';
    if (lower.includes('spare') || lower.includes('machine')) return 'Machine spares';
    if (lower.includes('dye') || lower.includes('chem')) return 'Dyes and chemicals';
    if (lower.includes('general')) return 'General';
    return raw || 'General';
};

export const getUom = (item) => {
    const u = item?.Uom || item?.uom;
    if (!u) return '';
    if (typeof u === 'object') return u.name || '';
    return String(u);
};

export const getItemName = (item) => {
    if (item?.Yarn?.name) return item.Yarn.name;
    if (item?.Fabric?.name) return item.Fabric.name;
    if (item?.Item?.name) return item.Item.name;
    if (typeof item?.item_name === 'object') return item.item_name?.name || '-';
    return item?.item_name || item?.item || '-';
};

export const getDocId = (item) => {
    return item?.itemsDocId || item?.docId || item?.id || '-';
};

export const getRequiredDate = (item) => {
    if (item?.requiredBy) return String(item.requiredBy);
    const dateVal = item?.Indent?.requiredDate || item?.requiredDate || item?.Indent?.docDate;
    if (dateVal) {
        try {
            return new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        } catch {
            return String(dateVal);
        }
    }
    return '-';
};

/* ───────────── Table columns (shared by every tab) ───────────── */

const ALL_TAB = {
    id: 'All',
    label: 'All',
    hint: 'Every approved, unassigned indent. Pick a type tab to see its detailed columns.',
};
const TABS = [ALL_TAB, ...CATEGORIES];

const num = (v) => Number(v || 0).toLocaleString();

const qtyText = (item) => {
    const uom = getUom(item);
    return `${num(item.qty)}${uom ? ` ${uom}` : ''}`;
};

const col = (label, value, opts = {}) => ({ label, value, ...opts });

const QTY_COL = col('Qty', qtyText, { align: 'right' });

const TYPE_COLUMNS = {
    All: [
        col('Type', (i) => getCategory(i)),
        col('Item', (i) => getItemName(i), { strong: true }),
        QTY_COL,
    ],
    Yarn: [
        col('Yarn name', (i) => i.Yarn?.name || getItemName(i), { strong: true }),
        col('Count', (i) => i.Counts?.name || i.count),
        col('Blend', (i) => i.YarnBlend?.name || i.blend),
        col('Ply', (i) => i.ply || i.customData?.ply),
        col('Shade', (i) => i.shade || i.Color?.name || i.customData?.shade),
        QTY_COL,
    ],
    Fabric: [
        col('Fabric name', (i) => i.Fabric?.name || getItemName(i), { strong: true }),
        col('Construction', (i) => i.construction || i.customData?.construction),
        col('GSM', (i) => i.gsm || i.Gsm?.name),
        col('Width', (i) => i.width || i.customData?.width),
        col('Finish / Color', (i) => i.shade || i.Color?.name),
        QTY_COL,
    ],
    'Machine spares': [
        col('Spare name', (i) => getItemName(i), { strong: true }),
        col('Part no', (i) => i.partNo),
        col('Make', (i) => i.make),
        col('Specification', (i) => i.spec),
        QTY_COL,
    ],
    'Dyes and chemicals': [
        col('Name', (i) => getItemName(i), { strong: true }),
        col('Code', (i) => i.code),
        col('Brand', (i) => i.brand),
        col('Grade', (i) => i.grade),
        QTY_COL,
    ],
    General: [
        col('Item name', (i) => getItemName(i), { strong: true }),
        col('Specification', (i) => i.spec),
        QTY_COL,
    ],
};

const display = (v) => (v === undefined || v === null || v === '' ? '-' : String(v));

const cellBase = 'px-2.5 py-1 whitespace-nowrap';
const headBase =
    'sticky top-0 z-10 bg-slate-200 px-2.5 py-2 font-semibold text-slate-800 border-b border-slate-300 whitespace-nowrap';

/**
 * Modal body for picking indents for a lot. Dense table that uses the full
 * modal height; "All" is the default tab so the most indents are visible at once.
 */
export default function IndentSelection({
    matches = [],
    initialSelected = [],
    onConfirm,
    onClose,
    allAssignedIds = [],
    title = '',
}) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All departments');
    const [selectedIds, setSelectedIds] = useState([]);

    const allItems = useMemo(() => {
        if (matches && matches.length > 0) {
            return matches;
        }
        return [];
    }, [matches]);

    const availableItems = useMemo(() => {
        return allItems.filter(item => !allAssignedIds.includes(item.id));
    }, [allItems, allAssignedIds]);

    // Initialize selected IDs from initialSelected. Keyed on the ids themselves (not the
    // array identity) so a parent re-render never wipes the user's in-progress selection.
    const initialIdsKey = (initialSelected || [])
        .map(i => (typeof i === 'object' ? i.id : i))
        .join('|');
    useEffect(() => {
        if (initialSelected && initialSelected.length > 0) {
            setSelectedIds(initialSelected.map(i => (typeof i === 'object' ? i.id : i)));
        } else {
            setSelectedIds([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialIdsKey]);

    // Gather unique departments for dropdown
    const departments = useMemo(() => {
        const set = new Set();
        availableItems.forEach(item => {
            const deptName = getDepartment(item);
            if (deptName && deptName !== '-') set.add(deptName);
        });
        return ['All departments', ...Array.from(set)];
    }, [availableItems]);

    // Items in the active tab ("All" = every available item)
    const categoryItems = useMemo(() => {
        if (activeCategory === 'All') return availableItems;
        return availableItems.filter(
            item => getCategory(item).toLowerCase() === activeCategory.toLowerCase()
        );
    }, [availableItems, activeCategory]);

    // Filtered items in active tab based on search and department
    const filteredItems = useMemo(() => {
        return categoryItems.filter(item => {
            // Department filter
            if (selectedDept !== 'All departments' && getDepartment(item) !== selectedDept) {
                return false;
            }
            // Search filter
            if (searchTerm.trim()) {
                const query = searchTerm.toLowerCase();
                const idMatch = String(getDocId(item)).toLowerCase().includes(query);
                const nameMatch = String(getItemName(item)).toLowerCase().includes(query);
                const deptMatch = String(getDepartment(item)).toLowerCase().includes(query);
                const blendMatch = String(item?.YarnBlend?.name || item?.blend || '').toLowerCase().includes(query);
                const countMatch = String(item?.Counts?.name || item?.count || '').toLowerCase().includes(query);
                const partMatch = String(item?.partNo || '').toLowerCase().includes(query);
                const codeMatch = String(item?.code || '').toLowerCase().includes(query);
                return idMatch || nameMatch || deptMatch || blendMatch || countMatch || partMatch || codeMatch;
            }
            return true;
        });
    }, [categoryItems, selectedDept, searchTerm]);

    // Selection toggles
    const handleToggleItem = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllCategory = (checked) => {
        const currentFilteredIds = filteredItems.map(item => item.id);
        if (checked) {
            setSelectedIds(prev => Array.from(new Set([...prev, ...currentFilteredIds])));
        } else {
            setSelectedIds(prev => prev.filter(id => !currentFilteredIds.includes(id)));
        }
    };

    const isAllCategorySelected =
        filteredItems.length > 0 && filteredItems.every(item => selectedIds.includes(item.id));
    const isSomeCategorySelected =
        filteredItems.some(item => selectedIds.includes(item.id)) && !isAllCategorySelected;

    const handleClearAll = () => {
        setSelectedIds([]);
    };

    const handleAddSelection = () => {
        if (selectedIds.length === 0) return;
        const selectedObjects = allItems.filter(item => selectedIds.includes(item.id));
        if (onConfirm) {
            onConfirm(selectedObjects);
        }
    };

    // Selection summary: count, per-type breakdown and quantity totals
    const totalSelectedCount = selectedIds.length;
    const selectionSummary = useMemo(() => {
        const byType = new Map();
        const byUom = new Map();
        allItems.forEach(item => {
            if (!selectedIds.includes(item.id)) return;
            const type = getCategory(item);
            byType.set(type, (byType.get(type) || 0) + 1);
            const uom = getUom(item);
            byUom.set(uom, (byUom.get(uom) || 0) + Number(item.qty || 0));
        });
        return {
            types: Array.from(byType.entries()).map(([type, count]) => `${type} ${count}`).join(' · '),
            qty: Array.from(byUom.entries())
                .map(([uom, total]) => `${num(total)}${uom ? ` ${uom}` : ''}`)
                .join(' · '),
        };
    }, [allItems, selectedIds]);

    const columns = TYPE_COLUMNS[activeCategory] || TYPE_COLUMNS.All;
    const activeTab = TABS.find(t => t.id === activeCategory) || ALL_TAB;
    const checkboxCls = 'w-3.5 h-3.5 accent-teal-700 cursor-pointer';

    return (
        <div className="flex flex-col h-full bg-white text-slate-800 rounded-lg overflow-hidden">
            {/* Header: title + lot (right padding leaves room for the modal's own close button) */}
            <div className="pl-4 pr-10 py-2.5 border-b border-slate-200 flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-base font-semibold text-slate-900">Select indent items</h2>
                {title && (
                    <span className="text-xs font-semibold px-2.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 leading-5">
                        {title}
                    </span>
                )}
                <span className="text-xs text-slate-500">Approved and unassigned lines only</span>
            </div>

            {/* Toolbar: type tabs + search + department, all on one row */}
            <div className="px-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <div className="flex flex-wrap gap-0.5" role="group" aria-label="Indent type">
                    {TABS.map(tab => {
                        const itemsInTab = tab.id === 'All'
                            ? availableItems
                            : availableItems.filter(i => getCategory(i).toLowerCase() === tab.id.toLowerCase());
                        const selectedCount = itemsInTab.filter(i => selectedIds.includes(i.id)).length;
                        const isActive = activeCategory === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                title={tab.hint}
                                aria-pressed={isActive}
                                onClick={() => {
                                    setActiveCategory(tab.id);
                                    setSearchTerm('');
                                }}
                                className={`px-3 pt-2.5 pb-2 text-xs border-b-2 transition-colors flex items-center gap-1.5 ${isActive
                                    ? 'border-teal-700 text-teal-800 font-semibold'
                                    : 'border-transparent text-slate-600 font-medium hover:text-slate-900'
                                    }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`min-w-[34px] px-1.5 rounded-full text-center text-[11px] font-medium ${isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                                        }`}
                                >
                                    {selectedCount}/{itemsInTab.length}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center gap-2 py-1.5">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search indent no, item, department"
                            aria-label="Search indents"
                            className="w-64 h-8 pl-8 pr-7 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-700 transition-colors"
                        />
                        <svg
                            className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <span className="whitespace-nowrap">Department</span>
                        <select
                            value={selectedDept}
                            onChange={e => setSelectedDept(e.target.value)}
                            className="h-8 bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-700"
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {/* Table — takes all remaining height and scrolls; header stays pinned */}
            <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full min-w-[860px] text-xs text-left border-collapse">
                    <caption className="sr-only">{activeTab.hint}</caption>
                    <thead>
                        <tr>
                            <th scope="col" className={`${headBase} w-9 text-center`}>
                                <input
                                    type="checkbox"
                                    checked={isAllCategorySelected}
                                    ref={el => {
                                        if (el) el.indeterminate = isSomeCategorySelected;
                                    }}
                                    onChange={e => handleSelectAllCategory(e.target.checked)}
                                    aria-label="Select all shown indents"
                                    className={checkboxCls}
                                />
                            </th>
                            <th scope="col" className={headBase}>Indent no</th>
                            <th scope="col" className={headBase}>Department</th>
                            {columns.map(c => (
                                <th
                                    key={c.label}
                                    scope="col"
                                    className={`${headBase} ${c.align === 'right' ? 'text-right' : ''}`}
                                >
                                    {c.label}
                                </th>
                            ))}
                            <th scope="col" className={headBase}>Required by</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 4} className="px-6 py-12 text-center text-slate-500">
                                    <p className="font-medium text-slate-700">No indent items found</p>
                                    <p className="text-xs mt-1">Try adjusting your search terms, type or department filter.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item, idx) => {
                                const isSelected = selectedIds.includes(item.id);
                                const docId = getDocId(item);

                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() => handleToggleItem(item.id)}
                                        className={`cursor-pointer border-b border-slate-100 transition-colors ${isSelected
                                            ? 'bg-teal-50 hover:bg-teal-100/70'
                                            : idx % 2
                                                ? 'bg-slate-50/70 hover:bg-teal-50/60'
                                                : 'bg-white hover:bg-teal-50/60'
                                            }`}
                                    >
                                        <td className={`${cellBase} text-center`} onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleToggleItem(item.id)}
                                                aria-label={`Select ${docId}`}
                                                className={checkboxCls}
                                            />
                                        </td>
                                        <td className={`${cellBase} font-mono text-[11.5px] font-semibold text-slate-900`}>{docId}</td>
                                        <td className={`${cellBase} text-slate-700`}>{getDepartment(item)}</td>

                                        {columns.map(c => {
                                            const text = display(c.value(item));
                                            return (
                                                <td
                                                    key={c.label}
                                                    title={text}
                                                    className={`${cellBase} max-w-[260px] truncate ${c.align === 'right' ? 'text-right tabular-nums font-medium text-slate-900' : 'text-slate-700'
                                                        } ${c.strong ? 'font-medium text-slate-900' : ''}`}
                                                >
                                                    {text}
                                                </td>
                                            );
                                        })}

                                        <td className={`${cellBase} text-slate-700`}>{getRequiredDate(item)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer: showing / selection summary + actions */}
            <div className="px-4 py-2.5 border-t border-slate-300 bg-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-600">
                    <span>
                        Showing <b className="font-semibold text-slate-900">{filteredItems.length}</b> of {categoryItems.length}
                    </span>
                    <span className="text-slate-900 font-semibold">
                        {totalSelectedCount} selected
                        {totalSelectedCount > 0 && (
                            <span className="font-normal text-slate-600"> · {selectionSummary.types}</span>
                        )}
                    </span>
                    {totalSelectedCount > 0 && selectionSummary.qty && (
                        <span>Qty {selectionSummary.qty}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleClearAll}
                        disabled={totalSelectedCount === 0}
                        className={`h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${totalSelectedCount === 0
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                    >
                        Clear all
                    </button>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-8 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleAddSelection}
                        disabled={totalSelectedCount === 0}
                        title={totalSelectedCount === 0 ? 'Select at least one indent' : undefined}
                        className={`h-8 px-4 rounded-lg text-xs font-semibold shadow-sm transition-colors ${totalSelectedCount === 0
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-teal-700 hover:bg-teal-800 text-white'
                            }`}
                    >
                        {totalSelectedCount > 0 ? `Add ${totalSelectedCount} to bid` : 'Add to bid'}
                    </button>
                </div>
            </div>
        </div>
    );
}
