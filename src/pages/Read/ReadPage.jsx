import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { usePhonemeEngine } from "../../hooks/usePhonemeEngine.jsx";
import GrimoireScroll from "./GrimoireScroll.jsx";
import AnnotationPanel from "./AnnotationPanel.jsx";
import "./ReadPage.css";

export default function ReadPage() {
  const { isReady, engine } = usePhonemeEngine();
  const [annotation, setAnnotation] = useState(null);

  const sampleText = useMemo(
    () =>
      "Ethereal syllables carve a portal through obsidian dusk, where willpower sparks and sonic glyphs bloom. The ancient codex whispers secrets of vowel alchemy, each phoneme a key to rhythmic transcendence.",
    []
  );

  const analyze = (word) => {
    const clean = String(word || "")
      .replace(/[^A-Za-z']/g, "")
      .toUpperCase();
    if (!clean) return;

    const result = engine.analyzeWord(clean);
    if (result) {
      setAnnotation({
        word: clean,
        ...result,
        rhymeKey: result.rhymeKey ?? `${result.vowelFamily}-${result.coda ?? ""}`,
      });
    }
  };

  return (
    <section className="readPage">
      {/* Ambient candlelight */}
      <div className="candle-ambience" aria-hidden="true" />
      <div className="candle-ambience candle-ambience--secondary" aria-hidden="true" />

      <div className="container">
        <header className="sectionHeader grimoire-header">
          <div className="kicker">The Arcane Codex</div>
          <h1 className="title grimoire-title">
            <span className="illuminated-letter">I</span>nspect the phonetic skeleton.
          </h1>
          <p className="subtitle grimoire-subtitle">
            Click upon any word within the sacred scroll to unveil its vowel-family,
            constituent phonemes, and rhyme key. The engine currently demonstrates with
            sample data — once thy dictionary hooks are bound, true analysis awakens.
          </p>
        </header>

        <div className="grimoire-layout">
          <GrimoireScroll
            text={sampleText}
            onWordClick={analyze}
            disabled={!isReady}
            onAnalyzeEthereal={() => analyze("ETHEREAL")}
            isEngineReady={isReady}
          />
        </div>
      </div>

      <AnimatePresence>
        {annotation && (
          <AnnotationPanel
            annotation={annotation}
            onClose={() => setAnnotation(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
