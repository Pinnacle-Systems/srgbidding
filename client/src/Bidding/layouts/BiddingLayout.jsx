import React, { useState } from "react";
import { useBiddingAuth } from "../context/BiddingAuthContext";

export default function BiddingLayout({ currentView, setCurrentView, children }) {
  const { role, loginAs } = useBiddingAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (view) => currentView === view;

  return (
    <div className="flex h-[calc(100vh-50px)] bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10 transition-all duration-300 ${isSidebarOpen ? 'w-[220px]' : 'w-[72px]'}`}>
        <div className="p-4 h-16 flex items-center justify-center border-b border-slate-800">
          {isSidebarOpen ? (
            <h2 className="text-xl font-bold text-white tracking-tight animate-in fade-in duration-300">SRG Bidding</h2>
          ) : (
            <h2 className="text-xl font-bold text-blue-500 tracking-tight">SRG</h2>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-hidden">


          <button
            onClick={() => setCurrentView("dashboard")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive("dashboard") ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${!isSidebarOpen && 'justify-center'}`}
            title="Dashboard"
          >
            <svg className={`w-5 h-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            {isSidebarOpen && <span className="truncate">Dashboard</span>}
          </button>

          <button
            onClick={() => setCurrentView("bids")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive("bids") ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${!isSidebarOpen && 'justify-center'}`}
            title={role === 'Vendor' ? 'My Bids & Invitations' : 'Bids'}
          >
            <svg className={`w-5 h-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            {isSidebarOpen && <span className="truncate">{role === 'Vendor' ? 'My Bids' : 'Bids'}</span>}
          </button>


          <button
            onClick={() => setCurrentView("create")}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive("create") ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${!isSidebarOpen && 'justify-center'}`}
            title="Create bid"
          >
            <svg className={`w-5 h-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {isSidebarOpen && <span className="truncate">Create bid</span>}
          </button>

          {role === 'Admin' && (
            <>
              <button
                onClick={() => setCurrentView("communications")}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive("communications") ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${!isSidebarOpen && 'justify-center'}`}
                title="Communications & Docs"
              >
                <svg className={`w-5 h-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {isSidebarOpen && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">Communications</span>
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      Live
                    </span>
                  </div>
                )}
              </button>


              <button
                onClick={() => setCurrentView("compare")}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive("compare") ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${!isSidebarOpen && 'justify-center'}`}
                title="Quote comparison"
              >
                <svg className={`w-5 h-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                {isSidebarOpen && <span className="truncate">Quote comparison</span>}
              </button>
            </>
          )}



        </nav>

        {/* Role Switcher (For Development) */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 animate-in fade-in">
            <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-bold">Dev Mode: Role</p>
            <select
              className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none cursor-pointer"
              value={role}
              onChange={(e) => loginAs(e.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        {/* <header className="h-8 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex-1 flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <input
                type="text"
                placeholder="Search bid no., vendor, indent"
                className="w-full bg-slate-100 text-sm text-slate-800 placeholder-slate-400 rounded-lg py-0.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-all"
              />
            </div>
          </div>

        </header> */}

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-1 bg-[#F9FAFB]">
          <div className="w-full h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
