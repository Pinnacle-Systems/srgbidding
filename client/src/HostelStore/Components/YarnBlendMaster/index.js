import { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useAddYarnBlendMasterMutation,
  useDeleteYarnBlendMasterMutation,
  useGetYarnBlendMasterByIdQuery,
  useGetYarnBlendMasterQuery,
  useLazyGetYarnBlendMasterByIdQuery,
  useUpdateYarnBlendMasterMutation,
} from "../../../redux/uniformService/YarnBlendMasterServices";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Check, Power } from "lucide-react";
import {
  ReusableTable,
  TextInputNew1,
  ToggleButton,
} from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { UserPermissions } from "../../../Utils/UserPermissions";
import { statusDropdown } from "../../../Utils/DropdownData";

export default function Form({ onSuccess, defaultName = "" }) {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState(defaultName || "");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();

  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [dispatchInvalidate] = useInvalidateTags();

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };

  const [trigger, { data: LazyData }] = useLazyGetYarnBlendMasterByIdQuery();

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetYarnBlendMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetYarnBlendMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddYarnBlendMasterMutation();
  const [updateData] = useUpdateYarnBlendMasterMutation();
  const [removeData] = useDeleteYarnBlendMasterMutation();

  const { hasPermission } = UserPermissions();
  const handleCreate = () => {
    hasPermission(() => {
      setForm(true);
      onNew();
    }, "create");
  };

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setName(defaultName || "");
        setCode("");
        setActive(id ? data?.active : true);
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      } else {
        setName(data?.name || "");
        setCode(data?.code || "");
        setActive(id ? (data?.active ?? false) : true);
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      }
    },
    [id, defaultName],
  );

  useEffect(() => {
    if (!id) return;
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    code,
    active,
    id,
  };

  const validateData = (data) => {
    if (data.name) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData?.data?.id);
      setForm(false);
      if (onSuccess) {
        await Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
        });
        onSuccess(returnData?.data.id);
        return;
      }
      if (nextProcess === "new") {
        syncFormWithDb(undefined);
        onNew();
        setId("");
        countryNameRef?.current?.focus();
      } else {
        setForm(false);
        setId("");
        syncFormWithDb(undefined);
      }
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
      });
      dispatchInvalidate();
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
        didClose: () => {
          countryNameRef?.current?.focus();
        },
      });
      return;
    }

    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id !== id)
        ?.some((item) => item.name === name);
    } else {
      foundItem = allData?.data?.some((item) => item.name === name);
    }
    if (foundItem) {
      Swal.fire({
        text: "The Name already exists.",
        icon: "warning",
        didClose: () => {
          countryNameRef?.current?.focus();
        },
      });
      return false;
    }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const deleteData = async (id, childRecord) => {
    const { data } = await trigger(id);

    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.data?.childRecord > 0) {
        Swal.fire({
          icon: "error",
          title: "Child Record Exist",
          text: "Data cannot be deleted!",
        });
      } else {
        try {
          let deldata = await removeData(id).unwrap();
          if (deldata?.statusCode === 1) {
            Swal.fire({
              icon: "error",
              text: deldata?.message || "Something went wrong!",
            });
            return;
          }
          setId("");
          setForm(false);
          Swal.fire({
            title: "Deleted" + "  " + "Successfully",
            icon: "success",
          });
          syncFormWithDb(undefined);
        } catch (error) {
          toast.error("something went wrong");
        }
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
    setReadOnly(false);
  };

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
  };

  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },
    {
      header: "Name",
      accessor: (item) => item?.name,
      className: "font-medium text-gray-900 text-left pl-2 uppercase w-96",
      enableSearch: true
    },
    {
      header: "Code",
      accessor: (item) => item?.code,
      className: "font-medium text-gray-900 text-left pl-2 uppercase w-48",
      enableSearch: true
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },
  ];

  const {
    firstInputRef: countryNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;

  useEffect(() => {
    if ((form || onSuccess) && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form, onSuccess]);

  useEffect(() => {
    if (onSuccess) {
      setTimeout(() => {
        if (document.activeElement) {
          document.activeElement.blur();
        }
        countryNameRef.current?.focus();
      }, 50);
    }
  }, [onSuccess]);

  const formBody = (
    <div className="flex-1 p-3 ">
      <div className="grid grid-cols-1 gap-3 h-full ">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
            <div className="space-y-4 ">
              <div className="grid grid-cols-2 gap-3 h-full">
                <fieldset className="my-1 space-y-2">
                  <TextInputNew1
                    name="Name"
                    type="text"
                    value={name}
                    setValue={setName}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    ref={countryNameRef}
                    onKeyDown={handlers.handleLastInputKeyDown}
                  />

                  <TextInputNew1
                    name="Code"
                    type="text"
                    value={code}
                    setValue={setCode}
                    readOnly={readOnly}
                    onKeyDown={handlers.handleLastInputKeyDown}
                  />

                  <ToggleButton
                    name="Status"
                    options={statusDropdown}
                    value={active}
                    setActive={setActive}
                    readOnly={readOnly}
                    disabled={readOnly}
                    ref={toggleButtonRef}
                    onKeyDown={handlers.handleToggleKeyDown}
                  />
                </fieldset>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (onSuccess) {
    return (
      <div onKeyDown={handleKeyDown} className="h-full flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            Add New Yarn Blend Master
          </h2>
          <button
            type="button"
            onClick={() => saveData("close")}
            ref={saveCloseButtonRef}
            onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
            className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
          >
            <Check size={14} />
            Save
          </button>
        </div>
        {formBody}
      </div>
    );
  }

  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between items-center">
        <h5 className="text-lg font-bold text-gray-800">Yarn Blend Master</h5>
        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-xs px-2 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Yarn Blend Master
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[40%] h-[350px]"}
            onClose={() => {
              setForm(false);
              syncFormWithDb(undefined);
              setId("");
            }}
          >
            <div className="h-full flex flex-col bg-gray-200 ">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Yarn Blend Master"
                        : "Yarn Blend Master"
                      : "Add New Yarn Blend Master"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <div>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(false);
                          setSearchValue("");
                          setId(false);
                        }}
                        className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("close");
                        }}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
                        ref={saveCloseButtonRef}
                        tabIndex={0}
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save & close"}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && !id && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("new");
                        }}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs"
                        onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                        ref={saveNewButtonRef}
                        tabIndex={0}
                      >
                        <Check size={14} />
                        {"Save & New"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {formBody}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
