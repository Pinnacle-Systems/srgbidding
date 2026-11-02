import React from 'react';
import { ReusableInput, ReusableInputNew } from '../../../Inputs';
import SearchableTableCellSelect from '../../../HostelStore/Components/ReusableComponents/SearchableTableCellSelect';
import { useGetTermsandCondtionsQuery } from '../../../redux/uniformService/TermsAndContionService';

export default function BidDetails({ id, bidData, setBidData }) {
  // Helper to handle input changes
  const handleChange = (e) => {
    console.log(e, "bid create value")
    const { name, value } = e.target;
    setBidData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const totalLots = bidData.lots?.length || 0;
  const totalIndents = bidData.lots?.reduce((sum, lot) => sum + (lot.indents?.length || 0), 0) || 0;

  const uniqueVendorIds = new Set();
  (bidData.lots || []).forEach(lot => {
    (lot.indents || []).forEach(ind => {
      (ind.vendors || []).forEach(v => {
        uniqueVendorIds.add(String(v.id || v.vendorId || v.name));
      });
    });
  });
  const totalVendors = uniqueVendorIds.size;

  const queryDeadline = bidData.queryDeadline || bidData.terms?.queryDeadline || '2026-11-12';
  const submissionDeadline = bidData.submissionDeadline || bidData.terms?.submissionDeadline || '2026-11-20';
  const termsTemplate = bidData.termsTemplate || bidData.terms?.termsTemplate || 'Standard Yarn Terms';
  const paymentPolicy = bidData.paymentPolicy || bidData.terms?.paymentPolicy || 'Payment: 45 days from invoice. Delivery: to Unit 1 stores. Rejection: quality failures replaced at vendor cost.';

  const { data: termsList } = useGetTermsandCondtionsQuery({});

  const itemOptions = (id ? termsList?.data : termsList?.data?.filter(i => i.active) || [])?.map((item) => ({
    value: item.id,
    label: item?.name || "",
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">

        {/* <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Bid No</label>
          <input
            type="text"
            name="bidNo"
            value={bidData.docId || 'New'}
            onChange={handleChange}
            disabled
            placeholder="e.g. BID-2026-001"
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow"
          />
        </div> 
        
           <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Bid Date</label>
          <input
            type="date"
            name="bidDate"
            value={bidData.date || ''}
            disabled
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow"
          />
        </div>

             <div className="col-span-12 sm:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Submission deadline</label>
          <input
            type="date"
            value={submissionDeadline}
            onChange={(e) => handleChange('submissionDeadline', e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        */}


        <ReusableInput label="Bid No" readOnly value={bidData.docId || 'New'}
          disabled
        />
        <ReusableInput label="Bid Date" value={bidData.date || ''} type="date" required readOnly disabled />

        <div className='col-span-2'>
          <ReusableInput label="Bid Tittle" placeholder="Search Customer Name..."
            value={bidData.bidTitle} name="bidTitle" setValue={handleChange}

          />
        </div>

        <ReusableInput type="date" label="Submission Deadline" placeholder="Search Customer Name..."
          value={bidData.submissionDeadline} name="submissionDeadline" setValue={handleChange}
        // readOnly={false}
        />
        <div className='col-span-2'>

          <SearchableTableCellSelect
            name="Terms and Conditions"
            value={bidData.termId}
            options={itemOptions}
            // disabled={readOnly}
            onChange={(nextValue) => {
              setBidData(prev => ({
                ...prev,
                termId: nextValue
              }));
            }}
            className={''}
          // addNewModalWidth="w-[90%] h-[95%]"
          // childComponent={ItemMaster}
          // addNewLabel="+ Add New Item"
          // handlers={handlers}
          // movedToNextSaveNewRef={movedToNextSaveNewRef}
          />
        </div>



        {/* <div className="col-span-12 sm:col-span-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Terms template</label>
          <select
            value={termsTemplate}
            onChange={(e) => handleChange('termsTemplate', e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="Standard Yarn Terms">Standard Yarn Terms</option>
            <option value="Fabric Procurement Guidelines">Fabric Procurement Guidelines</option>
            <option value="Chemical & Dyehouse Compliance">Chemical & Dyehouse Compliance</option>
            <option value="General Engineering Spares">General Engineering Spares</option>
          </select>
        </div> */}


      </div>
      <div className="md:col-span-2 mt-4">
        <label className="block text-[14px] font-bold text-slate-700 mb-2">Bid Overall Summary</label>
        <div className="flex gap-4">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-bold text-slate-700">Total Lots</p>
              <p className="text-2xl font-bold text-slate-800">{totalLots}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>

          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-bold text-slate-700">Total Indents</p>
              <p className="text-2xl font-bold text-slate-800">{totalIndents}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
          </div>
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-bold text-slate-700">Total Vendors</p>
              <p className="text-2xl font-bold text-slate-800">{totalVendors}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
