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

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-textMain font-mono bg-canvas">Loading session...</div>;
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
      <div className="min-h-screen bg-canvas text-textMain flex items-center justify-center relative overflow-hidden">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500 relative z-10 p-6 card-terminal max-w-md mx-auto">
          <ShieldCheck className="h-16 w-16 text-limeAccent mx-auto" />
          <h1 className="text-2xl font-bold font-heading uppercase text-textMain">Pass Secured</h1>
          <p className="text-textMuted text-sm">Your VIP creator profile is in the queue for manual verification.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-textMain py-8 sm:py-12 px-3.5 sm:px-4 font-sans selection:bg-limeAccent selection:text-black">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

        {/* LEFT COLUMN: SUPERSTAR ID CARD */}
        <div className="w-full lg:w-[400px] xl:w-[420px] lg:sticky lg:top-12 flex flex-col items-center perspective-1000 order-2 lg:order-1">
          <h3 className="text-xs font-mono text-textMuted uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-limeAccent" /> Live VIP Access Pass Preview
          </h3>

          {/* THE PHYSICAL BADGE DESIGN */}
          <div className="w-full max-w-[380px] aspect-[2/3.2] bg-gradient-to-b from-[#1A1E23] to-[#0A0D0F] rounded-2xl border border-borderStrong shadow-xl relative overflow-hidden flex flex-col">

            {/* Lanyard Punch Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#090A0C] rounded-full border border-white/10 shadow-inner z-20"></div>

            {/* Holographic Overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-limeAccent/5 via-transparent to-iceBlue/5 pointer-events-none"></div>

            {/* Card Header */}
            <div className={`h-32 w-full bg-gradient-to-r ${creatorTier.color} flex items-start justify-center pt-10 relative`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <h2 className="text-black font-black tracking-widest uppercase text-lg relative z-10 drop-shadow-md font-heading">
                {creatorTier.name}
              </h2>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 flex flex-col relative z-10 text-white">

              {/* Avatar Section */}
              <div className="flex justify-center -mt-16 mb-4">
                <div className="w-20 h-20 rounded-xl bg-[#090A0C] border-2 border-[#1A1E23] shadow-xl flex items-center justify-center overflow-hidden relative">
                  <span className="text-2xl font-black text-white relative z-10 font-heading">{initials}</span>
                </div>
              </div>

              {/* Creator Info */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white tracking-tight uppercase line-clamp-1 font-heading">
                  {form.displayName || "CREATOR NAME"}
                </h1>
                <p className={`font-mono text-xs mt-1 ${creatorTier.text}`}>
                  @{form.handle || "handle"}
                </p>
                {form.niche && (
                  <div className="mt-3 inline-block px-3 py-0.5 bg-white/10 border border-white/10 rounded-full text-[10px] font-mono tracking-widest text-slate-300 uppercase">
                    {form.niche}
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-white/10 my-4"></div>

              {/* Stats & Details */}
              <div className="grid grid-cols-2 gap-4 text-center mt-auto">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Audience</p>
                  <p className="text-base font-bold text-white font-mono">
                    {numericAudience > 0 ? new Intl.NumberFormat('en-US', { notation: "compact" }).format(numericAudience) : "---"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Region</p>
                  <p className="text-base font-bold text-white font-mono">
                    {form.country ? form.country.substring(0, 3).toUpperCase() : "---"}
                  </p>
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="mt-6 flex flex-col items-center justify-center opacity-40">
                <ScanBarcode className="w-full h-10" strokeWidth={1} />
                <p className="text-[8px] font-mono tracking-widest mt-1">AZYRA-MKT-{Math.floor(Math.random() * 9000) + 1000}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE FORM */}
        <div className="flex-1 card-terminal p-4 sm:p-8 z-10 w-full order-1 lg:order-2">
          <div className="mb-6 sm:mb-8 border-b border-borderMuted pb-4 sm:pb-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-1.5 font-heading text-textMain">Claim Your Pass</h1>
            <p className="text-textMuted text-xs sm:text-sm">Join the Azyra Creator Marketplace. Fill out the details below to generate your VIP profile. All profiles are manually verified by our team.</p>
          </div>

          {error && <div className="mb-6 p-3 bg-roseAlert/10 text-roseAlert border border-roseAlert/30 rounded-md text-xs font-mono">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Display Name *</label>
                <input required type="text" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} className="w-full bg-surfaceElevated border border-borderMuted rounded-md px-3.5 py-2 text-xs text-textMain outline-none focus:border-borderStrong transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Public Handle *</label>
                <input required type="text" value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} placeholder="e.g. mrbeast" className="w-full bg-surfaceElevated border border-borderMuted rounded-md px-3.5 py-2 text-xs text-textMain outline-none focus:border-borderStrong transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Niche / Category *</label>
                <input required type="text" value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} placeholder="e.g. Tech, Fashion, Gaming" className="w-full bg-surfaceElevated border border-borderMuted rounded-md px-3.5 py-2 text-xs text-textMain outline-none focus:border-borderStrong transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Country *</label>
                <input required type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full bg-surfaceElevated border border-borderMuted rounded-md px-3.5 py-2 text-xs text-textMain outline-none focus:border-borderStrong transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Short Bio *</label>
              <textarea required value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell brands what makes your content unique..." className="w-full bg-surfaceElevated border border-borderMuted rounded-md px-3.5 py-2 text-xs text-textMain outline-none focus:border-borderStrong h-20 resize-none transition-colors"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Total Audience Size *</label>
                <input required type="number" value={form.audienceSize} onChange={e => setForm({ ...form, audienceSize: e.target.value })} placeholder="e.g. 150000" className="w-full bg-surfaceElevated border border-borderMuted rounded-md px-3.5 py-2 text-xs text-textMain outline-none focus:border-borderStrong transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Contact Email *</label>
                <input required type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} className="w-full bg-surfaceElevated border border-borderMuted rounded-md px-3.5 py-2 text-xs text-textMain outline-none focus:border-borderStrong transition-colors" />
              </div>
            </div>

            {/* MANUAL PLATFORM CONNECTION */}
            <div className="bg-surfaceElevated p-4 sm:p-5 rounded-md border border-borderMuted relative">
              <label className="block text-xs font-heading font-semibold text-textMain mb-1">Link Primary Platforms *</label>
              <p className="text-[11px] text-textMuted mb-3">Provide the exact URLs to your main social media accounts for verification.</p>

              <div className="flex flex-col sm:flex-row gap-2.5 mb-3 relative z-10">
                <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-surface border border-borderMuted rounded-md px-3 py-2 text-xs outline-none focus:border-borderStrong text-textMain w-full sm:w-[130px] cursor-pointer">
                  <option value="">Platform</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option>
                  <option value="X">X (Twitter)</option>
                  <option value="Twitch">Twitch</option>
                </select>
                <input type="url" value={platformUrl} onChange={e => setPlatformUrl(e.target.value)} placeholder="https://..." className="flex-1 bg-surface border border-borderMuted rounded-md px-3 py-2 text-xs outline-none focus:border-borderStrong text-textMain" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLink())} />
                <button type="button" onClick={handleAddLink} disabled={!platform || !platformUrl} className="bg-surface border border-borderMuted hover:border-borderStrong text-textMain font-medium px-4 py-2 rounded-md text-xs flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer">
                  Add Link
                </button>
              </div>

              {links.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {links.map((link, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-md bg-surface border border-borderMuted group">
                      <div className="flex items-center gap-2.5">
                        <LinkIcon className="w-3.5 h-3.5 text-limeAccent" />
                        <div>
                          <p className="text-xs font-bold text-textMain">{link.platform}</p>
                          <p className="text-[11px] text-textMuted truncate max-w-[200px] sm:max-w-[300px]">{link.url}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeLink(i)} className="text-textMuted hover:text-roseAlert text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 cursor-pointer">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Sample Content URLs (Optional)</label>
              <input type="text" value={form.sampleUrls} onChange={e => setForm({ ...form, sampleUrls: e.target.value })} placeholder="Comma separated links to your best posts" className="w-full bg-surfaceElevated border border-borderMuted rounded-md px-3.5 py-2 text-xs text-textMain outline-none focus:border-borderStrong transition-colors" />
            </div>

            <label className="flex items-start gap-3 mt-6 cursor-pointer p-3.5 bg-surfaceElevated rounded-md border border-borderMuted transition-colors">
              <input type="checkbox" required checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-borderMuted text-limeAccent focus:ring-limeAccent cursor-pointer" />
              <span className="text-xs text-textMuted leading-relaxed">
                I confirm that all information provided is accurate and belongs to me. I agree to the Creator Marketplace Terms of Service and understand my profile requires manual verification.
              </span>
            </label>

            <button type="submit" className="w-full mt-4 bg-limeAccent text-[#090A0C] font-heading font-bold py-3 rounded-md text-sm flex justify-center items-center gap-2 hover:brightness-105 transition cursor-pointer">
              <span>Submit Application</span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}