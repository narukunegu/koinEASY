import type { KeyType } from "./keyMap";
import { ref } from "vue";
// --- Keyboard Layout (Koine Greek) ---
export const keyboardLayout = ref<KeyType[][]>([
  // Row 1
  [
    { value: "`", shift: "~", isDiacritic: true },
    { value: "1", shift: "!" },
    { value: "2", shift: "@" },
    { value: "3", shift: "#" },
    { value: "4", shift: "$" },
    { value: "5", shift: "%" },
    { value: "6", shift: "^", isDiacritic: true },
    { value: "7", shift: "&" },
    { value: "8", shift: "*" },
    { value: "9", shift: "(" },
    { value: "0", shift: ")" },
    { value: "-", shift: "_", isDiacritic: true },
    { value: "=", shift: "+", isDiacritic: true },
    { value: "backspace", display: "⌫", special: true, flex: 1.5 },
  ],
  // Row 2
  [
    { value: "tab", display: "⇥", special: true, flex: 1.5 },
    { value: "᾿", shift: "῾", sub: "q", isDiacritic: true },
    { value: "ς", shift: "Σ", sub: "w" },
    { value: "ε", shift: "Ε", sub: "e", hasDiacritic: true },
    { value: "ρ", shift: "Ρ", sub: "r", hasDiacritic: true },
    { value: "τ", shift: "Τ", sub: "t" },
    { value: "υ", shift: "Υ", sub: "y", hasDiacritic: true },
    { value: "θ", shift: "Θ", sub: "u" },
    { value: "ι", shift: "Ι", sub: "i", hasDiacritic: true },
    { value: "ο", shift: "Ο", sub: "o", hasDiacritic: true },
    { value: "π", shift: "Π", sub: "p" },
    { value: "[", shift: "{" },
    { value: "]", shift: "}" },
    { value: "\\", shift: "|", flex: 1.5 },
  ],
  // Row 3
  [
    { value: "caps", display: "⇪", special: true, flex: 1.75 },
    { value: "α", shift: "Α", sub: "a", hasDiacritic: true },
    { value: "σ", shift: "Σ", sub: "s" },
    { value: "δ", shift: "Δ", sub: "d" },
    { value: "φ", shift: "Φ", sub: "f" },
    { value: "γ", shift: "Γ", sub: "g" },
    { value: "η", shift: "Η", sub: "h", hasDiacritic: true },
    { value: "ξ", shift: "Ξ", sub: "j" },
    { value: "κ", shift: "Κ", sub: "k" },
    { value: "λ", shift: "Λ", sub: "l" },
    { value: ";", shift: ":" },
    { value: "'", shift: '"', isDiacritic: true },
    { value: "enter", display: "⏎", special: true, flex: 1.75 },
  ],
  // Row 4
  [
    { value: "shift", display: "⇧", special: true, flex: 2.25 },
    { value: "ζ", shift: "Ζ", sub: "z" },
    { value: "χ", shift: "Χ", sub: "x" },
    { value: "ψ", shift: "Ψ", sub: "c" },
    { value: "ω", shift: "Ω", sub: "v", hasDiacritic: true },
    { value: "β", shift: "Β", sub: "b" },
    { value: "ν", shift: "Ν", sub: "n" },
    { value: "μ", shift: "Μ", sub: "m" },
    { value: ",", shift: "<" },
    { value: ".", shift: ">" },
    { value: "/", shift: "?" },
    { value: "shift", display: "⇧", special: true, flex: 2.25 },
  ],
  // Row 5
  [{ value: "space", display: "", special: true, flex: 10 }],
]);
