import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { FiPlus } from "react-icons/fi";

const initialForm = { name: "", number: "", academicYear: "", course: "", startDate: "", endDate: "" };

export default function ManageSemesters() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/semesters", { all: true });
  const { data: yearData } = useFetch("/academic-years", { all: true });
  const { data: courseData } = useFetch("/courses", { all: true });

  const semesters = data?.semesters || data?.data || [];
  const academicYears = yearData?.academicYears || yearData?.data || [];
  const courses = courseData?.courses || courseData?.data || [];

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (sem) => {
    setEditing(sem);
    setForm({
      name: sem.name || "",
      number: sem.number || "",
      academicYear: sem.academicYear?._id || sem.academicYear || "",
      course: sem.course?._id || sem.course || "",
      startDate: sem.startDate ? sem.startDate.split("T")[0] : "",
      endDate: sem.endDate ? sem.endDate.split("T")[0] : "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.number) return "Number is required";
    if (!form.academicYear) return "Academic year is required";
    if (!form.course) return "Course is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setSaving(true);
    try {
      const payload = { ...form, number: Number(form.number) };
      if (editing) {
        await api.put(`/semesters/${editing._id}`, payload);
      } else {
        await api.post("/semesters", payload);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save semester");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sem) => {
    if (confirmDelete === sem._id) {
      try {
        await api.delete(`/semesters/${sem._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete semester");
      }
    } else {
      setConfirmDelete(sem._id);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "number", label: "Number", render: (val) => val ?? "-" },
    { key: "academicYear", label: "Academic Year", render: (val) => val?.year || val || "-" },
    { key: "course", label: "Course", render: (val) => val?.name || val || "-" },
    {
      key: "dates",
      label: "Dates",
      render: (_, row) => {
        const s = row.startDate ? new Date(row.startDate).toLocaleDateString() : "";
        const e = row.endDate ? new Date(row.endDate).toLocaleDateString() : "";
        return s || e ? `${s} - ${e}` : "-";
      },
    },
  ];

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Semesters</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove semesters</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Add Semester
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {confirmDelete && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>Confirm delete?</span>
          <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
        </div>
      )}

      <DataTable columns={columns} data={semesters} loading={loading} actions onEdit={openEdit} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Semester" : "Add Semester"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Semester 1" />
            </div>
            <div>
              <label className={labelClass}>Number *</label>
              <input name="number" type="number" min="1" value={form.number} onChange={handleChange} className={inputClass} placeholder="e.g. 1" />
            </div>
            <div>
              <label className={labelClass}>Academic Year *</label>
              <select name="academicYear" value={form.academicYear} onChange={handleChange} className={inputClass}>
                <option value="">Select year</option>
                {academicYears.map((y) => (<option key={y._id} value={y._id}>{y.year}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Course *</label>
              <select name="course" value={form.course} onChange={handleChange} className={inputClass}>
                <option value="">Select course</option>
                {courses.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Start Date</label>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Semester
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
