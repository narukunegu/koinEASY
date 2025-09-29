export interface KeyMapType {
  [key: string]: Array<string> | string;
}

export const diacriticsKey: KeyMapType = {
  "-": "smooth",
  "᾿": "smooth",
  "῾": "rough",
  "~": "circumflex",
  "`": "grave",
  "'": "acute",
  "=": "subscript",
  "^": "circumflex",
};

export const physicalKeyMap: KeyMapType = {
  KeyQ: ["᾿", "q"],
  KeyW: ["ς", "w"],
  KeyE: ["ε", "e"],
  KeyR: ["ρ", "r"],
  KeyT: ["τ", "t"],
  KeyY: ["υ", "y"],
  KeyU: ["θ", "u"],
  KeyI: ["ι", "i"],
  KeyO: ["ο", "o"],
  KeyP: ["π", "p"],
  KeyA: ["α", "a"],
  KeyS: ["σ", "s"],
  KeyD: ["δ", "d"],
  KeyF: ["φ", "f"],
  KeyG: ["γ", "g"],
  KeyH: ["η", "h"],
  KeyJ: ["ξ", "j"],
  KeyK: ["κ", "k"],
  KeyL: ["λ", "l"],
  KeyZ: ["ζ", "z"],
  KeyX: ["χ", "x"],
  KeyC: ["ψ", "c"],
  KeyV: ["ω", "v"],
  KeyB: ["β", "b"],
  KeyN: ["ν", "n"],
  KeyM: ["μ", "m"],
  Space: ["space", " "],
  Enter: ["enter", "\n"],
  Tab: ["tab", "\t"],
  CapsLock: ["caps", "caps"],
  "-": ["-"],
  "'": ["'"],
  "`": ["`"],
  "^": ["^"],
  "=": ["="],
  "~": ["~"],
  "/": ["/"],
};

export interface KeyType {
  value: string;
  shift?: string;
  display?: string;
  special?: boolean;
  flex?: number;
  sub?: string;
  hasDiacritic?: boolean;
  isDiacritic?: boolean;
  isActive?: boolean;
}
