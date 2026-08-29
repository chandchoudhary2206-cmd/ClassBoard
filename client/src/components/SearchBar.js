import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({ value = "", onChange, placeholder = "Search..." }) {
  const [local, setLocal] = useState(value);
  const timer = useRef(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocal(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (onChange) onChange(val);
    }, 300);
  };

  const handleClear = () => {
    setLocal("");
    clearTimeout(timer.current);
    if (onChange) onChange("");
  };

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <div className="relative w-full max-w-xs">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700 placeholder-gray-400"
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
