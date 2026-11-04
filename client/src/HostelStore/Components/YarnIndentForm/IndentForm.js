import {
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
import { FiEdit2, FiSave, FiPrinter, FiChevronLeft, FiChevronRight, FiUser, FiTruck, FiLayers } from "react-icons/fi";
import Swal from "sweetalert2";

import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell.jsx";
import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection.jsx";
import CommonFormFooter from "../ReusableComponents/CommonFormFooter.jsx";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect.jsx";
import { useGetDepartmentQuery } from "../../../redux/services/DepartmentMasterService.js";
import { PDFViewer } from "@react-pdf/renderer";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService.js";
import { useAddYarnIndentMutation, useGetYarnIndentByIdQuery, useUpdateYarnIndentMutation } from "../../../redux/uniformService/YarnIndent.js";
import { useGetYarnMasterQuery, useGetYarnVendorsQuery } from "../../../redux/uniformService/YarnMasterServices.js";
import { useGetYarnBlendMasterQuery } from "../../../redux/uniformService/YarnBlendMasterServices.js";
import { useGetCountsMasterQuery } from "../../../redux/uniformService/CountsMasterServices.js";
import { standardTransactionPlaceholderRowCount } from "../ReusableComponents/TransactionLineItemsSection.jsx";
import YarnTable from "./YarnIndentTable.jsx";
import { useGetIndentTypeMasterByNameQuery } from "../../../redux/uniformService/IndentTypeMasterService.js";

const IndentForm = ({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  uomList,
  styleItemList,
  itemGroupList,
  sizeList,
  colorList,
  set,
  setFromPoSupplierId,
  setFromPoType,
  gsmList,
}) => {

  const today = new Date();
  const [docDate, setDocDate] = useState(moment.utc(today).format("YYYY-MM-DD"));
  const [remarks, setRemarks] = useState("");
  const [docId, setDocId] = useState("");
  const [indentItems, setIndentItems] = useState([]);
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
  const [childRecord, setChildRecord] = useState(false);
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);

  const allTabs = ["Yarn"];
  const [activeTab, setActiveTab] = useState("");

  const supplierRef = useRef(null);
  const [dispatchInvalidate] = useInvalidateTags();

  const { userId, finYearId, branchId } = getCommonParams();


  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 320);
  };



  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetYarnIndentByIdQuery(id, { skip: !id });

  const [addData] = useAddYarnIndentMutation();
  const [updateData] = useUpdateYarnIndentMutation();

  // Fetch the dynamic schema for this Indent Type ("Fabric" in this case)
  const { data: dynamicSchemaResponse } = useGetIndentTypeMasterByNameQuery("Yarn");
  const dynamicFields = useMemo(() => {
    let schema = dynamicSchemaResponse?.data?.fieldSchema || [];
    if (typeof schema === 'string') {
      try { schema = JSON.parse(schema); } catch (e) { schema = []; }
    }
    return schema;
  }, [dynamicSchemaResponse]);

  console.log(dynamicFields, "dynamicFields")

  const { data: departmentData } = useGetDepartmentQuery({});
  const { data: yarnList } = useGetYarnMasterQuery({});
  const { data: yarnVendorList } = useGetYarnVendorsQuery({});
  const { data: yarnBlendMasterList } = useGetYarnBlendMasterQuery({});
  const { data: countsMasterList } = useGetCountsMasterQuery({});
  const { data: partyList } = useGetPartyQuery({});

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

      setPriority(data?.priority || "");
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
    indentType: activeTab,
    priority,
    requiredDate: deliveryDate,
    departmentId,
    employeeId,
    remark: remarks,
    deliveryLocation,
    purpose,
    estimatedValue,
    rowVersion,
    indentItems: indentItems?.filter((i) => i.yarnId),
    finYearId

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
                set("");
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
        row.yarnId || "",
        row.yarnBlendId || "",

        row.countsId || "",
        row.colorId || "",
        row.uomId || "",
      ].join("-");

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          yarnId: row.yarnId,
          yarnBlendId: row.yarnBlendId,
          countsId: row.countsId,
          colorId: row.colorId,
          uomId: row.uomId,
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
    const items = data?.indentItems || [];
    const filledItems = items.filter((item) => item.yarnId);
    const checks = [
      { condition: !data.priority, title: "Priority is required!" },


      {
        condition: !isGridDatasValid(data?.indentItems, false, [
          "yarnId",
          // "countsId",
          "qty",
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
    if (!validateData(data)) {
      return;
    }
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




  useEffect(() => {
    const length = 20
    const currentLength = indentItems?.length || 0;
    if (currentLength >= length) return;

    setIndentItems((prev) => {
      const actualPrev = prev || [];
      if (actualPrev.length >= length) return actualPrev;

      const padding = Array.from({ length: length - actualPrev.length }, () => ({
        itemId: "",
        qty: "0.00",
        tax: "0",
        colorId: "",
        uomId: "",
        price: "0.00",
        discountValue: "0.00",
        discountType: "",
        noOfBags: "0",
        weightPerBag: "0.00",
        id: '',
        poItemsId: "",
        taxMethod: "",
        barcode: "",
        barcodeType: "REGULAR"
      }));
      return [...actualPrev, ...padding];
    });
  }, [id, indentItems]);

  const totalQty = indentItems.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);

  const footerContent = (
    <CommonFormFooter
      readOnly={readOnly}
      totalQty={totalQty}
      remarks={remarks}
      setRemarks={setRemarks}
      leftActions={
        <>
          {(!id || allowedActions.includes("edit")) && (
            <button onClick={() => saveData("close")}
              disabled={readOnly}
              className="bg-[#5147B8] text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <FiSave className="w-4 h-4 mr-2" />
              Save & Close
            </button>
          )}
          <button
            className="bg-[#8B93A2] text-white px-4 py-1 rounded-md hover:bg-green-700 flex items-center text-sm"
            onClick={() => {
              saveData("new");
            }}
          >
            Save & New
          </button>
        </>
      }
      rightActions={
        <>
          <button
            className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
            onClick={() => {
              setReadOnly(false);
            }}
          >
            <FiEdit2 className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 flex items-center text-sm"

          >
            Print
          </button>
        </>
      }
    />
  );


  const departmentOptions = (id ? departmentData?.data : departmentData?.data?.filter(i => i.active) || [])?.map((item) => ({
    value: item.id,
    label: item?.name || "",
  }));

  const compactFieldClass = "px-2 py-1 text-[11px] text-black !text-black";
  const compactModalFieldClass =
    "w-full px-2 py-1 text-[11px] text-black !text-black";
  const narrowFieldWrap = "min-w-0";
  const partyDropdownMinWidth = 340;
  const supplierCompactGridClass =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-end";
  const shippingPortsGridClass =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 items-end";
  const shippingChargesGridClass =
    "grid grid-cols-2 sm:grid-cols-[minmax(0,120px)_minmax(0,120px)_minmax(0,95px)_minmax(0,130px)] gap-2 items-end";


  const basicDetailsSidebar = (
    <aside
      style={{
        backgroundColor: "#0d1e30",
        backgroundImage:
          "radial-gradient(120% 70% at 50% 0%, rgba(96, 165, 250, 0.25) 0%, rgba(30, 75, 125, 0.12) 45%, transparent 75%), linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%), linear-gradient(180deg, #16304C 0%, #0d1e30 40%, #050b12 75%, #000000 100%)",
      }}
      className={`bg-[#0d1e30] transition-[width] duration-300 ease-in-out flex flex-col min-h-0 flex-none self-stretch text-white rounded-md border border-[#20456C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.3)] overflow-hidden relative ${isSidebarOpen ? "w-[260px] xl:w-[280px]" : "w-[44px]"
        }`}
    >
      {isSidebarOpen ? (
        <div className="w-[260px] xl:w-[280px] min-w-[260px] xl:min-w-[280px] flex flex-col h-full min-h-0 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-28 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
          {/* Header of Sidebar */}
          <div className="px-3.5 pt-2.5 pb-2.5 border-b border-[#20456C] flex-none">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-[#7098BC] tracking-[0.14em] uppercase block leading-tight">
                    Yarn Indent Form
                  </span>
                  {/* {id && <ModeChip id={id} readOnly={effectiveReadOnly} />} */}
                </div>
                <div className="mt-1 h-6 flex items-center">
                  <h2
                    onClick={() => {
                      if (id) setShowVersionDropdown((prev) => !prev);
                    }}
                    className={`text-md font-extrabold tracking-tight truncate leading-none select-none transition-colors ${id
                      ? "cursor-pointer text-white hover:text-sky-300 active:scale-98"
                      : "text-white"
                      }`}
                    title={id ? "Click to toggle version dropdown" : ""}
                  >
                    {docId && docId !== "New" ? docId : "New Indent"}
                  </h2>
                </div>
                <div
                  className={`mt-1 h-6 flex items-center transition-opacity duration-150 ${id && showVersionDropdown
                    ? "opacity-100 visible pointer-events-auto"
                    : "opacity-0 invisible pointer-events-none"
                    }`}
                >
                  {/* {versionDropdown} */}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-sky-600 active:bg-sky-700 text-white border border-white/25 hover:border-sky-400 shadow-md flex items-center justify-center transition active:scale-95 flex-shrink-0 cursor-pointer mt-1"
                title="Collapse Basic Details"
              >
                <FiChevronLeft
                  className="w-5 h-5 text-white"
                  strokeWidth={2.75}
                />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div
            className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2.5 [scrollbar-color:#28496D_#102438] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#102438] [&::-webkit-scrollbar-thumb]:bg-[#28496D] [&::-webkit-scrollbar-thumb]:rounded
            [&_label]:!text-[#7098BC] [&_label]:!text-[10px] [&_label]:!font-bold [&_label]:!tracking-[0.1em] [&_label]:!uppercase [&_label]:!mb-1
            [&_label_p]:!text-[#7098BC] [&_label_span:not(.text-red-500)]:!text-[#7098BC] [&_.text-red-500]:!text-rose-400
            [&_input]:!bg-[#102438] [&_input]:!border-[#28496D] [&_input]:!text-white [&_input]:[-webkit-text-fill-color:white] [&_input]:!opacity-100 [&_input]:!rounded-md [&_input]:[color-scheme:dark] [&_input:focus]:!border-sky-400
            [&_select]:!bg-[#102438] [&_select]:!border-[#28496D] [&_select]:!text-white [&_select]:!rounded-md [&_select:focus]:!border-sky-400
            [&_select_option]:!bg-[#102438] [&_select_option]:!text-white
            [&_.bg-slate-100]:!bg-[#102438] [&_.bg-slate-100]:!border-[#28496D] [&_.bg-slate-100]:!text-white [&_.bg-slate-100]:[-webkit-text-fill-color:white] [&_.bg-slate-100]:!rounded-md
            [&_.mb-1_button]:!bg-[#102438] [&_.mb-1_button]:!border-[#28496D] [&_.mb-1_button]:!text-white [&_.mb-1_button]:!rounded-md [&_.mb-1_button_span]:!text-white [&_.mb-1_button_svg]:!text-[#7098BC]"
          >
            <div className="grid grid-cols-2 gap-1.5">
              <div
                className={`${narrowFieldWrap} ${id ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (id) setShowVersionDropdown((prev) => !prev);
                }}
                title={id ? "Click to toggle version dropdown" : ""}
              >
                <ReusableInput
                  label="Indent No"
                  readOnly
                  value={docId}
                />

              </div>
              <div className={narrowFieldWrap}>
                <ReusableInput
                  label="Indent Date"
                  value={docDate}
                  type={"date"}
                  required={true}
                  readOnly={true}
                  disabled
                />
              </div>
            </div>

            {/* <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
                <SearchableTableCellSelect
                  name="Department"
                  options={departmentOptions}
                  value={departmentId}
                  setValue={setDepartmentId}
                  required={true}
                  readOnly={true}
                  className={`w-full`}
                  addNewModalWidth="w-[40%] h-[48%]"
                />

              </div>
              <TextInput
                name={"User Name"}
                value={singelUserData?.data?.username ? (singelUserData.data.username).toUpperCase() : ""}
                readOnly={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
                <ReusableInput
                  label="Required Date"
                  value={deliveryDate}
                  setValue={setDeliveryDate}
                  type={"date"}
                  required={true}
                  readOnly={readOnly}
                />

              </div>

              <div className={narrowFieldWrap}>

              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
                <SearchableTableCellSelect
                  name="Priority"
                  options={requestPriority}
                  value={priority}
                  setValue={setPriority}
                  required={true}
                  className={`w-full`}
                  addNewModalWidth="w-[40%] h-[48%]"
                />
              </div>

              <div className={narrowFieldWrap}>

              </div>
            </div> */}
          </div>

          {/* Bottom of Sidebar - Net Amount & View Summary */}
          {/* <div className="p-3 border-t border-[#20456C] bg-transparent flex-none space-y-2.5">
            <div className="bg-[#102438] rounded-lg border border-[#28496D] p-3 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7098BC] mb-1">
                Net Amount
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-xs font-bold text-[#7098BC] tracking-wider">
                  {isCurrencySymbol || currencyCode || "INR"}
                </span>
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {formatAmountIN(calculatedGrandTotal || 0)}
                </span>
              </div>
              <div className="text-[11px] font-medium text-[#7098BC] leading-snug break-words mt-1.5">
                {amountInWords(Number(calculatedGrandTotal || 0))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!taxTemplateId && !isCustomerExport) {
                  Swal.fire({
                    title: "Information",
                    text: "Please Select Tax Template !",
                    icon: "info",
                    confirmButtonColor: "#3085d6",
                  });
                  return;
                }
                setSummary(true);
              }}
              className="w-full bg-[#102438] hover:bg-[#152e47] active:bg-[#0c1c2c] text-white py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition border border-[#28496D] cursor-pointer"
              title="View PI Summary"
            >
              <FiEye className="w-4 h-4 text-white" />
              <span>View summary</span>
            </button>
          </div> */}
        </div>
      ) : (
        <div className="w-[44px] min-w-[44px] flex flex-col h-full min-h-0 items-center justify-between py-2">
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-sky-600 active:bg-sky-700 text-white border border-white/25 hover:border-sky-400 shadow-md flex items-center justify-center transition active:scale-95 flex-shrink-0 mt-1 cursor-pointer"
            title={
              docId && docId !== "New"
                ? `Expand Basic Details (${docId})`
                : "Expand Basic Details"
            }
          >
            <FiChevronRight className="w-5 h-5 text-white" strokeWidth={2.75} />
          </button>

          {/* Vertical rotated text label */}
          <div
            onClick={toggleSidebar}
            className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none py-4 w-full hover:bg-white/5 transition"
            title={
              docId && docId !== "New"
                ? `Click to expand (${docId})`
                : "Click to expand Basic Details"
            }
          >
            <div className="flex flex-col items-center gap-2.5">
              <FiLayers
                className={`w-4 h-4 ${docId && docId !== "New" ? "text-sky-300" : "text-[#7098BC]"
                  }`}
              />
              <span
                className={`text-[13px] font-bold uppercase whitespace-nowrap ${docId && docId !== "New"
                  ? "text-sky-200 tracking-wider font-extrabold"
                  : "text-[#7098BC] tracking-widest"
                  }`}
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                {docId && docId !== "New" ? docId : "Basic Details"}
              </span>
            </div>
          </div>

          {/* Bottom of collapsed sidebar */}
          {/* <div className="flex flex-col items-center gap-1.5 pb-1">
            <span
              className="px-1.5 py-0.5 rounded bg-[#102438] text-white border border-[#28496D] font-bold text-[9px] max-w-[38px] truncate cursor-pointer shadow-xs"
              title={`Net Amount: ${isCurrencySymbol || currencyCode || "INR"} ${formatAmountIN(calculatedGrandTotal || 0)}\n${amountInWords(Number(calculatedGrandTotal || 0))}`}
              onClick={toggleSidebar}
            >
              {isCurrencySymbol || "₹"}
              {parseFloat(calculatedGrandTotal || 0) >= 1000
                ? `${(parseFloat(calculatedGrandTotal || 0) / 1000).toFixed(1)}k`
                : parseFloat(calculatedGrandTotal || 0).toFixed(0)}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!taxTemplateId && !isCustomerExport) {
                  Swal.fire({
                    title: "Information",
                    text: "Please Select Tax Template !",
                    icon: "info",
                    confirmButtonColor: "#3085d6",
                  });
                  return;
                }
                setSummary(true);
              }}
              title="View summary"
              className="p-1.5 rounded-md text-white hover:bg-[#102438] transition border border-transparent hover:border-[#28496D] cursor-pointer"
            >
              <FiEye className="w-4 h-4" />
            </button>

            <div
              onClick={toggleSidebar}
              className="flex flex-col items-center gap-1.5 cursor-pointer"
              title="Click to expand Basic Details"
            >
              {docId && docId !== "New" && (
                <span
                  className="px-1 py-0.5 rounded bg-white/20 text-white font-bold text-[10px] max-w-[38px] truncate"
                  title={`PI: ${docId}`}
                >
                  #{docId.slice(-4)}
                </span>
              )}
            </div>
          </div> */}
        </div>
      )}
    </aside>
  );


  const customerDetailsCompactSection = (
    <div className="border border-slate-200 bg-white rounded-md shadow-sm overflow-hidden flex flex-col border-l-4 border-l-blue-600">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/80 bg-slate-50 rounded-t-md flex-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <FiUser className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-[11px] text-slate-800 tracking-wider uppercase truncate">
            Department Details
          </span>
        </div>
      </div>
      <div className="px-2.5 py-2 flex-1 min-h-0">
        <div className={supplierCompactGridClass}>
          <div className="min-w-0 md:col-span-2 xl:col-span-2">
            <SearchableTableCellSelect
              name="Department"
              options={departmentOptions}
              value={departmentId}
              setValue={setDepartmentId}
              required={true}
              readOnly={true}
              className={`w-full`}
              addNewModalWidth="w-[40%] h-[48%]"
            />
          </div>
          <div className="min-w-0 col-span-1">
            <TextInput
              name={"User Name"}
              value={singelUserData?.data?.username ? (singelUserData.data.username).toUpperCase() : ""}
              readOnly={true}
            />
          </div>
          <div className="min-w-0 col-span-1">

          </div>
        </div>
      </div>
    </div>
  );

  const shippingDetailsCompactSection = (
    <div className="border border-slate-200 bg-white rounded-md shadow-sm overflow-hidden flex flex-col border-l-4 border-l-amber-500">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/80 bg-slate-50 rounded-t-md flex-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <FiTruck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="font-semibold text-[11px] text-slate-800 tracking-wider uppercase truncate">
            Other Details
          </span>
        </div>
      </div>
      <div className="px-2.5 py-1.5 flex-1 min-h-0 space-y-1">
        {/* Row 1: Ports & Advising Bank */}
        <div className={shippingPortsGridClass}>
          <div className="min-w-0">
            <ReusableInput
              label="Required Date"
              value={deliveryDate}
              setValue={setDeliveryDate}
              type={"date"}
              required={true}
              readOnly={readOnly}
            />

          </div>
          <div className="min-w-0">
            <SearchableTableCellSelect
              name="Priority"
              options={requestPriority}
              value={priority}
              setValue={setPriority}
              required={true}
              className={`w-full`}
              addNewModalWidth="w-[40%] h-[48%]"
            />
          </div>
          <div className="min-w-0">

          </div>
        </div>

        {/* Row 2: Delivery Date & Carriage Charges */}

      </div>
    </div>
  );

  const headerContent = (
    <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1.65fr] gap-1.5 w-full">
      {customerDetailsCompactSection}
      {shippingDetailsCompactSection}
    </div>
  );



  return (
    <>



      <TransactionEntryShell
        id={id}
        readOnly={readOnly}
        title="Yarn Indent Form"
        onClose={onClose}
        headerOpen={isHeaderOpen}
        setHeaderOpen={setIsHeaderOpen}
        openStateClassName="max-h-[400px] opacity-100 overflow-visible"
        footer={footerContent}
        headerContent={(
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 overflow-visible px-2">
            <TransactionHeaderSection title="Basic Details" className="col-span-3  rounded-md bg-white border border-gray-200 p-2" bodyClassName="grid-cols-2 gap-2">
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

            <TransactionHeaderSection title="Department Details" className="col-span-4 shadow-sm border border-gray-200 rounded-md bg-white p-2" bodyClassName="grid-cols-2 gap-2">
              <div className="col-span-1">
                <SearchableTableCellSelect
                  name="Department"
                  options={departmentOptions}
                  value={departmentId}
                  setValue={setDepartmentId}
                  required={true}
                  readOnly={true}
                  className={`w-full`}
                  addNewModalWidth="w-[40%] h-[48%]"
                />
              </div>
              <div className="col-span-1">
                <TextInput
                  name={"User Name"}
                  value={singelUserData?.data?.username ? (singelUserData.data.username).toUpperCase() : ""}
                  readOnly={true}
                />
              </div>
            </TransactionHeaderSection>

            <TransactionHeaderSection title="Other Details" className="col-span-5 shadow-sm border border-gray-200 rounded-md bg-white p-2 overflow-visible" bodyClassName="grid-cols-4 gap-2">
              <ReusableInput
                label="Required Date"
                value={deliveryDate}
                setValue={setDeliveryDate}
                type={"date"}
                required={true}
                readOnly={readOnly}
              />
              <SearchableTableCellSelect
                name="Priority"
                options={requestPriority}
                value={priority}
                setValue={setPriority}
                required={true}
                className={`w-full`}
                addNewModalWidth="w-[40%] h-[48%]"
              />

            </TransactionHeaderSection>
          </div>
        )}
      >
        <div className="min-h-0 flex-1 overflow-hidden flex flex-col">

          <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
            <div className=" px-2   min-h-[250px]  overflow-hidden flex flex-col flex-1 w-full">



              <YarnTable
                indentItems={indentItems}
                setIndentItems={setIndentItems}
                yarnList={yarnList}
                yarnBlendMasterList={yarnBlendMasterList}
                countsMasterList={countsMasterList}
                partyList={partyList}
                uomList={uomList}
                sizeList={sizeList}
                colorList={colorList}
                readOnly={readOnly}
                dynamicFields={dynamicFields}
                yarnVendorList={yarnVendorList}
              />




            </div>
          </div>
        </div>
      </TransactionEntryShell >




    </>
  );
};
export default IndentForm;
