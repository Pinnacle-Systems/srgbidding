import { FxSelectWithAdd } from "../../../../Inputs";
import TransactionLineItemsSection, { transactionTableClassName, transactionTableFocusCellClassName, transactionTableHeadClassName, transactionTableHeaderCellClassName, transactionTableIndexCellClassName, transactionTableRowClassName } from "../../ReusableComponents/TransactionLineItemsSection";

export default function DyesAndMaintainenceTable(
    {
        activeTab,
        inwardItems = [],
        readOnly
    }) {
    const compactHeaderCellClassName = transactionTableHeaderCellClassName;
    const compactFocusCellClassName = transactionTableFocusCellClassName;

    return (
        <>
            <fieldset className="h-full min-h-0">
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
                                        Item Name
                                    </th>
                                    <th
                                        className={`${compactHeaderCellClassName} w-36`}
                                    >
                                        Color
                                    </th>
                                    <th
                                        className={`${compactHeaderCellClassName} w-20`}
                                    >
                                        Size
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