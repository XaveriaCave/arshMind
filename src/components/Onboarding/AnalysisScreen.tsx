import { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function AnalysisScreen() {
  const [activeBar, setActiveBar] = useState(0);
  const [statusText, setStatusText] = useState("ANALYZING CAREER VECTORS...");

  const dataPoints = [
    { label: "CAREER VECTORS", duration: 1200 },
    { label: "FINANCIAL RUNWAY", duration: 800 },
    { label: "GOAL ALIGNMENT", duration: 1500 },
    { label: "RISK CALIBRATION", duration: 1000 },
    { label: "SCENARIO MAPPING", duration: 2000 },
  ];

  const statuses = [
    "PARSING BIOMETRIC PROFILE...",
    "CALCULATING SALARY TRAJECTORIES...",
    "SIMULATING MARKET VOLATILITY...",
    "CRUNCHING COMPOUND INTEREST...",
    "MAPPING OPTIMAL PATHWAYS...",
    "FINALIZING SCENARIO MODELS..."
  ];

  useEffect(() => {
    let currentBar = 0;
    const processNext = () => {
      if (currentBar < dataPoints.length) {
        setTimeout(() => {
          setActiveBar(currentBar + 1);
          currentBar++;
          processNext();
        }, dataPoints[currentBar].duration);
      }
    };
    processNext();

    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      setStatusText(statuses[statusIndex % statuses.length]);
      statusIndex++;
    }, 1200);

    return () => clearInterval(statusInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-6 overflow-hidden">
      {/* Spinning Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        {[200, 400, 600].map((size, i) => (
          <motion.div
            key={i}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
            className="absolute border border-geom border-emerald-500 rounded-full"
            style={{ width: size, height: size, borderStyle: i % 2 === 0 ? 'solid' : 'dashed' }}
          />
        ))}
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        <div className="mb-12 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">Analyzing</h2>
          <div className="h-0.5 w-12 bg-emerald-500/30" />
        </div>

        <div className="w-full space-y-6">
          {dataPoints.map((point, i) => (
            <div key={point.label} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>{point.label}</span>
                <span className={activeBar > i ? "text-emerald-500" : activeBar === i ? "text-emerald-400/70" : ""}>
                  {activeBar > i ? "COMPLETE" : activeBar === i ? "PROCESSING..." : "PENDING"}
                </span>
              </div>
              <div className="h-1 bg-white/5 w-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: activeBar > i ? "100%" : activeBar === i ? "60%" : "0%" }}
                  transition={{ duration: point.duration / 1000 }}
                  className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-emerald-500/60 font-mono text-xs animate-pulse tracking-widest uppercase">{statusText}</p>
      </div>
    </div>
  );
}
