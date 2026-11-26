import React, { useState } from "react";
import Swal from "sweetalert2";
import { useUploadVendorDocumentMutation } from "../../redux/uniformService/BiddingService";
import { getImageUrlPath } from "../../Constants";

export default function VendorUploadDocModal({ isOpen, onClose, item, vendorId }) {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDocument, { isLoading }] = useUploadVendorDocumentMutation();

  if (!isOpen || !item) return null;

  const uploads = item.vendorUploads || [];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!title) {
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select a file to upload.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("files", selectedFile);
      formData.append("title", title || selectedFile.name);
      if (vendorId) formData.append("vendorId", vendorId);

      const res = await uploadDocument({
        biddingIndentId: item.biddingIndentId,
        formData,
      }).unwrap();

      if (res?.statusCode === 0) {
        Swal.fire({
          icon: "success",
          title: "Document Uploaded!",
          text: "Document attached successfully to this indent item.",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
        setSelectedFile(null);
        setTitle("");
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: res?.message || "Could not upload document.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: err?.data?.message || err?.message || "Failed to upload document.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
              Technical & Compliance Documents
            </span>
            <h3 className="text-sm font-bold text-white truncate max-w-sm">
              {item.itemName} ({item.category})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Upload Form Section */}
          <form onSubmit={handleUpload} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs">Upload New Document / Test Certificate</h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Document Title / Label
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mill Quality Test Report v1.0"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Select File (PDF / Image) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoading ? "Uploading..." : "Upload & Save Document"}
              </button>
            </div>
          </form>

          {/* List of Already Uploaded Documents */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2">
              My Uploaded Documents ({uploads.filter((u) => u.fileName).length})
            </h4>

            {uploads.filter((u) => u.fileName).length === 0 ? (
              <p className="text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No documents uploaded for this item yet.
              </p>
            ) : (
              <div className="space-y-2">
                {uploads
                  .filter((u) => u.fileName)
                  .map((doc, idx) => {
                    const fileUrl = getImageUrlPath(doc.filePath || doc.fileName);
                    return (
                      <div
                        key={doc.id || idx}
                        className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            📄
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-slate-800 truncate text-xs">
                              {doc.name || doc.fileName}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              Uploaded {doc.date ? new Date(doc.date).toLocaleDateString("en-GB") : "Recently"}
                            </span>
                          </div>
                        </div>

                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold rounded-lg text-[11px] transition-colors border border-slate-200"
                          >
                            View / Download
                          </a>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
