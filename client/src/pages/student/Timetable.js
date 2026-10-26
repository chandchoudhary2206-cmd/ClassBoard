import React from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { FiCalendar } from "react-icons/fi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

export default function Timetable() {
  const { data, loading, error } = useFetch("/timetable/my");

  if (loading) return <LoadingSpinner size="lg" message="Loading timetable..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load timetable: {error}
      </div>
    );
  }

  const timetable = data?.timetable || data?.data || [];

  const getSlot = (day, time) => {
    return timetable.find(
      (item) =>
        (item.day || item.dayOfWeek) === day &&
        (item.startTime || item.time) === time
    );
  };

  const isToday = (day) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return today === day;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Weekly Timetable</h1>
        <p className="text-sm text-gray-500 mt-1">View your class schedule</p>
      </div>

      {timetable.length === 0 ? (
        <EmptyState
          icon={<FiCalendar className="w-16 h-16" />}
          title="No timetable available"
          description="Your class schedule has not been set up yet"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                      isToday(day)
                        ? "text-primary-700 bg-primary-50"
                        : "text-gray-500"
                    }`}
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 3)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TIME_SLOTS.map((time) => (
                <tr key={time} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                    {time}
                  </td>
                  {DAYS.map((day) => {
                    const slot = getSlot(day, time);
                    const today = isToday(day);
                    return (
                      <td
                        key={`${day}-${time}`}
                        className={`px-2 py-2 text-center border-l border-gray-50 ${
                          today ? "bg-primary-50/30" : ""
                        }`}
                      >
                        {slot ? (
                          <div className="rounded-lg bg-primary-50 p-2 min-h-[60px] flex flex-col items-center justify-center">
                            <p className="text-xs font-semibold text-primary-800 leading-tight">
                              {slot.subject?.name || slot.subject}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                              {slot.teacher?.name || slot.teacherName}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                              {slot.room || slot.roomNumber || ""}
                            </p>
                          </div>
                        ) : (
                          <div className="min-h-[60px]" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
