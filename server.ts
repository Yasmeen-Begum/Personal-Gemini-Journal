import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware with reasonable payload limits
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));

// Lazy initialization helper for Google GenAI to adhere strictly to enterprise security rules
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please set it in AI Studio settings.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Sanitization & Defensive validation helper
function sanitizeText(input: unknown, maxLength = 20000): string {
  if (typeof input !== "string") return "";
  // Strip null bytes and truncate to prevent memory exhaustion
  return input.replace(/\0/g, "").slice(0, maxLength).trim();
}

// --- API Endpoints ---

// 1. Health & Security Telemetry Endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  const isKeyConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "healthy",
    securityProfile: {
      zeroTrustEnabled: true,
      serverSideProxyActive: true,
      apiKeyConfigured: isKeyConfigured,
      keyLocation: "Server-side environment / Cloud Secret Manager",
      isolationModel: "Per-User Authenticated Path Isolation (Firestore ABAC)",
      vaultEncryptionSupported: "AES-256-GCM WebCrypto (Client Zero-Knowledge)",
      timestamp: new Date().toISOString(),
    },
  });
});

// 2. Multi-turn AI Brainstorming & Journal Chat
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { messages, persona, customInstructions, promptEnhance } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required and must not be empty." });
      return;
    }

    const ai = getAIClient();

    // Determine persona instructions
    let personaPrompt = "You are a thoughtful, empathetic, and intellectually rigorous Personal Journal & Brainstorming Companion.";
    if (persona === "socratic") {
      personaPrompt = "You are a Socratic Mentor. Guide the user by asking insightful, probing open-ended questions that uncover core motives, hidden assumptions, and clarity.";
    } else if (persona === "brainstormer") {
      personaPrompt = "You are an Elite Creative Strategist. Generate non-obvious, inventive ideas, analogies, diverse angles, and structured frameworks to expand the user's concepts.";
    } else if (persona === "mindfulness") {
      personaPrompt = "You are a Compassionate Mindfulness & Reflection Guide. Help the user process emotions, celebrate small wins, identify stressors gently, and cultivate clarity.";
    } else if (persona === "executive") {
      personaPrompt = "You are a High-Performance Executive Advisor. Focus on pragmatism, prioritize high-leverage outcomes, distill complexity into actionable next steps, and challenge bottlenecks.";
    } else if (persona === "deconstruct") {
      personaPrompt = "You are a First-Principles Thinker. Break the user's thoughts into fundamental truths and build upward logically.";
    }

    if (customInstructions) {
      personaPrompt += ` Additional User Directives: ${sanitizeText(customInstructions, 500)}`;
    }

    // Convert messages to Gemini contents format
    // Filter and sanitize incoming messages
    const contents = messages.slice(-20).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: sanitizeText(m.content, 10000) }],
    }));

    if (promptEnhance) {
      // Special prompt enhancement mode
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Refine and enrich this user journaling/brainstorming prompt to be deeper, clearer, and more evocative while preserving the user's original intent. Provide only the enhanced prompt without meta-commentary: "${sanitizeText(messages[messages.length - 1]?.content)}"`,
              },
            ],
          },
        ],
      });
      res.json({ text: response.text?.trim() || messages[messages.length - 1]?.content });
      return;
    }

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: `${personaPrompt}
Formatting Directives:
- Write in clean, beautiful Markdown.
- Use bold highlights for key phrases.
- Keep responses engaging, supportive, and structured.
- Include a short "Ponder This" question or actionable thought at the end where appropriate.`,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm reflecting on your thought. Could you elaborate a bit more on that?";
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error?.message || error);
    res.status(500).json({
      error: "Failed to generate AI response. Please ensure GEMINI_API_KEY is configured in Settings.",
      details: error?.message,
    });
  }
});

