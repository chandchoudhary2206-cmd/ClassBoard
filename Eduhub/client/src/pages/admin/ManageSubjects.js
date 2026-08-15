import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { FiPlus } from "react-icons/fi";

const initialForm = { name: "", code: "", credits: "", department: "", course: "", semester: "", description: "" };

export default function ManageSubjects() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filters, setFilters] = useState({ department: "", course: "", semester: "" });

  const { data, loading, error, refetch } = useFetch("/subjects", { all: true, ...filters });
  const { data: deptData } = useFetch("/departments", { all: true });
  const { data: courseData } = useFetch("/courses", { all: true, department: filters.department || undefined });
  const { data: semData } = useFetch("/semesters", { all: true });

  const subjects = data?.subjects || data?.data || [];
  const departments = deptData?.departments || deptData?.data || [];
  const courses = courseData?.courses || courseData?.data || [];
  const semesters = semData?.semesters || semData?.data || [];

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (subj) => {
    setEditing(subj);
    setForm({
      name: subj.name || "",
      code: subj.code || "",
      credits: subj.credits || "",
      department: subj.department?._id || subj.department || "",
      course: subj.course?._id || subj.course || "",
      semester: subj.semester?._id || subj.semester || "",
      description: subj.description || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.code.trim()) return "Code is required";
    if (!form.credits) return "Credits is required";
    if (!form.department) return "Department is required";
    if (!form.course) return "Course is required";
    if (!form.semester) return "Semester is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setSaving(true);
    try {
      const payload = { ...form, credits: Number(form.credits) };
      if (editing) {
        await api.put(`/subjects/${editing._id}`, payload);
      } else {
        await api.post("/subjects", payload);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subj) => {
    if (confirmDelete === subj._id) {
      try {
        await api.delete(`/subjects/${subj._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete subject");
      }
    } else {
      setConfirmDelete(subj._id);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "credits", label: "Credits", render: (val) => val ?? "-" },
    { key: "department", label: "Dept", render: (val) => val?.name || val || "-" },
    { key: "course", label: "Course", render: (val) => val?.name || val || "-" },
    { key: "semester", label: "Semester", render: (val) => val?.name || val || "-" },
  ];

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Subjects</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove subjects</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      <div className="flex flex-wrap items-center gap-4">
        <select name="department" value={filters.department} onChange={handleFilterChange} className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700">
          <option value="">All Departments</option>
          {departments.map((d) => (<option key={d._id} value={d._id}>{d.name}</option>))}
        </select>
        <select name="course" value={filters.course} onChange={handleFilterChange} className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700">
          <option value="">All Courses</option>
          {courses.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
        </select>
        <select name="semester" value={filters.semester} onChange={handleFilterChange} className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700">
          <option value="">All Semesters</option>
          {semesters.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
        </select>
        {confirmDelete && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <span>Confirm delete?</span>
            <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
          </div>
        )}
      </div>

      <DataTable columns={columns} data={subjects} loading={loading} actions onEdit={openEdit} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Subject" : "Add Subject"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Data Structures" />
            </div>
            <div>
              <label className={labelClass}>Code *</label>
              <input name="code" value={form.code} onChange={handleChange} className={inputClass} placeholder="e.g. CS201" />
            </div>
            <div>
              <label className={labelClass}>Credits *</label>
              <input name="credits" type="number" min="1" value={form.credits} onChange={handleChange} className={inputClass} placeholder="e.g. 4" />
            </div>
            <div>
              <label className={labelClass}>Department *</label>
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
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className={inputClass} rows={3} placeholder="Optional description" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
