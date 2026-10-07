import React, { useState } from "react";
import BidDetails from "./CreateBidSteps/BidDetails";
import Lots from "./CreateBidSteps/Lots";
import Indents from "./CreateBidSteps/Indents";
import TermsAndDeadlines from "./CreateBidSteps/TermsAndDeadlines";
import ReviewAndPublish from "./CreateBidSteps/ReviewAndPublish";

const steps = [
  { id: 1, name: "Bid details" },
  { id: 2, name: "Lots" },
  { id: 3, name: "Indents" },
  { id: 4, name: "Terms & deadlines" },
  { id: 5, name: "Review & publish" },
];

export default function CreateBid() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bidData, setBidData] = useState({
    details: {},
    lots: [],
    terms: {}
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(5, prev + 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BidDetails onNext={nextStep} bidData={bidData} setBidData={setBidData} />;
      case 2:
        return <Lots onNext={nextStep} onBack={prevStep} bidData={bidData} setBidData={setBidData} />;
      case 3:
        return <Indents onNext={nextStep} onBack={prevStep} bidData={bidData} setBidData={setBidData} />;
      case 4:
        return <TermsAndDeadlines onNext={nextStep} onBack={prevStep} bidData={bidData} setBidData={setBidData} />;
      case 5:
        return <ReviewAndPublish onBack={prevStep} bidData={bidData} setBidData={setBidData} />;
      default:
        return <BidDetails onNext={nextStep} bidData={bidData} setBidData={setBidData} />;
    }
  };

  const totalIndents = bidData.lots.reduce((total, lot) => total + lot.indents.length, 0);

  return (
    <div className="animate-in fade-in duration-500 w-full">
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-2 mb-2 mt-2">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          let stepClasses = "px-4 py-2 rounded-md border text-sm font-medium flex items-center gap-2 transition-colors ";
          if (isCompleted) {
            stepClasses += "border-slate-200 bg-white text-green-600";
          } else if (isActive) {
            stepClasses += "border-blue-500 bg-white text-blue-600";
          } else {
            stepClasses += "border-slate-200 bg-white text-slate-400";
          }

          return (
            <div key={step.id} className={stepClasses}>
              {isCompleted && (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {step.id}. {step.name}
            </div>
          );
        })}
      </div>

      <div className="w-full h-[calc(100vh-180px)]">
        {/* Main Form Area */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
          {/* <div className="p-6 pb-2 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-900">{steps[currentStep - 1].name}</h2>
          </div> */}

          <div className="flex-1 overflow-y-auto p-2">
            {renderStep()}
          </div>

          <div className="flex items-center gap-3 p-6 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-5 py-2 border border-slate-200 bg-white rounded-md text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            )}
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="px-5 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Next
              </button>
            ) : (
              <button
                className="px-5 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                Publish Bid
              </button>
            )}
          </div>
        </div>

        {/* Summary Card */}

      </div>
    </div>
  );
}
