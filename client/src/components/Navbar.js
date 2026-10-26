import React, { useState, useRef, useEffect } from "react";
import { FiMenu, FiBell, FiChevronDown, FiLogOut } from "react-icons/fi";
import useAuth from "../hooks/useAuth";

export default function Navbar({ title = "Dashboard", onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleBadgeColor = {
    admin: "bg-primary-100 text-primary-700",
    teacher: "bg-accent-100 text-accent-700",
    student: "bg-blue-100 text-blue-700",
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 leading-tight">
                  {user?.name || "User"}
                </p>
                <span
                  className={`inline-block text-xs px-1.5 py-0.5 rounded mt-0.5 capitalize ${
                    roleBadgeColor[user?.role] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user?.role || "guest"}
                </span>
              </div>
              <FiChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                  <p className="text-sm font-medium text-gray-700">{user?.name || "User"}</p>
                  <span
                    className={`inline-block text-xs px-1.5 py-0.5 rounded mt-0.5 capitalize ${
                      roleBadgeColor[user?.role] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user?.role || "guest"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
