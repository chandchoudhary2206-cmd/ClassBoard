import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { FiPlus } from "react-icons/fi";

const initialForm = { name: "", code: "", duration: "", department: "", description: "" };

export default function ManageCourses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deptFilter, setDeptFilter] = useState("");

  const { data, loading, error, refetch } = useFetch("/courses", { all: true, department: deptFilter || undefined });
  const { data: deptData } = useFetch("/departments", { all: true });

  const courses = data?.courses || data?.data || [];
  const departments = deptData?.departments || deptData?.data || [];

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      name: course.name || "",
      code: course.code || "",
      duration: course.duration || "",
      department: course.department?._id || course.department || "",
      description: course.description || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.code.trim()) return "Code is required";
    if (!form.duration) return "Duration is required";
    if (!form.department) return "Department is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setSaving(true);
    try {
      const payload = { ...form, duration: Number(form.duration) };
      if (editing) {
        await api.put(`/courses/${editing._id}`, payload);
      } else {
        await api.post("/courses", payload);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (confirmDelete === course._id) {
      try {
        await api.delete(`/courses/${course._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete course");
      }
    } else {
      setConfirmDelete(course._id);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "duration", label: "Duration (yrs)", render: (val) => val ?? "-" },
    { key: "department", label: "Department", render: (val) => val?.name || val || "-" },
  ];

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove courses</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      <div className="flex flex-wrap items-center gap-4">
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700">
          <option value="">All Departments</option>
          {departments.map((d) => (<option key={d._id} value={d._id}>{d.name}</option>))}
        </select>
        {confirmDelete && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <span>Confirm delete?</span>
            <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
          </div>
        )}
      </div>

      <DataTable columns={columns} data={courses} loading={loading} actions onEdit={openEdit} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Course" : "Add Course"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. B.Tech" />
            </div>
            <div>
              <label className={labelClass}>Code *</label>
              <input name="code" value={form.code} onChange={handleChange} className={inputClass} placeholder="e.g. BTECH" />
            </div>
            <div>
              <label className={labelClass}>Duration (years) *</label>
              <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} className={inputClass} placeholder="e.g. 4" />
            </div>
            <div>
              <label className={labelClass}>Department *</label>
              <select name="department" value={form.department} onChange={handleChange} className={inputClass}>
                <option value="">Select department</option>
                {departments.map((d) => (<option key={d._id} value={d._id}>{d.name}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className={inputClass} rows={3} placeholder="Optional description" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
