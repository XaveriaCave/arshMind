import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Zap,
  Infinity,
  CreditCard,
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Shield,
} from "lucide-react";

const API_BASE = "https://corbin-pterodactylous-quinton.ngrok-free.dev";

type Plan = "monthly" | "one_time";

interface CheckoutModalProps {
  uid: string;
  email: string;
  onClose: () => void;
}

interface PlanCard {
  id: Plan;
  label: string;
  tagline: string;
  price: string;
  period: string;
  badge?: string;
  icon: React.ReactNode;
  features: string[];
  accentColor: string;
  borderClass: string;
  badgeClass: string;
  buttonClass: string;
}

const PLANS: PlanCard[] = [
  {
    id: "monthly",
    label: "Pro Monthly",
    tagline: "Activate the full arsenal. Cancel anytime.",
    price: "$9",
    period: "/ month",
    icon: <Zap size={20} />,
    features: [
      "Unlimited AI trajectory re-calibrations",
      "Custom constraint injection",
      "Restore point history",
      "Priority support queue",
      "Email milestone reminders",
    ],
    accentColor: "text-emerald-400",
    borderClass: "border-emerald-500/30 hover:border-emerald-500/60",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    buttonClass:
      "bg-emerald-500 hover:bg-emerald-400 text-black",
  },
  {
    id: "one_time",
    label: "Pro Lifetime",
    tagline: "Pay once. Own it forever.",
    price: "$49",
    period: "one-time",
    badge: "BEST VALUE",
    icon: <Infinity size={20} />,
    features: [
      "Everything in Pro Monthly",
      "Lifetime access — no recurring fees",
      "All future Pro feature unlocks",
      "Export scenarios to PDF",
      "Highest priority support",
    ],
    accentColor: "text-amber-400",
    borderClass: "border-amber-500/40 hover:border-amber-500/70",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    buttonClass:
      "bg-amber-500 hover:bg-amber-400 text-black",
  },
];

