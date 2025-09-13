"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PlusCircle, LogOut, Edit, Trash2, Clock } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [quietHours, setQuietHours] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchQuietHours = async () => {
      const { data, error } = await supabase
        .from("quiet_hours")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });
      if (!error) setQuietHours(data || []);
    };
    fetchQuietHours();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this quiet hour?")) return;

    const { error } = await supabase
      .from("quiet_hours")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      setQuietHours((prev) => prev.filter((qh) => qh.id !== id));
      alert("Deleted successfully");
    }
  };

  const handleEdit = (id) => router.push(`/quiet-hours/edit/${id}`);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between bg-green-600 text-white px-6 py-4 shadow-md">
          <h1
            onClick={() => router.push("/dashboard")}
            className="text-xl font-bold cursor-pointer"
          >
            🌿 Quiet Hours
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden sm:block text-sm bg-green-700 px-3 py-1 rounded-lg">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
          {/* Add Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Your Quiet Hours
            </h2>
            <button
              onClick={() => router.push("/quiet-hours")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow transition"
            >
              <PlusCircle size={20} /> Add Quiet Hour
            </button>
          </div>

          {/* Quiet Hours List */}
          {quietHours && quietHours.length === 0 ? (
            <div className="text-center mt-16">
              <Clock className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-500 mt-2">
                You haven’t set any quiet hours yet.
              </p>
              <button
                onClick={() => router.push("/quiet-hours")}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Add Your First Quiet Hour
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {quietHours &&
                quietHours.map((qh) => (
                  <div
                    key={qh.id}
                    className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <div className="mb-3">
                      <p className="text-gray-700">
                        <strong>Start:</strong>{" "}
                        {new Date(qh.start_time).toLocaleString()}
                      </p>
                      <p className="text-gray-700">
                        <strong>End:</strong>{" "}
                        {new Date(qh.end_time).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(qh.id)}
                        className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-white transition"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(qh.id)}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white transition"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
