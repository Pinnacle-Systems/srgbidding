import React, { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';

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
    return item?.Indent?.docId || item?.docId || item?.id || '-';
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

export default function IndentSelection({
    matches = [],
    initialSelected = [],
    onConfirm,
    onClose,
    allAssignedIds = [],
    title = '',
}) {
    const [activeCategory, setActiveCategory] = useState('Yarn');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All departments');
    const [selectedIds, setSelectedIds] = useState([]);

    const allItems = useMemo(() => {
        if (matches && matches.length > 0) {
            return matches;
        }
        return DEFAULT_INDENT_ITEMS;
    }, [matches]);

    const availableItems = useMemo(() => {
        return allItems.filter(item => !allAssignedIds.includes(item.id));
    }, [allItems, allAssignedIds]);

    // Initialize selected IDs from initialSelected
    useEffect(() => {
        if (initialSelected && initialSelected.length > 0) {
            const ids = initialSelected.map(i => (typeof i === 'object' ? i.id : i));
            setSelectedIds(ids);
        } else {
            setSelectedIds([]);
        }
    }, [initialSelected]);

    // Gather unique departments for dropdown
    const departments = useMemo(() => {
        const set = new Set();
        availableItems.forEach(item => {
            const deptName = getDepartment(item);
            if (deptName && deptName !== '-') set.add(deptName);
        });
        return ['All departments', ...Array.from(set)];
    }, [availableItems]);

    // Current category items
    const categoryItems = useMemo(() => {
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
        if (selectedIds.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Items Selected',
                text: 'Please select at least one indent item before adding.',
                confirmButtonColor: '#2563eb',
            });
            return;
        }

        const selectedObjects = allItems.filter(item => selectedIds.includes(item.id));
        if (onConfirm) {
            onConfirm(selectedObjects);
        }
    };

    // Selection counts calculation
    const totalSelectedCount = selectedIds.length;
    const uniqueSelectedTypes = useMemo(() => {
        const types = new Set();
        allItems.forEach(item => {
            if (selectedIds.includes(item.id)) {
                types.add(getCategory(item));
            }
        });
        return types;
    }, [allItems, selectedIds]);

    const activeCategoryConfig = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

    return (
        <div className="flex flex-col h-full bg-white text-slate-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">Select indent items</h2>
                        {title && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                {title}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Approved and unassigned lines only</p>
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                )}
            </div>

            {/* Main Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Category Tab Pills with Dynamic Counts */}
                <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIES.map(category => {
                        const itemsInCat = availableItems.filter(
                            i => getCategory(i).toLowerCase() === category.id.toLowerCase()
                        );
                        const totalCount = itemsInCat.length;
                        const selectedCount = itemsInCat.filter(i => selectedIds.includes(i.id)).length;
                        const isActive = activeCategory === category.id;

                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                    setActiveCategory(category.id);
                                    setSearchTerm('');
                                }}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                }`}
                            >
                                <span>{category.label}</span>
                                <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}
                                >
                                    {selectedCount}/{totalCount}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Contextual Info Banner */}
                <div className="bg-blue-50/80 border border-blue-200/80 text-blue-900 rounded-lg px-4 py-2.5 text-xs flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{activeCategoryConfig.hint}</span>
                </div>

                {/* Search & Department Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search indent no, item, department"
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        <svg
                            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Department:</label>
                        <select
                            value={selectedDept}
                            onChange={e => setSelectedDept(e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table Container */}
                <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                            <tr>
                                <th className="px-3 py-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllCategorySelected}
                                        ref={el => {
                                            if (el) el.indeterminate = isSomeCategorySelected;
                                        }}
                                        onChange={e => handleSelectAllCategory(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-3 py-3 font-semibold">Indent no</th>
                                <th className="px-3 py-3 font-semibold">Department</th>

                                {/* Adaptive Columns by Category */}
                                {activeCategory === 'Yarn' && (
                                    <>
                                        <th className="px-3 py-3 font-semibold">Yarn Name</th>
                                        <th className="px-3 py-3 font-semibold">Count</th>
                                        <th className="px-3 py-3 font-semibold">Blend</th>
                                        <th className="px-3 py-3 font-semibold">Ply</th>
                                        <th className="px-3 py-3 font-semibold">Shade</th>
                                        <th className="px-3 py-3 font-semibold text-right">Qty (kg)</th>
                                    </>
                                )}

                                {activeCategory === 'Fabric' && (
                                    <>
                                        <th className="px-3 py-3 font-semibold">Fabric Name</th>
                                        <th className="px-3 py-3 font-semibold">Construction</th>
                                        <th className="px-3 py-3 font-semibold">GSM</th>
                                        <th className="px-3 py-3 font-semibold">Width</th>
                                        <th className="px-3 py-3 font-semibold">Finish / Color</th>
                                        <th className="px-3 py-3 font-semibold text-right">Qty</th>
                                    </>
                                )}

                                {activeCategory === 'Machine spares' && (
                                    <>
                                        <th className="px-3 py-3 font-semibold">Machine Spare Name</th>
                                        <th className="px-3 py-3 font-semibold">Part No</th>
                                        <th className="px-3 py-3 font-semibold">Make</th>
                                        <th className="px-3 py-3 font-semibold">Specification</th>
                                        <th className="px-3 py-3 font-semibold text-right">Qty</th>
                                    </>
                                )}

                                {activeCategory === 'Dyes and chemicals' && (
                                    <>
                                        <th className="px-3 py-3 font-semibold">Dyes and chemicals Name</th>
                                        <th className="px-3 py-3 font-semibold">Code</th>
                                        <th className="px-3 py-3 font-semibold">Brand</th>
                                        <th className="px-3 py-3 font-semibold">Grade</th>
                                        <th className="px-3 py-3 font-semibold text-right">Qty (kg)</th>
                                    </>
                                )}

                                {activeCategory === 'General' && (
                                    <>
                                        <th className="px-3 py-3 font-semibold">Item Name</th>
                                        <th className="px-3 py-3 font-semibold">Specification</th>
                                        <th className="px-3 py-3 font-semibold">UOM</th>
                                        <th className="px-3 py-3 font-semibold text-right">Qty</th>
                                    </>
                                )}

                                <th className="px-3 py-3 font-semibold">Required by</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-10 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="font-medium text-slate-600">No indent items found</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Try adjusting your search terms or department filter.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map(item => {
                                    const isSelected = selectedIds.includes(item.id);

                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleToggleItem(item.id)}
                                            className={`cursor-pointer transition-colors ${
                                                isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleItem(item.id)}
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>

                                            <td className="px-3 py-3 font-medium text-slate-900">{getDocId(item)}</td>
                                            <td className="px-3 py-3 text-slate-600">{getDepartment(item)}</td>

                                            {/* Adaptive Table Cells by Category */}
                                            {activeCategory === 'Yarn' && (
                                                <>
                                                    <td className="px-3 py-3 text-slate-600">{item.Yarn?.name || getItemName(item)}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.Counts?.name || item.count || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.YarnBlend?.name || item.blend || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.ply || item.customData?.ply || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.shade || item.Color?.name || item.customData?.shade || '-'}</td>
                                                    <td className="px-3 py-3 text-right font-medium text-slate-900">
                                                        {Number(item.qty || 0).toLocaleString()}
                                                    </td>
                                                </>
                                            )}

                                            {activeCategory === 'Fabric' && (
                                                <>
                                                    <td className="px-3 py-3 text-slate-600">{item.Fabric?.name || getItemName(item)}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.construction || item.customData?.construction || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.gsm || item.Gsm?.name || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.width || item.customData?.width || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.shade || item.Color?.name || '-'}</td>
                                                    <td className="px-3 py-3 text-right font-medium text-slate-900">
                                                        {Number(item.qty || 0).toLocaleString()} {getUom(item)}
                                                    </td>
                                                </>
                                            )}

                                            {activeCategory === 'Machine spares' && (
                                                <>
                                                    <td className="px-3 py-3 text-slate-600">{getItemName(item)}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.partNo || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.make || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.spec || '-'}</td>
                                                    <td className="px-3 py-3 text-right font-medium text-slate-900">
                                                        {Number(item.qty || 0).toLocaleString()} {getUom(item)}
                                                    </td>
                                                </>
                                            )}

                                            {activeCategory === 'Dyes and chemicals' && (
                                                <>
                                                    <td className="px-3 py-3 text-slate-600">{getItemName(item)}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.code || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.brand || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.grade || '-'}</td>
                                                    <td className="px-3 py-3 text-right font-medium text-slate-900">
                                                        {Number(item.qty || 0).toLocaleString()}
                                                    </td>
                                                </>
                                            )}

                                            {activeCategory === 'General' && (
                                                <>
                                                    <td className="px-3 py-3 text-slate-600">{getItemName(item)}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.spec || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600">{getUom(item) || '-'}</td>
                                                    <td className="px-3 py-3 text-right font-medium text-slate-900">
                                                        {Number(item.qty || 0).toLocaleString()}
                                                    </td>
                                                </>
                                            )}

                                            <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                                                {getRequiredDate(item)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-slate-600 font-medium">
                    <span>{totalSelectedCount} selected across {uniqueSelectedTypes.size} type(s)</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={handleClearAll}
                        disabled={totalSelectedCount === 0}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            totalSelectedCount === 0
                                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                        Clear all
                    </button>

                    <button
                        type="button"
                        onClick={handleAddSelection}
                        className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                    >
                        Add to bid
                    </button>
                </div>
            </div>
        </div>
    );
}
