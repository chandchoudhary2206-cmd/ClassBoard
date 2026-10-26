import React from "react";
import useFetch from "../../hooks/useFetch";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  FiUsers,
  FiBookOpen,
  FiGrid,
  FiLayers,
  FiCalendar,
  FiAlertCircle,
  FiPlus,
  FiUserPlus,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const quickActions = [
  { label: "Add Teacher", icon: <FiUserPlus className="w-5 h-5" />, to: "/admin/manage-teachers" },
  { label: "Add Student", icon: <FiPlus className="w-5 h-5" />, to: "/admin/manage-students" },
  { label: "Create Class", icon: <FiCalendar className="w-5 h-5" />, to: "/admin/manage-classes" },
  { label: "New Announcement", icon: <FiFileText className="w-5 h-5" />, to: "/admin/announcements" },
];

const cardColors = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-teal-600",
];

export default function Dashboard() {
  const { data, loading, error } = useFetch("/dashboard/admin");

  if (loading) return <LoadingSpinner size="lg" message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load dashboard: {error}
      </div>
    );
  }

  const counts = data?.counts || data?.data?.counts || {};
  const recentStudents = data?.recent?.students || [];

  const statItems = [
    { title: "Total Students", value: counts.totalStudents ?? 0, icon: <FiUsers className="w-6 h-6" /> },
    { title: "Total Teachers", value: counts.totalTeachers ?? 0, icon: <FiBookOpen className="w-6 h-6" /> },
    { title: "Departments", value: counts.totalDepartments ?? 0, icon: <FiGrid className="w-6 h-6" /> },
    { title: "Courses", value: counts.totalCourses ?? 0, icon: <FiLayers className="w-6 h-6" /> },
    { title: "Active Classes", value: counts.activeClasses ?? 0, icon: <FiCalendar className="w-6 h-6" /> },
    { title: "Total Classes", value: counts.totalClasses ?? 0, icon: <FiAlertCircle className="w-6 h-6" /> },
  ];

  const activities = recentStudents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of the institution</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No recent activities</p>
          ) : (
            <div className="space-y-3">
              {activities.map((act, i) => (
                  <div key={act._id || i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                    <FiClock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">New student enrolled: {act.user?.name || act.name || "N/A"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.createdAt ? new Date(act.createdAt).toLocaleString() : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
