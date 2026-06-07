import { Scenario, UserProfile } from "../../types";
import { cn, formatCompactNumber } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Lightbulb, Zap, TrendingUp, Shield, Rocket, Globe, DollarSign, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";

export default function ScenarioExplorer({
  scenarios,
  activeScenarioId,
  onSelect,
  profile,
  onUpdateScenarios,
  onNavigateToUpgrade
}: {
  scenarios: Scenario[],
  activeScenarioId: string,
  onSelect: (id: string) => void,
  profile: UserProfile;
  onUpdateScenarios: (newScenarios: Scenario[]) => Promise<void>;
  onNavigateToUpgrade: () => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(activeScenarioId);
  const [feedback, setFeedback] = useState("");
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrateError, setCalibrateError] = useState<string | null>(null);
  const [calibrateSuccess, setCalibrateSuccess] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<Scenario | null>(null);

  const handleReplan = async (scenario: Scenario) => {
    if (!feedback.trim()) return;
    setIsCalibrating(true);
    setCalibrateError(null);
    setCalibrateSuccess(null);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/replan-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          scenario,
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

      const originalWithoutHistory = { ...scenario };
      delete originalWithoutHistory.history;

      const newScenario = {
        ...data,
        history: [originalWithoutHistory, ...(scenario.history || [])]
      };

      // Update scenarios
      const updatedScenarios = scenarios.map(item => item.id === scenario.id ? newScenario : item);
      if (onUpdateScenarios) {
        await onUpdateScenarios(updatedScenarios);
      }
      setFeedback("");
      setCalibrateSuccess("// OPTIMIZATION_COMPLETE: Your path has been recalibrated based on new feedback vectors.");
    } catch (err: any) {
      console.error(err);
      setCalibrateError(`// ERR: ${err.message || "Failed to contact calibration servers."}`);
    } finally {
      setIsCalibrating(false);
    }
  };

  const executeRestore = async () => {
    if (!pendingRestore || !expandedId) return;
    try {
      const currentScenario = scenarios.find(item => item.id === expandedId);
      if (!currentScenario) {
        setPendingRestore(null);
        return;
      }

      const restoredScenario = { ...pendingRestore };

      const updatedScenarios = scenarios.map(item => item.id === expandedId ? restoredScenario : item);
      if (onUpdateScenarios) {
        await onUpdateScenarios(updatedScenarios);
      }
      setPendingRestore(null);
      setCalibrateSuccess("// VECTOR_RESTORE_COMPLETE: Active timeline has been successfully reverted to the selected restore point.");
    } catch (err: any) {
      console.error(err);
      setCalibrateError(`// ERR: Restore rollback failed: ${err.message}`);
    }
  };

  const getIcon = (id: string) => {
    switch (id) {
      case "upskill": return <Zap className="text-yellow-500" />;
      case "stay": return <Shield className="text-blue-500" />;
      case "venture": return <Rocket className="text-orange-500" />;
      case "relocated": return <Globe className="text-teal-500" />;
      case "passive": return <DollarSign className="text-green-500" />;
      case "freelance": return <Briefcase className="text-purple-500" />;
      default: return <TrendingUp className="text-green-500" />;
    }
  };

  return (
    <div className="space-y-16">
      <header className="border-l-2 border-emerald-500 pl-8 pb-4">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">Scenario Engine</h2>
        <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">Simulating 6 AI-modeled future trajectories for your profile</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((s) => (
          <motion.div
            key={s.id}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
            className={cn(
              "cursor-pointer p-8 bg-[#0F1115] border-geom transition-all duration-500 relative group overflow-hidden",
              expandedId === s.id ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_10px_40px_rgba(16,185,129,0.1)]" :
                activeScenarioId === s.id ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
            )}
          >
            {/* Top Accent for Active */}
            {activeScenarioId === s.id && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 opacity-20" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
            )}

            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {getIcon(s.id)}
              </div>
              <div className="flex flex-col items-end">
                <span className={cn(
                  "text-[8px] font-mono font-bold px-2 py-0.5 border-geom uppercase mb-2 tracking-widest",
                  s.risk === "High" ? "text-rose-500 border-rose-500/20 bg-rose-500/5" :
                    s.risk === "Medium" ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                      "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                )}>
                  {s.risk} RISK
                </span>
                <span className="text-[9px] text-slate-600 font-mono tracking-widest">TRJ // 0{scenarios.indexOf(s) + 1}</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{s.title}</h3>
            <p className="text-[11px] text-slate-500 line-clamp-2 mb-8 leading-relaxed font-medium">{s.subtitle}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-[9px] uppercase font-mono text-slate-600 tracking-widest">
                <span>System Viability</span>
                <span className="text-emerald-500">{s.viability}%</span>
              </div>
              <div className="h-0.5 bg-black w-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.viability}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {expandedId && (
          <motion.div
            key={expandedId}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-10 border-geom border-emerald-500/30 bg-[#0F1115] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-[0.03] pointer-events-none" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />

            {scenarios.length > 0 && expandedId && (() => {
              const s = scenarios.find(x => x.id === expandedId);
              if (!s) return null;
              return (
                <div className="space-y-12">
                  <div className="flex flex-col lg:flex-row justify-between gap-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 bg-black border border-white/10 flex items-center justify-center text-4xl">
                          {getIcon(s.id)}
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">{s.title}</h3>
                          <div className="flex flex-wrap gap-6 mt-1">
                            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                              <AlertTriangle size={12} className={s.risk === "High" ? "text-rose-500" : "text-amber-500"} />
                              <span>{s.risk} Grade Vectors</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                              <Zap size={12} className="text-emerald-500" />
                              <span>{s.viability}% Probable Success</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-400 text-[14px] leading-relaxed max-w-3xl font-medium border-l border-emerald-500/20 pl-6">{s.description}</p>
                    </div>

                    <div className="flex gap-4 lg:flex-col justify-start shrink-0">
                      <StatBox label="5Y Yield Estimate" value={`₹${formatCompactNumber(s.stats.fiveYearSalary)}`} />
                      <StatBox label="Retained Delta" value={`₹${formatCompactNumber(s.stats.fiveYearSavings)}`} />
                      <StatBox label="Confidence" value={s.stats.confidence.toUpperCase()} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-rose-500 uppercase font-mono text-[10px] tracking-widest px-4 py-2 bg-rose-500/5 border-geom border-rose-500/20 w-fit">
                        <AlertTriangle size={14} strokeWidth={3} />
                        <span>Systemic Threats</span>
                      </div>
                      <ul className="space-y-4">
                        {s.riskFactors.map((r, i) => (
                          <li key={i} className="flex gap-4 text-xs text-slate-500 font-mono leading-relaxed text-left">
                            <span className="text-rose-500 font-bold shrink-0">!!</span>
                            {r.toUpperCase()}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-emerald-500 uppercase font-mono text-[10px] tracking-widest px-4 py-2 bg-emerald-500/5 border-geom border-emerald-500/20 w-fit">
                        <Zap size={14} strokeWidth={3} />
                        <span>Winning Tactics</span>
                      </div>
                      <ul className="space-y-4">
                        {s.winningMoves.map((m, i) => (
                          <li key={i} className="flex gap-4 text-xs text-slate-500 font-mono leading-relaxed text-left">
                            <span className="text-emerald-500 font-bold shrink-0">{'>>'}</span>
                            {m.toUpperCase()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Premium AI Path Customizer Terminal */}
                  <div className="pt-8 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
                      <Sparkles size={14} className="text-amber-500" />
                      <span className="text-white font-bold">AI Trajectory Calibrator</span>
                      <span className="text-amber-500/50">// PRO MATRIX MOD</span>
                    </div>

                    {!profile?.isPro ? (
                      <div className="p-6 border-geom border-amber-500/20 bg-amber-500/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white uppercase tracking-tight">PREMIUM ADAPTATION NODE LOCK</h4>
                          <p className="text-[11px] text-slate-500 max-w-xl font-medium leading-relaxed font-sans">
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
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed text-left font-sans">
                          Inject custom parameters (constraints, bottlenecks, or alternatives) for this path. ArshMind will completely recalibrate descriptors, financial yields, and project milestones to respect these limitations.
                        </p>

                        {calibrateError && (
                          <div className="p-3 bg-red-500/5 border border-red-500/20 text-[9px] font-mono text-rose-500 uppercase tracking-widest text-left">
                            {calibrateError}
                          </div>
                        )}

                        {calibrateSuccess && (
                          <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-[9px] font-mono text-amber-500 uppercase tracking-widest text-left">
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
                            onClick={() => handleReplan(s)}
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

                        {/* Restore Points History Panel */}
                        {s.history && s.history.length > 0 && (
                          <div className="pt-6 border-t border-white/5 space-y-3 mt-4 text-left">
                            <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase text-amber-500 select-none">
                              <span>📁 Active Alternate Channels ({s.history.length})</span>
                              <span className="text-slate-600">// RESTORE INTERCEPT NODES</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {s.history.map((prevPath, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setPendingRestore(prevPath)}
                                  className="p-4 bg-black/40 hover:bg-amber-500/[0.04] border border-white/5 hover:border-amber-500/30 text-left font-mono transition-all group duration-300 flex flex-col justify-between min-h-[70px] pointer-events-auto cursor-pointer"
                                >
                                  <div className="text-[10px] text-white flex justify-between w-full font-bold">
                                    <span>v{s.history!.length - idx} // RESTORE VECTOR</span>
                                    <span className="text-amber-500/70 group-hover:text-amber-400 font-sans tracking-wide">✦ Switch Vector</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 mt-2 uppercase truncate max-w-[200px]">
                                    {prevPath.title}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Overwrite Confirmation Modal Overlay */}
                  {pendingRestore && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0F1115] border-geom border-amber-500 max-w-md w-full p-8 space-y-6 shadow-[0_20px_50px_rgba(245,158,11,0.15)] text-left"
                      >
                        <div className="flex items-center gap-3 text-amber-500">
                          <AlertTriangle size={24} className="shrink-0" />
                          <h3 className="text-base font-bold uppercase tracking-widest font-mono">Irreversible Vector Override</h3>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed font-mono uppercase">
                          WARNING: YOU ARE ABOUT TO OVERWRITE THE ACTIVE TIMELINE WITH RESTORE POINT "v{s.history ? s.history.length - s.history.indexOf(pendingRestore) : "X"}" ({pendingRestore.title}).
                        </p>

                        <p className="text-[11px] text-red-500 font-mono italic leading-relaxed uppercase border-l-2 border-red-500/40 pl-4 py-1">
                              // CORE PROTOCOL WARNING:
                          These alternate timeline changes will be IRREVERSIBLE if after switching back, you ask or prompt a new dynamic limitation or constraints vector on ArshMind.
                        </p>

                        <div className="flex justify-end gap-3 pt-4 font-mono text-[9px] uppercase">
                          <button
                            type="button"
                            onClick={() => setPendingRestore(null)}
                            className="px-5 py-2.5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all tracking-widest pointer-events-auto cursor-pointer"
                          >
                            Cancel Protocol
                          </button>
                          <button
                            type="button"
                            onClick={executeRestore}
                            className="px-6 py-2.5 bg-amber-500 text-black hover:bg-amber-600 font-bold transition-all tracking-widest shadow-[0_5px_15px_rgba(245,158,11,0.2)] pointer-events-auto cursor-pointer"
                          >
                            Confirm Overwrite
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  <div className="pt-10 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => onSelect(s.id)}
                      disabled={activeScenarioId === s.id}
                      className={cn(
                        "px-12 py-5 uppercase text-[10px] font-mono font-bold tracking-[0.3em] transition-all duration-500 border-geom",
                        activeScenarioId === s.id
                          ? "bg-white/5 text-slate-600 cursor-default border-white/5"
                          : "bg-emerald-500 text-black shadow-[0_10px_30px_rgba(16,185,129,0.2)] border-emerald-400 hover:scale-105 active:scale-95"
                      )}
                    >
                      {activeScenarioId === s.id ? "Status: Active" : "Initialize Vector"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="min-w-[140px] p-5 bg-black border-geom border-white/10 flex flex-col items-center justify-center text-center animate-pulse-subtle">
      <div className="text-[9px] text-slate-500 uppercase font-mono mb-2 tracking-widest">{label}</div>
      <div className="text-sm font-bold text-white uppercase italic tracking-tight">{value}</div>
    </div>
  );
}