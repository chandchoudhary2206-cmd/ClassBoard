import React from "react";
import { FiInbox } from "react-icons/fi";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-gray-300 mb-4">
        {icon || <FiInbox className="w-16 h-16" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-500 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-6 text-center max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
