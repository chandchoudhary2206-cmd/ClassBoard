import React from "react";

const sizeMap = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export default function LoadingSpinner({ size = "md", message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div
        className={`${sizeMap[size] || sizeMap.md} animate-spin rounded-full border-2 border-primary-200 border-t-primary-600`}
      />
      {message && (
        <p className="mt-3 text-sm text-gray-500">{message}</p>
      )}
    </div>
  );
}
