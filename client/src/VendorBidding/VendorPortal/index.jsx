import React, { useState } from 'react';
import VendorBidsList from './VendorBidsList';
import VendorIndentWorkspace from './VendorIndentWorkspace';
import { DEMO_COMMUNICATIONS_BID } from '../pages/Communications/BiddingCommunicationsHub';

export default function VendorPortal({ initialView = 'bids' }) {
  const [vendorView, setVendorView] = useState(initialView); // 'bids' | 'workspace'
  const [selectedBid, setSelectedBid] = useState(DEMO_COMMUNICATIONS_BID);
  const [initialIndentId, setInitialIndentId] = useState(null);
  const [initialTab, setInitialTab] = useState('quote');

  const handleOpenWorkspace = (bid, indentId = null, tab = 'quote') => {
    setSelectedBid(bid || DEMO_COMMUNICATIONS_BID);
    if (indentId) setInitialIndentId(indentId);
    if (tab) setInitialTab(tab);
    setVendorView('workspace');
  };

  const handleBackToBids = () => {
    setVendorView('bids');
  };

  return (
    <div className="p-4 max-w-full">
      {vendorView === 'bids' ? (
        <VendorBidsList
          onOpenWorkspace={handleOpenWorkspace}
          currentVendorName="Kovai Yarns & Spinners"
        />
      ) : (
        <VendorIndentWorkspace
          bidData={selectedBid}
          initialIndentId={initialIndentId}
          initialTab={initialTab}
          onBackToBids={handleBackToBids}
        />
      )}
    </div>
  );
}
