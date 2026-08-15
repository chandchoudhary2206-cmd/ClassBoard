import React, { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FiSave } from "react-icons/fi";

export default function Settings() {
  const [activeYear, setActiveYear] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const { data, loading, error, refetch } = useFetch("/academic-years", { all: true });
  const { data: userData } = useFetch("/auth/me");

  const academicYears = data?.academicYears || data?.data || [];
  const user = userData?.user || userData?.data || userData;

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const active = academicYears.find((y) => y.active);
    if (active) setActiveYear(active._id);
  }, [academicYears]);

  const handleActivateYear = async (yearId) => {
    try {
      await api.put(`/academic-years/${yearId}`, { active: true });
      setSuccess("Academic year updated successfully");
      refetch();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update academic year");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    try {
      await api.put("/auth/profile", profile);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) return <LoadingSpinner message="Loading settings..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage system settings and preferences</p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Academic Year</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Current Active Year</label>
            <select
              value={activeYear}
              onChange={(e) => {
                setActiveYear(e.target.value);
                if (e.target.value) handleActivateYear(e.target.value);
              }}
              className={inputClass}
            >
              <option value="">Select academic year</option>
              {academicYears.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.year} {y.active ? "(Active)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Select an academic year to activate it. Only one year can be active at a time.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="name" value={profile.name} onChange={handleProfileChange} className={inputClass} placeholder="Your name" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" value={profile.email} onChange={handleProfileChange} className={inputClass} placeholder="Your email" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" value={profile.phone} onChange={handleProfileChange} className={inputClass} placeholder="Your phone" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
