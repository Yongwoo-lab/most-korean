import { unitA1, unitA2, unitA3, unitA4, unitA5, unitA6 } from "./hangul-units.js";
import { unitB1, unitB2, unitB3, unitB4, unitB5, unitC1 } from "./life-units.js";

const soon = (id, part, ko, ru, icon) => ({ id, part, title: { ko, ru }, icon, soon: true });

export const PARTS = [
  { id: "A", title: { ko: "한글", ru: "Хангыль: буквы и звуки" }, color: "#0F766E", soft: "#E3F2EE" },
  { id: "B", title: { ko: "생활 한국어", ru: "Корейский для школьной жизни" }, color: "#C2410C", soft: "#FFF1E6" },
  { id: "C", title: { ko: "수업 한국어", ru: "Корейский для уроков" }, color: "#3B4A7A", soft: "#E8ECF7" },
];

export const UNITS = [
  unitA1,
  unitA2,
  unitA3,
  unitA4,
  unitA5,
  unitA6,
  soon("A7", "A", "모음 3", "Гласные 3", "Smile"),
  unitB1,
  unitB2,
  unitB3,
  unitB4,
  unitB5,
  soon("B6", "B", "하루 일과", "Мой день", "Clock"),
  soon("B7", "B", "우리 동네", "Мой район", "Bus"),
  soon("B8", "B", "놀이와 운동", "Игры и спорт", "Volleyball"),
  soon("B9", "B", "급식 시간", "Обед в школе", "Utensils"),
  unitC1,
  soon("C2", "C", "수학 말", "Слова математики", "Calculator"),
  soon("C3", "C", "촌락과 도시", "Село и город", "Building2"),
  soon("C4", "C", "과학 낱말", "Слова науки", "Microscope"),
  soon("C5", "C", "서술형 문제 읽기", "Читаем задачи", "FileText"),
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
