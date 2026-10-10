'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import {
  ShieldCheck,
  Video,
  Trophy,
  DollarSign,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Lock,
  User,
  Building2,
  Users,
  ArrowRight,
} from 'lucide-react';
import AzyraLogo from '@/components/AzyraLogo';
import { useCampaigns } from '@/lib/CampaignContext';

/* ─── Design Tokens (aligned with globals.css) ─────────────────────── */
const TOKEN = {
  bg: '#0B0F10',
  surface: '#141C1E',
  surfaceEl: '#1B2427',
  border: 'rgba(255,255,255,0.07)',
  borderMuted: '#223033',
  textPrimary: '#F3F7F6',
  textMuted: '#8E9D9E',
  lime: '#D4F63C',
};

/* ─── Left-Panel Content per Role ─────────────────────────────────── */
const PANEL_CONTENT = {
  creator: {
    bullets: [
      { icon: <DollarSign className="h-3.5 w-3.5" />, text: 'Escrow-protected payouts' },
      { icon: <Video className="h-3.5 w-3.5" />, text: 'Multi-platform tracking' },
      { icon: <ShieldCheck className="h-3.5 w-3.5" />, text: 'Automated fraud detection' },
    ],
  },
  brand: {
    bullets: [
      { icon: <DollarSign className="h-3.5 w-3.5" />, text: 'Funds held in escrow' },
      { icon: <ShieldCheck className="h-3.5 w-3.5" />, text: 'Verified view tracking' },
      { icon: <Trophy className="h-3.5 w-3.5" />, text: 'Leaderboard of top clippers' },
    ],
  },
};

