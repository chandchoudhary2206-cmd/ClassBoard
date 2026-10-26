import React, { useState, useCallback } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import { FiPlus } from "react-icons/fi";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  department: "",
  course: "",
  academicYear: "",
  semester: "",
  section: "",
  gender: "",
  enrollmentDate: "",
};

const GENDER_OPTIONS = ["Male", "Female", "Other"];

export default function ManageStudents() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useFetch("/students", { page, search, limit: 10 });
  const { data: deptData } = useFetch("/departments", { all: true });
  const { data: courseData } = useFetch("/courses", { all: true });
  const { data: yearData } = useFetch("/academic-years", { all: true });
  const { data: semData } = useFetch("/semesters", { all: true });
  const { data: secData } = useFetch("/sections", { all: true });

  const students = data?.students || data?.data || [];
  const totalPages = data?.totalPages || data?.pagination?.totalPages || 1;
  const departments = deptData?.departments || deptData?.data || [];
  const courses = courseData?.courses || courseData?.data || [];
  const academicYears = yearData?.academicYears || yearData?.data || [];
  const semesters = semData?.semesters || semData?.data || [];
  const sections = secData?.sections || secData?.data || [];

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      name: student.name || "",
      email: student.email || "",
      password: "",
      phone: student.phone || "",
      department: student.department?._id || student.department || "",
      course: student.course?._id || student.course || "",
      academicYear: student.academicYear?._id || student.academicYear || "",
      semester: student.semester?._id || student.semester || "",
      section: student.section?._id || student.section || "",
      gender: student.gender || "",
      enrollmentDate: student.enrollmentDate ? student.enrollmentDate.split("T")[0] : "",
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
        await api.put(`/students/${editing._id}`, payload);
      } else {
        await api.post("/students", payload);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    if (confirmDelete === student._id) {
      try {
        await api.delete(`/students/${student._id}`);
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete student");
      }
    } else {
      setConfirmDelete(student._id);
    }
  };

  const columns = [
    { key: "_id", label: "ID", render: (val) => <span className="text-xs font-mono">{val?.slice(-6) || "-"}</span> },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "department", label: "Dept", render: (val) => val?.name || val || "-" },
    { key: "course", label: "Course", render: (val) => val?.name || val || "-" },
    { key: "section", label: "Section", render: (val) => val?.name || val || "-" },
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
          <h1 className="text-2xl font-bold text-gray-800">Manage Students</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove students</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      <div className="flex items-center gap-4">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search students..." />
        {confirmDelete && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <span>Confirm delete?</span>
            <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
          </div>
        )}
      </div>

      <DataTable columns={columns} data={students} loading={loading} actions onEdit={openEdit} onDelete={handleDelete} />

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Student" : "Add Student"} size="lg">
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
              <label className={labelClass}>{editing ? "Password (leave blank)" : "Password *"}</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className={inputClass} placeholder="Enter password" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="Enter phone" />
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
              <label className={labelClass}>Academic Year</label>
              <select name="academicYear" value={form.academicYear} onChange={handleChange} className={inputClass}>
                <option value="">Select year</option>
                {academicYears.map((y) => (<option key={y._id} value={y._id}>{y.year}</option>))}
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
              <label className={labelClass}>Section</label>
              <select name="section" value={form.section} onChange={handleChange} className={inputClass}>
                <option value="">Select section</option>
                {sections.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Enrollment Date</label>
              <input name="enrollmentDate" type="date" value={form.enrollmentDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Student
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