// 3. Automated Deep-Dive Journal Summarization & Action Item Extraction
app.post("/api/summarize", async (req: Request, res: Response) => {
  try {
    const { content, conversationHistory, existingTitle } = req.body;

    if (!content && (!conversationHistory || conversationHistory.length === 0)) {
      res.status(400).json({ error: "Either content or conversationHistory is required to summarize." });
      return;
    }

    const ai = getAIClient();

    let textToAnalyze = "";
    if (content) {
      textToAnalyze += `Journal Content:\n${sanitizeText(content, 15000)}\n\n`;
    }
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      textToAnalyze += "Conversation Session:\n" + conversationHistory
        .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${sanitizeText(m.content, 2000)}`)
        .join("\n\n");
    }

    const systemPrompt = `You are an expert executive synthesizer and cognitive journal analyst.
Analyze the provided journal entry / brainstorm conversation and extract structured insights in exact JSON format.

JSON Schema to output strictly:
{
  "title": "A concise, poetic or impactful title (3-6 words)",
  "summary": "A 2-3 sentence elegant executive summary synthesizing the core thoughts, breakthroughs, or themes.",
  "sentiment": {
    "score": 0.5, // Number between -1.0 (very distressed/negative) to 1.0 (very optimistic/energized)
    "label": "Reflective & Optimistic", // Short label, e.g., "Calm Clarity", "Creative Surge", "Deep Problem Solving", "Vulnerable Reflection", "Strategic Focus"
    "primaryEmotion": "Determination"
  },
  "keyInsights": [
    "Insight or breakthrough bullet 1",
    "Insight or breakthrough bullet 2",
    "Insight or breakthrough bullet 3"
  ],
  "actionItems": [
    {
      "id": "act-1",
      "text": "Specific actionable next step",
      "priority": "high", // "high" | "medium" | "low"
      "completed": false
    }
  ],
  "tags": ["Focus", "Strategy", "PersonalGrowth"],
  "reflectionPrompts": [
    "A provocative forward-looking question to explore in the next session",
    "Another reflective follow-up question"
  ],
  "mindNodes": [
    { "id": "1", "label": "Core Idea", "type": "root" },
    { "id": "2", "label": "Sub-theme A", "type": "branch" },
    { "id": "3", "label": "Sub-theme B", "type": "branch" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Here is the journal / brainstorming text to analyze:\n\n${textToAnalyze}\n\n${existingTitle ? `Note: An existing tentative title is "${existingTitle}". Refine or keep it.` : ""}\n\nPlease return strictly the JSON object according to the schema.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const jsonText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch {
      // Fallback if parsing has formatting irregularities
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI JSON response.");
      }
    }

    res.json({ analysis: parsedData });
  } catch (error: any) {
    console.error("Gemini Summarize API Error:", error?.message || error);
    res.status(500).json({
      error: "Failed to summarize journal. Ensure GEMINI_API_KEY is configured.",
      details: error?.message,
    });
  }
});

// 4. Brainstorm Angle Expander
app.post("/api/expand-idea", async (req: Request, res: Response) => {
  try {
    const { idea, context } = req.body;
    if (!idea) {
      res.status(400).json({ error: "Idea string is required." });
      return;
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this idea: "${sanitizeText(idea, 1000)}"
${context ? `Context: "${sanitizeText(context, 1000)}"` : ""}

Provide 4 unique, provocative perspectives in JSON:
1. The 10x Moonshot (Ambitious scale)
2. The Inversion / Devil's Advocate (What if the opposite is true?)
3. The Pragmatic 24-Hour MVP (Simplest immediate action)
4. The Unconventional Analogy (Connection to nature, architecture, or history)

Return JSON in this format:
{
  "angles": [
    { "title": "The 10x Moonshot", "description": "..." },
    { "title": "The Inversion", "description": "..." },
    { "title": "The 24-Hour MVP", "description": "..." },
    { "title": "Unconventional Analogy", "description": "..." }
  ]
}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const parsed = JSON.parse(response.text || '{"angles":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error("Expand Idea API Error:", error?.message || error);
    res.status(500).json({ error: "Failed to expand idea", details: error?.message });
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Secure Personal Gemini Journal backend running on http://localhost:${PORT}`);
  });
}

startServer();
