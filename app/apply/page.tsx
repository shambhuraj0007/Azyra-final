"use client";
import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, ArrowRight, CheckCircle2,
  Users, Sparkles, TrendingUp, Link as LinkIcon, ScanBarcode
} from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
}

export default function CreatorApply() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    displayName: "",
    handle: "",
    niche: "",
    bio: "",
    country: "",
    audienceSize: "",
    contactEmail: "",
    sampleUrls: "",
  });

  const [platform, setPlatform] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [links, setLinks] = useState<SocialLink[]>([]);

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // --- DERIVED STATE (GAMIFICATION) --- //
  const numericAudience = parseInt(form.audienceSize) || 0;

  const creatorTier = useMemo(() => {
    if (numericAudience >= 100000) return { name: "ELITE PARTNER", color: "from-purple-500 to-indigo-500", text: "text-purple-300" };
    if (numericAudience >= 10000) return { name: "PRO CREATOR", color: "from-[#D9F950] to-emerald-500", text: "text-[#D9F950]" };
    if (numericAudience > 0) return { name: "RISING STAR", color: "from-blue-400 to-cyan-500", text: "text-blue-300" };
    return { name: "VIP GUEST", color: "from-gray-500 to-gray-700", text: "text-gray-300" };
  }, [numericAudience]);

  // Generate initials for the avatar placeholder
  const initials = form.displayName
    ? form.displayName.substring(0, 2).toUpperCase()
    : "ID";

  useEffect(() => {
    if (session?.user?.email && !form.contactEmail) {
      setForm(f => ({ ...f, contactEmail: session.user.email as string }));
    }
  }, [session, form.contactEmail]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-white font-mono bg-[#0B0F10]">Loading session...</div>;
  if (!session) {
    router.push("/login");
    return null;
  }

  const handleAddLink = () => {
    if (!platform || !platformUrl) return;
    setLinks(prev => [...prev, { platform, url: platformUrl }]);
    setPlatform("");
    setPlatformUrl("");
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return setError("You must agree to the terms.");
    if (links.length === 0) return setError("At least one primary platform link is required.");

    const payload = {
      ...form,
      links,
      sampleUrls: form.sampleUrls.split(",").map(s => s.trim()).filter(Boolean)
    };

    const res = await fetch("/api/creator/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setSuccess(true);

      const searchParams = new URLSearchParams(window.location.search);
      const joinParam = searchParams.get('join');
      const redirectParam = searchParams.get('redirect');

      // If we need to join a campaign, go there, else home
      const finalDest = redirectParam ? redirectParam : (joinParam ? `/campaigns/${joinParam}` : '/');

      setTimeout(() => {
        window.location.href = finalDest;
      }, 2000);
    } else {
      const data = await res.json();
      setError(data.error || "Application failed");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F10] text-gray-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500 relative z-10">
          <ShieldCheck className="h-24 w-24 text-[#D9F950] mx-auto drop-shadow-[0_0_15px_rgba(217,249,80,0.5)]" />
          <h1 className="text-4xl font-bold font-mono tracking-tighter uppercase">Pass Secured</h1>
          <p className="text-gray-400 text-lg">Your VIP creator profile is in the queue for manual verification.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F10] text-gray-100 py-12 px-4 font-sans selection:bg-[#D9F950] selection:text-black">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start">

        {/* LEFT COLUMN: SUPERSTAR ID CARD */}
        <div className="w-full lg:w-[400px] xl:w-[420px] lg:sticky lg:top-12 flex flex-col items-center perspective-1000">
          <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> VIP Access Pass
          </h3>

          {/* THE PHYSICAL BADGE DESIGN */}
          <div className="w-full max-w-[380px] aspect-[2/3.2] bg-gradient-to-b from-[#1A1E23] to-[#0A0D0F] rounded-3xl border-2 border-gray-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col transform transition-transform hover:rotate-y-2 hover:rotate-x-2 duration-300">

            {/* Lanyard Punch Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#0B0F10] rounded-full border border-gray-800 shadow-inner z-20"></div>

            {/* Holographic Overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-[#D9F950]/10 pointer-events-none"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#D9F950] opacity-[0.04] rounded-full blur-3xl"></div>

            {/* Card Header */}
            {/* Card Header */}
            <div className={`h-32 w-full bg-gradient-to-r ${creatorTier.color} flex items-start justify-center pt-10 relative`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <h2 className="text-black font-black tracking-widest uppercase text-xl relative z-10 drop-shadow-md">
                {creatorTier.name}
              </h2>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 flex flex-col relative z-10">

              {/* Avatar Section */}
              <div className="flex justify-center -mt-16 mb-4">
                <div className="w-24 h-24 rounded-2xl bg-[#0B0F10] border-4 border-[#1A1E23] shadow-xl flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>
                  <span className="text-3xl font-black text-white relative z-10">{initials}</span>
                </div>
              </div>

              {/* Creator Info */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-black text-white tracking-tight uppercase line-clamp-1">
                  {form.displayName || "CREATOR NAME"}
                </h1>
                <p className={`font-mono text-sm mt-1 ${creatorTier.text}`}>
                  @{form.handle || "handle"}
                </p>
                {form.niche && (
                  <div className="mt-3 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono tracking-widest text-gray-300 uppercase">
                    {form.niche}
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-4"></div>

              {/* Stats & Details */}
              <div className="grid grid-cols-2 gap-4 text-center mt-auto">
                <div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Audience</p>
                  <p className="text-lg font-bold text-white font-mono">
                    {numericAudience > 0 ? new Intl.NumberFormat('en-US', { notation: "compact" }).format(numericAudience) : "---"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Region</p>
                  <p className="text-lg font-bold text-white font-mono">
                    {form.country ? form.country.substring(0, 3).toUpperCase() : "---"}
                  </p>
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="mt-8 flex flex-col items-center justify-center opacity-40">
                <ScanBarcode className="w-full h-12" strokeWidth={1} />
                <p className="text-[8px] font-mono tracking-widest mt-2">AZYRA-MKT-{Math.floor(Math.random() * 9000) + 1000}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE FORM */}
        <div className="flex-1 bg-[#121619] p-8 rounded-3xl border border-gray-800 shadow-2xl z-10 w-full">
          <div className="mb-8 border-b border-gray-800 pb-6">
            <h1 className="text-3xl font-bold mb-2">Claim Your Pass</h1>
            <p className="text-gray-400 text-sm">Join the Azyra Creator Marketplace. Fill out the details below to generate your VIP profile. All profiles are manually verified by our team.</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-900/20 text-red-400 border border-red-900/50 rounded-xl text-sm font-mono">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Display Name *</label>
                <input required type="text" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} className="w-full bg-[#1A1E23] border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Public Handle *</label>
                <input required type="text" value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} placeholder="e.g. mrbeast" className="w-full bg-[#1A1E23] border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Niche / Category *</label>
                <input required type="text" value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} placeholder="e.g. Tech, Fashion, Gaming" className="w-full bg-[#1A1E23] border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Country *</label>
                <input required type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full bg-[#1A1E23] border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Short Bio *</label>
              <textarea required value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell brands what makes your content unique..." className="w-full bg-[#1A1E23] border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] h-24 resize-none transition-colors"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Total Audience Size *</label>
                <input required type="number" value={form.audienceSize} onChange={e => setForm({ ...form, audienceSize: e.target.value })} placeholder="e.g. 150000" className="w-full bg-[#1A1E23] border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Contact Email *</label>
                <input required type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} className="w-full bg-[#1A1E23] border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] transition-colors" />
              </div>
            </div>

            {/* MANUAL PLATFORM CONNECTION */}
            <div className="bg-[#1A1E23] p-6 rounded-2xl border border-gray-800 relative">
              <label className="block text-sm font-semibold text-gray-200 mb-1">Link Primary Platforms *</label>
              <p className="text-xs text-gray-400 mb-4">Provide the exact URLs to your main social media accounts for verification.</p>

              <div className="flex flex-col sm:flex-row gap-3 mb-4 relative z-10">
                <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-[#0B0F10] border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] text-gray-200 w-full sm:w-[150px]">
                  <option value="">Platform</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option>
                  <option value="X">X (Twitter)</option>
                  <option value="Twitch">Twitch</option>
                </select>
                <input type="url" value={platformUrl} onChange={e => setPlatformUrl(e.target.value)} placeholder="https://..." className="flex-1 bg-[#0B0F10] border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] text-gray-200" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLink())} />
                <button type="button" onClick={handleAddLink} disabled={!platform || !platformUrl} className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 transition-colors">
                  Add Link
                </button>
              </div>

              {links.length > 0 && (
                <div className="space-y-2 mt-4">
                  {links.map((link, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F10] border border-gray-800 group">
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-4 h-4 text-[#D9F950]" />
                        <div>
                          <p className="text-sm font-bold text-gray-200">{link.platform}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">{link.url}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeLink(i)} className="text-gray-600 hover:text-red-400 text-xs font-mono uppercase tracking-wider px-2 py-1">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Sample Content URLs (Optional)</label>
              <input type="text" value={form.sampleUrls} onChange={e => setForm({ ...form, sampleUrls: e.target.value })} placeholder="Comma separated links to your best posts" className="w-full bg-[#1A1E23] border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D9F950] transition-colors" />
            </div>

            <label className="flex items-start gap-4 mt-8 cursor-pointer p-5 bg-[#1A1E23]/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <input type="checkbox" required checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 h-5 w-5 rounded border-gray-700 text-[#D9F950] focus:ring-[#D9F950] focus:ring-offset-[#0B0F10] bg-[#0B0F10]" />
              <span className="text-sm text-gray-400 leading-relaxed">
                I confirm that all information provided is accurate and belongs to me. I agree to the Creator Marketplace Terms of Service and understand my profile requires manual verification.
              </span>
            </label>

            <button type="submit" className="w-full mt-6 bg-[#D9F950] text-[#0B0F10] font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2 hover:brightness-110 transition shadow-[0_0_20px_rgba(217,249,80,0.15)] group">
              Submit  Application <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}