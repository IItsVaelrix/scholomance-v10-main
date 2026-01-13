# Scholomance V10 - Accessibility Audit & Upgrade Plan

## Executive Summary

This document identifies accessibility issues in the Scholomance codebase and provides feasible upgrades that maintain the thematic aesthetic while improving WCAG 2.1 AA compliance.

---

## Current Accessibility State

### What's Working ✅

| Feature | Status | Notes |
|---------|--------|-------|
| `focus-visible` styles | ✅ Present | `:focus-visible` outline defined in `index.css` |
| Reduced motion media query | ✅ Present | `@media (prefers-reduced-motion` exists |
| Semantic HTML | ✅ Mostly | Uses `<nav>`, `<main>`, `<section>`, `<header>` |
| ARIA labels | ⚠️ Partial | Some decorative elements have `aria-hidden` |
| Color contrast | ⚠️ Varies | School colors may have contrast issues |

### Critical Issues 🔴

| Issue | Severity | Files Affected |
|-------|----------|----------------|
| No skip navigation | 🔴 High | All pages |
| Interactive elements missing keyboard navigation | 🔴 High | GrimoireScroll, BrassGearDial |
| Missing form labels | 🔴 High | ScrollEditor title input |
| Animated content without pause control | 🔴 High | `aurora-drift`, `candle-flicker` |
| No focus management on route changes | 🟡 Medium | All page transitions |

### Moderate Issues 🟡

| Issue | Severity | Files Affected |
|-------|----------|----------------|
| Missing `alt` text on decorative images | 🟡 Medium | All decorative SVGs |
| No `prefers-contrast` support | 🟡 Medium | `index.css` |
| Interactive elements lack `aria-expanded` | 🟡 Medium | Navigation, scroll list |
| No screen reader announcements for state changes | 🟡 Medium | AnnotationPanel, school selection |
| Color-only meaning (school colors) | 🟡 Medium | School identification |

---

## Priority Upgrades

### P0: Critical - Keyboard Navigation & Focus

#### 1.1 Skip to Main Content Link

```css
/* index.css - Add after reduced motion media query */

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  padding: 12px 20px;
  background: var(--text);
  color: var(--bg-0);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  z-index: 9999;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid var(--sonic);
  outline-offset: 2px;
}
```

```javascript
// App.jsx - Add to top of <main>
<main key={location.pathname} ...>
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>
  {/* ... page content ... */}
</main>

// Add id to main content area
<main id="main-content" ...>
```

#### 1.2 GrimoireScroll Keyboard Navigation

```javascript
// src/pages/Read/GrimoireScroll.jsx - Updated

export default function GrimoireScroll({
  text,
  onWordClick,
  disabled,
  onAnalyzeEthereal,
  isEngineReady,
}) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  
  const handleKeyDown = useCallback((e, word) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const clean = word.replace(/[^A-Za-z']/g, "");
      if (clean && !disabled) {
        onWordClick?.(clean);
      }
    }
  }, [disabled, onWordClick]);

  return (
    <div className="grimoire-cover" role="document">
      {/* ... existing decorative elements ... */}
      
      <div className="grimoire-text" aria-label="Scroll content">
        <span className="drop-cap" aria-hidden="true">E</span>
        {words.map((word, i) => {
          const clean = word.replace(/[^A-Za-z']/g, "");
          if (/^\s+$/.test(word)) {
            return <span key={i} className="grimoire-space" aria-hidden="true">{word}</span>;
          }
          return (
            <button
              key={i}
              className="grimoire-word"
              disabled={disabled || !clean}
              onClick={() => onWordClick?.(clean)}
              onKeyDown={(e) => handleKeyDown(e, clean)}
              aria-label={`Analyze word: ${clean}`}
              aria-disabled={disabled || !clean}
            >
              {word}
            </button>
          );
        })}
      </div>
      
      {/* Analyze button needs keyboard accessibility */}
      <div className="page-footer">
        <button
          className="grimoire-button"
          onClick={onAnalyzeEthereal}
          disabled={!isEngineReady}
          aria-label={isEngineReady 
            ? "Analyze all words in scroll" 
            : "Phoneme engine initializing"}
        >
          {/* ... */}
        </button>
      </div>
    </div>
  );
}
```

