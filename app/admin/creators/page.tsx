"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Copy,
  CheckCircle2,
  Globe,
  Mail,
  Users,
  Sparkles,
  Clock,
  Search,
  LogOut,
  Building2,
  CreditCard,
  Layers,
  RefreshCw,
  Share2,
} from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
  _id?: string;
}

interface Creator {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  handle?: string;
  creatorStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  wallet_balance?: number;
  profile?: {
    displayName?: string;
    niche?: string;
    bio?: string;
    country?: string;
    audienceSize?: number;
    contactEmail?: string;
    links?: SocialLink[];
    sampleUrls?: string[];
    proofUrl?: string;
    payoutMethod?: {
      type: "stripe" | "paypal" | "crypto" | "bank";
      accountIdentifier?: string;
      isVerified?: boolean;
      bankDetails?: {
        bankName?: string;
        accountHolderName?: string;
        accountNumber?: string;
        routingNumber?: string;
        accountType?: "checking" | "savings";
      };
    };
  };
}

export default function AdminCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchCreators = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/creators?status=${status}`);
      if (res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data && data.creators) {
        setCreators(data.creators);
        if (data.counts) {
          setCounts(data.counts);
          // Auto switch to "approved" or "all" tab if pending is 0 and active tab was pending
          if (status === "pending" && data.creators.length === 0 && data.counts.approved > 0) {
            // Keep pending as view or user can click
          }
        }
      }
    } catch (e) {
      console.error("Failed to load creators:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators(activeTab);
  }, [activeTab]);

  const handleAction = async (id: string, action: "approve" | "reject" | "pending") => {
    let reason = "";
    if (action === "reject") {
      const input = prompt("Enter reason for rejection (optional):");
      if (input === null) return;
      reason = input.trim();
    }

    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: id, action, reason }),
      });

      if (res.ok) {
        await fetchCreators(activeTab);
      } else {
        alert("Action failed to execute. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error processing creator action.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // Filter creators by search query
  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return creators;
    const q = searchQuery.toLowerCase();
    return creators.filter((c) => {
      const name = c.profile?.displayName?.toLowerCase() || "";
      const handle = c.handle?.toLowerCase() || "";
      const email = c.email?.toLowerCase() || "";
      const niche = c.profile?.niche?.toLowerCase() || "";
      const country = c.profile?.country?.toLowerCase() || "";
      return name.includes(q) || handle.includes(q) || email.includes(q) || niche.includes(q) || country.includes(q);
    });
  }, [creators, searchQuery]);

  const getTierBadge = (audience: number = 0) => {
    if (audience >= 100000) {
      return { name: "ELITE PARTNER", color: "bg-purple-950/60 border-purple-500/40 text-purple-300" };
    }
    if (audience >= 10000) {
      return { name: "PRO CREATOR", color: "bg-lime-950/60 border-limeAccent/40 text-limeAccent" };
    }
    if (audience > 0) {
      return { name: "RISING STAR", color: "bg-cyan-950/60 border-cyan-500/40 text-cyan-300" };
    }
    return { name: "CREATOR", color: "bg-surfaceElevated border-borderMuted text-textMuted" };
  };

  const getPlatformColor = (platform: string = "") => {
    const p = platform.toLowerCase();
    if (p.includes("instagram")) return "bg-pink-950/40 text-pink-300 border-pink-700/40";
    if (p.includes("youtube")) return "bg-red-950/40 text-red-300 border-red-700/40";
    if (p.includes("tiktok")) return "bg-teal-950/40 text-teal-300 border-teal-700/40";
    if (p.includes("x") || p.includes("twitter")) return "bg-sky-950/40 text-sky-300 border-sky-700/40";
    if (p.includes("twitch")) return "bg-purple-950/40 text-purple-300 border-purple-700/40";
    return "bg-surfaceElevated text-limeAccent border-borderMuted";
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
                Creator Verification Gateway
              </h1>
              <p className="text-xs font-mono text-textMuted mt-0.5">
                AZYRA Admin Security Portal • Authenticated Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => fetchCreators(activeTab)}
              title="Refresh queue"
              className="p-2 bg-surfaceElevated border border-borderMuted rounded-xl text-textMuted hover:text-textMain hover:border-limeAccent transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 bg-surfaceElevated hover:bg-red-950/50 text-textMuted hover:text-red-300 border border-borderMuted hover:border-red-900/40 rounded-xl text-xs font-mono transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* CONTROLS BAR: TABS & SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-2 rounded-2xl border border-borderMuted">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1">
            {[
              { id: "pending", label: "Pending", count: counts.pending, color: "text-amber-400" },
              { id: "approved", label: "Approved", count: counts.approved, color: "text-emerald-400" },
              { id: "rejected", label: "Rejected", count: counts.rejected, color: "text-red-400" },
              { id: "all", label: "All Creators", count: counts.all, color: "text-textMuted" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-surfaceElevated text-limeAccent border border-borderMuted shadow-sm"
                    : "text-textMuted hover:text-textMain"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-canvas/80 border border-borderMuted ${tab.color}`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-72 px-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
            <input
              type="text"
              placeholder="Search by handle, email, niche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-canvas border border-borderMuted rounded-xl pl-9 pr-4 py-2 text-xs text-textMain placeholder:text-textMuted/60 focus:border-limeAccent outline-none font-mono transition"
            />
          </div>
        </div>

        {/* CREATORS LIST */}
        {loading ? (
          <div className="p-16 text-center text-textMuted font-mono flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-limeAccent" />
            <p className="text-xs uppercase tracking-wider">Fetching applications...</p>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-borderMuted rounded-3xl flex flex-col items-center justify-center p-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-surfaceElevated flex items-center justify-center text-textMuted border border-borderMuted">
              <Check className="h-7 w-7 text-emerald-400/60" />
            </div>
            <h3 className="font-heading font-bold text-lg text-textMain">No Creators Found</h3>
            <p className="text-xs text-textMuted max-w-sm">
              {activeTab === "pending"
                ? "No pending approvals waiting in queue! Switch to the 'Approved' tab to review verified creators."
                : `No creator accounts matched the current filter (${activeTab}).`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCreators.map((c) => {
              const tier = getTierBadge(c.profile?.audienceSize);
              const initials = (c.profile?.displayName || c.name || c.handle || "CR")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={c._id}
                  className="bg-surface border border-borderMuted rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6 relative transition hover:border-borderMuted/80"
                >
                  {/* TOP ROW: PROFILE HEADER & ACTIONS */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-borderMuted pb-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.profile?.displayName || "Creator"}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-borderMuted bg-surfaceElevated shrink-0 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A2326] to-[#0E1315] border-2 border-borderMuted flex items-center justify-center font-heading font-bold text-limeAccent text-lg shrink-0 shadow-md">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-heading font-bold text-textMain tracking-tight">
                            {c.profile?.displayName || c.name || "Unnamed Creator"}
                          </h2>
                          <span className="text-sm font-mono text-limeAccent font-bold">
                            @{c.handle || "no_handle"}
                          </span>

                          {/* Status Badge */}
                          {c.creatorStatus === "approved" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" /> VERIFIED
                            </span>
                          )}
                          {c.creatorStatus === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/60 border border-amber-500/40 text-amber-300">
                              <Clock className="h-3 w-3" /> PENDING REVIEW
                            </span>
                          )}
                          {c.creatorStatus === "rejected" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950/60 border border-red-500/40 text-red-300">
                              <X className="h-3 w-3" /> REJECTED
                            </span>
                          )}

                          {/* Tier Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${tier.color}`}
                          >
                            <Sparkles className="h-2.5 w-2.5" />
                            {tier.name}
                          </span>
                        </div>

                        {c.name && c.name !== c.profile?.displayName && (
                          <p className="text-xs text-textMuted mt-0.5">
                            Account Legal Name: <span className="text-textMain font-medium">{c.name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
                      {c.creatorStatus === "pending" && (
                        <>
                          <button
                            disabled={processingId === c._id}
                            onClick={() => handleAction(c._id, "approve")}
                            className="px-5 py-2.5 bg-emeraldAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold text-xs rounded-xl shadow-lg shadow-emeraldAccent/20 flex items-center gap-2 transition disabled:opacity-50 active:scale-[0.98]"
                          >
                            <Check className="h-4 w-4" />
                            <span>Approve Creator</span>
                          </button>
                          <button
                            disabled={processingId === c._id}
                            onClick={() => handleAction(c._id, "reject")}
                            className="px-4 py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 font-heading font-bold text-xs rounded-xl border border-red-800/40 flex items-center gap-2 transition disabled:opacity-50 active:scale-[0.98]"
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {c.creatorStatus === "approved" && (
                        <>
                          <button
                            disabled={processingId === c._id}
                            onClick={() => handleAction(c._id, "pending")}
                            className="px-3.5 py-2 bg-surfaceElevated hover:bg-surface border border-borderMuted text-textMuted hover:text-amber-400 font-mono text-xs rounded-xl transition"
                          >
                            Move to Pending
                          </button>
                          <button
                            disabled={processingId === c._id}
                            onClick={() => handleAction(c._id, "reject")}
                            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 font-mono text-xs rounded-xl transition"
                          >
                            Revoke Approval
                          </button>
                        </>
                      )}

                      {c.creatorStatus === "rejected" && (
                        <button
                          disabled={processingId === c._id}
                          onClick={() => handleAction(c._id, "approve")}
                          className="px-4 py-2 bg-emeraldAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold text-xs rounded-xl transition"
                        >
                          <Check className="h-3.5 w-3.5 inline mr-1" /> Re-Approve
                        </button>
                      )}
                    </div>
                  </div>

                  {/* REJECTION REASON BANNER (IF REJECTED) */}
                  {c.creatorStatus === "rejected" && c.rejectionReason && (
                    <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-xs text-red-300 flex items-start gap-2 font-mono">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                      <div>
                        <strong>Rejection Reason:</strong> {c.rejectionReason}
                      </div>
                    </div>
                  )}

                  {/* METADATA GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-canvas/60 p-4 rounded-2xl border border-borderMuted text-xs font-mono">
                    <div>
                      <span className="text-textMuted block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Contact Email
                      </span>
                      <a
                        href={`mailto:${c.profile?.contactEmail || c.email}`}
                        className="text-textMain hover:text-limeAccent underline underline-offset-2 break-all"
                      >
                        {c.profile?.contactEmail || c.email}
                      </a>
                    </div>

                    <div>
                      <span className="text-textMuted block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Country / Region
                      </span>
                      <span className="text-textMain font-medium flex items-center gap-1.5 capitalize">
                        <Globe className="h-3.5 w-3.5 text-textMuted" />
                        {c.profile?.country || "Not specified"}
                      </span>
                    </div>

                    <div>
                      <span className="text-textMuted block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Niche / Category
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-surfaceElevated border border-borderMuted rounded text-limeAccent font-medium">
                        {c.profile?.niche || "General"}
                      </span>
                    </div>

                    <div>
                      <span className="text-textMuted block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Total Audience
                      </span>
                      <span className="text-textMain font-bold flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-textMuted" />
                        {c.profile?.audienceSize ? c.profile.audienceSize.toLocaleString() : "0"}
                      </span>
                    </div>
                  </div>

                  {/* BIO SECTION */}
                  {c.profile?.bio && (
                    <div className="bg-surfaceElevated/50 p-4 rounded-2xl border border-borderMuted">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-textMuted font-bold block mb-1.5">
                        Bio & Description
                      </span>
                      <p className="text-xs text-textMain/90 leading-relaxed italic">
                        "{c.profile.bio}"
                      </p>
                    </div>
                  )}

                  {/* SUBMITTED SOCIAL PLATFORM LINKS (CORE REQUEST) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-textMuted font-bold flex items-center gap-1.5">
                        <Share2 className="h-3.5 w-3.5 text-limeAccent" />
                        Submitted Social Profiles & Verification Links
                      </span>
                      <span className="text-[10px] font-mono text-textMuted">
                        {c.profile?.links?.length || 0} link(s) attached
                      </span>
                    </div>

                    {c.profile?.links && c.profile.links.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {c.profile.links.map((link, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-canvas border border-borderMuted hover:border-limeAccent/50 transition group"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              {/* Platform badge */}
                              <span
                                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border shrink-0 ${getPlatformColor(
                                  link.platform
                                )}`}
                              >
                                {link.platform}
                              </span>

                              {/* URL text */}
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={link.url}
                                className="text-xs font-mono text-textMain group-hover:text-limeAccent truncate underline underline-offset-2 transition"
                              >
                                {link.url}
                              </a>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Copy button */}
                              <button
                                type="button"
                                onClick={() => handleCopy(link.url)}
                                title="Copy link"
                                className="p-1.5 text-textMuted hover:text-textMain rounded-lg hover:bg-surfaceElevated transition"
                              >
                                {copiedUrl === link.url ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* Open link button */}
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open in new tab"
                                className="p-1.5 text-textMuted hover:text-limeAccent rounded-lg hover:bg-surfaceElevated transition"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-canvas border border-dashed border-borderMuted rounded-xl text-xs text-textMuted font-mono">
                        No platform links were attached to this application.
                      </div>
                    )}
                  </div>

                  {/* SAMPLE CONTENT POSTS (IF SUBMITTED) */}
                  {c.profile?.sampleUrls && c.profile.sampleUrls.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-textMuted font-bold block">
                        Sample Content / Portfolio URLs
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {c.profile.sampleUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas border border-borderMuted hover:border-limeAccent text-xs font-mono text-textMain hover:text-limeAccent transition"
                          >
                            <ExternalLink className="h-3 w-3 text-limeAccent" />
                            <span className="truncate max-w-[280px]">{url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PROOF URL (IF PROVIDED) */}
                  {c.profile?.proofUrl && (
                    <div className="pt-1">
                      <a
                        href={c.profile.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-limeAccent/10 border border-limeAccent/30 text-limeAccent rounded-xl text-xs font-mono hover:bg-limeAccent/20 transition"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>View Verification Proof Document</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* PAYOUT / BANK DETAILS (IF AVAILABLE) */}
                  {c.profile?.payoutMethod && (
                    <div className="p-4 bg-canvas/80 border border-borderMuted rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-textMuted uppercase">
                        <CreditCard className="h-3.5 w-3.5 text-limeAccent" />
                        <span>Connected Payout Account</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-surfaceElevated border border-borderMuted text-limeAccent uppercase">
                          {c.profile.payoutMethod.type}
                        </span>
                      </div>

                      {c.profile.payoutMethod.type === "bank" && c.profile.payoutMethod.bankDetails && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-1 text-textMuted">
                          <div>
                            <span className="block text-[10px] uppercase">Bank Name</span>
                            <span className="text-textMain font-medium">
                              {c.profile.payoutMethod.bankDetails.bankName || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase">Account Holder</span>
                            <span className="text-textMain font-medium">
                              {c.profile.payoutMethod.bankDetails.accountHolderName || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase">Account Number</span>
                            <span className="text-textMain font-mono font-bold">
                              {c.profile.payoutMethod.bankDetails.accountNumber
                                ? `•••• ${c.profile.payoutMethod.bankDetails.accountNumber.slice(-4)}`
                                : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase">Routing / IFSC</span>
                            <span className="text-textMain font-mono">
                              {c.profile.payoutMethod.bankDetails.routingNumber || "N/A"}
                            </span>
                          </div>
                        </div>
                      )}

                      {c.profile.payoutMethod.accountIdentifier && (
                        <div className="text-xs font-mono text-textMain pt-1">
                          Account ID: <span className="text-limeAccent">{c.profile.payoutMethod.accountIdentifier}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FOOTER TIMESTAMPS */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-borderMuted/60 text-[11px] font-mono text-textMuted">
                    <span>
                      Registered / Applied:{" "}
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : "Unknown"}
                    </span>
                    {c.reviewedAt && (
                      <span>
                        Reviewed on {new Date(c.reviewedAt).toLocaleString()} by{" "}
                        <strong className="text-textMain">{c.reviewedBy || "admin"}</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
