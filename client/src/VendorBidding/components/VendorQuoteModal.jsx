import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useSubmitVendorQuoteMutation } from "../../redux/uniformService/BiddingService";

export default function VendorQuoteModal({ isOpen, onClose, item, vendorId }) {
  const [price, setPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitQuote, { isLoading }] = useSubmitVendorQuoteMutation();

  useEffect(() => {
    if (item) {
      setPrice(item.quotedPrice !== null && item.quotedPrice !== undefined ? String(item.quotedPrice) : "");
      setRemarks(item.quoteRemarks || "");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Price",
        text: "Please enter a valid price quote greater than 0.",
      });
      return;
    }

    try {
      const res = await submitQuote({
        biddingIndentId: item.biddingIndentId,
        vendorId,
        price: numPrice,
        remarks,
      }).unwrap();

      if (res?.statusCode === 0) {
        Swal.fire({
          icon: "success",
          title: "Quote Submitted!",
          text: `Your price quote of ₹ ${numPrice} / ${item.uom} has been recorded.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Submit",
          text: res?.message || "Could not record quote.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Error",
        text: err?.data?.message || err?.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">
              Submit Price Quote
            </span>
            <h3 className="text-base font-bold text-white truncate max-w-xs">
              {item.itemName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Item Context Summary */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 grid grid-cols-2 gap-2 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
              <span className="font-bold text-slate-800">{item.category}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Requested Qty</span>
              <span className="font-bold text-slate-900">
                {Number(item.qty).toLocaleString()} {item.uom}
              </span>
            </div>
            {item.specs?.count && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Count</span>
                <span className="font-medium text-slate-800">{item.specs.count}</span>
              </div>
            )}
            {item.specs?.blend && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blend</span>
                <span className="font-medium text-slate-800">{item.specs.blend}</span>
              </div>
            )}
          </div>

          {/* Primary Input: Unit Price */}
          <div>
            <label className="block font-bold text-slate-800 text-xs mb-1.5">
              Quoted Price / Rate per {item.uom} (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 240.50"
                className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                autoFocus
              />
            </div>
          </div>

          {/* Optional Remarks */}
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Remarks / Delivery Timeline (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Delivery in 7 days, staggered batches acceptable..."
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estimated Total Calculation */}
          {parseFloat(price) > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Quoted Value</span>
                <span className="text-[11px] text-emerald-700">
                  {Number(item.qty).toLocaleString()} {item.uom} × ₹ {price}
                </span>
              </div>
              <span className="text-base font-extrabold text-emerald-900">
                ₹ {(parseFloat(price) * parseFloat(item.qty || 0)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : item.quotedPrice ? "Update Quote" : "Confirm & Submit Quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
