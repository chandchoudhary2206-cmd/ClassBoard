import React, { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = [
  "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
  "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00",
];

const initialForm = { day: "Monday", startTime: "08:00", endTime: "09:00", subject: "", teacher: "", classroom: "" };

export default function Timetable() {
  const [selectedSection, setSelectedSection] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const { data: secData } = useFetch("/sections", { all: true });
  const { data: subjData } = useFetch("/subjects", { all: true });
  const { data: teacherData } = useFetch("/teachers", { all: true });
  const { data, loading, error, refetch } = useFetch("/timetable", { section: selectedSection || undefined }, { enabled: !!selectedSection });
  const { data: classData } = useFetch("/classes", { all: true });

  const sections = secData?.sections || secData?.data || [];
  const subjects = subjData?.subjects || subjData?.data || [];
  const teachers = teacherData?.teachers || teacherData?.data || [];
  const entries = data?.timetable || data?.data || [];

  const getEntry = (day, timeSlot) => {
    const [start, end] = timeSlot.split("-");
    return entries.find(
      (e) => e.day === day && e.startTime === start && e.endTime === end
    );
  };

  const openAdd = (day, timeSlot) => {
    const [start, end] = timeSlot.split("-");
    setEditing(null);
    setForm({ day, startTime: start, endTime: end, subject: "", teacher: "", classroom: "" });
    setModalOpen(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setForm({
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subject: entry.subject?._id || entry.subject || "",
      teacher: entry.teacher?._id || entry.teacher || "",
      classroom: entry.classroom || "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.teacher) {
      return alert("Subject and Teacher are required");
    }
    setSaving(true);
    try {
      const payload = { ...form, section: selectedSection };
      if (editing) {
        await api.put(`/timetable/${editing._id}`, payload);
      } else {
        await api.post("/timetable", payload);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save timetable entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm("Delete this timetable entry?")) return;
    try {
      await api.delete(`/timetable/${entry._id}`);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete entry");
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Timetable</h1>
          <p className="text-sm text-gray-500 mt-1">Manage weekly class schedules</p>
        </div>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700"
        >
          <option value="">Select a section...</option>
          {sections.map((s) => (
            <option key={s._id} value={s._id}>{s.name} - {s.course?.name || ""}</option>
          ))}
        </select>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {!selectedSection ? (
        <div className="rounded-xl bg-white shadow-sm p-12 text-center text-gray-400 text-sm">
          Select a section to view its timetable
        </div>
      ) : loading ? (
        <LoadingSpinner message="Loading timetable..." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-3 text-left font-semibold text-gray-600 w-20">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="px-3 py-3 text-left font-semibold text-gray-600 min-w-[120px]">
                    {day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TIME_SLOTS.map((slot) => {
                const [start, end] = slot.split("-");
                return (
                  <tr key={slot} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs text-gray-500 font-medium whitespace-nowrap">{slot}</td>
                    {DAYS.map((day) => {
                      const entry = getEntry(day, slot);
                      return (
                        <td key={day} className="px-3 py-2 border-l border-gray-100">
                          {entry ? (
                            <div className="group relative">
                              <div className="p-2 rounded-lg bg-primary-50 border border-primary-200">
                                <p className="text-xs font-medium text-primary-700 truncate">
                                  {entry.subject?.name || entry.subject}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {entry.teacher?.name || entry.teacher}
                                </p>
                                {entry.classroom && (
                                  <p className="text-xs text-gray-400">{entry.classroom}</p>
                                )}
                              </div>
                              <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-1">
                                <button
                                  onClick={() => openEdit(entry)}
                                  className="p-1 rounded bg-white shadow text-primary-600 hover:bg-primary-50"
                                >
                                  <FiEdit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(entry)}
                                  className="p-1 rounded bg-white shadow text-red-500 hover:bg-red-50"
                                >
                                  <FiTrash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => openAdd(day, slot)}
                              className="w-full p-2 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                            >
                              <FiPlus className="w-4 h-4 mx-auto" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Entry" : "Add Timetable Entry"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Day</label>
              <select name="day" value={form.day} onChange={handleChange} className={inputClass}>
                {DAYS.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Classroom</label>
              <input name="classroom" value={form.classroom} onChange={handleChange} className={inputClass} placeholder="e.g. Room 101" />
            </div>
            <div>
              <label className={labelClass}>Start Time</label>
              <input name="startTime" type="time" value={form.startTime} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input name="endTime" type="time" value={form.endTime} onChange={handleChange} className={inputClass} />
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
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"} Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
