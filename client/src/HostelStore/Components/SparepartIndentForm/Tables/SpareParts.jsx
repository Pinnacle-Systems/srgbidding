import { FiTrash2 } from "react-icons/fi";
import TransactionLineItemsSection from "../../ReusableComponents/TransactionLineItemsSection";

export default function SparePartTable({
    inwardItems = [],
    readOnly
}) {
    const headerClasses = "px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300";
    const cellClasses = "px-2 py-1 border-b border-gray-200";
    const inputClasses = "w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-800 focus:outline-none focus:border-gray-500 focus:ring-0 bg-white disabled:bg-gray-100 disabled:text-gray-500";

    return (
        <fieldset className="h-full min-h-0">
            <TransactionLineItemsSection
                panelClassName="h-full min-h-0 px-2"
                contentClassName="min-h-0 overflow-hidden rounded-b-md border-x border-b border-gray-300 !py-0 bg-white"
            >
                <div className="h-full overflow-x-auto overflow-y-auto">
                    <table className="w-full border-collapse bg-white">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className={`${headerClasses} w-10 text-center`}>S.no</th>
                                <th className={`${headerClasses} w-32`}>Part Name</th>
                                <th className={`${headerClasses} w-32`}>Part No./Code</th>
                                <th className={`${headerClasses} w-48`}>Machine Make & Model</th>
                                <th className={`${headerClasses} w-32`}>Material/Grade</th>
                                <th className={`${headerClasses} w-24`}>Color</th>
                                <th className={`${headerClasses} w-24`}>Uom</th>
                                <th className={`${headerClasses} w-24`}>Qty</th>
                                <th className={`${headerClasses} w-10 text-center`}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(inwardItems && inwardItems.length > 0 ? inwardItems : Array.from({ length: 8 })).map((row, index) => {
                                const disabled = readOnly;

                                return (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-1 border-b border-gray-200 text-sm text-gray-600 text-center">
                                            {index + 1}
                                        </td>
                                        <td className={cellClasses}>
                                            <input type="text" className={inputClasses} disabled={disabled} />
                                        </td>
                                        <td className={cellClasses}>
                                            <input type="text" className={inputClasses} disabled={disabled} />
                                        </td>
                                        <td className={cellClasses}>
                                            <input type="text" className={inputClasses} disabled={disabled} />
                                        </td>
                                        <td className={cellClasses}>
                                            <input type="text" className={inputClasses} disabled={disabled} />
                                        </td>
                                        <td className={cellClasses}>
                                            <input type="text" className={inputClasses} disabled={disabled} />
                                        </td>
                                        <td className={cellClasses}>
                                            <input type="text" className={inputClasses} disabled={disabled} />
                                        </td>
                                        <td className={cellClasses}>
                                            <input type="number" className={inputClasses} disabled={disabled} />
                                        </td>
                                        <td className="px-3 py-1 border-b border-gray-200 text-center">
                                            {!disabled && (
                                                <button type="button" className="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
                                                    <FiTrash2 size={16} />
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
