import React from "react";
import { useEffect, useState } from "react";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { Loader } from "../../../Basic/components";
import {
  findFromList,
  getCommonParams,
  getDateFromDateTimeToDisplay,
} from "../../../Utils/helper";
import { showEntries } from "../../../Utils/DropdownData";
import secureLocalStorage from "react-secure-storage";
import {
  pageNumberToReactPaginateIndex,
  reactPaginateIndexToPageNumber,
} from "../../../Utils/helper";
import ReactPaginate from "react-paginate";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useGetPurchaseInwardEntryQuery } from "../../../redux/uniformService/PurchaseInwardEntry";
import { Tooltip } from "@mui/material";
import { Receipt, RotateCcw } from "lucide-react";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { Pagination } from "../../../Basic/components/Inputs";

const InternalRequestEntry = ({
  onClick,
  onView,
  itemsPerPage = 10,
  onEdit,
  onDelete,
  rowActions = true,
}) => {
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId",
  );

  const [serachDocNo, setSerachDocNo] = useState("");
  const [searchClientName, setSearchClientName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [searchInwardType, setSearchInwardType] = useState("");

  const [currentPageNumber, setCurrentPageNumber] = useState(1);


  const searchFields = {
    serachDocNo: serachDocNo.toUpperCase(),
    searchClientName: searchClientName.toUpperCase(),
    searchDate,
    searchSupplier: searchSupplier.toUpperCase(),
    searchInwardType,
  };

  useEffect(() => {
    setCurrentPageNumber(1);
  }, [
    serachDocNo,
    searchClientName,
    searchDate,
    searchSupplier,
    searchInwardType,
  ]);


  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetPurchaseInwardEntryQuery({
    params: {
      branchId,
      ...searchFields,
      pagination: true,
      dataPerPage: itemsPerPage,
      pageNumber: currentPageNumber,
    },
  });



  const isLoadingIndicator = isLoading || isFetching;



  const totalPages = Math?.ceil((allData?.totalCount || 0) / parseInt(itemsPerPage));
  const indexOfFirstItem = 0;
  const indexOfLastItem = Math.min(currentPageNumber * parseInt(itemsPerPage), allData?.totalCount || 0);
  const currentItems = allData?.data?.slice(indexOfFirstItem, indexOfLastItem);



  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPageNumber(1);
      (newPage);
    }
  };


  return (
    <div
      //   id="registrationFormReport"
      className="flex flex-col w-full h-[78Vh] overflow-auto"
    >
      <>
        <div className="h-[100vh] rounded-lg bg-[#F1F1F0] shadow-sm">
          <div className="h-[68vh]">
            <table className="">
              <thead className="bg-gray-200 text-gray-800 ">
                <tr className="">
                  <th className=" px-1 py-1.5  font-medium text-[13px]  text-gray-900  text-center  w-12">
                    <div className="">S No</div>
                  </th>

                  <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-32">
                    <div>Inward No</div>
                    {/* <input
                                            type="text"
                                            className="text-black h-5   w-full py-1.5  px-1 focus:outline-none border  border-gray-400 rounded-lg"
                                            placeholder="Search"
                                            value={serachDocNo}
                                            onChange={(e) => {
                                                setSerachDocNo(e.target.value);
                                            }}
                                        /> */}
                  </th>
                  <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-32">
                    <div>Inward Date</div>
                    {/* <input
                                            type="text"
                                            className="text-black h-5   w-full py-1.5  px-1 focus:outline-none border  border-gray-400 rounded-lg"
                                            placeholder="Search"
                                            value={searchDate}
                                            onChange={(e) => {
                                                setSearchDate(e.target.value);
                                            }}
                                        /> */}
                  </th>
                  <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-40">
                    <div>Inward Type</div>
                    {/* <input
                                            type="text"
                                            className="text-black h-5   w-full py-1.5  px-1 focus:outline-none border  border-gray-400 rounded-lg"
                                            placeholder="Search"
                                            value={searchDate}
                                            onChange={(e) => {
                                                setSearchDate(e.target.value);
                                            }}
                                        /> */}
                  </th>

                  <th className="w-80  px-3   font-medium text-[13px] text-gray-900  text-center ">
                    <div>Supplier</div>
                    {/* <input
                                            type="text"
                                            className="text-black h-5   w-full py-1.5  px-1 focus:outline-none border  border-gray-400 rounded-lg"
                                            placeholder="Search"
                                            value={searchClientName}
                                            onChange={(e) => {
                                                setSearchClientName(e.target.value);
                                            }}
                                        /> */}
                  </th>
                  {/* <th
                    className=" px-3 w-64  font-medium text-[13px]  text-gray-900  text-center "
                    rowSpan={2}
                  >
                    <div>Status</div>
                  </th> */}
                  <th
                    className="w-14   px-3  font-medium text-[13px]  text-gray-900  text-center "
                    rowSpan={2}
                  >
                    <div>Actions</div>
                  </th>
                </tr>
                <tr className="">
                  <th className=" px-1  font-medium text-[13px] justify-end  text-gray-900  text-center  w-12">
                    <div className="h-3"></div>
                  </th>

                  <th className=" px-1 font-medium text-[13px] border  text-gray-900  text-center w-32">
                    <input
                      type="text"
                      className="text-black h-5   w-full  px-1 focus:outline-none border  border-gray-400 rounded-md"
                      placeholder="Search"
                      value={serachDocNo}
                      onChange={(e) => {
                        setSerachDocNo(e.target.value);
                      }}
                    />
                  </th>
                  <th className="  px-1 font-medium text-[13px]  text-gray-900  text-center w-32">
                    <input
                      type="text"
                      className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                      placeholder="Search"
                      value={searchDate}
                      onChange={(e) => {
                        setSearchDate(e.target.value);
                      }}
                    />
                  </th>
                  <th className="  px-1 font-medium text-[13px]  text-gray-900  text-center w-40">
                    <input
                      type="text"
                      className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                      placeholder="Search"
                      value={searchInwardType}
                      onChange={(e) => {
                        setSearchInwardType(e.target.value);
                      }}
                    />
                  </th>
                  <th className="w-80  px-1 font-medium text-[13px]  text-gray-900  text-center ">
                    <input
                      type="text"
                      className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                      placeholder="Search"
                      value={searchSupplier}
                      onChange={(e) => {
                        setSearchSupplier(e.target.value);
                      }}
                    />
                  </th>
                </tr>
              </thead>
              {isLoadingIndicator ? (
                <tbody>
                  <tr>
                    <td>
                      <Loader />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="border-2">
                  {(currentItems ? currentItems : []).map(
                    (dataObj, index) => (
                      <tr
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            onClick(dataObj.id);
                          }
                        }}
                        tabIndex={0}
                        key={dataObj.id}
                        className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          }`}
                        onClick={() => {
                          onClick(dataObj.id);
                        }}
                      >
                        <td className="text-center ">{index + 1}</td>

                        <td className="py-1.5 text-center">{dataObj.docId} </td>

                        <td className="py-1.5 text-left">
                          {getDateFromDateTimeToDisplay(dataObj.docDate)}
                        </td>
                        <td className="py-1.5 text-left  ">
                          {dataObj.inwardType}{" "}
                        </td>

                        <td className="py-1.5 text-left">
                          {" "}
                          {`${dataObj?.supplier?.name}${dataObj?.supplier?.BranchType?.name
                            ? ` / ${dataObj?.supplier?.BranchType?.name}`
                            : ""
                            }${dataObj?.supplier?.City?.name ? ` / ${dataObj?.supplier?.City?.name}` : ""}`}
                        </td>
                        {/* <td className="py-1.5 text-center">
                          <StatusBadge status={dataObj?.status} />
                        </td> */}
                        {rowActions && (
                          <td className="px-2 py-1">
                            <div className="flex items-center justify-center">
                              {/* <div className="flex items-center gap-1 pr-2 border-r border-gray-300">

                                <Tooltip title="Create Bill Entry" arrow>
                                  <button
                                    disabled={
                                      dataObj.receiptType
                                        ?.trim()
                                        .toLowerCase() === "against invoice" ||
                                      [
                                        "Fully Billed",
                                        "Fully Returned",
                                      ].includes(dataObj.status)
                                    }
                                    onClick={() => {
                                      dispatch(
                                        push({
                                          name: "PURCHASE BILL ENTRY",
                                          params: {
                                            supplierId: dataObj.supplierId,
                                            purchaseInwardId: dataObj.id,
                                            inwardDocId: dataObj.docId,
                                            inwardType: dataObj.inwardType,
                                            timestamp: Date.now(),
                                          },
                                        }),
                                      );
                                    }}
                                    className={`p-1.5 rounded-md transition ${
                                      dataObj.receiptType
                                        ?.trim()
                                        .toLowerCase() === "against invoice" ||
                                      [
                                        "Fully Billed",
                                        "Fully Returned",
                                      ].includes(dataObj.status)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                    }`}
                                  >
                                    <Receipt size={16} />
                                  </button>
                                </Tooltip>

                                <Tooltip title="Create Return" arrow>
                                  <button
                                    disabled={["Fully Returned"].includes(
                                      dataObj.status,
                                    )}
                                    onClick={() => {
                                      dispatch(
                                        push({
                                          name: "PURCHASE RETURN",
                                          params: {
                                            supplierId: dataObj.supplierId,
                                            purchaseInwardId: dataObj.id,
                                            inwardDocId: dataObj.docId,
                                            inwardType: dataObj.inwardType,
                                            timestamp: Date.now(),
                                          },
                                        }),
                                      );
                                    }}
                                    className={`p-1.5 rounded-md transition
                ${
                  ["Fully Returned"].includes(dataObj.status)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                }`}
                                  >
                                    <RotateCcw size={16} />
                                  </button>
                                </Tooltip>
                              </div> */}

                              <div className="flex items-center gap-1 pl-2">
                                {onView && (
                                  <Tooltip title="View" arrow>
                                    <button
                                      className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
                                      onClick={() => onView(dataObj.id)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path
                                          fillRule="evenodd"
                                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>
                                  </Tooltip>
                                )}
                                {onEdit && (
                                  <Tooltip title="Edit" arrow>
                                    <button
                                      className="text-green-600 gap-1 px-1   bg-green-50 rounded"
                                      onClick={() => onEdit(dataObj.id)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      </svg>
                                    </button>
                                  </Tooltip>
                                )}
                                {onDelete && (
                                  <Tooltip
                                    title={
                                      dataObj.childRecord > 0
                                        ? "Cannot Delete. Child Record Exists"
                                        : "Delete"
                                    }
                                    arrow
                                  >
                                    <button
                                      className={`flex items-center gap-1 px-1 rounded transition
       ${dataObj.childRecord > 0
                                          ? "bg-red-50 text-red-500 opacity-40 cursor-not-allowed"
                                          : "bg-red-50 text-red-800 hover:bg-red-100"
                                        }`}
                                      onClick={() => onDelete(dataObj.id)}
                                      disabled={dataObj.childRecord > 0}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {/* <span className="text-xs">delete</span> */}
                                    </button>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </td>
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              )}
            </table>
          </div>
          <div className="h-[10vh]">
            <Pagination
              allData={allData}
              currentPageNumber={currentPageNumber}
              handlePageChange={handlePageChange}
              totalPages={totalPages}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}

            />
          </div>
        </div>
      </>
    </div>
  );
};

export default InternalRequestEntry;
