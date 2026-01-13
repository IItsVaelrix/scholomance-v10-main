import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navigation from "./components/Navigation/Navigation.jsx";
import { SongProvider } from "./hooks/useCurrentSong.jsx";
import { PhonemeEngineProvider } from "./hooks/usePhonemeEngine.jsx";
import { ProgressionProvider } from "./hooks/useProgression.jsx";
import { injectDynamicStyles } from "./lib/css/schoolStyles.js";
import { useEffect } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function App() {
  const location = useLocation();

  // Inject dynamic school styles on mount
  useEffect(() => {
    injectDynamicStyles();
  }, []);

  return (
    <ProgressionProvider>
      <PhonemeEngineProvider>
        <SongProvider>
          <div className="aurora-background" aria-hidden="true" />
          <div className="vignette" aria-hidden="true" />
          <div className="scanlines" aria-hidden="true" />
          
          <div className="page-container">
            <Navigation />
            <AnimatePresence mode="wait">
              <motion.main
                key={location.pathname}
                id="main-content"
                className="page-content"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>
                <Outlet />
              </motion.main>
            </AnimatePresence>
          </div>
        </SongProvider>
      </PhonemeEngineProvider>
    </ProgressionProvider>
  );
}
