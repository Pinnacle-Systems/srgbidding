import { FiTrash2 } from "react-icons/fi";
import TransactionLineItemsSection from "../ReusableComponents/TransactionLineItemsSection";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect";
import { dropDownListObject } from "../../../Utils/contructObject";


export default function SparePartsTable({
    indentItems = [],
    setIndentItems,
    readOnly,
    id,
    itemData,
    gsmData,
    colorList,
    uomList,
    dynamicFields = [] // Dynamic fields from Control Panel
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

    const handleCustomInputChange = (value, index, field) => {
        const newBlend = structuredClone(indentItems);
        if (!newBlend[index].customData) {
            newBlend[index].customData = {};
        }
        newBlend[index].customData[field] = value;
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
                                <th className={`${headerClasses} w-48`}>Item Name</th>
                                <th className={`${headerClasses} w-32`}>Make</th>
                                <th className={`${headerClasses} w-32`}>Color</th>
                                <th className={`${headerClasses} w-24`}>Uom</th>
                                {dynamicFields.map(field => (
                                    <th key={field.name} className={`${headerClasses} w-32`}>{field.label}</th>
                                ))}
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
                                                value={row?.itemId || ""}
                                                options={dropDownListObject(id ? itemData?.data : itemData?.data?.filter(i => i.active) || [], "name", "id")}
                                                disabled={disabled}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "itemId")}
                                                className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                            />
                                        </td>
                                        <td className={cellClasses}>
                                            <input
                                                type="number"
                                                value={row?.make || ""}
                                                disabled={disabled}
                                                onChange={(e) => handleInputChange(e.target.value, index, "make")}
                                                className={inputClasses}
                                                // placeholder="Enter Make"
                                                onFocus={(e) => e.target.select()}
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
                                        
                                        {/* RENDER DYNAMIC CUSTOM FIELDS */}
                                        {dynamicFields.map(field => {
                                            const customVal = row?.customData?.[field.name] || "";
                                            
                                            if (field.type === 'select') {
                                                const options = field.options ? field.options.split(',').map(o => ({ id: o.trim(), name: o.trim() })) : [];
                                                return (
                                                    <td key={field.name} className={cellClasses}>
                                                        <SearchableTableCellSelect
                                                            value={customVal}
                                                            options={dropDownListObject(options, "name", "id")}
                                                            disabled={disabled}
                                                            onChange={(nextValue) => handleCustomInputChange(nextValue, index, field.name)}
                                                            className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
                                                        />
                                                    </td>
                                                );
                                            }
                                            
                                            return (
                                                <td key={field.name} className={cellClasses}>
                                                    <input
                                                        type={field.type}
                                                        value={customVal}
                                                        disabled={disabled}
                                                        onChange={(e) => handleCustomInputChange(e.target.value, index, field.name)}
                                                        className={inputClasses}
                                                    />
                                                </td>
                                            );
                                        })}

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
                                <td colSpan={1} className="px-2 py-1 text-[11px] font-bold text-gray-700 border border-gray-300">
                                    Total  {indentItems?.filter(i => i?.itemId)?.length || 0} Items
                                </td>
                                <td colSpan={3 + dynamicFields.length} className="px-2 py-1.5 text-[11px] border justify-end"></td>
                                <td colSpan={1} className="px-2 py-1.5 text-[11px] border text-end">
                                    {indentItems?.filter(i => i?.itemId)?.reduce((acc, item) => acc + Number(item?.qty || 0), 0).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </TransactionLineItemsSection>
        </fieldset>
    );
}

