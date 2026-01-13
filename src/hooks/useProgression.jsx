// src/hooks/useProgression.jsx

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { SCHOOLS, getSchoolsByUnlock } from "../data/schools";
import { getLevelFromXp, getLevelProgress, getTierForLevel } from "../lib/progressionUtils";

const ProgressionContext = createContext(null);

const STORAGE_KEY = "scholomance-progression-v2";

/**
 * Progression data structure:
 * {
 *   xp: number,              // Total experience points (The source of truth)
 *   unlockedSchools: string[], // Array of unlocked school IDs
 *   lastUpdated: number,     // Timestamp
 *   achievements: string[],  // Achievement IDs
 *   discoveryHistory: [],    // Track unique discoveries to prevent XP farming
 * }
 */

export function ProgressionProvider({ children }) {
  const [progression, setProgression] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn("Failed to parse progression:", e);
      }
    }
    return {
      xp: 0,
      unlockedSchools: ["SONIC"], // Only SONIC available at start
      lastUpdated: Date.now(),
      achievements: [],
      discoveryHistory: []
    };
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progression));
  }, [progression]);

  /**
   * Add XP and check for unlocks
   * @param {number} amount - XP amount to add
   * @param {string} [source] - Source of XP (e.g., "word-analysis", "scroll-created")
   * @param {string} [uniqueId] - Optional unique ID for discovery items (to prevent duplicate XP)
   */
  const addXP = useCallback((amount, source = "general", uniqueId = null) => {
    setProgression(prev => {
      // 1. Check for duplicate discovery if uniqueId provided
      if (uniqueId && prev.discoveryHistory.includes(uniqueId)) {
        return prev; // No double dipping for discoveries!
      }

      const newXP = prev.xp + amount;
      const prevLevel = getLevelFromXp(prev.xp);
      const newLevel = getLevelFromXp(newXP);
      
      const newDiscoveryHistory = uniqueId 
        ? [...prev.discoveryHistory, uniqueId]
        : prev.discoveryHistory;

      // 2. Check for new school unlocks
      const schools = getSchoolsByUnlock();
      // Unlocks are now based on Level or specific XP milestones? 
      // The Architecture said XP, but OSRS style implies Level.
      // We will stick to the architecture's "UnlockXP" property for now, 
      // but strictly checking against the new Total XP.
      
      const newlyUnlocked = schools.filter(
        school => !prev.unlockedSchools.includes(school.id) && newXP >= school.unlockXP
      );
      const newUnlockedSchools = [...prev.unlockedSchools, ...newlyUnlocked.map(s => s.id)];

      // 3. Achievements & Notifications
      const newAchievements = [...prev.achievements];
      
      // Level Up Event
      if (newLevel > prevLevel) {
        emitXPEvent("level-up", { level: newLevel, tier: getTierForLevel(newLevel) });
      }

      // School Unlock Event
      newlyUnlocked.forEach(school => {
        newAchievements.push(`school-unlocked-${school.id.toLowerCase()}`);
        emitXPEvent("school-unlocked", { school });
      });

      return {
        ...prev,
        xp: newXP,
        unlockedSchools: newUnlockedSchools,
        lastUpdated: Date.now(),
        achievements: [...new Set(newAchievements)],
        discoveryHistory: newDiscoveryHistory
      };
    });

    // Trigger celebration for XP gain (if significant)
    if (amount > 0) {
      emitXPEvent("xp-gained", { amount, source });
    }
  }, []);

  /**
   * Reset progression (for testing or new game)
   */
  const resetProgression = useCallback(() => {
    setProgression({
      xp: 0,
      unlockedSchools: ["SONIC"],
      lastUpdated: Date.now(),
      achievements: [],
      discoveryHistory: []
    });
  }, []);

  /**
   * Check if a specific school is unlocked
   */
  const checkUnlocked = useCallback((schoolId) => {
    return progression.unlockedSchools.includes(schoolId);
  }, [progression.unlockedSchools]);

  /**
   * Get the next school to unlock
   */
  const getNextUnlock = useCallback(() => {
    const schools = getSchoolsByUnlock();
    for (const school of schools) {
      if (!progression.unlockedSchools.includes(school.id)) {
        return {
          school,
          xpNeeded: school.unlockXP - progression.xp,
        };
      }
    }
    return null;
  }, [progression.xp, progression.unlockedSchools]);

  // Computed state for consumers
  const currentLevelInfo = useMemo(() => getLevelProgress(progression.xp), [progression.xp]);

  const value = useMemo(() => ({
    progression,
    addXP,
    resetProgression,
    checkUnlocked,
    getNextUnlock,
    levelInfo: currentLevelInfo,
    availableSchools: progression.unlockedSchools,
    totalSchools: Object.keys(SCHOOLS).length,
  }), [
    progression,
    addXP,
    resetProgression,
    checkUnlocked,
    getNextUnlock,
    currentLevelInfo
  ]);

  return (
    <ProgressionContext.Provider value={value}>
      {children}
    </ProgressionContext.Provider>
  );
}

export function useProgression() {
  const context = useContext(ProgressionContext);
  if (!context) {
    throw new Error("useProgression must be used within ProgressionProvider");
  }
  return context;
}

// Event emitter for progression events
const eventListeners = new Map();

export function emitXPEvent(event, data) {
  if (eventListeners.has(event)) {
    eventListeners.get(event).forEach(callback => callback(data));
  }
}

export function onXPEvent(event, callback) {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, []);
  }
  eventListeners.get(event).push(callback);
  return () => {
    const listeners = eventListeners.get(event);
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}