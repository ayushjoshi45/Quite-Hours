"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function QuietHoursPage() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [quietHours, setQuietHours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user's quiet hours
  const fetchQuietHours = async () => {
    const { data, error } = await supabase
      .from("quiet_hours")
      .select("*")
      .order("start_time", { ascending: true });
    if (error) return console.error(error.message);
    setQuietHours(data);
  };

  useEffect(() => {
    fetchQuietHours().then(() => setLoading(false));
  }, []);

  // Add new quiet hour
  const handleAddQuietHour = async (e) => {
    e.preventDefault();

    if (!startTime || !endTime) return alert("Please enter both start and end time.");
    if (new Date(startTime) >= new Date(endTime))
      return alert("End time must be after start time.");

    const user = supabase.auth.getSession().then(({ data }) => data.session?.user);
    if (!user) return alert("User not authenticated.");

    const { error } = await supabase.from("quiet_hours").insert([
      {
        user_id: user.id,
        start_time: startTime,
        end_time: endTime,
      },
    ]);

    if (error) {
      alert(error.message); // e.g., overlapping error from trigger
    } else {
      alert("Quiet hour added successfully!");
      setStartTime("");
      setEndTime("");
      fetchQuietHours();
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Add Quiet Hour</h1>

        <form onSubmit={handleAddQuietHour} className="flex flex-col gap-4 mb-6">
          <label>
            Start Time:
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </label>

          <label>
            End Time:
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </label>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Add Quiet Hour
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-2">Your Quiet Hours</h2>
        {loading ? (
          <p>Loading...</p>
        ) : quietHours.length === 0 ? (
          <p>No quiet hours set.</p>
        ) : (
          <ul className="space-y-2">
            {quietHours.map((qh) => (
              <li key={qh.id} className="border p-2 rounded">
                {new Date(qh.start_time).toLocaleString()} -{" "}
                {new Date(qh.end_time).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedRoute>
  );
}
