import { useState } from "react";
import { UserProfile, Scenario, ScenarioSettings } from "../../types";
import { cn, formatCurrency, formatCompactNumber } from "../../lib/utils";
import Sidebar from "./Sidebar";
import TimelineView from "./TimelineView";
import ScenarioExplorer from "./ScenarioExplorer";
import FinancialProjections from "./FinancialProjections";
import ActionPlan from "./ActionPlan";
import ComparePaths from "./ComparePaths";
import ProUpgrade from "./ProUpgrade";
import { Menu, X, LayoutDashboard, Calendar, Search, TrendingUp, CheckSquare, BarChart2, Sun, Moon, Sparkles } from "lucide-react";

export default function Dashboard({
  profile,
  scenarios,
  settings,
  onUpdateSettings,
  onUpdateProfile,
  onUpdateScenarios,
  onEditProfile,
  onReset,
  onSignOut,
  theme,
  onToggleTheme
}: {
  profile: UserProfile;
  scenarios: Scenario[];
  settings: ScenarioSettings;
  onUpdateSettings: (s: ScenarioSettings) => void;
  onUpdateProfile: (fields: Partial<UserProfile>) => Promise<void>;
  onUpdateScenarios: (newScenarios: Scenario[]) => Promise<void>;
  onEditProfile: () => void;
  onReset: () => void;
  onSignOut: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const TABS = [
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "scenarios", label: "Scenarios", icon: Search },
    { id: "financials", label: "Financials", icon: TrendingUp },
    { id: "action", label: "Action Plan", icon: CheckSquare },
    { id: "compare", label: "Compare", icon: BarChart2 },
    { id: "pro-upgrade", label: "Pro Upgrade", icon: Sparkles },
  ];

  const activeScenario = scenarios.find(s => s.id === settings.activeScenarioId) || scenarios[0];

  return (
    <div className="h-screen flex text-slate-300 bg-[#0A0A0B] overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0B] border-r border-white/5 transition-transform duration-300 lg:translate-x-0 lg:static lg:block h-full overflow-y-auto no-scrollbar",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar
          profile={profile}
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
          tabs={TABS}
          onEditProfile={onEditProfile}
          onReset={onReset}
          onSignOut={onSignOut}
          activeScenario={activeScenario}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      </div>

      {/* Content Area */}
      <main className="flex-1 flex flex-col h-screen relative z-0 bg-[#0F1115] overflow-hidden">
        {/* Mobile Header - and potentially desktop sticky toggle */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/90 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="flex-1 lg:flex-none">
            <span className="text-xs font-bold uppercase tracking-widest">
              <span className="text-emerald-500">Arsh</span><span className="text-white">Mind</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              className="p-2 border-geom border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-colors"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <div className="w-8 h-8 bg-white/5 rounded-none border-geom border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white uppercase">
              {profile.name?.[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-12 overflow-y-auto no-scrollbar">
          {activeTab === "timeline" && <TimelineView profile={profile} scenario={activeScenario} />}
          {activeTab === "scenarios" && (
            <ScenarioExplorer
              scenarios={scenarios}
              activeScenarioId={settings.activeScenarioId}
              onSelect={(id) => onUpdateSettings({ ...settings, activeScenarioId: id })}
              profile={profile}
              onUpdateScenarios={onUpdateScenarios}
              onNavigateToUpgrade={() => setActiveTab("pro-upgrade")}
            />
          )}
          {activeTab === "financials" && (
            <FinancialProjections
              profile={profile}
              scenarios={scenarios}
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />
          )}
          {activeTab === "action" && (
            <ActionPlan
              scenarios={scenarios}
              activeScenarioId={settings.activeScenarioId}
              profile={profile}
              onUpdateScenarios={onUpdateScenarios}
              onNavigateToUpgrade={() => setActiveTab("pro-upgrade")}
            />
          )}
          {activeTab === "compare" && <ComparePaths scenarios={scenarios} />}
          {activeTab === "pro-upgrade" && (
            <ProUpgrade
              profile={profile}
              onUpdateProfile={onUpdateProfile}
            />
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden h-20 border-t border-white/5 bg-black/90 backdrop-blur-md flex items-center justify-around fixed w-full bottom-0 z-30 pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 group transition-all",
                activeTab === tab.id ? "text-emerald-500" : "text-slate-600"
              )}
            >
              <div className={cn(
                "p-2 rounded-none transition-all duration-300 border-geom",
                activeTab === tab.id ? "bg-emerald-500/10 border-emerald-500/30" : "border-transparent"
              )}>
                <tab.icon size={18} />
              </div>
              <span className="text-[9px] uppercase font-mono tracking-widest font-bold">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
