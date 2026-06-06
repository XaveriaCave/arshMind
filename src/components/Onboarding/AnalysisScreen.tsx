import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, CheckCircle2, ArrowRight } from "lucide-react";

const ROTATING_MESSAGES = [
  "Analyzing your career vectors...",
  "Hold tight, building your scenarios...",
  "Just a few more seconds...",
  "Crunching your financial data...",
  "This is taking a little longer than usual...",
  "Server is experiencing high demand — almost there...",
  "Mapping your 10-year trajectory...",
  "Wait a few seconds, running final calibrations...",
  "Simulating market volatility for your profile...",
  "Almost done — generating risk matrices...",
  "Your path is being computed — please wait...",
  "AI is working hard on your scenarios...",
];

const TIMEOUT_MESSAGES = [
  "It looks like the server is busier than usual.",
  "We'll notify you via email, or you can check back / log in later for the updated results.",
];

const DATA_POINTS = [
  { label: "CAREER VECTORS", duration: 1200 },
  { label: "FINANCIAL RUNWAY", duration: 800 },
  { label: "GOAL ALIGNMENT", duration: 1500 },
  { label: "RISK CALIBRATION", duration: 1000 },
  { label: "SCENARIO MAPPING", duration: 2000 },
];

interface AnalysisScreenProps {
  existingScenarios?: any[];
}

export default function AnalysisScreen({ existingScenarios }: AnalysisScreenProps) {
  const [activeBar, setActiveBar] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Rotate messages every 2s
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, 2000);

    // Animate progress bars
    let currentBar = 0;
    const processNext = () => {
      if (currentBar < DATA_POINTS.length) {
        setTimeout(() => {
          setActiveBar(currentBar + 1);
          currentBar++;
          processNext();
        }, DATA_POINTS[currentBar].duration);
      }
    };
    processNext();

    // 60-second timeout
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, 60000);

    return () => {
      clearInterval(msgInterval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    // In production this would POST to an API
    console.log("Feedback submitted:", feedbackText);
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackSent(false);
      setFeedbackText("");
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-6 overflow-hidden">
      {/* Background rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        {[200, 400, 600].map((size, i) => (
          <motion.div
            key={i}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
            className="absolute border border-emerald-500 rounded-full"
            style={{ width: size, height: size, borderStyle: i % 2 === 0 ? "solid" : "dashed" }}
          />
        ))}
      </div>

      {/* Feedback Button — always visible */}
      <button
        onClick={() => setShowFeedback(true)}
        className="fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 font-mono text-[9px] uppercase tracking-widest transition-all"
      >
        <MessageSquare size={11} />
        Feedback / Help
      </button>

      <AnimatePresence mode="wait">
        {timedOut ? (
          /* ── Timeout Fallback Screen ── */
          <motion.div
            key="timeout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-lg flex flex-col items-center text-center gap-8"
          >
            <div className="w-16 h-16 border-2 border-amber-500/40 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-widest font-mono mb-3">
                Server Busy
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed font-mono max-w-md">
                {TIMEOUT_MESSAGES[0]}
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed font-mono max-w-md">
                {TIMEOUT_MESSAGES[1]}
              </p>
            </div>

            {/* Show existing scenarios or feature highlights */}
            {existingScenarios && existingScenarios.length > 0 ? (
              <div className="w-full space-y-3">
                <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest">
                  // Previous scenarios available
                </p>
                {existingScenarios.slice(0, 3).map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 text-left"
                  >
                    <div>
                      <div className="text-xs font-bold text-white uppercase font-mono">{s.title}</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">{s.subtitle}</div>
                    </div>
                    <span
                      className={`text-[8px] font-mono px-2 py-0.5 border ${s.risk === "High"
                        ? "text-rose-500 border-rose-500/20 bg-rose-500/5"
                        : s.risk === "Medium"
                          ? "text-amber-500 border-amber-500/20 bg-amber-500/5"
                          : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                        }`}
                    >
                      {s.risk}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* Feature highlights fallback */
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {[
                  { icon: "🗺️", label: "Multi-Timeline Roadmaps", desc: "3, 5 & 10-year career paths" },
                  { icon: "🔀", label: "Scenario Simulation", desc: "6 AI-modeled life trajectories" },
                  { icon: "📊", label: "Financial Projections", desc: "Net worth compound modeling" },
                  { icon: "📋", label: "Tactical Step Plans", desc: "Month-by-month action vectors" },
                ].map((f) => (
                  <div key={f.label} className="p-4 bg-white/5 border border-white/5">
                    <div className="text-lg mb-2">{f.icon}</div>
                    <div className="text-[10px] font-bold text-white uppercase font-mono">{f.label}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-1">{f.desc}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => setShowFeedback(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400 font-mono text-[9px] uppercase tracking-widest transition-all"
              >
                <MessageSquare size={11} />
                Contact Support
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[9px] uppercase tracking-widest transition-all"
              >
                <ArrowRight size={11} />
                Retry
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── Normal Loading Screen ── */
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-sm relative z-10 flex flex-col items-center"
          >
            <div className="mb-12 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">Analyzing</h2>
              <div className="h-0.5 w-12 bg-emerald-500/30" />
            </div>

            <div className="w-full space-y-6 mb-10">
              {DATA_POINTS.map((point, i) => (
                <div key={point.label} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <span>{point.label}</span>
                    <span
                      className={
                        activeBar > i
                          ? "text-emerald-500"
                          : activeBar === i
                            ? "text-emerald-400/70"
                            : ""
                      }
                    >
                      {activeBar > i ? "COMPLETE" : activeBar === i ? "PROCESSING..." : "PENDING"}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 w-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: activeBar > i ? "100%" : activeBar === i ? "60%" : "0%",
                      }}
                      transition={{ duration: point.duration / 1000 }}
                      className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Rotating message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="text-emerald-500/60 font-mono text-xs tracking-widest uppercase text-center min-h-[20px]"
              >
                {ROTATING_MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Feedback Modal ── */}
      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F1115] border border-white/10 w-full max-w-md p-8 relative"
            >
              <button
                onClick={() => setShowFeedback(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white border border-white/5 hover:border-white/10 transition-colors"
              >
                <X size={14} />
              </button>

              <div className="mb-6">
                <div className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest mb-2">
                  // FEEDBACK_PORTAL
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight font-mono">
                  Feedback / Report / Help
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-2 leading-relaxed uppercase tracking-wider">
                  Let us know what went wrong, what you need, or how we can help.
                </p>
              </div>

              {feedbackSent ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 py-8 text-center"
                >
                  <CheckCircle2 size={32} className="text-emerald-500" />
                  <div className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Feedback Received
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                    // TRANSMISSION_CONFIRMED
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                      // ISSUE_TYPE
                    </label>
                    <select className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white focus:outline-none transition-all appearance-none uppercase">
                      <option value="bug">Bug / Error Report</option>
                      <option value="slow">Slow / Timeout Issue</option>
                      <option value="feature">Feature Request</option>
                      <option value="help">Need Help</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                      // MESSAGE
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                      required
                      placeholder="DESCRIBE YOUR ISSUE OR FEEDBACK..."
                      className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[9px] uppercase tracking-widest transition-all"
                  >
                    <Send size={11} />
                    Submit Feedback
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}