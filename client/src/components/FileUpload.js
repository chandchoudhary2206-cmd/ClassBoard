import React, { useState, useRef } from "react";
import { FiUploadCloud, FiFile, FiX } from "react-icons/fi";

export default function FileUpload({ onFileSelect, accept, maxSize, label = "Upload file" }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const validate = (f) => {
    if (!f) return "No file selected";
    if (maxSize && f.size > maxSize) {
      const mb = (maxSize / (1024 * 1024)).toFixed(1);
      return `File exceeds ${mb} MB limit`;
    }
    if (accept) {
      const allowed = accept.split(",").map((t) => t.trim().toLowerCase());
      const ext = "." + f.name.split(".").pop().toLowerCase();
      const mime = f.type.toLowerCase();
      const ok = allowed.some((a) => a === mime || a === ext || a.endsWith("/*") && mime.startsWith(a.replace("/*", "")));
      if (!ok) return `Accepted formats: ${accept}`;
    }
    return "";
  };

  const handleFile = (f) => {
    setError("");
    const err = validate(f);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setFile(f);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      if (onFileSelect) onFileSelect(f);
    }, 600);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e) => {
    const f = e.target.files[0];
    if (f) handleFile(f);
  };

  const handleRemove = () => {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    if (onFileSelect) onFileSelect(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            dragging
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/30"
          }`}
        >
          <FiUploadCloud className="w-10 h-10 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-xs text-gray-400">
            Drag & drop or click to browse
            {maxSize && ` (max ${formatSize(maxSize)})`}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <FiFile className="w-8 h-8 text-primary-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
            {uploading && (
              <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full animate-pulse w-2/3" />
              </div>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
