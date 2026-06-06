import { useState } from "react";
import { Scenario, UserProfile } from "../../types";
import { cn } from "../../lib/utils";
import { CheckCircle2, Circle, AlertCircle, Info, Zap, Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ActionPlan({ 
  scenarios, 
  activeScenarioId, 
  profile,
  onUpdateScenarios,
  onNavigateToUpgrade
}: { 
  scenarios: Scenario[], 
  activeScenarioId: string,
  profile: UserProfile,
  onUpdateScenarios: (newScenarios: Scenario[]) => Promise<void>;
  onNavigateToUpgrade: () => void;
}) {
  const [selectedId, setSelectedId] = useState(activeScenarioId);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  
  const [feedback, setFeedback] = useState("");
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrateError, setCalibrateError] = useState<string | null>(null);
  const [calibrateSuccess, setCalibrateSuccess] = useState<string | null>(null);

  if (scenarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-geom border-white/5 bg-[#0F1115]">
        <div className="text-emerald-500 font-mono text-xs uppercase tracking-[0.4em] mb-4">Awaiting Strategic Directives</div>
        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest text-center max-w-md px-10 leading-relaxed italic">
          Tactical protocols are currently offline. Please complete the initialization sequence.
        </p>
      </div>
    );
  }

  const scenario = scenarios.find(s => s.id === selectedId) || scenarios[0];

  const getDynamicPhases = () => {
    if (!scenario) return [];

    const winning = scenario.winningMoves || [];
    const risks = scenario.riskFactors || [];
    const milestones = scenario.milestones || [];

    const phases = [];

    // Phase 1: Catalyst (Winning Tactic Actions)
    const phase1Tasks = winning.length > 0
      ? winning.slice(0, 3)
      : ["Audit current position & benchmarks", "Update profile & technical portfolio", "Initiate tactical networking"];
    phases.push({
      label: "PHASE 01: STRATEGIC CATALYST",
      tasks: phase1Tasks
    });

    // Phase 2: System Calibration (Risk Mitigation)
    const phase2Tasks = risks.length > 0
      ? risks.slice(0, 3).map(r => `Mitigate risk: ${r}`)
      : ["Complete target certifications", "Run passive income experiments", "Deploy emergency capital buffer"];
    phases.push({
      label: "PHASE 02: RISK PREPARATION",
      tasks: phase2Tasks
    });

    // Phase 3: Trajectory Intercept (Medium-Term milestones Yr 1-3)
    const phase3Tasks = milestones.filter(m => m.year <= 3).map(m => `Achieve: ${m.content} (Target Year ${m.year})`);
    if (phase3Tasks.length === 0) {
      phase3Tasks.push("Initiate market interviews & placement", "Diversify 20% savings to index indices", "Optimize tax shielding structures");
    }
    phases.push({
      label: "PHASE 03: INTERCEPT VECTOR (Y1-Y3)",
      tasks: phase3Tasks.slice(0, 3)
    });

    // Phase 4: Trajectory Realization (Long-Term milestones Yr 5+)
    const phase4Tasks = milestones.filter(m => m.year > 3).map(m => `Realize: ${m.content} (Target Year ${m.year})`);
    if (phase4Tasks.length === 0) {
      phase4Tasks.push("Scale current trajectory returns", "Analyze next cycle performance metrics", "Stabilize capital lock");
    }
    phases.push({
      label: "PHASE 04: CORE STABILIZATION (Y5+)",
      tasks: phase4Tasks.slice(0, 3)
    });

    return phases;
  };

  const dynamicPhases = getDynamicPhases();

  const getSmartRecs = () => {
    const recs = [];
    if (profile.monthlySavings / profile.takeHomeIncome < 0.15) {
      recs.push({ type: "warning", title: "Low Savings Velocity", desc: "Current savings rate is below the 15% safety threshold for this path.", action: "Audit subscription leakages" });
    }
    if (profile.bankBalance < profile.monthlyExpenses * 3) {
      recs.push({ type: "critical", title: "Emergency Buffer Low", desc: "Liquid cash is below 3 months of expenses. High risk of failure on transition.", action: "Build ₹2.5L liquid buffer" });
    }
    if (profile.experience >= 2 && profile.experience <= 5 && profile.riskLevel !== "Conservative") {
      recs.push({ type: "opportunity", title: "Prime Switch Window", desc: "Your experience bracket allows for aggressive salary jumps with this path.", action: "Optimize LinkedIn for Tech_Ops" });
    }
    if (profile.age < 28 && profile.riskLevel === "Conservative") {
      recs.push({ type: "nudge", title: "Risk Capacity Underutilized", desc: "At 25, you have significant time for recovery. Consider increasing risk DNA.", action: "Allocation shift to Equity MF" });
    }
    return recs;
  };

  const handleReplan = async (currentScenario: Scenario) => {
    if (!feedback.trim()) return;
    setIsCalibrating(true);
    setCalibrateError(null);
    setCalibrateSuccess(null);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/replan-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          scenario: currentScenario,
          feedback
        })
      });
      if (!res.ok) {
        throw new Error(`Re-calibration failed with status: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      const originalWithoutHistory = { ...currentScenario };
      delete originalWithoutHistory.history;
      
      const newScenario = {
        ...data,
        history: [originalWithoutHistory, ...(currentScenario.history || [])]
      };
      
      const updatedScenarios = scenarios.map(item => item.id === currentScenario.id ? newScenario : item);
      if (onUpdateScenarios) {
        await onUpdateScenarios(updatedScenarios);
      }
      setFeedback("");
      setCalibrateSuccess("// OPTIMIZATION_COMPLETE: Action vectors updated. Check phases for new recalibrated tasks.");
    } catch (err: any) {
      console.error(err);
      setCalibrateError(`// ERR: ${err.message || "Failed to contact calibration servers."}`);
    } finally {
      setIsCalibrating(false);
    }
  };

  const smartRecs = getSmartRecs();

  return (
    <div className="space-y-16 pb-32">
      <header className="border-l-2 border-emerald-500 pl-8 pb-4">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">Execution Protocol</h2>
        <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">Tactical step-by-step vector realization plan</p>
      </header>

      {/* Scenario Tabs */}
      <div className="flex flex-wrap gap-3">
        {scenarios.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className={cn(
              "px-6 py-3 text-[10px] uppercase font-mono font-bold border-geom transition-all duration-500 tracking-widest",
              selectedId === s.id ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500" : "border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300 bg-[#0F1115]"
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Task List */}
        <div className="space-y-10">
            {dynamicPhases.map((block, i) => (
              <div key={i} className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-[#0F1115] border-geom border-white/10 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-500">0{i+1}</div>
                   <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] font-mono">{block.label}</h3>
                </div>
                <div className="space-y-3 ml-5 pl-5 border-l border-white/5">
                   {block.tasks.map((task, tj) => {
                     const taskId = `${selectedId}-${i}-${tj}`;
                    return (
                      <button 
                        key={tj}
                        onClick={() => setCompletedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))}
                        className={cn(
                          "w-full flex items-center gap-5 p-5 bg-[#0F1115] border-geom transition-all duration-400 text-left group",
                          completedTasks[taskId] ? "border-emerald-500/20 bg-emerald-500/5 opacity-40 grayscale" : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                        )}
                      >
                        {completedTasks[taskId] ? (
                          <div className="w-5 h-5 bg-emerald-500 flex items-center justify-center shrink-0">
                             <CheckCircle2 size={12} className="text-black" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition-colors">
                             <div className="w-1.5 h-1.5 bg-white/5 group-hover:bg-emerald-500/30 transition-colors" />
                          </div>
                        )}
                        <span className={cn("text-[13px] font-medium tracking-tight", completedTasks[taskId] ? "line-through text-slate-500" : "text-white/80")}>{task.toUpperCase()}</span>
                      </button>
                    );
                  })}
               </div>
             </div>
           ))}
        </div>

        {/* Smart Recs and Context */}
        <div className="space-y-10">
           <div className="p-8 bg-[#0F1115] border-geom border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
              <h3 className="text-[11px] text-slate-500 uppercase font-mono tracking-[0.4em] mb-10 border-b border-white/5 pb-4">Cognitive Nudges</h3>
              <div className="space-y-6">
                 {smartRecs.map((rec, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "p-6 border-geom transition-all duration-500",
                        rec.type === "critical" ? "border-rose-500/20 bg-rose-500/5 shadow-[0_5px_15px_rgba(244,63,94,0.05)]" :
                        rec.type === "warning" ? "border-amber-500/20 bg-amber-500/5" :
                        rec.type === "opportunity" ? "border-emerald-500/20 bg-emerald-500/5" :
                        "border-cyan-500/20 bg-cyan-500/5"
                      )}
                    >
                      <div className="flex gap-6">
                         <div className="shrink-0 w-12 h-12 bg-black/40 border border-white/10 flex items-center justify-center">
                            {rec.type === "critical" && <AlertCircle size={18} className="text-rose-500" />}
                            {rec.type === "warning" && <Info size={18} className="text-amber-500" />}
                            {rec.type === "opportunity" && < Zap size={18} className="text-emerald-500" />}
                            {rec.type === "nudge" && <Lightbulb size={18} className="text-cyan-500" />}
                         </div>
                         <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">{rec.title}</h4>
                            <p className="text-[11px] text-slate-500 mb-6 leading-relaxed font-mono">{rec.desc.toUpperCase()}</p>
                            <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-2">
                              {'>>'} EXECUTE: {rec.action.toUpperCase()}
                            </span>
                         </div>
                      </div>
                    </motion.div>
                 ))}
                 {smartRecs.length === 0 && (
                    <p className="text-[10px] text-slate-600 font-mono italic uppercase tracking-widest text-center py-10 border border-white/5 border-dashed">No priority deviations detected for the current path vector.</p>
                 )}
              </div>
           </div>

           <div className="p-10 bg-[#0F1115] border-geom border-emerald-500/20 relative">
              <div className="w-10 h-10 bg-emerald-500 rounded-sm rotate-45 flex items-center justify-center absolute top-[-20px] left-20">
                <Info size={20} className="text-black -rotate-45" />
              </div>
              <h3 className="text-[11px] text-slate-500 uppercase font-mono tracking-[0.4em] mb-6 border-b border-white/10 pb-4">Tactical Summary</h3>
              <p className="text-[13px] font-medium text-slate-400 leading-relaxed mb-10 border-l border-emerald-500/20 pl-6">
                THIS PATH REQUIRES A HIGH DEGREE OF **FOCUS EXECUTION**. YOUR PRIMARY BOTTLENECK IS **RISK-DNA CALIBRATION**. 
                STAY CONSISTENT WITH THE MONTHLY SAVINGS RATE AND AVOID UNPLANNED LIABILITIES DURING QUARTERS 2 AND 3.
              </p>
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-5 border-geom border-white/10 bg-black/40">
                    <div className="text-[9px] text-slate-600 uppercase font-mono mb-2 tracking-widest">Focus Score</div>
                    <div className="text-xl font-bold text-emerald-500 italic tracking-tighter">8.2 / 10</div>
                 </div>
                 <div className="p-5 border-geom border-white/10 bg-black/40">
                    <div className="text-[9px] text-slate-600 uppercase font-mono mb-2 tracking-widest">Execution Risk</div>
                    <div className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">VECTOR // MEDIUM</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Premium AI Path Customizer Terminal */}
      <div className="pt-8 border-t border-white/5 space-y-4 mt-12">
         <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-white font-bold">AI Trajectory Calibrator</span>
            <span className="text-amber-500/50">// PRO MATRIX MOD</span>
         </div>

         {!profile?.isPro ? (
            <div className="p-6 border-geom border-amber-500/20 bg-amber-500/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-tight">PREMIUM ADAPTATION NODE LOCK</h4>
                  <p className="text-[11px] text-slate-500 max-w-xl font-medium leading-relaxed">
                    Upgrade to Pro to customize this path trajectory dynamically. Provide specific limitations, problems, or constraint boundaries (e.g. remote-only settings, local transition drops), and let ArshMind recalculate your 5-year yields on the fly.
                  </p>
               </div>
               <button
                  onClick={onNavigateToUpgrade}
                  className="px-6 py-3 uppercase text-[9px] font-mono font-bold tracking-widest text-[#0D0E12] bg-[#EAB308] hover:bg-amber-500 border-geom border-amber-300 pointer-events-auto cursor-pointer shrink-0 transition-all active:scale-95 whitespace-nowrap shadow-[0_5px_15px_rgba(245,158,11,0.1)] font-sans"
               >
                  ✦ Unlock Pro Calibrator
               </button>
            </div>
         ) : (
            <div className="p-6 border-geom border-white/10 bg-black/40 space-y-4">
               <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Inject custom parameters (constraints, bottlenecks, or alternatives) for this path. ArshMind will completely recalibrate descriptors, financial yields, and project milestones to respect these limitations.
               </p>

               {calibrateError && (
                  <div className="p-3 bg-red-500/5 border border-red-500/20 text-[9px] font-mono text-rose-500 uppercase tracking-widest">
                     {calibrateError}
                  </div>
               )}

               {calibrateSuccess && (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-[9px] font-mono text-amber-500 uppercase tracking-widest">
                     {calibrateSuccess}
                  </div>
               )}

               <div className="flex gap-3">
                  <textarea
                     value={feedback}
                     onChange={(e) => setFeedback(e.target.value)}
                     rows={2}
                     disabled={isCalibrating}
                     placeholder="e.g., 'What if I want to switch to Product Management instead of SWE?', 'Must be full-remote due to health constraints', 'I expect a 10% lower salary in year 1 but 30% faster growth afterwards.'"
                     className="flex-1 bg-[#070708] border border-white/10 hover:border-white/20 focus:border-amber-500/50 p-4 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none"
                  />
               </div>

               <div className="flex justify-between items-center">
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                     CORE_MODEL: GEMINI_3_PRO // BUFFER: UNRESTRICTED
                  </span>
                  <button
                     onClick={() => handleReplan(scenario)}
                     disabled={isCalibrating || !feedback.trim()}
                     className="px-6 py-3 uppercase text-[9px] font-mono font-bold tracking-widest text-[#0F1115] bg-amber-400 hover:bg-amber-500 disabled:bg-white/5 disabled:text-slate-600 border-geom border-amber-300 disabled:border-transparent transition-all overflow-hidden flex items-center gap-2"
                  >
                     {isCalibrating ? (
                        <>
                           <Loader2 size={10} className="animate-spin" />
                           <span>COORDINATING VECTORS...</span>
                        </>
                     ) : (
                        <>
                           <span>Recalibrate Trajectory</span>
                        </>
                     )}
                  </button>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
