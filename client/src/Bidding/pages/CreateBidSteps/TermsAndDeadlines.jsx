import React from 'react';

export default function TermsAndDeadlines({ onBack, onNext, bidData, setBidData }) {
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-2">
        <label className="block text-sm text-slate-500 mb-1">Query deadline</label>
        <input
          type="date"
          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue="2026-11-12"
        />
      </div>

      <div className='col-span-2'>
        <label className="block text-sm text-slate-500 mb-1">Submission deadline</label>
        <input
          type="date"
          className="w-full border border-blue-500 bg-white text-slate-900 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue="2026-11-20"
        />
      </div>
      <div className='col-span-3'>
        <label className="block text-sm text-slate-500 mb-1">Terms template</label>
        <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
          <option>Standard Yarn Terms</option>
        </select>
      </div>

      <div className='col-span-5'>
        <label className="block text-sm text-slate-500 mb-1">Payment, delivery and quality policy</label>
        <textarea
          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-md py-2 px-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          defaultValue="Payment: 45 days from invoice. Delivery: to Unit 1 stores. Rejection: quality failures replaced at vendor cost."
        />
      </div>



    </div>
  );
}
