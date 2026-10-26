import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { FiBookOpen, FiDownload, FiFilter } from "react-icons/fi";

export default function StudyMaterials() {
  const [subjectFilter, setSubjectFilter] = useState("");

  const { data, loading, error } = useFetch("/study-materials");

  const materials = data?.materials || data?.data || [];

  const subjects = [...new Set(materials.map((m) => m.subject?.name || m.subjectName).filter(Boolean))];

  const filtered = subjectFilter
    ? materials.filter((m) => (m.subject?.name || m.subjectName) === subjectFilter)
    : materials;

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "subject",
      label: "Subject",
      render: (val, row) => val?.name || row.subjectName || "N/A",
    },
    {
      key: "teacher",
      label: "Teacher",
      render: (val, row) => val?.name || row.teacherName || "N/A",
    },
    {
      key: "createdAt",
      label: "Uploaded Date",
      render: (val) => (val ? new Date(val).toLocaleDateString() : ""),
    },
    {
      key: "fileType",
      label: "File Type",
      render: (val, row) => {
        const type = val || row.file?.split(".").pop() || "";
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 uppercase">
            {type}
          </span>
        );
      },
    },
    {
      key: "file",
      label: "Download",
      render: (val) =>
        val ? (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <FiDownload className="w-3.5 h-3.5" /> Download
          </a>
        ) : (
          <span className="text-xs text-gray-400">No file</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Materials</h1>
          <p className="text-sm text-gray-500 mt-1">View and download study materials</p>
        </div>
        {subjects.length > 0 && (
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-gray-400" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading study materials..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiBookOpen className="w-16 h-16" />}
          title={subjectFilter ? "No materials for this subject" : "No study materials available"}
          description="Study materials will appear here when uploaded by your teachers"
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
    </div>
  );
}
