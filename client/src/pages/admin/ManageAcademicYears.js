import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { FiPlus } from "react-icons/fi";

const initialForm = { year: "", startDate: "", endDate: "" };

export default function ManageAcademicYears() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/academic-years", { all: true });

  const academicYears = data?.academicYears || data?.data || [];

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (year) => {
    setEditing(year);
    setForm({
      year: year.year || "",
      startDate: year.startDate ? year.startDate.split("T")[0] : "",
      endDate: year.endDate ? year.endDate.split("T")[0] : "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.year.trim()) return "Year is required";
    if (!form.startDate) return "Start date is required";
    if (!form.endDate) return "End date is required";
    if (new Date(form.endDate) <= new Date(form.startDate)) return "End date must be after start date";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/academic-years/${editing._id}`, form);
      } else {
        await api.post("/academic-years", form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save academic year");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (year) => {
    if (confirmDelete === year._id) {
      try {
        await api.delete(`/academic-years/${year._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete academic year");
      }
    } else {
      setConfirmDelete(year._id);
    }
  };

  const columns = [
    { key: "year", label: "Year" },
    {
      key: "startDate",
      label: "Start Date",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
    {
      key: "endDate",
      label: "End Date",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "-"),
    },
    {
      key: "active",
      label: "Active",
      render: (val) => (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${val ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {val ? "Yes" : "No"}
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
          <h1 className="text-2xl font-bold text-gray-800">Manage Academic Years</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove academic years</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Add Academic Year
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {confirmDelete && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span>Confirm delete?</span>
          <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
        </div>
      )}

      <DataTable columns={columns} data={academicYears} loading={loading} actions onEdit={openEdit} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Academic Year" : "Add Academic Year"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Year *</label>
            <input name="year" value={form.year} onChange={handleChange} className={inputClass} placeholder="e.g. 2024-2025" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date *</label>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Year
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
