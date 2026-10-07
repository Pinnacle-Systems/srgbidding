import React from 'react';

export default function ReviewAndPublish({ onBack, bidData, setBidData }) {
  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-slate-800">Review & Publish</h3>
      <p className="text-sm text-slate-500">Please review all details before publishing the bid. Once published, vendors will be notified.</p>
      
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700">
        <p className="font-medium text-slate-900 mb-2">Bid Summary Check</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Lots configured: {bidData.lots.length}</li>
          <li>Indents assigned: {bidData.lots.reduce((acc, lot) => acc + lot.indents.length, 0)}</li>
          <li>Terms selected: Standard Yarn Terms</li>
        </ul>
      </div>

    </div>
  );
}
