import React, { useState } from "react";
import {
  useBiddingAuth,
  BiddingAuthProvider,
} from "./context/BiddingAuthContext";
import BiddingLayout from "./layouts/BiddingLayout";
import VendorAllocatedItems from "./pages/VendorAllocatedItems";
import VendorDashboard from "./pages/VendorDashboard";
import BiddingCommunicationsPage from "./pages/Communications";

function BiddingAppContent() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedBidIdForComms, setSelectedBidIdForComms] = useState(null);
  const { role } = useBiddingAuth();

  const renderView = () => {
    if (role === "Vendor") {
      switch (currentView) {
        case "communications":
          return (
            <BiddingCommunicationsPage
              initialBidId={selectedBidIdForComms}
              onBackToBids={() => setCurrentView("bids")}
            />
          );
        case "bids":
          return <VendorAllocatedItems />;
        case "dashboard":
        default:
          return (
            <VendorDashboard
              onNavigateToBids={() => setCurrentView("bids")}
            />
          );
      }
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Unauthorized Role</h1>
      </div>
    );
  };

  return (
    <BiddingLayout
      currentView={currentView}
      setCurrentView={setCurrentView}
      role={role}
    >
      {renderView()}
    </BiddingLayout>
  );
}

export default function BiddingApp() {
  return (
    <BiddingAuthProvider>
      <BiddingAppContent />
    </BiddingAuthProvider>
  );
}
