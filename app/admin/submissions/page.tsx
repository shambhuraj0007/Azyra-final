"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  ShieldCheck,
  Video,
  ExternalLink,
  CheckCircle2,
  Clock,
  LogOut,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";

interface Submission {
  id: string;
  campaign_id: string;
  campaign_title: string;
  creator_id: string;
  creator_name: string;
  video_url: string;
  platform: string;
  initial_view_count: number;
  current_view_count: number;
  earned_amount: number;
  verification_status: "verifying" | "active" | "flagged_bot" | "paid";
  submitted_at: number;
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [counts, setCounts] = useState({ verifying: 0, active: 0, flagged_bot: 0, paid: 0, all: 0 });
  const [activeTab, setActiveTab] = useState<"verifying" | "active" | "flagged_bot" | "paid" | "all">("verifying");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchSubmissions = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?status=${status}`);
      if (res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data && data.submissions) {
        setSubmissions(data.submissions);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (e) {
      console.error("Failed to load submissions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(activeTab);
  }, [activeTab]);

  const handleAction = async (id: string, action: "approve" | "flag" | "pay") => {
    let reason = "";
    if (action === "flag") {
      const input = prompt("Enter reason for flagging (optional):");
      if (input === null) return;
      reason = input.trim();
    }

    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id, action, reason }),
      });

      if (res.ok) {
        await fetchSubmissions(activeTab);
      } else {
        alert("Action failed to execute. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error processing submission action.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-canvas text-textMain p-4 md:p-8 font-sans selection:bg-limeAccent selection:text-black">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-borderMuted pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950/40 rounded-xl text-red-400 border border-red-900/40 shadow-inner">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-textMain tracking-tight">
                Submission Gateway
              </h1>
              <p className="text-sm text-textMuted flex items-center gap-2 mt-1">
                Admin Secure Portal v2.0
                <span className="w-1.5 h-1.5 rounded-full bg-emeraldAccent animate-pulse" />
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/admin/creators" className="px-4 py-2 bg-surfaceElevated hover:bg-surface border border-borderMuted rounded-lg text-sm font-semibold transition">
              Creators
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-900/40 rounded-lg text-sm font-semibold transition"
            >
              <LogOut className="h-4 w-4" />
              Exit Portal
            </button>
          </div>
        </header>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface border border-borderMuted p-4 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2 relative">
              <p className="text-sm font-medium text-textMuted uppercase tracking-wider">Verifying</p>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-3xl font-mono font-bold text-textMain relative">{counts.verifying}</h2>
          </div>
          
          <div className="bg-surface border border-borderMuted p-4 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2 relative">
              <p className="text-sm font-medium text-textMuted uppercase tracking-wider">Active</p>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-mono font-bold text-textMain relative">{counts.active}</h2>
          </div>

          <div className="bg-surface border border-borderMuted p-4 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2 relative">
              <p className="text-sm font-medium text-textMuted uppercase tracking-wider">Flagged</p>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-3xl font-mono font-bold text-textMain relative">{counts.flagged_bot}</h2>
          </div>
          
          <div className="bg-surface border border-borderMuted p-4 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2 relative">
              <p className="text-sm font-medium text-textMuted uppercase tracking-wider">Total</p>
              <Video className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-3xl font-mono font-bold text-textMain relative">{counts.all}</h2>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["verifying", "active", "flagged_bot", "paid", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all duration-200 border ${
                activeTab === tab
                  ? "bg-textMain text-black border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "bg-surface text-textMuted border-borderMuted hover:border-textMuted/50 hover:text-textMain"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="bg-surface border border-borderMuted rounded-2xl overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-textMuted">
              <div className="w-8 h-8 border-4 border-textMuted/20 border-t-limeAccent rounded-full animate-spin mb-4" />
              <p className="font-mono text-sm animate-pulse">Scanning database...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-textMuted space-y-3">
              <div className="p-4 bg-surfaceElevated rounded-full">
                <Video className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-lg font-medium">No submissions found</p>
              <p className="text-sm">Queue is currently clear for this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-borderMuted">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-6 hover:bg-surfaceElevated/50 transition-colors flex flex-col md:flex-row justify-between gap-6 group">
                  
                  {/* Info Column */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-textMain">{sub.creator_name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            sub.verification_status === "active" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/50" :
                            sub.verification_status === "flagged_bot" ? "bg-red-950/60 text-red-400 border border-red-900/50" :
                            sub.verification_status === "paid" ? "bg-blue-950/60 text-blue-400 border border-blue-900/50" :
                            "bg-amber-950/60 text-amber-400 border border-amber-900/50"
                          }`}>
                            {sub.verification_status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-textMuted flex items-center gap-2">
                          {sub.campaign_title}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/20 rounded-xl border border-borderMuted/50">
                      <div>
                        <p className="text-[10px] uppercase text-textMuted font-bold mb-1">Platform</p>
                        <p className="text-sm font-medium">{sub.platform}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-textMuted font-bold mb-1">Views</p>
                        <p className="text-sm font-medium font-mono">{sub.current_view_count.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-textMuted font-bold mb-1">Earned</p>
                        <p className="text-sm font-medium text-emeraldAccent font-mono">${sub.earned_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-textMuted font-bold mb-1">Submitted</p>
                        <p className="text-sm font-medium">{new Date(sub.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col items-end justify-between gap-4 md:border-l md:border-borderMuted md:pl-6">
                    <a
                      href={sub.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-limeAccent hover:text-white transition"
                    >
                      View Clip <ExternalLink className="h-4 w-4" />
                    </a>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                      {(activeTab === "verifying" || activeTab === "flagged_bot") && (
                        <>
                          <button
                            onClick={() => handleAction(sub.id, "approve")}
                            disabled={processingId === sub.id}
                            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(sub.id, "flag")}
                            disabled={processingId === sub.id}
                            className="flex-1 md:flex-none px-4 py-2 bg-surface hover:bg-red-950/40 text-red-400 border border-red-900/40 hover:border-red-500/50 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <X className="h-4 w-4" /> Flag
                          </button>
                        </>
                      )}
                      
                      {activeTab === "active" && (
                        <button
                          onClick={() => handleAction(sub.id, "pay")}
                          disabled={processingId === sub.id}
                          className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Mark Paid
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
