import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Particles from "./components/Particles";
import { UserProfile, Scenario, ScenarioSettings } from "./types";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, getDocFromServer } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "./lib/firestore-errors";
import { serverTimestamp } from "./lib/firebase";
import BootScreen from "./components/Onboarding/BootScreen";
import CharacterSelect from "./components/Onboarding/CharacterSelect";
import Wizard from "./components/Wizard/Wizard";
import AnalysisScreen from "./components/Onboarding/AnalysisScreen";
import Dashboard from "./components/Dashboard/Dashboard";
import LandingPage from "./components/LandingPage";
import { Sun, Moon } from "lucide-react";

const API_BASE = "https://arshmind.onrender.com";

type View = "LANDING" | "BOOT" | "CHARACTER_SELECT" | "WIZARD" | "ANALYSIS" | "DASHBOARD";

// ── Extended-only keys from Wizard contextual fields ──────────────────────────
const EXTENDED_ONLY_KEYS = new Set([
  "startupStage",
  "teamSize",
  "businessType",
  "freelanceDomain",
  "freelanceScale",
  "monthlyRevenue",
  "exitGoal",
  "clientBase",
  "workMode",
]);

function sanitizeForFirestore(data: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (EXTENDED_ONLY_KEYS.has(key)) continue;
    if (value === undefined) continue;
    clean[key] = value;
  }
  return clean;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/** Fetch with timeout + one automatic retry on abort/timeout. */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  retries = 1
): Promise<Response> {
  try {
    return await fetchWithTimeout(url, options, timeoutMs);
  } catch (err) {
    const isAbort = err instanceof Error && (err.name === "AbortError" || err.message.includes("timed out"));
    if (isAbort && retries > 0) {
      console.warn(`[arshMind] Analysis timed out — retrying (${retries} attempt(s) left)…`);
      return fetchWithRetry(url, options, timeoutMs, retries - 1);
    }
    throw err;
  }
}

