import { unitA1, unitA2, unitA3, unitA4, unitA5, unitA6, unitA7 } from "./hangul-units.js";
import { unitB1, unitB2, unitB3, unitB4, unitB5, unitB6, unitB7, unitB8, unitB9, unitC1 } from "./life-units.js";
import { unitC2, unitC3, unitC4, unitC5 } from "./class-units.js";

export const PARTS = [
  { id: "A", title: { ko: "한글", ru: "Хангыль: буквы и звуки" }, color: "#0F766E", dark: "#0A524C", soft: "#E3F2EE" },
  { id: "B", title: { ko: "생활 한국어", ru: "Корейский для школьной жизни" }, color: "#D9541E", dark: "#9A3412", soft: "#FFF1E6" },
  { id: "C", title: { ko: "수업 한국어", ru: "Корейский для уроков" }, color: "#4457A0", dark: "#2B3A72", soft: "#E8ECF7" },
];

export const UNITS = [
  unitA1,
  unitA2,
  unitA3,
  unitA4,
  unitA5,
  unitA6,
  unitA7,
  unitB1,
  unitB2,
  unitB3,
  unitB4,
  unitB5,
  unitB6,
  unitB7,
  unitB8,
  unitB9,
  unitC1,
  unitC2,
  unitC3,
  unitC4,
  unitC5,
];

export function unitById(id) {
  return UNITS.find((u) => u.id === id);
}

// A unit opens when the one before it in the same part is done. The first
// unit of each part is always open, so an older child can jump to school
// phrases while still learning letters.
export function isOpen(unit, profile) {
  if (unit.soon) return false;
  const inPart = UNITS.filter((u) => u.part === unit.part && !u.soon);
  const i = inPart.indexOf(unit);
  if (i <= 0) return true;
  return !!profile?.units?.[inPart[i - 1].id]?.done;
}

export function nextUnit(profile) {
  return UNITS.find((u) => !u.soon && isOpen(u, profile) && !profile?.units?.[u.id]?.done) || UNITS[0];
}
