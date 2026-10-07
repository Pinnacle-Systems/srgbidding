import React, { useState } from "react";
import { BiddingAuthProvider } from "./context/BiddingAuthContext";
import BiddingLayout from "./layouts/BiddingLayout";
import Dashboard from "./pages/Dashboard";
import Bids from "./pages/Bids";
import CreateBid from "./pages/CreateBid";

export default function BiddingApp() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "bids":
        return <Bids />;
      case "create":
        return <CreateBid />;
      case "compare":
        return <div className="p-8"><h1 className="text-2xl font-bold">Quote Comparison Placeholder</h1></div>;
      case "messages":
        return <div className="p-8"><h1 className="text-2xl font-bold">Messages Placeholder</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <BiddingAuthProvider>
      <BiddingLayout currentView={currentView} setCurrentView={setCurrentView}>
        {renderView()}
      </BiddingLayout>
    </BiddingAuthProvider>
  );
}
