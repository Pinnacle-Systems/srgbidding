import React, { useState } from "react";
import {
  useBiddingAuth,
  BiddingAuthProvider,
} from "./context/BiddingAuthContext";
import BiddingLayout from "./layouts/BiddingLayout";

// Current existing components (Acting as Admin/Management views for now)
import Dashboard from "./Dashboard";
import Bids from "./BidsReports";
import CreateBid from "./CreateBid";
import BiddingCommunicationsPage from "./pages/Communications";
import VendorPortal from "./VendorPortal";
import VendorBids from "../VendorBidding/vendorBidsReports";

function BiddingAppContent() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [editingBidId, setEditingBidId] = useState(null);
  const [selectedBidIdForComms, setSelectedBidIdForComms] = useState(null);
  const { role } = useBiddingAuth();
  console.log(role, "role");

  const renderView = () => {
    if (role === "Admin") {
      switch (currentView) {
        case "dashboard":
          return <Dashboard />;
        case "bids":
          return (
            <Bids
              setCurrentView={setCurrentView}
              setEditingBidId={setEditingBidId}
              onOpenCommunications={(bidId) => {
                setSelectedBidIdForComms(bidId);
                setCurrentView("communications");
              }}
            />
          );
        case "create":
          return (
            <CreateBid
              editingBidId={editingBidId}
              onBackToBids={() => {
                setEditingBidId(null);
                setCurrentView("bids");
              }}
            />
          );
        case "communications":
          return (
            <BiddingCommunicationsPage
              initialBidId={selectedBidIdForComms}
              onBackToBids={() => setCurrentView("bids")}
            />
          );
        case "compare":
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold">
                Quote Comparison Placeholder
              </h1>
            </div>
          );
        default:
          return <Dashboard />;
      }
    }

    if (role === "Vendor") {
      return (
        <VendorBids
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
