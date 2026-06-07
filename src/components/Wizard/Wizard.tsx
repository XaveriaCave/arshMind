import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../../types";
import { cn } from "../../lib/utils";
import {
  INDUSTRIES, EMPLOYMENT_TYPES, ASSETS, LOANS, GOALS,
  RISK_LEVELS, LOCATIONS, COMMITMENTS, URGENCY_LEVELS, EDUCATION_LEVELS
} from "../../constants";
import { Check, ChevronLeft, ChevronRight, Lock, AlertCircle } from "lucide-react";

// ── Mandatory field definitions per step ────────────────────────────────────
// Each entry is a profile key that must be non-empty/non-zero to proceed.
const REQUIRED_PER_STEP: Record<number, { key: keyof UserProfile; label: string }[]> = {
  1: [
    { key: "name", label: "Operative Name" },
    { key: "age", label: "Current Age" },
    { key: "city", label: "Location" },
    { key: "education", label: "Professional Education" },
    { key: "maritalStatus", label: "Social Matrix" },
  ],
  2: [
    { key: "jobTitle", label: "Primary Designation" },
    { key: "salary", label: "Base Compensation" },
    { key: "industry", label: "Sector" },
    { key: "employmentType", label: "Employment Protocol" },
  ],
  3: [
    { key: "takeHomeIncome", label: "Net Inflow (Monthly)" },
    { key: "monthlyExpenses", label: "Burn Rate (Monthly)" },
    { key: "monthlySavings", label: "Monthly Retention" },
  ],
  4: [],  // Assets optional
  5: [],  // Goals optional
  6: [
    { key: "riskLevel", label: "Risk Calibration" },
  ],
  7: [],  // Constraints optional
};

// Employment types that trigger contextual fields
const SELF_EMPLOYMENT_TYPES = ["Self-employed", "Business owner", "Freelance"];
const FOUNDER_TYPES = ["Business owner"];
const FREELANCE_TYPES = ["Freelance"];

// Startup/business stage options
const STARTUP_STAGES = [
  "Idea / Pre-revenue",
  "MVP / Early Traction",
  "Seed Stage (₹0–₹50L ARR)",
  "Growth Stage (₹50L–₹5Cr ARR)",
  "Scale Stage (₹5Cr+ ARR)",
  "Profitable / Self-sustaining",
];

const TEAM_SIZES = [
  "Solo / Just me",
  "2–5 people",
  "6–15 people",
  "16–50 people",
  "50+ people",
];

const FREELANCE_DOMAINS = [
  "Design / Creative",
  "Development / Tech",
  "Content / Writing",
  "Marketing / SEO",
  "Consulting / Advisory",
  "Finance / Accounting",
  "Legal / Compliance",
  "Coaching / Training",
  "Other",
];

const FREELANCE_SCALES = [
  "Side income (< ₹20K/mo)",
  "Part-time (₹20K–₹60K/mo)",
  "Full-time (₹60K–₹2L/mo)",
  "High-ticket (₹2L+/mo)",
];

const BUSINESS_TYPES = [
  "Product / SaaS",
  "Service / Agency",
  "E-commerce / D2C",
  "Manufacturing",
  "Distribution / Trading",
  "Content / Media",
  "Consulting / Advisory",
  "Other",
];

// Extended UserProfile fields (added to types but stored in extraContext for now)
interface ExtendedProfile extends Partial<UserProfile> {
  startupStage?: string;
  teamSize?: string;
  businessType?: string;
  freelanceDomain?: string;
  freelanceScale?: string;
  monthlyRevenue?: number;
}

function isFieldEmpty(value: any): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (typeof value === "number" && (value === 0 || isNaN(value))) return true;
  return false;
}