/* ─── Google SVG ───────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ─── Main Auth Content ────────────────────────────────────────────── */
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { currentUser, campaigns, joinCampaign } = useCampaigns();

  const urlMode = searchParams.get('mode');
  const urlRole = searchParams.get('role');
  const joinCampaignId = searchParams.get('join') || null;
  const redirectUrl =
    searchParams.get('redirect') ||
    (joinCampaignId ? `/campaigns/${joinCampaignId}` : '/campaigns');

  const [mode, setMode] = useState<'signin' | 'signup'>(
    urlMode === 'signup' ? 'signup' : 'signin'
  );
  const [role, setRole] = useState<'creator' | 'brand'>(
    urlRole === 'brand' ? 'brand' : 'creator'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetCampaign = useMemo(
    () => (joinCampaignId ? campaigns.find((c) => c.id === joinCampaignId) : null),
    [joinCampaignId, campaigns]
  );

  /* Guard redirect after auth */
  useEffect(() => {
    const isAuthed = status === 'authenticated' || currentUser?.isLoggedIn;
    if (!isAuthed) return;

    const isProfileSetup =
      currentUser?.isProfileSetup ?? Boolean((session?.user as any)?.isProfileSetup);
    const creatorStatus =
      currentUser?.creatorStatus || (session?.user as any)?.creatorStatus || 'none';
    const userRole = currentUser?.role || (session?.user as any)?.role || role;

    if (userRole === 'creator' && creatorStatus === 'none') {
      const setupPath = `/apply?${joinCampaignId ? `join=${joinCampaignId}&` : ''}redirect=${encodeURIComponent(redirectUrl)}`;
      router.push(setupPath);
      return;
    }

    if (joinCampaignId && isProfileSetup) {
      joinCampaign(joinCampaignId);
    }

    router.push(redirectUrl);
  }, [status, currentUser, session, role, joinCampaignId, redirectUrl, router, joinCampaign]);

  /* Google OAuth */
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      document.cookie = `auth_role=${role}; path=/; max-age=600; SameSite=Lax`;
    } catch (e) {
      console.warn('Cookie set error:', e);
    }
    const callbackTarget = `/login?check=1${joinCampaignId ? `&join=${joinCampaignId}` : ''}&redirect=${encodeURIComponent(redirectUrl)}&role=${role}`;
    await signIn('google', { callbackUrl: callbackTarget });
  };

  /* Email / Password Submit */
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      setIsLoading(true);
      try {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
            ...(role === 'brand' && companyName.trim() ? { companyName: companyName.trim() } : {}),
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok || !regData.success) {
          setErrorMsg(regData.error || 'Failed to create account.');
          setIsLoading(false);
          return;
        }

        const authRes = await signIn('credentials', {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (authRes?.error) {
          setErrorMsg('Account created, but sign-in failed. Please sign in manually.');
          setMode('signin');
          setIsLoading(false);
          return;
        }

        router.refresh();
      } catch (err: any) {
        console.error('Registration error:', err);
        setErrorMsg(err.message || 'An error occurred during sign up.');
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const authRes = await signIn('credentials', {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (authRes?.error) {
          setErrorMsg('Invalid email or password. Please try again.');
          setIsLoading(false);
          return;
        }

        router.refresh();
      } catch (err: any) {
        console.error('Sign-in error:', err);
        setErrorMsg(err.message || 'An error occurred during sign in.');
        setIsLoading(false);
      }
    }
  };

  const bullets = PANEL_CONTENT[role].bullets;

  /* Heading / subline based on mode + role */
  const heading =
    mode === 'signin'
      ? 'Welcome back'
      : role === 'creator'
        ? 'Create your creator account'
        : 'Create your brand account';

  const subline =
    mode === 'signin'
      ? 'Sign in to your Azyra account'
      : role === 'creator'
        ? 'Earn per 1,000 verified video views'
        : 'Launch pay-per-view video campaigns';

  const primaryBtnLabel = isLoading
    ? 'Please wait\u2026'
    : mode === 'signin'
      ? 'Sign in'
      : role === 'creator'
        ? 'Create creator account'
        : 'Create brand account';

  return (
    <div
      style={{ background: TOKEN.bg, color: TOKEN.textPrimary }}
      className="min-h-screen flex font-sans selection:bg-limeAccent selection:text-[#0B0F10]"
    >
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-10 shrink-0 border-r"
        style={{ background: TOKEN.surface, borderColor: TOKEN.border }}
      >
        {/* Logo */}
        <div>
          <Link href="/" className="inline-block">
            <AzyraLogo size="md" />
          </Link>
        </div>


        {/* Main copy */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-2xl font-heading font-bold leading-snug" style={{ color: TOKEN.textPrimary }}>
              Short-form campaigns,<br />paid on verified views.
            </h1>
            <p className="text-sm font-sans leading-relaxed" style={{ color: TOKEN.textMuted }}>
              Azyra connects creators and brands through transparent, escrow-backed video campaigns.
            </p>
          </div>

          {/* Bullet list */}
          <ul className="space-y-4">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center h-7 w-7 rounded-lg shrink-0"
                  style={{ background: 'rgba(212,246,60,0.10)', color: TOKEN.lime }}
                >
                  {b.icon}
                </span>
                <span className="text-sm font-sans" style={{ color: TOKEN.textPrimary }}>
                  {b.text}
                </span>
              </li>
            ))}
          </ul>

          {/* Stat badge */}

        </div>

        {/* Bottom spacer */}
        <div />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full" style={{ maxWidth: '420px' }}>

          {/* Campaign referral badge */}
          {joinCampaignId && (
            <p className="text-xs mb-6 text-center" style={{ color: TOKEN.textMuted }}>
              Joining{' '}
              <span style={{ color: TOKEN.textPrimary }}>
                {targetCampaign ? targetCampaign.title : `Campaign #${joinCampaignId}`}
              </span>
              {targetCampaign && (
                <>
                  {' \u00b7 '}
                  <span className="font-mono">${targetCampaign.cpm_rate.toFixed(2)} CPM</span>
                </>
              )}
            </p>
          )}

          {/* Mode switcher */}
          <div
            className="flex rounded-lg p-1 mb-7"
            style={{ background: TOKEN.surface, border: `1px solid ${TOKEN.border}` }}
          >
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                id={`auth-mode-${m}`}
                onClick={() => { setMode(m); setErrorMsg(null); }}
                className="flex-1 rounded-md py-2 text-sm transition-all"
                style={{
                  background: mode === m ? TOKEN.lime : 'transparent',
                  color: mode === m ? '#0B0D0E' : TOKEN.textMuted,
                  fontWeight: mode === m ? 600 : 400,
                }}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Heading + subline */}
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-heading font-bold" style={{ color: TOKEN.textPrimary }}>
              {heading}
            </h2>
            <p className="text-sm font-sans" style={{ color: TOKEN.textMuted }}>
              {subline}
            </p>
          </div>

          {/* Role segmented control (signup only) */}
          {mode === 'signup' && (
            <div
              className="flex rounded-lg p-1 mb-6"
              style={{ background: TOKEN.surface, border: `1px solid ${TOKEN.border}` }}
            >
              {(['creator', 'brand'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  id={`auth-role-${r}`}
                  onClick={() => setRole(r)}
                  className="flex-1 rounded-md py-2 text-sm transition-all capitalize"
                  style={{
                    background: role === r ? 'rgba(212,245,60,0.12)' : 'transparent',
                    color: role === r ? TOKEN.lime : TOKEN.textMuted,
                    fontWeight: role === r ? 600 : 400,
                    border: role === r ? '1px solid rgba(212,245,60,0.25)' : '1px solid transparent',
                  }}
                >
                  {r === 'creator' ? 'Creator' : 'Brand'}
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div
              className="flex items-center gap-2.5 rounded-lg p-3 mb-5 text-sm font-sans"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#FCA5A5',
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google sign-in */}
          <button
            type="button"
            id="auth-google-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg text-sm font-sans font-medium transition mb-4 disabled:opacity-60"
            style={{
              height: '44px',
              background: 'transparent',
              border: `1px solid ${TOKEN.borderMuted}`,
              color: TOKEN.textPrimary,
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: TOKEN.border }} />
            <span className="text-xs font-sans" style={{ color: TOKEN.textMuted }}>or</span>
            <div className="flex-1 h-px" style={{ background: TOKEN.border }} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
            {/* Full Name */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-sans font-medium mb-1.5" style={{ color: TOKEN.textMuted }}>
                  Full name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: TOKEN.textMuted }}
                  />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 text-sm font-sans outline-none transition"
                    style={{
                      height: '44px',
                      background: TOKEN.surfaceEl,
                      border: `1px solid ${TOKEN.borderMuted}`,
                      color: TOKEN.textPrimary,
                      borderRadius: '8px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = TOKEN.lime; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = TOKEN.borderMuted; }}
                  />
                </div>
              </div>
            )}

            {/* Company / Brand Name */}


            {/* Email */}
            <div>
              <label className="block text-xs font-sans font-medium mb-1.5" style={{ color: TOKEN.textMuted }}>
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: TOKEN.textMuted }}
                />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 text-sm font-sans outline-none transition"
                  style={{
                    height: '44px',
                    background: TOKEN.surfaceEl,
                    border: `1px solid ${TOKEN.borderMuted}`,
                    color: TOKEN.textPrimary,
                    borderRadius: '8px',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = TOKEN.lime; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = TOKEN.borderMuted; }}
                />
              </div>
            </div>

            {/* Password + eye toggle */}
            <div>
              <label className="block text-xs font-sans font-medium mb-1.5" style={{ color: TOKEN.textMuted }}>
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: TOKEN.textMuted }}
                />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 text-sm font-sans outline-none transition"
                  style={{
                    height: '44px',
                    background: TOKEN.surfaceEl,
                    border: `1px solid ${TOKEN.borderMuted}`,
                    color: TOKEN.textPrimary,
                    borderRadius: '8px',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = TOKEN.lime; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = TOKEN.borderMuted; }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  id="auth-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition"
                  style={{ color: TOKEN.textMuted }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Primary CTA */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 text-sm font-heading font-bold tracking-tight transition active:scale-[0.98] disabled:opacity-60 mt-2"
              style={{
                height: '44px',
                background: TOKEN.lime,
                color: '#0B0F10',
                borderRadius: '8px',
              }}
            >
              <span>{primaryBtnLabel}</span>
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Terms + toggle */}
          <p className="mt-5 text-xs font-sans text-center leading-relaxed" style={{ color: TOKEN.textMuted }}>
            By creating an account you agree to the{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:opacity-80 transition" style={{ color: TOKEN.textMuted }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80 transition" style={{ color: TOKEN.textMuted }}>
              Privacy Policy
            </Link>
            .
          </p>

          <p className="mt-3 text-xs font-sans text-center" style={{ color: TOKEN.textMuted }}>
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  id="auth-toggle-mode-signin"
                  onClick={() => { setMode('signin'); setErrorMsg(null); }}
                  className="underline underline-offset-2 font-semibold"
                  style={{ color: TOKEN.textPrimary }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  id="auth-toggle-mode-signup"
                  onClick={() => { setMode('signup'); setErrorMsg(null); }}
                  className="underline underline-offset-2 font-semibold"
                  style={{ color: TOKEN.textPrimary }}
                >
                  Create account
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center text-sm"
          style={{ background: '#0B0D0E', color: '#8A9096' }}
        >
          Loading\u2026
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
