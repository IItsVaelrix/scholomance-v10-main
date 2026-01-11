import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navigation from "./components/Navigation/Navigation.jsx";
import { SongProvider } from "./hooks/useCurrentSong.jsx";
import { PhonemeEngineProvider } from "./hooks/usePhonemeEngine.jsx";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function App() {
  const location = useLocation();
  const activeSection = location.pathname.replace("/", "") || "watch";

  return (
    <PhonemeEngineProvider>
      <SongProvider>
        <Navigation />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className={`page-theme--${activeSection}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </SongProvider>
    </PhonemeEngineProvider>
  );
}
