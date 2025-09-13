"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, Clock } from "lucide-react";

// ✅ Convert UTC string → IST date + time
const getISTDateTime = (utcString) => {
  const dateObj = new Date(utcString);
  const options = { timeZone: "Asia/Kolkata", hour12: false };
  const parts = new Intl.DateTimeFormat("en-GB", {
    ...options,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(dateObj);

  const day = parts.find((p) => p.type === "day").value;
  const month = parts.find((p) => p.type === "month").value;
  const year = parts.find((p) => p.type === "year").value;
  const hour = parts.find((p) => p.type === "hour").value;
  const minute = parts.find((p) => p.type === "minute").value;

  return { date: `${year}-${month}-${day}`, time: `${hour}:${minute}` };
};

// ✅ Convert IST date + time → UTC string
const toUTC = (date, time) => {
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  const istDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  istDate.setMinutes(istDate.getMinutes() - 330); // IST → UTC
  return istDate.toISOString();
};

export default function EditQuietHour() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // Fetch quiet hour by ID
  useEffect(() => {
    const fetchQuietHour = async () => {
      const { data, error } = await supabase
        .from("quiet_hours")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        const startIST = getISTDateTime(data.start_time);
        const endIST = getISTDateTime(data.end_time);

        setStartDate(startIST.date);
        setStartTime(startIST.time);
        setEndDate(endIST.date);
        setEndTime(endIST.time);
      }

      setLoading(false);
    };

    fetchQuietHour();
  }, [params.id]);

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    const startUTC = toUTC(startDate, startTime);
    const endUTC = toUTC(endDate, endTime);

    const { error } = await supabase
      .from("quiet_hours")
      .update({ start_time: startUTC, end_time: endUTC })
      .eq("id", params.id);

    if (!error) router.push("/dashboard");
    else alert("Error updating quiet hour");
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-[70vw]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Clock className="text-blue-600" /> Edit Quiet Hour
            </h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-md"
            >
              <ArrowLeft size={18} /> Back to Dashboard
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="flex flex-col gap-6">
            {/* Start Date + Time */}
            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-gray-700 font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-gray-700 font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* End Date + Time */}
            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-gray-700 font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-gray-700 font-medium mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Update Button */}
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition shadow-md w-full"
            >
              Update Quiet Hour
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
