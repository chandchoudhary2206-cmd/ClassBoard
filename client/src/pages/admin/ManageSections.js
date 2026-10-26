import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { FiPlus } from "react-icons/fi";

const initialForm = { name: "", department: "", course: "", semester: "", academicYear: "", capacity: "" };

export default function ManageSections() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/sections", { all: true });
  const { data: deptData } = useFetch("/departments", { all: true });
  const { data: courseData } = useFetch("/courses", { all: true });
  const { data: semData } = useFetch("/semesters", { all: true });
  const { data: yearData } = useFetch("/academic-years", { all: true });

  const sections = data?.sections || data?.data || [];
  const departments = deptData?.departments || deptData?.data || [];
  const courses = courseData?.courses || courseData?.data || [];
  const semesters = semData?.semesters || semData?.data || [];
  const academicYears = yearData?.academicYears || yearData?.data || [];

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (sec) => {
    setEditing(sec);
    setForm({
      name: sec.name || "",
      department: sec.department?._id || sec.department || "",
      course: sec.course?._id || sec.course || "",
      semester: sec.semester?._id || sec.semester || "",
      academicYear: sec.academicYear?._id || sec.academicYear || "",
      capacity: sec.capacity || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setSaving(true);
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : undefined };
      if (editing) {
        await api.put(`/sections/${editing._id}`, payload);
      } else {
        await api.post("/sections", payload);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save section");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sec) => {
    if (confirmDelete === sec._id) {
      try {
        await api.delete(`/sections/${sec._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete section");
      }
    } else {
      setConfirmDelete(sec._id);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "department", label: "Dept", render: (val) => val?.name || val || "-" },
    { key: "course", label: "Course", render: (val) => val?.name || val || "-" },
    { key: "semester", label: "Semester", render: (val) => val?.name || val || "-" },
    { key: "academicYear", label: "Academic Year", render: (val) => val?.year || val || "-" },
    { key: "capacity", label: "Capacity", render: (val) => val ?? "-" },
  ];

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Sections</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove sections</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Add Section
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {confirmDelete && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>Confirm delete?</span>
          <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
        </div>
      )}

      <DataTable columns={columns} data={sections} loading={loading} actions onEdit={openEdit} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Section" : "Add Section"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Section A" />
            </div>
            <div>
              <label className={labelClass}>Capacity</label>
              <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} className={inputClass} placeholder="e.g. 60" />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <select name="department" value={form.department} onChange={handleChange} className={inputClass}>
                <option value="">Select department</option>
                {departments.map((d) => (<option key={d._id} value={d._id}>{d.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Course</label>
              <select name="course" value={form.course} onChange={handleChange} className={inputClass}>
                <option value="">Select course</option>
                {courses.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Semester</label>
              <select name="semester" value={form.semester} onChange={handleChange} className={inputClass}>
                <option value="">Select semester</option>
                {semesters.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Academic Year</label>
              <select name="academicYear" value={form.academicYear} onChange={handleChange} className={inputClass}>
                <option value="">Select year</option>
                {academicYears.map((y) => (<option key={y._id} value={y._id}>{y.year}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Section
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
