"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, password })
    });

    if (res.ok) {
      router.push("/admin/creators");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-textMain flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl border border-borderMuted shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-3 bg-red-950/40 rounded-xl text-red-500 border border-red-900/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-textMain">Admin Access</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/20 text-red-400 border border-red-900/50 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Admin ID</label>
            <input 
              type="text" 
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
            />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl py-3 mt-4 flex items-center justify-center gap-2 transition">
            <Lock className="h-4 w-4" /> Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}