export default function App() {
  const [view, setView] = useState<View>("LANDING");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [settings, setSettings] = useState<ScenarioSettings>({
    activeScenarioId: "",
    savingsRate: 0,
    salaryGrowth: 15,
    investmentReturn: 12,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const uId = u.uid;
        const profilePath = `users/${uId}`;
        try {
          const docRef = doc(db, "users", uId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);

            // Load settings
            const settingsPath = `users/${uId}/settings/current`;
            try {
              const settingsRef = doc(db, "users", uId, "settings", "current");
              const settingsSnap = await getDoc(settingsRef);
              if (settingsSnap.exists()) {
                const loadedSettings = settingsSnap.data() as ScenarioSettings;
                setSettings(prev => ({ ...prev, ...loadedSettings }));
              }
            } catch (err) {
              handleFirestoreError(err, OperationType.GET, settingsPath);
            }

            // Load scenarios
            const scenariosPath = `users/${uId}/scenarios/latest`;
            let loadedScenarios: Scenario[] = [];
            try {
              const scenariosRef = doc(db, "users", uId, "scenarios", "latest");
              const scenariosSnap = await getDoc(scenariosRef);
              if (scenariosSnap.exists()) {
                loadedScenarios = scenariosSnap.data().scenarios || [];
                setScenarios(loadedScenarios);
              }
            } catch (err) {
              handleFirestoreError(err, OperationType.GET, scenariosPath);
            }

            if (loadedScenarios.length > 0) {
              setView("DASHBOARD");
            } else if (data.name) {
              setView("DASHBOARD");
            } else {
              setView("CHARACTER_SELECT");
            }
          } else {
            setView("CHARACTER_SELECT");
          }
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.GET, profilePath);
          } catch (e) {
            console.error("Non-blocking profile fetch error:", e);
          }
          setView("CHARACTER_SELECT");
        }
      } else {
        setView("LANDING");
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  // ── Firestore write helpers ───────────────────────────────────────────────

  /**
   * Persist the full scenarios array to Firestore.
   * Used by: post-analysis save, task toggles, vector init, replan result, restore.
   */
  const persistScenarios = async (newScenarios: Scenario[], uid: string) => {
    const scPath = `users/${uid}/scenarios/latest`;
    try {
      await setDoc(doc(db, "users", uid, "scenarios", "latest"), {
        scenarios: newScenarios,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, scPath);
    }
  };

  /**
   * Save a replan feedback entry to feedbackHistory subcollection.
   * Keeps last 50 entries. Called before the AI response arrives so
   * the record is durable even if the network call fails.
   */
  const persistFeedback = async (
    uid: string,
    scenarioId: string,
    scenarioTitle: string,
    feedbackText: string
  ) => {
    const feedPath = `users/${uid}/feedbackHistory/log`;
    try {
      const feedRef = doc(db, "users", uid, "feedbackHistory", "log");
      const snap = await getDoc(feedRef);
      const existing: any[] = snap.exists() ? (snap.data().entries ?? []) : [];

      const entry = {
        id: `${scenarioId}_${Date.now()}`,
        scenarioId,
        scenarioTitle,
        feedbackText: feedbackText.trim(),
        submittedAt: new Date().toISOString(),
      };

      const updated = [...existing, entry].slice(-50); // cap at 50
      await setDoc(feedRef, { entries: updated, updatedAt: serverTimestamp() });
    } catch (err) {
      // Non-blocking — feedback history is nice-to-have
      console.warn("Failed to save feedback history:", err);
    }
  };

  // ── Wizard completion ─────────────────────────────────────────────────────

  const handleFinishWizard = async (finalProfile: UserProfile) => {
    setProfile(finalProfile);
    setView("ANALYSIS");

    const currentUser = user || auth.currentUser;
    if (currentUser) {
      const path = `users/${currentUser.uid}`;
      try {
        const profileWithAuth = sanitizeForFirestore({
          ...finalProfile,
          userId: currentUser.uid,
        });
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          await setDoc(docRef, {
            ...profileWithAuth,
            createdAt: existingData.createdAt,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(docRef, {
            ...profileWithAuth,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        setProfile({ ...finalProfile, userId: currentUser.uid });
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.WRITE, path);
        } catch (ignoredError) {
          console.error("Non-blocking profile save error during onboarding:", ignoredError);
        }
      }
    }

    try {
      const response = await fetchWithRetry(
        `${API_BASE}/api/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: finalProfile }),
        },
        90000   // 90 s per attempt (Render cold-starts can be slow)
      );

      if (!response.ok) throw new Error(`Analysis failed with status: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const news: Scenario[] =
        data.scenarios && data.scenarios.length > 0
          ? data.scenarios
          : [
            {
              id: "fallback-safe",
              title: "Standard Trajectory",
              subtitle: "Balanced growth path",
              risk: "Low",
              viability: 85,
              description: "A calculated path focusing on steady accumulation and skill consolidation.",
              yearlyModifiers: [
                { year: 1, salaryMult: 1, savingsMult: 1, notes: "Base consolidation" },
                { year: 3, salaryMult: 1.3, savingsMult: 1.2, notes: "Experience premium" },
              ],
              stats: {
                fiveYearSalary: (finalProfile.salary || 0) * 1.5,
                fiveYearSavings: (finalProfile.monthlySavings || 0) * 12 * 5,
                confidence: "High",
              },
              riskFactors: ["Market stagnation", "Inflation"],
              winningMoves: ["Optimize tax savings", "Build emergency fund"],
              milestones: [
                { year: 3, type: "career", content: "Senior Role attained" },
                { year: 3, type: "lifestyle", content: "Financial buffer secured" },
                { year: 5, type: "career", content: "Strategic Lead" },
                { year: 5, type: "lifestyle", content: "Asset accumulation begins" },
              ],
            },
          ];

      setScenarios(news);
      setSettings(prev => ({
        ...prev,
        activeScenarioId: news[0].id,
        savingsRate: finalProfile.monthlySavings,
      }));

      const activeUser = user || auth.currentUser;
      if (activeUser) {
        await persistScenarios(news, activeUser.uid);
      }

      setView("DASHBOARD");
    } catch (error) {
      const isTimeout =
        error instanceof Error &&
        (error.name === "AbortError" || error.message.includes("timed out"));

      if (isTimeout) {
        console.warn("[arshMind] Analysis timed out after retries — using fallback trajectory.");
      } else {
        console.error("[arshMind] Analysis failed:", error);
      }

      const fallback: Scenario[] = [
        {
          id: "error-fallback",
          title: isTimeout ? "Safe Harbor (Timeout Recovery)" : "Safe Harbor Vector",
          subtitle: "Resilience Strategy",
          risk: "Low",
          viability: 95,
          description: isTimeout
            ? "The AI engine took too long to respond. This fallback trajectory focuses on capital preservation while the system recovers."
            : "Emergency fallback strategy while systems recalibrate. Focusing on liquidity and capital preservation.",
          yearlyModifiers: [
            { year: 1, salaryMult: 1, savingsMult: 1, notes: "Risk containment" },
          ],
          stats: {
            fiveYearSalary: (finalProfile.salary || 0) * 1.2,
            fiveYearSavings: (finalProfile.monthlySavings || 0) * 12 * 5,
            confidence: "Very High",
          },
          riskFactors: ["External API latency", "Temporary signal loss"],
          winningMoves: ["Diversify across debt instruments", "Upskill in core domains"],
          milestones: [
            { year: 3, type: "career", content: "Core stability" },
            { year: 3, type: "lifestyle", content: "Minimal leverage" },
          ],
        },
      ];
      setScenarios(fallback);
      setSettings(prev => ({
        ...prev,
        activeScenarioId: fallback[0].id,
        savingsRate: finalProfile.monthlySavings,
      }));
      setView("DASHBOARD");
    }
  };

  // ── Settings ──────────────────────────────────────────────────────────────

  const handleUpdateSettings = async (newSettings: ScenarioSettings) => {
    setSettings(newSettings);
    if (user) {
      const path = `users/${user.uid}/settings/current`;
      try {
        await setDoc(doc(db, "users", user.uid, "settings", "current"), {
          ...sanitizeForFirestore(newSettings as any),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  };

  // ── Profile ───────────────────────────────────────────────────────────────

  const handleUpdateProfile = async (updatedFields: Partial<UserProfile>) => {
    const updated = { ...profile, ...updatedFields } as UserProfile;
    setProfile(updated);
    if (user) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { ...sanitizeForFirestore(updatedFields as any), updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  };

  // ── Scenarios (generic — used by ScenarioExplorer for restore + select) ───

  const handleUpdateScenarios = async (newScenarios: Scenario[]) => {
    setScenarios(newScenarios);
    if (user) await persistScenarios(newScenarios, user.uid);
  };

  // ── Replan (ScenarioExplorer recalibration) ───────────────────────────────
  /**
   * Called by ScenarioExplorer after a successful /api/replan-path call.
   * Saves the raw feedback text to feedbackHistory AND the new scenario array.
   */
  const handleReplan = async (
    originalScenario: Scenario,
    feedbackText: string,
    recalibratedScenario: Scenario
  ) => {
    // 1. Build updated scenarios array
    const updatedScenarios = scenarios.map(s =>
      s.id === recalibratedScenario.id ? recalibratedScenario : s
    );

    // 2. Optimistic UI update
    setScenarios(updatedScenarios);

    if (user) {
      // 3. Save feedback text (fire-and-forget, non-blocking)
      persistFeedback(
        user.uid,
        originalScenario.id,
        originalScenario.title,
        feedbackText
      );

      // 4. Save updated scenarios array
      await persistScenarios(updatedScenarios, user.uid);
    }
  };

  // ── Action Plan mutations ─────────────────────────────────────────────────

  /**
   * Toggle a task's completedAt and persist the full scenarios array.
   */
  const handleToggleTask = async (scenarioId: string, taskId: string) => {
    const updatedScenarios = scenarios.map(s => {
      if (s.id !== scenarioId) return s;
      return {
        ...s,
        actionPlan: (s.actionPlan ?? []).map(t =>
          t.id === taskId
            ? { ...t, completedAt: t.completedAt ? undefined : new Date().toISOString() }
            : t
        ),
      };
    });
    setScenarios(updatedScenarios);
    if (user) await persistScenarios(updatedScenarios, user.uid);
  };

  /**
   * Set initializedAt on a scenario (activates the vector) and persist.
   */
  const handleInitializeVector = async (scenarioId: string) => {
    const now = new Date().toISOString();
    const updatedScenarios = scenarios.map(s =>
      s.id === scenarioId ? { ...s, initializedAt: now } : s
    );
    setScenarios(updatedScenarios);
    if (user) await persistScenarios(updatedScenarios, user.uid);
  };

  /**
   * Switch active vector (Pro): clear old initializedAt, set new one, persist.
   */
  const handleSwitchVector = async (fromId: string, toId: string) => {
    const now = new Date().toISOString();
    const updatedScenarios = scenarios.map(s => {
      if (s.id === fromId) return { ...s, initializedAt: undefined };
      if (s.id === toId) return { ...s, initializedAt: now };
      return s;
    });
    setScenarios(updatedScenarios);
    if (user) await persistScenarios(updatedScenarios, user.uid);
  };

  // ── Sign out ──────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setView("LANDING");
      setUser(null);
      setProfile({});
      setScenarios([]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono">
        LOADING_SESSION...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-green-500/30 overflow-x-hidden relative">
      <Particles />
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      {view !== "DASHBOARD" && view !== "LANDING" && (
        <button
          onClick={() => setTheme(prev => (prev === "dark" ? "light" : "dark"))}
          className="fixed top-6 right-6 z-[100] p-3 border-geom border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-colors bg-white/5 backdrop-blur-md"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      )}

      <AnimatePresence mode="wait">
        {view === "LANDING" && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage
              onStart={() => setView("BOOT")}
              theme={theme}
              onToggleTheme={() => setTheme(prev => (prev === "dark" ? "light" : "dark"))}
            />
          </motion.div>
        )}

        {view === "BOOT" && (
          <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BootScreen
              onComplete={async () => {
                const currentUser = user || auth.currentUser;
                if (currentUser) {
                  const docRef = doc(db, "users", currentUser.uid);
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) setProfile(docSnap.data() as UserProfile);
                  const scenariosSnap = await getDoc(
                    doc(db, "users", currentUser.uid, "scenarios", "latest")
                  );
                  if (scenariosSnap.exists()) {
                    const saved = scenariosSnap.data().scenarios || [];
                    setScenarios(saved);
                    if (saved.length > 0)
                      setSettings(prev => ({ ...prev, activeScenarioId: saved[0].id }));
                  }
                  setView("DASHBOARD");
                } else {
                  setView("CHARACTER_SELECT");
                }
              }}
            />
          </motion.div>
        )}

        {view === "CHARACTER_SELECT" && (
          <motion.div
            key="char"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          >
            <CharacterSelect
              onSelect={arch => {
                setProfile({
                  ...profile,
                  archetype: arch.id,
                  salary: ((arch.salaryRange[0] + arch.salaryRange[1]) / 2) * 100000 / 12,
                });
                setView("WIZARD");
              }}
            />
          </motion.div>
        )}

        {view === "WIZARD" && (
          <motion.div key="wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Wizard
              initialProfile={profile}
              onComplete={handleFinishWizard}
              onBack={() => setView("CHARACTER_SELECT")}
            />
          </motion.div>
        )}

        {view === "ANALYSIS" && (
          <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnalysisScreen existingScenarios={scenarios} />
          </motion.div>
        )}

        {view === "DASHBOARD" && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Dashboard
              profile={profile as UserProfile}
              scenarios={scenarios}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onUpdateProfile={handleUpdateProfile}
              onUpdateScenarios={handleUpdateScenarios}
              onReplan={handleReplan}
              onToggleTask={handleToggleTask}
              onInitializeVector={handleInitializeVector}
              onSwitchVector={handleSwitchVector}
              onEditProfile={() => setView("WIZARD")}
              onReset={() => setView("CHARACTER_SELECT")}
              onSignOut={handleSignOut}
              theme={theme}
              onToggleTheme={() => setTheme(prev => (prev === "dark" ? "light" : "dark"))}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}