import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// API Security: Lightweight IP-based rate limiter to protect Gemini/Firebase free tiers
const clients = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_ANALYZES_PER_WINDOW = 3;  // Maximum of 3 AI analyses per minute per IP

function analyzeRateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || (req.headers["x-forwarded-for"] as string) || "unknown_ip";
  const now = Date.now();

  const clientData = clients.get(ip) || { count: 0, lastReset: now };

  if (now - clientData.lastReset > RATE_LIMIT_WINDOW_MS) {
    clientData.count = 1;
    clientData.lastReset = now;
  } else {
    clientData.count += 1;
  }

  clients.set(ip, clientData);

  res.setHeader("X-RateLimit-Limit", MAX_ANALYZES_PER_WINDOW);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, MAX_ANALYZES_PER_WINDOW - clientData.count));

  if (clientData.count > MAX_ANALYZES_PER_WINDOW) {
    return res.status(429).json({
      error: "Rate limit exceeded. System calibrated to prevent quota exhaustion. Please wait 60 seconds before building another path."
    });
  }

  next();
}

// Shared schema for a single action task
const ACTION_TASK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    cadence: { type: Type.STRING }, // "weekly" | "monthly" | "quarterly" | "yearly"
    category: { type: Type.STRING }, // "career" | "financial" | "skill" | "network" | "health" | "business"
    priority: { type: Type.STRING }, // "critical" | "high" | "medium" | "low"
    targetMonth: { type: Type.NUMBER }, // e.g. 1 = first month, 3 = month 3, 12 = end of year 1
  },
  required: ["id", "title", "description", "cadence", "category", "priority", "targetMonth"]
};

// Shared scenario schema (used for both analyze and replan)
const SCENARIO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    risk: { type: Type.STRING },
    viability: { type: Type.NUMBER },
    description: { type: Type.STRING },
    yearlyModifiers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.NUMBER },
          salaryMult: { type: Type.NUMBER },
          savingsMult: { type: Type.NUMBER },
          notes: { type: Type.STRING }
        },
        required: ["year", "salaryMult", "savingsMult", "notes"]
      }
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        fiveYearSalary: { type: Type.NUMBER },
        fiveYearSavings: { type: Type.NUMBER },
        confidence: { type: Type.STRING }
      },
      required: ["fiveYearSalary", "fiveYearSavings", "confidence"]
    },
    riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
    winningMoves: { type: Type.ARRAY, items: { type: Type.STRING } },
    milestones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.NUMBER },
          type: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["year", "type", "content"]
      }
    },
    actionPlan: {
      type: Type.ARRAY,
      items: ACTION_TASK_SCHEMA
    }
  },
  required: ["id", "title", "subtitle", "risk", "viability", "description", "stats", "milestones", "actionPlan"]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const origin = req.headers.origin || "";
    const allowed = [
      "https://arshmind2.web.app",
      "https://arshmind2.firebaseapp.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ];
    if (!origin || allowed.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // API Routes
  app.post("/api/analyze", analyzeRateLimiter, async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const serverTimeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ error: "Analysis timed out on server. Please try again." });
      }
    }, 55000);

    try {
      const { profile } = req.body;

      const prompt = `
        As ArshMind, a futuristic financial and career advisor, analyze this user profile and generate 6 specific career/life scenarios.
        
        User Profile:
        ${JSON.stringify(profile, null, 2)}

        For each scenario, provide:
        1. id (e.g., 'upskill', 'venture', 'relocated')
        2. title
        3. subtitle
        4. risk (Low, Medium, High)
        5. viability (0-100)
        6. description
        7. yearlyModifiers (Year 1/2/3/5/10 salary/savings multipliers and notes)
        8. stats (5-year salary projection, 5-year savings projection, confidence range)
        9. riskFactors (list of warnings)
        10. winningMoves (list of tips)
        11. milestones (career, lifestyle milestones for years 3, 5, 10)
        12. actionPlan: A concrete list of 8-12 actionable tasks specific to this scenario and the user's profile.
            Each task must have:
            - id: unique string like "task_upskill_01"
            - title: short action title (max 8 words)
            - description: 1-2 sentence concrete description of what to do
            - cadence: one of "weekly" | "monthly" | "quarterly" | "yearly"
            - category: one of "career" | "financial" | "skill" | "network" | "health" | "business"
            - priority: one of "critical" | "high" | "medium" | "low"
            - targetMonth: integer 1-36 indicating which month from now to start/complete this task
            Tasks should be ordered by targetMonth, covering the first 3 years (36 months), spread across all timeframes. Include a mix of immediate (month 1-3), short-term (month 3-12), medium-term (month 12-24), and long-term (month 24-36) tasks.

        The scenarios should be: Upskill & Switch, Stay & Optimize, Launch Own Venture, Relocate to New Market, Build Passive Income, Go Freelance.

        Return ONLY a JSON object with the key "scenarios" containing an array of these scenarios.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenarios: {
                type: Type.ARRAY,
                items: SCENARIO_SCHEMA
              }
            },
            required: ["scenarios"]
          }
        }
      });

      clearTimeout(serverTimeout);

      const text = response.text;
      if (!text) {
        console.error("AI returned empty text");
        throw new Error("Empty response from AI");
      }
      console.log("AI Analysis Successful");
      if (!res.headersSent) res.json(JSON.parse(text));
    } catch (error) {
      clearTimeout(serverTimeout);
      console.error("AI Analysis Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    }
  });

  app.post("/api/replan-path", analyzeRateLimiter, async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const serverTimeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ error: "Re-calibration timed out on server. Please try again." });
      }
    }, 55000);

    try {
      const { profile, scenario, feedback } = req.body;

      const prompt = `
        As ArshMind, a futuristic financial and career advisor, modify this specific career/life scenario path according to the user's feedback (e.g. key constraints, limitations, problems, or adjusted expectations). Ensure the updated trajectory route satisfies their new description while keeping the math as realistic as possible for their financial profile.
        
        User Profile:
        ${JSON.stringify(profile, null, 2)}

        Original Path Scenario:
        ${JSON.stringify(scenario, null, 2)}

        User constraints/expectations/problems:
        "${feedback}"

        Please produce a newly calibrated scenario object. You can update the title suffix to reflect that it is custom/re-calibrated (e.g. "${scenario.title} (Re-calibrated)") and update the description, risk, viability, yearlyModifiers, stats, riskFactors, winningMoves, milestones, and actionPlan to address the feedback.
        
        For actionPlan: regenerate 8-12 tasks that reflect the new constraints. Keep the same task structure.
        
        Keep the ID the same ("${scenario.id}").

        Return ONLY a JSON object containing the newly calibrated scenario. Do NOT wrap it in any other outer keys or objects.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            ...SCENARIO_SCHEMA,
            required: [...(SCENARIO_SCHEMA.required || []), "yearlyModifiers", "riskFactors", "winningMoves"]
          }
        }
      });

      clearTimeout(serverTimeout);

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI re-calibration engine");
      }
      console.log("AI Re-calibration Successful");
      if (!res.headersSent) res.json(JSON.parse(text));
    } catch (error) {
      clearTimeout(serverTimeout);
      console.error("AI Re-calibration Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();