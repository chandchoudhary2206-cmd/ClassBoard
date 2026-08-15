import React from "react";
import useFetch from "../../hooks/useFetch";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FiBookOpen, FiClipboard, FiCheckCircle, FiAward, FiClock, FiBell } from "react-icons/fi";

const cardColors = ["bg-blue-600", "bg-emerald-600", "bg-purple-600", "bg-amber-600"];

export default function Dashboard() {
  const { data, loading, error } = useFetch("/dashboard/student");

  if (loading) return <LoadingSpinner size="lg" message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load dashboard: {error}
      </div>
    );
  }

  const dashboard = data || {};
  const timetable = dashboard.todaysTimetable || [];
  const assignments = dashboard.upcomingAssignments || [];
  const announcements = [];

  const att = dashboard.attendanceSummary || {};
  const attPct = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;

  const statItems = [
    { title: "Enrolled Classes", value: dashboard.enrolledClasses ?? 0, icon: <FiBookOpen className="w-6 h-6" /> },
    { title: "Pending Assignments", value: assignments.length, icon: <FiClipboard className="w-6 h-6" /> },
    { title: "Attendance %", value: attPct + "%", icon: <FiCheckCircle className="w-6 h-6" /> },
    { title: "Recent Grades", value: (dashboard.recentGrades || []).length, icon: <FiAward className="w-6 h-6" /> },
  ];

  const getCountdown = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    if (diff <= 0) return "Overdue";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to your learning</p>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Schedule</h2>
          {timetable.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No classes scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {timetable.map((item, i) => (
                <div key={item._id || i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 text-primary-600 text-sm font-bold">
                    {item.startTime || item.time || "--"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{item.subject?.name || item.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.teacher?.name || item.teacherName} &middot; Room {item.room || item.roomNumber}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{item.endTime || item.duration}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h2>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No upcoming assignments</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((item, i) => (
                <div key={item._id || i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <FiClock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.subject || ""}</p>
                  </div>
                  <span className={`text-xs font-medium shrink-0 ${new Date(item.dueDate) < new Date() ? "text-red-600" : "text-amber-600"}`}>
                    {getCountdown(item.dueDate)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No recent announcements</p>
        ) : (
          <div className="space-y-4">
            {announcements.slice(0, 5).map((ann, i) => (
              <div key={ann._id || i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                  <FiBell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{ann.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {ann.author?.name || "Admin"} &middot; {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
