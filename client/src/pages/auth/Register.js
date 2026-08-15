import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";

const ROLES = [
  { value: "", label: "Select role" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    if (!form.password) errors.password = "Password is required.";
    else if (form.password.length < 6) errors.password = "Password must be at least 6 characters.";
    if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    if (!form.role) errors.role = "Please select a role.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg mb-3">
          CB
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-sm text-gray-500 mt-1">Join ClassBoard today</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                fieldErrors.name ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />
          </div>
          {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                fieldErrors.email ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />
          </div>
          {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 chars"
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                  fieldErrors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                  fieldErrors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`w-full py-2.5 px-3 rounded-lg border text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                fieldErrors.role ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {fieldErrors.role && <p className="mt-1 text-xs text-red-500">{fieldErrors.role}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
