import React from "react";
import { useBiddingAuth } from "../context/BiddingAuthContext";

export default function Dashboard() {
  const { role } = useBiddingAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-slate-700">{role}</span>. Here's what's happening.</p>
      </header>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active Bids" value="12" color="blue" />
        <StatCard title="Closing Soon" value="3" color="amber" />
        <StatCard title="Quotes to Review" value="8" color="emerald" />
        <StatCard title="Pending Approval" value="1" color="purple" />
      </div>

      {/* Recent Activity / Closing Soon */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">Bids Closing Soon</h3>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-slate-400">
          <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">No bids closing in the next 24 hours.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
      <div className="mt-4 flex items-baseline">
        <span className={`text-4xl font-black ${colors[color].split(' ')[0]} tracking-tight`}>{value}</span>
      </div>
    </div>
  );
}
