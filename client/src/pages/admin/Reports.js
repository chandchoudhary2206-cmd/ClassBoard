import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/LoadingSpinner";
import DataTable from "../../components/DataTable";
import { FiDownload } from "react-icons/fi";

const TABS = [
  { key: "attendance", label: "Attendance" },
  { key: "grades", label: "Grades" },
  { key: "class", label: "Class" },
  { key: "student", label: "Student" },
  { key: "teacher", label: "Teacher" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendanceParams, setAttendanceParams] = useState({ classId: "", startDate: "", endDate: "" });
  const [gradeParams, setGradeParams] = useState({ classId: "" });
  const [classParams, setClassParams] = useState({ classId: "" });
  const [studentSearch, setStudentSearch] = useState("");

  const { data: classData } = useFetch("/classes", { all: true });
  const { data: studentData } = useFetch("/students", { all: true, search: studentSearch || undefined }, { enabled: activeTab === "student" && !!studentSearch });

  const { data: attendanceData, loading: attLoading } = useFetch(
    "/reports/attendance",
    attendanceParams,
    { enabled: activeTab === "attendance" && !!attendanceParams.classId }
  );
  const { data: gradeReportData, loading: gradeLoading } = useFetch(
    "/reports/grades",
    gradeParams,
    { enabled: activeTab === "grades" && !!gradeParams.classId }
  );
  const { data: classReportData, loading: classLoading } = useFetch(
    "/reports/class",
    classParams,
    { enabled: activeTab === "class" && !!classParams.classId }
  );
  const { data: studentReportData, loading: studentLoading } = useFetch(
    studentSearch ? `/reports/student/${studentSearch}` : null,
    {},
    { enabled: activeTab === "student" && !!studentSearch }
  );
  const { data: teacherReportData, loading: teacherLoading } = useFetch("/reports/teachers", {}, { enabled: activeTab === "teacher" });

  const classes = classData?.classes || classData?.data || [];
  const students = studentData?.students || studentData?.data || [];

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";

  const handleExport = () => {
    alert("Export functionality coming soon");
  };

  const renderAttendanceTab = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select value={attendanceParams.classId} onChange={(e) => setAttendanceParams((p) => ({ ...p, classId: e.target.value }))} className={inputClass}>
            <option value="">Select class</option>
            {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input type="date" value={attendanceParams.startDate} onChange={(e) => setAttendanceParams((p) => ({ ...p, startDate: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input type="date" value={attendanceParams.endDate} onChange={(e) => setAttendanceParams((p) => ({ ...p, endDate: e.target.value }))} className={inputClass} />
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
          <FiDownload className="w-4 h-4" /> Export
        </button>
      </div>

      {attLoading ? (
        <LoadingSpinner message="Loading attendance report..." />
      ) : attendanceParams.classId ? (
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <DataTable
            columns={[
              { key: "student", label: "Student", render: (val) => val?.name || val || "-" },
              { key: "present", label: "Present", render: (val) => val ?? 0 },
              { key: "absent", label: "Absent", render: (val) => val ?? 0 },
              { key: "percentage", label: "Percentage", render: (val) => val != null ? `${val}%` : "-" },
            ]}
            data={attendanceData?.data || attendanceData?.records || []}
          />
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm p-12 text-center text-gray-400 text-sm">Select a class to view attendance report</div>
      )}
    </div>
  );

  const renderGradesTab = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select value={gradeParams.classId} onChange={(e) => setGradeParams((p) => ({ ...p, classId: e.target.value }))} className={inputClass}>
            <option value="">Select class</option>
            {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </select>
        </div>
      </div>

      {gradeLoading ? (
        <LoadingSpinner message="Loading grade report..." />
      ) : gradeParams.classId ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {(gradeReportData?.distribution || gradeReportData?.data?.distribution || []).map((item, i) => (
            <div key={i} className="rounded-xl bg-white shadow-sm p-5 text-center">
              <p className="text-2xl font-bold text-gray-800">{item.count || 0}</p>
              <p className="text-sm text-gray-500 mt-1">{item.grade || item.range}</p>
            </div>
          ))}
          {(!gradeReportData?.distribution && !gradeReportData?.data?.distribution) && (
            <div className="col-span-full rounded-xl bg-white shadow-sm p-12 text-center text-gray-400 text-sm">
              No grade data available
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm p-12 text-center text-gray-400 text-sm">Select a class to view grade report</div>
      )}
    </div>
  );

  const renderClassTab = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select value={classParams.classId} onChange={(e) => setClassParams((p) => ({ ...p, classId: e.target.value }))} className={inputClass}>
            <option value="">Select class</option>
            {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </select>
        </div>
      </div>

      {classLoading ? (
        <LoadingSpinner message="Loading class report..." />
      ) : classParams.classId ? (
        <div className="rounded-xl bg-white shadow-sm p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Students", value: classReportData?.totalStudents || classReportData?.data?.totalStudents || 0 },
              { label: "Avg Attendance", value: classReportData?.avgAttendance || classReportData?.data?.avgAttendance || "0%" },
              { label: "Avg Grade", value: classReportData?.avgGrade || classReportData?.data?.avgGrade || "-" },
              { label: "Classes Held", value: classReportData?.classesHeld || classReportData?.data?.classesHeld || 0 },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm p-12 text-center text-gray-400 text-sm">Select a class to view class report</div>
      )}
    </div>
  );

  const renderStudentTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
        <input
          type="text"
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className={inputClass + " max-w-md"}
          placeholder="Search by name or email..."
        />
      </div>

      {studentLoading ? (
        <LoadingSpinner message="Loading student report..." />
      ) : studentReportData ? (
        <div className="rounded-xl bg-white shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Attendance", value: studentReportData?.attendance || studentReportData?.data?.attendance || "N/A" },
              { label: "Avg Grade", value: studentReportData?.avgGrade || studentReportData?.data?.avgGrade || "N/A" },
              { label: "Courses", value: studentReportData?.courseCount || studentReportData?.data?.courseCount || 0 },
              { label: "Status", value: studentReportData?.status || studentReportData?.data?.status || "Active" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : studentSearch ? (
        <div className="rounded-xl bg-white shadow-sm p-12 text-center text-gray-400 text-sm">No student found with that name</div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm p-12 text-center text-gray-400 text-sm">Search for a student to view their report</div>
      )}
    </div>
  );

  const renderTeacherTab = () => (
    <div className="space-y-4">
      {teacherLoading ? (
        <LoadingSpinner message="Loading teacher report..." />
      ) : teacherReportData?.data || teacherReportData?.teachers ? (
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "department", label: "Department", render: (val) => val?.name || val || "-" },
            { key: "classes", label: "Classes", render: (val) => val ?? 0 },
            { key: "students", label: "Students", render: (val) => val ?? 0 },
          ]}
          data={teacherReportData?.data || teacherReportData?.teachers || []}
        />
      ) : (
        <div className="rounded-xl bg-white shadow-sm p-12 text-center text-gray-400 text-sm">No teacher report data available</div>
      )}
    </div>
  );

  const tabContent = {
    attendance: renderAttendanceTab,
    grades: renderGradesTab,
    class: renderClassTab,
    student: renderStudentTab,
    teacher: renderTeacherTab,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">View and export institutional reports</p>
      </div>

      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabContent[activeTab]()}
    </div>
  );
}
