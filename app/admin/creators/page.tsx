"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminCreators() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/creators")
      .then(res => {
        if (res.status === 403) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.creators) {
          setCreators(data.creators);
        }
        setLoading(false);
      });
  }, [router]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    let reason = "";
    if (action === "reject") {
      const input = prompt("Reason for rejection:");
      if (input === null) return;
      reason = input;
    }

    const res = await fetch("/api/admin/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId: id, action, reason })
    });

    if (res.ok) {
      setCreators(creators.filter(c => c._id !== id));
    } else {
      alert("Action failed");
    }
  };

  if (loading) return <div className="p-10 text-white font-mono">Loading...</div>;

  return (
    <div className="min-h-screen bg-canvas text-textMain p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-borderMuted pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-950/40 rounded-lg text-red-500 border border-red-900/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-textMain">Pending Creator Approvals</h1>
          </div>
          <span className="font-mono text-sm bg-surfaceElevated px-3 py-1 rounded-full border border-borderMuted">
            {creators.length} Pending
          </span>
        </header>

        {creators.length === 0 ? (
          <div className="text-center py-20 text-textMuted flex flex-col items-center">
            <Check className="h-12 w-12 text-emeraldAccent/40 mb-4" />
            <p>No pending approvals. Queue is clear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {creators.map(c => (
              <div key={c._id} className="bg-surface border border-borderMuted rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-lg font-heading font-bold">{c.profile?.displayName || "No Name"}</h2>
                    <span className="text-sm font-mono text-limeAccent">@{c.handle}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-textMuted block uppercase">Email</span>
                      <span className="text-textMain">{c.email}</span>
                    </div>
                    <div>
                      <span className="text-textMuted block uppercase">Country</span>
                      <span className="text-textMain">{c.profile?.country || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-textMuted block uppercase">Niche</span>
                      <span className="text-textMain">{c.profile?.niche || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-textMuted block uppercase">Audience</span>
                      <span className="text-textMain">{c.profile?.audienceSize?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-sm text-textMuted">
                    <strong className="text-textMain block mb-1">Bio:</strong>
                    {c.profile?.bio || "No bio"}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {c.profile?.links?.map((l: any, i: number) => (
                      <a key={i} href={l.url} target="_blank" className="px-2 py-1 bg-surfaceElevated border border-borderMuted rounded text-xs hover:text-limeAccent">
                        {l.platform}
                      </a>
                    ))}
                    {c.profile?.proofUrl && (
                      <a href={c.profile.proofUrl} target="_blank" className="px-2 py-1 bg-limeAccent/10 border border-limeAccent/30 text-limeAccent rounded text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> View Proof
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                  <button onClick={() => handleAction(c._id, "approve")} className="flex-1 md:flex-none px-6 py-2.5 bg-emeraldAccent text-[#0B0F10] font-bold rounded-xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button onClick={() => handleAction(c._id, "reject")} className="flex-1 md:flex-none px-6 py-2.5 bg-red-950 text-red-400 font-bold rounded-xl border border-red-900/50 hover:bg-red-900 flex items-center justify-center gap-2">
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
