import React, { useState } from 'react';
import {
  Search,
  Plus,
  Pin,
  Lock,
  Sparkles,
  Calendar,
  Tag,
  CheckCircle2,
  Trash2,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import type { JournalEntry } from '../types';

interface JournalListProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
  onTogglePin: (entryId: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const JournalList: React.FC<JournalListProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  onTogglePin,
  selectedTag,
  onSelectTag,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all unique tags
  const allTags = Array.from(
    new Set(entries.flatMap((entry) => entry.tags || []))
  );

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      (entry.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.summary?.summary || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag ? entry.tags?.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  // Sort pinned first, then newest updated
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
  });

  return (
    <aside
      id="journal-sidebar"
      className="flex flex-col h-full w-72 shrink-0 border-r border-[#E2E8F0] bg-white overflow-hidden"
    >
      {/* Top Header & Search */}
      <div className="p-4 border-b border-[#E2E8F0] space-y-3">
        <button
          id="sidebar-new-journal-btn"
          onClick={onNewEntry}
          className="w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors shadow-sm flex items-center justify-center gap-1.5"
          title="Create new journal session"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+ New Journal Entry</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
          <input
            id="journal-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, tags, insights..."
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 focus:outline-none transition-all"
          />
        </div>

        {/* Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 max-h-16 overflow-y-auto">
            <button
              onClick={() => onSelectTag(null)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                selectedTag === null
                  ? 'bg-[#0F172A] text-white font-semibold'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#1E293B]'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#1E293B]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] px-1 mb-2">
          Recent Entries ({sortedEntries.length})
        </h3>
        {sortedEntries.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#94A3B8]">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-[#CBD5E1]" />
            <p>No journal entries found.</p>
          </div>
        ) : (
          sortedEntries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            const completedActions = entry.summary?.actionItems?.filter((a) => a.completed).length || 0;
            const totalActions = entry.summary?.actionItems?.length || 0;

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className={`group relative rounded-lg p-3 text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-[#E2E8F0] bg-[#F8FAFC] shadow-xs'
                    : 'border-transparent hover:bg-[#F8FAFC] hover:border-[#E2E8F0]'
                }`}
              >
                {/* Top Row: Title + Pin */}
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <h4 className="font-semibold text-xs text-[#1E293B] line-clamp-1 flex-1">
                    {entry.title || 'Untitled Journal'}
                  </h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(entry.id);
                      }}
                      className={`p-0.5 rounded hover:text-[#2563EB] ${
                        entry.pinned ? 'text-[#2563EB] opacity-100' : 'text-[#94A3B8]'
                      }`}
                      title={entry.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntry(entry.id);
                      }}
                      className="p-0.5 rounded text-[#94A3B8] hover:text-rose-600"
                      title="Delete entry"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Excerpt / Summary preview */}
                <p className="text-[11px] text-[#64748B] line-clamp-2 mb-2 leading-relaxed">
                  {entry.summary?.summary || entry.content || 'Empty session notes...'}
                </p>

                {/* Footnote: Date + Badges */}
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1.5 border-t border-[#F1F5F9]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(entry.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {entry.isEncrypted && (
                      <span title="Encrypted Vault Entry">
                        <Lock className="h-3 w-3 text-[#2563EB]" />
                      </span>
                    )}
                    {totalActions > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[#10B981] font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>
                          {completedActions}/{totalActions}
                        </span>
                      </span>
                    )}
                    {entry.summary?.sentiment && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                          entry.summary.sentiment.score >= 0.3
                            ? 'bg-emerald-50 text-[#10B981]'
                            : entry.summary.sentiment.score <= -0.2
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {entry.summary.sentiment.label.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-[#E2E8F0] bg-white">
        <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
          <span>Firestore Isolated</span>
          <span className="text-[#2563EB] font-bold">Active</span>
        </div>
      </div>
    </aside>
  );
};
