import { UserProfile, Scenario } from "../../types";
import { cn, formatCurrency, formatCompactNumber } from "../../lib/utils";
import { ARCHETYPES } from "../../constants";
import { Edit3, RotateCcw, Power, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

export default function Sidebar({
  profile,
  activeTab,
  setActiveTab,
  tabs,
  onEditProfile,
  onReset,
  onSignOut,
  activeScenario,
  theme,
  onToggleTheme
}: {
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: any[];
  onEditProfile: () => void;
  onReset: () => void;
  onSignOut: () => void;
  activeScenario?: Scenario;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const archetype = ARCHETYPES.find(a => a.id === profile.archetype) || ARCHETYPES[7];
  const level = Math.floor((profile.age - 16) / 3) + 1;

  // Clarity Score Mock (normally calculated from completeness)
  const clarityScore = 82;

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto no-scrollbar bg-[#0A0A0B]">
      {/* Brand */}
      <div className="mb-12 lg:flex hidden items-center gap-3">
        <div className="w-6 h-6 bg-emerald-500 rounded-sm rotate-45 flex items-center justify-center shrink-0">
          <div className="w-3 h-3 bg-black rounded-sm -rotate-45" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-widest uppercase leading-none">
            <span className="text-emerald-500">Arsh</span><span className="text-white">Mind</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1 h-1 bg-emerald-500 animate-pulse" />
            <span className="text-[8px] text-emerald-500/50 uppercase font-mono tracking-[0.2em]">Live Connection</span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mb-10 bg-[#0F1115] border-geom border-white/5 relative group p-6 overflow-hidden arsh-mind-bottom">
        <div className="absolute top-0 right-0 w-12 h-12 bg-white/5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />

        <div className="flex gap-5 items-center relative z-10">
          <div className="relative">
            <div className="w-14 h-14 bg-black flex items-center justify-center text-3xl border border-white/10">
              {archetype.emoji}
            </div>
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-mono font-bold border border-black uppercase">
              LVL {level}
            </div>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-white uppercase truncate tracking-tight">{profile.name}</h3>
            <p className="text-[9px] text-emerald-500/70 font-mono uppercase tracking-widest mt-0.5">{archetype.class}</p>
            {profile.isPro ? (
              <span className="inline-block mt-2 font-mono text-[8px] font-bold tracking-widest text-amber-400 border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 rounded-none uppercase">
                ⚡️ PREM OPERATIVE
              </span>
            ) : (
              <button
                onClick={() => setActiveTab("pro-upgrade")}
                className="block text-left mt-2 font-mono text-[7.5px] font-bold tracking-widest text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded-none uppercase transition-all"
              >
                ✦ UPGRADE TO PRO
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] uppercase font-mono text-slate-500 tracking-widest">
              <span>System Clarity</span>
              <span className="text-emerald-500">{clarityScore}%</span>
            </div>
            <div className="h-1 bg-black w-full overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${clarityScore}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-12">
        <StatTile label="Cycle LPA" value={`₹${formatCompactNumber(profile.salary)}`} />
        <StatTile label="Saved/Mo" value={`₹${formatCompactNumber(profile.monthlySavings)}`} />
        <StatTile label="T. Assets" value={`₹${formatCompactNumber(profile.bankBalance + profile.mutualFunds + profile.fixedDeposits)}`} />
        <StatTile label="Risk DNA" value={profile.riskLevel?.toUpperCase().substring(0, 3) || "MOD"} />
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        <label className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.3em] mb-6 block px-1">Control Modules</label>
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 transition-all relative border-geom group",
              activeTab === tab.id ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/5"
            )}
          >
            <tab.icon size={16} className={cn("transition-colors", activeTab === tab.id ? "text-emerald-500" : "text-slate-600")} />
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div layoutId="nav-pill-active" className="absolute left-[-2px] inset-y-3 w-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="pt-8 mt-4 border-t border-white/5 space-y-1">
        <button onClick={onEditProfile} className="w-full flex items-center justify-between px-4 py-2.5 text-[9px] text-slate-500 hover:text-white uppercase font-mono tracking-widest group transition-colors">
          <span>Revise Matrix</span>
          <Edit3 size={10} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button onClick={onReset} className="w-full flex items-center justify-between px-4 py-2.5 text-[9px] text-slate-500 hover:text-rose-500 uppercase font-mono tracking-widest group transition-colors">
          <span>Wipe System</span>
          <RotateCcw size={10} className="group-hover:rotate-180 transition-transform duration-700" />
        </button>
        <button onClick={onToggleTheme} className="w-full flex items-center justify-between px-4 py-2.5 text-[9px] text-slate-500 hover:text-emerald-500 uppercase font-mono tracking-widest group transition-colors">
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          {theme === "dark" ? <Sun size={10} className="group-hover:scale-120 transition-transform" /> : <Moon size={10} className="group-hover:scale-120 transition-transform" />}
        </button>
        <button onClick={onSignOut} className="w-full flex items-center justify-between px-4 py-2.5 text-[9px] text-slate-600 hover:text-emerald-500 uppercase font-mono tracking-widest group transition-colors border-t border-white/5 mt-2 pt-2">
          <span>Disconnect</span>
          <Power size={10} className="group-hover:scale-125 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-[#0F1115] border-geom border-white/10 p-3 text-center">
      <div className="text-[8px] text-slate-600 uppercase font-mono mb-1.5 tracking-widest">{label}</div>
      <div className="text-[10px] font-bold text-white truncate font-mono uppercase italic tracking-tighter">{value}</div>
    </div>
  );
}
