import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import FileUpload from "../../components/FileUpload";
import { FiPlus, FiClipboard } from "react-icons/fi";

const initialForm = {
  title: "",
  description: "",
  dueDate: "",
  maxMarks: "",
  classId: "",
  subjectId: "",
};

export default function Assignments() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/assignments?teacher=me");
  const { data: classesData } = useFetch("/classes?teacher=me");

  const assignments = data?.assignments || data?.data || [];
  const classes = classesData?.classes || classesData?.data || [];

  const subjects = editing
    ? classes.find((c) => c._id === (editing.classId || editing.class?._id))?.subjects || []
    : classes.find((c) => c._id === form.classId)?.subjects || [];

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (asg) => {
    setEditing(asg);
    setForm({
      title: asg.title || "",
      description: asg.description || "",
      dueDate: asg.dueDate ? asg.dueDate.slice(0, 16) : "",
      maxMarks: asg.maxMarks || "",
      classId: asg.classId || asg.class?._id || "",
      subjectId: asg.subjectId || asg.subject?._id || "",
    });
    setFile(null);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileSelect = (f) => setFile(f);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required");
    if (!form.classId) return alert("Please select a class");
    if (!form.subjectId) return alert("Please select a subject");
    if (!form.dueDate) return alert("Please set a due date");
    if (!form.maxMarks) return alert("Please enter max marks");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("dueDate", form.dueDate);
      formData.append("maxMarks", form.maxMarks);
      formData.append("classId", form.classId);
      formData.append("subjectId", form.subjectId);
      if (file) formData.append("file", file);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editing) {
        await api.put(`/assignments/${editing._id}`, formData, config);
      } else {
        await api.post("/assignments", formData, config);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (asg) => {
    if (confirmDelete === asg._id) {
      try {
        await api.delete(`/assignments/${asg._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete");
      }
    } else {
      setConfirmDelete(asg._id);
    }
  };

  const handleClose = async (asg) => {
    if (!window.confirm("Close this assignment? Students will no longer be able to submit.")) return;
    try {
      await api.put(`/assignments/${asg._id}/close`);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close assignment");
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "class",
      label: "Class",
      render: (val) => val?.name || "",
    },
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
    { key: "maxMarks", label: "Max Marks" },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            val === "closed"
              ? "bg-red-100 text-red-700"
              : val === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {val || "active"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage assignments</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" /> Create Assignment
        </button>
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
          description="Create your first assignment for your classes"
          action={{ label: "Create Assignment", onClick: openAdd }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={assignments}
          actions
          onEdit={(row) => row.status !== "closed" && openEdit(row)}
          onDelete={(row) => row.status !== "closed" && handleDelete(row)}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Assignment" : "Create Assignment"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
              placeholder="Assignment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
              placeholder="Assignment description / instructions"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <select
                name="classId"
                value={form.classId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.class?.name || c.className} - Section {c.section?.name || c.sectionName || c.section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select
                name="subjectId"
                value={form.subjectId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name || s.subjectName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks *</label>
              <input
                type="number"
                name="maxMarks"
                value={form.maxMarks}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png,.zip"
              maxSize={50 * 1024 * 1024}
              label="Upload assignment file"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
