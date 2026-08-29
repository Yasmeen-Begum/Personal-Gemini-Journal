import React, { useState } from 'react';
import {
  Sparkles,
  CheckSquare,
  Square,
  Volume2,
  VolumeX,
  RefreshCw,
  Lightbulb,
  Compass,
  Tag,
  Smile,
  Meh,
  Frown,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { JournalSummary, ActionItem } from '../types';
import { speakText, stopSpeaking } from '../lib/audio';

interface SummaryCardProps {
  summary: JournalSummary | null;
  onToggleActionItem: (itemId: string) => void;
  onRefreshSummary: () => void;
  isSummarizing: boolean;
  onApplyPromptToChat?: (prompt: string) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  onToggleActionItem,
  onRefreshSummary,
  isSummarizing,
  onApplyPromptToChat,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (isSummarizing) {
    return (
      <div
        id="summary-card-loading"
        className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]">
            <Sparkles className="h-4 w-4 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">Gemini Cognitive Synthesis</h3>
            <p className="text-xs text-[#64748B]">Synthesizing executive summary, key insights & action items...</p>
          </div>
        </div>
        <div className="space-y-2.5 animate-pulse">
          <div className="h-4 bg-[#F1F5F9] rounded-lg w-full" />
          <div className="h-4 bg-[#F1F5F9] rounded-lg w-5/6" />
          <div className="h-4 bg-[#F1F5F9] rounded-lg w-4/6" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div
        id="summary-card-empty"
        className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-6 text-center shadow-xs"
      >
        <Sparkles className="h-8 w-8 mx-auto text-[#2563EB]/40 mb-2" />
        <h3 className="text-sm font-semibold text-[#0F172A]">No AI Summary Generated Yet</h3>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
          Chat with Gemini or write your journal notes, then click summarize to automatically generate deep insights and action steps.
        </p>
        <button
          id="trigger-first-summary-btn"
          onClick={onRefreshSummary}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white active:scale-95 transition-all shadow-xs"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Synthesize Session with Gemini</span>
        </button>
      </div>
    );
  }

  const handleTogglePlay = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const textToRead = `${summary.title}. Executive summary: ${summary.summary}. Key insights include: ${summary.keyInsights?.join('. ')}.`;
      setIsPlayingAudio(true);
      speakText(textToRead, () => setIsPlayingAudio(false));
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.3) return 'text-[#10B981] bg-emerald-50 border-emerald-200';
    if (score <= -0.2) return 'text-rose-600 bg-rose-50 border-rose-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div
      id="summary-card-container"
      className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#2563EB]">
              Automated AI Synthesis
            </span>
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">
            {summary.title || 'Session Synthesis'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="speak-summary-btn"
            onClick={handleTogglePlay}
            className="p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-white hover:border-[#CBD5E1] transition-colors shadow-xs"
            title={isPlayingAudio ? 'Stop Audio Readback' : 'Listen to AI Summary'}
            aria-label="Listen to summary audio"
          >
            {isPlayingAudio ? (
              <VolumeX className="h-4 w-4 text-[#2563EB] animate-pulse" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <button
            id="refresh-summary-btn"
            onClick={onRefreshSummary}
            className="p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-white hover:border-[#CBD5E1] transition-colors shadow-xs"
            title="Re-synthesize with Gemini"
            aria-label="Re-synthesize summary"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sentiment & Mood Index */}
      {summary.sentiment && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#2563EB]" />
            <span className="text-xs text-[#64748B] font-medium">Cognitive & Mood Index:</span>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getSentimentColor(
              summary.sentiment.score
            )}`}
          >
            <span>{summary.sentiment.label}</span>
            {summary.sentiment.primaryEmotion && (
              <span className="text-[10px] opacity-80 font-normal">
                • {summary.sentiment.primaryEmotion}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Executive Summary Body */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-[#475569] uppercase tracking-[0.1em]">
          Executive Takeaway
        </h4>
        <p className="text-xs text-[#1E293B] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-lg border border-[#E2E8F0]">
          {summary.summary}
        </p>
      </div>

      {/* Key Insights */}
      {summary.keyInsights && summary.keyInsights.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#475569] uppercase tracking-[0.1em] flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-[#2563EB]" />
            Key Breakthroughs & Insights
          </h4>
          <ul className="space-y-1.5">
            {summary.keyInsights.map((insight, idx) => (
              <li
                key={idx}
                className="text-xs text-[#334155] flex items-start gap-2 bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]"
              >
                <span className="text-[#2563EB] font-bold mt-0.5">•</span>
                <span className="flex-1">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Action Items Checklist */}
      {summary.actionItems && summary.actionItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#475569] uppercase tracking-[0.1em] flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-[#10B981]" />
              Action Items
            </h4>
            <span className="text-[10px] text-[#94A3B8] font-medium">
              {summary.actionItems.filter((a) => a.completed).length} / {summary.actionItems.length} completed
            </span>
          </div>

          <div className="space-y-1.5">
            {summary.actionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onToggleActionItem(item.id)}
                className={`w-full flex items-start gap-2.5 rounded-lg p-2.5 text-left text-xs transition-all border shadow-xs ${
                  item.completed
                    ? 'border-emerald-200 bg-emerald-50/50 text-[#94A3B8] line-through'
                    : 'border-[#E2E8F0] bg-white text-[#1E293B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {item.completed ? (
                    <CheckSquare className="h-3.5 w-3.5 text-[#10B981]" />
                  ) : (
                    <Square className="h-3.5 w-3.5 text-[#94A3B8]" />
                  )}
                </span>
                <span className="flex-1">{item.text}</span>
                {item.priority && !item.completed && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                      item.priority === 'high'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : item.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    {item.priority}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reflection Prompts for Next Session */}
      {summary.reflectionPrompts && summary.reflectionPrompts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#475569] uppercase tracking-[0.1em] flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-[#2563EB]" />
            Next Brainstorm Horizons
          </h4>
          <div className="space-y-1.5">
            {summary.reflectionPrompts.map((prompt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 rounded-lg bg-[#F8FAFC] p-2.5 border border-[#E2E8F0] text-xs text-[#334155]"
              >
                <span className="italic">"{prompt}"</span>
                {onApplyPromptToChat && (
                  <button
                    onClick={() => onApplyPromptToChat(prompt)}
                    className="shrink-0 p-1 text-[#2563EB] hover:text-[#1D4ED8] hover:bg-white rounded transition-colors"
                    title="Send this prompt to Gemini Chat"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mind Concept Nodes */}
      {summary.mindNodes && summary.mindNodes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#475569] uppercase tracking-[0.1em] flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#2563EB]" />
            Concept Constellation
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {summary.mindNodes.map((node) => (
              <span
                key={node.id}
                className="inline-flex items-center rounded-md bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-semibold text-[#475569] border border-[#E2E8F0]"
              >
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                {node.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {summary.tags && summary.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#E2E8F0]">
          <Tag className="h-3 w-3 text-[#94A3B8]" />
          {summary.tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#64748B] border border-[#E2E8F0]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
