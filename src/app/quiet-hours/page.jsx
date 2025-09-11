"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function QuietHoursPage() {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [quietHours, setQuietHours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user's quiet hours
  const fetchQuietHours = async () => {
    const session = await supabase.auth.getSession();
    const user = session.data.session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("quiet_hours")
      .select("*")
      .eq("user_id", user.id)
      .order("start_time", { ascending: true });

    if (error) return console.error(error.message);
    setQuietHours(data);
  };

  useEffect(() => {
    fetchQuietHours().then(() => setLoading(false));
  }, []);

  // Check overlap
  const isOverlapping = (newStart, newEnd) => {
    const newStartDate = new Date(newStart);
    const newEndDate = new Date(newEnd);

    return quietHours.some((qh) => {
      const existingStart = new Date(qh.start_time);
      const existingEnd = new Date(qh.end_time);
      return newStartDate < existingEnd && newEndDate > existingStart;
    });
  };

  // Add quiet hour
  const handleAddQuietHour = async (e) => {
    e.preventDefault();

    if (!startDate || !startTime || !endDate || !endTime)
      return alert("Please fill all fields.");

    const startDateTime = `${startDate}T${startTime}`;
    const endDateTime = `${endDate}T${endTime}`;

    if (new Date(startDateTime) >= new Date(endDateTime))
      return alert("End time must be after start time.");

    if (isOverlapping(startDateTime, endDateTime)) {
      return alert("This time block overlaps with an existing quiet hour!");
    }

    const session = await supabase.auth.getSession();
    const user = session.data.session?.user;
    if (!user) return alert("User not authenticated.");

    const { error } = await supabase.from("quiet_hours").insert([
      {
        user_id: user.id,
        start_time: startDateTime,
        end_time: endDateTime,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Quiet hour added successfully!");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      fetchQuietHours();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Quiet Hours Scheduler
        </h1>

        {/* Form */}
        <form
          onSubmit={handleAddQuietHour}
          className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg space-y-4 border border-gray-200"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition duration-200"
          >
            Add Quiet Hour
          </button>
        </form>

        {/* List of quiet hours */}
        <div className="mt-8 w-full max-w-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Your Quiet Hours
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : quietHours.length === 0 ? (
            <p className="text-gray-600">No quiet hours set.</p>
          ) : (
            <ul className="space-y-2">
              {quietHours.map((qh) => (
                <li
                  key={qh.id}
                  className="bg-gray-100 border border-gray-300 rounded-lg p-3 flex justify-between"
                >
                  <span>
                    {new Date(qh.start_time).toLocaleString()} →{" "}
                    {new Date(qh.end_time).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
