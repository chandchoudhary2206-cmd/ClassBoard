import React from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { FiAward, FiTrendingUp } from "react-icons/fi";

export default function Grades() {
  const { data: gradesData, loading, error } = useFetch("/reports/grades");
  const { data: submissionsData } = useFetch("/submissions/my/all");

  if (loading) return <LoadingSpinner size="lg" message="Loading grades..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load grades: {error}
      </div>
    );
  }

  const report = gradesData?.report || gradesData?.data || gradesData || {};
  const submissions = submissionsData?.submissions || submissionsData?.data || [];

  const subjectGrades = report.subjectGrades || report.subjectWise || [];
  const gradedSubmissions = submissions.filter((s) => s.status === "graded" && s.marks !== undefined && s.marks !== null);
  const overallPercentage = report.overallPercentage ?? report.percentage ?? 0;
  const overallGrade = report.overallGrade ?? report.grade ?? "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>
        <p className="text-sm text-gray-500 mt-1">View your academic performance</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary-50 text-primary-600">
            <FiAward className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Overall Performance</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-3xl font-bold text-gray-800">{overallPercentage}%</span>
              <span className="px-3 py-1 text-sm font-semibold rounded-lg bg-primary-100 text-primary-700">
                {overallGrade}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
          <div
            className={`h-3 rounded-full transition-all ${
              overallPercentage >= 80 ? "bg-emerald-500" : overallPercentage >= 60 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
      </div>

      {subjectGrades.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectGrades.map((sg, i) => (
              <div key={sg._id || i} className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">{sg.subject?.name || sg.subjectName}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xl font-bold text-primary-600">
                    {sg.percentage ?? sg.average ?? 0}%
                  </span>
                  {sg.grade && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-primary-100 text-primary-700">
                      {sg.grade}
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      (sg.percentage ?? sg.average ?? 0) >= 80 ? "bg-emerald-500" :
                      (sg.percentage ?? sg.average ?? 0) >= 60 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(sg.percentage ?? sg.average ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gradedSubmissions.length > 0 ? (
        <div className="rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Detailed Grades</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-left">
                  <th className="px-4 py-3 font-semibold">Assignment</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Marks Obtained</th>
                  <th className="px-4 py-3 font-semibold">Max Marks</th>
                  <th className="px-4 py-3 font-semibold">Percentage</th>
                  <th className="px-4 py-3 font-semibold">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gradedSubmissions.map((sub, i) => {
                  const maxMarks = sub.assignment?.maxMarks || sub.maxMarks || 100;
                  const pct = maxMarks > 0 ? Math.round((sub.marks / maxMarks) * 100) : 0;
                  return (
                    <tr key={sub._id || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {sub.assignment?.title || sub.assignmentTitle || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {sub.assignment?.subject?.name || sub.subjectName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">{sub.marks}</td>
                      <td className="px-4 py-3 text-gray-700">{maxMarks}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          pct >= 80 ? "bg-green-100 text-green-700" :
                          pct >= 60 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                        {sub.feedback || "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<FiTrendingUp className="w-16 h-16" />}
          title="No graded submissions"
          description="Your grades will appear here once your submissions are evaluated"
        />
      )}
    </div>
  );
}
