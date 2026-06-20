import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Cookie, Shield, FileText, Map, ChevronRight, ExternalLink } from "lucide-react";

// ── Cookie Storage Keys ───────────────────────────────────────────────────────
const COOKIE_CONSENT_KEY = "arshmind_cookie_consent";   // "accepted" | "rejected"
const COOKIE_USER_KEY = "arshmind_cookie_user";       // last accepted user email/uid
const TC_ACCEPTED_KEY = "arshmind_tc_accepted";       // stored user id when TC accepted

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getCookieConsent(): "accepted" | "rejected" | null {
  return localStorage.getItem(COOKIE_CONSENT_KEY) as any ?? null;
}

export function hasCookiesAccepted(): boolean {
  return getCookieConsent() === "accepted";
}

export function markTCAccepted(userIdentifier: string) {
  if (hasCookiesAccepted()) {
    localStorage.setItem(TC_ACCEPTED_KEY, userIdentifier);
  }
}

export function isTCAlreadyAccepted(userIdentifier: string): boolean {
  if (!hasCookiesAccepted()) return false;
  return localStorage.getItem(TC_ACCEPTED_KEY) === userIdentifier;
}

export function saveKnownUser(userIdentifier: string) {
  if (hasCookiesAccepted()) {
    localStorage.setItem(COOKIE_USER_KEY, userIdentifier);
  }
}

// ── Privacy Policy Content ────────────────────────────────────────────────────
const PRIVACY_SECTIONS = [
  {
    title: "Data Collection",
    content:
      "ArshMind collects only the information you voluntarily provide during onboarding — including your career metrics, financial figures, goals, and preferences. We do not collect any sensitive financial credentials or payment data through the app.",
  },
  {
    title: "How We Use Your Data",
    content:
      "Your profile data is used exclusively to generate personalized career and financial scenario simulations. We use Firebase Firestore to securely store your profile so your progress is preserved across sessions. We do not sell, rent, or share your data with any third parties.",
  },
  {
    title: "Cookies & Local Storage",
    content:
      "We use browser localStorage to remember your theme preference, cookie consent choice, and session state. No third-party tracking cookies are used. You may reject optional cookies and still use core features of ArshMind.",
  },
  {
    title: "Authentication",
    content:
      "We use Firebase Authentication (Google Sign-In) to securely identify users. We store your Firebase UID and email to link your profile data. No passwords are stored on our servers.",
  },
  {
    title: "Data Retention",
    content:
      "Your data is retained for as long as you maintain an active account. You may request data deletion at any time by contacting us. After account deletion, all associated data is purged from our Firestore database within 30 days.",
  },
  {
    title: "Security",
    content:
      "All data is encrypted in transit using TLS. Firestore security rules restrict each user to their own data only. We perform regular security reviews and follow Firebase best practices.",
  },
  {
    title: "Third-Party Services",
    content:
      "We use Google Firebase (Auth, Firestore), Render.com (AI backend), and Google Gemini API for AI analysis. These services have their own privacy policies. We do not use advertising networks or analytics trackers.",
  },
  {
    title: "Contact",
    content:
      "For privacy-related questions, data deletion requests, or concerns, contact us at privacy@arshmind.com. We respond within 48 hours.",
  },
];

// ── Terms & Conditions Content ────────────────────────────────────────────────
const TERMS_SECTIONS = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using ArshMind, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the service.",
  },
  {
    title: "Service Description",
    content:
      "ArshMind is an AI-powered life simulation and financial planning tool. It generates hypothetical career and financial scenarios based on your input. ArshMind is currently in Beta and features may change without prior notice.",
  },
  {
    title: "Not Financial Advice",
    content:
      "IMPORTANT: ArshMind provides educational simulations and projections only. Nothing on this platform constitutes professional financial, legal, investment, or career advice. All scenarios are hypothetical models based on algorithmic assumptions. Always consult a qualified professional before making major financial or career decisions.",
  },
  {
    title: "User Responsibilities",
    content:
      "You are responsible for the accuracy of the data you enter. You agree not to misuse the service, attempt to reverse-engineer the AI systems, or use outputs for commercial redistribution without permission.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content, design, code, and AI models powering ArshMind are the intellectual property of ArshMind. You may not copy, modify, or redistribute any part of the platform without explicit written permission.",
  },
  {
    title: "Limitation of Liability",
    content:
      "ArshMind and its creators shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of or inability to use the service. This includes financial losses resulting from decisions made based on ArshMind's simulations.",
  },
  {
    title: "Beta Disclaimer",
    content:
      "This service is in Beta. Features may be incomplete, inaccurate, or subject to change. We do not guarantee uninterrupted service availability. Uptime targets are best-effort during Beta.",
  },
  {
    title: "Termination",
    content:
      "We reserve the right to terminate or suspend your access to ArshMind at any time, with or without cause, with or without notice. Upon termination, your right to use the service ceases immediately.",
  },
  {
    title: "Governing Law",
    content:
      "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of courts in India.",
  },
  {
    title: "Changes to Terms",
    content:
      "We may update these Terms periodically. Continued use of ArshMind after changes constitutes acceptance of the new Terms. We will notify users of significant changes via in-app alerts.",
  },
];

