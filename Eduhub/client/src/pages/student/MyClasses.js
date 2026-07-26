import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import SearchBar from "../../components/SearchBar";
import { FiBookOpen, FiUsers, FiClock, FiChevronRight, FiFileText, FiClipboard } from "react-icons/fi";

export default function MyClasses() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const { data, loading, error } = useFetch("/enrollments/my");

  const enrollments = data?.enrollments || data?.data || [];

  const filtered = enrollments.filter((enr) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const cls = enr.classDetails || enr.class || enr;
    return (
      (cls.subject?.name || cls.subjectName || "").toLowerCase().includes(q) ||
      (cls.name || cls.className || "").toLowerCase().includes(q) ||
      (cls.teacher?.name || cls.teacherName || "").toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingSpinner size="lg" message="Loading your classes..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load classes: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
          <p className="text-sm text-gray-500 mt-1">View all your enrolled classes</p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search classes..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FiBookOpen className="w-16 h-16" />}
          title={search ? "No classes match your search" : "No classes enrolled"}
          description={search ? "Try a different search term" : "You are not enrolled in any classes yet"}
        />
      ) : selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            &larr; Back to all classes
          </button>
          <div className="rounded-xl bg-white shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selected.subject?.name || selected.subjectName || selected.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selected.teacher?.name || selected.teacherName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Room {selected.room || selected.roomNumber || "N/A"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Schedule</p>
                <p className="text-sm text-gray-700 mt-1">
                  {selected.schedule?.day || selected.day || "N/A"}: {selected.schedule?.startTime || selected.startTime || "N/A"} - {selected.schedule?.endTime || selected.endTime || "N/A"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Room</p>
                <p className="text-sm text-gray-700 mt-1">{selected.room || selected.roomNumber || "N/A"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700">
                <FiFileText className="w-4 h-4" />
                <span className="text-sm font-medium">{selected.materialsCount ?? 0} Materials</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700">
                <FiClipboard className="w-4 h-4" />
                <span className="text-sm font-medium">{selected.assignmentsCount ?? 0} Assignments</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((enr) => {
            const cls = enr.classDetails || enr.class || enr;
            return (
              <button
                key={enr._id}
                onClick={() => setSelected(cls)}
                className="text-left rounded-xl bg-white shadow-sm p-6 hover:shadow-md hover:border-primary-200 border border-transparent transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                    <FiBookOpen className="w-5 h-5" />
                  </div>
                  <FiChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mt-4">
                  {cls.subject?.name || cls.subjectName || cls.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {cls.teacher?.name || cls.teacherName || "N/A"}
                </p>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5" />
                    {cls.schedule?.day || cls.day || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiUsers className="w-3.5 h-3.5" />
                    {cls.room || cls.roomNumber || "N/A"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
