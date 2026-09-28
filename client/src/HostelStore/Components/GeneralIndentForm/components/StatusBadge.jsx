import React from "react";

export default function StatusBadge({ status }) {
  const getBadgeStyle = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      case "RETURNED":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "CANCELLED":
        return "bg-slate-100 text-slate-800 border-slate-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full border ${getBadgeStyle(
        status
      )}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}
