import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { signInWithGoogle, auth } from "../../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  // Auth States: "CHOICE" | "SIGNIN" | "SIGNUP" | "RESET"
  const [authMode, setAuthMode] = useState<"CHOICE" | "SIGNIN" | "SIGNUP" | "RESET">("CHOICE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  
  const allLogs = [
    "// SYSTEM INITIALIZING...",
    "// LOADING AI PLANNING ENGINE...",
    "// CALIBRATING LIFE VECTORS...",
    "// ANALYZING TEMPORAL BRANCHES...",
    "// COGNITIVE LOGIC ONLINE.",
    "// READY TO COMMENCE OPERATIVE SELECTION."
  ];

  useEffect(() => {
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < allLogs.length) {
        setLogs(prev => [...prev, allLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 15);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError("");
    setAuthSuccessMsg("");
    try {
      await signInWithGoogle();
      onComplete();
    } catch (error: any) {
      console.error("Sign in failed:", error);
      setAuthError(`// GOOGLE_SSO_FAILED: ${error.message || "Unknown error"}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("// AUTH_ERROR: Please enter both email and password.");
      return;
    }
    setIsSigningIn(true);
    setAuthError("");
    setAuthSuccessMsg("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onComplete();
    } catch (error: any) {
      console.error("Email sign in failed:", error);
      let errMsg = error.message;
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        errMsg = "Invalid authentication parameters (incorrect credentials).";
      } else if (error.code === "auth/invalid-email") {
        errMsg = "Malformed email address structure.";
      }
      setAuthError(`// AUTH_FAILED (${error.code || "unknown"}): ${errMsg}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setAuthError("// CAPTURE_ERROR: Complete all security coordinates.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("// CAPTURE_ERROR: Cryptographic security keys do not match.");
      return;
    }
    if (password.length < 6) {
      setAuthError("// CAPTURE_ERROR: Password is too weak (min 6 characters required).");
      return;
    }
    setIsSigningIn(true);
    setAuthError("");
    setAuthSuccessMsg("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onComplete();
    } catch (error: any) {
      console.error("Email sign up failed:", error);
      let errMsg = error.message;
      if (error.code === "auth/email-already-in-use") {
        errMsg = "This email coordinate is already registered in our database. If you previously signed up via Google SSO, you do not need to register again. You can enable direct Email/Password login by submitting a password configuration link under '// EMAIL_SIGN_IN' => '// FORGOT_SECURITY_KEY'.";
      } else if (error.code === "auth/weak-password") {
        errMsg = "Security key is too fragile (weak password).";
      }
      setAuthError(`// REGISTRATION_FAILED: ${errMsg}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError("// TRANS_ERROR: Please specify a valid destination email.");
      return;
    }
    setIsSigningIn(true);
    setAuthError("");
    setAuthSuccessMsg("");
    try {
      await sendPasswordResetEmail(auth, email);
      setAuthSuccessMsg("// TRANSMISSION_CONFIRMED: Password reset vector sent to target inbox. Inspect coordinates shortly.");
    } catch (error: any) {
      console.error("Password reset failed:", error);
      setAuthError(`// RESET_FAILED: ${error.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const clearModes = (mode: typeof authMode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthSuccessMsg("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-6 overflow-hidden select-none">
      
      {/* 🔮 3D Holographic Concentric Boot Rings */}
      <div className="relative mb-6 w-36 h-36 flex items-center justify-center shrink-0">
        {/* Dynamic Pulsating Rings */}
        <div className="absolute w-32 h-32 rounded-full border border-emerald-500/10 animate-[spin_10s_linear_infinite]" />
        <div className="absolute w-26 h-26 rounded-full border border-dashed border-emerald-500/20 animate-[spin_15s_linear_infinite_reverse]" />
        
        <motion.div 
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 rounded-full border border-emerald-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.08)]"
        />
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute w-18 h-18 rounded-full border border-dashed border-emerald-500/40 flex items-center justify-center"
        />
        
        {/* Center Diamond Glyphs */}
        <div className="text-emerald-500 text-lg font-mono relative z-10 z-inner drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
          ◆
        </div>
      </div>

      {/* 🏷️ Logo Branding */}
      <div className="text-center mb-4 shrink-0">
        <h1 className="text-2xl font-mono tracking-[0.4em] text-white uppercase font-bold">
          ARSH<span className="text-emerald-500">MIND</span>
        </h1>
        <p className="text-slate-600 font-mono text-[8px] uppercase tracking-widest mt-1">// FUTURE_OS_DEPLOYMENT_V2</p>
      </div>

      <AnimatePresence mode="wait">
        {/* If booting, show Terminal. Otherwise show Auth Screen */}
        {progress < 100 ? (
          <motion.div 
            key="terminal"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            {/* 🕹️ Boot Terminal Screen logs */}
            <div className="w-full bg-[#070708] border border-white/5 p-4 rounded-none mb-6 font-mono text-[10px] space-y-1.5 h-28 overflow-y-auto no-scrollbar">
              {logs.map((log, i) => {
                const isActive = i === logs.length - 1 && progress < 100;
                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 4 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`leading-relaxed tracking-wider ${isActive ? "text-emerald-400 animate-pulse font-bold" : "text-slate-500"}`}
                  >
                    {log}
                  </motion.div>
                );
              })}
            </div>

            {/* 📥 Loading progress track */}
            <div className="w-full bg-white/5 h-[3px] mb-6 overflow-hidden relative">
              <div 
                className="h-full bg-emerald-500 transition-all duration-100 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md flex flex-col items-center"
          >
            {/* Error & Success Logging Monitor */}
            {(authError || authSuccessMsg) && (
              <div className="w-full bg-[#0E0608] border border-red-500/20 text-[9px] p-3 mb-4 font-mono uppercase tracking-wider space-y-1 select-text">
                {authError && <div className="text-rose-500">{authError}</div>}
                {authSuccessMsg && <div className="text-emerald-400">{authSuccessMsg}</div>}
              </div>
            )}

            {/* Config Panels */}
            {authMode === "CHOICE" && (
              <div className="w-full space-y-3">
                <div className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-widest mb-2">
                  // DEPLOY_AUTH_PROVIDER_PARAMETERS
                </div>
                
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-3.5 border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                >
                  {isSigningIn ? "[ AUTHORIZING... ]" : "[ SIGN IN WITH GOOGLE ]"}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => clearModes("SIGNIN")}
                    disabled={isSigningIn}
                    className="flex-1 py-3 border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-400 font-mono text-[9px] uppercase tracking-[0.15em] transition-all"
                  >
                    // EMAIL_SIGN_IN
                  </button>
                  <button
                    onClick={() => clearModes("SIGNUP")}
                    disabled={isSigningIn}
                    className="flex-1 py-3 border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-400 font-mono text-[9px] uppercase tracking-[0.15em] transition-all"
                  >
                    // REGISTER_OPERATIVE
                  </button>
                </div>

                {auth.currentUser && (
                  <div className="pt-3 text-center">
                    <button
                      onClick={onComplete}
                      className="text-emerald-400 font-mono text-[9px] hover:underline uppercase tracking-wider"
                    >
                      [ BYPASS AS AUTHENTICATED: {auth.currentUser.email} &gt;&gt; ]
                    </button>
                  </div>
                )}
              </div>
            )}

            {authMode === "SIGNIN" && (
              <form onSubmit={handleEmailSignIn} className="w-full space-y-4">
                <div className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-widest mb-1">
                  // ACCESS COORDINATES FORM
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">// EMAIL_ENDPOINT</label>
                    <input
                      type="email"
                      value={email}
                      required
                      placeholder="ENTER_EMAIL_COORDINATES"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">// ACCESS_SECURITY_KEY</label>
                    <input
                      type="password"
                      value={password}
                      required
                      placeholder="ENTER_PASSWORD_COORDINATES"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[10px] uppercase tracking-[0.2em] transition-all shrink-0"
                >
                  {isSigningIn ? "[ EXECUTING AUTHENTICATION... ]" : "[ AUTHORIZE INTEGRATION ]"}
                </button>

                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest pt-2">
                  <button
                    type="button"
                    onClick={() => clearModes("CHOICE")}
                    className="text-slate-500 hover:text-emerald-500 transition-colors"
                  >
                    &lt; RETURN_BACK
                  </button>
                  <button
                    type="button"
                    onClick={() => clearModes("RESET")}
                    className="text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    // FORGOT_SECURITY_KEY
                  </button>
                </div>
              </form>
            )}

            {authMode === "SIGNUP" && (
              <form onSubmit={handleEmailSignUp} className="w-full space-y-4">
                <div className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-widest mb-1">
                  // REGISTER_NEW_OPERATIVE
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">// EMAIL_ENDPOINT</label>
                    <input
                      type="email"
                      value={email}
                      required
                      placeholder="ENTER_EMAIL_COORDINATES"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">// ACCESS_SECURITY_KEY</label>
                    <input
                      type="password"
                      value={password}
                      required
                      placeholder="CREATE_PASSWORD_KEYS"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">// RE_ENTER_SECURITY_KEY</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      required
                      placeholder="RECONFIRM_PASSWORD_KEYS"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[10px] uppercase tracking-[0.2em] transition-all shrink-0"
                >
                  {isSigningIn ? "[ INITIALIZING PROFILE... ]" : "[ COMPLETE REGISTRATION ]"}
                </button>

                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest pt-2">
                  <button
                    type="button"
                    onClick={() => clearModes("CHOICE")}
                    className="text-slate-500 hover:text-emerald-500 transition-colors"
                  >
                    &lt; RETURN_BACK
                  </button>
                </div>
              </form>
            )}

            {authMode === "RESET" && (
              <form onSubmit={handlePasswordReset} className="w-full space-y-4">
                <div className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-widest mb-1">
                  // RECOVER_SECURITY_ACCESS_KEY
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">// TARGET_EMAIL_COORDINATE</label>
                    <input
                      type="email"
                      value={email}
                      required
                      placeholder="ENTER_YOUR_REGISTERED_EMAIL"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#070708] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 p-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-[10px] uppercase tracking-[0.2em] transition-all shrink-0"
                >
                  {isSigningIn ? "[ TRANSMITTING RECOVERY ATOM... ]" : "[ INITIATE PASSWORD RECOVERY ]"}
                </button>

                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest pt-2">
                  <button
                    type="button"
                    onClick={() => clearModes("SIGNIN")}
                    className="text-slate-500 hover:text-emerald-500 transition-colors"
                  >
                    &lt; RETURN_TO_SIGNIN
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
