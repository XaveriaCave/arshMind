/**
 * useFirestore.ts
 *
 * Single source of truth for all Firestore reads and writes in ArshMind.
 *
 * Firestore structure:
 *
 *   users/{uid}/
 *     profile          → UserProfile fields (flat doc)
 *     scenarios        → { scenarios: Scenario[], updatedAt }
 *     settings         → { activeScenarioId, savingsRate, ... }
 *     feedbackHistory  → { entries: FeedbackEntry[] }   ← NEW
 *
 * All scenario mutations (task completion, initializedAt, replan result,
 * active-vector switch) flow through saveScenarios(), which does a single
 * atomic setDoc so Firestore always has the full up-to-date array.
 *
 * Feedback from replan is saved separately in saveFeedback() so you have a
 * full audit trail of every recalibration the user triggered.
 */

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase"; // adjust path if needed
import { UserProfile, Scenario, ScenarioSettings } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FeedbackEntry {
  id: string;              // e.g. `${scenarioId}_${Date.now()}`
  scenarioId: string;
  scenarioTitle: string;
  feedbackText: string;    // raw text the user typed
  submittedAt: string;     // ISO date
}

interface FirestoreState {
  profile: UserProfile | null;
  scenarios: Scenario[];
  settings: ScenarioSettings | null;
  feedbackHistory: FeedbackEntry[];
  loading: boolean;
  error: string | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useFirestore(uid: string | null) {
  const [state, setState] = useState<FirestoreState>({
    profile: null,
    scenarios: [],
    settings: null,
    feedbackHistory: [],
    loading: true,
    error: null,
  });

  // ── Real-time listeners ───────────────────────────────────────────────────

  useEffect(() => {
    if (!uid) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    const userRef = doc(db, "users", uid);
    const scenRef = doc(db, "users", uid, "data", "scenarios");
    const settRef = doc(db, "users", uid, "data", "settings");
    const feedRef = doc(db, "users", uid, "data", "feedbackHistory");

    // Profile (real-time)
    const unsubProfile = onSnapshot(userRef, snap => {
      if (snap.exists()) {
        setState(s => ({ ...s, profile: snap.data() as UserProfile }));
      }
    }, err => setState(s => ({ ...s, error: err.message })));

    // Scenarios (real-time — picks up task completions from other devices)
    const unsubScenarios = onSnapshot(scenRef, snap => {
      if (snap.exists()) {
        const data = snap.data();
        setState(s => ({
          ...s,
          scenarios: data.scenarios ?? [],
          loading: false,
        }));
      } else {
        setState(s => ({ ...s, scenarios: [], loading: false }));
      }
    }, err => setState(s => ({ ...s, error: err.message, loading: false })));

    // Settings (real-time)
    const unsubSettings = onSnapshot(settRef, snap => {
      if (snap.exists()) {
        setState(s => ({ ...s, settings: snap.data() as ScenarioSettings }));
      }
    }, err => setState(s => ({ ...s, error: err.message })));

    // Feedback history (real-time)
    const unsubFeedback = onSnapshot(feedRef, snap => {
      if (snap.exists()) {
        const data = snap.data();
        setState(s => ({ ...s, feedbackHistory: data.entries ?? [] }));
      }
    }, err => setState(s => ({ ...s, error: err.message })));

    return () => {
      unsubProfile();
      unsubScenarios();
      unsubSettings();
      unsubFeedback();
    };
  }, [uid]);

  // ── Write helpers ─────────────────────────────────────────────────────────

  /**
   * Save the full profile doc (used after onboarding wizard).
   */
  const saveProfile = useCallback(async (profile: UserProfile) => {
    if (!uid) throw new Error("Not authenticated");
    await setDoc(doc(db, "users", uid), {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }, [uid]);

  /**
   * Partial profile update (used for isPro flag, name edits, etc.)
   */
  const updateProfile = useCallback(async (fields: Partial<UserProfile>) => {
    if (!uid) throw new Error("Not authenticated");
    await updateDoc(doc(db, "users", uid), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  }, [uid]);

  /**
   * Save the full scenarios array.
   * Called by:
   *   - post-analysis (initial save of all 6 scenarios with actionPlan)
   *   - task toggle in ActionPlan (completedAt mutation)
   *   - vector initialization (initializedAt)
   *   - vector switch (clears old initializedAt, sets new)
   *   - replan result (replaces the recalibrated scenario in the array)
   */
  const saveScenarios = useCallback(async (scenarios: Scenario[]) => {
    if (!uid) throw new Error("Not authenticated");
    await setDoc(
      doc(db, "users", uid, "data", "scenarios"),
      { scenarios, updatedAt: serverTimestamp() },
      { merge: false } // full overwrite — we always pass the complete array
    );
  }, [uid]);

  /**
   * Save scenario settings (activeScenarioId, sliders, etc.)
   */
  const saveSettings = useCallback(async (settings: ScenarioSettings) => {
    if (!uid) throw new Error("Not authenticated");
    await setDoc(
      doc(db, "users", uid, "data", "settings"),
      { ...settings, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }, [uid]);

  /**
   * Save a single feedback entry to the feedback history array.
   * Called right before the /api/replan-path request is sent so
   * the record exists even if the network call fails.
   *
   * Usage:
   *   await saveFeedback({
   *     scenarioId: scenario.id,
   *     scenarioTitle: scenario.title,
   *     feedbackText: userTypedText,
   *   });
   */
  const saveFeedback = useCallback(async ({
    scenarioId,
    scenarioTitle,
    feedbackText,
  }: {
    scenarioId: string;
    scenarioTitle: string;
    feedbackText: string;
  }) => {
    if (!uid) throw new Error("Not authenticated");

    const entry: FeedbackEntry = {
      id: `${scenarioId}_${Date.now()}`,
      scenarioId,
      scenarioTitle,
      feedbackText: feedbackText.trim(),
      submittedAt: new Date().toISOString(),
    };

    const feedRef = doc(db, "users", uid, "data", "feedbackHistory");
    const snap = await getDoc(feedRef);
    const existing: FeedbackEntry[] = snap.exists()
      ? (snap.data().entries ?? [])
      : [];

    // Keep last 50 entries max to avoid unbounded growth
    const updated = [...existing, entry].slice(-50);

    await setDoc(feedRef, { entries: updated, updatedAt: serverTimestamp() });

    return entry;
  }, [uid]);

  /**
   * Toggle a task's completion in the active scenario and persist.
   * Convenience wrapper so ActionPlan doesn't have to manage the
   * full scenarios array itself.
   */
  const toggleActionTask = useCallback(async (
    scenarios: Scenario[],
    scenarioId: string,
    taskId: string,
  ) => {
    const updated = scenarios.map(s => {
      if (s.id !== scenarioId) return s;
      return {
        ...s,
        actionPlan: (s.actionPlan ?? []).map(t =>
          t.id === taskId
            ? { ...t, completedAt: t.completedAt ? undefined : new Date().toISOString() }
            : t
        ),
      };
    });
    await saveScenarios(updated);
    return updated;
  }, [saveScenarios]);

  /**
   * Initialize a vector (set initializedAt) and persist.
   */
  const initializeVector = useCallback(async (
    scenarios: Scenario[],
    scenarioId: string,
  ) => {
    const updated = scenarios.map(s =>
      s.id === scenarioId
        ? { ...s, initializedAt: new Date().toISOString() }
        : s
    );
    await saveScenarios(updated);
    return updated;
  }, [saveScenarios]);

  /**
   * Switch the active vector (Pro feature).
   * Clears initializedAt on the old vector, sets it on the new one.
   */
  const switchVector = useCallback(async (
    scenarios: Scenario[],
    fromId: string,
    toId: string,
  ) => {
    const now = new Date().toISOString();
    const updated = scenarios.map(s => {
      if (s.id === fromId) return { ...s, initializedAt: undefined };
      if (s.id === toId) return { ...s, initializedAt: now };
      return s;
    });
    await saveScenarios(updated);
    return updated;
  }, [saveScenarios]);

  /**
   * Apply a replan result: replace the old scenario in the array with the
   * recalibrated one returned by the server, then persist.
   */
  const applyReplanResult = useCallback(async (
    scenarios: Scenario[],
    recalibratedScenario: Scenario,
  ) => {
    const updated = scenarios.map(s =>
      s.id === recalibratedScenario.id ? recalibratedScenario : s
    );
    await saveScenarios(updated);
    return updated;
  }, [saveScenarios]);

  return {
    ...state,
    // writes
    saveProfile,
    updateProfile,
    saveScenarios,
    saveSettings,
    saveFeedback,
    // convenience mutations
    toggleActionTask,
    initializeVector,
    switchVector,
    applyReplanResult,
  };
}