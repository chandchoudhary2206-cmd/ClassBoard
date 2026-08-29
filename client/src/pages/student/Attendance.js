import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { FiCalendar, FiUserCheck, FiUserX, FiClock, FiTrendingUp } from "react-icons/fi";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data, loading, error } = useFetch("/attendance/my");

  if (loading) return <LoadingSpinner size="lg" message="Loading attendance records..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load attendance: {error}
      </div>
    );
  }

  const attendanceData = data?.attendance || data?.data || data || {};
  const summary = attendanceData.summary || attendanceData;
  const subjectWise = attendanceData.subjectWise || attendanceData.bySubject || [];
  const records = attendanceData.records || attendanceData.dailyRecords || [];

  const totalClasses = summary.totalClasses ?? 0;
  const present = summary.present ?? 0;
  const absent = summary.absent ?? 0;
  const late = summary.late ?? 0;
  const percentage = summary.percentage ?? (totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0);

  const summaryCards = [
    { title: "Total Classes", value: totalClasses, icon: <FiCalendar className="w-6 h-6" />, color: "bg-blue-600" },
    { title: "Present", value: present, icon: <FiUserCheck className="w-6 h-6" />, color: "bg-emerald-600" },
    { title: "Absent", value: absent, icon: <FiUserX className="w-6 h-6" />, color: "bg-red-600" },
    { title: "Late", value: late, icon: <FiClock className="w-6 h-6" />, color: "bg-amber-600" },
  ];

  const filteredRecords = records.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">View your attendance records</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm p-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-full bg-primary-50 text-primary-600">
            <FiTrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{percentage}%</p>
            <p className="text-sm text-gray-500">Overall Attendance</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
          <div
            className={`h-3 rounded-full transition-all ${
              percentage >= 75 ? "bg-emerald-500" : percentage >= 60 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.title} className={`${card.color} text-white rounded-xl shadow-sm p-4`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/80">{card.title}</p>
              <div className="p-1.5 rounded-lg bg-white/20 text-white">{card.icon}</div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {subjectWise.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Attendance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-left">
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Present</th>
                  <th className="px-4 py-3 font-semibold">Absent</th>
                  <th className="px-4 py-3 font-semibold">Late</th>
                  <th className="px-4 py-3 font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjectWise.map((subj, i) => {
                  const subjTotal = subj.total || 0;
                  const subjPresent = subj.present || 0;
                  const pct = subjTotal > 0 ? Math.round((subjPresent / subjTotal) * 100) : 0;
                  return (
                    <tr key={subj._id || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 font-medium">{subj.subject?.name || subj.subjectName}</td>
                      <td className="px-4 py-3 text-gray-700">{subjTotal}</td>
                      <td className="px-4 py-3 text-gray-700">{subjPresent}</td>
                      <td className="px-4 py-3 text-gray-700">{subj.absent || 0}</td>
                      <td className="px-4 py-3 text-gray-700">{subj.late || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          pct >= 75 ? "bg-green-100 text-green-700" : pct >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Monthly Records</h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        {filteredRecords.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No attendance records for this month</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-left">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((rec, i) => (
                  <tr key={rec._id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{new Date(rec.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-700">{rec.subject?.name || rec.subjectName || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        rec.status === "present" ? "bg-green-100 text-green-700" :
                        rec.status === "late" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {rec.status ? rec.status.charAt(0).toUpperCase() + rec.status.slice(1) : "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
