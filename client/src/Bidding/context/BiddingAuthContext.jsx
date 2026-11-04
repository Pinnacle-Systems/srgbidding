import React, { createContext, useContext, useState } from "react";
import { getCommonParams } from "../../Utils/helper";

const BiddingAuthContext = createContext();

const decodeJwt = (token) => {
  try {
    if (!token) return null;
    const cleanToken = token.replace("Bearer ", "").trim();
    const base64Url = cleanToken.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT Decode error:", e);
    return null;
  }
};

export const useBiddingAuth = () => useContext(BiddingAuthContext);

export const BiddingAuthProvider = ({ children }) => {
  const { branchId, userId, companyId, finYearId, userRole, token, partyId, partyType } = getCommonParams();

  const [vendorId, setVendorId] = useState(() => {
    const decoded = decodeJwt(token);
    return partyId || decoded?.partyId || null;
  });

  const getInitialRole = () => {
    const decoded = decodeJwt(token);
    const roleStr = decoded?.roleName || userRole || "";
    if (
      partyType?.toUpperCase() === "VENDOR" ||
      roleStr.toUpperCase().includes("VENDOR") ||
      (!roleStr && partyId)
    ) {
      return "Vendor";
    }
    if (roleStr.toUpperCase().includes("ADMIN")) return "Admin";
    if (roleStr.toUpperCase().includes("APPROV")) return "Approver";
    return roleStr || "Admin"; // Fallback default
  };
  const [role, setRole] = useState(() => getInitialRole());

  console.log(role, "role")

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
