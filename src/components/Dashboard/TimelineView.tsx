import { UserProfile, Scenario } from "../../types";
import { cn, formatCompactNumber } from "../../lib/utils";
import { motion } from "motion/react";
import { Shield, Sparkles, TrendingUp, Heart } from "lucide-react";

export default function TimelineView({ profile, scenario }: { profile: UserProfile, scenario: Scenario }) {
  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center py-32 border-geom border-white/5 bg-[#0F1115]">
        <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-8" />
        <div className="text-emerald-500 font-mono text-sm uppercase tracking-[0.4em] mb-4">CALIBRATING_SCENARIOS...</div>
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest text-center max-w-md px-10 leading-relaxed italic">
          ArshMind is currently simulating career-financial intersections. This process involves high-density vector mapping and may take 15-30 seconds.
        </p>
      </div>
    );
  }

  const horizons = [
    { label: "Phase 1: Precision (3yr)", year: 3 },
    { label: "Phase 2: Scale (5yr)", year: 5 },
    { label: "Phase 3: Freedom (10yr)", year: 10 },
  ];

  return (
    <div className="space-y-16">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">Strategic Roadmap</h2>
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-mono font-bold uppercase tracking-widest">
              Active Path: {scenario.title}
            </div>
            <div className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">
              System Confidence: <span className="text-emerald-500">{scenario.viability}%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 border-geom border-white/10 flex items-center justify-center text-emerald-500/50">
            <TrendingUp size={16} />
          </div>
          <div className="w-10 h-10 border-geom border-white/10 flex items-center justify-center text-emerald-500/50">
            <Shield size={16} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {horizons.map((horizon, idx) => {
          const yearMilestones = scenario.milestones.filter(m => m.year === horizon.year);
          const displayMilestones = yearMilestones.length > 0 ? yearMilestones : [
            { type: "career", content: "Optimize current vector" },
            { type: "financial", content: "Stable growth target" }
          ];

          return (
            <div key={horizon.year} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-px h-10 bg-emerald-500" />
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] font-mono">{horizon.label}</h3>
                  <div className="text-[9px] text-emerald-500/60 font-mono tracking-widest uppercase mt-0.5">Vector Calibration Completed</div>
                </div>
              </div>
              <div className="space-y-4">
                {displayMilestones.map((m: any, i) => (
                   <MilestoneCard key={i} milestone={m} likelihood={Math.max(90 - (idx * 15) - (i * 5), 45)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-16 border-t border-white/5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] font-mono mb-8 block px-1">Objective Synchronization</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profile.goals.map((goalId) => (
            <GoalWindowCard key={goalId} goalId={goalId} scenario={scenario} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MilestoneCard({ milestone, likelihood }: { milestone: any, likelihood: number }) {
  const getIcon = () => {
    switch (milestone.type) {
      case "career": return <Shield size={16} className="text-emerald-500" />;
      case "financial": return <TrendingUp size={16} className="text-amber-500" />;
      case "savings": return <Sparkles size={16} className="text-cyan-500" />;
      case "lifestyle": return <Heart size={16} className="text-rose-500" />;
      default: return <Shield size={16} />;
    }
  };

  const getColorClass = () => {
    switch (milestone.type) {
      case "career": return "border-emerald-500/20 bg-emerald-500/5";
      case "financial": return "border-amber-500/20 bg-amber-500/5";
      case "savings": return "border-cyan-500/20 bg-cyan-500/5";
      case "lifestyle": return "border-rose-500/20 bg-rose-500/5";
      default: return "border-white/5 bg-white/5";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn("p-6 border-geom relative overflow-hidden group transition-all duration-300", getColorClass())}
    >
      <div className="absolute top-0 right-0 w-8 h-8 opacity-20" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)', backgroundColor: 'currentColor' }} />
      
      <div className="flex justify-between items-start mb-5">
        <div className="w-10 h-10 bg-black/40 flex items-center justify-center border border-white/10">
          {getIcon()}
        </div>
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/10 pb-0.5">{milestone.type}</span>
      </div>
      <p className="text-[13px] text-white/90 mb-6 leading-relaxed font-medium">{milestone.content}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[8px] uppercase font-mono text-slate-600 tracking-widest">
          <span>Success Delta</span>
          <span>{likelihood}%</span>
        </div>
        <div className="h-0.5 bg-black w-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${likelihood}%` }}
            className="h-full bg-current opacity-60"
          />
        </div>
      </div>
    </motion.div>
  );
}

function GoalWindowCard({ goalId, scenario }: { goalId: string, scenario: Scenario }) {
  const isHard = scenario.risk === "High";
  const isStretch = scenario.risk === "Medium";

  return (
    <div className={cn(
      "p-6 border-geom bg-[#0F1115] transition-all duration-500 hover:y-[-4px]",
      isHard ? "border-rose-900/40 hover:border-rose-500/40" : 
      isStretch ? "border-amber-900/40 hover:border-amber-500/40" : "border-emerald-900/40 hover:border-emerald-500/40"
    )}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-black/40 border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {goalId === "home" ? "🏠" : goalId === "car" ? "🚗" : "🎯"}
        </div>
        <span className={cn(
          "text-[8px] font-mono font-bold px-2 py-0.5 border-geom uppercase tracking-widest",
          isHard ? "text-rose-500 border-rose-500/20 bg-rose-500/5" : 
          isStretch ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
        )}>
          {isHard ? "Hard" : isStretch ? "Stretch" : "Optimal"}
        </span>
      </div>
      <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1.5">{goalId.replace("_", " ")}</h4>
      <p className="text-[9px] text-slate-500 font-mono mb-6 uppercase tracking-widest">Window: 2027—2029</p>
      
      <div className="flex items-end justify-between border-t border-white/5 pt-4">
        <div className="text-xl font-bold text-white tracking-tighter">84%</div>
        <div className="text-[8px] text-slate-600 uppercase font-mono tracking-widest">P // Success</div>
      </div>
    </div>
  );
}
