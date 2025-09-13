"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Clock, ArrowLeft } from "lucide-react";

export default function QuietHoursPage() {
  const [user, setUser] = useState(null);
  const [quietHours, setQuietHours] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const router = useRouter();

  // get session user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  // fetch quiet hours
  useEffect(() => {
    if (!user) return;
    const fetchQuietHours = async () => {
      const { data, error } = await supabase
        .from("quiet_hours")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });
      if (error) console.error(error.message);
      else setQuietHours(data);
    };
    fetchQuietHours();
  }, [user]);

  // format IST time
  const formatIST = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // handle add quiet hour
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!startDate || !startTime || !endDate || !endTime) {
      alert("Please fill all fields");
      return;
    }

    // build ISO datetime in IST
    const startDateTime = new Date(`${startDate}T${startTime}:00+05:30`);
    const endDateTime = new Date(`${endDate}T${endTime}:00+05:30`);

    const { data, error } = await supabase
      .from("quiet_hours")
      .insert([
        { user_id: user.id, start_time: startDateTime, end_time: endDateTime },
      ])
      .select();

    if (error) {
      alert(error.message);
    } else {
      setQuietHours((prev) => [...prev, data[0]]);
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
    }
    router.push("/dashboard");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="flex items-center justify-between bg-green-600 text-white px-6 py-4 shadow-md">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Clock size={22} /> Quiet Hours
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-lg hover:bg-red-600 transition"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </nav>

        {/* Form */}
        <div className="p-6 flex flex-col items-center">
          <form
            onSubmit={handleAdd}
            className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col gap-4"
            style={{ width: "70vw" }}
          >
            <h2 className="text-lg font-semibold text-gray-700">
              Add Quiet Hour
            </h2>

            {/* Start Date + Time */}
            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium text-gray-600">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium text-gray-600">
                  Start Time (IST)
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* End Date + Time */}
            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium text-gray-600">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium text-gray-600">
                  End Time (IST)
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Save
            </button>
          </form>

          {/* List quiet hours */}
          <div style={{ width: "70vw" }}>
            <ul className="space-y-3">
              {quietHours.length === 0 ? (
                <p className="text-gray-600">No quiet hours set.</p>
              ) : (
                quietHours.map((qh) => (
                  <li
                    key={qh.id}
                    className="p-4 bg-white rounded-xl shadow-md flex justify-between items-center hover:shadow-lg transition"
                  >
                    <span className="text-gray-800 font-medium">
                      From <b>{formatIST(qh.start_time)}</b> <br /> To{" "}
                      <b>{formatIST(qh.end_time)}</b>
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
