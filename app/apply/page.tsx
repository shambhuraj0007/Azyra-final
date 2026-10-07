"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, UploadCloud } from "lucide-react";

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
    proofUrl: ""
  });
  const [platform, setPlatform] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [links, setLinks] = useState<{platform: string, url: string}[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (status === "loading") return <div className="p-10 text-white font-mono">Loading...</div>;
  if (!session) {
    router.push("/login");
    return null;
  }

  // Pre-fill email
  if (session.user?.email && !form.contactEmail) {
    setForm(f => ({ ...f, contactEmail: session.user.email as string }));
  }

  const addLink = () => {
    if (platform && platformUrl) {
      setLinks([...links, { platform, url: platformUrl }]);
      setPlatform("");
      setPlatformUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the terms.");
      return;
    }
    if (links.length === 0) {
      setError("At least one primary platform link is required.");
      return;
    }

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
      setTimeout(() => router.push("/"), 2000);
    } else {
      const data = await res.json();
      setError(data.error || "Application failed");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-canvas text-textMain flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldCheck className="h-16 w-16 text-limeAccent mx-auto" />
          <h1 className="text-2xl font-bold font-heading">Application Submitted!</h1>
          <p className="text-textMuted">Your creator application is now pending admin approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-textMain py-12 px-4">
      <div className="max-w-3xl mx-auto bg-surface p-8 rounded-3xl border border-borderMuted shadow-2xl">
        <h1 className="text-3xl font-heading font-bold mb-2">Creator Application</h1>
        <p className="text-textMuted mb-8 text-sm">Join the Azyra Creator Marketplace to accept brand deals and sponsorships. Approval is manual.</p>

        {error && <div className="mb-6 p-3 bg-red-900/20 text-red-400 border border-red-900/50 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Display Name *</label>
              <input required type="text" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm outline-none focus:border-limeAccent" />
            </div>
            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Public Handle *</label>
              <input required type="text" value={form.handle} onChange={e => setForm({...form, handle: e.target.value})} placeholder="unique_handle" className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm outline-none focus:border-limeAccent" />
            </div>
            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Niche / Category *</label>
              <input required type="text" value={form.niche} onChange={e => setForm({...form, niche: e.target.value})} className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm outline-none focus:border-limeAccent" />
            </div>
            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Country *</label>
              <input required type="text" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm outline-none focus:border-limeAccent" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Bio *</label>
            <textarea required value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm outline-none focus:border-limeAccent h-24"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Audience Size (Total) *</label>
              <input required type="number" value={form.audienceSize} onChange={e => setForm({...form, audienceSize: e.target.value})} className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm outline-none focus:border-limeAccent" />
            </div>
            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Contact Email *</label>
              <input required type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm outline-none focus:border-limeAccent" />
            </div>
          </div>

          <div className="bg-canvas p-4 rounded-xl border border-borderMuted">
            <label className="block text-xs font-mono text-textMuted mb-3 uppercase">Primary Platform Links (At least 1 required) *</label>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-surfaceElevated border border-borderMuted rounded-lg px-3 py-2 text-sm outline-none">
                <option value="">Select Platform</option>
                <option value="X">X (Twitter)</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
              </select>
              <input type="url" value={platformUrl} onChange={e => setPlatformUrl(e.target.value)} placeholder="https://..." className="flex-1 bg-surfaceElevated border border-borderMuted rounded-lg px-3 py-2 text-sm outline-none focus:border-limeAccent" />
              <button type="button" onClick={addLink} className="bg-limeAccent text-black font-bold px-4 py-2 rounded-lg text-sm">Add</button>
            </div>
            <ul className="space-y-2">
              {links.map((l, i) => (
                <li key={i} className="flex justify-between bg-surfaceElevated p-2 rounded border border-borderMuted text-sm">
                  <span className="font-bold">{l.platform}</span>
                  <a href={l.url} target="_blank" className="text-limeAccent truncate ml-4 max-w-[200px]">{l.url}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Sample Content URLs (comma separated)</label>
              <input type="text" value={form.sampleUrls} onChange={e => setForm({...form, sampleUrls: e.target.value})} placeholder="https://..." className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm outline-none focus:border-limeAccent" />
            </div>
            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase">Proof/Government ID URL (Secure)</label>
              <div className="relative">
                <UploadCloud className="absolute left-3 top-3 h-5 w-5 text-textMuted" />
                <input type="url" value={form.proofUrl} onChange={e => setForm({...form, proofUrl: e.target.value})} placeholder="https://drive.google.com/..." className="w-full bg-surfaceElevated border border-borderMuted rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-limeAccent" />
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 mt-6 cursor-pointer">
            <input type="checkbox" required checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 accent-limeAccent" />
            <span className="text-sm text-textMuted">I confirm that all information provided is accurate and I agree to the Creator Marketplace Terms of Service. I understand that my profile will not be public or eligible for campaigns until approved by administration.</span>
          </label>

          <button type="submit" className="w-full mt-6 bg-limeAccent text-[#0B0F10] font-heading font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2 hover:brightness-110 transition shadow-lg shadow-limeAccent/20">
            Submit Application <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
