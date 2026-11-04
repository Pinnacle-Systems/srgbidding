import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useCreateBidMutation, useGetBidByIdQuery, useUpdateBidMutation } from "../redux/uniformService/BiddingService";
import BidDetails from "./pages/CreateBidSteps/BidDetails";
import Lots from "./pages/CreateBidSteps/LotDetails";
import ReviewAndPublish from "./pages/CreateBidSteps/ReviewAndPublish";
import moment from "moment";
import { getCommonParams } from "../Utils/helper";
import Indents from "./pages/CreateBidSteps/Indent";
import Vendors from "./pages/CreateBidSteps/Vendors";

const steps = [
  { id: 1, name: "Bid details" },
  { id: 2, name: "Lots" },
  { id: 3, name: "Indents" },
  { id: 4, name: "Vendors & Documents" },
  { id: 5, name: "Review & publish" },
];

export default function CreateBid({ editingBidId, onBackToBids }) {

  const [currentStep, setCurrentStep] = useState(1);
  const [bidData, setBidData] = useState({
    details: {},
    lots: [],
    terms: {}
  });
  const { branchId, userId, companyId, finYearId, userRole } = getCommonParams();

  console.log(editingBidId, "editingBidId")

  const { data: fetchedBidResponse, isLoading: isLoadingBid } = useGetBidByIdQuery(editingBidId, {
    skip: !editingBidId,
  });

  useEffect(() => {
    const data = fetchedBidResponse?.data;
    setBidData({
      id: data?.id,
      bidNo: data?.bidNo || data?.docId || "",
      docId: data?.docId || "New",
      bidTitle: data?.name || "",
      date: data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"),
      status: data?.status,
      queryDeadline: data?.queryDeadline ? String(data?.queryDeadline).slice(0, 10) : "",
      submissionDeadline: data?.submissionDeadline ? String(data?.submissionDeadline).slice(0, 10) : "",
      termsTemplate: data?.termsTemplate || "Standard Yarn Terms",
      paymentPolicy: data?.description || "",
      terms: {
        queryDeadline: data?.queryDeadline ? String(data?.queryDeadline).slice(0, 10) : "",
        submissionDeadline: data?.submissionDeadline ? String(data?.submissionDeadline).slice(0, 10) : "",
        termsTemplate: data?.termsTemplate || "Standard Yarn Terms",
        paymentPolicy: data?.description || "",
      },
      lots: data?.BiddingLots?.map((lot, idx) => ({
        id: lot?.id,
        lotNumber: lot?.lotNumber || String(idx + 1),
        name: lot?.name || `Lot ${lot?.lotNumber || idx + 1}`,
        indents: lot?.BiddingIndent?.map((ind) => {
          const custom = ind?.customData || {};
          const dbAttachments = (ind?.biddingIndentAttachments || []).map((att) => ({
            id: att.id,
            title: att.name || att.fileName,
            name: att.name || att.fileName,
            fileName: att.fileName,
            filePath: att.filePath,
            category: "TDS",
            version: "1.0",
            status: "Up to Date",
            updatedAt: att.date ? new Date(att.date).toLocaleDateString("en-GB") : "Recently",
            uploadedBy: "Vendor",
          }));
          return {
            id: ind?.indentItemId || ind?.id,
            biddingIndentId: ind?.id,
            indentId: ind?.indentId,
            indentItemId: ind?.indentItemId,
            docId: custom?.docId || ind?.indentId,
            department: custom?.department || "Knitting",
            requiredBy: custom?.requiredBy || "",
            item_name: custom?.item_name || ind?.Item?.name || "Item",
            qty: ind?.qty || 0,
            uom: ind?.Uom?.name || "KGS",
            category: ind?.indentType || "Yarn",
            commonDocuments: dbAttachments.length > 0 ? dbAttachments : (custom?.commonDocuments || []),
            vendors: ind?.BiddingIndentvendors?.map((v) => ({
              id: v?.vendorId,
              vendorId: v?.vendorId,
              name: v?.Vendor?.name || `Vendor #${v?.vendorId}`,
              label: v?.Vendor?.name || `Vendor #${v?.vendorId}`,
              status: v?.status || "INVITED",
              documents:
                dbAttachments.length > 0
                  ? dbAttachments
                  : ((custom?.vendorDocuments || []).find((vd) => vd?.vendorId === v?.vendorId)?.documents || []),
            })) || [],
            ...(custom.specs || {}),
          };
        }) || [],
      })) || [],
    });

  }, [fetchedBidResponse]);

  const [createBid, { isLoading: isCreating }] = useCreateBidMutation();
  const [updateBid, { isLoading: isUpdating }] = useUpdateBidMutation();

  const nextStep = () => setCurrentStep((prev) => Math.min(5, prev + 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));



  const handleSaveDraft = async (isPublishing = false) => {
    try {
      const allFiles = [];
      const sanitizedLots = (bidData.lots || []).map((lot) => ({
        ...lot,
        indents: (lot.indents || []).map((ind) => {
          const biddingIndentId = ind.biddingIndentId || ind.id;
          const cleanDoc = (doc) => {
            if (doc.file instanceof File) {
              allFiles.push(doc.file);
            }
            const { file, ...rest } = doc;
            return {
              ...rest,
              biddingIndentId,
              fileName: doc.file instanceof File ? doc.file.name : (doc.fileName || doc.title),
            };
          };

          return {
            ...ind,
            commonDocuments: (ind.commonDocuments || []).map(cleanDoc),
            vendors: (ind.vendors || []).map((v) => ({
              ...v,
              documents: (v.documents || []).map(cleanDoc),
            })),
          };
        }),
      }));

      let payload;
      if (allFiles.length > 0) {
        const formData = new FormData();
        formData.append("status", isPublishing ? "PUBLISHED" : (bidData.status || "DRAFT"));
        formData.append("branchId", branchId || "");
        formData.append("userId", userId || "");
        formData.append("companyId", companyId || "");
        formData.append("finYearId", finYearId || "");
        formData.append("userRole", userRole || "Admin");
        formData.append("name", bidData.bidTitle || bidData.name || "");
        formData.append("docId", bidData.docId || "");
        formData.append("bidNo", bidData.bidNo || "");
        formData.append("lots", JSON.stringify(sanitizedLots));
        formData.append("details", JSON.stringify(bidData.details || {}));
        formData.append("terms", JSON.stringify(bidData.terms || {}));

        allFiles.forEach((f) => {
          formData.append("images", f);
        });

        payload = { formData };
      } else {
        payload = {
          ...bidData,
          lots: sanitizedLots,
          status: isPublishing ? "PUBLISHED" : (bidData.status || "DRAFT"),
          branchId,
          userId,
          companyId,
          finYearId,
          userRole,
        };
      }

      let result;
      if (bidData.id) {
        result = await updateBid({ id: bidData.id, ...payload }).unwrap();
      } else {
        result = await createBid(payload).unwrap();
      }

      const savedId = result?.data?.id;
      if (savedId) {
        setBidData((prev) => ({
          ...prev,
          id: savedId,
          status: result.data.status || payload.status,
        }));
      }

      Swal.fire({
        icon: "success",
        title: isPublishing ? "Bid Published Successfully!" : "Progress Saved as Draft",
        text: isPublishing
          ? "Bid has been published and vendors have been notified."
          : `Draft #${savedId || bidData.id || ''} saved. You can continue editing or return anytime.`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (err) {
      console.error("Error saving bid:", err);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: err?.data?.message || err?.message || "Failed to save bid. Please check the fields.",
      });
    }
  };

  const ChevronSeparator = () => (
    <svg
      className="w-4 h-4 text-slate-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  );
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BidDetails onNext={nextStep} bidData={bidData} setBidData={setBidData} />;
      case 2:
        return <Lots onNext={nextStep} onBack={prevStep} bidData={bidData} setBidData={setBidData} />;
      case 3:
        return <Indents onNext={nextStep} onBack={prevStep} bidData={bidData} setBidData={setBidData} />;
      case 4:
        return <Vendors onNext={nextStep} onBack={prevStep} bidData={bidData} setBidData={setBidData} />;
      case 5:
        return <ReviewAndPublish onBack={prevStep} bidData={bidData} setBidData={setBidData} />;
      default:
        return <BidDetails onNext={nextStep} bidData={bidData} setBidData={setBidData} />;
    }
  };



  return (
    <div className="animate-in fade-in duration-500 w-full h-full">
      {/* Stepper Bar & Draft Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-4 mt-2">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">


          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isLast = index === steps.length - 1;

            let stepClasses = "font-medium transition-colors ";
            if (isCompleted) {
              stepClasses += "text-slate-500";
            } else if (isActive) {
              stepClasses += "text-orange-500 font-semibold";
            } else {
              stepClasses += "text-slate-400";
            }

            return (
              <React.Fragment key={step.id}>
                <span className={stepClasses} aria-current={isActive ? "step" : undefined}>
                  {step.name}
                </span>
                {!isLast && <ChevronSeparator />}
              </React.Fragment>
            );
          })}
        </nav>

        {bidData.id && (
          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Bid ID: #{bidData.id} • {bidData.status || 'DRAFT'}
          </span>
        )}
      </div>

      <div className="w-full h-[calc(100vh-110px)] pl-6 pr-2 mt-2">
        {/* Main Form Area */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3">
            {renderStep()}
          </div>

          {/* Stepper Footer Action Bar */}
          <div className="flex items-center justify-between p-2 sm:p-3 border-t border-slate-100 bg-slate-50/70 flex-shrink-0">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2 border border-slate-200 bg-white rounded-md text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm text-sm"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Partial Save / Save Draft button (always available at any step) */}
              <button
                type="button"
                onClick={() => handleSaveDraft(false)}
                disabled={isCreating || isUpdating}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-md text-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Save current progress as draft in database"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>{isCreating || isUpdating ? "Saving..." : (bidData.id ? "Save Changes" : "Save as Draft")}</span>
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm cursor-pointer"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSaveDraft(true)}
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors shadow-sm text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isCreating || isUpdating ? "Publishing..." : "Publish Bid"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
