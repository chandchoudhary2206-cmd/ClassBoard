import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import FileUpload from "../../components/FileUpload";
import { FiClipboard, FiEye, FiSend } from "react-icons/fi";

export default function Assignments() {
  const [detailModal, setDetailModal] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: assignmentsData, loading, error, refetch: refetchAssignments } = useFetch("/assignments");
  const { data: submissionsData, refetch: refetchSubmissions } = useFetch("/submissions/my/all");

  const assignments = assignmentsData?.assignments || assignmentsData?.data || [];
  const submissions = submissionsData?.submissions || submissionsData?.data || [];

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(
      (s) => (s.assignment?._id || s.assignmentId) === assignmentId
    );
  };

  const openDetail = (asg) => {
    setSelectedAssignment(asg);
    setDetailModal(true);
  };

  const openSubmit = (asg) => {
    setSelectedAssignment(asg);
    setFile(null);
    setNotes("");
    setSubmitModal(true);
  };

  const handleFileSelect = (f) => setFile(f);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a file");
    if (!selectedAssignment) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("assignmentId", selectedAssignment._id);
      formData.append("notes", notes);
      formData.append("file", file);

      await api.post("/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitModal(false);
      refetchSubmissions();
      refetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "title", label: "Assignment Title" },
    {
      key: "subject",
      label: "Subject",
      render: (val) => val?.name || "",
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (val) => (val ? new Date(val).toLocaleDateString() : ""),
    },
    {
      key: "_id",
      label: "Status",
      render: (val) => {
        const sub = getSubmissionForAssignment(val);
        let status = "pending";
        let color = "bg-gray-100 text-gray-600";
        if (sub) {
          status = sub.status === "graded" ? "graded" : "submitted";
          color = sub.status === "graded"
            ? "bg-green-100 text-green-700"
            : "bg-blue-100 text-blue-700";
        }
        const now = new Date();
        const due = new Date(assignments.find((a) => a._id === val)?.dueDate);
        if (!sub && due < now) {
          status = "overdue";
          color = "bg-red-100 text-red-700";
        }
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: "_id",
      label: "Marks",
      render: (val) => {
        const sub = getSubmissionForAssignment(val);
        const asg = assignments.find((a) => a._id === val);
        if (sub?.marks !== undefined && sub?.marks !== null) {
          return `${sub.marks} / ${asg?.maxMarks || "?"}`;
        }
        return sub ? "Pending" : "--";
      },
    },
    {
      key: "_id",
      label: "Action",
      render: (val, row) => {
        const sub = getSubmissionForAssignment(val);
        const now = new Date();
        const due = new Date(row.dueDate);
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openDetail(row)}
              className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50"
              title="View Details"
            >
              <FiEye className="w-4 h-4" />
            </button>
            {(!sub || row.allowResubmission) && due >= now && (
              <button
                onClick={() => openSubmit(row)}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                title={sub ? "Resubmit" : "Submit"}
              >
                <FiSend className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
        <p className="text-sm text-gray-500 mt-1">View and submit your assignments</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={<FiClipboard className="w-16 h-16" />}
          title="No assignments"
          description="No assignments have been posted yet"
        />
      ) : (
        <DataTable columns={columns} data={assignments} />
      )}

      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title="Assignment Details" size="lg">
        {selectedAssignment && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{selectedAssignment.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedAssignment.subject?.name || selectedAssignment.subjectName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="font-medium text-gray-700 mt-0.5">
                  {selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleString() : "N/A"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500">Max Marks</p>
                <p className="font-medium text-gray-700 mt-0.5">{selectedAssignment.maxMarks || "N/A"}</p>
              </div>
            </div>
            {selectedAssignment.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedAssignment.description}</p>
              </div>
            )}
            {selectedAssignment.file && (
              <a
                href={selectedAssignment.file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100"
              >
                <FiClipboard className="w-4 h-4" /> View Attachment
              </a>
            )}
            {(() => {
              const sub = getSubmissionForAssignment(selectedAssignment._id);
              if (sub) {
                return (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      {sub.status === "graded" ? "Graded" : "Submitted"}
                    </p>
                    {sub.marks !== undefined && sub.marks !== null && (
                      <p className="text-sm text-green-700 mt-1">
                        Marks: {sub.marks} / {selectedAssignment.maxMarks || "?"}
                      </p>
                    )}
                    {sub.feedback && (
                      <p className="text-sm text-green-700 mt-1">Feedback: {sub.feedback}</p>
                    )}
                    {sub.file && (
                      <a
                        href={sub.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 mt-2"
                      >
                        View Submission
                      </a>
                    )}
                  </div>
                );
              }
              return null;
            })()}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              {(!getSubmissionForAssignment(selectedAssignment._id) || selectedAssignment.allowResubmission) &&
                new Date(selectedAssignment.dueDate) >= new Date() && (
                <button
                  onClick={() => { setDetailModal(false); openSubmit(selectedAssignment); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  <FiSend className="w-4 h-4" /> Submit
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={submitModal} onClose={() => setSubmitModal(false)} title="Submit Assignment" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedAssignment && (
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-800">{selectedAssignment.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Due: {selectedAssignment.dueDate ? new Date(selectedAssignment.dueDate).toLocaleString() : "N/A"}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
              placeholder="Add any notes for your submission..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png,.zip,.ppt,.pptx"
              maxSize={50 * 1024 * 1024}
              label="Upload your assignment"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setSubmitModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !file}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <FiSend className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
