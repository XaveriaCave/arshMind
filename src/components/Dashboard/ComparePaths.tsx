import { useState, useMemo } from "react";
import { Scenario } from "../../types";
import { cn, formatCompactNumber } from "../../lib/utils";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TrendingUp, AlertTriangle, Shield, Check, Zap } from "lucide-react";

export default function ComparePaths({ scenarios }: { scenarios: Scenario[] }) {
  const [pathAId, setPathAId] = useState(scenarios[0]?.id || "");
  const [pathBId, setPathBId] = useState(scenarios[1]?.id || "");

  if (scenarios.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-geom border-white/5 bg-[#0F1115]">
        <div className="text-emerald-500 font-mono text-xs uppercase tracking-[0.4em] mb-4">Insufficient Projection Data</div>
        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest text-center max-w-md px-10 leading-relaxed italic">
          Multiple vector indices are required for differential analysis. Current trajectory density: {scenarios.length}/2
        </p>
      </div>
    );
  }

  const pathA = scenarios.find(s => s.id === pathAId) || scenarios[0];
  const pathB = scenarios.find(s => s.id === pathBId) || scenarios[1];

  const radarData = useMemo(() => {
    // Axis: Risk, Income, Wealth, Viability, Stability, Freedom
    // Map scenario values (approximate for display)
    const getVal = (s: Scenario, axis: string) => {
      switch (axis) {
        case "Risk": return s.risk === "High" ? 90 : s.risk === "Medium" ? 60 : 30;
        case "Income": return (s.stats.fiveYearSalary / 5000000) * 100;
        case "Wealth": return (s.stats.fiveYearSavings / 10000000) * 100;
        case "Viability": return s.viability;
        case "Stability": return s.risk === "Low" ? 90 : s.risk === "Medium" ? 50 : 20;
        case "Freedom": return s.id === "venture" || s.id === "freelance" ? 90 : 40;
        default: return 50;
      }
    };

    const axes = ["Risk", "Income", "Wealth", "Viability", "Stability", "Freedom"];
    return axes.map(axis => ({
      subject: axis,
      A: Math.min(getVal(pathA, axis), 100),
      B: Math.min(getVal(pathB, axis), 100),
      fullMark: 100,
    }));
  }, [pathA, pathB]);

   const compareStats: { label: string; key: string; format: (v: any) => string }[] = [
     { label: "5-Year Salary", key: "fiveYearSalary", format: (v: number) => `₹${formatCompactNumber(v)}` },
     { label: "5-Year Net Worth", key: "fiveYearSavings", format: (v: number) => `₹${formatCompactNumber(v)}` },
     { label: "Viability Grade", key: "viability", format: (v: number) => `${v}%` },
     { label: "Risk Exposure", key: "risk", format: (v: string) => v }
   ];

  return (
    <div className="space-y-16 pb-32">
      <header className="border-l-2 border-emerald-500 pl-8 pb-4">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">Vector Comparison</h2>
        <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">Differential analysis between strategic life vectors</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
           <label className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.4em] mb-3 block px-1">Source Vector (α)</label>
           <select 
             value={pathAId} 
             onChange={e => setPathAId(e.target.value)}
             className="w-full bg-[#0F1115] border-geom border-white/10 p-5 text-[11px] font-mono text-emerald-500 focus:outline-none focus:border-emerald-500/50 uppercase tracking-widest appearance-none"
             style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, #10b981 50%), linear-gradient(135deg, #10b981 50%, transparent 50%)', backgroundPosition: 'calc(100% - 20px) calc(1em + 10px), calc(100% - 15px) calc(1em + 10px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
           >
             {scenarios.map(s => <option key={s.id} value={s.id}>{s.title.toUpperCase()}</option>)}
           </select>
        </div>
        <div className="space-y-3">
           <label className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.4em] mb-3 block px-1">target Vector (β)</label>
           <select 
             value={pathBId} 
             onChange={e => setPathBId(e.target.value)}
             className="w-full bg-[#0F1115] border-geom border-white/10 p-5 text-[11px] font-mono text-emerald-400 focus:outline-none focus:border-emerald-400/50 uppercase tracking-widest appearance-none"
             style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, #34d399 50%), linear-gradient(135deg, #34d399 50%, transparent 50%)', backgroundPosition: 'calc(100% - 20px) calc(1em + 10px), calc(100% - 15px) calc(1em + 10px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
           >
             {scenarios.map(s => <option key={s.id} value={s.id}>{s.title.toUpperCase()}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
        {/* Radar Chart */}
        <div className="aspect-square bg-[#0F1115] border-geom border-white/5 p-12 relative">
           <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
           <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#FFFFFF10" strokeDasharray="3 3Lines" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 10, fontStyle: "normal", fontWeight: "bold", fontFamily: "JetBrains Mono" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                   name={`${pathA.title}`}
                   dataKey="A"
                   stroke="#10b981"
                   fill="#10b981"
                   fillOpacity={0.15}
                   strokeWidth={3}
                />
                <Radar
                   name={`${pathB.title}`}
                   dataKey="B"
                   stroke="#34d399"
                   fill="#34d399"
                   fillOpacity={0.1}
                   strokeWidth={2}
                   strokeDasharray="4 4"
                />
                <Legend 
                  iconType="rect" 
                  wrapperStyle={{ 
                    fontSize: "9px", 
                    color: "#fff", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.2em",
                    fontFamily: "JetBrains Mono",
                    top: -40
                  }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0A0A0B", 
                    border: "1px solid #FFFFFF10", 
                    fontSize: "11px",
                    fontFamily: "JetBrains Mono",
                    textTransform: "uppercase"
                  }}
                  itemStyle={{ color: "#10b981" }}
                />
              </RadarChart>
           </ResponsiveContainer>
        </div>

        {/* Comparison Stats Table */}
        <div className="space-y-8">
           {compareStats.map((stat, i) => {
             const valA = (pathA.stats as any)[stat.key] || (pathA as any)[stat.key];
             const valB = (pathB.stats as any)[stat.key] || (pathB as any)[stat.key];
             
             // Winner logic
             const isWinnerA = typeof valA === 'number' ? valA > valB : false;
             const isWinnerB = typeof valB === 'number' ? valB > valA : false;

             return (
               <div key={i} className="flex flex-col gap-3">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.4em] mb-1 px-1">Metric // {stat.label}</div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className={cn(
                       "p-6 border-geom bg-black/40 flex justify-between items-center transition-all duration-300",
                       isWinnerA ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_5px_20px_rgba(16,185,129,0.05)]" : "border-white/5 opacity-60"
                     )}>
                        <div className="flex flex-col">
                           <span className={cn("text-xl font-bold tracking-tighter uppercase font-mono", isWinnerA ? "text-emerald-500" : "text-slate-400")}>
                             {stat.format(valA)}
                           </span>
                        </div>
                        {isWinnerA && (
                          <div className="w-8 h-8 rounded-sm bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                            <Check size={14} className="text-emerald-500" />
                          </div>
                        )}
                     </div>
                     <div className={cn(
                       "p-6 border-geom bg-black/40 flex justify-between items-center transition-all duration-300",
                       isWinnerB ? "border-emerald-400/40 bg-emerald-400/5 shadow-[0_5px_20px_rgba(52,211,153,0.05)]" : "border-white/5 opacity-60"
                     )}>
                       <div className="flex flex-col">
                           <span className={cn("text-xl font-bold tracking-tighter uppercase font-mono", isWinnerB ? "text-emerald-400" : "text-slate-400")}>
                             {stat.format(valB)}
                           </span>
                        </div>
                        {isWinnerB && (
                          <div className="w-8 h-8 rounded-sm bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center">
                            <Check size={14} className="text-emerald-400" />
                          </div>
                        )}
                     </div>
                  </div>
               </div>
             );
           })}

           <div className="mt-12 p-10 bg-[#0F1115] border-geom border-emerald-500/20 relative">
              <div className="w-10 h-10 bg-emerald-500 rounded-sm rotate-45 flex items-center justify-center absolute top-[-20px] left-[-20px]">
                <Zap size={20} className="text-black -rotate-45" />
              </div>
              <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.3em] mb-6 font-mono border-b border-white/10 pb-4">Strategic Vector Analysis</h4>
              <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
                {pathA.viability > pathB.viability 
                  ? `PREDICTIVE CORE INDICATES THAT ${pathA.title.toUpperCase()} EXHIBITS A HIGHER VIABILITY INDEX OF ${pathA.viability}% VS ${pathB.viability}%. THIS INDICATES A MORE STABLE COMPOUND GROWTH WITH LOWER EXECUTION RISK OVER THE 10-YEAR HORIZON.`
                  : `STRATEGICALLY, ${pathB.title.toUpperCase()} OFFERS SUPERIOR WEALTH ACCUMULATION WITH A ${pathB.stats.confidence.toUpperCase()} CONFIDENCE RATING. RECOMMENDED FOR AGGRESSIVE CAPITAL SCALING IN THE CURRENT VECTOR.`}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
