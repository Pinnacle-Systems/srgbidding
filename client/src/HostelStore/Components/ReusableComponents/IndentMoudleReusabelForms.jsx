import Modal from "../../../UiComponents/Modal";
import { ApprovalBadge } from "../../../Utils/ApprovalHelper";




const ReusableIndentApprovalForm = ({
    title,
    approvalModal,
    handleConfirmAction,
    actionType,
    actionLoading,
    selectedIndent,
    setApprovalModal,
    remarks,
    setRemarks,
}) => {
    return (
        <>
            <Modal
                isOpen={approvalModal}
                onClose={() => setApprovalModal(false)}
                widthClass="w-[420px]"
            >
                <div className="space-y-4">
                    {/* Header */}
                    <h2
                        className={`text-base font-semibold ${actionType === "APPROVE" ? "text-green-700" : "text-blue-700"
                            }`}
                    >
                        {actionType === "APPROVE"
                            ? `✅ Approve ${title}`
                            : `↩️ Send Back for Review ${title}`}
                    </h2>

                    {/* PO Info Card */}
                    <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Indent No</span>
                            <span className="font-medium text-gray-800">
                                {selectedIndent?.docId}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Current Approval</span>
                            <ApprovalBadge approvalStatus={selectedIndent?.approvalStatus} />
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                            Remarks{" "}
                            {actionType === "REJECT" && (
                                <span className="text-red-500">* required</span>
                            )}
                        </label>
                        <textarea
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
                            placeholder={
                                actionType === "APPROVE"
                                    ? "Optional remarks..."
                                    : "Reason for sending back (required)..."
                            }
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setApprovalModal(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    setApprovalModal(false);
                                }
                            }}
                            className="px-4 py-1.5 text-xs rounded borde text-white hover:bg-red-600 bg-red-500"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={actionLoading}
                            onClick={handleConfirmAction}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleConfirmAction();
                                }
                            }}
                            className={`px-4 py-1.5 text-xs rounded text-white font-semibold transition ${actionType === "APPROVE"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-blue-600 hover:bg-blue-700"
                                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                        >
                            {actionLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-3 w-3"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                    Processing...
                                </>
                            ) : actionType === "APPROVE" ? (
                                " Confirm Approve"
                            ) : (
                                " Send Back"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default ReusableIndentApprovalForm