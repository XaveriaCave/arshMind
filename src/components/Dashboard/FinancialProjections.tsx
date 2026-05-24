import { useMemo } from "react";
import { UserProfile, Scenario, ScenarioSettings } from "../../types";
import { cn, formatCurrency, formatCompactNumber } from "../../lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend, AreaChart, Area } from "recharts";
import { motion } from "motion/react";

export default function FinancialProjections({ 
  profile, 
  scenarios, 
  settings, 
  onUpdateSettings 
}: { 
  profile: UserProfile, 
  scenarios: Scenario[], 
  settings: ScenarioSettings,
  onUpdateSettings: (s: ScenarioSettings) => void
}) {
  const chartData = useMemo(() => {
    const years = [0, 1, 2, 3, 5, 7, 10];
    const initialNW = (profile.bankBalance || 0) + (profile.mutualFunds || 0) + (profile.fixedDeposits || 0);
    
    return years.map(year => {
      const data: any = { year: `Year ${year}` };
      
      scenarios.forEach(s => {
        // Simple projection logic
        const baseSalary = (profile.salary || 0) * 12;
        const growth = (settings.salaryGrowth || 0) / 100;
        const returns = (settings.investmentReturn || 0) / 100;
        const monthlySavings = (settings.savingsRate > 0 ? settings.savingsRate : (profile.monthlySavings || 0));
        
        // Compound Salary: Base * (1 + growth)^year * s.yearlyModifiers[year]
        // Net Worth: NW_prev * (1 + returns) + Savings_annual
        
        let nw = initialNW;
        let runningSavings = monthlySavings * 12;
        
        for (let i = 1; i <= year; i++) {
          const mod = s.yearlyModifiers.find(m => m.year <= i && (s.yearlyModifiers.find(next => next.year > m.year && next.year <= i) === undefined)) || { salaryMult: 1, savingsMult: 1 };
          
          const currentSalary = baseSalary * Math.pow(1 + growth, i) * mod.salaryMult;
          const currentSavings = runningSavings * Math.pow(1 + growth, i) * mod.savingsMult;
          
          nw = nw * (1 + returns) + currentSavings;
        }
        
        data[s.title] = Math.round(nw);
      });
      
      return data;
    });
  }, [profile, scenarios, settings]);

  const barData = useMemo(() => {
    return scenarios.map(s => {
      const tenYearNW = chartData[chartData.length - 1][s.title];
      return {
        name: s.title,
        value: tenYearNW,
        id: s.id
      };
    });
  }, [scenarios, chartData]);

  const scenarioColors = [
    "#10b981", // Emerald 500
    "#34d399", // Emerald 400
    "#059669", // Emerald 600
    "#64748b", // Slate 500
    "#94a3b8", // Slate 400
    "#cbd5e1", // Slate 300
  ];

  return (
    <div className="space-y-16 pb-32">
      <header className="border-l-2 border-emerald-500 pl-8 pb-4">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">Financial Trajectory</h2>
        <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">Projected Net Worth growth across all strategic scenario indices</p>
      </header>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-[#0F1115] border-geom border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-[0.02]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
        <ProjectionSlider 
          label="Retained Capital Rate" 
          val={settings.savingsRate || profile.monthlySavings} 
          min={5000} max={500000} step={5000} 
          onChange={(v) => onUpdateSettings({ ...settings, savingsRate: v })}
          prefix="₹"
        />
        <ProjectionSlider 
          label="Yield Vector Growth" 
          val={settings.salaryGrowth} 
          min={5} max={50} step={1} 
          onChange={(v) => onUpdateSettings({ ...settings, salaryGrowth: v })}
          suffix="%"
        />
        <ProjectionSlider 
          label="Asset Return Rate (μ)" 
          val={settings.investmentReturn} 
          min={6} max={25} step={0.5} 
          onChange={(v) => onUpdateSettings({ ...settings, investmentReturn: v })}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 h-[550px]">
        {/* Main Projection Chart */}
        <div className="p-10 bg-[#0F1115] border-geom border-white/5 flex flex-col relative">
          <div className="flex justify-between items-center mb-10">
            <label className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.4em] block">10Y Net Worth Vector</label>
            <div className="w-2 h-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  {scenarios.map((s, i) => (
                    <linearGradient key={s.id} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={scenarioColors[i % scenarioColors.length]} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={scenarioColors[i % scenarioColors.length]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#FFFFFF08" vertical={false} />
                <XAxis 
                   dataKey="year" 
                   stroke="#64748b" 
                   fontSize={9} 
                   tickLine={false} 
                   axisLine={false} 
                   dy={15}
                   fontFamily="JetBrains Mono"
                   textAnchor="middle"
                />
                <YAxis 
                   stroke="#64748b" 
                   fontSize={9} 
                   tickLine={false} 
                   axisLine={false} 
                   tickFormatter={(val) => `₹${formatCompactNumber(val)}`}
                   fontFamily="JetBrains Mono"
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: "#0A0A0B", border: "1px solid #FFFFFF10", fontSize: "11px", fontFamily: "JetBrains Mono", textTransform: "uppercase" }}
                   itemStyle={{ fontSize: "10px", padding: 0 }}
                   formatter={(value: any) => formatCurrency(value)}
                />
                <Legend 
                   iconType="rect" 
                   wrapperStyle={{ 
                     fontSize: "9px", 
                     paddingTop: "30px", 
                     fontFamily: "JetBrains Mono", 
                     textTransform: "uppercase", 
                     letterSpacing: "0.1em" 
                   }} 
                />
                {scenarios.map((s, i) => (
                  <Area 
                    key={s.id} 
                    type="monotone" 
                    dataKey={s.title} 
                    stroke={scenarioColors[i % scenarioColors.length]} 
                    fillOpacity={1} 
                    fill={`url(#grad-${s.id})`} 
                    strokeWidth={i === 0 ? 3 : 1.5}
                    activeDot={{ r: 4, strokeWidth: 0, fill: scenarioColors[i % scenarioColors.length] }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison Bar Chart */}
        <div className="p-10 bg-[#0F1115] border-geom border-white/5 flex flex-col relative">
          <div className="flex justify-between items-center mb-10">
            <label className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.4em] block">Terminal Wealth Index</label>
            <div className="w-8 h-px bg-white/10" />
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#FFFFFF08" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                   dataKey="name" 
                   type="category" 
                   stroke="#94a3b8" 
                   fontSize={9} 
                   width={120}
                   tickLine={false}
                   axisLine={false}
                   fontFamily="JetBrains Mono"
                   textAnchor="start"
                   dx={-120}
                   interval={0}
                />
                <Tooltip 
                   cursor={{ fill: "rgba(255,255,255,0.02)" }}
                   contentStyle={{ backgroundColor: "#0A0A0B", border: "1px solid #FFFFFF10", fontSize: "11px", fontFamily: "JetBrains Mono" }}
                   formatter={(value: any) => formatCurrency(value)}
                />
                <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={14}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={scenarioColors[index % scenarioColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectionSlider({ label, val, min, max, step, onChange, prefix = "", suffix = "" }: any) {
  return (
    <div className="space-y-6 relative z-10">
      <div className="flex justify-between items-end">
        <label className="text-[9px] text-slate-500 uppercase font-mono tracking-[0.2em] font-bold">{label}</label>
        <span className="text-sm font-bold text-emerald-500 font-mono italic">{prefix}{(val || 0).toLocaleString()}{suffix}</span>
      </div>
      <div className="relative group/slider">
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-[3px] bg-black border border-white/5 appearance-none cursor-pointer accent-emerald-500 transition-all"
        />
        <div className="absolute top-[-10px] left-0 w-full h-[20px] pointer-events-none opacity-0 group-hover/slider:opacity-10 transition-opacity bg-emerald-500/20 blur-xl" />
      </div>
    </div>
  );
}
