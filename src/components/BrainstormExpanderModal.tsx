import React, { useState } from 'react';
import {
  Zap,
  X,
  Sparkles,
  Rocket,
  RefreshCcw,
  Clock,
  Compass,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import type { BrainstormAngle } from '../types';

interface BrainstormExpanderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIdea: string;
  onApplyAngleToChat: (angleText: string) => void;
}

export const BrainstormExpanderModal: React.FC<BrainstormExpanderModalProps> = ({
  isOpen,
  onClose,
  currentIdea,
  onApplyAngleToChat,
}) => {
  const [ideaInput, setIdeaInput] = useState(currentIdea || '');
  const [angles, setAngles] = useState<BrainstormAngle[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (currentIdea) {
      setIdeaInput(currentIdea);
    }
  }, [currentIdea]);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ideaInput.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/expand-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaInput }),
      });
      const data = await res.json();
      if (data.angles) {
        setAngles(data.angles);
      }
    } catch (err) {
      console.error('Angle expansion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getAngleIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Rocket className="h-4 w-4 text-[#2563EB]" />;
      case 1:
        return <RefreshCcw className="h-4 w-4 text-[#0EA5E9]" />;
      case 2:
        return <Clock className="h-4 w-4 text-[#10B981]" />;
      default:
        return <Compass className="h-4 w-4 text-[#6366F1]" />;
    }
  };

  return (
    <div
      id="brainstorm-expander-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="brainstorm-expander-container"
        className="w-full max-w-2xl rounded-xl border border-[#E2E8F0] bg-white shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          id="close-brainstorm-expander-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              Divergent Brainstorm Angle Expander
            </h2>
            <p className="text-xs text-[#64748B]">
              Transform any seed thought into 4 high-leverage cognitive perspectives
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mb-6 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">
              Your Seed Idea / Brainstorm Concept
            </label>
            <div className="flex gap-2">
              <input
                id="brainstorm-seed-input"
                type="text"
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                placeholder="e.g. Building an asynchronous knowledge base for remote engineering teams..."
                className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 focus:outline-none transition-all"
              />
              <button
                id="generate-angles-btn"
                type="submit"
                disabled={loading || !ideaInput.trim()}
                className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Expand Angles</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Angles Output */}
        {angles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {angles.map((angle, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 hover:border-[#CBD5E1] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1E293B] flex items-center gap-2">
                      {getAngleIcon(idx)}
                      {angle.title}
                    </span>
                    <button
                      onClick={() => handleCopy(`${angle.title}: ${angle.description}`, idx)}
                      className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded transition-colors"
                      title="Copy angle"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3.5 w-3.5 text-[#10B981]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {angle.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex justify-end">
                  <button
                    onClick={() => {
                      onApplyAngleToChat(`Let's explore this angle on "${ideaInput}": **${angle.title}** — ${angle.description}`);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                  >
                    <span>Discuss with Gemini</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {angles.length === 0 && !loading && (
          <div className="rounded-lg border border-dashed border-[#CBD5E1] p-8 text-center text-[#94A3B8]">
            <Sparkles className="h-8 w-8 mx-auto text-[#2563EB]/40 mb-2" />
            <p className="text-xs">
              Enter a thought or question above to generate 4 distinct angles with Gemini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
