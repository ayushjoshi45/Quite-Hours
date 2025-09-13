"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        router.push("/dashboard"); // ✅ redirect logged-in user
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="text-4xl font-bold text-green-700 mb-6">Quiet Hours</h1>
      <p className="text-gray-600 mb-8">
        Manage your focused time without interruptions ⏳
      </p>
      <div className="space-x-4">
        <button
          onClick={() => router.push("/login")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/signup")}
          className="bg-gray-200 text-green-700 px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
