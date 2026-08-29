import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  Shield,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  signInWithGoogle,
  signInEmail,
  signUpEmail,
  signInGuest,
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Sign In Error:', err);
      setError(err?.message || 'Google Sign-In failed. Try guest mode or email.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await signUpEmail(email, password);
      } else {
        await signInEmail(email, password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. If you are new, click "Create Account".');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Try signing in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err?.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGuest();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Guest Sign-In Error:', err);
      setError(err?.message || 'Guest Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-container"
        className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white shadow-xl p-6 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] mb-3 shadow-xs">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">
            Secure Personal Gemini Journal
          </h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
            Zero-Trust Authenticated Session with strict per-user Firestore isolation.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Social / Google Sign-In */}
        <div className="space-y-2.5">
          <button
            id="google-signin-btn"
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-4 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all active:scale-[0.99] disabled:opacity-50 shadow-xs"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            id="guest-signin-btn"
            type="button"
            disabled={loading}
            onClick={handleGuestSignIn}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 px-4 text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all disabled:opacity-50 shadow-xs"
          >
            <Zap className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>Instant Demo Guest Mode (Private Temp ID)</span>
          </button>
        </div>

        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0]" />
          </div>
          <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">
            or email credentials
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] py-2.5 px-4 text-xs font-bold text-white active:scale-[0.99] transition-all disabled:opacity-50 shadow-xs"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isRegister ? (
              'Create Isolated Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="mt-4 text-center">
          <button
            id="toggle-auth-mode-btn"
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-6 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[11px] text-[#64748B] flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#10B981] shrink-0" />
          <span>
            Strict path isolation: <code className="text-[#0F172A] font-mono">/users/{'{uid}'}/journals</code>. Zero cross-tenant data leaks.
          </span>
        </div>
      </div>
    </div>
  );
};
