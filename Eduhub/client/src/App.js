import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";

import AdminDashboard from "./pages/admin/Dashboard";
import ManageTeachers from "./pages/admin/ManageTeachers";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageDepartments from "./pages/admin/ManageDepartments";
import ManageCourses from "./pages/admin/ManageCourses";
import ManageSubjects from "./pages/admin/ManageSubjects";
import ManageAcademicYears from "./pages/admin/ManageAcademicYears";
import ManageSemesters from "./pages/admin/ManageSemesters";
import ManageSections from "./pages/admin/ManageSections";
import ManageClasses from "./pages/admin/ManageClasses";
import Timetable from "./pages/admin/Timetable";
import Announcements from "./pages/admin/Announcements";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

import TeacherDashboard from "./pages/teacher/Dashboard";
import MyClassesTeacher from "./pages/teacher/MyClasses";
import StudyMaterialsTeacher from "./pages/teacher/StudyMaterials";
import AssignmentsTeacher from "./pages/teacher/Assignments";
import Submissions from "./pages/teacher/Submissions";
import AttendanceTeacher from "./pages/teacher/Attendance";
import AnnouncementsTeacher from "./pages/teacher/Announcements";
import Calendar from "./pages/teacher/Calendar";

import StudentDashboard from "./pages/student/Dashboard";
import MyClassesStudent from "./pages/student/MyClasses";
import StudyMaterialsStudent from "./pages/student/StudyMaterials";
import AssignmentsStudent from "./pages/student/Assignments";
import AttendanceStudent from "./pages/student/Attendance";
import TimetableStudent from "./pages/student/Timetable";
import AnnouncementsStudent from "./pages/student/Announcements";
import Grades from "./pages/student/Grades";
import Profile from "./pages/student/Profile";

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
    if (user.role === "teacher") return <Navigate to="/teacher/dashboard" />;
    if (user.role === "student") return <Navigate to="/student/dashboard" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/admin" element={<PrivateRoute roles={["admin"]}><AdminLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="manage-teachers" element={<ManageTeachers />} />
        <Route path="manage-students" element={<ManageStudents />} />
        <Route path="manage-departments" element={<ManageDepartments />} />
        <Route path="manage-courses" element={<ManageCourses />} />
        <Route path="manage-subjects" element={<ManageSubjects />} />
        <Route path="manage-academic-years" element={<ManageAcademicYears />} />
        <Route path="manage-semesters" element={<ManageSemesters />} />
        <Route path="manage-sections" element={<ManageSections />} />
        <Route path="manage-classes" element={<ManageClasses />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/teacher" element={<PrivateRoute roles={["teacher"]}><TeacherLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="my-classes" element={<MyClassesTeacher />} />
        <Route path="study-materials" element={<StudyMaterialsTeacher />} />
        <Route path="assignments" element={<AssignmentsTeacher />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="attendance" element={<AttendanceTeacher />} />
        <Route path="announcements" element={<AnnouncementsTeacher />} />
        <Route path="calendar" element={<Calendar />} />
      </Route>

      <Route path="/student" element={<PrivateRoute roles={["student"]}><StudentLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="my-classes" element={<MyClassesStudent />} />
        <Route path="study-materials" element={<StudyMaterialsStudent />} />
        <Route path="assignments" element={<AssignmentsStudent />} />
        <Route path="attendance" element={<AttendanceStudent />} />
        <Route path="timetable" element={<TimetableStudent />} />
        <Route path="announcements" element={<AnnouncementsStudent />} />
        <Route path="grades" element={<Grades />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
