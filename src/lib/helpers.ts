export function normalizeGreek(s: string) {
  if (!s) {
    return "";
  }
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "") // strip accents/breathings
    .replace(/[;:,.]/g, "")
    .trim();
}

export function flatten(obj: any, prefix: string = "") {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flatten(value, prefixedKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        const arrayKey = `${prefixedKey}[${idx}]`;
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          Object.assign(result, flatten(item, arrayKey));
        } else {
          result[arrayKey] = item;
        }
      });
    } else {
      result[prefixedKey] = value;
    }
  }
  return result;
}
