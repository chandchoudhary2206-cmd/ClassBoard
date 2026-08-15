import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function StatCard({ title, value, icon, color = "bg-primary-600", trend }) {
  const isUp = trend && trend >= 0;

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-md ${color} text-white p-5`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-white/20 text-white">
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && trend !== null && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/80">
          {isUp ? (
            <FiTrendingUp className="w-4 h-4 text-white" />
          ) : (
            <FiTrendingDown className="w-4 h-4 text-white" />
          )}
          <span>{Math.abs(trend)}% from last month</span>
        </div>
      )}
    </div>
  );
}
