import React, { useState } from "react";

const bidsData = [
  { id: "BID-2026-014", title: "Q4 Cotton Yarn & Fabric", status: "Published", lots: 2, vendors: 3, quotesIn: "2 of 3", closes: "20 Nov, 5:00 PM" },
  { id: "BID-2026-013", title: "Dyes & Chemicals, Nov", status: "Closing", lots: 1, vendors: 4, quotesIn: "3 of 4", closes: "Tomorrow, 11:00 AM" },
  { id: "BID-2026-012", title: "Knitting Machine Spares", status: "Awarded", lots: 3, vendors: 5, quotesIn: "5 of 5", closes: "Closed 28 Sep" },
  { id: "BID-2026-011", title: "Packing Material", status: "Closed", lots: 1, vendors: 3, quotesIn: "3 of 3", closes: "Closed 22 Sep" },
  { id: "BID-2026-015", title: "Polyester Yarn, Dec", status: "Draft", lots: 1, vendors: 0, quotesIn: "-", closes: "Not set" },
  { id: "BID-2026-010", title: "Elastane Supply", status: "Cancelled", lots: 1, vendors: 2, quotesIn: "0 of 2", closes: "Cancelled" },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Published": return "bg-blue-100 text-blue-700";
    case "Closing": return "bg-amber-100 text-amber-700";
    case "Awarded": return "bg-emerald-100 text-emerald-700";
    case "Closed": return "bg-slate-100 text-slate-700";
    case "Draft": return "bg-slate-100 text-slate-700";
    case "Cancelled": return "bg-red-100 text-red-700";
    default: return "bg-slate-100 text-slate-700";
  }
};

const filterTabs = ["All", "Draft", "Published", "Closing", "Awarded", "Closed", "Cancelled"];

export default function Bids() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredBids = activeTab === "All" ? bidsData : bidsData.filter(b => b.status === activeTab);

  return (
    <div className="animate-in fade-in duration-500 max-w-full">


      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${activeTab === tab
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4 font-medium">Bid</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Lots</th>
                <th className="px-6 py-4 font-medium">Vendors</th>
                <th className="px-6 py-4 font-medium">Quotes in</th>
                <th className="px-6 py-4 font-medium">Closes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBids.map((bid) => (
                <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{bid.id}</td>
                  <td className="px-6 py-4">{bid.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(bid.status)}`}>
                      {bid.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{bid.lots}</td>
                  <td className="px-6 py-4">{bid.vendors}</td>
                  <td className="px-6 py-4">{bid.quotesIn}</td>
                  <td className="px-6 py-4">{bid.closes}</td>
                </tr>
              ))}
              {filteredBids.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No bids found for this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
