import React, { useState, useCallback } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FiPlus } from "react-icons/fi";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  department: "",
  qualification: "",
  specialization: "",
  gender: "",
  joiningDate: "",
};

const GENDER_OPTIONS = ["Male", "Female", "Other"];

export default function ManageTeachers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/teachers", { page, search, limit: 10 });
  const { data: deptData } = useFetch("/departments", { all: true });

  const teachers = data?.teachers || data?.data || [];
  const totalPages = data?.totalPages || data?.pagination?.totalPages || 1;
  const departments = deptData?.departments || deptData?.data || [];

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (teacher) => {
    setEditing(teacher);
    setForm({
      name: teacher.name || "",
      email: teacher.email || "",
      password: "",
      phone: teacher.phone || "",
      department: teacher.department?._id || teacher.department || "",
      qualification: teacher.qualification || "",
      specialization: teacher.specialization || "",
      gender: teacher.gender || "",
      joiningDate: teacher.joiningDate ? teacher.joiningDate.split("T")[0] : "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!editing && !form.password) return "Password is required";
    if (!form.department) return "Department is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password && editing) delete payload.password;
      if (editing) {
        await api.put(`/teachers/${editing._id}`, payload);
      } else {
        await api.post("/teachers", payload);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save teacher");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (teacher) => {
    if (confirmDelete === teacher._id) {
      try {
        await api.delete(`/teachers/${teacher._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete teacher");
      }
    } else {
      setConfirmDelete(teacher._id);
    }
  };

  const columns = [
    { key: "_id", label: "ID", render: (val) => <span className="text-xs font-mono">{val?.slice(-6) || "-"}</span> },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "department", label: "Dept", render: (val) => val?.name || val || "-" },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${val === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {val || "active"}
        </span>
      ),
    },
  ];

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Teachers</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove teachers</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <div className="flex items-center gap-4">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search teachers..." />
        {confirmDelete && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <span>Confirm delete?</span>
            <button onClick={() => { setConfirmDelete(null); }} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
          </div>
        )}
      </div>

      <DataTable columns={columns} data={teachers} loading={loading} actions onEdit={openEdit} onDelete={handleDelete} />

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Teacher" : "Add Teacher"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Enter name" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="Enter email" />
            </div>
            <div>
              <label className={labelClass}>{editing ? "Password (leave blank to keep)" : "Password *"}</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className={inputClass} placeholder="Enter password" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="Enter phone" />
            </div>
            <div>
              <label className={labelClass}>Department *</label>
              <select name="department" value={form.department} onChange={handleChange} className={inputClass}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Qualification</label>
              <input name="qualification" value={form.qualification} onChange={handleChange} className={inputClass} placeholder="e.g. M.Sc, Ph.D" />
            </div>
            <div>
              <label className={labelClass}>Specialization</label>
              <input name="specialization" value={form.specialization} onChange={handleChange} className={inputClass} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className={labelClass}>Joining Date</label>
              <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Teacher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
