/**
 * Romanizes a Koine Greek word according to a common academic standard.
 * - Handles diphthongs and special consonant combinations (e.g., γγ -> ng).
 * - Transliterates vowels with diacritics (breathings, accents, iota subscripts).
 * - Uses macrons for long vowels (η -> ē, ω -> ō).
 * - Converts final sigma (ς) and regular sigma (σ) to 's'.
 *
 * @param {string} greekWord The Koine Greek word to romanize.
 * @returns {string} The romanized (Latin) equivalent.
 */
export function romanizeKoine(greekWord: string) {
  if (!greekWord || typeof greekWord !== "string") {
    return "";
  }

  // A map for multi-character sequences.
  // These are replaced first to avoid ambiguity.
  const combinations = {
    γγ: "ng",
    γκ: "nk",
    γχ: "nch",
    γξ: "nx",
    αυ: "au",
    ευ: "eu",
    ηυ: "ēu",
    ου: "ou",
    αι: "ai",
    ει: "ei",
    οι: "oi",
  };

  // A comprehensive map for single Greek characters, including precomposed
  // forms with diacritics.
  const characters = {
    // Consonants
    β: "b",
    γ: "g",
    δ: "d",
    ζ: "z",
    θ: "th",
    κ: "k",
    λ: "l",
    μ: "m",
    ν: "n",
    ξ: "x",
    π: "p",
    ρ: "r",
    ῥ: "rh",
    σ: "s",
    ς: "s",
    τ: "t",
    φ: "ph",
    χ: "ch",
    ψ: "ps",

    // Vowels (including forms with diacritics)
    // Alpha
    α: "a",
    ά: "a",
    ὰ: "a",
    ᾶ: "a",
    ἀ: "a",
    ἄ: "a",
    ἂ: "a",
    ἆ: "a",
    ἁ: "ha",
    ἅ: "ha",
    ἃ: "ha",
    ἇ: "ha",
    ᾳ: "ai",
    ᾴ: "ai",
    ᾲ: "ai",
    ᾷ: "ai",
    ᾀ: "ai",
    ᾄ: "ai",
    ᾂ: "ai",
    ᾆ: "ai",
    ᾁ: "hai",
    ᾅ: "hai",
    ᾃ: "hai",
    ᾇ: "hai",

    // Epsilon
    ε: "e",
    έ: "e",
    ὲ: "e",
    ἐ: "e",
    ἔ: "e",
    ἒ: "e",
    ἑ: "he",
    ἕ: "he",
    ἓ: "he",

    // Eta
    η: "ē",
    ή: "ē",
    ὴ: "ē",
    ῆ: "ē",
    ἠ: "ē",
    ἤ: "ē",
    ἢ: "ē",
    ἦ: "ē",
    ἡ: "hē",
    ἥ: "hē",
    ἣ: "hē",
    ἧ: "hē",
    ῃ: "ēi",
    ῄ: "ēi",
    ῂ: "ēi",
    ῇ: "ēi",
    ᾐ: "ēi",
    ᾔ: "ēi",
    ᾒ: "ēi",
    ᾖ: "ēi",
    ᾑ: "hēi",
    ᾕ: "hēi",
    ᾓ: "hēi",
    ᾗ: "hēi",

    // Iota
    ι: "i",
    ί: "i",
    ὶ: "i",
    ῖ: "i",
    ἰ: "i",
    ἴ: "i",
    ἶ: "i",
    ἱ: "hi",
    ἵ: "hi",
    ἳ: "hi",
    ἷ: "hi",

    // Omicron
    ο: "o",
    ό: "o",
    ὸ: "o",
    ὀ: "o",
    ὄ: "o",
    ὂ: "o",
    ὁ: "ho",
    ὅ: "ho",
    ὃ: "ho",

    // Upsilon
    υ: "u",
    ύ: "u",
    ὺ: "u",
    ῦ: "u",
    ὐ: "u",
    ὔ: "u",
    ὒ: "u",
    ὖ: "u",
    ὑ: "hu",
    ὕ: "hu",
    ὓ: "hu",
    ὗ: "hu",

    // Omega
    ω: "ō",
    ώ: "ō",
    ὼ: "ō",
    ῶ: "ō",
    ὠ: "ō",
    ὤ: "ō",
    ὢ: "ō",
    ὦ: "ō",
    ὡ: "hō",
    ὥ: "hō",
    ὣ: "hō",
    ὧ: "hō",
    ῳ: "ōi",
    ῴ: "ōi",
    ῲ: "ōi",
    ῷ: "ōi",
    ᾠ: "ōi",
    ᾤ: "ōi",
    ᾢ: "ōi",
    ᾦ: "ōi",
    ᾡ: "hōi",
    ᾥ: "hōi",
    ᾣ: "hōi",
    ᾧ: "hōi",
  };

  let text = greekWord.toLowerCase();

  // Create regex for multi-character combinations and replace them first.
  const multiCharRegex = new RegExp(Object.keys(combinations).join("|"), "g");
  text = text.replace(multiCharRegex, (match) => combinations[match]);

  // Create regex for single characters and replace the rest.
  const singleCharRegex = new RegExp(Object.keys(characters).join("|"), "g");
  text = text.replace(singleCharRegex, (match) => characters[match]);

  return text;
}
