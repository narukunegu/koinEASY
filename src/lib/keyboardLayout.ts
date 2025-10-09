import { ref } from "vue";

export interface KeyType {
  value: string;
  shift?: string;
  display?: string;
  special?: boolean;
  flex?: number;
  isActive?: boolean;
  isDiacritic?: boolean;
}

// --- Keyboard Layout (Koine Greek) ---
export const keyboardLayout = ref<KeyType[][]>([
  // Row 1
  [
    { value: "`", shift: "~" },
    { value: "1", shift: "!" },
    { value: "2", shift: "@" },
    { value: "3", shift: "#" },
    { value: "4", shift: "$" },
    { value: "5", shift: "%" },
    { value: "6", shift: "^" },
    { value: "7", shift: "&" },
    { value: "8", shift: "*" },
    { value: "9", shift: "(", isDiacritic: true },
    { value: "0", shift: ")", isDiacritic: true },
    { value: "-", shift: "_", isDiacritic: true },
    { value: "=", shift: "+", isDiacritic: true },
    { value: "backspace", display: "⌫", special: true, flex: 1.5 },
  ],
  // Row 2
  [
    { value: "tab", display: "⇥", special: true, flex: 1.5 },
    { display: "θ", value: "q", shift: "*q" },
    { display: "ω", value: "w", shift: "*w" },
    { display: "ε", value: "e", shift: "*e" },
    { display: "ρ", value: "r", shift: "*r" },
    { display: "τ", value: "t", shift: "*t" },
    { display: "ψ", value: "y", shift: "*y" },
    { display: "υ", value: "u", shift: "*u" },
    { display: "ι", value: "i", shift: "*i" },
    { display: "ο", value: "o", shift: "*o" },
    { display: "π", value: "p", shift: "*p" },
    { value: "[", shift: "{" },
    { value: "]", shift: "}" },
    { value: "\\", shift: "|", flex: 1.5, isDiacritic: true },
  ],
  // Row 3
  [
    { value: "caps", display: "⇪", special: true, flex: 1.75 },
    { display: "α", value: "a", shift: "*a" },
    { display: "σ", value: "s", shift: "*s" },
    { display: "δ", value: "d", shift: "*d" },
    { display: "φ", value: "f", shift: "*f" },
    { display: "γ", value: "g", shift: "*g" },
    { display: "η", value: "h", shift: "*h" },
    { display: "σ", value: "j", shift: "*j" },
    { display: "κ", value: "k", shift: "*k" },
    { display: "λ", value: "l", shift: "*l" },
    { value: ";", shift: ":" },
    { value: "'", shift: `"` },
    { value: "enter", display: "⏎", special: true, flex: 1.75 },
  ],
  // Row 4
  [
    { value: "shift", display: "⇧", special: true, flex: 2.25 },
    { display: "ζ", value: "z", shift: "*z" },
    { display: "χ", value: "x", shift: "*x" },
    { display: "ξ", value: "c", shift: "*c" },
    { value: "v", shift: "V" },
    { display: "β", value: "b", shift: "*b" },
    { display: "ν", value: "n", shift: "*n" },
    { display: "μ", value: "m", shift: "*m" },
    { value: ",", shift: "<" },
    { value: ".", shift: ">" },
    { value: "/", shift: "?", isDiacritic: true },
    { value: "shift", display: "⇧", special: true, flex: 2.25 },
  ],
  // Row 5
  [
    { value: "space", display: "", special: true, flex: 10 },
    { value: "escape", display: "esc", special: true },
  ],
]);
