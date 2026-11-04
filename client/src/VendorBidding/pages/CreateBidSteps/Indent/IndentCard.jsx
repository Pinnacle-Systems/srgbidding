
export default function IndentCard({ indent, lotId, onOpenChat, onRemoveIndent, onOpenDrawer }) {
  const cat = indent.category || indent.indentType || 'Item';
  const vendorsList = indent.vendors || [];
  const commonDocs = indent.commonDocuments || [];

  // Compute total and pending documents
  const totalDocsCount = vendorsList.reduce(
    (sum, v) => sum + (v.documents ? v.documents.length : 0),
    0
  ) + commonDocs.length;

  const pendingDocsCount = vendorsList.reduce(
    (sum, v) => sum + (v.documents ? v.documents.filter(d => d.status === 'Update Needed').length : 0),
    0
  );

  const handleOpenAction = (tab) => {
    if (onOpenDrawer) {
      onOpenDrawer(indent, tab);
    } else if (onOpenChat) {
      onOpenChat(indent);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Card Top: Indent ID + Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-bold text-slate-900 font-mono text-base">
            {indent.docId || indent.id}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
              {cat}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {typeof indent.department === 'object' ? indent.department?.name : (indent.department || 'General')}
            </span>
          </div>
        </div>

        {/* Item Title */}
        <h5 className="font-bold text-slate-900 text-sm mb-3">
          {indent.item_name || indent.id}
        </h5>

        {/* Specifications Key-Value List */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
          {cat.toUpperCase().includes('YARN') && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">Count</span>
                <span className="font-medium text-slate-800">{indent.count || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Blend</span>
                <span className="font-medium text-slate-800">{indent.blend || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shade</span>
                <span className="font-medium text-slate-800">{indent.shade || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Qty (kg)</span>
                <span className="font-bold text-slate-900">{Number(indent.qty || 0).toLocaleString()}</span>
              </div>
            </>
          )}

          {cat.toUpperCase().includes('DYES') && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">CI / CAS</span>
                <span className="font-medium text-slate-800">{indent.ciCas || indent.code || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Strength</span>
                <span className="font-medium text-slate-800">{indent.strength || '150%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hazard</span>
                <span className="font-medium text-slate-800">{indent.hazard || 'Class 9'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Qty (kg)</span>
                <span className="font-bold text-slate-900">{Number(indent.qty || 0).toLocaleString()}</span>
              </div>
            </>
          )}

          {cat.toUpperCase().includes('SPARES') && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">Machine</span>
                <span className="font-medium text-slate-800">{indent.machine || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Part no</span>
                <span className="font-medium text-slate-800">{indent.partNo || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Make</span>
                <span className="font-medium text-slate-800">{indent.make || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Qty (nos)</span>
                <span className="font-bold text-slate-900">{Number(indent.qty || 0).toLocaleString()}</span>
              </div>
            </>
          )}

          {cat.toUpperCase().includes('FABRIC') && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">Construction</span>
                <span className="font-medium text-slate-800">{indent.construction || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GSM</span>
                <span className="font-medium text-slate-800">{indent.gsm || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Width</span>
                <span className="font-medium text-slate-800">{indent.width || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Qty</span>
                <span className="font-bold text-slate-900">
                  {Number(indent.qty || 0).toLocaleString()} {typeof indent.uom === 'object' ? indent.uom?.name : (indent.uom || '')}
                </span>
              </div>
            </>
          )}

          {!cat.toUpperCase().includes('YARN') && !cat.toUpperCase().includes('DYES') && !cat.toUpperCase().includes('SPARES') && !cat.toUpperCase().includes('FABRIC') && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">Specification</span>
                <span className="font-medium text-slate-800">{indent.spec || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UOM</span>
                <span className="font-medium text-slate-800">
                  {typeof indent.uom === 'object' ? indent.uom?.name : (indent.uom || '-')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Qty</span>
                <span className="font-bold text-slate-900">{Number(indent.qty || 0).toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Vendors Section with Document Indicator Dots */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Vendors for this indent
            </p>
            {pendingDocsCount > 0 && (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                {pendingDocsCount} doc{pendingDocsCount !== 1 ? 's' : ''} need update
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {vendorsList.map(vendor => {
              const vDocs = vendor.documents || [];
              const hasUpdateNeeded = vDocs.some(d => d.status === 'Update Needed');
              const isUpToDate = vDocs.length > 0 && vDocs.every(d => d.status === 'Up to Date');

              return (
                <button
                  type="button"
                  key={vendor.id}
                  onClick={() => handleOpenAction('docs')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-900 border border-slate-200 transition-colors cursor-pointer text-left"
                  title={`${vendor.label || vendor.name}: ${vDocs.length} doc(s) ${hasUpdateNeeded ? '(Update Needed)' : isUpToDate ? '(Up to date)' : ''}`}
                >
                  <span>{vendor.label || vendor.name}</span>
                  {vDocs.length > 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasUpdateNeeded ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer: Vendor count, Doc summary + Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            {vendorsList.length} vendors
          </span>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => handleOpenAction('docs')}
            className={`text-xs font-semibold flex items-center gap-1 hover:underline transition-colors ${
              pendingDocsCount > 0 ? 'text-amber-700' : 'text-teal-700'
            }`}
            title="View vendor documents"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{totalDocsCount} docs</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {onRemoveIndent && (
            <button
              type="button"
              onClick={() => onRemoveIndent(lotId, indent.id)}
              className="text-slate-400 hover:text-red-500 text-xs transition-colors mr-1"
              title="Remove Indent"
            >
              Remove
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenAction('docs')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-semibold text-xs flex items-center gap-1 transition-colors"
            title="Vendor Documents"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Docs</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAction('chat')}
            className="px-2.5 py-1.5 rounded-lg border border-teal-600/30 text-teal-700 hover:bg-teal-50 font-semibold text-xs flex items-center gap-1 transition-colors"
            title="Chat with vendors"
          >
            <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
