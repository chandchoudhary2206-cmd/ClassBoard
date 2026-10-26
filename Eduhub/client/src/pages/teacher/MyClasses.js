import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import SearchBar from "../../components/SearchBar";
import { FiBookOpen, FiUsers, FiClock, FiChevronRight } from "react-icons/fi";

export default function MyClasses() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const { data, loading, error } = useFetch("/classes?teacher=me");

  const classes = data?.classes || data?.data || [];

  const filtered = classes.filter((cls) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (cls.subject?.name || cls.subjectName || "").toLowerCase().includes(q) ||
      (cls.section?.name || cls.sectionName || cls.section || "").toLowerCase().includes(q) ||
      (cls.class?.name || cls.className || "").toLowerCase().includes(q)
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
          <p className="text-sm text-gray-500 mt-1">View all your assigned classes</p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search classes..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FiBookOpen className="w-16 h-16" />}
          title={search ? "No classes match your search" : "No classes assigned"}
          description={
            search
              ? "Try a different search term"
              : "You haven't been assigned to any classes yet"
          }
        />
      ) : selected ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            &larr; Back to all classes
          </button>
          <div className="rounded-xl bg-white shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selected.subject?.name || selected.subjectName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selected.class?.name || selected.className} - Section{" "}
                  {selected.section?.name || selected.sectionName || selected.section}
                </p>
              </div>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-700">
                {selected.studentCount || selected.students?.length || 0} Students
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Schedule
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {selected.schedule?.day || selected.day || "N/A"}:{" "}
                  {selected.schedule?.startTime || selected.startTime || "N/A"} -{" "}
                  {selected.schedule?.endTime || selected.endTime || "N/A"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Room
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {selected.room || selected.roomNumber || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls) => (
            <button
              key={cls._id}
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
                {cls.subject?.name || cls.subjectName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {cls.class?.name || cls.className} - Section{" "}
                {cls.section?.name || cls.sectionName || cls.section}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FiUsers className="w-3.5 h-3.5" />
                  {cls.studentCount || cls.students?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="w-3.5 h-3.5" />
                  {cls.schedule?.day || cls.day || "N/A"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
