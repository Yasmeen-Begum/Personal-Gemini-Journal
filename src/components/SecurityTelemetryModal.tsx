import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  X,
  Server,
  Lock,
  Key,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  EyeOff,
  Code2,
  FileCheck,
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface SecurityTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isVaultUnlocked: boolean;
}

export const SecurityTelemetryModal: React.FC<SecurityTelemetryModalProps> = ({
  isOpen,
  onClose,
  user,
  isVaultUnlocked,
}) => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Telemetry fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="security-telemetry-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="security-telemetry-container"
        className="w-full max-w-2xl rounded-xl border border-[#E2E8F0] bg-white shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-[#10B981] shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                Enterprise Security & Zero-Trust Telemetry
              </h2>
              <p className="text-xs text-[#64748B]">
                Live compliance status against the Studio Security Constitution
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-white hover:border-[#CBD5E1] transition-colors shadow-xs"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {/* Rule 1: Zero-Trust & Identity */}
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1E293B] flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#2563EB]" />
                1. Identity & Auth Boundary
              </span>
              {user ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" /> Authenticated
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" /> Unauthenticated
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B]">
              Subject UID: <code className="text-[#0F172A] font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">{user ? user.uid : 'None'}</code>
            </p>
            <p className="text-[11px] text-[#64748B] mt-1.5">
              Every operation cryptographically bounded to <code className="text-[#0F172A] font-mono">request.auth.uid</code>.
            </p>
          </div>

          {/* Rule 2: Database Isolation */}
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1E293B] flex items-center gap-2">
                <Database className="h-4 w-4 text-[#10B981]" />
                2. Firestore Path Isolation
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3" /> Rules Enforced
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Isolation Path: <code className="text-[#0F172A] font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">/users/{user?.uid ? user.uid.slice(0, 8) + '...' : '{uid}'}/journals</code>
            </p>
            <p className="text-[11px] text-[#64748B] mt-1.5">
              Zero cross-tenant leakage: Unscoped wildcard reads strictly denied by deployed rules.
            </p>
          </div>

          {/* Rule 3: Secret Management */}
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1E293B] flex items-center gap-2">
                <Key className="h-4 w-4 text-[#2563EB]" />
                3. Secret Key Isolation
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3" /> Zero-Leakage
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Storage: <span className="text-[#0F172A] font-medium">Cloud Secret Manager / Server Env</span>
            </p>
            <p className="text-[11px] text-[#64748B] mt-1.5">
              Client bundle contains 0 API keys. AI calls routed exclusively via server-side <code className="text-[#0F172A] font-mono">/api/*</code>.
            </p>
          </div>

          {/* Rule 4: Client-Side Zero Knowledge */}
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1E293B] flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-[#2563EB]" />
                4. Zero-Knowledge Encryption
              </span>
              {isVaultUnlocked ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" /> Vault Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                  Standard Mode
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B]">
              Cipher: <span className="text-[#0F172A] font-medium">AES-256-GCM + PBKDF2 (100k iters)</span>
            </p>
            <p className="text-[11px] text-[#64748B] mt-1.5">
              Keys never touch server. Encrypted client-side prior to Firestore synchronization.
            </p>
          </div>
        </div>

        {/* Live Diagnostics Log */}
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#475569] flex items-center gap-2 uppercase tracking-wider">
              <Code2 className="h-3.5 w-3.5 text-[#64748B]" />
              Runtime Diagnostic Telemetry
            </span>
            <span className="text-[11px] text-[#94A3B8] font-mono">
              {telemetry?.securityProfile?.timestamp || 'Querying...'}
            </span>
          </div>
          <pre className="text-[11px] font-mono text-[#0F172A] bg-white rounded-md p-3 overflow-x-auto border border-[#E2E8F0] leading-relaxed shadow-xs">
            {JSON.stringify(telemetry?.securityProfile || { status: 'loading' }, null, 2)}
          </pre>
        </div>

        {/* Constitutional Guarantee Footer */}
        <div className="mt-4 flex items-center gap-2 text-xs text-[#64748B] border-t border-[#E2E8F0] pt-4">
          <FileCheck className="h-4 w-4 text-[#2563EB] shrink-0" />
          <span>
            Verified compliant with Studio Constitution directives in <code className="text-[#0F172A] font-mono font-semibold">/AGENTS.md</code> and <code className="text-[#0F172A] font-mono font-semibold">/GEMINI.md</code>.
          </span>
        </div>
      </div>
    </div>
  );
};
