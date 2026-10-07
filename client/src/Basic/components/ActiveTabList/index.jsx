import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { push, remove } from "../../../redux/features/opentabs";
import {
  CountryMaster,
  PageMaster,
  StateMaster,
  CityMaster,
  DepartmentMaster,
  EmployeeCategoryMaster,
  FinYearMaster,
  UserAndRolesMaster,
  PageGroupMaster,
  AccountSettings,
  ControlPanel,
  EmployeeMaster,
  TermsAndCondition,
  PayTermMaster,
  LocationMaster,
  ApprovalRuleOperator,
  ApprovalRuleField,
  ApprovalRuleModule,
  CurrencyMaster,
  BankMaster,
  ItemSubGroupMaster,
} from "..";

import { CLOSE_ICON, DOUBLE_NEXT_ICON } from "../../../icons";
import CompanyMaster from "../CompanyMaster";
import { useState } from "react";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import {
  PartyCategoryMaster,
  PartyMaster,
  ProductBrandMaster,
  ProductCategoryMaster,
  ProductMaster,
  PurchaseBillEntry,
  PurchaseRegister,
  PurchaseReturn,
  SalesBillEntry,
  SalesRegister,
  SalesReturn,
  UomMaster,
  StockRegister,
  MonthlySales,
  MonthlyPurchase,
  CurrentStock,
  MonthlyProfit,
  PaymentDetail,
  OpeningStock,
  PaymentLedgre,
  QuatationStock,
  Ledger,
  PurchaseLedger,
  PurchasepayLedgre,
  DeliveryChallan,
  StyleMaster,
  StyleItemMaster,
  DeliveryInvoice,
  ColorMaster,
  TaxTermMaster,
  TaxTemplate,
  HsnMaster,
  BranchTypeMaster,
  OpeningBalance,
  PurchaseOrder,
  PurchaseInward,
  PurchaseCancel,
  ItemGroup,
  Gsm,
  Size,
  SizeTemplate,
  PurchaseReport,
  ApprovalMaster,
  StockReport,
  OrderEntry,
  ProcessMaster,
  ProcessGroupMaster,
  JobCard,
  PlateMaster,
  DieMaster,
  BoardMaster,
  ProformaInvoice,
  ProductionAllocation,
  MachineMaster,
  ProductionOutward,
  ProductionInward,
  ProcessBill,
  SalesDelivery,
  MaterialIssue,
  MaterialReturn,
  OrderMaster,
  LineMaster,
  OrdersReport,
  MaterialMaster,
  InternalIndentForm,
  YarnMaster,
  CountMaster,
  YarnBlendMaster,
  FabricMaster,
  YarnIndentForm,
  FabricIndentForm,
  DyesChemicalIndentForm,
  GeneralIndentForm,
  SparepartIndentForm,
} from "../../../HostelStore/Components";
import BiddingApp from "../../../Bidding";

