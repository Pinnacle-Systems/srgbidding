import { FiTrash2 } from "react-icons/fi";
import TransactionLineItemsSection from "../ReusableComponents/TransactionLineItemsSection";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect";
import { dropDownListObject } from "../../../Utils/contructObject";


export default function YarnTable({
    indentItems = [],
    setIndentItems,
    readOnly,
    id,
    yarnList,
    yarnBlendMasterList,
    countsMasterList,
    partyList,
    uomList,
    sizeList,
    colorList,
    onChange // Added onChange handler for future use
}) {
    const headerClasses = "px-2 py-1.5 text-left text-[11px] font-bold text-slate-700 uppercase tracking-wider border border-gray-300";
    const cellClasses = "px-0.5 py-0 border border-gray-300 relative";
    const inputClasses = "w-full h-6 border border-transparent bg-transparent px-2 text-[11px] text-gray-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded transition-all disabled:bg-slate-50 disabled:text-gray-500 disabled:cursor-not-allowed placeholder:text-gray-400";
    const numInputClasses = `${inputClasses} text-right`;

    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(indentItems);
        newBlend[index][field] = value;
        setIndentItems(newBlend);
    };

    return (
        <fieldset className="h-full min-h-0 bg-white rounded-lg shadow-sm border border-gray-200">
            <TransactionLineItemsSection
                panelClassName="h-full min-h-0"
                contentClassName="min-h-0 overflow-hidden rounded-b-lg border-t border-gray-200 !py-0 bg-white"
            >
                <div className="h-full overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="w-full border-collapse bg-white">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className={`${headerClasses} w-12 text-center`}>S.no</th>
                                <th className={`${headerClasses} w-48`}>Yarn Name</th>
                                <th className={`${headerClasses} w-32`}>Composition/Blend</th>
                                <th className={`${headerClasses} w-32`}>Counts</th>
                                <th className={`${headerClasses} w-32`}>Mill</th>
                                <th className={`${headerClasses} w-32`}>Color</th>
                                <th className={`${headerClasses} w-24`}>UOM</th>
                                <th className={`${headerClasses} w-24 text-right`}>Qty</th>
                                <th className={`${headerClasses} w-12 text-center`}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(indentItems && indentItems.length > 0 ? indentItems : Array.from({ length: 8 })).map((row, index) => {
                                const disabled = readOnly;

                                return (
                                    <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-2 py-0 border border-gray-300 text-[11px] font-medium text-slate-500 text-center">
                                            {index + 1}
                                        </td>
                                        <td className={cellClasses}>
                                            <SearchableTableCellSelect
                                                value={row?.yarnId || ""}
                                                options={dropDownListObject(id ? yarnList?.data : yarnList?.data?.filter(i => i.active) || [], "name", "id")}
                                                disabled={disabled}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "yarnId")}
                                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                            />
                                        </td>
                                        <td className={cellClasses}>
                                            <SearchableTableCellSelect
                                                value={row?.yarnBlendId || ""}
                                                options={dropDownListObject(id ? yarnBlendMasterList?.data : yarnBlendMasterList?.data?.filter(i => i.active) || [], "name", "id")} disabled={disabled}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "yarnBlendId")}
                                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                            />
                                        </td>

                                        <td className={cellClasses}>
                                            <SearchableTableCellSelect
                                                value={row?.countsId || ""}
                                                options={dropDownListObject(id ? countsMasterList?.data : countsMasterList?.data?.filter(i => i.active) || [], "name", "id")}
                                                disabled={disabled}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "countsId")}
                                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                            />
                                        </td>
                                        <td className={cellClasses}>
                                            <SearchableTableCellSelect
                                                value={row?.millId || ""}
                                                options={dropDownListObject(id ? partyList?.data : partyList?.data?.filter(i => i.active) || [], "name", "id")} disabled={disabled}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "millId")}
                                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                            />
                                        </td>
                                        <td className={cellClasses}>
                                            <SearchableTableCellSelect
                                                value={row?.colorId || ""}
                                                options={dropDownListObject(id ? colorList?.data : colorList?.data?.filter(i => i.active) || [], "name", "id")} disabled={disabled}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "colorId")}
                                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                            />
                                        </td>
                                        <td className={cellClasses}>
                                            <SearchableTableCellSelect
                                                value={row?.uomId || ""}
                                                options={dropDownListObject(id ? uomList?.data : uomList?.data?.filter(i => i.active) || [], "name", "id")} disabled={disabled}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "uomId")}
                                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                            />
                                        </td>
                                        <td className={cellClasses}>
                                            <input
                                                type="number"
                                                value={row?.qty || ""}
                                                disabled={disabled}
                                                onChange={(e) => handleInputChange(e.target.value, index, "qty")}
                                                onFocus={(e) => e.target.select()}
                                                className={numInputClasses}
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="px-2 py-0 border border-gray-300 text-center">
                                            {!disabled && (
                                                <button
                                                    type="button"
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-all focus:outline-none opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    title="Remove row"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </TransactionLineItemsSection>
        </fieldset>
    );
}