#### 1.3 BrassGearDial Keyboard Navigation

```javascript
// src/pages/Listen/BrassGearDial.jsx - Updated

export default function BrassGearDial({ school, onTune, disabled, angle }) {
  // Convert click to keyboard accessible
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onTune?.();
      }
    }
  }, [disabled, onTune]);

  return (
    <div 
      className="brass-dial-container"
      role="slider"
      aria-label={`Frequency dial: ${school} school`}
      aria-valuenow={angle}
      aria-valuemin={0}
      aria-valuemax={360}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      {/* ... existing dial content ... */}
    </div>
  );
}
```

---

### P1: High - Forms & Labels

#### 1.4 ScrollEditor Accessibility

```javascript
// src/pages/Read/ScrollEditor.jsx - Updated

export default function ScrollEditor({
  initialTitle = "",
  initialContent = "",
  onSave,
  onCancel,
  isEditing = false,
  disabled = false,
}) {
  // ... existing state ...

  return (
    <motion.div className="scroll-editor" role="form" aria-label="Scroll editor">
      <div className="editor-header">
        <label htmlFor="scroll-title" className="sr-only">
          Scroll Title
        </label>
        <input
          id="scroll-title"
          type="text"
          className="editor-title-input"
          placeholder="Scroll Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled || isSaving}
          maxLength={100}
          aria-required="true"
          aria-describedby="title-hint"
        />
        <span id="title-hint" className="sr-only">
          Enter a title for your scroll, up to 100 characters
        </span>
        {/* ... stats ... */}
      </div>

      <div className="editor-body">
        <label htmlFor="scroll-content" className="sr-only">
          Scroll Content
        </label>
        <textarea
          id="scroll-content"
          ref={textareaRef}
          className="editor-textarea"
          placeholder="Inscribe thy verses upon this sacred parchment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSaving}
          spellCheck="false"
          aria-required="true"
          aria-describedby="content-hint"
        />
        <span id="content-hint" className="sr-only">
          Enter the text you want to analyze. Press Ctrl+S to save.
        </span>
      </div>

      <div className="editor-footer">
        {/* ... */}
      </div>
    </motion.div>
  );
}
```

Add to `index.css`:

```css
/* Screen reader only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

### P2: Medium - ARIA & Announcements

#### 2.1 Live Region for Annotations

```javascript
// src/pages/Read/ReadPage.jsx - Updated

