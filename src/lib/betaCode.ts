import betaCodeToUnicode from "./beta-code-json/beta_code_to_unicode.json";
import unicodeToBetaCode from "./beta-code-json/unicode_to_beta_code.json";

function longestKeyLength(obj: any) {
  const keys = Object.keys(obj);
  let key: string;
  let length = 0;

  for (let ii = 0; ii < keys.length; ii += 1) {
    key = keys[ii];

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key.length > length) {
        length = key.length;
      }
    }
  }

  return length;
}

// this function replaces σ with ς when:
//   - at the end of a line
//   - followed by whitespace
//   - followed by a punctuation character
// REGEX NOTE: word boundary \b doesn't work well with Unicode
function sigmaToEndOfWordSigma(string: string) {
  return string.replace(/σ(?=[,.:;·\s]|$)/g, "ς");
}

function normalize(string: string) {
  if (string.normalize) {
    return string.normalize();
  }

  return string;
}

function mergeObjects(obj1: any, obj2: any) {
  return { ...obj1, ...obj2 };
}

export function greekToBetaCode(greek: any, customMap?: any) {
  const greekCharacters = normalize(greek).split("");
  const betaCodeCharacters = [];
  const map = mergeObjects(unicodeToBetaCode, customMap || {});
  let currentCharacter: string;

  for (let ii = 0; ii < greekCharacters.length; ii += 1) {
    currentCharacter = greekCharacters[ii];

    if (Object.prototype.hasOwnProperty.call(map, currentCharacter)) {
      betaCodeCharacters.push(map[currentCharacter]);
    } else {
      betaCodeCharacters.push(currentCharacter);
    }
  }

  return betaCodeCharacters.join("");
}

export function betaCodeToGreek(betaCode: string, customMap?: any) {
  const betaCodeCharacters = normalize(betaCode).split("");
  const greekCharacters = [];
  const map = mergeObjects(betaCodeToUnicode, customMap || {});
  const maxBetaCodeCharacterLength = longestKeyLength(map);
  let start = 0;
  let slice: string;
  let newStart: number;
  let currentCharacter: string;
  let maxLength: number;

  while (start <= betaCodeCharacters.length) {
    currentCharacter = betaCodeCharacters[start];
    newStart = start + 1;
    maxLength = Math.min(
      betaCodeCharacters.length,
      start + maxBetaCodeCharacterLength,
    );

    // match the longest possible substring that's valid Beta Code, from left to right
    // for example 'e)' is valid Beta Code (ἐ) but 'e)/' is also valid Beta Code (ἕ)
    // the string 'e)/' should be interpreted as 'e)/' and not as 'e)' + '/'
    for (let end = newStart; end <= maxLength; end++) {
      slice = betaCodeCharacters.slice(start, end).join("");

      if (Object.prototype.hasOwnProperty.call(map, slice)) {
        currentCharacter = map[slice];
        newStart = end;
      }
    }

    greekCharacters.push(currentCharacter);
    start = newStart;
  }

  return sigmaToEndOfWordSigma(greekCharacters.join(""));
}
