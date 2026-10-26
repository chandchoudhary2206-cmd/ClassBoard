import React from "react";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { FiClock, FiCalendar, FiBookOpen, FiAlertCircle } from "react-icons/fi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getCurrentWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isToday(date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function Calendar() {
  const { data, loading, error } = useFetch("/timetable");

  const weekDates = getCurrentWeekDates();
  const timetable = data?.timetable || data?.data || [];
  const deadlines = data?.deadlines || data?.upcomingDeadlines || [];

  if (loading) return <LoadingSpinner size="lg" message="Loading timetable..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load timetable: {error}
      </div>
    );
  }

  const getDaySchedule = (dayName) => {
    return timetable.filter(
      (item) => (item.day || item.dayOfWeek || "").toLowerCase() === dayName.toLowerCase()
    );
  };

  const groupedByDay = {};
  DAYS.forEach((day) => {
    const entries = getDaySchedule(day);
    if (entries.length > 0) {
      groupedByDay[day] = entries;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Schedule</h1>
        <p className="text-sm text-gray-500 mt-1">
          {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Object.keys(groupedByDay).length === 0 ? (
            <EmptyState
              icon={<FiCalendar className="w-16 h-16" />}
              title="No classes scheduled"
              description="Your timetable has not been set up yet"
            />
          ) : (
            DAYS.filter((d) => groupedByDay[d]).map((day, idx) => {
              const dayDate = weekDates[idx];
              const today = isToday(dayDate);
              return (
                <div
                  key={day}
                  className={`rounded-xl bg-white shadow-sm p-6 ${
                    today ? "ring-2 ring-primary-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-800">{day}</h3>
                      <span className="text-xs text-gray-400">{formatDate(dayDate)}</span>
                    </div>
                    {today && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {groupedByDay[day].map((item, i) => (
                      <div
                        key={item._id || i}
                        className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex flex-col items-center justify-center w-16 h-14 rounded-lg bg-primary-50 text-primary-600 text-sm font-bold leading-tight">
                          <span>{item.startTime || item.time}</span>
                          <span className="text-[10px] font-normal text-primary-400">to</span>
                          <span>{item.endTime}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">
                            {item.subject?.name || item.subjectName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.class?.name || item.className} - Section{" "}
                            {item.section?.name || item.sectionName || item.section}
                          </p>
                        </div>
                        {item.room && (
                          <span className="text-xs text-gray-400 shrink-0">
                            Room {item.room}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 text-amber-500" />
              Upcoming Deadlines
            </h2>
            {deadlines.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {deadlines.map((dl, i) => (
                  <div
                    key={dl._id || i}
                    className="p-3 rounded-lg border border-amber-200 bg-amber-50"
                  >
                    <div className="flex items-start gap-2">
                      <FiBookOpen className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {dl.title || dl.assignment?.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {dl.class?.name || dl.className} -{" "}
                          {dl.subject?.name || dl.subjectName}
                        </p>
                        <p className="text-xs text-amber-600 font-medium mt-1">
                          Due: {dl.dueDate ? new Date(dl.dueDate).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-primary-500" />
              Weekly Summary
            </h2>
            <div className="space-y-2">
              {Object.entries(groupedByDay).map(([day, entries]) => (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{day.slice(0, 3)}</span>
                  <span className="text-gray-800 font-medium">{entries.length} class{entries.length > 1 ? "es" : ""}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 mt-2">
                <span className="text-gray-800 font-semibold">Total</span>
                <span className="text-gray-800 font-semibold">
                  {Object.values(groupedByDay).reduce((sum, e) => sum + e.length, 0)} classes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