const ActiveTabList = () => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);

  const ref = useOutsideClick(() => {
    setShowHidden(false);
  });

  const tabs = {
    "PAGE MASTER": <PageMaster />,
    "COUNTRY MASTER": <CountryMaster />,
    "STATE MASTER": <StateMaster />,
    "CITY MASTER": <CityMaster />,
    "DEPARTMENT MASTER": <DepartmentMaster />,
    "EMPLOYEE CATEGORY MASTER": <EmployeeCategoryMaster />,
    "FIN YEAR MASTER": <FinYearMaster />,
    "USERS & ROLES": <UserAndRolesMaster />,
    "ACCOUNT SETTINGS": <AccountSettings />,
    "CONTROL PANEL": <ControlPanel />,
    "EMPLOYEE MASTER": <EmployeeMaster />,
    "COMPANY MASTER": <CompanyMaster />,
    "PARTY CATEGORY MASTER": <PartyCategoryMaster />,
    "PAGE GROUP MASTER": <PageGroupMaster />,
    "PRODUCT BRAND MASTER": <ProductBrandMaster />,
    "PRODUCT CATEGORY MASTER": <ProductCategoryMaster />,
    "PRODUCT MASTER": <ProductMaster />,
    "PURCHASE BILL ENTRY": <PurchaseBillEntry />,
    "PURCHASE ORDER": <PurchaseOrder />,
    "PURCHASE CANCEL": <PurchaseCancel />,
    "PURCHASE INWARD": <PurchaseInward />,
    "CUSTOMER / SUPPLIER MASTER": <PartyMaster />,
    "SALES BILL ENTRY": <SalesBillEntry />,
    "PURCHASE RETURN": <PurchaseReturn />,
    "SALES RETURN": <SalesReturn />,
    "PURCHASE REGISTER": <PurchaseRegister />,
    "SALES REGISTER": <SalesRegister />,
    "UOM MASTER": <UomMaster />,
    "STOCK REGISTER": <StockRegister />,
    "MONTHLY SALES REPORTS": <MonthlySales />,
    "MONTHLY PURCHASE REPORT": <MonthlyPurchase />,
    "CURRENT STOCK": <CurrentStock />,
    "PROFIT REPORT": <MonthlyProfit />,
    "PAYMENT DETAIL": <PaymentDetail />,
    "OPENING STOCK": <OpeningStock />,
    "QUATATION STOCK": <QuatationStock />,
    "PAYMENT OUTSTANDING LEDGER": <PaymentLedgre />,
    "PURCHASE PAYMENT LEDGRE": <PurchasepayLedgre />,
    "CUSTOMER LEDGER": <Ledger />,
    "PURCHASE LEDGER": <PurchaseLedger />,
    "DELIVERY CHALLAN": <DeliveryChallan />,
    "STYLE MASTER": <StyleMaster />,
    "ITEM MASTER": <StyleItemMaster />,
    "INVOICE": <DeliveryInvoice />,
    "COLOR MASTER": <ColorMaster />,
    "TAX TERM MASTER": <TaxTermMaster />,
    "TAX TEMPLATE": <TaxTemplate />,
    "HSN MASTER": <HsnMaster />,
    "BRANCH TYPE MASTER": <BranchTypeMaster />,
    "OPENING BALANCE": <OpeningBalance />,
    "TERMS & CONDTIONS MASTER": <TermsAndCondition />,
    "PAY TERM MASTER": <PayTermMaster />,
    "LOCATION MASTER": <LocationMaster />,
    "ITEM GROUP MASTER": <ItemGroup />,
    "GSM MASTER": <Gsm />,
    "SIZE MASTER": <Size />,
    "SIZE TEMPLATE MASTER": <SizeTemplate />,
    "PURCHASE REPORT": <PurchaseReport />,
    "APPROVAL CONFIGURATION": <ApprovalMaster />,
    "STOCK REPORT": <StockReport />,
    "APPROVAL RULE OPERATOR": <ApprovalRuleOperator />,
    "APPROVAL RULE FIELD": <ApprovalRuleField />,
    "APPROVAL RULE MODULE": <ApprovalRuleModule />,
    "ORDER ENTRY": <OrderEntry />,
    "PROCESS MASTER": <ProcessMaster />,
    "PROCESS GROUP MASTER": <ProcessGroupMaster />,
    "JOB CARD": <JobCard />,
    "PLATE MASTER": <PlateMaster />,
    "DIE MASTER": <DieMaster />,
    "BOARD MASTER": <BoardMaster />,
    "PROFORMA INVOICE": <ProformaInvoice />,
    "CURRENCY MASTER": <CurrencyMaster />,
    "BANK MASTER": <BankMaster />,
    "PRODUCTION ALLOCATION": <ProductionAllocation />,
    "MACHINE MASTER": <MachineMaster />,
    "PROCESS ISSUE": <ProductionOutward />,
    "PROCESS RECEIPT": <ProductionInward />,
    "PROCESS BILL": <ProcessBill />,
    "SALES DELIVERY": <SalesDelivery />,
    "ITEM SUB GROUP MASTER": <ItemSubGroupMaster />,
    "MATERIAL ISSUE": <MaterialIssue />,
    "MATERIAL RETURN": <MaterialReturn />,
    "ORDER MASTER": <OrderMaster />,
    "LINE MASTER": <LineMaster />,
    "ORDERS REPORT": <OrdersReport />,
    "INTERNAL INDENT FORM": <InternalIndentForm />,
    "MATERIAL MASTER": <MaterialMaster />,
    "YARN MASTER": <YarnMaster />,
    "YARN BLEND MASTER": <YarnBlendMaster />,
    "FABRIC MASTER": <FabricMaster />,
    "COUNTS MASTER": <CountMaster />,
    "YARN INDENT FORM": <YarnIndentForm />,
    "FABRIC INDENT FORM": <FabricIndentForm />,
    "DYES & CHEMICALS INDENT FORM": <DyesChemicalIndentForm />,
    "GENERAL INDENT FORM": <GeneralIndentForm />,
    "MACHINE SPARE & PARTS": <SparepartIndentForm />,
    "BIDDING": <BiddingApp />

  };
  const innerWidth = window.innerWidth;
  const itemsToShow = innerWidth / 130;

  const currentShowingTabs = openTabs.tabs.slice(0, parseInt(itemsToShow));
  const hiddenTabs = openTabs.tabs.slice(parseInt(itemsToShow));

  return (
    // <div className="relative ">
    <div
      className="w-full h-full min-h-0 flex flex-col overflow-hidden"
      style={{ backgroundColor: "#F8F9FA" }}
    >
      <div className="flex justify-between shrink-0 border-b border-gray-300"
        style={{ backgroundColor: "#F8F9FA" }}
      >
        {/* <div className="flex gap-1 pt-2 px-2 items-end">
          {currentShowingTabs.map((tab, index) => (
            <div
              key={index}
              className={`px-4 py-2 text-xs flex content-center items-center gap-3 transition-colors duration-150 cursor-pointer ${tab.active
                ? "bg-white text-indigo-700 font-semibold border-t-[3px] border-indigo-700 rounded-t-md relative -mb-[1px] border-b border-b-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]"
                : "bg-[#e5e7eb] text-gray-700 hover:bg-gray-300 rounded-t-md border border-transparent"
                }`}
            >
              <button
                onClick={() => {
                  dispatch(push({ name: tab.name }));
                }}
                className="whitespace-nowrap"
              >
                {tab.name}
              </button>
              <button
                className={`p-0.5 rounded-full transition-colors flex items-center justify-center w-4 h-4 ${tab.active ? "hover:bg-indigo-100 text-indigo-700" : "hover:bg-gray-400 text-gray-600"
                  }`}
                onClick={() => {
                  dispatch(remove({ name: tab.name }));
                }}
              >
                {CLOSE_ICON}
              </button>
            </div>
          ))}
        </div>
        <div>
          {hiddenTabs.length !== 0 && (
            <button onClick={() => setShowHidden(true)}>
              {DOUBLE_NEXT_ICON}
            </button>
          )}
        </div>
        {showHidden && (
          <ul
            ref={ref}
            className="absolute right-0 top-5 bg-gray-200 z-50 text-xs p-1"
          >
            {hiddenTabs.map((tab) => (
              <li
                key={tab.name}
                className={`flex justify-between  ${tab.active ? "bg-[#009688]" : "bg-gray-300"
                  } `}
              >
                <button
                  onClick={() => {
                    dispatch(push({ name: tab.name }));
                  }}
                >
                  {tab.name}
                </button>
                <button
                  className="hover:bg-red-400 px-1 rounded-xs transition"
                  onClick={() => {
                    dispatch(remove({ name: tab.name }));
                  }}
                >
                  {CLOSE_ICON}
                </button>
              </li>
            ))}
          </ul>
        )} */}
        <div
          className="relative flex justify-between shrink-0 "
          style={{ backgroundColor: "#F8F9FA" }}
        >
          {/* Tab strip */}
          <div
            role="tablist"
            className="flex  items-end overflow-hidden"
          >
            {currentShowingTabs.map((tab) => (
              <div
                key={tab.name}
                role="tab"
                aria-selected={tab.active}
                tabIndex={0}
                onClick={() => dispatch(push({ name: tab.name }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") dispatch(push({ name: tab.name }));
                  if (e.key === "Delete") dispatch(remove({ name: tab.name }));
                }}
                className={` shrink-0 px-2 py-1 text-[11px] uppercase flex items-center gap-3 bg-[#F5F6F8]  cursor-pointer transition-colors duration-150 ${tab.active
                  ? "bg-white text-indigo-700 font-semibold border-r-[1px] border-b-[2px] border-indigo-700 relative -mb-px shadow-[0_-2px_4px_rgba(0,0,0,0.05)]"
                  : " text-gray-700  border-transparent"
                  }`}
              >
                <span className="whitespace-nowrap">{tab.name}</span>

                <button
                  type="button"
                  aria-label={`Close ${tab.name}`}
                  onClick={(e) => {
                    e.stopPropagation(); // don't also select the tab
                    dispatch(remove({ name: tab.name }));
                  }}
                  className={`rounded-full transition-colors flex items-center justify-center w-4 h-4 ${tab.active
                    ? "text-indigo-700 hover:bg-indigo-100"
                    : "text-gray-600 hover:bg-gray-400"
                    }`}
                >
                  {CLOSE_ICON}
                </button>
              </div>
            ))}
          </div>

          {/* Overflow button */}
          {hiddenTabs.length !== 0 && (
            <div className="flex items-center px-2">
              <button
                type="button"
                aria-label="Show hidden tabs"
                onClick={() => setShowHidden(true)}
                className="p-1 rounded hover:bg-gray-200"
              >
                {DOUBLE_NEXT_ICON}
              </button>
            </div>
          )}

          {/* Hidden tabs dropdown */}
          {showHidden && (
            <ul
              ref={ref}
              className="absolute right-2 top-full mt-1 min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-50 text-xs p-1"
            >
              {hiddenTabs.map((tab) => (
                <li
                  key={tab.name}
                  onClick={() => {
                    dispatch(push({ name: tab.name }));
                    setShowHidden(false);
                  }}
                  className={`flex justify-between items-center gap-3 px-3 py-2 rounded cursor-pointer uppercase ${tab.active
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <span className="whitespace-nowrap">{tab.name}</span>
                  <button
                    type="button"
                    aria-label={`Close ${tab.name}`}
                    className="hover:bg-red-100 text-gray-600 hover:text-red-600 px-1 rounded transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(remove({ name: tab.name }));
                    }}
                  >
                    {CLOSE_ICON}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {openTabs.tabs.map((tab, index) => (
        <div
          key={index}
          className={`${tab.active ? "block" : "hidden"} flex-1 min-h-0 overflow-hidden`}
        >
          {tabs[tab.name]}
        </div>
      ))}
    </div>
  );
};

export default ActiveTabList;
