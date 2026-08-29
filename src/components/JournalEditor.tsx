import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Lock,
  Unlock,
  Tag,
  Share2,
  Trash2,
  Download,
  Check,
  Eye,
  Edit3,
  Calendar,
  Zap,
} from 'lucide-react';
import type { JournalEntry } from '../types';

interface JournalEditorProps {
  entry: JournalEntry;
  onChangeContent: (content: string) => void;
  onChangeTitle: (title: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onOpenExport: () => void;
  onSummarize: () => void;
  isSummarizing: boolean;
  isSaving: boolean;
  isVaultUnlocked: boolean;
  onOpenBrainstormExpander: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onChangeContent,
  onChangeTitle,
  onAddTag,
  onRemoveTag,
  onSave,
  onDelete,
  onOpenExport,
  onSummarize,
  isSummarizing,
  isSaving,
  isVaultUnlocked,
  onOpenBrainstormExpander,
}) => {
  const [tagInput, setTagInput] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  const wordCount = entry.content.trim() ? entry.content.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (cleanTag && !entry.tags.includes(cleanTag)) {
      onAddTag(cleanTag);
      setTagInput('');
    }
  };

  const handleSaveClick = () => {
    onSave();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div
      id="journal-editor-container"
      className="flex flex-col h-full rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden"
    >
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        {/* Meta details */}
        <div className="flex items-center gap-3 text-xs text-[#64748B]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#94A3B8]" />
            {new Date(entry.createdAt).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span>•</span>
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{readTimeMin} min read</span>

          {entry.isEncrypted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB] border border-[#DBEAFE]">
              <Lock className="h-3 w-3" />
              Zero-Knowledge Encrypted
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Angle Expander Trigger */}
          <button
            id="editor-expand-angle-btn"
            onClick={onOpenBrainstormExpander}
            className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all shadow-xs"
            title="Generate 4 Divergent Brainstorm Angles on this text"
          >
            <Zap className="h-3.5 w-3.5 text-[#2563EB]" />
            <span className="hidden sm:inline">Brainstorm Angles</span>
          </button>

          {/* AI Summarize Trigger */}
          <button
            id="summarize-entry-btn"
            onClick={onSummarize}
            disabled={isSummarizing || (!entry.content.trim() && entry.messages.length === 0)}
            className="flex items-center gap-1.5 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-100 disabled:opacity-40 transition-all shadow-xs"
            title="Analyze and auto-synthesize executive summary with Gemini"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
            <span>{isSummarizing ? 'Synthesizing...' : 'Summarize'}</span>
          </button>

          {/* Save Button */}
          <button
            id="save-entry-btn"
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-[#0F172A] hover:bg-black px-3 py-1.5 text-xs font-medium text-white transition-all disabled:opacity-50 shadow-xs"
            title="Save to Isolated Firestore"
          >
            {justSaved ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">Saved</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 text-[#94A3B8]" />
                <span>Save</span>
              </>
            )}
          </button>

          {/* Export Button */}
          <button
            id="open-export-btn"
            onClick={onOpenExport}
            className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-colors shadow-xs"
            title="Export Markdown / Backup"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Delete Button */}
          <button
            id="delete-entry-btn"
            onClick={onDelete}
            className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors shadow-xs"
            title="Delete this journal entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
        {/* Title Input */}
        <input
          id="journal-title-input"
          type="text"
          value={entry.title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Untitled Journal Reflection..."
          className="w-full bg-transparent text-xl md:text-2xl font-bold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none tracking-tight"
        />

        {/* Tags Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-[#F1F5F9] px-2.5 py-0.5 text-xs text-[#475569] border border-[#E2E8F0]"
            >
              <span>#{tag}</span>
              <button
                onClick={() => onRemoveTag(tag)}
                className="text-[#94A3B8] hover:text-rose-600 transition-colors"
              >
                ×
              </button>
            </span>
          ))}

          <form onSubmit={handleTagSubmit} className="inline-block">
            <input
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="+ add tag"
              className="w-20 rounded-md bg-transparent px-2 py-0.5 text-xs text-[#64748B] placeholder-[#94A3B8] focus:w-32 focus:border focus:border-[#CBD5E1] focus:outline-none transition-all"
            />
          </form>
        </div>

        {/* Content Area */}
        <textarea
          id="journal-content-textarea"
          value={entry.content}
          onChange={(e) => onChangeContent(e.target.value)}
          placeholder="Pour your thoughts, questions, dilemmas, or brainstorm sparks here...

You can chat with Gemini on the right to deconstruct, brainstorm, or explore angles, then synthesize everything with one click."
          className="w-full flex-1 resize-none bg-transparent text-sm leading-relaxed text-[#1E293B] placeholder-[#94A3B8] focus:outline-none font-sans min-h-[320px]"
        />
      </div>
    </div>
  );
};
