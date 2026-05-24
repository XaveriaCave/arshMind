import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../../types";
import { cn } from "../../lib/utils";
import { 
  INDUSTRIES, EMPLOYMENT_TYPES, ASSETS, LOANS, GOALS, 
  RISK_LEVELS, LOCATIONS, COMMITMENTS, URGENCY_LEVELS, EDUCATION_LEVELS 
} from "../../constants";
import { Check, ChevronLeft, ChevronRight, Lock } from "lucide-react";

export default function Wizard({ 
  initialProfile, 
  onComplete,
  onBack 
}: { 
  initialProfile: Partial<UserProfile>;
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    ...initialProfile,
    assets: [],
    loans: [],
    goals: [],
    commitments: [],
  });

  const STEPS = [
    { id: 1, title: "Personal Base" },
    { id: 2, title: "Career Profile" },
    { id: 3, title: "Financial Status" },
    { id: 4, title: "Assets & Liabilities" },
    { id: 5, title: "Dreams & Goals" },
    { id: 6, title: "Risk DNA" },
    { id: 7, title: "Constraints" },
  ];

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (field: keyof UserProfile, item: string) => {
    const current = (profile[field] as string[]) || [];
    if (current.includes(item)) {
      updateProfile({ [field]: current.filter(i => i !== item) });
    } else {
      updateProfile({ [field]: [...current, item] });
    }
  };

  const next = () => {
    if (step < 7) setStep(step + 1);
    else onComplete(profile as UserProfile);
  };

  const prev = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  return (
    <div className="min-h-screen bg-black flex lg:flex-row flex-col">
      {/* Sidebar Rail (Desktop) */}
      <div className="hidden lg:flex w-72 border-r border-white/5 p-10 flex-col shrink-0 bg-[#0A0A0B]">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-8 h-8 bg-emerald-500 rounded-sm rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm -rotate-45" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-widest uppercase">ArshMind</h1>
        </div>

        <nav className="space-y-8 flex-1">
          {STEPS.map((s) => (
            <div key={s.id} className="relative group">
              {step === s.id && (
                <motion.div 
                  layoutId="active-step-indicator"
                  className="absolute -left-10 top-0 bottom-0 w-1 bg-emerald-500" 
                />
              )}
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-none border-geom flex items-center justify-center text-[10px] font-mono transition-all duration-500 mr-4",
                  step === s.id ? "bg-emerald-500 text-black border-emerald-400" : 
                  step > s.id ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "bg-white/5 text-slate-600 border-white/5"
                )}>
                  {step > s.id ? <Check size={14} strokeWidth={3} /> : `0${s.id}`}
                </div>
                <span className={cn(
                  "text-[10px] uppercase tracking-[0.2em] font-mono transition-all duration-300",
                  step === s.id ? "text-white font-bold" : step > s.id ? "text-slate-400" : "text-slate-600"
                )}>
                  {s.title}
                </span>
              </div>
            </div>
          ))}
        </nav>
        
        <div className="mt-auto space-y-4">
          <div className="h-px bg-white/5 w-full" />
          <div className="flex items-center gap-3 text-slate-500 text-[9px] font-mono tracking-widest">
            <Lock size={12} className="text-emerald-500/50" />
            <span className="uppercase">Quantum Encrypted</span>
          </div>
        </div>
      </div>

      {/* Top Navigation (Mobile) */}
      <div className="lg:hidden sticky top-0 bg-black/90 backdrop-blur-md z-40 border-b border-white/5">
        <div className="overflow-x-auto flex gap-3 p-4 no-scrollbar">
          {STEPS.map((s) => (
            <div 
              key={s.id} 
              className={cn(
                "flex-shrink-0 px-4 py-2 border-geom text-[9px] font-mono uppercase tracking-widest flex items-center gap-2",
                step === s.id ? "bg-emerald-500 text-black border-emerald-400" : 
                step > s.id ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-slate-600 border-white/5"
              )}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {step > s.id ? <Check size={10} strokeWidth={3} /> : s.id}
              </div>
              {s.title}
            </div>
          ))}
        </div>
        <div className="w-full h-0.5 bg-white/5">
          <motion.div 
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            initial={false}
            animate={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 sm:p-12 lg:p-20 overflow-y-auto bg-[#0F1115]">
        <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-10"
            >
              {/* Step Title Header */}
              <div className="relative border-l border-emerald-500/30 pl-8">
                <span className="text-[10px] text-emerald-500 font-mono tracking-[0.4em] uppercase block mb-3">Module // 0{step}</span>
                <h3 className="text-4xl font-bold text-white uppercase tracking-tighter leading-none mb-2">{STEPS[step-1].title}</h3>
                <div className="h-1 w-12 bg-emerald-500" />
              </div>

              {/* Step Content */}
              <div className="space-y-8">
                {step === 1 && (
                  <>
                    <HUDInput label="Operative Name" value={profile.name} onChange={v => updateProfile({ name: v })} placeholder="IDENTIFY YOURSELF" />
                    <div className="grid grid-cols-2 gap-6">
                      <HUDInput label="Current Age" type="number" value={profile.age} onChange={v => updateProfile({ age: Number(v) })} placeholder="25" />
                      <HUDInput label="Location" value={profile.city} onChange={v => updateProfile({ city: v })} placeholder="Mumbai, IN" />
                    </div>
                    <HUDSelect label="Professional Education" options={EDUCATION_LEVELS} value={profile.education} onChange={v => updateProfile({ education: v })} />
                    <HUDToggleGroup 
                      label="Social Matrix" 
                      options={["Single", "Married", "In Relationship"]} 
                      value={profile.maritalStatus} 
                      onChange={v => updateProfile({ maritalStatus: v })} 
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <HUDInput label="Primary Designation" value={profile.jobTitle} onChange={v => updateProfile({ jobTitle: v })} placeholder="Senior Systems Architect" />
                    <HUDInput label="Experience (Cycles)" type="number" value={profile.experience} onChange={v => updateProfile({ experience: Number(v) })} placeholder="5" />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] tracking-widest uppercase mb-1">
                        <label>Base Compensation (LPA)</label>
                        <span className="text-emerald-500 font-bold text-sm">₹{(profile.salary || 0).toLocaleString()}</span>
                      </div>
                      <HUDSlider min={100000} max={5000000} step={50000} value={profile.salary || 0} onChange={v => updateProfile({ salary: v })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <HUDSelect label="Sector" options={INDUSTRIES} value={profile.industry} onChange={v => updateProfile({ industry: v })} />
                      <HUDSelect label="Protocol" options={EMPLOYMENT_TYPES} value={profile.employmentType} onChange={v => updateProfile({ employmentType: v })} />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                    <HUDInput label="Liquid Balance" type="number" value={profile.bankBalance} onChange={v => updateProfile({ bankBalance: Number(v) })} placeholder="Total liquid" />
                    <HUDInput label="Monthly Retention" type="number" value={profile.monthlySavings} onChange={v => updateProfile({ monthlySavings: Number(v) })} placeholder="Savings rate" />
                    <HUDInput label="Volatile Assets" type="number" value={profile.mutualFunds} onChange={v => updateProfile({ mutualFunds: Number(v) })} placeholder="Equity/Crypto" />
                    <HUDInput label="Stable Reserves" type="number" value={profile.fixedDeposits} onChange={v => updateProfile({ fixedDeposits: Number(v) })} placeholder="FD/Gold" />
                    <HUDInput label="Net Inflow (Monthly)" type="number" value={profile.takeHomeIncome} onChange={v => updateProfile({ takeHomeIncome: Number(v) })} placeholder="Post-tax net" />
                    <HUDInput label="Burn Rate (Monthly)" type="number" value={profile.monthlyExpenses} onChange={v => updateProfile({ monthlyExpenses: Number(v) })} placeholder="Core spend" />
                  </div>
                )}

                {step === 4 && (
                  <>
                    <div className="space-y-4">
                       <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">Asset Inventory</label>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                         {ASSETS.map(asset => (
                           <HUDToggle key={asset} active={profile.assets?.includes(asset)} onClick={() => toggleArrayItem("assets", asset)} label={asset} />
                         ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">Debt Vectors</label>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {LOANS.map(loan => (
                           <HUDToggle key={loan} active={profile.loans?.includes(loan)} onClick={() => toggleArrayItem("loans", loan)} label={loan} />
                         ))}
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <HUDInput label="Monthly Liability Payoff" type="number" value={profile.monthlyEmi} onChange={v => updateProfile({ monthlyEmi: Number(v) })} placeholder="Total EMI" />
                      <HUDInput label="Total Debt Principal" type="number" value={profile.outstandingDebt} onChange={v => updateProfile({ outstandingDebt: Number(v) })} placeholder="Total debt" />
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    <div className="space-y-4">
                       <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">Objective Matrix</label>
                       <div className="grid grid-cols-2 gap-3">
                         {GOALS.map(goal => (
                           <HUDToggle key={goal.id} active={profile.goals?.includes(goal.id)} onClick={() => toggleArrayItem("goals", goal.id)} label={`${goal.emoji} ${goal.label}`} />
                         ))}
                       </div>
                    </div>
                    {profile.goals && profile.goals.length > 0 && (
                      <HUDSelect 
                        label="Priority Alpha" 
                        options={GOALS.filter(g => profile.goals?.includes(g.id)).map(g => g.label)} 
                        value={profile.primaryGoal} 
                        onChange={v => updateProfile({ primaryGoal: v })} 
                      />
                    )}
                  </>
                )}

                {step === 6 && (
                  <>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end border-b border-white/5 pb-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">Risk Calibration</label>
                        <span className={cn(
                          "text-xs font-mono font-bold uppercase tracking-widest pb-1",
                          profile.riskLevel === "Aggressive" ? "text-rose-500" : 
                          profile.riskLevel === "Moderate" ? "text-amber-500" : "text-emerald-500"
                        )}>{profile.riskLevel || "Moderate"}</span>
                      </div>
                      <div className="flex gap-4">
                        {RISK_LEVELS.map(level => (
                          <button 
                            key={level}
                            onClick={() => updateProfile({ riskLevel: level })}
                            className={cn(
                              "flex-1 py-4 text-[10px] font-mono font-bold uppercase border-geom transition-all duration-500",
                              profile.riskLevel === level ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <div className="p-6 bg-black/40 border-geom border-emerald-500/20 text-[11px] text-slate-400 leading-relaxed font-mono">
                        <div className="flex gap-3">
                          <span className="text-emerald-500 font-bold shrink-0">//</span>
                          <span>
                            {profile.riskLevel === "Conservative" ? "PRIORITY: CAPITAL SHIELDING. FOCUS ON SYSTEMIC STABILITY AND INFLATION RESISTANCE." : 
                             profile.riskLevel === "Aggressive" ? "PRIORITY: ACCELERATED ACCUMULATION. EXPLOITING VOLATILITY FOR MAXIMAL DELTA." : 
                             "PRIORITY: EQUILIBRIUM. BALANCED VECTOR ALLOCATION ACROSS STABLE AND VOLATILE ASSETS."}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <HUDInput label="Loss Threshold (Monthly)" type="number" value={profile.riskTolerance} onChange={v => updateProfile({ riskTolerance: Number(v) })} placeholder="Risk cap" />
                      <HUDInput label="Entropy Runway (Months)" type="number" value={profile.financialRunway} onChange={v => updateProfile({ financialRunway: Number(v) })} placeholder="Survival phase" />
                    </div>
                  </>
                )}

                {step === 7 && (
                  <>
                    <div className="grid grid-cols-2 gap-8">
                      <HUDInput label="Unit Dependents" type="number" value={profile.dependents} onChange={v => updateProfile({ dependents: Number(v) })} placeholder="0" />
                      <HUDSelect label="Geographic Elasticity" options={LOCATIONS} value={profile.locationFlexibility} onChange={v => updateProfile({ locationFlexibility: v })} />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">Hard Constraints</label>
                       <div className="flex flex-wrap gap-3">
                         {COMMITMENTS.map(c => (
                           <HUDToggle key={c} active={profile.commitments?.includes(c)} onClick={() => toggleArrayItem("commitments", c)} label={c} />
                         ))}
                       </div>
                    </div>
                    <HUDSelect label="Vector Urgency" options={URGENCY_LEVELS} value={profile.timelineUrgency} onChange={v => updateProfile({ timelineUrgency: v })} />
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">Entropy Parameters (Notes)</label>
                      <textarea 
                        className="w-full bg-[#0A0A0B] border-geom border-white/10 focus:border-emerald-500/50 p-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/10 transition-all font-mono leading-relaxed"
                        rows={5}
                        placeholder="ADDITIONAL SYSTEM PARAMETERS OR CONSTRAINTS..."
                        value={profile.extraContext}
                        onChange={e => updateProfile({ extraContext: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <footer className="mt-16 pt-10 border-t border-white/5 flex justify-between gap-6">
            <button
              onClick={prev}
              className="px-10 py-4 border-geom border-white/10 text-slate-500 flex items-center gap-3 hover:border-white/20 hover:text-white transition-all uppercase text-[10px] font-mono tracking-widest"
            >
              <ChevronLeft size={14} />
              <span>Reverse</span>
            </button>
            <button
              onClick={next}
              className="px-14 py-4 bg-emerald-500 text-black font-bold flex items-center gap-3 hover:bg-emerald-400 transition-all uppercase text-[10px] font-mono tracking-[0.2em] shadow-[0_10px_40px_rgba(16,185,129,0.2)] border-geom border-emerald-400"
            >
              <span>{step === 7 ? "Analyze Engine" : "Proceed"}</span>
              <ChevronRight size={14} />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

// HUD Components
function HUDInput({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-3 group">
      <label className="text-[9px] uppercase font-mono text-slate-500 tracking-[0.2em] block group-focus-within:text-emerald-500 transition-colors uppercase">{label}</label>
      <input 
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0A0A0B] border-geom border-white/10 focus:border-emerald-500/50 p-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/10 transition-all font-mono"
      />
    </div>
  );
}

function HUDSelect({ label, options, value, onChange }: any) {
  return (
    <div className="space-y-3 group">
      <label className="text-[9px] uppercase font-mono text-slate-500 tracking-[0.2em] block group-focus-within:text-emerald-500 transition-colors uppercase">{label}</label>
      <div className="relative">
        <select 
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0A0A0B] border-geom border-white/10 focus:border-emerald-500/50 p-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/10 transition-all font-mono appearance-none cursor-pointer pr-12"
        >
          <option value="" disabled className="bg-black text-slate-500">SELECT PARAMETER</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt} className="bg-black text-white">{opt.toUpperCase()}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
          <ChevronRight size={16} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}

function HUDToggleGroup({ label, options, value, onChange }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[9px] uppercase font-mono text-slate-500 tracking-[0.2em] block uppercase">{label}</label>
      <div className="flex flex-wrap gap-4">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-6 py-4 text-[10px] font-mono font-bold uppercase border-geom transition-all duration-500",
              value === opt ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.15)]" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function HUDToggle({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-4 text-[10px] font-mono font-bold uppercase border-geom transition-all duration-500 text-left relative group",
        active ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
      )}
    >
      <span className="relative z-10">{label}</span>
      {active && <Check size={12} strokeWidth={3} className="absolute top-2 right-2 text-black" />}
      {!active && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/10" />}
    </button>
  );
}

function HUDSlider({ min, max, step, value, onChange }: any) {
  return (
    <div className="relative pt-2 pb-6">
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-emerald-500"
      />
      <div className="absolute left-0 bottom-0 text-[8px] font-mono text-slate-700">MIN_VAL</div>
      <div className="absolute right-0 bottom-0 text-[8px] font-mono text-slate-700">MAX_VAL</div>
    </div>
  );
}
