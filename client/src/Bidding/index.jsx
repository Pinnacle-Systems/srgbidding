import React, { useState } from "react";
import { useBiddingAuth, BiddingAuthProvider } from "./context/BiddingAuthContext";
import BiddingLayout from "./layouts/BiddingLayout";

// Current existing components (Acting as Admin/Management views for now)
import Dashboard from "./pages/Dashboard";
import Bids from "./pages/Bids";
import CreateBid from "./pages/CreateBid";

function BiddingAppContent() {
  const [currentView, setCurrentView] = useState("dashboard");
  const { role } = useBiddingAuth();

  // Default to admin for now if no user is found so your existing app keeps working

  const renderView = () => {
    // 1. ADMIN VIEWS (Using your existing components)
    if (role === "Admin") {
      switch (currentView) {
        case "dashboard": return <Dashboard />;
        case "bids": return <Bids setCurrentView={setCurrentView} />;
        case "create": return <CreateBid />;
        case "compare": return <div className="p-8"><h1 className="text-2xl font-bold">Quote Comparison Placeholder</h1></div>;
        case "messages": return <div className="p-8"><h1 className="text-2xl font-bold">Messages Placeholder</h1></div>;
        default: return <Dashboard />;
      }
    }

    // 2. MANAGEMENT VIEWS
    if (role === "Management") {
      switch (currentView) {
        case "dashboard": return <Dashboard />;
        case "bids": return <Bids setCurrentView={setCurrentView} />;
        case "compare": return <div className="p-8"><h1 className="text-2xl font-bold">Quote Comparison Placeholder</h1></div>;
        default: return <Dashboard />;
      }
    }

    // 3. VENDOR VIEWS (Placeholders for now)
    if (role === "Vendor") {
      switch (currentView) {
        case "dashboard": return <div className="p-8"><h1 className="text-2xl font-bold">Vendor Dashboard Placeholder</h1></div>;
        case "bids": return <div className="p-8"><h1 className="text-2xl font-bold">Vendor Bids Placeholder</h1></div>;
        case "messages": return <div className="p-8"><h1 className="text-2xl font-bold">Vendor Messages Placeholder</h1></div>;
        default: return <div className="p-8"><h1 className="text-2xl font-bold">Vendor Dashboard Placeholder</h1></div>;
      }
    }

    return <div className="p-8"><h1 className="text-2xl font-bold text-red-500">Unauthorized Role</h1></div>;
  };

  return (
    <BiddingLayout currentView={currentView} setCurrentView={setCurrentView} role={role}>
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
