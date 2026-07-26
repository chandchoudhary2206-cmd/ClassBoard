import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import FileUpload from "../../components/FileUpload";
import { FiPlus, FiBookOpen } from "react-icons/fi";

const initialForm = {
  title: "",
  description: "",
  classId: "",
  subjectId: "",
};

export default function StudyMaterials() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/study-materials");
  const { data: classesData } = useFetch("/classes?teacher=me");

  const materials = data?.materials || data?.data || [];
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

  const openEdit = (mat) => {
    setEditing(mat);
    setForm({
      title: mat.title || "",
      description: mat.description || "",
      classId: mat.classId || mat.class?._id || "",
      subjectId: mat.subjectId || mat.subject?._id || "",
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
    if (!editing && !file) return alert("Please upload a file");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("classId", form.classId);
      formData.append("subjectId", form.subjectId);
      if (file) formData.append("file", file);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editing) {
        await api.put(`/study-materials/${editing._id}`, formData, config);
      } else {
        await api.post("/study-materials", formData, config);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save study material");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mat) => {
    if (confirmDelete === mat._id) {
      try {
        await api.delete(`/study-materials/${mat._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete");
      }
    } else {
      setConfirmDelete(mat._id);
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
      key: "fileType",
      label: "File Type",
      render: (val, row) => {
        const type = val || row.file?.split(".").pop() || "";
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 uppercase">
            {type}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Uploaded Date",
      render: (val) => (val ? new Date(val).toLocaleDateString() : ""),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Materials</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage study materials</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" /> Upload Material
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading study materials..." />
      ) : materials.length === 0 ? (
        <EmptyState
          icon={<FiBookOpen className="w-16 h-16" />}
          title="No study materials"
          description="Upload your first study material for your classes"
          action={{ label: "Upload Material", onClick: openAdd }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={materials}
          actions
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {confirmDelete && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>Confirm delete this material?</span>
          <button
            onClick={() => setConfirmDelete(null)}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Study Material" : "Upload Study Material"}
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
              placeholder="Material title"
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
              placeholder="Optional description"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png,.zip"
              maxSize={50 * 1024 * 1024}
              label="Upload study material"
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
              {saving ? "Saving..." : editing ? "Update" : "Upload"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
