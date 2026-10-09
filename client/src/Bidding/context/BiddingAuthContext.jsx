import React, { createContext, useContext, useState } from "react";

const BiddingAuthContext = createContext();

export const useBiddingAuth = () => useContext(BiddingAuthContext);

export const BiddingAuthProvider = ({ children }) => {
  const [role, setRole] = useState("Admin"); // Admin,  Approver, Vendor
  const [vendorId, setVendorId] = useState(null);

  const loginAs = (newRole, newVendorId = null) => {
    setRole(newRole);
    setVendorId(newVendorId);
  };

  return (
    <BiddingAuthContext.Provider value={{ role, vendorId, loginAs }}>
      {children}
    </BiddingAuthContext.Provider>
  );
};
