export type PersonaType = 'socratic' | 'brainstormer' | 'mindfulness' | 'executive' | 'deconstruct';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: string;
  primaryEmotion?: string;
}

export interface MindNode {
  id: string;
  label: string;
  type: 'root' | 'branch' | 'leaf';
}

export interface JournalSummary {
  title: string;
  summary: string;
  sentiment: SentimentAnalysis;
  keyInsights: string[];
  actionItems: ActionItem[];
  tags: string[];
  reflectionPrompts: string[];
  mindNodes?: MindNode[];
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string; // Plain text or markdown
  isEncrypted?: boolean;
  encryptedData?: {
    cipherText: string;
    iv: string;
    salt: string;
  };
  messages: ChatMessage[];
  summary?: JournalSummary;
  persona: PersonaType;
  tags: string[];
  moodScore?: number; // 1-5 or -1.0-1.0
  wordCount: number;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SecurityTelemetry {
  zeroTrustEnabled: boolean;
  serverSideProxyActive: boolean;
  apiKeyConfigured: boolean;
  keyLocation: string;
  isolationModel: string;
  vaultEncryptionSupported: string;
  timestamp: string;
}

export interface BrainstormAngle {
  title: string;
  description: string;
}
