import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  X,
  Key,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlock: (passphrase: string) => void;
  onLock: () => void;
  hasStoredKey: boolean;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  onUnlock,
  onLock,
  hasStoredKey,
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || passphrase.length < 6) {
      setError('Passphrase must be at least 6 characters.');
      return;
    }
    setError(null);
    onUnlock(passphrase);
    setPassphrase('');
    onClose();
  };

  const handleLockVault = () => {
    onLock();
    onClose();
  };

  return (
    <div
      id="vault-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="vault-modal-container"
        className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white shadow-2xl p-6 relative"
      >
        <button
          id="close-vault-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] mb-3 shadow-xs">
            {isUnlocked ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">
            Zero-Knowledge Privacy Vault
          </h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
            Client-Side AES-256-GCM encryption. Entries are encrypted in your browser memory before being sent to Firestore.
          </p>
        </div>

        {isUnlocked ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-[#10B981] font-bold text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Vault is Currently Unlocked
              </div>
              <p className="text-xs text-[#334155] mt-1">
                Your private encryption key is active in browser memory for this session.
              </p>
            </div>

            <button
              id="lock-vault-action-btn"
              onClick={handleLockVault}
              className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-4 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Lock className="h-4 w-4 text-[#64748B]" />
              Lock Vault & Purge Keys from Memory
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5 flex items-center justify-between">
                <span>Enter Master Vault Passphrase</span>
                <span className="text-[11px] text-[#94A3B8] font-normal">Min. 6 chars</span>
              </label>
              <div className="relative">
                <input
                  id="vault-passphrase-input"
                  type={showPassword ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Your private secret phrase..."
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-3 pr-10 py-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[11px] text-[#64748B] flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#0F172A]">Zero-Knowledge Guarantee:</strong> This passphrase is never sent to the server. If you forget your passphrase, encrypted entries cannot be recovered.
              </span>
            </div>

            <button
              id="unlock-vault-submit-btn"
              type="submit"
              className="w-full rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] py-2.5 px-4 text-xs font-bold text-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Key className="h-4 w-4" />
              Unlock & Enable Client Encryption
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
