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

// ── Firebase Admin SDK (server-side, for webhook writes) ──────────────────────
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Firestore } from "firebase-admin/firestore";

let adminDb: Firestore | null = null;

function initFirebaseAdmin() {
  if (getApps().length > 0) {
    adminDb = getFirestore(getApp());
    return;
  }
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.warn("[ArshMind] FIREBASE_SERVICE_ACCOUNT_JSON not set — webhook Pro grants will not work.");
    return;
  }
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    adminDb = getFirestore(app);
    console.log("[ArshMind] Firebase Admin SDK initialized.");
  } catch (e) {
    console.error("[ArshMind] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", e);
  }
}

async function setUserPro(uid: string, isPro: boolean): Promise<void> {
  if (!adminDb) throw new Error("Firebase Admin not initialized");
  await adminDb.collection("users").doc(uid).set(
    { isPro, proUpdatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

// ── Dodo Payments SDK ─────────────────────────────────────────────────────────
import DodoPayments from "dodopayments";

function getDodoClient(): DodoPayments {
  const apiKey = process.env.DODO_API_KEY;
  if (!apiKey) throw new Error("DODO_API_KEY is not set");
  // Use "test_mode" until you switch to production
  const env = process.env.NODE_ENV === "production" ? "live_mode" : "test_mode";
  return new DodoPayments({ bearerToken: apiKey, environment: env });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Raw body buffer needed for Dodo webhook signature verification.
  // Must be registered BEFORE express.json() for the webhook route.
  app.use("/api/webhook/dodo", express.raw({ type: "application/json" }));

  app.use(express.json());

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
      res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Dev-Grant-Secret");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // Init Firebase Admin on startup
  initFirebaseAdmin();

  // ── Existing AI Routes ──────────────────────────────────────────────────────

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

  // ── Dodo Payments Routes ────────────────────────────────────────────────────

  /**
   * POST /api/create-checkout-session
   * Creates a Dodo-hosted payment/subscription checkout URL.
   * Body: { uid: string, email: string, plan: "monthly" | "one_time" }
   * Returns: { checkoutUrl: string }
   */
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { uid, email, plan } = req.body as {
        uid: string;
        email: string;
        plan: "monthly" | "one_time";
      };

      if (!uid || !email || !plan) {
        return res.status(400).json({ error: "Missing required fields: uid, email, plan" });
      }
      if (plan !== "monthly" && plan !== "one_time") {
        return res.status(400).json({ error: "plan must be 'monthly' or 'one_time'" });
      }

      const dodo = getDodoClient();

      // Return URL — comes back to the app after checkout
      const appUrl = process.env.APP_URL || "https://arshmind2.web.app";
      const returnUrl = `${appUrl}?payment=success&uid=${encodeURIComponent(uid)}`;

      const productId = plan === "monthly" 
        ? process.env.DODO_MONTHLY_PRODUCT_ID 
        : process.env.DODO_ONETIME_PRODUCT_ID;

      if (!productId) {
        throw new Error(`DODO_${plan === "monthly" ? "MONTHLY" : "ONETIME"}_PRODUCT_ID not configured`);
      }

      const session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email, name: email.split("@")[0] },
        billing_address: {
          city: "Mumbai",
          country: "IN",
          state: "MH",
          street: "123 Main St",
          zipcode: "400001",
        },
        return_url: returnUrl,
        metadata: { uid, plan },
      });

      const checkoutUrl = session.checkout_url;
      if (!checkoutUrl) throw new Error("No checkout URL returned from Dodo");

      console.log(`[Dodo] Checkout session created for uid=${uid} plan=${plan}`);
      return res.json({ checkoutUrl });

    } catch (error) {
      console.error("[Dodo] create-checkout-session error:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create checkout session"
      });
    }
  });

  /**
   * POST /api/webhook/dodo
   * Receives Dodo payment events and grants/revokes Pro access.
   * Body is raw (Buffer) for signature verification.
   */
  app.post("/api/webhook/dodo", async (req, res) => {
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Dodo Webhook] DODO_WEBHOOK_SECRET not set — rejecting all webhook calls");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    // Dodo sends the signature in the "dodo-signature" header
    const signature = req.headers["dodo-signature"] as string | undefined;
    const rawBody = req.body as Buffer;

    if (!signature || !rawBody) {
      return res.status(400).json({ error: "Missing signature or body" });
    }

    // Signature verification using Node crypto (HMAC-SHA256)
    const crypto = await import("crypto");
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    // Dodo sends "sha256=<hex>" or just "<hex>" — handle both
    const receivedSig = signature.startsWith("sha256=")
      ? signature.slice(7)
      : signature;

    try {
      const signaturesMatch = crypto.timingSafeEqual(
        Buffer.from(expectedSig, "hex"),
        Buffer.from(receivedSig.padStart(expectedSig.length * 2, "0").slice(0, expectedSig.length * 2), "hex")
      );

      if (!signaturesMatch) {
        console.warn("[Dodo Webhook] Signature mismatch — rejecting event");
        return res.status(401).json({ error: "Invalid signature" });
      }
    } catch {
      console.warn("[Dodo Webhook] Signature comparison failed — rejecting event");
      return res.status(401).json({ error: "Invalid signature" });
    }

    let event: any;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    const eventType: string = event.type ?? event.event_type ?? "";
    const uid: string | undefined =
      event.data?.metadata?.uid ??
      event.metadata?.uid ??
      event.data?.customer?.metadata?.uid;

    console.log(`[Dodo Webhook] Event: ${eventType} | uid: ${uid ?? "unknown"}`);

    // Events that grant Pro access
    const GRANT_EVENTS = [
      "payment.succeeded",
      "subscription.active",
      "subscription.renewed",
      "payment.completed",
    ];

    // Events that revoke Pro access
    const REVOKE_EVENTS = [
      "subscription.cancelled",
      "subscription.expired",
      "subscription.failed",
    ];

    if (uid) {
      try {
        if (GRANT_EVENTS.includes(eventType)) {
          await setUserPro(uid, true);
          console.log(`[Dodo Webhook] ✅ Pro GRANTED for uid=${uid}`);
        } else if (REVOKE_EVENTS.includes(eventType)) {
          await setUserPro(uid, false);
          console.log(`[Dodo Webhook] ❌ Pro REVOKED for uid=${uid}`);
        } else {
          console.log(`[Dodo Webhook] Unhandled event type: ${eventType}`);
        }
      } catch (err) {
        console.error(`[Dodo Webhook] Firestore write failed for uid=${uid}:`, err);
        // Return 200 anyway — we don't want Dodo to retry on our Firestore errors
      }
    } else {
      console.warn(`[Dodo Webhook] No uid in metadata for event ${eventType} — cannot update Firestore`);
    }

    return res.sendStatus(200);
  });

  /**
   * POST /api/dev/grant-pro
   * Testing-only route to manually set isPro on a user.
   * Requires X-Dev-Grant-Secret header matching DEV_GRANT_SECRET env var.
   * Body: { uid: string, grant: boolean }
   */
  app.post("/api/dev/grant-pro", async (req, res) => {
    const devSecret = process.env.DEV_GRANT_SECRET;
    const providedSecret = req.headers["x-dev-grant-secret"] as string | undefined;

    if (!devSecret || !providedSecret || devSecret !== providedSecret) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { uid, grant } = req.body as { uid?: string; grant?: boolean };

    if (!uid || typeof grant !== "boolean") {
      return res.status(400).json({ error: "Body must include uid (string) and grant (boolean)" });
    }

    try {
      await setUserPro(uid, grant);
      console.log(`[Dev Grant] isPro=${grant} set for uid=${uid}`);
      return res.json({ success: true, uid, isPro: grant });
    } catch (err) {
      console.error("[Dev Grant] Error:", err);
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to update Pro status"
      });
    }
  });

  // ── Static / Vite Middleware ────────────────────────────────────────────────

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