import React from "react";
import useFetch from "../../hooks/useFetch";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  FiBookOpen,
  FiUsers,
  FiClipboard,
  FiCheckSquare,
  FiClock,
  FiFileText,
} from "react-icons/fi";

const cardColors = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-amber-600",
];

export default function Dashboard() {
  const { data, loading, error } = useFetch("/dashboard/teacher");

  if (loading) return <LoadingSpinner size="lg" message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load dashboard: {error}
      </div>
    );
  }

  const counts = data?.counts || {};
  const schedule = data?.todaysSchedule || [];
  const pendingGrading = data?.assignments?.recent || [];

  const statItems = [
    { title: "My Classes", value: counts.assignedClasses ?? 0, icon: <FiBookOpen className="w-6 h-6" /> },
    { title: "Total Students", value: counts.totalStudents ?? 0, icon: <FiUsers className="w-6 h-6" /> },
    { title: "Active Assignments", value: (data?.assignments?.recent || []).length, icon: <FiClipboard className="w-6 h-6" /> },
    { title: "Pending Reviews", value: (data?.assignments?.upcoming || []).length, icon: <FiCheckSquare className="w-6 h-6" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to your classes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, idx) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={cardColors[idx % cardColors.length]}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Today's Schedule
          </h2>
          {schedule.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No classes scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {schedule.map((item, i) => (
                <div
                  key={item._id || i}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 text-primary-600 text-sm font-bold">
                    {item.startTime || item.time || "--"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {item.subject?.name || item.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.class?.name || item.className} - Section {item.section || item.sectionName}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {item.endTime || item.duration}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Assignments Needing Grading
          </h2>
          {pendingGrading.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              All caught up! No pending assignments to grade
            </p>
          ) : (
            <div className="space-y-3">
              {pendingGrading.map((item, i) => (
                <div
                  key={item._id || i}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                >
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <FiFileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.subject?.name || ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                    <FiClock className="w-3 h-3" />
                    <span>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
