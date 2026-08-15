import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { FiPlus } from "react-icons/fi";

const initialForm = { name: "", subject: "", teacher: "", section: "", room: "", schedule: "" };

export default function ManageClasses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/classes", { all: true });
  const { data: subjData } = useFetch("/subjects", { all: true });
  const { data: teacherData } = useFetch("/teachers", { all: true });
  const { data: secData } = useFetch("/sections", { all: true });

  const classes = data?.classes || data?.data || [];
  const subjects = subjData?.subjects || subjData?.data || [];
  const teachers = teacherData?.teachers || teacherData?.data || [];
  const sections = secData?.sections || secData?.data || [];

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (cls) => {
    setEditing(cls);
    setForm({
      name: cls.name || "",
      subject: cls.subject?._id || cls.subject || "",
      teacher: cls.teacher?._id || cls.teacher || "",
      section: cls.section?._id || cls.section || "",
      room: cls.room || "",
      schedule: cls.schedule || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.subject) return "Subject is required";
    if (!form.teacher) return "Teacher is required";
    if (!form.section) return "Section is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/classes/${editing._id}`, form);
      } else {
        await api.post("/classes", form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save class");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cls) => {
    if (confirmDelete === cls._id) {
      try {
        await api.delete(`/classes/${cls._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete class");
      }
    } else {
      setConfirmDelete(cls._id);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "subject", label: "Subject", render: (val) => val?.name || val || "-" },
    { key: "teacher", label: "Teacher", render: (val) => val?.name || val || "-" },
    { key: "section", label: "Section", render: (val) => val?.name || val || "-" },
    { key: "room", label: "Room", render: (val) => val || "-" },
  ];

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Classes</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove classes</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {confirmDelete && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>Confirm delete?</span>
          <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
        </div>
      )}

      <DataTable columns={columns} data={classes} loading={loading} actions onEdit={openEdit} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Class" : "Add Class"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Math 101 - A" />
            </div>
            <div>
              <label className={labelClass}>Room</label>
              <input name="room" value={form.room} onChange={handleChange} className={inputClass} placeholder="e.g. Room 301" />
            </div>
            <div>
              <label className={labelClass}>Subject *</label>
              <select name="subject" value={form.subject} onChange={handleChange} className={inputClass}>
                <option value="">Select subject</option>
                {subjects.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Teacher *</label>
              <select name="teacher" value={form.teacher} onChange={handleChange} className={inputClass}>
                <option value="">Select teacher</option>
                {teachers.map((t) => (<option key={t._id} value={t._id}>{t.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Section *</label>
              <select name="section" value={form.section} onChange={handleChange} className={inputClass}>
                <option value="">Select section</option>
                {sections.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Schedule</label>
              <input name="schedule" value={form.schedule} onChange={handleChange} className={inputClass} placeholder="e.g. Mon-Wed 10:00-11:00" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
