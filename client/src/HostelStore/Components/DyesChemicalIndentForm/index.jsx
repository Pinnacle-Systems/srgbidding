import { useEffect, useRef, useState } from "react";
import { getCommonParams } from "../../../Utils/helper.js";
import { FaPlus } from "react-icons/fa";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService.js";
import Swal from "sweetalert2";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import IndentForm from "./DyesIndentForm.js";
import IndentFormReport from "./IndentFormReport.js";
import { useDeleteSparepartIndentMutation } from "../../../redux/uniformService/SparepartIndent.js";

export default function Form() {

  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);

  const [fromPoSupplierId, setFromPoSupplierId] = useState(""); // ⬅️
  const [fromPoId, setFromPoId] = useState("");
  const [fromPoType, setFromPoType] = useState("")

  const { branchId, companyId, finYearId, userId } = getCommonParams()
  const params = {
    branchId, companyId, finYearId, isAddessCombined: true, userId
  };



  const handleView = (orderId) => {
    setId(orderId);
    setShowForm(true);
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
    setId(orderId);
    setShowForm(true);
    setReadOnly(false);
  };
  const [removeData] = useDeleteSparepartIndentMutation();

  const [dispatchInvalidate] = useInvalidateTags();

  const handleDelete = async (id) => {
    setId(id);
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }

      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            title: "Child record Exists",
            text: deldata.data?.message || "Data cannot be deleted!",
          });
          return;
        }
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          timer: 1000,
        });
        setShowForm(false);
        dispatchInvalidate();
        invalidatePurchaseModule();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
        setShowForm(false);
      }

    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
  };

  const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
  const { data: branchList } = useGetBranchQuery({ params: { ...params } });






  const handleClose = () => {
    setShowForm(false);
    setFromPoSupplierId("");   // ⬅️ clear on close
    setFromPoId("");
    setReadOnly(false);
  };

  return (
    <>



      {showForm ? (
        <div className="h-[calc(100vh-5rem)] min-h-0 overflow-hidden">
          <IndentForm
            readOnly={readOnly}
            setReadOnly={setReadOnly}
            id={id}
            setId={setId}
            onClose={() => {
              setShowForm(false);
              setReadOnly((prev) => !prev);
              setFromPoSupplierId("");   // ⬅️ clear on close
              setFromPoId("");
              setFromPoType("");
            }}
            setShowForm={setShowForm}
            supplierList={supplierList}
            branchList={branchList}
            onNew={onNew}
            fromPoId={fromPoId}
            fromPoSupplierId={fromPoSupplierId}
            fromPoType={fromPoType}
            setFromPoId={setFromPoId}
            setFromPoSupplierId={setFromPoSupplierId}
            setFromPoType={setFromPoType}
            handleClose={handleClose}
          />
        </div>

      ) : (
        <div className="flex h-[calc(100vh-5rem)] min-h-0 flex-col bg-[#F1F1F0]">
          <div className="mb-2 flex shrink-0 flex-col items-start justify-between gap-x-4 rounded-tl-lg rounded-tr-lg border border-gray-200 bg-white px-1 py-0.5 shadow-sm sm:flex-row sm:items-center">

            <h1 className="text-lg font-bold text-gray-800">DYES & CHEMICALS INDENT FORM
            </h1>

            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-2 py-1 rounded-md flex items-center gap-2 text-xs"
              onClick={() => {
                setShowForm(true);
                onNew();
              }}
            >
              <FaPlus /> Create New
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">
            <IndentFormReport
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemsPerPage={15}
              params={params}
              dispatchInvalidate={dispatchInvalidate}
            />
          </div>
        </div>
      )}
    </>
  );

}