import {
  DropdownInput,
  ReusableInput,
  TextAreaNew,
  TextInput,
} from "../../../Inputs/index.js";
import { requestPriority } from "../../../Utils/DropdownData.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import {
  findFromList,
  getCommonParams,

} from "../../../Utils/helper.js";
import { toast } from "react-toastify";
import { FiEdit2, FiSave, FiPrinter } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";

import { useGetLocationMasterQuery } from "../../../redux/services/LocationMasterService.js";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { calculateTaxWithHSNBreakupAndInsertIntoInwardItems } from "../PurchaseBillEntry/taxSummary.js";
import PoSummary from "../PurchaseOrder/PoSummary.js";
import Modal from "../../../UiComponents/Modal/index.js";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService.js";
import { useGetStockforMaterialIssueQuery, useGetStockReportQuery } from "../../../redux/services/StockService.js";
import { useAddMaterialIssueMutation, useGetMaterialIssueByIdQuery, useUpdateMaterialIssueMutation } from "../../../redux/uniformService/MaterialIssue.js";
import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell.jsx";
import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection.jsx";
import CommonFormFooter from "../ReusableComponents/CommonFormFooter.jsx";
import { useGetOrderMasterQuery } from "../../../redux/services/OrderMasterService.js";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect.jsx";
import { useGetEmployeeQuery } from "../../../redux/services/EmployeeMasterService.js";
import { useGetDepartmentQuery } from "../../../redux/services/DepartmentMasterService.js";
import { PDFViewer } from "@react-pdf/renderer";
import ThermalSalesPrintFormat from "./ThermalSalesPrintFormat.jsx";

import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService.js";
import YarnTable from "./Tables/Yarn.jsx";
import FabricTable from "./Tables/Fabric.jsx";
import SparePartTable from "./Tables/SpareParts.jsx";
import DyesAndMaintainenceTable from "./Tables/Others.jsx";
import { useAddInternalIndentIssueMutation, useGetInternalIndentIssueByIdQuery, useUpdateInternalIndentIssueMutation } from "../../../redux/uniformService/InternalIndent.js";

