import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiCalendar,
  FiFileText,
  FiSettings,
  FiBarChart2,
  FiMessageSquare,
  FiClipboard,
} from "react-icons/fi";

const roleNavItems = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiHome },
    { label: "Teachers", path: "/admin/manage-teachers", icon: FiUsers },
    { label: "Students", path: "/admin/manage-students", icon: FiUsers },
    { label: "Departments", path: "/admin/manage-departments", icon: FiBook },
    { label: "Courses", path: "/admin/manage-courses", icon: FiBook },
    { label: "Subjects", path: "/admin/manage-subjects", icon: FiBook },
    { label: "Academic Years", path: "/admin/manage-academic-years", icon: FiCalendar },
    { label: "Semesters", path: "/admin/manage-semesters", icon: FiCalendar },
    { label: "Sections", path: "/admin/manage-sections", icon: FiCalendar },
    { label: "Classes", path: "/admin/manage-classes", icon: FiCalendar },
    { label: "Timetable", path: "/admin/timetable", icon: FiCalendar },
    { label: "Announcements", path: "/admin/announcements", icon: FiFileText },
    { label: "Reports", path: "/admin/reports", icon: FiBarChart2 },
    { label: "Settings", path: "/admin/settings", icon: FiSettings },
  ],
  teacher: [
    { label: "Dashboard", path: "/teacher/dashboard", icon: FiHome },
    { label: "My Classes", path: "/teacher/my-classes", icon: FiBook },
    { label: "Study Materials", path: "/teacher/study-materials", icon: FiFileText },
    { label: "Assignments", path: "/teacher/assignments", icon: FiClipboard },
    { label: "Submissions", path: "/teacher/submissions", icon: FiFileText },
    { label: "Attendance", path: "/teacher/attendance", icon: FiUsers },
    { label: "Announcements", path: "/teacher/announcements", icon: FiMessageSquare },
    { label: "Calendar", path: "/teacher/calendar", icon: FiCalendar },
  ],
  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: FiHome },
    { label: "My Classes", path: "/student/my-classes", icon: FiBook },
    { label: "Study Materials", path: "/student/study-materials", icon: FiFileText },
    { label: "Assignments", path: "/student/assignments", icon: FiClipboard },
    { label: "Attendance", path: "/student/attendance", icon: FiUsers },
    { label: "Timetable", path: "/student/timetable", icon: FiCalendar },
    { label: "Announcements", path: "/student/announcements", icon: FiMessageSquare },
    { label: "Grades", path: "/student/grades", icon: FiBarChart2 },
    { label: "Profile", path: "/student/profile", icon: FiSettings },
  ],
};

export default function Sidebar({ items, role = "admin", isOpen, onClose }) {
  const navItems = items || roleNavItems[role] || [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
            CB
          </div>
          <span className="text-lg font-bold text-gray-800">ClassBoard</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
