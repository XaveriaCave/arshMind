import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scenario, ActionTask, UserProfile } from "../../types";
import { cn } from "../../lib/utils";
import {
  CheckCircle2, Circle, Lock, Zap, TrendingUp, Brain,
  Users, Heart, Briefcase, DollarSign, AlertTriangle,
  ChevronDown, ChevronRight, Calendar, Target, Shield,
  Rocket, Globe, Clock,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

function getCategoryIcon(category: ActionTask["category"], size = 14) {
  switch (category) {
    case "career": return <Briefcase size={size} />;
    case "financial": return <DollarSign size={size} />;
    case "skill": return <Brain size={size} />;
    case "network": return <Users size={size} />;
    case "health": return <Heart size={size} />;
    case "business": return <TrendingUp size={size} />;
    default: return <Target size={size} />;
  }
}

function getCategoryColor(category: ActionTask["category"]) {
  switch (category) {
    case "career": return { text: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5" };
    case "financial": return { text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" };
    case "skill": return { text: "text-violet-400", border: "border-violet-500/20", bg: "bg-violet-500/5" };
    case "network": return { text: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/5" };
    case "health": return { text: "text-rose-400", border: "border-rose-500/20", bg: "bg-rose-500/5" };
    case "business": return { text: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" };
    default: return { text: "text-slate-400", border: "border-slate-500/20", bg: "bg-slate-500/5" };
  }
}

function getPriorityColor(priority: ActionTask["priority"]) {
  switch (priority) {
    case "critical": return "text-rose-500";
    case "high": return "text-amber-500";
    case "medium": return "text-emerald-500";
    case "low": return "text-slate-500";
  }
}

function getPhase(targetMonth: number): number {
  if (targetMonth <= 3) return 1;
  if (targetMonth <= 12) return 2;
  if (targetMonth <= 24) return 3;
  return 4;
}

function monthLabel(m: number): string {
  if (m <= 1) return "Month 1";
  if (m < 12) return `Month ${m}`;
  if (m === 12) return "Year 1";
  if (m < 24) return `Month ${m}`;
  if (m === 24) return "Year 2";
  if (m < 36) return `Month ${m}`;
  return "Year 3";
}

function getScenarioIcon(id: string) {
  switch (id) {
    case "upskill": return <Zap size={18} className="text-yellow-500" />;
    case "stay": return <Shield size={18} className="text-blue-500" />;
    case "venture": return <Rocket size={18} className="text-orange-500" />;
    case "relocated": return <Globe size={18} className="text-teal-500" />;
    case "passive": return <DollarSign size={18} className="text-green-500" />;
    case "freelance": return <Briefcase size={18} className="text-purple-500" />;
    default: return <TrendingUp size={18} className="text-emerald-500" />;
  }
}

const PHASE_META: Record<number, { label: string; span: string; colorText: string; colorBg: string }> = {
  1: { label: "Phase I", span: "Months 1–3", colorText: "text-rose-400", colorBg: "bg-rose-400" },
  2: { label: "Phase II", span: "Months 3–12", colorText: "text-amber-400", colorBg: "bg-amber-400" },
  3: { label: "Phase III", span: "Months 12–24", colorText: "text-emerald-400", colorBg: "bg-emerald-400" },
  4: { label: "Phase IV", span: "Months 24–36", colorText: "text-cyan-400", colorBg: "bg-cyan-400" },
};

const CATEGORIES: ActionTask["category"][] = [
  "career", "financial", "skill", "network", "health", "business",
];

// ── TaskCard ──────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onToggle,
  saving,
}: {
  task: ActionTask;
  onToggle: (id: string) => void;
  saving: boolean;
}) {
  const done = Boolean(task.completedAt);
  const cat = getCategoryColor(task.category);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border transition-all duration-300 group",
        done
          ? "border-emerald-500/20 bg-emerald-500/[0.03]"
          : "border-white/5 bg-[#0F1115] hover:border-white/10"
      )}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Checkbox */}
        <button
          onClick={() => !saving && onToggle(task.id)}
          disabled={saving}
          className={cn(
            "shrink-0 mt-0.5 transition-all",
            saving ? "opacity-40 cursor-not-allowed" : "hover:scale-110"
          )}
          title={done ? "Mark incomplete" : "Mark complete"}
        >
          {done
            ? <CheckCircle2 size={18} className="text-emerald-500" />
            : <Circle size={18} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
          }
        </button>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={cn("text-[8px] font-mono font-bold uppercase tracking-widest", getPriorityColor(task.priority))}>
              {task.priority}
            </span>
            <span className="text-slate-700 font-mono text-[8px]">·</span>
            <span className={cn(
              "flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest border px-2 py-0.5",
              cat.text, cat.border, cat.bg
            )}>
              {getCategoryIcon(task.category, 10)}
              {task.category}
            </span>
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-1">
              <Clock size={9} />
              {task.cadence}
            </span>
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest ml-auto flex items-center gap-1">
              <Calendar size={9} />
              {monthLabel(task.targetMonth)}
            </span>
          </div>

          <p className={cn(
            "text-sm font-bold uppercase tracking-tight transition-colors",
            done ? "text-slate-500 line-through" : "text-white"
          )}>
            {task.title}
          </p>

          {task.completedAt && (
            <p className="text-[8px] font-mono text-emerald-600 mt-1 uppercase tracking-widest">
              ✓ Completed {new Date(task.completedAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "2-digit",
              })}
            </p>
          )}

          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 mt-1.5 text-[9px] font-mono text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest"
          >
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            {expanded ? "hide details" : "show details"}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 text-xs text-slate-400 leading-relaxed border-l-2 border-white/5 pl-3 overflow-hidden"
              >
                {task.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {done && <div className="h-0.5 bg-emerald-500/30" />}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ActionPlan({
  scenarios,
  activeScenarioId,
  profile,
  onToggleTask,
  onInitializeVector,
  onSwitchVector,
  onNavigateToUpgrade,
}: {
  scenarios: Scenario[];
  activeScenarioId: string;
  profile: UserProfile;
  onToggleTask: (scenarioId: string, taskId: string) => Promise<void>;
  onInitializeVector: (scenarioId: string) => Promise<void>;
  onSwitchVector: (fromId: string, toId: string) => Promise<void>;
  onNavigateToUpgrade: () => void;
}) {
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  const [saving, setSaving] = useState(false);
  const [filterPhase, setFilterPhase] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState<ActionTask["category"] | null>(null);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [confirmSwitch, setConfirmSwitch] = useState<string | null>(null);

  const tasks = useMemo(() => activeScenario?.actionPlan ?? [], [activeScenario]);
  const doneCount = tasks.filter(t => t.completedAt).length;
  const progressPct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const isInit = Boolean(activeScenario?.initializedAt);

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (filterPhase && getPhase(t.targetMonth) !== filterPhase) return false;
    if (filterCat && t.category !== filterCat) return false;
    if (pendingOnly && t.completedAt) return false;
    return true;
  }), [tasks, filterPhase, filterCat, pendingOnly]);

  const phases = useMemo(() => {
    const map: Record<number, ActionTask[]> = {};
    filteredTasks.forEach(t => {
      const p = getPhase(t.targetMonth);
      (map[p] ??= []).push(t);
    });
    return map;
  }, [filteredTasks]);

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleToggle = async (taskId: string) => {
    if (!activeScenario || saving) return;
    setSaving(true);
    try {
      await onToggleTask(activeScenario.id, taskId);
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    if (!activeScenario || saving) return;
    setSaving(true);
    try {
      await onInitializeVector(activeScenario.id);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSwitch = async () => {
    if (!confirmSwitch || saving) return;
    setSaving(true);
    try {
      await onSwitchVector(activeScenario.id, confirmSwitch);
      setConfirmSwitch(null);
    } finally {
      setSaving(false);
    }
  };

  // ── empty states ──────────────────────────────────────────────────────────

  if (!activeScenario) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-3">
        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">// NO_ACTIVE_VECTOR</div>
        <p className="text-slate-500 text-sm">Select a scenario in the Scenario Engine tab first.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
        <div className="text-3xl">📋</div>
        <div>
          <div className="text-[9px] font-mono text-amber-500 uppercase tracking-widest mb-2">
            // ACTION_PLAN_UNAVAILABLE
          </div>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            This scenario has no action plan yet. Re-run analysis or recalibrate to generate tasks.
          </p>
        </div>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-12 pb-32">

      {/* Header */}
      <header className="border-l-2 border-emerald-500 pl-8 pb-4">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">Action Plan</h2>
        <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">
          Task registry for your active vector · progress synced to cloud
        </p>
      </header>

      {/* Active vector card */}
      <div className="p-8 bg-[#0F1115] border border-white/5 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-[0.03] pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Identity */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-black border border-white/10 flex items-center justify-center shrink-0">
              {getScenarioIcon(activeScenario.id)}
            </div>
            <div>
              <div className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest mb-1">
                {isInit ? "// ACTIVE_VECTOR · INITIALIZED" : "// ACTIVE_VECTOR · PENDING_INIT"}
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">{activeScenario.title}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeScenario.subtitle}</p>
            </div>
          </div>

          {/* Progress ring + stats */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke="#10b981" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - progressPct / 100)}`}
                    strokeLinecap="square"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold font-mono text-white">{progressPct}%</span>
                </div>
              </div>
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mt-1.5">progress</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-slate-400">{doneCount} completed</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
                <Circle size={12} className="text-slate-600" />
                <span className="text-slate-600">{tasks.length - doneCount} remaining</span>
              </div>
              {activeScenario.initializedAt && (
                <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-slate-700">
                  <Calendar size={10} />
                  Active since {new Date(activeScenario.initializedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "2-digit",
                  })}
                </div>
              )}
              {saving && (
                <div className="text-[8px] font-mono text-emerald-600 uppercase tracking-widest animate-pulse">
                  // saving...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-slate-600">
            <span>Vector completion</span>
            <span className="text-emerald-500">{doneCount}/{tasks.length} tasks</span>
          </div>
          <div className="h-1 w-full bg-black overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            />
          </div>
        </div>
      </div>

      {/* Initialize / Switch vector CTA */}
      {!isInit ? (
        <div className="p-8 border border-emerald-500/20 bg-emerald-500/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest mb-1">
              // VECTOR_AWAITING_INITIALIZATION
            </div>
            <p className="text-slate-300 text-sm font-medium max-w-lg leading-relaxed">
              Initialize this vector to begin tracking. Once activated, your progress syncs to the cloud.
              Switching vectors later is a Pro feature.
            </p>
          </div>
          <button
            onClick={handleInitialize}
            disabled={saving}
            className="shrink-0 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-mono font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2"
          >
            <Rocket size={12} />
            {saving ? "Initializing..." : "Initialize Vector"}
          </button>
        </div>
      ) : (
        <div className="p-5 border border-white/5 bg-[#0F1115] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest text-slate-500">
            <Lock size={12} className="text-amber-500" />
            <span>Switching vectors requires <span className="text-amber-400">Pro</span></span>
          </div>
          {!profile.isPro ? (
            <button
              onClick={onNavigateToUpgrade}
              className="px-5 py-2.5 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 font-mono text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Zap size={10} /> Unlock Pro
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {scenarios.filter(s => s.id !== activeScenarioId).map(s => (
                <button
                  key={s.id}
                  onClick={() => setConfirmSwitch(s.id)}
                  className="px-4 py-2 border border-white/5 hover:border-emerald-500/30 text-slate-500 hover:text-emerald-400 font-mono text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  {getScenarioIcon(s.id)} {s.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Filter:</span>

        {[1, 2, 3, 4].map(p => (
          <button
            key={p}
            onClick={() => setFilterPhase(filterPhase === p ? null : p)}
            className={cn(
              "px-3 py-1.5 text-[8px] font-mono uppercase tracking-widest border transition-all",
              filterPhase === p
                ? `${PHASE_META[p].colorText} border-current bg-current/5`
                : "text-slate-600 border-white/5 hover:border-white/10"
            )}
          >
            {PHASE_META[p].label}
          </button>
        ))}

        <div className="w-px h-4 bg-white/10 mx-1" />

        {CATEGORIES.map(cat => {
          const c = getCategoryColor(cat);
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? null : cat)}
              className={cn(
                "px-3 py-1.5 text-[8px] font-mono uppercase tracking-widest border transition-all flex items-center gap-1.5",
                filterCat === cat
                  ? `${c.text} ${c.border} ${c.bg}`
                  : "text-slate-600 border-white/5 hover:border-white/10"
              )}
            >
              {getCategoryIcon(cat, 9)}{cat}
            </button>
          );
        })}

        <div className="w-px h-4 bg-white/10 mx-1" />

        <button
          onClick={() => setPendingOnly(v => !v)}
          className={cn(
            "px-3 py-1.5 text-[8px] font-mono uppercase tracking-widest border transition-all flex items-center gap-1.5",
            pendingOnly
              ? "text-amber-400 border-amber-500/20 bg-amber-500/5"
              : "text-slate-600 border-white/5 hover:border-white/10"
          )}
        >
          <Circle size={9} /> Pending only
        </button>
      </div>

      {/* Task phases */}
      {Object.keys(phases).length === 0 ? (
        <div className="py-12 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
          // NO_TASKS_MATCH_FILTER
        </div>
      ) : (
        <div className="space-y-12">
          {([1, 2, 3, 4] as const).map(phase => {
            const pTasks = phases[phase];
            if (!pTasks?.length) return null;
            const meta = PHASE_META[phase];
            const pDone = pTasks.filter(t => t.completedAt).length;

            return (
              <section key={phase} className="space-y-4">
                {/* Phase header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-4">
                    <span className={cn("text-[9px] font-mono uppercase tracking-[0.3em] font-bold", meta.colorText)}>
                      {meta.label}
                    </span>
                    <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={10} /> {meta.span}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[9px] font-mono uppercase tracking-widest",
                    pDone === pTasks.length ? "text-emerald-500" : "text-slate-600"
                  )}>
                    {pDone}/{pTasks.length} done
                  </span>
                </div>

                {/* Phase progress bar */}
                <div className="h-0.5 w-full bg-black overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(pDone / pTasks.length) * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className={cn("h-full", meta.colorBg)}
                  />
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {[...pTasks]
                    .sort((a, b) => a.targetMonth - b.targetMonth)
                    .map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        saving={saving}
                      />
                    ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Category legend */}
      <div className="pt-8 border-t border-white/5">
        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-4">
          // CATEGORY_LEGEND
        </div>
        <div className="flex flex-wrap gap-4">
          {CATEGORIES.map(cat => {
            const c = getCategoryColor(cat);
            const count = tasks.filter(t => t.category === cat).length;
            if (!count) return null;
            return (
              <div key={cat} className={cn("flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest", c.text)}>
                {getCategoryIcon(cat, 10)}
                <span>{cat}</span>
                <span className="text-slate-700">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Switch vector confirm modal */}
      <AnimatePresence>
        {confirmSwitch && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1115] border border-amber-500 max-w-md w-full p-8 space-y-6 shadow-[0_20px_50px_rgba(245,158,11,0.15)]"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <AlertTriangle size={22} className="shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-widest font-mono">Switch Active Vector?</h3>
              </div>
              {(() => {
                const target = scenarios.find(s => s.id === confirmSwitch);
                return (
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed uppercase">
                    Task progress on <span className="text-white">{activeScenario.title}</span> will be paused.{" "}
                    <span className="text-amber-400">{target?.title}</span> will become active and synced to Firestore.
                  </p>
                );
              })()}
              <div className="flex justify-end gap-3 font-mono text-[9px] uppercase">
                <button
                  onClick={() => setConfirmSwitch(null)}
                  className="px-5 py-2.5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSwitch}
                  disabled={saving}
                  className="px-6 py-2.5 bg-amber-500 text-black hover:bg-amber-600 disabled:opacity-50 font-bold transition-all tracking-widest"
                >
                  {saving ? "Switching..." : "Confirm Switch"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}