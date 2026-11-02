import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";

import { MastersDropDown } from "../MasterDropDown";
import AccountDetailsDropDown from "../AccountDetailsDropdown";
import { APP_NAME } from "../../../Strings";
import { ROLES_API, PAGES_API } from "../../../Api";
import { CloseButtonOnly, SearchButton } from "../../../Buttons";
import { latestExpireDateWithinNDays } from "../../../Utils/helper";
import { GLOBE_ICON } from "../../../icons";
import { useGetPageGroupQuery } from "../../../redux/services/PageGroupMasterServices";
import MultiLevelDropDown from "../../../UiComponents/MultiSelectDropDown";
import useLogout, { socket } from "../../../CustomHooks/useLogout";
import logo from "../../../assets/SRG company logo.png";
import dp from "../../../assets/default-dp.png";

import Anugraha from "../../../assets/fish.png";
import { Dropdown } from "react-multi-select-component";
import PageSearch from "./PageSearch";
import Modal from "../../../UiComponents/Modal";
import Logout from "../LogoutConfirm";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AppHeader = ({ setIsGlobalOpen, }) => {

  const [hideNavBar, sethideNavBar] = useState(true);
  const dispatch = useDispatch()
  const [logout, setLogout] = useState(false)


  const handleOutsideClick = () => {
    sethideNavBar(true);
  };

  const ref = useOutsideClick(handleOutsideClick);

  const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetUserByIdQuery(id, { skip: !id });

  useEffect(() => {
    const handleApprovalNotification = (data) => {
      const msg = data.message || "Approval notification received";
      if (data.type === "APPROVAL_REQUIRED") {
        toast.info("\uD83D\uDD14 " + msg, {
          autoClose: 8000,
          position: "top-right",
        });
      } else if (data.type === "APPROVED") {
        toast.success("\u2705 " + msg, {
          autoClose: 6000,
          position: "top-right",
        });
      } else if (data.type === "REJECTED") {
        toast.error("\u274C " + msg, {
          autoClose: 6000,
          position: "top-right",
        });
      } else {
        toast.info(msg, { autoClose: 5000 });
      }
    };
    socket.on("approval_notification", handleApprovalNotification);
    return () => {
      socket.off("approval_notification", handleApprovalNotification);
    };
  }, []);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const [allowedPages, setAllowedPages] = useState([]);

  console.log("alowed Pages", allowedPages);

  const {
    data: pageGroup,
    isLoading,
    isFetching,
  } = useGetPageGroupQuery({ searchParams: "" });

  const toggleNavMenu = () => {
    sethideNavBar(!hideNavBar);
  };

  // const defaultAdmin = JSON.parse(
  //   secureLocalStorage.getItem(
  //     sessionStorage.getItem("sessionId") + "defaultAdmin"
  //   )
  // );
  useLogout();

  const retrieveAllowedPages = useCallback(() => {
    if (
      JSON.parse(
        secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "defaultAdmin",
        ),
      )
    ) {
      axios({
        method: "get",
        url: BASE_URL + PAGES_API,
        params: { active: true },
      }).then(
        (result) => {
          console.log("result", result.data.data);
          setAllowedPages(result.data.data);
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
        },
      );
    } else {
      axios({
        method: "get",
        url:
          BASE_URL +
          ROLES_API +
          `/${secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userRoleId",
          )}`,
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              setAllowedPages(
                result.data.data.RoleOnPage.filter(
                  (page) => page.page.active && page.read,
                ).map((page) => {
                  return {
                    name: page.page.name,
                    type: page.page.type,
                    link: page.page.link,
                    id: page.page.id,
                    pageGroupId: page.page.pageGroupId,
                  };
                }),
              );
            }
          } else {
            console.log(result);
          }
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
        },
      );
    }
  }, []);
  useEffect(retrieveAllowedPages, [retrieveAllowedPages]);
  const hideExpireWarning = () => {
    let expireWarningDiv = document.getElementById("expireWarning");
    expireWarningDiv.style.display = "none";
  };
  function findElement(id, arr) {
    if (!arr) return "";
    let data = arr.find((item) => parseInt(item.id) === parseInt(id));
    return data ? data.name : "";
  }
  const masters = allowedPages.filter((page) => page.type === "Masters");
  const mastersGroup = [
    ...new Set(masters.map((page) => page.pageGroupId)),
  ].map((pageId) => {
    return { id: pageId, name: findElement(pageId, pageGroup?.data) };
  });
  const transactions = allowedPages.filter(
    (page) => page.type === "Transactions",
  );
  const transactionsGroup = [
    ...new Set(transactions.map((page) => page.pageGroupId)),
  ].map((pageId) => {
    return { id: pageId, name: findElement(pageId, pageGroup?.data) };
  });
  const reports = allowedPages.filter((page) => page.type === "Reports");
  const reportGroups = [
    ...new Set(reports.map((page) => page.pageGroupId)),
  ].map((pageId) => {
    return { id: pageId, name: findElement(pageId, pageGroup?.data) };
  });

  return (

    <div className="w-full relative z-40 bg-white">
      <div className='flex h-11 w-full items-center justify-between bg-white px-2 sm:px-4 border-b border-gray-100'>
        <Modal
          isOpen={logout}
          onClose={() => {
            setLogout(false);
          }}
          widthClass={""}
        >
          <Logout setLogout={setLogout} />
        </Modal>
        <div className="flex shrink-0 items-center">
          <img className="h-5"
            src={logo}
            alt="" />
        </div>
        <div className="nav-item flex-grow ">
          <div
            className={`flex items-center mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
          >
            <MultiLevelDropDown heading={"Masters"} groups={mastersGroup} pages={masters} />
          </div>
          <div
            className={`flex items-center mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
          >
            <MultiLevelDropDown heading={"Transactions"} groups={transactionsGroup} pages={transactions} />
          </div>
          <div
            className={`block mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
          >
            <MultiLevelDropDown heading={"Reports"} groups={reportGroups} pages={reports} />
          </div>


        </div>
        <div className="mr-1 md:mr-9 flex items-center gap-1.5 sm:gap-3">


          <PageSearch pageList={allowedPages} />
          <div
            className="text-lg cursor-pointer"
            onClick={() => { setIsGlobalOpen(true) }}>
            {GLOBE_ICON}
          </div>
          {/* <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-beige">
                    <NotificationBell />
                </div> */}

          <div className="relative text-left">

            <div className="relative text-left">
              <button
                ref={ref}
                onClick={toggleNavMenu}
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-2xl"
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
              >
                <img className="rounded-full cursor-pointer" width={'25px'}
                  src={dp}
                  alt="image" />

              </button>
              <div
                className={`right-0 absolute mt-2 w-52 origin-top-right rounded-md bg-white z-50 shadow-lg border border-gray-100 ${navBatItemsStyle}`}
              >
                <div className="bg-gray-100 flex p-2 items-center rounded-lg relative z-50">
                  <div className="mr-2 w-12">
                    <img className="rounded-full" width={'30px'} height={'30px'} src={dp} alt="image" />
                  </div>
                  <div className="relative z-50">
                    <div className="text-sm text-black my-0 py-0 font-medium">
                      {secureLocalStorage.getItem(
                        sessionStorage.getItem("sessionId") + "username"
                      )}
                    </div>
                    <div className="text-[11px] p-0 text-gray-400 -mt-1">{singleData?.data?.email}</div>
                  </div>
                </div>
                <button className="nav-dropdown-bg z-99 p-2 w-full" onClick={() => { dispatch(push({ id: 1000000, name: "ACCOUNT SETTINGS" })) }}>
                  <pre>ACCOUNT SETTINGS</pre>
                </button>
                {allowedPages.filter((page) => page.type === "AdminAccess")?.map((item, index) => (
                  <button
                    key={index}
                    type="link"
                    className="nav-dropdown-bg z-99 p-2 text-start block w-full"
                    onClick={(e) => {
                      dispatch(push({ id: item.id, name: item.name }))
                      secureLocalStorage.setItem(
                        sessionStorage.getItem("sessionId") + "currentPage",
                        item.id
                      );
                    }}
                  >
                    <pre>{item.name}</pre>
                  </button>
                ))}

                <button className="nav-dropdown-bg z-50 p-2 w-full" onClick={() => setLogout(true)}>
                  <pre>LOG OUT</pre>

                </button>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppHeader;