export default function Wizard({
  initialProfile,
  onComplete,
  onBack,
}: {
  initialProfile: Partial<UserProfile>;
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ExtendedProfile>({
    ...initialProfile,
    assets: (initialProfile as any).assets || [],
    loans: (initialProfile as any).loans || [],
    goals: (initialProfile as any).goals || [],
    commitments: (initialProfile as any).commitments || [],
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const STEPS = [
    { id: 1, title: "Personal Base" },
    { id: 2, title: "Career Profile" },
    { id: 3, title: "Financial Status" },
    { id: 4, title: "Assets & Liabilities" },
    { id: 5, title: "Dreams & Goals" },
    { id: 6, title: "Risk DNA" },
    { id: 7, title: "Constraints" },
  ];

  const updateProfile = (updates: Partial<ExtendedProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    // Clear validation errors when user starts filling
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const toggleArrayItem = (field: keyof UserProfile, item: string) => {
    const current = (profile[field] as string[]) || [];
    if (current.includes(item)) {
      updateProfile({ [field]: current.filter(i => i !== item) });
    } else {
      updateProfile({ [field]: [...current, item] });
    }
  };

  // Validate required fields for current step
  const validateStep = (): string[] => {
    const required = REQUIRED_PER_STEP[step] || [];
    const missing: string[] = [];
    for (const field of required) {
      if (isFieldEmpty((profile as any)[field.key])) {
        missing.push(field.label);
      }
    }
    return missing;
  };

  const next = () => {
    const missing = validateStep();
    if (missing.length > 0) {
      setValidationErrors(missing);
      return;
    }
    setValidationErrors([]);

    if (step < 7) {
      setStep(step + 1);
    } else {
      // Build final profile — merge contextual fields into extraContext
      const contextualSummary = buildContextualSummary(profile);
      const finalProfile: UserProfile = {
        ...(profile as UserProfile),
        extraContext: [
          profile.extraContext || "",
          contextualSummary,
        ].filter(Boolean).join("\n\n"),
      };
      onComplete(finalProfile);
    }
  };

  const prev = () => {
    setValidationErrors([]);
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  // Determine contextual mode
  const employmentType = profile.employmentType || "";
  const isFounder = FOUNDER_TYPES.includes(employmentType);
  const isFreelancer = FREELANCE_TYPES.includes(employmentType);
  const isSelfEmployed = SELF_EMPLOYMENT_TYPES.includes(employmentType);

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
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[10px] uppercase tracking-[0.2em] font-mono transition-all duration-300",
                    step === s.id ? "text-white font-bold" : step > s.id ? "text-slate-400" : "text-slate-600"
                  )}>
                    {s.title}
                  </span>
                  {/* Show required indicator */}
                  {REQUIRED_PER_STEP[s.id]?.length > 0 && (
                    <span className="text-[7px] font-mono text-emerald-500/40 tracking-widest uppercase mt-0.5">
                      {REQUIRED_PER_STEP[s.id].length} required
                    </span>
                  )}
                </div>
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
              {/* Step Title */}
              <div className="relative border-l border-emerald-500/30 pl-8">
                <span className="text-[10px] text-emerald-500 font-mono tracking-[0.4em] uppercase block mb-3">
                  Module // 0{step}
                </span>
                <h3 className="text-4xl font-bold text-white uppercase tracking-tighter leading-none mb-2">
                  {STEPS[step - 1].title}
                </h3>
                <div className="h-1 w-12 bg-emerald-500" />
                {REQUIRED_PER_STEP[step]?.length > 0 && (
                  <p className="text-[9px] text-slate-600 font-mono mt-3 uppercase tracking-widest">
                    Fields marked with <span className="text-rose-500">*</span> are required to proceed
                  </p>
                )}
              </div>

              {/* Validation Error Banner */}
              <AnimatePresence>
                {validationErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/20"
                  >
                    <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[9px] font-mono font-bold text-rose-500 uppercase tracking-widest mb-1">
                        // MISSING_REQUIRED_FIELDS
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                        {validationErrors.join(" · ")}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Content */}
              <div className="space-y-8">

                {/* ── STEP 1: Personal Base ── */}
                {step === 1 && (
                  <>
                    <HUDInput
                      label="Operative Name"
                      required
                      value={profile.name}
                      onChange={v => updateProfile({ name: v })}
                      placeholder="IDENTIFY YOURSELF"
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <HUDInput
                        label="Current Age"
                        required
                        type="number"
                        value={profile.age}
                        onChange={v => updateProfile({ age: Number(v) })}
                        placeholder="25"
                        min={16}
                        max={70}
                      />
                      <HUDInput
                        label="Location / City"
                        required
                        value={profile.city}
                        onChange={v => updateProfile({ city: v })}
                        placeholder="Mumbai, IN"
                      />
                    </div>
                    <HUDSelect
                      label="Professional Education"
                      required
                      options={EDUCATION_LEVELS}
                      value={profile.education}
                      onChange={v => updateProfile({ education: v })}
                    />
                    <HUDToggleGroup
                      label="Social Matrix"
                      required
                      options={["Single", "Married", "In Relationship"]}
                      value={profile.maritalStatus}
                      onChange={v => updateProfile({ maritalStatus: v })}
                    />
                  </>
                )}

                {/* ── STEP 2: Career Profile ── */}
                {step === 2 && (
                  <>
                    <HUDInput
                      label="Primary Designation"
                      required
                      value={profile.jobTitle}
                      onChange={v => updateProfile({ jobTitle: v })}
                      placeholder="Senior Systems Architect"
                    />
                    <HUDInput
                      label="Years of Experience"
                      type="number"
                      value={profile.experience}
                      onChange={v => updateProfile({ experience: Number(v) })}
                      placeholder="5"
                      min={0}
                    />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] tracking-widest uppercase mb-1">
                        <label>
                          Base Compensation (Annual)
                          <span className="text-rose-500 ml-1">*</span>
                        </label>
                        <span className="text-emerald-500 font-bold text-sm">
                          ₹{((profile.salary || 0) / 100000).toFixed(1)}L PA
                        </span>
                      </div>
                      <HUDSlider
                        min={100000}
                        max={10000000}
                        step={50000}
                        value={profile.salary || 0}
                        onChange={v => updateProfile({ salary: v })}
                      />
                      <div className="flex justify-between text-[8px] font-mono text-slate-700 uppercase tracking-widest">
                        <span>₹1L</span>
                        <span>₹1Cr</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <HUDSelect
                        label="Sector"
                        required
                        options={INDUSTRIES}
                        value={profile.industry}
                        onChange={v => updateProfile({ industry: v })}
                      />
                      <HUDSelect
                        label="Employment Protocol"
                        required
                        options={EMPLOYMENT_TYPES}
                        value={profile.employmentType}
                        onChange={v => updateProfile({
                          employmentType: v,
                          // Reset contextual fields when type changes
                          startupStage: undefined,
                          teamSize: undefined,
                          businessType: undefined,
                          freelanceDomain: undefined,
                          freelanceScale: undefined,
                          monthlyRevenue: undefined,
                        })}
                      />
                    </div>

                    {/* ── Contextual: Founder / Business Owner ── */}
                    <AnimatePresence>
                      {isFounder && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-6 border-l-2 border-amber-500/30 pl-6">
                            <div className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">
                              // FOUNDER_PROFILE_DETECTED — Additional Parameters
                            </div>
                            <HUDSelect
                              label="Business Type"
                              options={BUSINESS_TYPES}
                              value={profile.businessType}
                              onChange={v => updateProfile({ businessType: v })}
                            />
                            <HUDSelect
                              label="Startup / Business Stage"
                              options={STARTUP_STAGES}
                              value={profile.startupStage}
                              onChange={v => updateProfile({ startupStage: v })}
                            />
                            <HUDSelect
                              label="Team Size"
                              options={TEAM_SIZES}
                              value={profile.teamSize}
                              onChange={v => updateProfile({ teamSize: v })}
                            />
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] tracking-widest uppercase">
                                <label>Monthly Revenue (Current)</label>
                                <span className="text-amber-500 font-bold text-sm">
                                  ₹{((profile.monthlyRevenue || 0) / 1000).toFixed(0)}K
                                </span>
                              </div>
                              <HUDSlider
                                min={0}
                                max={5000000}
                                step={10000}
                                value={profile.monthlyRevenue || 0}
                                onChange={v => updateProfile({ monthlyRevenue: v })}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── Contextual: Freelancer ── */}
                    <AnimatePresence>
                      {isFreelancer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-6 border-l-2 border-cyan-500/30 pl-6">
                            <div className="text-[9px] font-mono text-cyan-500 uppercase tracking-widest">
                              // FREELANCE_PROFILE_DETECTED — Additional Parameters
                            </div>
                            <HUDSelect
                              label="Freelance Domain"
                              options={FREELANCE_DOMAINS}
                              value={profile.freelanceDomain}
                              onChange={v => updateProfile({ freelanceDomain: v })}
                            />
                            <HUDToggleGroup
                              label="Monthly Earnings Scale"
                              options={FREELANCE_SCALES}
                              value={profile.freelanceScale}
                              onChange={v => updateProfile({ freelanceScale: v })}
                            />
                            <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                              <div className="p-4 bg-black/40 border border-white/5">
                                <div className="text-[8px] mb-2 text-slate-600">Client Base</div>
                                <HUDToggleGroup
                                  label=""
                                  options={["1–3 clients", "4–10 clients", "10+ clients"]}
                                  value={(profile as any).clientBase}
                                  onChange={v => updateProfile({ ...(profile as any), clientBase: v })}
                                />
                              </div>
                              <div className="p-4 bg-black/40 border border-white/5">
                                <div className="text-[8px] mb-2 text-slate-600">Work Mode</div>
                                <HUDToggleGroup
                                  label=""
                                  options={["Remote", "On-site", "Hybrid"]}
                                  value={(profile as any).workMode}
                                  onChange={v => updateProfile({ ...(profile as any), workMode: v })}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── Contextual: Self-employed (not specifically founder/freelancer) ── */}
                    <AnimatePresence>
                      {isSelfEmployed && !isFounder && !isFreelancer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-6 border-l-2 border-emerald-500/30 pl-6">
                            <div className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest">
                              // SELF_EMPLOYED_PROFILE — Additional Parameters
                            </div>
                            <HUDSelect
                              label="Business / Practice Type"
                              options={BUSINESS_TYPES}
                              value={profile.businessType}
                              onChange={v => updateProfile({ businessType: v })}
                            />
                            <HUDSelect
                              label="Business Scale"
                              options={STARTUP_STAGES}
                              value={profile.startupStage}
                              onChange={v => updateProfile({ startupStage: v })}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* ── STEP 3: Financial Status ── */}
                {step === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                    <HUDInput
                      label="Liquid Balance (Bank)"
                      type="number"
                      value={profile.bankBalance}
                      onChange={v => updateProfile({ bankBalance: Number(v) })}
                      placeholder="Total liquid savings"
                    />
                    <HUDInput
                      label="Monthly Retention (Savings)"
                      required
                      type="number"
                      value={profile.monthlySavings}
                      onChange={v => updateProfile({ monthlySavings: Number(v) })}
                      placeholder="How much you save/mo"
                    />
                    <HUDInput
                      label="Volatile Assets (Equity/Crypto)"
                      type="number"
                      value={profile.mutualFunds}
                      onChange={v => updateProfile({ mutualFunds: Number(v) })}
                      placeholder="MF, stocks, crypto"
                    />
                    <HUDInput
                      label="Stable Reserves (FD/Gold)"
                      type="number"
                      value={profile.fixedDeposits}
                      onChange={v => updateProfile({ fixedDeposits: Number(v) })}
                      placeholder="FD, PPF, gold"
                    />
                    <HUDInput
                      label="Net Inflow Monthly (Take-home)"
                      required
                      type="number"
                      value={profile.takeHomeIncome}
                      onChange={v => updateProfile({ takeHomeIncome: Number(v) })}
                      placeholder="Post-tax monthly income"
                    />
                    <HUDInput
                      label="Burn Rate Monthly (Expenses)"
                      required
                      type="number"
                      value={profile.monthlyExpenses}
                      onChange={v => updateProfile({ monthlyExpenses: Number(v) })}
                      placeholder="Total monthly spend"
                    />

                    {/* Founder-specific: Revenue in financials */}
                    {isFounder && (
                      <div className="sm:col-span-2 pt-2 border-t border-white/5">
                        <div className="text-[9px] font-mono text-amber-500 uppercase tracking-widest mb-4">
                          // BUSINESS_FINANCIALS
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <HUDInput
                            label="Monthly Business Revenue"
                            type="number"
                            value={profile.monthlyRevenue}
                            onChange={v => updateProfile({ monthlyRevenue: Number(v) })}
                            placeholder="Gross monthly revenue"
                          />
                          <HUDInput
                            label="Business Runway (Months)"
                            type="number"
                            value={profile.financialRunway}
                            onChange={v => updateProfile({ financialRunway: Number(v) })}
                            placeholder="Months of cash left"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 4: Assets & Liabilities ── */}
                {step === 4 && (
                  <>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">
                        Asset Inventory
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ASSETS.map(asset => (
                          <HUDToggle
                            key={asset}
                            active={profile.assets?.includes(asset)}
                            onClick={() => toggleArrayItem("assets", asset)}
                            label={asset}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">
                        Debt Vectors
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {LOANS.map(loan => (
                          <HUDToggle
                            key={loan}
                            active={profile.loans?.includes(loan)}
                            onClick={() => toggleArrayItem("loans", loan)}
                            label={loan}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <HUDInput
                        label="Monthly EMI Payoff"
                        type="number"
                        value={profile.monthlyEmi}
                        onChange={v => updateProfile({ monthlyEmi: Number(v) })}
                        placeholder="Total EMI/mo"
                      />
                      <HUDInput
                        label="Total Outstanding Debt"
                        type="number"
                        value={profile.outstandingDebt}
                        onChange={v => updateProfile({ outstandingDebt: Number(v) })}
                        placeholder="Total principal"
                      />
                    </div>
                  </>
                )}

                {/* ── STEP 5: Dreams & Goals ── */}
                {step === 5 && (
                  <>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">
                        Objective Matrix
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {GOALS.map(goal => (
                          <HUDToggle
                            key={goal.id}
                            active={profile.goals?.includes(goal.id)}
                            onClick={() => toggleArrayItem("goals", goal.id)}
                            label={`${goal.emoji} ${goal.label}`}
                          />
                        ))}
                      </div>
                    </div>
                    {profile.goals && profile.goals.length > 0 && (
                      <HUDSelect
                        label="Priority Alpha (Top Goal)"
                        options={GOALS.filter(g => profile.goals?.includes(g.id)).map(g => g.label)}
                        value={profile.primaryGoal}
                        onChange={v => updateProfile({ primaryGoal: v })}
                      />
                    )}

                    {/* Founder-specific goals */}
                    {isFounder && (
                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <div className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">
                          // FOUNDER_MILESTONES
                        </div>
                        <HUDToggleGroup
                          label="Startup Exit Goal"
                          options={["Profitable & Hold", "Strategic Acquisition", "VC Funding / Scale", "IPO (Long-term)", "No exit plan yet"]}
                          value={(profile as any).exitGoal}
                          onChange={v => updateProfile({ ...(profile as any), exitGoal: v })}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* ── STEP 6: Risk DNA ── */}
                {step === 6 && (
                  <>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end border-b border-white/5 pb-2">
                        <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">
                          Risk Calibration <span className="text-rose-500">*</span>
                        </label>
                        <span className={cn(
                          "text-xs font-mono font-bold uppercase tracking-widest pb-1",
                          profile.riskLevel === "Aggressive" ? "text-rose-500" :
                            profile.riskLevel === "Moderate" ? "text-amber-500" : "text-emerald-500"
                        )}>
                          {profile.riskLevel || "— Select —"}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        {RISK_LEVELS.map(level => (
                          <button
                            key={level}
                            onClick={() => updateProfile({ riskLevel: level })}
                            className={cn(
                              "flex-1 py-4 text-[10px] font-mono font-bold uppercase border-geom transition-all duration-500",
                              profile.riskLevel === level
                                ? "bg-emerald-500 text-black border-emerald-400"
                                : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
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
                            {profile.riskLevel === "Conservative"
                              ? "PRIORITY: CAPITAL SHIELDING. FOCUS ON SYSTEMIC STABILITY AND INFLATION RESISTANCE."
                              : profile.riskLevel === "Aggressive"
                                ? "PRIORITY: ACCELERATED ACCUMULATION. EXPLOITING VOLATILITY FOR MAXIMAL DELTA."
                                : "PRIORITY: EQUILIBRIUM. BALANCED VECTOR ALLOCATION ACROSS STABLE AND VOLATILE ASSETS."}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <HUDInput
                        label="Monthly Loss Threshold"
                        type="number"
                        value={profile.riskTolerance}
                        onChange={v => updateProfile({ riskTolerance: Number(v) })}
                        placeholder="Max monthly loss cap"
                      />
                      <HUDInput
                        label="Entropy Runway (Months)"
                        type="number"
                        value={profile.financialRunway}
                        onChange={v => updateProfile({ financialRunway: Number(v) })}
                        placeholder="Survival buffer months"
                      />
                    </div>
                  </>
                )}

                {/* ── STEP 7: Constraints ── */}
                {step === 7 && (
                  <>
                    <div className="grid grid-cols-2 gap-8">
                      <HUDInput
                        label="Dependents"
                        type="number"
                        value={profile.dependents}
                        onChange={v => updateProfile({ dependents: Number(v) })}
                        placeholder="0"
                        min={0}
                      />
                      <HUDSelect
                        label="Geographic Elasticity"
                        options={LOCATIONS}
                        value={profile.locationFlexibility}
                        onChange={v => updateProfile({ locationFlexibility: v })}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">
                        Hard Constraints
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {COMMITMENTS.map(c => (
                          <HUDToggle
                            key={c}
                            active={profile.commitments?.includes(c)}
                            onClick={() => toggleArrayItem("commitments", c)}
                            label={c}
                          />
                        ))}
                      </div>
                    </div>
                    <HUDSelect
                      label="Vector Urgency"
                      options={URGENCY_LEVELS}
                      value={profile.timelineUrgency}
                      onChange={v => updateProfile({ timelineUrgency: v })}
                    />
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">
                        Entropy Parameters (Additional Notes)
                      </label>
                      <textarea
                        className="w-full bg-[#0A0A0B] border-geom border-white/10 focus:border-emerald-500/50 p-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/10 transition-all font-mono leading-relaxed"
                        rows={5}
                        placeholder="ADDITIONAL SYSTEM PARAMETERS OR CONSTRAINTS..."
                        value={profile.extraContext || ""}
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

// ── HUD Components ───────────────────────────────────────────────────────────

function HUDInput({ label, value, onChange, placeholder, type = "text", required, min, max }: {
  label: string;
  value?: any;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-3 group">
      <label className="text-[9px] uppercase font-mono text-slate-500 tracking-[0.2em] block group-focus-within:text-emerald-500 transition-colors">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full bg-[#0A0A0B] border-geom border-white/10 focus:border-emerald-500/50 p-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/10 transition-all font-mono"
      />
    </div>
  );
}

function HUDSelect({ label, options, value, onChange, required }: {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-3 group">
      <label className="text-[9px] uppercase font-mono text-slate-500 tracking-[0.2em] block group-focus-within:text-emerald-500 transition-colors">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
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

function HUDToggleGroup({ label, options, value, onChange, required }: {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-4">
      {label && (
        <label className="text-[9px] uppercase font-mono text-slate-500 tracking-[0.2em] block">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-5 py-3 text-[9px] font-mono font-bold uppercase border-geom transition-all duration-500",
              value === opt
                ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_5px_20px_rgba(16,185,129,0.15)]"
                : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function HUDToggle({ active, onClick, label }: {
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
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

function HUDSlider({ min, max, step, value, onChange }: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="relative py-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}

// Helper — builds a natural-language summary of contextual fields to append to extraContext
function buildContextualSummary(profile: ExtendedProfile): string {
  const parts: string[] = [];

  if (profile.businessType) parts.push(`Business type: ${profile.businessType}`);
  if (profile.startupStage) parts.push(`Business stage: ${profile.startupStage}`);
  if (profile.teamSize) parts.push(`Team size: ${profile.teamSize}`);
  if (profile.monthlyRevenue) parts.push(`Monthly business revenue: ₹${profile.monthlyRevenue.toLocaleString()}`);
  if (profile.freelanceDomain) parts.push(`Freelance domain: ${profile.freelanceDomain}`);
  if (profile.freelanceScale) parts.push(`Freelance earnings scale: ${profile.freelanceScale}`);
  if ((profile as any).exitGoal) parts.push(`Startup exit goal: ${(profile as any).exitGoal}`);
  if ((profile as any).clientBase) parts.push(`Freelance client base: ${(profile as any).clientBase}`);
  if ((profile as any).workMode) parts.push(`Work mode: ${(profile as any).workMode}`);

  return parts.length > 0 ? `[Contextual Profile]\n${parts.join("\n")}` : "";
}