export default function ReadPage() {
  const [annotation, setAnnotation] = useState(null);
  const [announcement, setAnnouncement] = useState(""); // NEW

  // Create announcement when annotation changes
  useEffect(() => {
    if (annotation) {
      setAnnouncement(
        `${annotation.word}: ${annotation.vowelFamily} vowel family, ` +
        `${annotation.phonemes.length} phonemes, ` +
        `rhyme key ${annotation.rhymeKey}`
      );
    } else {
      setAnnouncement("");
    }
  }, [annotation]);

  return (
    <section className="readPage">
      {/* Live region for screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* ... rest of component ... */}

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
```

#### 2.2 Navigation ARIA

```javascript
// src/components/Navigation/Navigation.jsx - Updated

export default function Navigation() {
  const location = useLocation();
  const activeSection = location.pathname.replace("/", "") || "watch";
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For mobile

  return (
    <nav className="nav" aria-label="Primary navigation">
      <div className="container navInner">
        <NavLink to="/watch" className="navBrand" aria-label="Scholomance Home">
          <span className="sigil" aria-hidden="true" />
          SCHOLOMANCE
        </NavLink>

        {/* Mobile menu button */}
        <button
          className="nav-menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="nav-links"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="hamburger" />
        </button>

        <div 
          id="nav-links"
          className={`navLinks ${isMenuOpen ? 'navLinksOpen' : ''}`}
          role="navigation"
          aria-label="Primary"
        >
          {LINKS.map((l) => (
            <div key={l.id} style={{ position: "relative" }}>
              <NavLink
                to={l.path}
                className={({ isActive }) =>
                  `navLink ${isActive ? "navLinkActive" : ""}`
                }
                aria-current={isActive ? "page" : undefined}
              >
                {l.label}
              </NavLink>
              {/* ... existing pill ... */}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

#### 2.3 School Selection ARIA

```javascript
// src/pages/Listen/ListenPage.jsx - Updated

export default function ListenPage() {
  const [isTuning, setIsTuning] = useState(false);
  const [lastTunedSchool, setLastTunedSchool] = useState(""); // NEW

  const handleTune = async (targetSchool, songKey) => {
    if (isTuning) return;
    
    // Check if locked
    if (!checkUnlocked?.(targetSchool)) {
      // Announce to screen reader
      return;
    }
    
    setIsTuning(true);
    setCurrentKey(songKey);
    setLastTunedSchool(targetSchool);
    
    // ... existing animation ...
    
    setIsTuning(false);
  };

  return (
    <section className="listenPage">
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

      {/* ... rest of component ... */}
    </section>
  );
}
```

---

### P3: Enhanced - Color & Contrast

#### 3.1 Contrast-Aware School Colors

```javascript
// src/data/library.js - Updated with contrast values

export const COLORS = {
  VOID: { hex: "#a1a1aa", onBackground: "#000000" },
  PSYCHIC: { hex: "#00E5FF", onBackground: "#000000" },
  ALCHEMY: { hex: "#D500F9", onBackground: "#ffffff" },
  WILL: { hex: "#FF8A00", onBackground: "#000000" },
  SONIC: { hex: "#651FFF", onBackground: "#ffffff" },
};

// Helper to get appropriate text color
export function getContrastColor(hexColor) {
  const colors = COLORS[hexColor.replace('#', '')];
  return colors?.onBackground || "#000000";
}
```

#### 3.2 CSS Custom Properties for High Contrast

```css
/* index.css - Add high contrast support */

@media (prefers-contrast: more) {
  :root {
    --text: #ffffff;
    --muted: #e0e0e0;
    --stroke: rgba(255, 255, 255, 0.5);
    --stroke-soft: rgba(255, 255, 255, 0.3);
  }

  .badge {
    border-width: 2px;
  }

  .button {
    border-width: 2px;
    font-weight: 600;
  }

  .navLink {
    font-weight: 600;
  }
}

/* Forced colors mode (Windows High Contrast) */
@media (forced-colors: active) {
  .badge {
    border: 2px solid ButtonText;
  }
  
  .navLinkActive {
    background: Highlight;
    color: HighlightText;
  }
  
  .crt-led {
    background: HighlightText;
    forced-color-adjust: none;
  }
}
```

---

### P4: Animation Control

#### 4.1 Enhanced Reduced Motion

```css
/* index.css - Enhanced reduced motion */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  body::before {
    animation: none;
  }

  body::after {
    display: none;
  }

  .aurora-drift,
  .candle-flicker,
  .gold-shimmer,
  .spinning,
  .led-pulse,
  .nixie-digit {
    animation: none;
  }

  /* Remove page transitions */
  main {
    transition: none !important;
  }

  /* Keep focus animations */
  :focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }
}

/* Pause animations on demand (user preference) */
.animation-paused *,
.animation-paused *::before,
.animation-paused *::after {
  animation-play-state: paused !important;
}
```

#### 4.2 JavaScript Motion Check

```javascript
// src/hooks/usePrefersReducedMotion.js

import { useState, useEffect } from "react";

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// Usage in components
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export default function SomeComponent() {
  const reducedMotion = usePrefersReducedMotion();
  
  const animationProps = reducedMotion
    ? { initial: false, animate: false }
    : { initial: { opacity: 0 }, animate: { opacity: 1 } };
}
```

---

### P5: Testing & Validation

#### 5.1 Accessibility Testing Setup

```javascript
// tests/accessibility.test.js

import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Accessibility", () => {
  describe("GrimoireScroll", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <GrimoireScroll
          text="The quick brown fox"
          onWordClick={() => {}}
          isEngineReady={true}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible button elements", () => {
      render(
        <GrimoireScroll
          text="hello world"
          onWordClick={() => {}}
          isEngineReady={true}
        />
      );
      
      const wordButtons = screen.getAllByRole("button");
      expect(wordButtons.length).toBeGreaterThan(0);
      
      wordButtons.forEach(button => {
        expect(button).toHaveAttribute("aria-label");
      });
    });
  });

  describe("ScrollEditor", () => {
    it("should have labeled form elements", async () => {
      const { container } = render(
        <ScrollEditor onSave={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should connect label to input", () => {
      render(
        <ScrollEditor onSave={() => {}} />
      );
      
      const titleInput = screen.getByLabelText(/scroll title/i);
      const contentTextarea = screen.getByLabelText(/scroll content/i);
      
      expect(titleInput).toBeInTheDocument();
      expect(contentTextarea).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should have proper ARIA attributes", () => {
      render(<Navigation />);
      
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Primary navigation");
      
      const links = screen.getAllByRole("link");
      expect(links.length).toBe(3);
    });
  });
});
```

#### 5.2 ESLint Accessibility Rules

```javascript
// .eslintrc.json - Add jsx-a11y plugin

{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"  // ADD THIS
  ],
  "plugins": [
    "react",
    "react-hooks",
    "jsx-a11y"
  ],
  "rules": {
    "jsx-a11y/anchor-is-valid": "warn",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "warn",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/aria-props": "error"
  }
}
```

---

## Implementation Priority Summary

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| P0 | Skip link | 1hr | High |
| P0 | Keyboard nav for GrimoireScroll | 2hr | High |
| P0 | Keyboard nav for BrassGearDial | 1hr | High |
| P1 | Form labels (ScrollEditor) | 1hr | High |
| P2 | Live regions (announcements) | 2hr | Medium |
| P2 | Navigation ARIA | 1hr | Medium |
| P3 | High contrast mode | 2hr | Medium |
| P3 | Color contrast fixes | 4hr | Medium |
| P4 | Enhanced reduced motion | 2hr | Medium |
| P5 | Jest-axe testing | 2hr | High |
| P5 | ESLint jsx-a11y | 30min | High |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Skip link, sr-only, high contrast, reduced motion |
| `src/App.jsx` | Skip link anchor |
| `src/pages/Read/GrimoireScroll.jsx` | Keyboard nav, ARIA labels |
| `src/pages/Read/ScrollEditor.jsx` | Form labels, ARIA |
| `src/pages/Listen/BrassGearDial.jsx` | Keyboard nav, ARIA slider |
| `src/pages/Listen/ListenPage.jsx` | Live regions |
| `src/components/Navigation/Navigation.jsx` | ARIA attributes |
| `.eslintrc.json` | jsx-a11y plugin |
| `package.json` | jest-axe dependency |

---

## WCAG 2.1 AA Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.1.1 Non-text Content | ⚠️ Partial | Need alt text audit |
| 1.3.1 Info and Relationships | ✅ Good | Semantic HTML |
| 1.4.3 Contrast (Minimum) | ⚠️ Check | Some school colors |
| 1.4.4 Resize Text | ✅ Good | Uses clamp() |
| 2.1.1 Keyboard | ⚠️ Partial | Need keyboard nav |
| 2.1.2 No Keyboard Trap | ✅ Good | Standard navigation |
| 2.4.1 Bypass Blocks | ❌ Missing | Skip link needed |
| 2.4.3 Focus Order | ✅ Good | Logical DOM order |
| 2.4.4 Link Purpose | ✅ Good | Clear link text |
| 2.4.7 Focus Visible | ✅ Good | `:focus-visible` styles |
| 3.1.1 Language of Page | ✅ Good | `lang="en"` in HTML |
| 3.2.1 On Focus | ✅ Good | No unexpected behavior |
| 3.3.2 Labels or Instructions | ⚠️ Partial | Form labels needed |
| 4.1.1 Parsing | ✅ Good | Valid HTML |
| 4.1.2 Name, Role, Value | ⚠️ Partial | ARIA improvements |

---

## Conclusion

This accessibility upgrade plan addresses critical issues while maintaining the thematic aesthetic of Scholomance. The changes are:

1. **Non-invasive** - CSS additions don't affect visual design
2. **Progressive** - Enhances experience without breaking existing functionality  
3. **Testable** - Jest-axe integration catches regressions
4. **Standards-compliant** - Follows WCAG 2.1 AA guidelines

Total estimated effort: **18-20 hours** for full implementation.

