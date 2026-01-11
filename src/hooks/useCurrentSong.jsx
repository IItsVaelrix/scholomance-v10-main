import { createContext, useContext, useState, useMemo } from "react";
import { resolveLibrary } from "../data/library";

const SongContext = createContext(null);

export function SongProvider({ children }) {
  const [currentKey, setCurrentKey] = useState("lexiconic");
  const [library] = useState(() => resolveLibrary());

  const value = useMemo(
    () => ({
      currentKey,
      currentSong: library[currentKey] || Object.values(library)[0],
      setCurrentKey: (key) => {
        if (library[key]) setCurrentKey(key);
      },
      library,
    }),
    [currentKey, library]
  );

  return <SongContext.Provider value={value}>{children}</SongContext.Provider>;
}

export function useCurrentSong() {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error("useCurrentSong must be used within SongProvider");
  }
  return context;
}
