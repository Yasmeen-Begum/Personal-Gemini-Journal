import React from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Plus,
  Sparkles,
  User as UserIcon,
  LogOut,
  Sliders,
  PanelLeft,
  Compass,
  Zap,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { PersonaType } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onNewJournal: () => void;
  onOpenTelemetry: () => void;
  onToggleVault: () => void;
  isVaultUnlocked: boolean;
  vaultPassphraseSet: boolean;
  activePersona: PersonaType;
  onChangePersona: (p: PersonaType) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenBrainstormExpander: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onNewJournal,
  onOpenTelemetry,
  onToggleVault,
  isVaultUnlocked,
  vaultPassphraseSet,
  activePersona,
  onChangePersona,
  onToggleSidebar,
  sidebarOpen,
  onOpenBrainstormExpander,
}) => {
  const personas: { id: PersonaType; label: string; icon: string; desc: string }[] = [
    { id: 'socratic', label: 'Socratic Mentor', icon: '🏛️', desc: 'Probing questions & deep motives' },
    { id: 'brainstormer', label: 'Creative Spark', icon: '💡', desc: 'Divergent thinking & analogies' },
    { id: 'mindfulness', label: 'Mindful Guide', icon: '🌿', desc: 'Empathy & emotional clarity' },
    { id: 'executive', label: 'Executive Strategist', icon: '⚡', desc: 'High leverage & action items' },
    { id: 'deconstruct', label: 'First Principles', icon: '🔬', desc: 'Fundamental truth analysis' },
  ];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-6 py-2.5 transition-all shadow-xs"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-sidebar-btn"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A] shadow-xs"
            title={sidebarOpen ? 'Collapse Journal Library' : 'Expand Journal Library'}
            aria-label="Toggle journal sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-[#0F172A] text-sm md:text-base">
                  Gemini Journal
                </span>
                <span className="hidden sm:inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]">
                  Encrypted
                </span>
                <span className="hidden md:inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-[#10B981] border border-emerald-200">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  Firestore Isolated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Persona Selector & Quick Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1 shadow-xs">
            <span className="px-2 text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
              <Compass className="h-3 w-3 text-[#64748B]" />
              Lens:
            </span>
            {personas.map((p) => (
              <button
                key={p.id}
                id={`persona-btn-${p.id}`}
                onClick={() => onChangePersona(p.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  activePersona === p.id
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                }`}
                title={p.desc}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          <button
            id="open-brainstorm-angles-btn"
            onClick={onOpenBrainstormExpander}
            className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all shadow-xs"
            title="Generate 4 Divergent Brainstorm Angles (10x, Inversion, 24h MVP, Analogy)"
          >
            <Zap className="h-3.5 w-3.5 text-[#2563EB]" />
            <span className="hidden xl:inline">Angle Expander</span>
          </button>
        </div>

        {/* Right: Security Telemetry, Vault Mode, New Journal, User Profile */}
        <div className="flex items-center gap-2">
          {/* Security Constitution Inspector Button */}
          <button
            id="security-telemetry-btn"
            onClick={onOpenTelemetry}
            className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-[#10B981] transition-all shadow-xs"
            title="Enterprise Security Telemetry & Zero-Trust Constitution"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
            <span className="hidden md:inline">Security Shield</span>
          </button>

          {/* Zero-Knowledge Vault Lock Toggle */}
          <button
            id="vault-mode-btn"
            onClick={onToggleVault}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all shadow-xs ${
              isVaultUnlocked
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
            title={
              isVaultUnlocked
                ? 'Zero-Knowledge Vault Active (AES-256 Client Encryption Enabled)'
                : 'Zero-Knowledge Vault Locked / Inactive'
            }
          >
            {isVaultUnlocked ? (
              <>
                <Unlock className="h-3.5 w-3.5 text-amber-600" />
                <span className="hidden sm:inline font-mono">Vault: Unlocked</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-[#64748B]" />
                <span className="hidden sm:inline font-mono">Vault Mode</span>
              </>
            )}
          </button>

          {/* New Journal Button */}
          <button
            id="new-journal-btn"
            onClick={onNewJournal}
            className="flex items-center gap-1.5 rounded-lg bg-[#0F172A] text-white px-3.5 py-1.5 text-xs font-medium hover:bg-black active:scale-95 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Session</span>
          </button>

          {/* Auth Button / Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-[#E2E8F0]">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2E8F0] text-[#64748B] border border-[#CBD5E1] font-bold text-xs overflow-hidden shadow-xs"
                title={user.email || user.displayName || 'Authenticated Subject'}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <button
                id="sign-out-btn"
                onClick={onSignOut}
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-red-600 transition-colors"
                title="Sign Out"
                aria-label="Sign out of journal"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              id="sign-in-modal-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#1E293B] hover:bg-white hover:text-black transition-all shadow-xs"
            >
              <UserIcon className="h-3.5 w-3.5 text-[#64748B]" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
