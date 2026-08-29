import React, { useState } from 'react';
import {
  Download,
  X,
  FileText,
  Copy,
  Check,
  Printer,
  Sparkles,
} from 'lucide-react';
import type { JournalEntry } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, entry }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !entry) return null;

  const generateMarkdown = () => {
    let md = `# ${entry.title || 'Untitled Journal Entry'}\n\n`;
    md += `*Created: ${new Date(entry.createdAt).toLocaleDateString()} | Persona: ${entry.persona}*\n\n`;

    if (entry.summary) {
      md += `## 🌟 Executive Summary\n${entry.summary.summary}\n\n`;
      if (entry.summary.sentiment) {
        md += `**Sentiment Index:** ${entry.summary.sentiment.label} (Score: ${entry.summary.sentiment.score})\n\n`;
      }
      if (entry.summary.keyInsights?.length) {
        md += `### 💡 Key Insights\n`;
        entry.summary.keyInsights.forEach((insight) => {
          md += `- ${insight}\n`;
        });
        md += `\n`;
      }
      if (entry.summary.actionItems?.length) {
        md += `### ✅ Action Items\n`;
        entry.summary.actionItems.forEach((item) => {
          md += `- [${item.completed ? 'x' : ' '}] ${item.text} ${item.priority ? `*(${item.priority})*` : ''}\n`;
        });
        md += `\n`;
      }
    }

    if (entry.content) {
      md += `## ✍️ Journal Notes\n${entry.content}\n\n`;
    }

    if (entry.messages?.length) {
      md += `## 💬 Gemini Brainstorming Transcript\n\n`;
      entry.messages.forEach((m) => {
        md += `**${m.role === 'user' ? 'You' : 'Gemini'}** (${new Date(m.timestamp).toLocaleTimeString()}):\n${m.content}\n\n`;
      });
    }

    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(entry.title || 'journal-entry').toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(entry, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(entry.title || 'journal-entry').toLowerCase().replace(/\s+/g, '-')}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="export-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="export-modal-container"
        className="w-full max-w-xl rounded-xl border border-[#E2E8F0] bg-white shadow-2xl p-6 relative max-h-[90vh] flex flex-col"
      >
        <button
          id="close-export-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] shadow-xs">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Export & Backup Journal</h2>
            <p className="text-xs text-[#64748B]">
              Download high-fidelity Markdown, raw JSON, or copy to clipboard
            </p>
          </div>
        </div>

        {/* Markdown Preview Area */}
        <div className="flex-1 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs font-mono text-[#334155] mb-4 max-h-64 whitespace-pre-wrap selection:bg-[#2563EB]/10">
          {generateMarkdown()}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            id="copy-markdown-btn"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all shadow-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#10B981]" /> : <Copy className="h-3.5 w-3.5 text-[#64748B]" />}
            <span>{copied ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            id="download-md-btn"
            onClick={handleDownloadMarkdown}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all shadow-xs"
          >
            <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>Save .MD</span>
          </button>

          <button
            id="download-json-btn"
            onClick={handleDownloadJSON}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-[#0EA5E9]" />
            <span>JSON Backup</span>
          </button>

          <button
            id="print-journal-btn"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Print View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
