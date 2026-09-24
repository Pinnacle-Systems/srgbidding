// import { FxSelectWithAdd } from "../../../../Inputs";

// export default function SparePartTable(
//     {
//         activeTab,
//         inwardItems = [],
//         readOnly
//     }) {

//     return (
//         <>
//             <div
//                 className={`w-full min-h-[205px] max-h-[300px] overflow-y-auto mt-0 mb-2`}
//             >
//                 <table className="w-full border-collapse table-fixed">
//                     <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
//                         <tr className="text-[12px]">
//                             <th className={`w-12 px-4 py-2 text-center font-medium `}>
//                                 S.No
//                             </th>
//                             <th className={`w-24 px-4 py-2 text-center font-medium`}>
//                                 Item Name <span className="text-red-500">*</span>
//                             </th>

//                             <th className={`w-56 px-2 py-2 text-center font-medium`}>
//                                 Part No./Code <span className="text-red-500">*</span>
//                             </th>
//                             <th className={`w-56 px-2 py-2 text-center font-medium`}>
//                                 Machine Make & Model <span className="text-red-500">*</span>
//                             </th>
//                             <th className={`w-20 px-4 py-2 text-center font-medium`}>
//                                 Material/Grade
//                             </th>
//                             <th className={`w-32 px-4 py-2 text-center font-medium`}>
//                                 Color
//                             </th>

//                             <th className={`w-16 px-4 py-2 text-center font-medium`}>
//                                 UOM
//                             </th>
//                             <th className={`w-16 px-4 py-2 text-center font-medium`}>
//                                 Qty <span className="text-red-500">*</span>
//                             </th>







//                             <th className={`w-12 px-1 py-2 text-center font-medium `}>
//                                 Actions
//                             </th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {(inwardItems ? inwardItems : [])?.map((row, index) => {
//                             // if (getRowTab(row) !== activeTab) return null;

//                             const childRecord = row.MaterialIssueItems?.length > 0

//                             return (
//                                 <tr
//                                     className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 cursor-pointer h-6`}
//                                     key={index}
//                                     onContextMenu={(e) => {
//                                         if (!readOnly && !childRecord) {
//                                             handleRightClick(e, index, "");
//                                         }
//                                     }}
//                                 >
//                                     <td className="w-12 border border-gray-300 text-[11px]  text-center">
//                                         {index + 1}
//                                     </td>
//                                     <td className="w-12 border border-gray-300 text-[11px]  text-center">
//                                     </td>
//                                     <td className="w-12 border border-gray-300 text-[11px]  text-center">
//                                     </td> <td className="w-12 border border-gray-300 text-[11px]  text-center">
//                                     </td> <td className="w-12 border border-gray-300 text-[11px]  text-center">
//                                     </td> <td className="w-12 border border-gray-300 text-[11px]  text-center">
//                                     </td> <td className="w-12 border border-gray-300 text-[11px]  text-center">
//                                     </td> <td className="w-12 border border-gray-300 text-[11px]  text-center">
//                                     </td> <td className="w-12 border border-gray-300 text-[11px]  text-center">
//                                     </td>
//                                 </tr>
//                             )
//                         }



//                         )}
//                     </tbody>
//                 </table>

//             </div>
//         </>


//     )
// }


import { FxSelectWithAdd } from "../../../../Inputs";
import TransactionLineItemsSection, { transactionTableClassName, transactionTableFocusCellClassName, transactionTableHeadClassName, transactionTableHeaderCellClassName, transactionTableIndexCellClassName, transactionTableRowClassName } from "../../ReusableComponents/TransactionLineItemsSection";

export default function SparePartTable(
    {
        activeTab,
        inwardItems = [],
        readOnly
    }) {
    const compactHeaderCellClassName = transactionTableHeaderCellClassName;
    const compactFocusCellClassName = transactionTableFocusCellClassName;

    return (
        <>

            <fieldset className="h-full min-h-0 ">
                <TransactionLineItemsSection
                    panelClassName="h-full min-h-0"
                    contentClassName="min-h-0 overflow-hidden rounded-md border border-slate-200 !py-0"
                >

                    <div className="h-full overflow-x-auto overflow-y-auto">
                        <table className={transactionTableClassName}>
                            <thead className={transactionTableHeadClassName}>
                                <tr>
                                    <th
                                        className={`${compactHeaderCellClassName} w-6`}
                                    >
                                        S.No
                                    </th>

                                    <th
                                        className={`${compactHeaderCellClassName} w-20`}
                                    >
                                        Part Name
                                    </th>
                                    <th
                                        className={`${compactHeaderCellClassName} w-36`}
                                    >
                                        Part No./Code
                                    </th>
                                    <th
                                        className={`${compactHeaderCellClassName} w-20`}
                                    >
                                        Machine Make & Model
                                    </th>
                                    <th
                                        className={`${compactHeaderCellClassName} w-20`}
                                    >
                                        Color
                                    </th>
                                    <th
                                        className={`${compactHeaderCellClassName} w-16`}
                                    >
                                        Uom
                                    </th>
                                    <th
                                        className={`${compactHeaderCellClassName} w-12`}
                                    >
                                        Qty
                                    </th>

                                    <th
                                        className={`${compactHeaderCellClassName} w-6`}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>

                                {(inwardItems ? inwardItems : [])?.map((row, index) => {

                                    const alreadyReturnQty = row.alreadyReturnQty;
                                    const isAlreadyReturned = alreadyReturnQty > 0;

                                    return (
                                        <tr className={`${transactionTableRowClassName} 
                                        ${index % 2 === 0 ? "bg-white" : "bg-gray-100"} border border-blue-gray-200 cursor-pointer h-6
                    `
                                        }
                                            // onContextMenu={(e) => {
                                            //     if (!readOnly && !isAlreadyReturned) {
                                            //         handleRightClick(e, index, "shiftTimeHrs");
                                            //     }
                                            // }}
                                            disabled={isAlreadyReturned}
                                        >
                                            <td className={transactionTableIndexCellClassName}>{index + 1}</td>
                                            <td className={transactionTableIndexCellClassName}></td>
                                            <td className={transactionTableIndexCellClassName}></td>
                                            <td className={transactionTableIndexCellClassName}></td>
                                            <td className={transactionTableIndexCellClassName}></td>
                                            <td className={transactionTableIndexCellClassName}></td>
                                            <td className={transactionTableIndexCellClassName}></td>
                                            <td className={transactionTableIndexCellClassName}></td>










                                        </tr>
                                    )

                                }




                                )}
                            </tbody>
                            <tfoot className="sticky bottom-0 z-10 shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">

                            </tfoot>
                        </table>

                    </div>
                </TransactionLineItemsSection>
            </fieldset>
        </>


    )
}

