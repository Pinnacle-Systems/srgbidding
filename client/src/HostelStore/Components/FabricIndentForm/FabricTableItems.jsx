import { FiTrash2 } from "react-icons/fi";
import TransactionLineItemsSection from "../ReusableComponents/TransactionLineItemsSection";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect";
import { dropDownListObject } from "../../../Utils/contructObject";


export default function FabricTable({
    indentItems = [],
    setIndentItems,
    readOnly,
    id,
    fabricData,
    gsmData,
    colorList,
    uomList,
}) {
    const headerClasses = "px-2 py-1.5 text-left text-[11px] font-bold text-white  tracking-wider border border-gray-300";
    const cellClasses = "px-0.5 py-0 border border-gray-300 relative";
    const inputClasses = "w-full h-5 border border-transparent bg-transparent px-2 text-[10px] text-gray-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded transition-all disabled:bg-slate-50 disabled:text-gray-500 disabled:cursor-not-allowed placeholder:text-gray-400";
    const numInputClasses = `${inputClasses} text-right`;

    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(indentItems);
        newBlend[index][field] = value;
        setIndentItems(newBlend);
    };

    return (
        <fieldset className="h-full min-h-0 bg-white rounded-lg ">
            <TransactionLineItemsSection
                panelClassName="h-full min-h-0"
                contentClassName="min-h-0 overflow-hidden rounded-b-lg !py-0 bg-white"
            >
                <div className="h-full overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="w-full border-collapse bg-white">
                        <thead className="bg-[#5147B8] sticky top-0 z-10 ">
                            <tr>
                                <th className={`${headerClasses} w-10 text-center`}>S.no</th>
                                <th className={`${headerClasses} w-48`}>Fabric Name</th>
                                <th className={`${headerClasses} w-32`}>GSM</th>
                                <th className={`${headerClasses} w-32`}>Width</th>
                                <th className={`${headerClasses} w-32`}>Color</th>
                                <th className={`${headerClasses} w-24`}>Uom</th>
                                <th className={`${headerClasses} w-24`}>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(indentItems && indentItems.length > 0 ? indentItems : Array.from({ length: 8 })).map((row, index) => {
                                const disabled = readOnly;

                                return (
                                    <tr key={index} className={`  
                                        ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/50'} hover:bg-blue-50/50  transition-colors group`}>                                        <td className="px-2 py-0 border border-gray-300 text-[11px] font-medium text-slate-500 text-center">
                                            {index + 1}
                                        </td>
                                        <td className={cellClasses}>
                                            <SearchableTableCellSelect
                                                value={row?.fabricId || ""}
                                                options={dropDownListObject(id ? fabricData?.data : fabricData?.data?.filter(i => i.active) || [], "name", "id")}
                                                disabled={disabled}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "fabricId")}
                                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                            />
                                        </td>
                                        <td className={cellClasses}>
                                            <SearchableTableCellSelect
                                                value={row?.gsmId || ""}
                                                options={dropDownListObject(id ? gsmData?.data : gsmData?.data?.filter(i => i.active) || [], "name", "id")} disabled={disabled}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "gsmId")}
                                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                            />
                                        </td>

                                        <td className={cellClasses}>
                                            <input
                                                value={row?.width || ""}
                                                disabled={disabled}
                                                onChange={(e) => handleInputChange(e.target.value, index, "width")}
                                                className={numInputClasses}
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
                                                className={numInputClasses}
                                                placeholder="0.00"
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="sticky bottom-0  z-10 bg-[#E1E7FC] h-[4px] ">
                            <tr>
                                <td colSpan={1} className="px-2 py-1 text-[11px] font-bold text-gray-700 border border-gray-300">
                                </td>
                                <td colSpan={2} className="px-2 py-1 text-[11px] font-bold text-gray-700 border border-gray-300">
                                    Total  {indentItems?.filter(i => i?.fabricId)?.length || 0} Items
                                </td>
                                <td colSpan={3} className="px-2 py-1.5 text-[11px] border justify-end"></td>
                                <td colSpan={1} className="px-2 py-1.5 text-[11px] border text-end">
                                    {indentItems?.filter(i => i?.fabricId)?.reduce((acc, item) => acc + Number(item?.qty || 0), 0).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </TransactionLineItemsSection>
        </fieldset>
    );
}

