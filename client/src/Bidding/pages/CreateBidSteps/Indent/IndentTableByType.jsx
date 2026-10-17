import React from 'react';

export default function IndentTableByType({ indents = [], lotId, onOpenChat, onRemoveIndent, onOpenDrawer }) {
  const grouped = indents.reduce((acc, indent) => {
    const type = indent.category || indent.indentType || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(indent);
    return acc;
  }, {});

  const handleOpenAction = (indent, tab) => {
    if (onOpenDrawer) {
      onOpenDrawer(indent, tab);
    } else if (onOpenChat) {
      onOpenChat(indent);
    }
  };

  if (indents.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No indents found for this filter.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, group]) => (
        <div key={type} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-600"></div>
              <span className="font-bold text-xs text-slate-800">{type} Indents ({group.length})</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 font-semibold">Indent</th>
                  <th className="px-4 py-2 font-semibold">Department</th>
                  <th className="px-4 py-2 font-semibold">Item</th>

                  {type.includes("Yarn") && (
                    <>
                      <th className="px-4 py-2 font-semibold">Count</th>
                      <th className="px-4 py-2 font-semibold">Blend</th>
                      <th className="px-4 py-2 font-semibold">Ply</th>
                      <th className="px-4 py-2 font-semibold">Shade</th>
                      <th className="px-4 py-2 font-semibold text-right">Qty (kg)</th>
                    </>
                  )}

                  {type.includes("Fabric") && (
                    <>
                      <th className="px-4 py-2 font-semibold">Construction</th>
                      <th className="px-4 py-2 font-semibold">GSM</th>
                      <th className="px-4 py-2 font-semibold">Width</th>
                      <th className="px-4 py-2 font-semibold text-right">Qty</th>
                    </>
                  )}

                  {type.includes("Spares") && (
                    <>
                      <th className="px-4 py-2 font-semibold">Machine</th>
                      <th className="px-4 py-2 font-semibold">Part No</th>
                      <th className="px-4 py-2 font-semibold">Make</th>
                      <th className="px-4 py-2 font-semibold text-right">Qty</th>
                    </>
                  )}

                  {type.includes("Dyes") && (
                    <>
                      <th className="px-4 py-2 font-semibold">CI / CAS</th>
                      <th className="px-4 py-2 font-semibold">Strength</th>
                      <th className="px-4 py-2 font-semibold">Hazard</th>
                      <th className="px-4 py-2 font-semibold text-right">Qty (kg)</th>
                    </>
                  )}

                  {!type.includes("Yarn") && !type.includes("Fabric") && !type.includes("Spares") && !type.includes("Dyes") && (
                    <>
                      <th className="px-4 py-2 font-semibold">Specification</th>
                      <th className="px-4 py-2 font-semibold">UOM</th>
                      <th className="px-4 py-2 font-semibold text-right">Qty</th>
                    </>
                  )}

                  <th className="px-4 py-2 font-semibold">Vendors & Docs</th>
                  <th className="px-4 py-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {group.map(indent => {
                  const deptName = typeof indent.department === 'object' ? indent.department?.name : (indent.department || '-');
                  const uomName = typeof indent.uom === 'object' ? indent.uom?.name : (indent.uom || '');
                  const vendorsList = indent.vendors || [];
                  const commonDocs = indent.commonDocuments || [];

                  const totalDocsCount = vendorsList.reduce(
                    (sum, v) => sum + (v.documents ? v.documents.length : 0),
                    0
                  ) + commonDocs.length;

                  const hasPendingDoc = vendorsList.some(v =>
                    (v.documents || []).some(d => d.status === 'Update Needed')
                  );

                  return (
                    <tr key={indent.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2.5 font-bold font-mono text-slate-900">{indent.docId || indent.id}</td>
                      <td className="px-4 py-2.5 text-slate-600">{deptName}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{indent.item_name || indent.id}</td>

                      {type.includes("Yarn") && (
                        <>
                          <td className="px-4 py-2.5 text-slate-600">{indent.count || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{indent.blend || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{indent.ply || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{indent.shade || '-'}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">{Number(indent.qty || 0).toLocaleString()}</td>
                        </>
                      )}

                      {type.includes("Fabric") && (
                        <>
                          <td className="px-4 py-2.5 text-slate-600">{indent.construction || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{indent.gsm || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{indent.width || '-'}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">{Number(indent.qty || 0).toLocaleString()} {uomName}</td>
                        </>
                      )}

                      {type.includes("Spares") && (
                        <>
                          <td className="px-4 py-2.5 text-slate-600">{indent.machine || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{indent.partNo || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{indent.make || '-'}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">{Number(indent.qty || 0).toLocaleString()}</td>
                        </>
                      )}

                      {type.includes("Dyes") && (
                        <>
                          <td className="px-4 py-2.5 text-slate-600">{indent.ciCas || indent.code || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{indent.strength || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{indent.hazard || '-'}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">{Number(indent.qty || 0).toLocaleString()}</td>
                        </>
                      )}

                      {!type.includes("Yarn") && !type.includes("Fabric") && !type.includes("Spares") && !type.includes("Dyes") && (
                        <>
                          <td className="px-4 py-2.5 text-slate-600">{indent.spec || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{uomName || '-'}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">{Number(indent.qty || 0).toLocaleString()}</td>
                        </>
                      )}

                      <td className="px-4 py-2.5 text-slate-600">
                        <div className="flex flex-wrap items-center gap-1">
                          {vendorsList.map(v => {
                            const vDocs = v.documents || [];
                            const needsUpdate = vDocs.some(d => d.status === 'Update Needed');

                            return (
                              <span
                                key={v.id}
                                onClick={() => handleOpenAction(indent, 'docs')}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 cursor-pointer border border-slate-200 transition-colors"
                                title={`${v.label || v.name}: ${vDocs.length} docs`}
                              >
                                <span>{v.label || v.name}</span>
                                {vDocs.length > 0 && (
                                  <span className={`w-1.5 h-1.5 rounded-full ${needsUpdate ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                )}
                              </span>
                            );
                          })}
                          {vendorsList.length === 0 && <span className="text-slate-400">-</span>}
                        </div>
                      </td>

                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(indent, 'docs')}
                          className={`px-2 py-1 text-xs font-semibold rounded-md border transition-colors mr-1.5 ${
                            hasPendingDoc
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="View vendor documents"
                        >
                          Docs ({totalDocsCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAction(indent, 'chat')}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors mr-2"
                        >
                          Chat
                        </button>
                        {onRemoveIndent && (
                          <button
                            type="button"
                            onClick={() => onRemoveIndent(lotId, indent.id)}
                            className="text-slate-400 hover:text-red-500 text-xs transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
