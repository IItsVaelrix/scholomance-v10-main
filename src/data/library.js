import { SCHOOLS, generateSchoolColor } from "./schools";

// Shared data constants for Scholomance

export const LIBRARY = {
  lexiconic: {
    title: "Sonic Thaumaturgy",
    yt: "9_QmbwbY0tc",
    sc: "https://soundcloud.com/vaelrix/black-box-of-limitless-pills-4",
    school: "SONIC",
  },
  schism: {
    title: "Psychic Schism",
    yt: "3tmd-ClpJxA",
    sc: "https://soundcloud.com/vaelrix/bionic-slavery-1",
    school: "PSYCHIC",
  },
  void: {
    title: "VOID",
    yt: "F2yr6zQwqQk",
    sc: "https://soundcloud.com/vaelrix/solar-ray",
    school: "VOID",
  },
  alchemy: {
    title: "Verbal Alchemy",
    yt: "GtgyCnJcZRw",
    sc: "https://soundcloud.com/vaelrix/vaelrix-verbal-alchemy",
    school: "ALCHEMY",
  },
  will: {
    title: "Willpower Surge",
    yt: "5iIUiYkmkw8",
    sc: "https://on.soundcloud.com/aXSjrTPcfYxzdToj8p",
    school: "WILL",
  },
};

export const LINKS = [
  { id: "watch", path: "/watch", label: "Watch" },
  { id: "listen", path: "/listen", label: "Listen" },
  { id: "read", path: "/read", label: "Read" },
];

// Dynamically generate COLORS from SCHOOLS source of truth
export const COLORS = Object.keys(SCHOOLS).reduce((acc, schoolId) => {
  acc[schoolId] = generateSchoolColor(schoolId);
  return acc;
}, {});

// Dynamically generate ANGLES from SCHOOLS source of truth
export const SCHOOL_ANGLES = Object.values(SCHOOLS).reduce((acc, school) => {
  acc[school.id] = school.angle;
  return acc;
}, {});

export function schoolToBadgeClass(school) {
  return `badge--${String(school || "").toLowerCase()}`;
}
