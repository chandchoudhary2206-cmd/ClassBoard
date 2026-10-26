import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { FiUserCheck, FiUsers } from "react-icons/fi";

const ATTENDANCE_STATUS = ["present", "absent", "late"];

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const { data: classesData } = useFetch("/classes?teacher=me");
  const { data: studentsData, loading: studentsLoading, refetch: refetchStudents } = useFetch(
    selectedClass ? `/classes/${selectedClass}/students` : null
  );
  const { data: attendanceData, refetch: refetchAttendance } = useFetch(
    selectedClass && selectedSubject && selectedDate
      ? `/attendance?classId=${selectedClass}&subjectId=${selectedSubject}&date=${selectedDate}`
      : null
  );

  const classes = classesData?.classes || classesData?.data || [];
  const students = studentsData?.students || studentsData?.data || [];
  const existingRecords = attendanceData?.records || attendanceData?.data || [];
  const recentRecords = attendanceData?.recent || attendanceData?.recentRecords || [];

  const subjects = classes.find((c) => c._id === selectedClass)?.subjects || [];

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setSelectedSubject("");
    setAttendance({});
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    setAttendance({});
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setAttendance({});
  };

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const all = {};
    students.forEach((s) => {
      all[s._id] = "present";
    });
    setAttendance(all);
  };

  const isAlreadyMarked = (studentId) => {
    return existingRecords.some((r) => r.student?._id === studentId || r.studentId === studentId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !selectedDate) {
      return alert("Please select class, subject, and date");
    }
    const entries = Object.entries(attendance).filter(
      ([id, status]) => status && !isAlreadyMarked(id)
    );
    if (entries.length === 0) return alert("No new attendance records to submit");

    setSubmitting(true);
    setSuccess("");
    try {
      await api.post("/attendance/mark", {
        classId: selectedClass,
        subjectId: selectedSubject,
        date: selectedDate,
        records: entries.map(([studentId, status]) => ({ studentId, status })),
      });
      setSuccess(`Attendance marked for ${entries.length} student(s)`);
      refetchAttendance();
      refetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-700 border-green-300";
      case "absent": return "bg-red-100 text-red-700 border-red-300";
      case "late": return "bg-amber-100 text-amber-700 border-amber-300";
      default: return "bg-gray-100 text-gray-500 border-gray-300";
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Take and manage attendance</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select value={selectedClass} onChange={handleClassChange} className={inputClass}>
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.class?.name || c.className} - Section{" "}
                  {c.section?.name || c.sectionName || c.section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={handleSubjectChange}
              className={inputClass}
              disabled={!selectedClass}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name || s.subjectName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {success}
        </div>
      )}

      {selectedClass && selectedSubject && selectedDate && (
        <>
          {studentsLoading ? (
            <LoadingSpinner message="Loading students..." />
          ) : students.length === 0 ? (
            <EmptyState
              icon={<FiUsers className="w-16 h-16" />}
              title="No students"
              description="This class has no students enrolled"
            />
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Mark Attendance ({students.length} students)
                </h2>
                <button
                  type="button"
                  onClick={markAllPresent}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <FiUserCheck className="w-3.5 h-3.5" /> Mark All Present
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-left">
                      <th className="px-4 py-3 font-semibold">#</th>
                      <th className="px-4 py-3 font-semibold">Student Name</th>
                      <th className="px-4 py-3 font-semibold">Student ID</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student, idx) => {
                      const marked = isAlreadyMarked(student._id);
                      const existing = existingRecords.find(
                        (r) => r.student?._id === student._id || r.studentId === student._id
                      );
                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 text-gray-700 font-medium">
                            {student.name || student.firstName + " " + (student.lastName || "")}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {student.studentId || student.rollNumber || "--"}
                          </td>
                          <td className="px-4 py-3">
                            {marked ? (
                              <span
                                className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                  existing?.status
                                )}`}
                              >
                                {existing?.status} (already marked)
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                {ATTENDANCE_STATUS.map((status) => (
                                  <label
                                    key={status}
                                    className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer transition-colors ${
                                      attendance[student._id] === status
                                        ? getStatusColor(status)
                                        : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`attendance-${student._id}`}
                                      value={status}
                                      checked={attendance[student._id] === status}
                                      onChange={() => setStatus(student._id, status)}
                                      className="sr-only"
                                    />
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </label>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Submitting..." : "Submit Attendance"}
                </button>
              </div>
            </form>
          )}

          {recentRecords.length > 0 && (
            <div className="rounded-xl bg-white shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Attendance Records
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-left">
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Subject</th>
                      <th className="px-4 py-3 font-semibold">Present</th>
                      <th className="px-4 py-3 font-semibold">Absent</th>
                      <th className="px-4 py-3 font-semibold">Late</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentRecords.map((rec, i) => (
                      <tr key={rec._id || i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">
                          {rec.date ? new Date(rec.date).toLocaleDateString() : ""}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {rec.subject?.name || rec.subjectName || "--"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            {rec.present || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            {rec.absent || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                            {rec.late || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