// ── Inner: Plan Selection View ────────────────────────────────────────────────
function PlanSelector({
  onSelect,
  loading,
  error,
}: {
  onSelect: (plan: Plan) => void;
  loading: Plan | null;
  error: string | null;
}) {
  const [hovered, setHovered] = useState<Plan | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[8px] font-mono text-amber-500 uppercase tracking-widest mb-1">
          // SELECT_ACTIVATION_VECTOR
        </div>
        <h3 className="text-xl font-bold text-white uppercase tracking-tight font-mono leading-snug">
          Activate Pro
        </h3>
        <p className="text-[10px] font-mono text-slate-500 mt-1.5 uppercase tracking-wider">
          Choose your trajectory protocol
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            onHoverStart={() => setHovered(plan.id)}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -2 }}
            className={`relative border bg-black p-5 cursor-pointer transition-all duration-200 ${plan.borderClass} ${hovered === plan.id ? "shadow-lg" : ""
              }`}
            onClick={() => !loading && onSelect(plan.id)}
          >
            {/* Corner decoration */}
            <div
              className="absolute top-0 right-0 w-12 h-12 opacity-10 pointer-events-none"
              style={{
                background: plan.id === "monthly" ? "#10b981" : "#f59e0b",
                clipPath: "polygon(100% 0, 100% 100%, 0 0)",
              }}
            />

            {/* Badge */}
            {plan.badge && (
              <div
                className={`absolute -top-2.5 left-4 px-2 py-0.5 border text-[8px] font-mono font-bold uppercase tracking-widest ${plan.badgeClass}`}
              >
                {plan.badge}
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-9 h-9 border flex items-center justify-center shrink-0 ${plan.badgeClass}`}
              >
                <span className={plan.accentColor}>{plan.icon}</span>
              </div>
              <div>
                <div className={`text-xs font-bold font-mono uppercase tracking-wide ${plan.accentColor}`}>
                  {plan.label}
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  {plan.tagline}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-1 mb-4 pb-4 border-b border-white/5">
              <span className={`text-3xl font-bold font-mono ${plan.accentColor}`}>
                {plan.price}
              </span>
              <span className="text-slate-500 font-mono text-[10px] mb-1">
                {plan.period}
              </span>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-5">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-[10px] font-mono text-slate-400">
                  <CheckCircle2 size={11} className={`${plan.accentColor} mt-0.5 shrink-0`} />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              disabled={!!loading}
              className={`w-full py-3 font-mono font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${plan.buttonClass} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {loading === plan.id ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Preparing Checkout…
                </>
              ) : (
                <>
                  <CreditCard size={12} />
                  Activate {plan.id === "monthly" ? "Monthly" : "Lifetime"}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 border border-red-500/30 bg-red-500/5"
          >
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <div className="text-[10px] font-mono text-red-400 leading-relaxed">
              <span className="font-bold uppercase block mb-1">CHECKOUT_ERROR</span>
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-white/5">
        {[
          { icon: <Shield size={11} />, label: "Secured by Dodo Payments" },
          { icon: <CreditCard size={11} />, label: "Cards, UPI, Wallets" },
        ].map((badge) => (
          <div key={badge.label} className="flex items-center gap-1.5 text-[9px] font-mono text-slate-600 uppercase tracking-wider">
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inner: Iframe Checkout View ───────────────────────────────────────────────
function IframeCheckout({
  checkoutUrl,
  onClose,
}: {
  checkoutUrl: string;
  onClose: () => void;
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest mb-0.5">
            // SECURE_CHECKOUT_TUNNEL
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-tight font-mono">
            Complete Your Payment
          </h3>
        </div>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 hover:text-slate-300 border border-white/10 hover:border-white/20 px-3 py-1.5 transition-colors"
        >
          <ExternalLink size={10} />
          Open in Tab
        </a>
      </div>

      {/* Iframe wrapper */}
      <div className="relative w-full" style={{ height: "520px" }}>
        {!iframeLoaded && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-10">
            <Loader2 size={24} className="text-emerald-500 animate-spin" />
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              Initializing secure tunnel…
            </div>
          </div>
        )}
        <iframe
          src={checkoutUrl}
          onLoad={() => setIframeLoaded(true)}
          className="w-full h-full border border-white/10"
          title="Dodo Payments Checkout"
          allow="payment"
        />
      </div>

      <div className="text-[8px] font-mono text-slate-600 text-center uppercase tracking-wider">
        Payments securely processed by Dodo Payments. ArshMind never stores your card data.
      </div>
    </div>
  );
}

// ── Main CheckoutModal ────────────────────────────────────────────────────────
export default function CheckoutModal({ uid, email, onClose }: CheckoutModalProps) {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Listen for payment outcome messages from the payment-redirect.html page inside the iframe
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      const { type } = event.data as { type: string };
      if (type === "DODO_PAYMENT_FAILURE") {
        // Close the iframe and show an error on the plan selection screen
        setCheckoutUrl(null);
        setError("Payment was unsuccessful. Please try a different payment method or try again.");
      }
      // DODO_PAYMENT_SUCCESS is handled at the App level — just close this modal
      if (type === "DODO_PAYMENT_SUCCESS") {
        onClose();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onClose]);

  // Respond to payment-redirect.html asking for the stored session_id
  useEffect(() => {
    const onSessionRequest = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "DODO_REQUEST_SESSION_ID") {
        const storedId = sessionStorage.getItem("dodo_session_id") || "";
        try {
          (event.source as Window)?.postMessage({ type: "DODO_SESSION_ID", sessionId: storedId }, "*");
        } catch { /* cross-origin guard */ }
      }
    };
    window.addEventListener("message", onSessionRequest);
    return () => window.removeEventListener("message", onSessionRequest);
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, email, plan }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `Server error (${res.status})`);
      }

      if (!data.checkoutUrl) {
        throw new Error("No checkout URL returned. Please try again.");
      }

      // Store sessionId so payment-redirect.html can verify the real payment status
      if (data.sessionId) {
        sessionStorage.setItem("dodo_session_id", data.sessionId);
      }

      setCheckoutUrl(data.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className={`bg-[#0A0A0C] border border-white/[0.08] relative overflow-hidden ${checkoutUrl ? "w-full max-w-2xl" : "w-full max-w-2xl"
          }`}
      >
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 bg-amber-500 animate-pulse" />
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              ARSHMIND // UPGRADE_MATRIX
            </span>
          </div>
          <button
            onClick={() => {
              if (checkoutUrl) {
                setCheckoutUrl(null);
              } else {
                onClose();
              }
            }}
            className="p-1.5 text-slate-500 hover:text-white border border-white/5 hover:border-white/15 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {checkoutUrl ? (
              <motion.div
                key="iframe"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <IframeCheckout checkoutUrl={checkoutUrl} onClose={onClose} />
              </motion.div>
            ) : (
              <motion.div
                key="plans"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <PlanSelector
                  onSelect={handleSelectPlan}
                  loading={loading}
                  error={error}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
