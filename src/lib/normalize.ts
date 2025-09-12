export default function normalizeGreek(s: string) {
  if (!s) {
    return "";
  }
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents/breathings
    .replace(/,\./g, "")
    .trim();
}
