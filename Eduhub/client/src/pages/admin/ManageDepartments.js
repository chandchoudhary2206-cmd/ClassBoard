import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { FiPlus } from "react-icons/fi";

const initialForm = { name: "", code: "", description: "" };

export default function ManageDepartments() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/departments", { all: true });

  const departments = data?.departments || data?.data || [];

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({
      name: dept.name || "",
      code: dept.code || "",
      description: dept.description || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.code.trim()) return "Code is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/departments/${editing._id}`, form);
      } else {
        await api.post("/departments", form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    if (confirmDelete === dept._id) {
      try {
        await api.delete(`/departments/${dept._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete department");
      }
    } else {
      setConfirmDelete(dept._id);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "description", label: "Description", render: (val) => val || "-" },
    {
      key: "active",
      label: "Active",
      render: (val) => (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${val !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {val !== false ? "Yes" : "No"}
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
          <h1 className="text-2xl font-bold text-gray-800">Manage Departments</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove departments</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {confirmDelete && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>Confirm delete?</span>
          <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
        </div>
      )}

      <DataTable columns={columns} data={departments} loading={loading} actions onEdit={openEdit} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className={labelClass}>Code *</label>
            <input name="code" value={form.code} onChange={handleChange} className={inputClass} placeholder="e.g. CS" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className={inputClass} rows={3} placeholder="Optional description" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
