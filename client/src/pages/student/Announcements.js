import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { FiMessageSquare, FiBell, FiCalendar, FiChevronDown, FiChevronUp } from "react-icons/fi";

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "general", label: "General" },
  { value: "class", label: "Class" },
  { value: "important", label: "Important" },
];

export default function Announcements() {
  const [typeFilter, setTypeFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const { data, loading, error } = useFetch("/announcements");

  const announcements = data?.announcements || data?.data || [];

  const sorted = [...announcements].sort(
    (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  );

  const filtered = typeFilter
    ? sorted.filter((a) => (a.type || "general") === typeFilter)
    : sorted;

  const getTypeIcon = (type) => {
    switch (type) {
      case "important":
        return <FiBell className="w-4 h-4" />;
      case "class":
        return <FiCalendar className="w-4 h-4" />;
      default:
        return <FiMessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "important":
        return "bg-red-100 text-red-700";
      case "class":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with the latest announcements</p>
        </div>
        <div className="flex items-center gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === opt.value
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading announcements..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiMessageSquare className="w-16 h-16" />}
          title={typeFilter ? "No announcements of this type" : "No announcements"}
          description="Check back later for new announcements"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => {
            const isExpanded = expandedId === ann._id;
            return (
              <div key={ann._id} className="rounded-xl bg-white shadow-sm p-6">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ann._id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg mt-0.5 ${getTypeColor(ann.type)}`}>
                        {getTypeIcon(ann.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-gray-800">{ann.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(ann.type)}`}>
                            {ann.type || "general"}
                          </span>
                          {ann.targetClass && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                              {ann.targetClass?.name || ann.targetClassName}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm text-gray-600 mt-2 ${isExpanded ? "" : "line-clamp-2"}`}>
                          {ann.content}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                          <span>By {ann.author?.name || "Admin"}</span>
                          <span>{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : ""}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-400 shrink-0 mt-1">
                      {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
