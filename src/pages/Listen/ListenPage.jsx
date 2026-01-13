import { useState, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";
import { useCurrentSong } from "../../hooks/useCurrentSong.jsx";
import { useProgression } from "../../hooks/useProgression.jsx";
import { SCHOOLS } from "../../data/schools.js";
import HolographicEmbed from "./HolographicEmbed.jsx";

export default function ListenPage() {
  const { currentKey, currentSong, setCurrentKey, library } = useCurrentSong();
  const { checkUnlocked } = useProgression();
  const [isTuning, setIsTuning] = useState(false);
  const [lastTunedSchool, setLastTunedSchool] = useState(""); // NEW
  const interfaceControls = useAnimation();

  const entries = useMemo(() => Object.entries(library), [library]);
  const currentColor = SCHOOLS[currentSong.school]?.color || "#a1a1aa";
  
  // Get all schools sorted by angle
  const sortedSchools = useMemo(() => {
    return Object.values(SCHOOLS).sort((a, b) => a.angle - b.angle);
  }, []);

  const handleTune = async (targetSchool, songKey) => {
    if (isTuning) return;
    
    // Check if target school is unlocked
    if (!checkUnlocked(targetSchool)) {
      // Show locked feedback maybe? For now, just prevent tuning.
      console.warn(`School ${targetSchool} is locked.`);
      return;
    }
    
    setIsTuning(true);
    setCurrentKey(songKey);
    setLastTunedSchool(targetSchool);

    await interfaceControls.start({
      x: [0, -4, 4, -2, 2, 0],
      y: [0, 2, -2, 1, -1, 0],
      transition: { duration: 0.42 },
    });

    setIsTuning(false);
  };

  return (
    <section className="section min-h-screen">
      {/* Live announcement */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        {lastTunedSchool 
          ? `Tuned to ${currentSong.school} school. ${currentSong.title} now playing.`
          : "Radio interface loaded. Use arrow keys or tab to navigate schools."}
      </div>

      <div className="container">
        <header className="section-header">
          <div className="kicker">Aetheric Frequency Modulator</div>
          <h1 className="title">Tune the school. Lock the signal.</h1>
          <p className="subtitle">
            Rotate the brass dial to cycle frequencies, or select a track below for precise calibration.
          </p>
        </header>

        <motion.div
          className="glass-strong p-8 rounded-2xl border-soft shadow-elevated relative overflow-hidden"
          animate={interfaceControls}
        >
          {/* Main control area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             {/* School Wheel - Shows unlock status */}
            <div className="relative aspect-square max-w-md mx-auto flex items-center justify-center">
              {sortedSchools.map(school => {
                const unlocked = checkUnlocked(school.id);
                const isSelected = currentSong.school === school.id;
                return (
                  <button
                    key={school.id}
                    className={`absolute w-16 h-16 rounded-full flex items-center justify-center transition-all ${unlocked ? 'glass border-glow' : 'opacity-40 grayscale'} ${isSelected ? 'scale-125 border-bold' : 'hover:scale-110'}`}
                    style={{
                      borderColor: isSelected ? `var(--school-${school.id.toLowerCase()})` : 'var(--border-soft)',
                      transform: `rotate(${school.angle}deg) translateX(140px) rotate(-${school.angle}deg)`,
                      boxShadow: isSelected ? `0 0 30px var(--school-${school.id.toLowerCase()}-glow)` : 'none'
                    }}
                    onClick={() => {
                        const song = entries.find(([_k, t]) => t.school === school.id);
                        if (song) handleTune(school.id, song[0]);
                    }}
                    disabled={!unlocked}
                    title={unlocked ? school.name : `Locked - ${school.unlockXP} XP required`}
                  >
                    {unlocked ? (
                      <span className="font-mono text-[10px] font-bold" style={{ color: `var(--school-${school.id.toLowerCase()})` }}>{school.id}</span>
                    ) : (
                      <span className="text-lg">🔒</span>
                    )}
                  </button>
                );
              })}
              <div className="w-32 h-32 rounded-full glass-elevated flex items-center justify-center flex-col text-center border-bold">
                 <div className="kicker text-[8px] mb-1">FREQ</div>
                 <div className="font-mono text-xl" style={{ color: currentColor }}>{currentSong.school}</div>
              </div>
            </div>

            {/* Player section */}
            <div className="flex flex-col gap-6">
              <div className="glass p-6 rounded-xl border-soft">
                <h3 className="text-xl font-bold mb-4">{currentSong.title}</h3>
                <HolographicEmbed
                  trackId={currentSong.sc}
                  color={currentColor}
                />
              </div>

              {/* Track selection grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {entries.map(([key, t]) => {
                  const active = key === currentKey;
                  const unlocked = checkUnlocked(t.school);
                  const schoolColor = unlocked ? (SCHOOLS[t.school]?.color || "#888") : "#444";
                  return (
                    <button
                      key={key}
                      className={`flex flex-col p-4 rounded-lg border transition-all text-left ${active ? 'glass-strong border-bold' : 'glass border-subtle hover:border-soft'} ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleTune(t.school, key)}
                      disabled={isTuning || !unlocked}
                      title={unlocked ? `${t.title}` : `School ${t.school} is locked`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: schoolColor, boxShadow: `0 0 10px ${schoolColor}` }} />
                        <span className="font-bold text-sm truncate">{t.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted">{t.school}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
