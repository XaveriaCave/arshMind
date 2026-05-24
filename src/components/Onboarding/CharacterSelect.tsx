import { motion } from "motion/react";
import { ARCHETYPES } from "../../constants";
import { useState } from "react";
import { cn } from "../../lib/utils";

export default function CharacterSelect({ onSelect }: { onSelect: (arch: typeof ARCHETYPES[0]) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeArch = ARCHETYPES.find(a => a.id === selectedId);

  return (
    <div className="min-h-screen bg-black flex flex-col p-6 sm:p-12 relative overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full flex flex-col">
        <header className="mb-12 border-l-2 border-emerald-500 pl-6">
          <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Access profile</h2>
          <p className="text-slate-400 font-mono text-sm leading-relaxed max-w-lg">
            Pick your archetype. Each class comes with pre-calibrated risk parameters and historical vectors.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ARCHETYPES.map((arch) => (
            <motion.div
              key={arch.id}
              onClick={() => setSelectedId(arch.id)}
              whileHover={{ y: -4 }}
              className={cn(
                "cursor-pointer group relative bg-[#0F1115] border-geom transition-all duration-300",
                selectedId === arch.id ? "ring-1 ring-emerald-500 bg-emerald-500/5" : "border-white/5 hover:border-white/10"
              )}
            >
              {/* Card Accent Line */}
              <div className={cn(
                "absolute top-0 right-0 h-16 w-16 opacity-10 transition-all duration-300",
                selectedId === arch.id ? "bg-emerald-500" : "bg-white/5"
              )} style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />

              <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center text-3xl rounded-lg bg-black/40 border border-white/5",
                    selectedId === arch.id ? "border-emerald-500/30" : ""
                  )}>
                    {arch.emoji}
                  </div>
                  <span className="font-mono text-[9px] text-slate-500 border border-white/10 px-2 py-0.5 uppercase tracking-widest">
                    {arch.class}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{arch.name}</h3>
                <p className="text-emerald-500/70 text-[10px] font-mono mb-6 tracking-widest">₹{arch.salaryRange[0]}L - ₹{arch.salaryRange[1]}L LPA</p>

                <div className="space-y-4 mb-8">
                  {Object.entries(arch.stats).map(([label, val]) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between text-[9px] uppercase font-mono text-slate-500">
                        <span>{label}</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-1 bg-black/40 w-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="text-[9px] text-emerald-500/60 uppercase font-mono mb-2 tracking-widest">Core Ability</div>
                  <p className="text-xs text-slate-400 italic font-medium leading-relaxed">"{arch.ability}"</p>
                </div>
              </div>

              {selectedId === arch.id && (
                <div className="absolute -bottom-1 -right-1">
                  <div className="w-6 h-6 bg-emerald-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-auto flex justify-center pb-20">
          <button
            disabled={!selectedId}
            onClick={() => activeArch && onSelect(activeArch)}
            className={cn(
              "px-16 py-5 font-bold uppercase tracking-[0.3em] transition-all duration-500 relative group overflow-hidden border-geom",
              selectedId 
                ? "bg-emerald-500 text-black shadow-[0_10px_40px_rgba(16,185,129,0.25)] border-emerald-400" 
                : "bg-white/5 text-slate-600 cursor-not-allowed border-white/5"
            )}
          >
            <span className="relative z-10 text-xs">Initialize Engine</span>
            {selectedId && (
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
