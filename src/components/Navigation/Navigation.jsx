import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { LINKS } from "../../data/library";

export default function Navigation() {
  const location = useLocation();
  const activeSection = location.pathname.replace("/", "") || "watch";
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For mobile

  return (
    <nav className="fixed top-0 left-0 w-full z-100 glass" aria-label="Primary navigation">
      <div className="container flex items-center justify-between h-20">
        <NavLink to="/watch" className="font-bold tracking-tight text-xl" aria-label="Scholomance Home">
          SCHOLOMANCE
        </NavLink>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          aria-expanded={isMenuOpen}
          aria-controls="nav-links"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-6 h-0.5 bg-white mb-1" />
          <div className="w-6 h-0.5 bg-white mb-1" />
          <div className="w-6 h-0.5 bg-white" />
        </button>

        <div 
          id="nav-links"
          className={`flex gap-8 items-center ${isMenuOpen ? 'flex-col absolute top-20 left-0 w-full p-8 glass-strong' : 'hidden md:flex'}`}
          role="navigation"
          aria-label="Primary"
        >
          {LINKS.map((l) => (
            <div key={l.id} className="relative">
              <NavLink
                to={l.path}
                className={({ isActive }) =>
                  `font-mono text-xs uppercase tracking-wide transition-colors ${isActive ? "text-primary" : "text-muted hover:text-secondary"}`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                {l.label}
              </NavLink>
              {activeSection === l.id && (
                <motion.div
                  layoutId="nav-highlight"
                  className="absolute -bottom-2 left-0 w-full h-0.5 bg-white"
                  style={{ backgroundColor: 'var(--school-sonic)' }}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
