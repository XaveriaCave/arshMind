import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Zap, Flame, Sparkles, CheckCircle2, AlertCircle, X, Send, MessageSquare } from "lucide-react";
import { UserProfile } from "../../types";

// ── Beta Pro Unavailable Modal ──────────────────────────────────────────────
function BetaProModal({ onClose }: { onClose: () => void }) {
  const [features, setFeatures] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!features.trim()) return;
    console.log("Pro feature suggestion:", features);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFeatures("");
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="bg-[#0F1115] border border-amber-500/30 w-full max-w-md p-8 relative shadow-[0_20px_60px_rgba(245,158,11,0.1)]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white border border-white/5 hover:border-white/10 transition-colors"
        >
          <X size={14} />
        </button>

        {/* Decorative corner */}
        <div
          className="absolute top-0 right-0 w-20 h-20 bg-amber-500 opacity-10 pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
        />

        <div className="mb-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-amber-500" />
          </div>
          <div>
            <div className="text-[8px] font-mono text-amber-500 uppercase tracking-widest mb-1">
              // PRO_STATUS: BETA_LOCKED
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight font-mono leading-snug">
              Pro Unavailable — Prime Beta
            </h3>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-mono leading-relaxed mb-6 border-l-2 border-amber-500/30 pl-4">
          Pro is currently in its prime Beta version and is not available for activation at this time.
          We are actively building and refining its capabilities based on user feedback.
        </p>

        {sent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <CheckCircle2 size={32} className="text-amber-500" />
            <div className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Thank You!
            </div>
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest leading-relaxed">
              Your suggestions help us build a better Pro. We'll notify you when it launches.
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                // WHAT FEATURES DO YOU EXPECT IN PRO?
              </label>
              <textarea
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                rows={4}
                required
                placeholder="e.g. AI trajectory re-calibration, export to PDF, email alerts for milestones, deeper financial modeling..."
                className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-amber-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none"
              />
              <p className="text-[8px] text-slate-600 font-mono uppercase tracking-widest mt-1.5">
                Your input helps us improve and provide better service.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-white/10 text-slate-500 hover:text-white hover:border-white/20 font-mono text-[9px] uppercase tracking-widest transition-all"
              >
                Maybe Later
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-[9px] uppercase tracking-widest transition-all"
              >
                <Send size={10} />
                Send Feedback
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── Feedback / Help Button (global, floated) ────────────────────────────────
export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    console.log("Feedback:", text);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setText("");
      setOpen(false);
    }, 2500);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#0F1115] border border-white/10 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 font-mono text-[9px] uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <MessageSquare size={12} />
        Feedback / Help
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-[#0F1115] border border-white/10 w-full max-w-md p-8 relative"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white border border-white/5 hover:border-white/10 transition-colors"
              >
                <X size={14} />
              </button>

              <div className="mb-6">
                <div className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest mb-1">
                  // FEEDBACK_PORTAL
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight font-mono">
                  Feedback / Report / Help
                </h3>
                <p className="text-[9px] text-slate-500 font-mono mt-1.5 uppercase tracking-wider leading-relaxed">
                  Report a bug, request a feature, or ask for help.
                </p>
              </div>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-8 text-center"
                >
                  <CheckCircle2 size={28} className="text-emerald-500" />
                  <div className="text-xs font-bold text-white uppercase font-mono">Feedback Received</div>
                  <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
                    // TRANSMISSION_CONFIRMED
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <select className="w-full bg-[#070708] border border-white/10 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white focus:outline-none transition-all appearance-none uppercase">
                    <option value="bug">Bug / Error Report</option>
                    <option value="slow">Slow / Timeout Issue</option>
                    <option value="feature">Feature Request</option>
                    <option value="help">Need Help</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    required
                    placeholder="DESCRIBE YOUR ISSUE OR FEEDBACK..."
                    className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[9px] uppercase tracking-widest transition-all"
                  >
                    <Send size={11} />
                    Submit
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main ProUpgrade Component ───────────────────────────────────────────────
export default function ProUpgrade({
  profile,
  onUpdateProfile,
}: {
  profile: UserProfile;
  onUpdateProfile: (fields: Partial<UserProfile>) => Promise<void>;
}) {
  const [showBetaModal, setShowBetaModal] = useState(false);

  return (
    <div className="space-y-12">
      <header className="border-l-2 border-amber-500 pl-8 pb-4">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">Upgrade Matrix</h2>
        <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">
          Recalibrate your limitations // Unlock Pro Trajectory Vectors
        </p>
      </header>

      {profile.isPro ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 border-geom border-amber-500/40 bg-amber-500/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 opacity-5" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
          <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-4 text-amber-500">
              <Sparkles className="w-10 h-10 animate-bounce" />
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tight font-mono">Premium Vector Activated</h3>
                <p className="text-slate-400 font-mono text-[9px] uppercase tracking-widest mt-0.5">
                  // SECURITY_TOKEN_UPDATED: ACCESS_LEVEL_PROPAGATED_TO_PRO
                </p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">
              Your ArshMind nodes have been updated. You are now running on our calibrated{" "}
              <strong>Gemini-Pro High Performance Core</strong>. Navigate to the{" "}
              <strong className="text-white">Scenario Engine</strong> tab to recalibrate any path dynamically.
            </p>
            <div className="pt-4 border-t border-white/5 space-y-3 font-mono text-xs text-slate-500">
              {["INTR_CALIBRATOR: ONLINE (Unlimited prompts)", "REAL_TIME_TRACKING: CALIBRATED", "HYPER_NOTIFIER_ALERTS: SIMULATED"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={14} className="text-amber-500" />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Value Proposition */}
          <div className="lg:col-span-7 space-y-8">
            <div className="p-8 bg-[#0F1115] border-geom border-white/5 space-y-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                // UNLOCKED PRO OPERATIVE CAPABILITIES
              </h3>
              <div className="space-y-6">
                <FeatureCard
                  icon={<Zap className="text-amber-500" />}
                  title="Dynamic AI Path Re-calibrator"
                  description="Provide specific constraints and have ArshMind immediately optimize your scenario without restarting from scratch."
                />
                <FeatureCard
                  icon={<Flame className="text-amber-500" />}
                  title="Real-time Custom Tracking Analytics"
                  description="Trace performance of saving rates and milestone checkpoints, alerting you when you drift from your target vector."
                />
                <FeatureCard
                  icon={<Shield className="text-amber-500" />}
                  title="Hyper-configured Reminders"
                  description="Deploy smart reminder coordinates directly to in-app alerts and simulated emails."
                />
              </div>
            </div>

            <div className="p-6 border-geom border-amber-500/20 bg-amber-500/[0.02] flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs leading-relaxed text-slate-400">
                <span className="font-bold text-white uppercase block font-mono">BETA STAGE NOTE</span>
                <span>
                  Pro is currently in its <strong className="text-amber-400">prime Beta</strong> — not yet available for
                  activation. Tell us what more features you would expect and we'll try to build them for you.
                </span>
              </div>
            </div>
          </div>

          {/* Right: CTA Card */}
          <div className="lg:col-span-5">
            <div className="p-8 bg-black border-geom border-amber-500/20 relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500 opacity-5" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />

              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-slate-500">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Pro Access</span>
                </div>
                <div className="px-2 py-0.5 border border-amber-500/30 text-amber-500 font-mono text-[8px] uppercase tracking-widest bg-amber-500/5">
                  Beta Locked
                </div>
              </div>

              {/* Feature list */}
              <div className="space-y-3">
                {[
                  "Unlimited AI trajectory re-calibrations",
                  "Custom constraint injection",
                  "Restore point history for paths",
                  "Export scenarios to PDF",
                  "Email milestone reminders",
                  "Priority support queue",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                    <div className="w-1.5 h-1.5 bg-amber-500/50 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex justify-between text-[10px] uppercase font-mono tracking-widest text-slate-500">
                  <span>Pro Subscription</span>
                  <span className="text-white line-through">$25/Mo</span>
                </div>
                <div className="flex justify-between text-xs uppercase font-mono tracking-widest font-bold text-white">
                  <span>Current Status</span>
                  <span className="text-amber-500">COMING SOON</span>
                </div>

                {/* This button triggers the beta modal instead of activating */}
                <button
                  onClick={() => setShowBetaModal(true)}
                  className="w-full py-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-mono font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={12} />
                  Notify Me / Give Feedback
                </button>

                <p className="text-[8px] font-mono text-slate-600 text-center uppercase tracking-wide">
                  Pro activation is temporarily disabled during Beta
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beta modal overlay */}
      <AnimatePresence>
        {showBetaModal && <BetaProModal onClose={() => setShowBetaModal(false)} />}
      </AnimatePresence>

      {/* Floating feedback button */}
      <FeedbackButton />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 bg-black border border-white/5 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-tight leading-none mb-1.5">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}