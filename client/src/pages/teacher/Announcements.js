import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMessageSquare,
  FiBell,
  FiCalendar,
} from "react-icons/fi";

const initialForm = { title: "", content: "", type: "general", targetClass: "" };

const TYPE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "academic", label: "Academic" },
  { value: "event", label: "Event" },
  { value: "holiday", label: "Holiday" },
];

export default function Announcements() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/announcements?my=true");
  const { data: classesData } = useFetch("/classes?teacher=me");

  const announcements = data?.announcements || data?.data || [];
  const classes = classesData?.classes || classesData?.data || [];

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (ann) => {
    setEditing(ann);
    setForm({
      title: ann.title || "",
      content: ann.content || "",
      type: ann.type || "general",
      targetClass: ann.targetClass?._id || ann.targetClassId || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required");
    if (!form.content.trim()) return alert("Content is required");

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        type: form.type,
        targetClass: form.targetClass || undefined,
      };

      if (editing) {
        await api.put(`/announcements/${editing._id}`, payload);
      } else {
        await api.post("/announcements", payload);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ann) => {
    if (confirmDelete === ann._id) {
      try {
        await api.delete(`/announcements/${ann._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete announcement");
      }
    } else {
      setConfirmDelete(ann._id);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "event":
        return <FiCalendar className="w-4 h-4" />;
      case "holiday":
        return <FiBell className="w-4 h-4" />;
      default:
        return <FiMessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "academic":
        return "bg-blue-100 text-blue-700";
      case "event":
        return "bg-purple-100 text-purple-700";
      case "holiday":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Post announcements for your classes</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {confirmDelete && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>Confirm delete?</span>
          <button
            onClick={() => setConfirmDelete(null)}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading announcements..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<FiMessageSquare className="w-16 h-16" />}
          title="No announcements"
          description="Create your first announcement for your classes"
          action={{ label: "Create Announcement", onClick: openAdd }}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann._id} className="rounded-xl bg-white shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg mt-0.5 ${getTypeColor(ann.type)}`}>
                    {getTypeIcon(ann.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-800">{ann.title}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(ann.type)}`}
                      >
                        {ann.type || "general"}
                      </span>
                      {ann.targetClass && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                          {ann.targetClass?.name || ann.targetClassName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{ann.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>By {ann.author?.name || "You"}</span>
                      {ann.createdAt && (
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(ann)}
                    className="p-2 rounded-lg text-primary-600 hover:bg-primary-50"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Announcement" : "Create Announcement"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="Announcement title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              className={inputClass}
              rows={4}
              placeholder="Write your announcement..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Class</label>
              <select
                name="targetClass"
                value={form.targetClass}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">All my classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.class?.name || c.className} - Section{" "}
                    {c.section?.name || c.sectionName || c.section}
                  </option>
                ))}
              </select>
            </div>
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