// ── Sitemap Data ──────────────────────────────────────────────────────────────
const SITEMAP = [
  {
    section: "LANDING",
    links: [
      { label: "Hero", href: "#hero" },
      { label: "Scenario Explorer", href: "#explorer" },
      { label: "Life Decisions", href: "#decisions" },
      { label: "System Features", href: "#features" },
      { label: "How It Works", href: "#how" },
      { label: "Field Reports", href: "#proof" },
      { label: "Enlist / Waitlist", href: "#waitlist" },
    ],
  },
  {
    section: "APPLICATION",
    links: [
      { label: "Dashboard", href: "#" },
      { label: "Scenario Engine", href: "#" },
      { label: "Financial Projections", href: "#" },
      { label: "Action Plan", href: "#" },
      { label: "Timeline View", href: "#" },
      { label: "Compare Paths", href: "#" },
    ],
  },
  {
    section: "ACCOUNT",
    links: [
      { label: "Sign In (Google)", href: "#" },
      { label: "Profile Settings", href: "#" },
      { label: "Pro Upgrade", href: "#" },
    ],
  },
  {
    section: "LEGAL",
    links: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms & Conditions", href: "#terms" },
      { label: "Contact Us", href: "mailto:contact@arshmind.com" },
    ],
  },
];

// ── HUD Modal Base ────────────────────────────────────────────────────────────
// All background/border/text colours use CSS class names so html.light overrides work.
function HUDModal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  accentColor,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 hud-backdrop"
            onClick={onClose}
          />

          {/* Panel — uses hud-modal-panel class (themed via CSS) */}
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="hud-modal-panel relative w-full max-w-2xl max-h-[85vh] flex flex-col z-10"
            style={{
              border: `1px solid ${accentColor}33`,
              boxShadow: `0 0 60px ${accentColor}14, 0 25px 50px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px] opacity-60"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
            />

            {/* Animated scan-line */}
            <div className="hud-scan-line" />

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l opacity-40" style={{ borderColor: accentColor }} />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r opacity-40" style={{ borderColor: accentColor }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l opacity-40" style={{ borderColor: accentColor }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r opacity-40" style={{ borderColor: accentColor }} />

            {/* Header */}
            <div
              className="hud-modal-header flex items-center justify-between p-6"
              style={{ borderBottomColor: `${accentColor}20` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center hud-icon-wrap"
                  style={{ borderColor: `${accentColor}40` }}
                >
                  {icon}
                </div>
                <div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.25em] mb-1 hud-accent-label" style={{ color: accentColor }}>
                    // HUD_DISPLAY · ARSHMIND_OS
                  </div>
                  <h2 className="text-base font-bold hud-title uppercase tracking-tight font-mono">{title}</h2>
                  <p className="text-[9px] hud-subtitle font-mono uppercase tracking-widest mt-0.5">{subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="hud-close-btn p-2 border transition-all font-mono text-[9px] tracking-widest flex items-center gap-1.5"
              >
                <X size={12} />
                ESC
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar hud-modal-body">
              {children}
            </div>

            {/* Footer */}
            <div
              className="hud-modal-footer px-6 py-4 border-t flex items-center justify-between"
              style={{ borderTopColor: `${accentColor}15` }}
            >
              <span className="font-mono text-[8px] hud-footer-copy uppercase tracking-widest">
                © 2026 ARSHMIND · ALL RIGHTS RESERVED
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 font-mono text-[9px] uppercase tracking-widest transition-all text-black font-bold"
                style={{ background: accentColor }}
              >
                CLOSE PANEL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Policy Section Block ──────────────────────────────────────────────────────
function PolicySection({
  title,
  content,
  accentColor,
  index,
}: {
  title: string;
  content: string;
  accentColor: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="hud-policy-section p-5 border-l-2"
      style={{ borderLeftColor: `${accentColor}50` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ChevronRight size={10} style={{ color: accentColor }} />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: accentColor }}>
          {String(index + 1).padStart(2, "0")} · {title}
        </span>
      </div>
      <p className="text-xs hud-policy-text leading-relaxed font-sans font-normal">{content}</p>
    </motion.div>
  );
}

// ── Privacy Policy Modal ──────────────────────────────────────────────────────
export function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <HUDModal
      open={open}
      onClose={onClose}
      title="Privacy Policy"
      subtitle="Last updated: June 2026 · Version 1.2"
      icon={<Shield size={18} color="#10b981" />}
      accentColor="#10b981"
    >
      <p className="text-[10px] font-mono hud-subtitle uppercase tracking-widest border-b hud-divider pb-4 mb-4">
        // PRIVACY_PROTOCOL · HOW WE HANDLE YOUR DATA
      </p>
      <div className="space-y-3">
        {PRIVACY_SECTIONS.map((s, i) => (
          <PolicySection key={s.title} title={s.title} content={s.content} accentColor="#10b981" index={i} />
        ))}
      </div>
    </HUDModal>
  );
}

// ── Terms Modal ───────────────────────────────────────────────────────────────
export function TermsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <HUDModal
      open={open}
      onClose={onClose}
      title="Terms & Conditions"
      subtitle="Last updated: June 2026 · Version 1.2"
      icon={<FileText size={18} color="#f59e0b" />}
      accentColor="#f59e0b"
    >
      <p className="text-[10px] font-mono hud-subtitle uppercase tracking-widest border-b hud-divider pb-4 mb-4">
        // LEGAL_PROTOCOL · TERMS OF SERVICE
      </p>
      <div className="space-y-3">
        {TERMS_SECTIONS.map((s, i) => (
          <PolicySection key={s.title} title={s.title} content={s.content} accentColor="#f59e0b" index={i} />
        ))}
      </div>
    </HUDModal>
  );
}

// ── Sitemap Modal ─────────────────────────────────────────────────────────────
export function SitemapModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <HUDModal
      open={open}
      onClose={onClose}
      title="Site Map"
      subtitle="Complete navigation index · ArshMind OS"
      icon={<Map size={18} color="#818cf8" />}
      accentColor="#818cf8"
    >
      <p className="text-[10px] font-mono hud-subtitle uppercase tracking-widest border-b hud-divider pb-4 mb-4">
        // NAVIGATION_MATRIX · ALL SYSTEM NODES
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SITEMAP.map((group, gi) => (
          <motion.div
            key={group.section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.06 }}
            className="space-y-2"
          >
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-indigo-400 pb-2 border-b border-indigo-500/20">
              {group.section}
            </div>
            <ul className="space-y-1.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center gap-2 text-[10px] font-mono hud-sitemap-link uppercase tracking-widest transition-colors group hover:text-indigo-400"
                  >
                    <span className="text-indigo-500/40 group-hover:text-indigo-400 transition-colors">//</span>
                    {link.label}
                    {link.href.startsWith("mailto") && (
                      <ExternalLink size={9} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </HUDModal>
  );
}

// ── Cookie Banner ─────────────────────────────────────────────────────────────
export function CookieBanner({
  onConsent,
}: {
  onConsent: (choice: "accepted" | "rejected") => void;
}) {
  const [visible, setVisible] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
    onConsent("accepted");
  }, [onConsent]);

  const handleReject = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setVisible(false);
    onConsent("rejected");
  }, [onConsent]);

  return (
    <>
      <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-full max-w-2xl px-4"
          >
            {/* Uses cookie-banner-panel — themed via CSS */}
            <div className="cookie-banner-panel relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60" />
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-emerald-500/50" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-emerald-500/50" />

              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Icon + text */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-9 h-9 flex-shrink-0 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Cookie size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-emerald-500 mb-1">
                      // COOKIE_PROTOCOL
                    </div>
                    <p className="text-[11px] cookie-banner-text leading-relaxed font-sans">
                      We use cookies &amp; to remember your theme, session state, and preferences — no
                      third-party trackers.{" "}
                      <button
                        onClick={() => setShowPrivacy(true)}
                        className="text-emerald-500 hover:text-emerald-400 underline underline-offset-2 transition-colors"
                      >
                        Privacy Policy
                      </button>
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                  <button
                    onClick={handleReject}
                    className="cookie-reject-btn flex-1 sm:flex-none px-4 py-2.5 border font-mono text-[9px] uppercase tracking-widest transition-all"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-[9px] uppercase tracking-widest transition-all"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Legal Footer Links ────────────────────────────────────────────────────────
export function LegalFooterLinks() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);

  return (
    <>
      <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
      <SitemapModal open={showSitemap} onClose={() => setShowSitemap(false)} />

      <div className="flex gap-6">
        <button
          onClick={() => setShowSitemap(true)}
          className="hover:text-indigo-400 transition-colors font-mono text-[9px] uppercase tracking-widest"
        >
          SITEMAP
        </button>
        <button
          onClick={() => setShowPrivacy(true)}
          className="hover:text-emerald-500 transition-colors font-mono text-[9px] uppercase tracking-widest"
        >
          PRIVACY
        </button>
        <button
          onClick={() => setShowTerms(true)}
          className="hover:text-amber-500 transition-colors font-mono text-[9px] uppercase tracking-widest"
        >
          TERMS
        </button>
        <a
          href="mailto:contact@arshmind.com"
          className="hover:text-emerald-500 transition-colors font-mono text-[9px] uppercase tracking-widest"
        >
          CONTACT
        </a>
      </div>
    </>
  );
}
