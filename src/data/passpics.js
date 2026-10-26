// The nine pictures a student's password is made of. A password is four of
// them in order, e.g. "apple-cat-sun-car".
export const PASS_PICS = [
  { id: "apple", pic: "red-apple" },
  { id: "cat", pic: "cat-face" },
  { id: "sun", pic: "sun" },
  { id: "star", pic: "glowing-star" },
  { id: "car", pic: "automobile" },
  { id: "fish", pic: "tropical-fish" },
  { id: "flower", pic: "cherry-blossom" },
  { id: "ball", pic: "soccer-ball" },
  { id: "house", pic: "house" },
];

export const passPic = (id) => PASS_PICS.find((p) => p.id === id)?.pic;

export function randomPass() {
  const a = [];
  for (let i = 0; i < 4; i++) a.push(PASS_PICS[Math.floor(Math.random() * PASS_PICS.length)].id);
  return a.join("-");
}

const RU = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ы: "y", э: "e", ю: "yu", я: "ya" };

// A short login ID from a name: Алина → alina + two digits.
export function suggestId(name) {
  const base = [...name.toLowerCase()]
    .map((c) => (RU[c] ?? (/[a-z]/.test(c) ? c : "")))
    .join("")
    .slice(0, 10);
  return (base.length >= 2 ? base : "kid") + String(Math.floor(Math.random() * 90) + 10);
}
