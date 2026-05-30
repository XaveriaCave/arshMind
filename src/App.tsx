import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Particles from "./components/Particles";
import { UserProfile, Scenario, ScenarioSettings } from "./types";
import { ARCHETYPES } from "./constants";
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

type View = "LANDING" | "BOOT" | "CHARACTER_SELECT" | "WIZARD" | "ANALYSIS" | "DASHBOARD";

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
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // Connection test
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Try to load existing profile
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
              // Profile exists but no scenarios - trigger analysis
              handleFinishWizard(data as UserProfile);
            } else {
              // New user (no name yet)
              setView("CHARACTER_SELECT");
            }
          } else {
            // New user, no profile
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

  const handleFinishWizard = async (finalProfile: UserProfile) => {
    setProfile(finalProfile);
    setView("ANALYSIS");
    
    // Save to Firestore
    if (user) {
      const path = `users/${user.uid}`;
      try {
        // Ensure userId is in the profile
        const profileWithAuth = { ...finalProfile, userId: user.uid };
        setProfile(profileWithAuth);

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const updatePayload = {
            ...profileWithAuth,
            createdAt: existingData.createdAt,
            updatedAt: serverTimestamp(),
          };
          await setDoc(docRef, updatePayload);
        } else {
          const createPayload = {
            ...profileWithAuth,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(docRef, createPayload);
        }
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.WRITE, path);
        } catch (ignoredError) {
          console.error("Non-blocking profile save error during onboarding:", ignoredError);
        }
      }
    }

      // Call AI Analyze
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: finalProfile }),
        });
        
        if (!response.ok) {
          throw new Error(`Analysis failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const news: Scenario[] = data.scenarios && data.scenarios.length > 0 ? data.scenarios : [
          {
            id: "fallback-safe",
            title: "Standard Trajectory",
            subtitle: "Balanced growth path",
            risk: "Low",
            viability: 85,
            description: "A calculated path focusing on steady accumulation and skill consolidation.",
            yearlyModifiers: [
              { year: 1, salaryMult: 1, savingsMult: 1, notes: "Base consolidation" },
              { year: 3, salaryMult: 1.3, savingsMult: 1.2, notes: "Experience premium" }
            ],
            stats: { 
              fiveYearSalary: (finalProfile.salary || 0) * 1.5, 
              fiveYearSavings: (finalProfile.monthlySavings || 0) * 12 * 5, 
              confidence: "High" 
            },
            riskFactors: ["Market stagnation", "Inflation"],
            winningMoves: ["Optimize tax savings", "Build emergency fund"],
            milestones: [
              { year: 3, type: "career", content: "Senior Role attained" },
              { year: 3, type: "lifestyle", content: "Financial buffer secured" },
              { year: 5, type: "career", content: "Strategic Lead" },
              { year: 5, type: "lifestyle", content: "Asset accumulation begins" }
            ]
          }
        ];

        setScenarios(news);
        setSettings(prev => ({ ...prev, activeScenarioId: news[0].id, savingsRate: finalProfile.monthlySavings }));
        
        // Save scenarios to Firestore
        if (user) {
          const scPath = `users/${user.uid}/scenarios/latest`;
          try {
            await setDoc(doc(db, "users", user.uid, "scenarios", "latest"), {
              scenarios: news,
              updatedAt: serverTimestamp(),
            });
            console.log("Scenarios saved to Firestore successfully.");
          } catch (err) {
            console.error("Failed to save scenarios to Firestore:", err);
            handleFirestoreError(err, OperationType.WRITE, scPath);
          }
        }
        
        // Final transition
        setView("DASHBOARD");
      } catch (error) {
        console.error("Analysis failed:", error);
        // Fallback scenarios on hard error
        const fallback: Scenario[] = [
          {
            id: "error-fallback",
            title: "Safe Harbor Vector",
            subtitle: "Resilience Strategy",
            risk: "Low",
            viability: 95,
            description: "Emergency fallback strategy while systems recalibrate. Focusing on liquidity and capital preservation.",
            yearlyModifiers: [
              { year: 1, salaryMult: 1, savingsMult: 1, notes: "Risk containment" }
            ],
            stats: { 
              fiveYearSalary: (finalProfile.salary || 0) * 1.2, 
              fiveYearSavings: (finalProfile.monthlySavings || 0) * 12 * 5, 
              confidence: "Very High" 
            },
            riskFactors: ["External API latency", "Temporary signal loss"],
            winningMoves: ["Diversify across debt instruments", "Upskill in core domains"],
            milestones: [
              { year: 3, type: "career", content: "Core stability" },
              { year: 3, type: "lifestyle", content: "Minimal leverage" }
            ]
          }
        ];
        setScenarios(fallback);
        setSettings(prev => ({ ...prev, activeScenarioId: fallback[0].id, savingsRate: finalProfile.monthlySavings }));
        setView("DASHBOARD");
      }
    };

  const handleUpdateSettings = async (newSettings: ScenarioSettings) => {
    setSettings(newSettings);
    if (user) {
      const path = `users/${user.uid}/settings/current`;
      try {
        await setDoc(doc(db, "users", user.uid, "settings", "current"), {
          ...newSettings,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  };

  const handleUpdateProfile = async (updatedFields: Partial<UserProfile>) => {
    const updated = { ...profile, ...updatedFields } as UserProfile;
    setProfile(updated);
    if (user) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(doc(db, "users", user.uid), {
          ...updatedFields,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  };

  const handleUpdateScenarios = async (newScenarios: Scenario[]) => {
    setScenarios(newScenarios);
    if (user) {
      const scPath = `users/${user.uid}/scenarios/latest`;
      try {
        await setDoc(doc(db, "users", user.uid, "scenarios", "latest"), {
          scenarios: newScenarios,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, scPath);
      }
    }
  };

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

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono">LOADING_SESSION...</div>;

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-green-500/30 overflow-x-hidden relative">
      {/* Background FX */}
      <Particles />
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {view !== "DASHBOARD" && view !== "LANDING" && (
        <button 
          onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")} 
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
              onToggleTheme={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            />
          </motion.div>
        )}

        {view === "BOOT" && (
          <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BootScreen onComplete={() => setView(user ? "DASHBOARD" : "CHARACTER_SELECT")} />
          </motion.div>
        )}

        {view === "CHARACTER_SELECT" && (
          <motion.div key="char" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 200 }}>
            <CharacterSelect onSelect={(arch) => {
              setProfile({ ...profile, archetype: arch.id, salary: (arch.salaryRange[0] + arch.salaryRange[1]) / 2 * 100000 / 12 });
              setView("WIZARD");
            }} />
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
            <AnalysisScreen />
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
              onEditProfile={() => setView("WIZARD")}
              onReset={() => setView("CHARACTER_SELECT")}
              onSignOut={handleSignOut}
              theme={theme}
              onToggleTheme={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
