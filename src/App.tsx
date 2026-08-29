import React, { useState, useEffect, useRef } from 'react';
import {
  auth,
  onAuthStateChanged,
  logOut,
  getUserJournalsRef,
  saveJournalToFirestore,
  deleteJournalFromFirestore,
  type User,
} from './lib/firebase';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { encryptText, decryptText } from './lib/crypto';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { SecurityTelemetryModal } from './components/SecurityTelemetryModal';
import { VaultModal } from './components/VaultModal';
import { BrainstormExpanderModal } from './components/BrainstormExpanderModal';
import { ExportModal } from './components/ExportModal';
import { JournalList } from './components/JournalList';
import { JournalEditor } from './components/JournalEditor';
import { JournalChat } from './components/JournalChat';
import { SummaryCard } from './components/SummaryCard';
import type { JournalEntry, ChatMessage, PersonaType, JournalSummary } from './types';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
  Layers,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'gemini_journal_local_entries';
const VAULT_SESSION_KEY = 'gemini_journal_vault_key';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'chat' | 'summary'>('editor');
  const [activePersona, setActivePersona] = useState<PersonaType>('socratic');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [telemetryModalOpen, setTelemetryModalOpen] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [expanderModalOpen, setExpanderModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Vault & Encryption
  const [vaultPassphrase, setVaultPassphrase] = useState<string | null>(null);
  const isVaultUnlocked = Boolean(vaultPassphrase);

  // AI & Processing States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Default seed entry generator
  const createNewEmptyEntry = (userId = 'local'): JournalEntry => ({
    id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    title: '',
    content: '',
    messages: [],
    persona: activePersona,
    tags: ['Reflection'],
    wordCount: 0,
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore when user is authenticated, or load LocalStorage fallback
  useEffect(() => {
    if (!authChecked) return;

    if (user) {
      try {
        const q = query(getUserJournalsRef(user.uid), orderBy('updatedAt', 'desc'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const loaded: JournalEntry[] = [];
            snapshot.forEach((doc) => {
              loaded.push(doc.data() as JournalEntry);
            });

            if (loaded.length === 0) {
              // Create initial welcome entry for new user
              const initial = createNewEmptyEntry(user.uid);
              initial.title = 'Welcome to Your Secure Personal Journal';
              initial.content = `Welcome! This is your private, zero-trust personal sanctuary powered by Gemini.

Here is what makes your journal secure and unique:
- 🛡️ **Isolated Firestore Storage**: Only your authenticated account can access this data.
- ⚡ **Multi-Turn Brainstorming**: Gemini assists with high-leverage reframing, Socratic inquiries, and actionable next steps.
- 🔒 **Zero-Knowledge Vault Mode**: Encrypt sensitive reflections with client-side AES-256 before syncing.
- 🌟 **Cognitive Summarization**: Auto-extract executive takeaways, mood indexes, and action items.`;
              initial.tags = ['Welcome', 'Security', 'Gemini'];
              saveJournalToFirestore(user.uid, initial);
              setEntries([initial]);
              setSelectedEntryId(initial.id);
            } else {
              setEntries(loaded);
              if (!selectedEntryId && loaded.length > 0) {
                setSelectedEntryId(loaded[0].id);
              }
            }
          },
          (error) => {
            console.error('Firestore snapshot subscription error:', error);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.error('Firestore query initialization error:', err);
      }
    } else {
      // Local storage fallback for unauthenticated guest sessions
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setEntries(parsed);
          if (parsed.length > 0 && !selectedEntryId) {
            setSelectedEntryId(parsed[0].id);
          }
        } catch {
          const first = createNewEmptyEntry();
          setEntries([first]);
          setSelectedEntryId(first.id);
        }
      } else {
        const initial = createNewEmptyEntry();
        initial.title = 'My First Brainstorming Session';
        initial.content = `Start writing your thoughts here, or use the interactive Gemini panel on the right to brainstorm...`;
        setEntries([initial]);
        setSelectedEntryId(initial.id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([initial]));
      }
    }
  }, [user, authChecked]);

  // Current active journal entry
  const currentEntry =
    entries.find((e) => e.id === selectedEntryId) ||
    entries[0] ||
    createNewEmptyEntry(user?.uid || 'local');

  // Persistence helper
  const persistEntry = async (updated: JournalEntry) => {
    // Update local state first
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

    if (user) {
      setIsSaving(true);
      try {
        let entryToSave = { ...updated };
        // If vault is unlocked and user wants encryption, encrypt the content
        if (isVaultUnlocked && vaultPassphrase) {
          const encrypted = await encryptText(updated.content, vaultPassphrase);
          entryToSave = {
            ...entryToSave,
            isEncrypted: true,
            encryptedData: encrypted,
          };
        }
        await saveJournalToFirestore(user.uid, entryToSave);
      } catch (err) {
        console.error('Failed to save to Firestore:', err);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Local storage save
      const nextList = entries.map((e) => (e.id === updated.id ? updated : e));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
    }
  };

  // Actions
  const handleNewJournal = () => {
    const newEntry = createNewEmptyEntry(user?.uid || 'local');
    const nextList = [newEntry, ...entries];
    setEntries(nextList);
    setSelectedEntryId(newEntry.id);
    if (user) {
      saveJournalToFirestore(user.uid, newEntry);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this journal entry?')) {
      const filtered = entries.filter((e) => e.id !== id);
      setEntries(filtered);
      if (selectedEntryId === id) {
        setSelectedEntryId(filtered[0]?.id || null);
      }
      if (user) {
        await deleteJournalFromFirestore(user.uid, id);
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    }
  };

  const handleTogglePin = (id: string) => {
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    const updated = { ...target, pinned: !target.pinned, updatedAt: Date.now() };
    persistEntry(updated);
  };

  const handleUpdateTitle = (title: string) => {
    const updated = { ...currentEntry, title, updatedAt: Date.now() };
    persistEntry(updated);
  };

  const handleUpdateContent = (content: string) => {
    const updated = {
      ...currentEntry,
      content,
      wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
      updatedAt: Date.now(),
    };
    persistEntry(updated);
  };

  const handleAddTag = (tag: string) => {
    if (currentEntry.tags.includes(tag)) return;
    const updated = {
      ...currentEntry,
      tags: [...currentEntry.tags, tag],
      updatedAt: Date.now(),
    };
    persistEntry(updated);
  };

  const handleRemoveTag = (tag: string) => {
    const updated = {
      ...currentEntry,
      tags: currentEntry.tags.filter((t) => t !== tag),
      updatedAt: Date.now(),
    };
    persistEntry(updated);
  };

  // Send message to Gemini server endpoint
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isAiLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...(currentEntry.messages || []), userMessage];
    const updatedEntryWithUser = {
      ...currentEntry,
      messages: newMessages,
      updatedAt: Date.now(),
    };

    persistEntry(updatedEntryWithUser);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          persona: activePersona,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const modelMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'model',
          content: data.reply,
          timestamp: Date.now(),
        };

        const finalEntry = {
          ...updatedEntryWithUser,
          messages: [...newMessages, modelMessage],
          updatedAt: Date.now(),
        };
        persistEntry(finalEntry);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Automated Cognitive Summarization with Gemini
  const handleSummarize = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentEntry.content,
          conversationHistory: currentEntry.messages,
          existingTitle: currentEntry.title,
        }),
      });

      const data = await response.json();
      if (data.analysis) {
        const analysis: JournalSummary = data.analysis;

        const updated: JournalEntry = {
          ...currentEntry,
          title: currentEntry.title || analysis.title,
          summary: analysis,
          tags: Array.from(new Set([...currentEntry.tags, ...(analysis.tags || [])])),
          moodScore: analysis.sentiment?.score,
          updatedAt: Date.now(),
        };

        persistEntry(updated);

        // Confetti celebration for synthesis
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f59e0b', '#10b981', '#6366f1'],
        });
      }
    } catch (err) {
      console.error('Summarize error:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleToggleActionItem = (itemId: string) => {
    if (!currentEntry.summary?.actionItems) return;
    const nextActions = currentEntry.summary.actionItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updated: JournalEntry = {
      ...currentEntry,
      summary: {
        ...currentEntry.summary,
        actionItems: nextActions,
      },
      updatedAt: Date.now(),
    };
    persistEntry(updated);
  };

  const handleUnlockVault = async (pass: string) => {
    setVaultPassphrase(pass);
    // If current entry was encrypted, attempt decryption
    if (currentEntry.isEncrypted && currentEntry.encryptedData) {
      try {
        const plain = await decryptText(currentEntry.encryptedData, pass);
        const updated = { ...currentEntry, content: plain };
        setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } catch (err) {
        alert('Invalid passphrase. Unable to decrypt entry.');
      }
    }
  };

  const handleLockVault = () => {
    setVaultPassphrase(null);
  };

  return (
    <div id="app-root-container" className="flex flex-col h-screen w-full bg-[#F8FAFC] text-[#1E293B] font-sans antialiased overflow-hidden select-none sm:select-auto">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={logOut}
        onNewJournal={handleNewJournal}
        onOpenTelemetry={() => setTelemetryModalOpen(true)}
        onToggleVault={() => setVaultModalOpen(true)}
        isVaultUnlocked={isVaultUnlocked}
        vaultPassphraseSet={Boolean(vaultPassphrase)}
        activePersona={activePersona}
        onChangePersona={(p) => setActivePersona(p)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onOpenBrainstormExpander={() => setExpanderModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Journal History & Search */}
        {sidebarOpen && (
          <JournalList
            entries={entries}
            selectedEntryId={currentEntry.id}
            onSelectEntry={(e) => setSelectedEntryId(e.id)}
            onNewEntry={handleNewJournal}
            onDeleteEntry={handleDeleteEntry}
            onTogglePin={handleTogglePin}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        )}

        {/* Center / Right Content Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-hidden relative">
          {/* Subtle Clean Ambient Gradient */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#F1F5F9]/60 to-transparent pointer-events-none" />

          {/* Mobile Workspace Tabs Header */}
          <div className="flex lg:hidden items-center justify-around border-b border-[#E2E8F0] bg-white px-2 py-2 z-10">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Notes Pad</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Gemini Chat ({currentEntry.messages?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'summary'
                  ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Insights</span>
            </button>
          </div>

          {/* Desktop Dual/Triple-Pane Workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3.5 overflow-hidden z-0">
            {/* Column 1: Journal Editor (Notes & Writing) */}
            <div
              className={`h-full overflow-hidden ${
                activeTab === 'editor' ? 'col-span-12 lg:col-span-4' : 'hidden lg:block lg:col-span-4'
              }`}
            >
              <JournalEditor
                entry={currentEntry}
                onChangeContent={handleUpdateContent}
                onChangeTitle={handleUpdateTitle}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                onSave={() => persistEntry(currentEntry)}
                onDelete={() => handleDeleteEntry(currentEntry.id)}
                onOpenExport={() => setExportModalOpen(true)}
                onSummarize={handleSummarize}
                isSummarizing={isSummarizing}
                isSaving={isSaving}
                isVaultUnlocked={isVaultUnlocked}
                onOpenBrainstormExpander={() => setExpanderModalOpen(true)}
              />
            </div>

            {/* Column 2: Gemini Brainstorming Chat */}
            <div
              className={`h-full overflow-hidden ${
                activeTab === 'chat' ? 'col-span-12 lg:col-span-4' : 'hidden lg:block lg:col-span-4'
              }`}
            >
              <JournalChat
                messages={currentEntry.messages || []}
                onSendMessage={handleSendMessage}
                isLoading={isAiLoading}
                activePersona={activePersona}
                onClearChat={() => {
                  persistEntry({ ...currentEntry, messages: [] });
                }}
              />
            </div>

            {/* Column 3: AI Cognitive Summary, Action Items & Concept Map */}
            <div
              className={`h-full overflow-y-auto space-y-3 pr-1 ${
                activeTab === 'summary' ? 'col-span-12 lg:col-span-4' : 'hidden lg:block lg:col-span-4'
              }`}
            >
              <SummaryCard
                summary={currentEntry.summary || null}
                onToggleActionItem={handleToggleActionItem}
                onRefreshSummary={handleSummarize}
                isSummarizing={isSummarizing}
                onApplyPromptToChat={(prompt) => {
                  handleSendMessage(prompt);
                  setActiveTab('chat');
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

      <SecurityTelemetryModal
        isOpen={telemetryModalOpen}
        onClose={() => setTelemetryModalOpen(false)}
        user={user}
        isVaultUnlocked={isVaultUnlocked}
      />

      <VaultModal
        isOpen={vaultModalOpen}
        onClose={() => setVaultModalOpen(false)}
        isUnlocked={isVaultUnlocked}
        onUnlock={handleUnlockVault}
        onLock={handleLockVault}
        hasStoredKey={false}
      />

      <BrainstormExpanderModal
        isOpen={expanderModalOpen}
        onClose={() => setExpanderModalOpen(false)}
        currentIdea={currentEntry.title || currentEntry.content.slice(0, 200)}
        onApplyAngleToChat={(text) => {
          handleSendMessage(text);
          setActiveTab('chat');
        }}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        entry={currentEntry}
      />
    </div>
  );
}
