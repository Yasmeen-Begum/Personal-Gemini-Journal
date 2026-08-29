import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Wand2,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import type { ChatMessage, PersonaType } from '../types';
import { speakText, stopSpeaking, createSpeechRecognizer } from '../lib/audio';

interface JournalChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  activePersona: PersonaType;
  onClearChat?: () => void;
}

export const JournalChat: React.FC<JournalChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  activePersona,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const personaDetails = {
    socratic: { label: 'Socratic Mentor', badge: '🏛️ Probing Inquiry' },
    brainstormer: { label: 'Creative Spark', badge: '💡 Divergent Angles' },
    mindfulness: { label: 'Mindful Guide', badge: '🌿 Emotional Clarity' },
    executive: { label: 'Executive Strategist', badge: '⚡ High Leverage' },
    deconstruct: { label: 'First Principles', badge: '🔬 Core Truths' },
  }[activePersona];

  const quickPrompts = [
    'Help me unpack my main dilemma today.',
    'Give me 3 counter-perspectives to challenge my assumption.',
    'What is the highest-leverage first step here?',
    'How can I reframe this obstacle into a creative catalyst?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        () => setIsRecording(false),
        (err) => {
          console.warn('Speech recognition error:', err);
          setIsRecording(false);
        }
      );

      if (recognizer) {
        recognitionRef.current = recognizer;
        try {
          recognizer.start();
          setIsRecording(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert('Speech recognition is not supported in this browser environment.');
      }
    }
  };

  const handleEnhancePrompt = async () => {
    if (!inputText.trim() || isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: inputText }],
          promptEnhance: true,
        }),
      });
      const data = await res.json();
      if (data.text) {
        setInputText(data.text);
      }
    } catch (err) {
      console.error('Failed to enhance prompt:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleSpeak = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msg.id);
      speakText(msg.content, () => setSpeakingMessageId(null));
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="journal-chat-panel"
      className="flex flex-col h-full rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0F172A]">Gemini Interactive Companion</span>
              <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB] border border-[#DBEAFE]">
                {personaDetails.badge}
              </span>
            </div>
          </div>
        </div>

        {onClearChat && messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="text-[11px] text-[#94A3B8] hover:text-red-600 transition-colors font-medium"
          >
            Clear Transcript
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] shadow-xs">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Start Brainstorming with Gemini
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mt-1">
                Reflect, debate, solve complex problems, or explore stream-of-consciousness ideas. Every word is processed securely server-side.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="w-full max-w-md space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] block text-left">
                Suggested Brainstorm Sparks:
              </span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="w-full text-left text-xs text-[#1E293B] bg-white hover:bg-[#F8FAFC] hover:border-[#2563EB] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 transition-all shadow-xs"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-xs mt-1">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs relative group ${
                  msg.role === 'user'
                    ? 'rounded-tr-none bg-white border border-[#E2E8F0] text-[#1E293B] shadow-sm'
                    : 'rounded-tl-none bg-[#EFF6FF] border border-[#DBEAFE] text-[#1E3A8A] shadow-sm'
                }`}
              >
                {/* Content */}
                <div className="prose prose-xs max-w-none space-y-2 leading-relaxed text-inherit">
                  <Markdown>{msg.content}</Markdown>
                </div>

                {/* Message Footnote / Actions */}
                <div className={`mt-2.5 pt-1.5 border-t flex items-center justify-between text-[10px] ${
                  msg.role === 'user' ? 'border-[#F1F5F9] text-[#94A3B8]' : 'border-[#BFDBFE] text-[#2563EB]'
                }`}>
                  <span className="font-medium opacity-80">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1 hover:text-[#0F172A] rounded transition-colors"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-[#10B981]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                    {msg.role === 'model' && (
                      <button
                        onClick={() => handleSpeak(msg)}
                        className="p-1 hover:text-[#0F172A] rounded transition-colors"
                        title={speakingMessageId === msg.id ? 'Stop reading' : 'Read aloud'}
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="h-3 w-3 text-[#2563EB] animate-pulse" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E2E8F0] text-[#64748B] border border-[#CBD5E1] font-bold text-[10px] mt-1 shadow-xs">
                  JD
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-xs mt-1">
              <Bot className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-none p-3.5 bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#1E3A8A] flex items-center gap-2 shadow-xs">
              <span className="inline-block h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>Gemini is synthesizing response securely...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-[#E2E8F0] bg-white">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition-all shadow-xs">
            <textarea
              id="chat-textarea"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask Gemini about thoughts, angles, or reflections with ${personaDetails.label}...`}
              className="w-full resize-none bg-transparent px-3.5 py-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none"
            />

            <div className="flex items-center justify-between px-2.5 pb-2">
              <div className="flex items-center gap-1.5">
                {/* Speech Recognition Button */}
                <button
                  id="voice-dictate-btn"
                  type="button"
                  onClick={handleToggleRecord}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isRecording
                      ? 'border-red-300 bg-red-50 text-red-600 animate-pulse'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Voice Dictate'}
                >
                  {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>

                {/* Prompt Enhancer Button */}
                <button
                  id="enhance-prompt-btn"
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={!inputText.trim() || isEnhancingPrompt}
                  className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] font-medium text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-40 transition-all shadow-xs"
                  title="Enrich and sharpen this prompt with Gemini"
                >
                  <Wand2 className={`h-3 w-3 ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Enhance</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#94A3B8] hidden sm:inline font-mono">
                  Enter ↵ to send
                </span>
                <button
                  id="send-message-btn"
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="flex items-center justify-center h-7 w-7 rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-40 active:scale-95 transition-all shadow-xs"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