const IndentForm = ({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  supplierList,
  uomList,
  styleItemList,
  itemGroupList,
  branchList,
  hsnList,
  sizeList,
  colorList,
  fromPoId,
  fromPoSupplierId,
  fromPoType,
  setFromPoId,
  setFromPoSupplierId,
  setFromPoType,
  taxTypeList,
  gsmList,
}) => {
  const today = new Date();

  const [docDate, setDocDate] = useState(moment.utc(today).format("YYYY-MM-DD"));
  const [remarks, setRemarks] = useState("");
  const [docId, setDocId] = useState("");
  const [indentItems, setIndentItems] = useState([]);

  // New Header Fields
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [allowedActions, setAllowedActions] = useState([]);
  const [rowVersion, setRowVersion] = useState(1);

  const [departmentId, setDepartmentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [priority, setPriority] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [inwardItems, setInwardItems] = useState([])
  const [childRecord, setChildRecord] = useState(false);
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);

  const allTabs = ["Yarn", "Fabric", "Spare Part", "Dyes & Chemicals", "General"];
  const [activeTab, setActiveTab] = useState("");

  const supplierRef = useRef(null);
  const [dispatchInvalidate] = useInvalidateTags();

  const { userId, finYearId, branchId } = getCommonParams();



  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetInternalIndentIssueByIdQuery(id, { skip: !id });

  const [addData] = useAddInternalIndentIssueMutation();
  const [updateData] = useUpdateInternalIndentIssueMutation();



  const { data: departmentData } = useGetDepartmentQuery({});












  const syncFormWithDb = useCallback(
    (data) => {
      setDocId(data?.docId ? data?.docId : "New");
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setIndentItems(data?.IndentItems ? data?.IndentItems : []);

      setRemarks(data?.remark || "");
      setDeliveryLocation(data?.deliveryLocation || "");
      setPurpose(data?.purpose || "");
      setEstimatedValue(data?.estimatedValue || "");
      setStatus(data?.status || "DRAFT");
      setAllowedActions(data?.allowedActions || []);
      setRowVersion(data?.rowVersion || 1);

      setPriority(data?.Priority || "");
      setDeliveryDate(
        data?.requiredDate ? moment.utc(data.requiredDate).format("YYYY-MM-DD") : "",
      );

      setDepartmentId(data?.departmentId || "");
      setEmployeeId(data?.employeeId || "");
      setChildRecord(data?.childRecord ? data?.childRecord : false);

      if (data?.indentType) {
        // Map backend indentType back to activeTab if needed, though they might match exactly
        setActiveTab(data.indentType);
      }
    },
    [id],
  );

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);


  const { data: singelUserData, isLoading: userLoding, isFetching: userFetching } = useGetUserByIdQuery(userId, { skip: !userId });

  const tabs = useMemo(() => {
    const userCreationAccess = singelUserData?.data?.indentCreationAccess;
    if (!userCreationAccess || userCreationAccess.length === 0) return allTabs; // Fallback for legacy users
    return allTabs.filter(tab => userCreationAccess.includes(tab));
  }, [singelUserData, allTabs]);

  useEffect(() => {
    if (tabs.length > 0 && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);



  let data = {
    id,
    docDate,
    branchId,
    userId,
    indentType: activeTab, // save the current tab as the type
    Priority: priority,
    requiredDate: deliveryDate,
    departmentId,
    employeeId,
    remark: remarks,
    deliveryLocation,
    purpose,
    estimatedValue,
    rowVersion,
    IndentItems: indentItems,
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key == "attachments") {
          console.log("attachments =>", data[key]);
          formData.append(
            key,
            JSON.stringify(
              data[key].map((i) => ({
                ...i,
                filePath:
                  i.filePath instanceof File ? i.filePath.name : i.filePath,
              })),
            ),
          );
          data[key].forEach((option) => {
            if (option?.filePath instanceof File) {
              formData.append("images", option.filePath);
            }
          });
        } else if (
          key === "inwardItems" ||
          Array.isArray(data[key]) ||
          (typeof data[key] === "object" && data[key] !== null)
        ) {
          formData.append(key, JSON.stringify(data[key])); // ✅ stringify arrays and objects
        } else {
          formData.append(key, data[key]); // ✅ primitives appended as-is
        }
      }
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        Swal.fire({
          icon: "success",
          title: `${text || "Saved"} Successfully`,
          showConfirmButton: false,
          timer: 2000,
          didClose: () => {
            // ✅ Runs after Swal completely closes
            invalidatePurchaseModule();
            dispatchInvalidate();

            if (returnData.statusCode === 0) {
              if (nextProcess == "new") {
                setId(0);
                setDocId("New");
                syncFormWithDb(undefined);
                setFromPoId("");
                setFromPoSupplierId("");
                setFromPoType("");
                // ✅ Focus the Bill Type dropdown after all state updates
                setTimeout(() => {
                  supplierRef.current?.focus();
                }, 100);
              }
              if (nextProcess == "close") {
                onClose();
              }
            } else {
              toast.error(returnData?.message);
            }
          },
        });
      }
    } catch (error) {
      console.log("handle", error);
    }
  };

  const findDuplicates = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = [
        row.itemId || "",
        row.itemGroupId || "",

        row.sizeId || "",
        row.colorId || "",
        row.gsmId || "",
      ].join("-");

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          itemId: row.itemId,
          itemGroupId: row.itemGroupId,
          sizeId: row.sizeId,
          colorId: row.colorId,
          gsmId: row.gsmId,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates; // empty array = no duplicates
  };

  function isGridDatasValid(datas, isRequiredAllData, mandatoryFields = []) {
    console.log(datas, "datas");
    console.log(isRequiredAllData, "isRequiredAllData");
    console.log(mandatoryFields, "mandatoryFields")

    // If the array is empty, we consider it invalid because there must be at least one row.
    if (!datas || datas.length === 0) {
      return false;
    }

    const isInvalidValue = (value) => {
      if (value === "" || value === null || value === undefined || value === "NaN") return true;
      if (typeof value === "number" && isNaN(value)) return true;

      if (String(value).trim() !== "" && !isNaN(Number(value)) && Number(value) === 0) {
        return true;
      }

      return false;
    };

    if (isRequiredAllData) {
      return datas.every(obj => Object.values(obj).every(value => !isInvalidValue(value)));
    } else {
      return datas.every(obj =>
        mandatoryFields.every(field => {
          const value = obj[field];
          return value !== undefined && !isInvalidValue(value);
        })
      );
    }
  }

  const validateData = (data) => {
    const items = data?.inwardItems || [];
    const filledItems = items.filter((item) => item.styleItemId);
    const checks = [
      { condition: !data.priority, title: "Priority is required!" },


      {
        condition: !isGridDatasValid(data?.inwardItems, false, [
          "itemId",
          "uomId",
          "issueQty",
        ]),
        title: "Please fill all required item fields!",
      },

      {
        condition: findDuplicates(filledItems).length > 0,
        title: "Duplicate Item Found!",
        html: (() => {
          const dup = findDuplicates(filledItems)[0];
          return `ItemGroup - ${findFromList(dup?.itemGroupId, itemGroupList?.data, "name")},Item - ${findFromList(dup?.itemId, styleItemList?.data, "name")}, Size - ${findFromList(dup?.sizeId, sizeList?.data, "name")}, Color - ${findFromList(dup?.colorId, colorList?.data, "name")}, GSM - ${findFromList(dup?.gsmId, gsmList?.data, "name")}`;
        })(),
      },
    ];

    const failed = checks.find((c) => c.condition);
    if (failed) {
      Swal.fire({
        icon: "warning",
        title: failed.title,
        html: failed.html,
        timer: failed.html ? undefined : 1500,
        showConfirmButton: !!failed.html,
        confirmButtonText: "OK",
      });
      return false;
    }

    return true;
  };



  const saveData = (nextProcess) => {
    // if (!validateData(data)) {
    //   return;
    // }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (nextProcess == "draft" && !id) {
      handleSubmitCustom(
        addData,
        (data = { ...data, draftSave: true }),
        "Added",
        nextProcess,
      );
    } else if (id && nextProcess == "draft") {
      handleSubmitCustom(
        updateData,
        { ...data, draftSave: true },
        "Updated",
        nextProcess,
      );
    } else if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };







  // useEffect(() => {
  //   if (attachments?.length >= 5) return;
  //   setAttachments((prev) => {
  //     let newArray = Array.from({ length: 5 - prev?.length }, () => {
  //       return { date: today, filePath: "", log: "" };
  //     });
  //     return [...prev, ...newArray];
  //   });
  // }, [setAttachments, attachments]);






  const EMPTY_ROW = {
    styleItemId: "",
    hsnId: "",
    uomId: "",
    inwardQty: "",
    poQty: "",
    poId: "",
    alreadyInwardQty: "",
    alreadyReturnQty: "",
    alreadyCancelQty: "",
    balQty: "",
    itemGroupId: "",
    sizeId: "",
    colorId: "",
    gsmId: "",
  };
  useEffect(() => {


    const filtered = inwardItems?.filter(
      (item) => parseInt(item.poId) === parseInt(fromPoId),
    );
    const mapped = inwardItems?.map((item) => ({
      styleItemId: item.styleItemId || "",
      hsnId: item.hsnId || "",
      uomId: item.uomId || "",
      itemGroupId: item.itemGroupId || "",
      sizeId: item.sizeId || "",
      colorId: item.colorId || "",
      poId: item.poId || "",
      poQty: item.qty || "",
      alreadyInwardQty: item.alreadyInwardQty || 0,
      alreadyCancelQty: item.alreadyCancelQty || 0,
      alreadyReturnQty: item.alreadyReturnQty || 0,
      balQty: item.balQty ?? item.qty,
      inwardQty: "", // ⬅️ user fills this
      price: item.price || "",
      gsmId: item.gsmId || "",
      Po: item?.Po ?? "",
    }));

    // Pad to minimum 4 rows
    const padded = [
      ...mapped,
      ...Array.from({ length: Math.max(0, 30 - mapped.length) }, () => ({
        ...EMPTY_ROW,
      })),
    ];

    setInwardItems(padded);
  }, [fromPoId]);

  console.log(inwardItems, " inwardItems")

  const footerContent = (
    <CommonFormFooter
      readOnly={readOnly}
      leftActions={
        <>
          {(!id || allowedActions.includes("edit")) && (
            <button onClick={() => saveData("draft")}
              disabled={readOnly}
              className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <FiSave className="w-4 h-4 mr-2" />
              Save Draft
            </button>
          )}
        </>
      }
      rightActions={
        <>
          {id && allowedActions.includes("edit") && readOnly && (
            <button
              className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
              onClick={() => {
                setReadOnly(false);
              }}
            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
          {(!id || allowedActions.includes("submit")) && (
            <button
              className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 flex items-center text-sm"
              onClick={() => {
                saveData("submit");
              }}
            >
              Submit
            </button>
          )}
        </>
      }
    />
  );


  const departmentOptions = (id ? departmentData?.data : departmentData?.data?.filter(i => i.active) || [])?.map((item) => ({
    value: item.id,
    label: item?.name || "",
  }));







  return (
    <>



      <TransactionEntryShell
        id={id}
        readOnly={readOnly}
        title="Internal Indent Form"
        onClose={onClose}
        headerOpen={isHeaderOpen}
        setHeaderOpen={setIsHeaderOpen}
        openStateClassName="max-h-[400px] opacity-100 overflow-visible"
        footer={footerContent}
        headerContent={(
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 overflow-visible">
            <TransactionHeaderSection title="Basic Details" className="col-span-1" bodyClassName="grid-cols-2">
              <ReusableInput
                label="Indent No"
                readOnly
                value={docId}
              />
              <ReusableInput
                label="Indent Date"
                value={docDate}
                type={"date"}
                required={true}
                readOnly={true}
                disabled
              />

            </TransactionHeaderSection>

            <TransactionHeaderSection title="Basic Details" className="col-span-2" bodyClassName="grid-cols-4">
              <div className="col-span-2  ">
                <SearchableTableCellSelect
                  name="Department "
                  options={departmentOptions}
                  value={departmentId}
                  setValue={setDepartmentId}
                  required={true}
                  readOnly={true}
                  className={`w-[150px]`}
                  addNewModalWidth="w-[40%] h-[48%]"
                />
              </div>
              <div className="col-span-2">


                <TextInput
                  name={"User Name"}
                  value={(singelUserData?.data?.username).toUpperCase()}
                  readOnly={true}
                />
              </div>{/*  */}
            </TransactionHeaderSection>

            <TransactionHeaderSection title="Other Details" className="col-span-2 overflow-visible" bodyClassName="grid-cols-6 gap-1 overflow-visible">

              <ReusableInput
                label="Required Date"
                value={deliveryDate}
                setValue={setDeliveryDate}
                type={"date"}
                required={true}
                readOnly={readOnly}
              />
              <SearchableTableCellSelect
                name="Priority "
                options={requestPriority}
                value={priority}
                setValue={setPriority}
                required={true}
                className={`w-[150px]`}
                addNewModalWidth="w-[40%] h-[48%]"
              />
              {/* <ReusableInput
                label="Delivery Location"
                value={deliveryLocation}
                setValue={setDeliveryLocation}
                required={true}
                readOnly={readOnly}
              />
              <ReusableInput
                label="Estimated Value"
                value={estimatedValue}
                setValue={setEstimatedValue}
                required={false}
                readOnly={readOnly}
              />
              <div className="col-span-2">
                <ReusableInput
                  label="Purpose"
                  value={purpose}
                  setValue={setPurpose}
                  required={true}
                  readOnly={readOnly}
                />
              </div> */}
              <div className="col-span-2">
                <TextAreaNew
                  name="Remarks"
                  value={remarks}
                  setValue={setRemarks}
                  readOnly={readOnly}
                  rows={1}
                />
              </div>
            </TransactionHeaderSection >

          </div >
        )}
      >
        <div className="min-h-0 flex-1 overflow-hidden flex flex-col">

          <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
            <div className=" px-2  pb-2  rounded-md shadow-sm min-h-[270px] bg-white overflow-hidden flex flex-col flex-1 w-full">
              {/* Category Tabs */}
              <div className="flex bg-white sticky top-0 z-10 px-2 mt-2">
                <div className="flex w-full gap-2 border-b border-gray-300">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-4 py-2 text-[14px] font-medium transition-all duration-200 focus:outline-none border border-b-0 rounded-t-md -mb-[1px] ${activeTab === tab
                        ? "text-black border-gray-300 bg-white z-10"
                        : "text-gray-500 border-transparent hover:text-black hover:bg-gray-50"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              {activeTab == "Yarn" &&

                (
                  <YarnTable
                    inwardItems={inwardItems}
                  />
                )

              }
              {activeTab == "Fabric" &&

                (
                  <FabricTable
                    inwardItems={inwardItems}
                  />
                )

              }
              {activeTab == "Spare Part" &&

                (
                  <SparePartTable
                    inwardItems={inwardItems}

                  />
                )

              }
              {(activeTab == "Dyes & Chemicals" || activeTab == "General") &&

                (
                  <DyesAndMaintainenceTable
                    inwardItems={inwardItems}

                  />
                )

              }
            </div>
          </div>
        </div>
      </TransactionEntryShell >

    </>
  );
};
export default IndentForm;
