import { useState } from "react";
import { motion } from "motion/react";
import { Shield, Zap, Flame, CreditCard, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { UserProfile } from "../../types";

export default function ProUpgrade({
  profile,
  onUpdateProfile
}: {
  profile: UserProfile;
  onUpdateProfile: (fields: Partial<UserProfile>) => Promise<void>;
}) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardName: profile.name || "",
    cardNum: "4242 •••• •••• 4242",
    promoCode: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpgrading(true);
    setErrorMsg("");

    try {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the user profile on firestore
      await onUpdateProfile({ isPro: true });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(`// CHK_FAILURE: ${err.message || "Failed to establish payment gate connection."}`);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-12">
      <header className="border-l-2 border-amber-500 pl-8 pb-4">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">Upgrade Matrix</h2>
        <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">Recalibrate your limitations // Unlock Pro Trajectory Vectors</p>
      </header>

      {isSuccess || profile.isPro ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 border-geom border-amber-500/40 bg-amber-500/5 relative overflow-hidden"
        >
          {/* Neon background decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 opacity-5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
          
          <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-4 text-amber-500">
              <Sparkles className="w-10 h-10 animate-bounce" />
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tight font-mono">Premium Vector Activated</h3>
                <p className="text-slate-400 font-mono text-[9px] uppercase tracking-widest mt-0.5">// SECURITY_TOKEN_UPDATED: ACCESS_LEVEL_PROPAGATED_TO_PRO</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-sm">
              Your ArshMind nodes have been updated. You are now running on our calibrated **Gemini-Pro High Performance Core**. 
              You can now navigate back to the <strong className="text-white">Scenario Engine</strong> tab and choose any path selection to recalibrate it dynamically by feeding custom constraints, limitation parameters, or local problem coordinates.
            </p>

            <div className="pt-4 border-t border-white/5 space-y-3 font-mono text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={14} className="text-amber-500" />
                <span>INTR_CALIBRATOR: ONLINE (Unlimited prompts)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={14} className="text-amber-500" />
                <span>REAL_TIME_TRACKING: CALIBRATED</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={14} className="text-amber-500" />
                <span>HYPER_NOTIFIER_ALERTS: SIMULATED</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left panel: Value Proposition */}
          <div className="lg:col-span-7 space-y-8">
            <div className="p-8 bg-[#0F1115] border-geom border-white/5 space-y-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">// UNLOCKED PRO OPERATIVE CAPABILITIES</h3>
              
              <div className="space-y-6">
                <FeatureCard 
                  icon={<Zap className="text-amber-500" />}
                  title="Dynamic AI Path Re-calibrator"
                  description="Identify personal bottlenecks (e.g. 'I cannot relocate right now', 'Switch to Product roles', 'Shorten year 3 timelines') and have the AI immediately optimize that specific scenario without restarting from scratch."
                />
                <FeatureCard 
                  icon={<Flame className="text-amber-500" />}
                  title="Real-time Custom Tracking Analytics"
                  description="Trace real-time performance of saving rates and milestone checkpoints over simulated financial tracks, alerting you when you drift from your target vector."
                />
                <FeatureCard 
                  icon={<Shield className="text-amber-500" />}
                  title="Hyper-configured Reminders"
                  description="Deploy smart reminder coordinates directly to in-app alerts and simulated emails, synchronizing your life-action list directly to your day."
                />
              </div>
            </div>

            {/* Price announcement / beta transparency */}
            <div className="p-6 border-geom border-amber-500/20 bg-amber-500/[0.02] flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs leading-relaxed text-slate-400">
                <span className="font-bold text-white uppercase block font-mono">MVP BETA STAGE NOTE</span>
                <span>
                  We are testing feature engagement and product-market calibration before introducing final production charges. Because you are one of our elite beta users, you can bypass the premium lock **free of charge** using our simulated sandbox checkout engine. There are no actual recurring fees.
                </span>
              </div>
            </div>
          </div>

          {/* Right panel: High Fidelity Simulated Payment Card Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleSimulatedPayment} className="p-8 bg-black border-geom border-white/10 relative overflow-hidden space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-slate-500">
                  <CreditCard size={12} className="text-amber-500" />
                  <span>Interactive Gateway</span>
                </div>
                <div className="px-2 py-0.5 border border-amber-500/30 text-amber-500 font-mono text-[8px] uppercase tracking-widest bg-amber-500/5">
                  Beta Sandbox
                </div>
              </div>

              {/* Glowing card graphic */}
              <div className="w-full h-44 bg-gradient-to-br from-amber-500/20 via-[#0F1115] to-black border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
                <div className="flex justify-between items-start">
                  <div className="text-xs uppercase font-mono font-bold text-white tracking-[0.2em]">ArshMind // PRO</div>
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                </div>
                
                <div className="font-mono text-sm tracking-[0.25em] text-slate-400 py-3">{formData.cardNum}</div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[7px] uppercase font-mono text-slate-600 tracking-wider">Operative Identity</div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-[#EAB308] mt-0.5 max-w-[150px] truncate">{formData.cardName || "IDENTITY_NOT_DEFINED"}</div>
                  </div>
                  <div>
                    <div className="text-[7px] uppercase font-mono text-slate-600 tracking-wider">Auth Valid</div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-0.5">PERPETUAL</div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/5 border border-red-500/20 text-[9px] font-mono text-rose-500 uppercase tracking-widest leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">// CHK_OUT CARDHOLDER NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.cardName}
                    placeholder="ENTER OPERATIVE NAME"
                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                    className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-amber-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">// DODO PROMO_CODE (OPTIONAL)</label>
                  <input
                    type="text"
                    value={formData.promoCode}
                    placeholder="ENTER_BETA_Voucher"
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                    className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-amber-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all uppercase"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-3">
                  <span>Operative Subscription Fee</span>
                  <span className="text-white line-through">₹499/Mo</span>
                </div>
                <div className="flex justify-between text-xs uppercase font-mono tracking-widest font-bold text-white mb-6">
                  <span>BETA EXPLORER TOTAL</span>
                  <span className="text-amber-500">₹0.00 / FREE</span>
                </div>

                <button
                  type="submit"
                  disabled={isUpgrading}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-white/5 disabled:text-slate-600 text-black font-mono font-bold text-[10px] uppercase tracking-[0.25em] transition-all shadow-[0_10px_35px_rgba(245,158,11,0.15)] hover:shadow-[0_10px_35px_rgba(245,158,11,0.25)]"
                >
                  {isUpgrading ? "[ SECURING PIPELINE PROTOCOLS... ]" : "[ ACTIVATE FREE PRO MEMBERSHIP ]"}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 bg-black border border-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-tight leading-none mb-1.5">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}
