import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { FiCheckSquare, FiDownload, FiExternalLink } from "react-icons/fi";

export default function Submissions() {
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [gradeModal, setGradeModal] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: assignmentsData } = useFetch("/assignments?teacher=me");
  const {
    data: submissionsData,
    loading,
    error,
    refetch,
  } = useFetch(selectedAssignment ? `/submissions?assignment=${selectedAssignment}` : null);

  const assignments = assignmentsData?.assignments || assignmentsData?.data || [];
  const submissions = submissionsData?.submissions || submissionsData?.data || [];

  const openGrade = (sub) => {
    setGradingSubmission(sub);
    setMarks(sub.marks || "");
    setFeedback(sub.feedback || "");
    setGradeModal(true);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (marks === "" || marks === null) return alert("Please enter marks");
    setSaving(true);
    try {
      await api.put(`/submissions/${gradingSubmission._id}/grade`, {
        marks: Number(marks),
        feedback,
      });
      setGradeModal(false);
      setGradingSubmission(null);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to grade submission");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      submitted: "bg-blue-100 text-blue-700",
      late: "bg-amber-100 text-amber-700",
      graded: "bg-green-100 text-green-700",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
          map[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status || "submitted"}
      </span>
    );
  };

  const columns = [
    {
      key: "student",
      label: "Student Name",
      render: (val) => val?.name || val?.firstName + " " + (val?.lastName || "") || "N/A",
    },
    {
      key: "studentId",
      label: "Student ID",
      render: (val, row) => row.student?.studentId || row.student?.rollNumber || val || "N/A",
    },
    {
      key: "submittedAt",
      label: "Submitted Date",
      render: (val) => (val ? new Date(val).toLocaleString() : "N/A"),
    },
    {
      key: "file",
      label: "File",
      render: (val, row) =>
        val ? (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs"
          >
            <FiDownload className="w-3.5 h-3.5" /> View
          </a>
        ) : (
          <span className="text-xs text-gray-400">No file</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => statusBadge(val),
    },
    {
      key: "marks",
      label: "Marks",
      render: (val, row) =>
        val !== undefined && val !== null ? (
          <span className="font-medium">
            {val} / {row.assignment?.maxMarks || row.maxMarks || "--"}
          </span>
        ) : (
          <span className="text-gray-400">--</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Submissions</h1>
        <p className="text-sm text-gray-500 mt-1">View and grade student submissions</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Assignment</label>
        <select
          value={selectedAssignment}
          onChange={(e) => setSelectedAssignment(e.target.value)}
          className="w-full max-w-md px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
        >
          <option value="">Choose an assignment...</option>
          {assignments.map((a) => (
            <option key={a._id} value={a._id}>
              {a.title} - {a.class?.name || a.className} ({a.subject?.name || a.subjectName})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {!selectedAssignment ? (
        <EmptyState
          icon={<FiCheckSquare className="w-16 h-16" />}
          title="Select an assignment"
          description="Choose an assignment above to view submissions"
        />
      ) : loading ? (
        <LoadingSpinner message="Loading submissions..." />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={<FiCheckSquare className="w-16 h-16" />}
          title="No submissions yet"
          description="No students have submitted this assignment"
        />
      ) : (
        <DataTable
          columns={columns}
          data={submissions}
          actions
          onEdit={(row) => openGrade(row)}
        />
      )}

      <Modal
        isOpen={gradeModal}
        onClose={() => setGradeModal(false)}
        title="Grade Submission"
        size="md"
      >
        <form onSubmit={handleGrade} className="space-y-4">
          {gradingSubmission && (
            <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Student:</span>{" "}
                {gradingSubmission.student?.name || gradingSubmission.student?.firstName || "N/A"}
              </p>
              <p>
                <span className="font-medium">Max Marks:</span>{" "}
                {gradingSubmission.assignment?.maxMarks || gradingSubmission.maxMarks || "--"}
              </p>
              {gradingSubmission.file && (
                <a
                  href={gradingSubmission.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                >
                  <FiExternalLink className="w-3.5 h-3.5" /> View submission file
                </a>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marks *</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              min="0"
              max={gradingSubmission?.assignment?.maxMarks || 100}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
              placeholder="Enter marks"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
              placeholder="Optional feedback for the student"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setGradeModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Submit Grade"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
