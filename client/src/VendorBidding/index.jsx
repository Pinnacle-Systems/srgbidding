import React, { useState } from "react";
import {
  useBiddingAuth,
  BiddingAuthProvider,
} from "./context/BiddingAuthContext";
import BiddingLayout from "./layouts/BiddingLayout";

// Current existing components (Acting as Admin/Management views for now)
import Dashboard from "./Dashboard";
import Bids from "./BidsReports";
import BiddingCommunicationsPage from "./pages/Communications";
import VendorPortal from "./VendorPortal";

function BiddingAppContent() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [editingBidId, setEditingBidId] = useState(null);
  const [selectedBidIdForComms, setSelectedBidIdForComms] = useState(null);
  const { role } = useBiddingAuth();

  const renderView = () => {
    if (role === "Vendor") {
      return (
        <VendorPortal
          initialView={currentView === "workspace" ? "workspace" : "bids"}
        />
      );
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
