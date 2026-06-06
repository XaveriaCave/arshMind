import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun, Moon, Users, Compass, Zap, Shield, HelpCircle,
  ArrowRight, Award, Flame, Calendar, BookOpen, ChevronRight,
  Layers, MessageSquare, Play, X, Star, BarChart3, TrendingUp
} from "lucide-react";

interface DecisionDetail {
  id: string;
  category: string;
  title: string;
  desc: string;
  pathATitle: string;
  pathAItems: string[];
  pathBTitle: string;
  pathBItems: string[];
}

export default function LandingPage({
  onStart,
  theme,
  onToggleTheme
}: {
  onStart: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [activeScenario, setActiveScenario] = useState<"a" | "b" | "c" | "d" | "e">("a");
  const [clarityScore, setClarityScore] = useState(0);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");

  // States for Hero Waitlist Email
  const [heroEmail, setHeroEmail] = useState("");
  const [heroJoined, setHeroJoined] = useState(false);

  // States for Countdown
  const [countdown, setCountdown] = useState({ days: 21, hours: 14, mins: 32, secs: 45 });

  // Decision Overlay State
  const [selectedDecision, setSelectedDecision] = useState<DecisionDetail | null>(null);

  // Score counter simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= 78) {
          clearInterval(interval);
          setClarityScore(78);
        } else {
          setClarityScore(current);
        }
      }, 15);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.secs > 0) {
          return { ...prev, secs: prev.secs - 1 };
        } else if (prev.mins > 0) {
          return { ...prev, mins: prev.mins - 1, secs: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroEmail) return;
    setHeroJoined(true);
    setTimeout(() => {
      onStart();
    }, 1500);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setJoinedWaitlist(true);
  };

  const decisions: DecisionDetail[] = [
    {
      id: "switch",
      category: "SCENARIO_TYPE · CAREER",
      title: "Switch careers or deepen expertise?",
      desc: "Breadth vs. depth. When to pivot and when to double down on what you already know.",
      pathATitle: "PATH A — TRANSITIONAL PIVOT",
      pathAItems: [
        "6-month target learning & acquisition of core certifications.",
        "Take a lateral transition with 15-20% entry discount but 2.5x higher long-term ceiling.",
        "Network aggressively in target sectors via micro-consulting."
      ],
      pathBTitle: "PATH B — HYPER-SPECIALIZATION",
      pathBItems: [
        "Double down on current vertical through leadership or management masterclasses.",
        "Negotiate a 15-30% retention bonus with structural expansion.",
        "Avoid retraining fatigue but accept eventual horizontal ceiling."
      ]
    },
    {
      id: "solo",
      category: "SCENARIO_TYPE · BUSINESS",
      title: "Go solo or stay employed?",
      desc: "Corporate stability vs. entrepreneurial upside. How to know when you're truly ready.",
      pathATitle: "PATH A — ENTREPRENEURIAL VENTURE",
      pathAItems: [
        "Bootstrapping during off-hours to reach 40% threshold expenses cover.",
        "Go high-leverage and deploy custom pricing models.",
        "High uncertainty but 10x asymmetric upside returns."
      ],
      pathBTitle: "PATH B — ENTERPRISE CLIMBER (STAY)",
      pathBItems: [
        "Guaranteed monthly take-home with standard 10-15% increments.",
        "Leverage corporate health insurance, performance bonuses, and stock opportunities.",
        "Zero capital overhead, highly predictable schedule."
      ]
    },
    {
      id: "relocate",
      category: "SCENARIO_TYPE · LIFESTYLE",
      title: "Stay where you are or relocate?",
      desc: "New city, new country, new market. What the numbers actually look like before and after the move.",
      pathATitle: "PATH A — GLOBAL INGRESS (RELOCATE)",
      pathAItems: [
        "Relocate to primary density hubs (e.g. London, Bangalore, Munich).",
        "Experience 2.2x increase in cost of living balanced by 3x larger salary density.",
        "Expand network capabilities globally."
      ],
      pathBTitle: "PATH B — DOMESTIC CONSOLIDATION",
      pathBItems: [
        "Stay in local territory with minimal lifestyle adjustment stress.",
        "Save on rents by leveraging local setups or hybrid models.",
        "Slower networking expansion but maximizes near-term liquidity."
      ]
    },
    {
      id: "money",
      category: "SCENARIO_TYPE · FINANCIAL",
      title: "Optimize for now or invest for later?",
      desc: "Lifestyle spending vs. aggressive saving. The real cost of delaying financial decisions by 1–3 years.",
      pathATitle: "PATH A — AGGRESSIVE DEPLOYMENT (CONTRARIAN)",
      pathAItems: [
        "Commit 40% of net income directly to equity index and risk-allocated baskets.",
        "Enforce strict lifestyle limits and low expense ratios.",
        "Accelerate FIRE target year by 7 full years."
      ],
      pathBTitle: "PATH B — COMFORTABLE OPTIMIZATION",
      pathBItems: [
        "Balanced 15% savings rate allowing for premium travel and comfortable rentals.",
        "Enjoy current youth and social index returns.",
        "Delayed capital amplification stage but low burn stress."
      ]
    },
    {
      id: "side",
      category: "SCENARIO_TYPE · GROWTH",
      title: "Build a side income or focus 100%?",
      desc: "Diversification vs. deep focus. When split energy helps, and when it kills both paths.",
      pathATitle: "PATH A — PORTFOLIO CAREER (DIVERSIFIED)",
      pathAItems: [
        "Maintain current occupation but direct 15 hours weekly to side digital asset build.",
        "Multiple independent small income streams.",
        "Hedge against single employer risks but risk mental fatigue."
      ],
      pathBTitle: "PATH B — MONOLITHIC FOCUS",
      pathBItems: [
        "Funnel 100% professional energy to core corporate title.",
        "Aim for ultra-fast-track executive promotions.",
        "Highest focus quality but concentration of risk on single asset."
      ]
    },
    {
      id: "grind",
      category: "SCENARIO_TYPE · FREEDOM",
      title: "Grind hard now or prioritize freedom?",
      desc: "10-year sprint vs. sustainable pace. Burnout risk, wealth accumulation, and quality of life modeled side by side.",
      pathATitle: "PATH A — MASSIVE 5-YEAR ACCELERATION",
      pathAItems: [
        "80-hour combined study and working weeks. High pressure constraints.",
        "Maximum savings velocity, building robust early-stage assets.",
        "High burn risk, but opens total freedom by target age 35."
      ],
      pathBTitle: "PATH B — SUSTAINABLE EXPEDITION",
      pathBItems: [
        "40-hour balance protecting sleep, physical indices, and relationships.",
        "Slower upward compound speed but guarantees high longevity and joy indices.",
        "Highly recommended for long-term psychological resilience."
      ]
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-300 bg-[#0A0A0B] overflow-x-hidden selection:bg-emerald-500/30">

      {/* 🧭 Header Navigation */}
      <nav className="site-header w-full border-b border-white/5 bg-black/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="logo flex items-center gap-2 font-mono text-sm tracking-widest font-bold text-white uppercase">
          <span className="text-emerald-500 font-bold">Arsh</span>Mind
          <span className="text-[9px] font-normal text-slate-500 font-mono tracking-widest lowercase bg-white/5 px-2 py-0.5 border border-white/5">// v2.0_FUTURE_OS</span>
        </div>

        <ul className="hidden md:flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-slate-400">
          <li>
            <a href="#explorer" className="hover:text-emerald-500 transition-colors">EXPLORE SCENARIOS</a>
          </li>
          <li>
            <a href="#decisions" className="hover:text-emerald-500 transition-colors">LIFE DECISIONS</a>
          </li>
          <li>
            <a href="#features" className="hover:text-emerald-500 transition-colors">SYSTEM FEATURES</a>
          </li>
          <li>
            <a href="#how" className="hover:text-emerald-500 transition-colors">HOW IT WORKS</a>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-colors"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            onClick={onStart}
            className="px-5 py-2 border-geom border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 font-mono text-[10px] uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            TRY ENGINE →
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 arshmind-top">

        {/* 🔥 Hero Section */}
        <section id="hero" className="pt-20 pb-24 md:pt-28 md:pb-32 flex flex-col items-center text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-mono text-[9px] uppercase tracking-widest mb-8">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-500 animate-ping rounded-full mr-2" />
            ◆ FUTURE_OS BETA — ACCESS ENGAGED
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-bold tracking-tight text-white max-w-5xl leading-[1.05] uppercase">
            Plan your<br />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 select-none">
              possible futures
            </span><br />
            with advanced AI
          </h1>

          <p className="mt-8 text-slate-400 text-sm sm:text-base md:text-lg font-sans max-w-2xl leading-relaxed font-normal">
            ArshMind is a personal life simulation engine. Input your career metrics, capital base, and core milestones. Simulate multiple future timelines. Analyze risk indexes. Execute with clear agency.
          </p>

          {/* Clarity score meter */}
          <div className="w-full max-w-md mt-12 mb-10 p-5 bg-[#0F1115] border border-white/5 relative group">
            <div className="absolute inset-0 pointer-events-none border border-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
              <span>SYSTEM_CLARITY_SCORE</span>
              <span className="text-emerald-500 font-bold">{clarityScore}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 relative overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(5,150,105,0.4)]"
                style={{ width: `${clarityScore}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <div className="w-full max-w-md">
            {!heroJoined ? (
              <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/5 hover:border-white/10 focus:border-emerald-500/50 p-4 text-xs font-mono text-center sm:text-left text-white placeholder:text-slate-600 focus:outline-none transition-all"
                  placeholder="ENTER_YOUR_EMAIL"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[10px] uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0"
                >
                  DEPLOY PROFILE →
                </button>
              </form>
            ) : (
              <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 font-mono text-xs uppercase tracking-widest">
                // SYSTEM_BOOT_AUTHORIZED · DEPLOYING ENGINE...
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>2,400+ OPERATIVES ENLISTED · STABLE DURING BETA</span>
          </div>
        </section>

      </div>

      {/* 🎰 Infinite Sliding Ticker */}
      <div className="ticker-wrap w-full bg-white/5 py-3.5 border-y border-white/5 overflow-hidden select-none">
        <style>{`
          @keyframes ticker {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .ticker-track {
            display: flex;
            width: max-content;
            animation: ticker 40s linear infinite;
          }
        `}</style>
        <div className="ticker-track">
          {Array(4).fill([
            "MULTI-TIMELINE ROADMAPS",
            "SCENARIO SIMULATION",
            "FINANCIAL PROJECTIONS",
            "DECISION ENGINE",
            "PROBABILISTIC GUIDANCE",
            "AI LIFE PLANNING",
          ]).flat().map((item, idx) => (
            <div key={idx} className="flex items-center font-mono text-[9px] text-slate-500 uppercase tracking-[0.2em] px-8">
              <span>{item}</span>
              <span className="text-emerald-500/50 font-bold ml-6">◆</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12">

        {/* 🔀 Scenario Explorer Section */}
        <section id="explorer" className="py-24 border-y border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 border border-emerald-500/10">SCENARIO_EXPLORER</span>
            <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white mt-6 uppercase leading-none">
              Simulate your <span className="text-emerald-500">life paths.</span>
            </h2>
            <p className="mt-4 text-slate-500 text-xs font-mono uppercase tracking-[0.2em]">Select a path vector to simulate outcomes</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar selector */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-[10px] uppercase font-mono text-slate-500 tracking-widest pl-1 mb-2">// Select Path Target</div>

              {[
                { id: "a", label: "PATH_01", title: "UPSKILL + CAREER SWITCH", risk: "MEDIUM", riskColor: "text-amber-500 bg-amber-500/5" },
                { id: "b", label: "PATH_02", title: "STAY CURRENT ROLE", risk: "LOW", riskColor: "text-emerald-500 bg-emerald-500/5" },
                { id: "c", label: "PATH_03", title: "LAUNCH OWN VENTURE", risk: "HIGH", riskColor: "text-rose-500 bg-rose-500/5" },
                { id: "d", label: "PATH_04", title: "RELOCATE / NEW MARKET", risk: "MEDIUM", riskColor: "text-amber-500 bg-amber-500/5" },
                { id: "e", label: "PATH_05", title: "BUILD PASSIVE INCOME", risk: "MEDIUM", riskColor: "text-amber-500 bg-amber-500/5" },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenario(sc.id as any)}
                  className={`w-full text-left p-5 border transition-all duration-300 flex items-center justify-between ${activeScenario === sc.id
                      ? "bg-white/5 border-emerald-500/30 shadow-[inset_3px_0_0_0_#10b981]"
                      : "bg-[#0F1115] border-white/5 hover:border-white/10"
                    }`}
                >
                  <div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{sc.label}</div>
                    <div className={`text-xs font-bold font-mono mt-1 ${activeScenario === sc.id ? "text-emerald-500" : "text-slate-300"}`}>{sc.title}</div>
                  </div>
                  <span className={`text-[8px] font-mono px-2 py-0.5 border border-white/5 tracking-widest ${sc.riskColor}`}>
                    {sc.risk}
                  </span>
                </button>
              ))}
            </div>

            {/* Output details panel */}
            <div className="lg:col-span-7 bg-[#0F1115] border border-white/5 p-8 relative flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-slate-600">// SIMULATED_RUN_ENGAGED</div>

              <div className="space-y-6">
                {activeScenario === "a" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest">PATH_01 · UPSKILL AND SWITCH CAREERS</h3>

                    <div className="space-y-4 font-sans text-xs">
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">MONTHS 1-12</div>
                        <p className="text-slate-300 mt-1">Identify key market-disrupting skills. Complete selected bootcamps, courses, and build personal projects. Target tactical networks.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 1-2 · TRANSITION</div>
                        <p className="text-slate-300 mt-1">Acquire entry-level placement in high growth workspace. Expect a 30-60% sudden salary escalation from baseline switchers.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 3-4 · EXPONENTIATION</div>
                        <p className="text-slate-300 mt-1">First leadership promotion pathways open. Capital accumulation starts compounding fast, securing index investment leverage.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">5-YR UPSIDE</div>
                        <div className="text-emerald-500 text-sm font-bold font-mono mt-1">EXTREME</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">TRANSITION TIME</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">8-14 MONTHS</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">CONFIDENCE</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">74%</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeScenario === "b" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest">PATH_02 · STAY CURRENT ROLE, OPTIMIZE WITHIN</h3>

                    <div className="space-y-4 font-sans text-xs">
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">MONTHS 1-12</div>
                        <p className="text-slate-300 mt-1">Focus entirely on micro-benchmarks, earning maximum reputation scores and internal appraisal feedback tags.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 1-2</div>
                        <p className="text-slate-300 mt-1">Steady and highly predictable local indexing. Expected yearly appraisal of 8-12%, minimizing lifestyle disruption variables.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 3-5</div>
                        <p className="text-slate-300 mt-1">Horizontal progression ceiling starts manifesting. Life milestones expand to 6-year intervals without dynamic disruptions.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">5-YR UPSIDE</div>
                        <div className="text-slate-400 text-sm font-bold font-mono mt-1">STABLE</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">TRANSITION TIME</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">0 MO</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">CONFIDENCE</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">88%</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeScenario === "c" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest">PATH_03 · LAUNCH YOUR OWN VENTURE</h3>

                    <div className="space-y-4 font-sans text-xs">
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">MONTHS 1-18</div>
                        <p className="text-slate-300 mt-1">Validate business models while preserving current full-time salaries. Focus on reaching an MVP showing consistent early signals.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 2</div>
                        <p className="text-slate-300 mt-1">Go full-time only if you have secured at least 8 months of strict personal operational runway indices. High market velocity phase.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 3-5</div>
                        <p className="text-slate-300 mt-1">Vast outcome variance index. Highly successful brackets demonstrate up to 10x salary scale. Outliers index capital exits here.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">5-YR UPSIDE</div>
                        <div className="text-emerald-500 text-sm font-bold font-mono mt-1">ASYMMETRIC</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">TRANSITION TIME</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">12-24 MO</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">CONFIDENCE</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">45%</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeScenario === "d" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest">PATH_04 · RELOCATE TO A NEW MARKET</h3>

                    <div className="space-y-4 font-sans text-xs">
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">MONTHS 1-6</div>
                        <p className="text-slate-300 mt-1">Conduct visa audit systems and high intensity remote applications targeting key geo-clusters showing active talent demands.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 1-2</div>
                        <p className="text-slate-300 mt-1">Move execution stage. Initial transient housing investments balance out as overall baseline income scales up to 2.5x parity.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 3-5</div>
                        <p className="text-slate-300 mt-1">Accelerated net worth velocity activated as savings are remitted or invested directly in domestic compound assets.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">5-YR UPSIDE</div>
                        <div className="text-emerald-500 text-sm font-bold font-mono mt-1">HIGH</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">TRANSITION TIME</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">6-12 MO</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">CONFIDENCE</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">66%</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeScenario === "e" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h3 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest">PATH_05 · BUILD PASSIVE INCOME STREAMS</h3>

                    <div className="space-y-4 font-sans text-xs">
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 1 · DISCIPLINE</div>
                        <p className="text-slate-300 mt-1">Commit a strict percentage of salary vectors to systematic equity indices. Identify one digital micro-asset model to deploy in off-hours.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 2-3 · COMPOUND</div>
                        <p className="text-slate-300 mt-1">Systematic reinvestment cycles activate. First visible independent passive incoming stream covering up to 15% expenses indexes.</p>
                      </div>
                      <div className="border-l-2 border-slate-800 pl-4 py-1">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YEAR 4-5 · CHOICE WINDOW</div>
                        <p className="text-slate-300 mt-1">Total operational flexibility unlocks. Passive outputs cover up to 40% necessary expenses, securing immense leverage indices.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">5-YR UPSIDE</div>
                        <div className="text-emerald-500 text-sm font-bold font-mono mt-1">MEDIUM</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">TRANSITION TIME</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">2-3 YEARS</div>
                      </div>
                      <div className="bg-white/5 p-4 text-center">
                        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">CONFIDENCE</div>
                        <div className="text-white text-sm font-bold font-mono mt-1">71%</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="pt-6">
                <div className="flex justify-between items-center text-[9px] font-mono uppercase text-slate-500 mb-2">
                  <span>PATH VIABILITY MATRIX</span>
                  <span>71%</span>
                </div>
                <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                  <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] w-[71%]" />
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ⚔️ Life Decisions Section */}
        <section id="decisions" className="py-24 border-b border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 border border-emerald-500/10">LIFE_DECISIONS</span>
            <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white mt-6 uppercase leading-none">
              Every big question<br />has a <span className="text-emerald-500">framework.</span>
            </h2>
            <p className="mt-4 text-slate-500 text-xs font-mono uppercase tracking-[0.2em]">Click any core decision to inspect path matrices</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                onClick={() => setSelectedDecision(dec)}
                className="cursor-pointer bg-[#0F1115] border border-white/5 hover:border-emerald-500/30 p-8 transition-all duration-300 group relative flex flex-col justify-between"
              >
                <div className="absolute top-4 right-4 text-slate-700 group-hover:text-emerald-500 transition-colors">
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mb-4">{dec.category}</div>
                  <h3 className="text-[15px] font-sans font-bold text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors leading-snug">{dec.title}</h3>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed font-normal">{dec.desc}</p>
                </div>
                <div className="pt-6 text-[8px] font-mono uppercase tracking-widest text-slate-600 group-hover:text-slate-400 transition-colors">
                  // ACTIVATE CONFIGURATION UNIT
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* 🗺️ System Capabilities (Features) Section */}
        <section id="features" className="py-24 border-b border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 border border-emerald-500/10">SYSTEM_CAPABILITIES</span>
            <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white mt-6 uppercase leading-none">
              Your entire life.<br /><span className="text-emerald-500">fully mapped.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { num: "// 01", title: "Multi-Timeline Roadmaps", desc: "Interactive 3, 5, and 10-year roadmaps for career targets, liquidity, and milestones generated from your profile DNA.", icon: "🗺️" },
              { num: "// 02", title: "Scenario Simulation", desc: "Build independent trajectory branches instantly. Observe changes in salary structures, hazard alerts, and compound gains.", icon: "🔀" },
              { num: "// 03", title: "Tactical Step Plans", desc: "Immediate checklist matrices broken down into months—actions like skill acquisition targets, saving filters, profiles.", icon: "📋" },
              { num: "// 04", title: "Context Recommendations", desc: "Algorithmic decision indicators flagging precise times to trigger pivots, raise capital reserves, or commit budget balances.", icon: "🧠" },
              { num: "// 05", title: "Dynamic Control Console", desc: "Adjust parameters like growth index, returns, interest, and instantly observe all 10-year compound graphs update.", icon: "📊" },
              { num: "// 06", title: "Probabilistic Outcomes", desc: "Every generated future map showcases structural ranges, viability indices, and risk calibrations instead of linear guesses.", icon: "🔒" },
            ].map((f, i) => (
              <div key={i} className="bg-[#0F1115] border border-white/5 p-8 relative flex flex-col justify-between hover:border-white/10 transition-colors">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-emerald-500 font-mono text-[9px] uppercase tracking-widest">{f.num}</span>
                    <span className="text-lg">{f.icon}</span>
                  </div>
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* 🏁 Mission Briefing (How It Works) Section */}
        <section id="how" className="py-24 border-b border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 border border-emerald-500/10">MISSION_BRIEFING</span>
            <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white mt-6 uppercase leading-none">
              From inputs to <span className="text-emerald-500">execution.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Profile Alignment", desc: "Submit career, asset registers, targets, liability and risk criteria securely." },
              { num: "02", title: "AI Scenario Synthesis", desc: "Our models evaluate the data against industry trend parameters, formulating targeted timelines." },
              { num: "03", title: "Navigate & Adjust", desc: "Compare different life plans, adjust multipliers on the fly to observe changes." },
              { num: "04", title: "Execute Step Plan", desc: "Acquire systematic benchmarks, tracking daily tasks with clear goals." },
            ].map((step, idx) => (
              <div key={idx} className="bg-[#0F1115] border border-white/5 p-8 relative hover:border-emerald-500/20 transition-colors group">
                <div className="w-10 h-10 bg-white/5 flex items-center justify-center font-mono font-bold text-sm text-emerald-500 mb-6 group-hover:bg-emerald-500/10 transition-colors">
                  {step.num}
                </div>
                <h3 className="text-xs font-sans font-bold text-white uppercase tracking-wider mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>


        {/* ⭐ Field Reports (Testimonials) Section */}
        <section id="proof" className="py-24 border-b border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 border border-emerald-500/10">FIELD_REPORTS</span>
            <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white mt-6 uppercase leading-none">
              What operatives say.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "I had spent a year paralyzed under uncertainty between switching career directions or remaining static. ArshMind simulated both branches flawlessly, giving me numerical clarity to trigger the transition with total safety.", name: "Alex K.", meta: "Software Engineer · Age 27", char: "AK" },
              { quote: "Finally, an intelligence system that avoids cookie-cutter recommendations. It mapped my real savings indices, calculated exact compound paths, and drafted modular tasks I track daily.", name: "Priya M.", meta: "Product Lead · Age 29", char: "PM" },
              { quote: "The geographic relocation modeling was remarkable. It computed the initial travel dip, accounted for tax parities, and mapped the exact cross-over month where my liquid assets surpassed my baseline.", name: "Sam T.", meta: "Data Analyst · Age 25", char: "ST" },
            ].map((test, idx) => (
              <div key={idx} className="bg-[#0F1115] border border-white/5 p-8 flex flex-col justify-between hover:border-white/10 transition-colors">
                <div>
                  <div className="flex gap-1 text-emerald-500 mb-6">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={10} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs italic text-slate-300 leading-relaxed font-normal">"{test.quote}"</p>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 flex items-center justify-center font-mono font-bold text-slate-400 border border-white/5">
                    {test.char}
                  </div>
                  <div>
                    <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider">{test.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{test.meta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ✉️ Waitlist Form Section */}
        <section id="waitlist" className="py-24">
          <div className="bg-[#0F1115] border border-white/5 p-10 sm:p-16 text-center max-w-4xl mx-auto relative overflow-hidden">

            <AnimatePresence mode="wait">
              {!joinedWaitlist ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 border border-emerald-500/10">MISSION_ENLIST</span>

                  <h2 className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-white leading-none uppercase">
                    Your future is<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 font-sans italic lowercase">
                      worth planning.
                    </span>
                  </h2>

                  <p className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">// STABLE BETA · LIMITED OPERATIVE SLOTS</p>

                  {/* Countdown Timer */}
                  <div className="flex justify-center items-center gap-4 font-mono select-none">
                    <div className="text-center bg-white/5 px-4 py-3 min-w-[70px] border border-white/5">
                      <div className="text-xl font-bold text-white">{String(countdown.days).padStart(2, "0")}</div>
                      <div className="text-[8px] text-slate-500 mt-1 uppercase">DAYS</div>
                    </div>
                    <div className="text-slate-700 text-lg">:</div>
                    <div className="text-center bg-white/5 px-4 py-3 min-w-[70px] border border-white/5">
                      <div className="text-xl font-bold text-white">{String(countdown.hours).padStart(2, "0")}</div>
                      <div className="text-[8px] text-slate-500 mt-1 uppercase">HRS</div>
                    </div>
                    <div className="text-slate-700 text-lg">:</div>
                    <div className="text-center bg-white/5 px-4 py-3 min-w-[70px] border border-white/5">
                      <div className="text-xl font-bold text-white">{String(countdown.mins).padStart(2, "0")}</div>
                      <div className="text-[8px] text-slate-500 mt-1 uppercase">MIN</div>
                    </div>
                    <div className="text-slate-700 text-lg">:</div>
                    <div className="text-center bg-white/5 px-4 py-3 min-w-[70px] border border-white/5">
                      <div className="text-xl font-bold text-emerald-500">{String(countdown.secs).padStart(2, "0")}</div>
                      <div className="text-[8px] text-slate-500 mt-1 uppercase">SEC</div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={waitlistName}
                        onChange={(e) => setWaitlistName(e.target.value)}
                        placeholder="YOUR_NAME"
                        className="bg-white/5 border border-white/5 hover:border-white/10 focus:border-emerald-500/50 p-4 text-xs font-mono text-center sm:text-left text-white placeholder:text-slate-600 focus:outline-none transition-all flex-1"
                        required
                      />
                      <input
                        type="email"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        placeholder="YOUR_EMAIL"
                        className="bg-white/5 border border-white/5 hover:border-white/10 focus:border-emerald-500/50 p-4 text-xs font-mono text-center sm:text-left text-white placeholder:text-slate-600 focus:outline-none transition-all flex-1"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[10px] uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      CLAIM MY OPERATIVE SLOT →
                    </button>
                    <p className="text-[9px] font-mono text-slate-600 pt-2 uppercase tracking-wide">// NO IN-APP COST · NO CREDIT CARD DUES · SECURE DIRECTORY</p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 py-10"
                >
                  <div className="text-md font-mono text-emerald-500 tracking-widest uppercase">// ACCESS_GRANTED_CONFIRMED</div>
                  <h3 className="text-3xl font-sans font-bold text-white uppercase tracking-tight">YOU ARE ENLISTED ✅</h3>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">System queue slot locked. We'll transmit beta parameters straight to your endpoint ({waitlistEmail}). Get ready to explore alternative matrices, operative.</p>
                  <button
                    onClick={onStart}
                    className="mt-6 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    ENTER SYSTEM PREVIEW →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </div>

      {/* 🧭 Footer */}
      <footer className="w-full border-t border-white/5 py-12 bg-black/40 text-slate-500 font-mono text-[9px] uppercase tracking-widest select-none">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="logo flex items-center gap-1.5 font-mono text-[10px] tracking-widest font-bold text-slate-400">
            <span className="text-teal-500">Arsh</span>Mind <span className="text-slate-600 hover:text-slate-400">// FUTURE_OS</span>
          </div>

          <p className="text-[8px] text-slate-600 text-center sm:text-left">© 2026 ArshMind · ALL FUTURES SIMULATED</p>

          <div className="flex gap-6">
            <a href="#hero" className="hover:text-emerald-500 transition-colors">PRIVACY</a>
            <a href="#hero" className="hover:text-emerald-500 transition-colors">TERMS</a>
            <a href="#hero" className="hover:text-emerald-500 transition-colors">CONTACT</a>
          </div>
        </div>
      </footer>


      {/* ⚔️ Decision Comparison Modal Overlay */}
      <AnimatePresence>
        {selectedDecision && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F1115] border border-white/10 w-full max-w-3xl p-8 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedDecision(null)}
                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white border border-white/5 hover:border-white/10 bg-white/5 font-mono text-[10px] tracking-widest"
              >
                [ ESC ]
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest">// DECISION_VECTOR_DETAIL</span>
                  <div className="text-slate-400 font-mono text-[10px] mt-2 mb-1 uppercase">{selectedDecision.category}</div>
                  <h3 className="text-xl sm:text-2xl font-sans font-bold text-white uppercase tracking-tight">{selectedDecision.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed font-normal">{selectedDecision.desc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div className="bg-white/5 p-6 border border-white/5">
                    <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">{selectedDecision.pathATitle}</span>
                    <ul className="mt-4 space-y-3 font-sans text-xs">
                      {selectedDecision.pathAItems.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-slate-300">
                          <span className="text-emerald-500 font-mono">//</span>
                          <span className="font-normal">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 p-6 border border-white/5">
                    <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">{selectedDecision.pathBTitle}</span>
                    <ul className="mt-4 space-y-3 font-sans text-xs">
                      {selectedDecision.pathBItems.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-slate-300">
                          <span className="text-emerald-500/50 font-mono">//</span>
                          <span className="font-normal">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setSelectedDecision(null);
                      onStart();
                    }}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[10px] uppercase tracking-widest transition-all duration-350 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-center block"
                  >
                    PLAN THS VECTOR FOR MY REALITY →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
