function normalizeGreek(s: string) {
  if (!s) {
    return "";
  }
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents/breathings
    .replace(/ς/g, "σ")
    .trim();
}

/* -------------------------
   Full table of target endings
   All endings normalized (no diacritics)
   ------------------------- */
const ENDING_TABLE = (function build() {
  const R = (
    group: string,
    subtype: string,
    ending: string,
    features: object,
    notes?: object,
  ) => ({
    group,
    subtype,
    ending: normalizeGreek(ending),
    features,
    notes: notes || "",
  });

  const table = [];

  // ---------- PARTICIPLES: present active (full cases/numbers/genders) ----------
  // Masculine (sing/pl)
  table.push(
    R("participle", "pres act (masc)", "ων", {
      case: "nom",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres act (masc)", "οντος", {
      case: "gen",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres act (masc)", "οντι", {
      case: "dat",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres act (masc)", "οντα", {
      case: "acc",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres act (masc)", "οντες", {
      case: "nom",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres act (masc)", "οντων", {
      case: "gen",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres act (masc)", "ουσιν", {
      case: "dat",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres act (masc)", "οντας", {
      case: "acc",
      num: "pl",
      gender: "masc",
    }),
  );

  // Feminine
  table.push(
    R("participle", "pres act (fem)", "ουσα", {
      case: "nom",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres act (fem)", "ουσης", {
      case: "gen",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres act (fem)", "ουση", {
      case: "dat",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres act (fem)", "ουσαν", {
      case: "acc",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres act (fem)", "ουσαι", {
      case: "nom",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres act (fem)", "ουσων", {
      case: "gen",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres act (fem)", "ουσαις", {
      case: "dat",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres act (fem)", "ουσας", {
      case: "acc",
      num: "pl",
      gender: "fem",
    }),
  );

  // Neuter
  table.push(
    R("participle", "pres act (neut)", "ον", {
      case: "nom/acc",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres act (neut)", "οντος", {
      case: "gen",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres act (neut)", "οντι", {
      case: "dat",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres act (neut)", "οντα", {
      case: "nom/acc",
      num: "pl",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres act (neut)", "οντων", {
      case: "gen",
      num: "pl",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres act (neut)", "ουσιν", {
      case: "dat",
      num: "pl",
      gender: "neut",
    }),
  );

  // ---------- PRESENT MIDDLE/PASSIVE participles ----------
  table.push(
    R("participle", "pres mp (masc)", "ομενος", {
      case: "nom",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres mp (masc)", "ομενου", {
      case: "gen",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres mp (masc)", "ομενω", {
      case: "dat",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres mp (masc)", "ομενον", {
      case: "acc",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres mp (masc)", "ομενοι", {
      case: "nom",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres mp (masc)", "ομενων", {
      case: "gen",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres mp (masc)", "ομενοις", {
      case: "dat",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "pres mp (masc)", "ομενους", {
      case: "acc",
      num: "pl",
      gender: "masc",
    }),
  );

  table.push(
    R("participle", "pres mp (fem)", "ομενη", {
      case: "nom",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres mp (fem)", "ομενης", {
      case: "gen",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres mp (fem)", "ομενην", {
      case: "acc",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres mp (fem)", "ομεναι", {
      case: "nom",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres mp (fem)", "ομενων", {
      case: "gen",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres mp (fem)", "ομεναις", {
      case: "dat",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "pres mp (fem)", "ομενας", {
      case: "acc",
      num: "pl",
      gender: "fem",
    }),
  );

  table.push(
    R("participle", "pres mp (neut)", "ομενον", {
      case: "nom/acc",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres mp (neut)", "ομενου", {
      case: "gen",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres mp (neut)", "ομενω", {
      case: "dat",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres mp (neut)", "ομενα", {
      case: "nom/acc",
      num: "pl",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres mp (neut)", "ομενων", {
      case: "gen",
      num: "pl",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "pres mp (neut)", "ομενοις", {
      case: "dat",
      num: "pl",
      gender: "neut",
    }),
  );

  // ---------- AORIST ACTIVE participles (1st aorist -σα-) ----------
  table.push(
    R("participle", "aor act (masc)", "σας", {
      case: "nom",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor act (masc)", "σαντος", {
      case: "gen",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor act (masc)", "σαντι", {
      case: "dat",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor act (masc)", "σαντα", {
      case: "acc",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor act (masc)", "σαντες", {
      case: "nom",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor act (masc)", "σαντων", {
      case: "gen",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor act (masc)", "σασιν", {
      case: "dat",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor act (masc)", "σαντας", {
      case: "acc",
      num: "pl",
      gender: "masc",
    }),
  );

  // feminine/plural/neuter aorist active
  table.push(
    R("participle", "aor act (fem)", "σασα", {
      case: "nom",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor act (fem)", "σασας", {
      case: "gen",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor act (fem)", "σασαν", {
      case: "acc",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor act (fem)", "σασαι", {
      case: "nom",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor act (fem)", "σασων", {
      case: "gen",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor act (fem)", "σασαις", {
      case: "dat",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor act (fem)", "σασας", {
      case: "acc",
      num: "pl",
      gender: "fem",
    }),
  );

  table.push(
    R("participle", "aor act (neut)", "σαν", {
      case: "nom/acc",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "aor act (neut)", "σαντα", {
      case: "nom/acc",
      num: "pl",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "aor act (neut)", "σαντων", {
      case: "gen",
      num: "pl",
      gender: "neut",
    }),
  );

  // ---------- AORIST MIDDLE participles (-σαμενος) ----------
  table.push(
    R("participle", "aor mid (masc)", "σαμενος", {
      case: "nom",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor mid (masc)", "σαμενου", {
      case: "gen",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor mid (masc)", "σαμενον", {
      case: "acc",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor mid (masc)", "σαμενοι", {
      case: "nom",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor mid (masc)", "σαμενων", {
      case: "gen",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor mid (masc)", "σαμενους", {
      case: "acc",
      num: "pl",
      gender: "masc",
    }),
  );

  table.push(
    R("participle", "aor mid (fem)", "σαμενη", {
      case: "nom",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor mid (fem)", "σαμενην", {
      case: "acc",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor mid (fem)", "σαμεναι", {
      case: "nom",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor mid (neut)", "σαμενον", {
      case: "nom/acc",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "aor mid (neut)", "σαμενα", {
      case: "nom/acc",
      num: "pl",
      gender: "neut",
    }),
  );

  // ---------- AORIST PASSIVE participles (θ- stems) ----------
  table.push(
    R("participle", "aor pass (masc)", "θεισας", {
      case: "nom",
      num: "sg",
      gender: "masc",
      notes: "alt θεις/θεισας forms",
    }),
  );
  table.push(
    R("participle", "aor pass (masc)", "θεισης", {
      case: "gen",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor pass (masc)", "θεντος", {
      case: "gen",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor pass (masc)", "θεισα", {
      case: "nom",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "aor pass (neut)", "θεν", {
      case: "nom/acc",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "aor pass (pl)", "θεντες", {
      case: "nom",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "aor pass (pl)", "θεντων", {
      case: "gen",
      num: "pl",
      gender: "all",
    }),
  );
  table.push(
    R("participle", "aor pass (pl)", "θεντα", {
      case: "acc",
      num: "pl",
      gender: "neut",
    }),
  );

  // ---------- PERFECT ACTIVE participles ----------
  // masc
  table.push(
    R("participle", "perf act (masc)", "κως", {
      case: "nom",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "perf act (masc)", "κοτος", {
      case: "gen",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "perf act (masc)", "κοτα", {
      case: "acc",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "perf act (masc)", "κοτες", {
      case: "nom",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "perf act (masc)", "κοτων", {
      case: "gen",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("participle", "perf act (neut)", "κος", {
      case: "nom/acc",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "perf act (neut)", "κοτα", {
      case: "nom/acc",
      num: "pl",
      gender: "neut",
    }),
  );
  table.push(
    R("participle", "perf act (fem)", "κυια", {
      case: "nom",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("participle", "perf act (fem)", "κυιαι", {
      case: "nom",
      num: "pl",
      gender: "fem",
    }),
  );

  // ---------- NOUNS (1st & 2nd decl) + articles (simplified endings for matching) ----------
  // first declension endings
  table.push(
    R("article", "def", "ο", { case: "nom", num: "sg", gender: "masc" }),
  );
  table.push(
    R("article", "def", "οι", { case: "nom", num: "pl", gender: "masc" }),
  );
  table.push(
    R("article", "def", "η", { case: "nom", num: "sg", gender: "fem" }),
  );
  table.push(
    R("article", "def", "αι", { case: "nom", num: "pl", gender: "fem" }),
  );
  table.push(
    R("article", "def", "το", {
      case: "nom/acc",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("article", "def", "τοις", {
      case: "dat",
      num: "pl",
      gender: "masc/neut",
    }),
  );
  table.push(
    R("article", "def", "ταις", {
      case: "dat",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(
    R("article", "def", "των", {
      case: "gen",
      num: "pl",
      gender: "masc/fem/neut",
    }),
  );
  table.push(
    R("article", "def", "τον", { case: "acc", num: "sg", gender: "masc" }),
  );
  table.push(
    R("article", "def", "την", { case: "acc", num: "sg", gender: "fem" }),
  );
  // Noun
  table.push(
    R("noun", "2nd decl", "ος", {
      case: "nom",
      num: "sg",
      gender: "masc",
    }),
  );
  table.push(
    R("noun", "2nd decl", "ος_neut", {
      case: "nom",
      num: "sg",
      gender: "neut",
    }),
  );
  table.push(
    R("noun", "2nd decl", "οι", {
      case: "nom",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("noun", "2nd decl", "α", {
      case: "nom/acc",
      num: "pl",
      gender: "neut",
    }),
  );
  table.push(
    R("noun", "2nd decl", "ους", {
      case: "acc",
      num: "pl",
      gender: "masc",
    }),
  );
  table.push(
    R("noun", "2nd decl", "ου", {
      case: "gen",
      num: "sg",
      gender: "all",
    }),
  );
  table.push(
    R("noun", "2nd decl", "ῳ", { case: "dat", num: "sg", gender: "all" }),
  );
  table.push(
    R("noun", "1st decl", "η", { case: "nom", num: "sg", gender: "fem" }),
  );
  table.push(
    R("noun", "1st decl", "ης", {
      case: "gen",
      num: "sg",
      gender: "fem",
    }),
  );
  table.push(
    R("noun", "1st decl", "αις", {
      case: "dat",
      num: "pl",
      gender: "fem",
    }),
  );
  table.push(R("noun", "3rd decl cue", "σιν", { case: "dat", num: "pl" }));
  table.push(R("noun", "3rd decl cue", "ων", { case: "gen", num: "pl" }));

  // ---------- VERB PERSONAL/IMPERATIVE markers ----------
  table.push(R("verb", "pers.act.1sg", "ω", { person: "1", num: "sg" }));
  table.push(R("verb", "pers.act.2sg", "εις", { person: "2", num: "sg" }));
  table.push(R("verb", "pers.act.3sg", "ει", { person: "3", num: "sg" }));
  table.push(R("verb", "pers.act.1pl", "ομεν", { person: "1", num: "pl" }));
  table.push(R("verb", "pers.act.2pl", "ετε", { person: "2", num: "pl" }));
  table.push(R("verb", "pers.act.3pl", "ουσιν", { person: "3", num: "pl" }));
  table.push(
    R("verb", "pres.mp.1sg", "ομαι", {
      person: "1",
      num: "sg",
      voice: "mid/pass",
    }),
  );
  table.push(
    R("verb", "pres.mp.2sg", "ῃ", {
      person: "2",
      num: "sg",
      voice: "mid/pass",
    }),
  );
  table.push(
    R("verb", "imper.pres.act.2sg", "ε", {
      person: "2",
      num: "sg",
      mood: "imperative",
    }),
  );
  table.push(
    R("verb", "imper.pres.act.2pl", "ετε", {
      person: "2",
      num: "pl",
      mood: "imperative",
    }),
  );
  table.push(
    R("verb", "imper.aor.act.2pl", "σατε", {
      person: "2",
      num: "pl",
      mood: "imperative",
    }),
  );
  table.push(
    R("verb", "imper.aor.act.2sg", "σον", {
      person: "2",
      num: "sg",
      mood: "imperative",
    }),
  );

  // aorist passive hallmark (θ)
  table.push(
    R("verb", "aor.pass.hallmark", "θη", {
      note: "aorist passive formative often appears as -θη- or -θε- in forms",
    }),
  );

  // aorist active hallmark (σ)
  table.push(
    R("verb", "aor.act.hallmark", "σα", {
      note: "1st aorist active formative often shows -σα- before endings",
    }),
  );

  // reduplication pattern indicator (consonant + e + same consonant)
  table.push(
    R("heuristic", "redup.pattern", "ce c", {
      note: "this is a template used in detection; not an actual ending",
    }),
  );

  return table.sort((a, b) => b.ending.length - a.ending.length);
})();

/* -------------------------
   Stem-change detectors (heuristic)
   ------------------------- */
function detectAugment(wordNorm: string) {
  // common augment forms: initial "ε" or "η" before verb stem (very simplified)
  if (!wordNorm) return false;
  // treat words that start with ε + consonant + vowel etc and are longer than 3 letters
  return (
    /^[εη][^aeiouϊϋὑὠ]/.test(wordNorm) ||
    (/^ε/.test(wordNorm) && wordNorm.length > 3)
  );
}
function detectReduplication(raw: string) {
  // Simplified: check for pattern C + e + same C at the start (e.g., "λελυ-": l e l)
  const s = normalizeGreek(raw);
  if (s.length < 3) return false;
  const c0 = s[0],
    c1 = s[1],
    c2 = s[2];
  // vowel letters to skip (simpler set)
  const vowels = ["α", "ε", "η", "ι", "ο", "υ", "ω", "ϊ", "ϋ"];
  if (!vowels.includes(c1) && c0 === c2 && !vowels.includes(c0)) {
    // pattern consonant-vowel-consonant
    // require the vowel to be 'ε' usually for classical reduplication, but allow others as heuristic
    return c1 === "ε" || c1 === "η" || c1 === "ι";
  }
  return false;
}
function detectTenseFormatives(wordNorm: string) {
  const cues = { aorAct: false, aorPass: false, perfRedup: false };
  if (!wordNorm) return cues;
  if (wordNorm.includes("σα")) cues.aorAct = true; // -σα- often marks 1st aorist active
  if (wordNorm.includes("θη") || wordNorm.includes("θε")) cues.aorPass = true; // -θη-/-θε- aorist passive
  // basic perfect cue: reduplication or κ present near stem (very rough)
  if (detectReduplication(wordNorm) || /κω|λυκ|γεγ/.test(wordNorm))
    cues.perfRedup = true;
  return cues;
}

/* -------------------------
   Core analyzer: endings-first with extra stem cues
   ------------------------- */
export function analyzeWord(raw: string) {
  const orig = raw || "";
  const word = normalizeGreek(orig);
  if (!word) return { orig, normalized: word, matches: [], cues: {} };

  // Search for endings: prefer longer endings
  const matches = [];
  for (const row of ENDING_TABLE) {
    if (row.ending === "ce c") continue; // skip template marker
    if (row.ending && word.endsWith(row.ending)) {
      // create a copy and attach a score
      matches.push(Object.assign({ score: row.ending.length }, row));
    }
  }

  // Rank heuristically: participles and articles higher than generic noun cues
  matches.sort((a, b) => {
    const groupWeight = (g: string) => {
      if (g === "participle") return 6;
      if (g === "article") return 5;
      if (g === "verb") return 4;
      if (g === "noun") return 3;
      if (g === "heuristic") return 1;
      return 2;
    };
    const wa = groupWeight(a.group) + a.score / 10;
    const wb = groupWeight(b.group) + b.score / 10;
    return wb - wa;
  });

  // Get stem-change cues
  const cues: any = detectTenseFormatives(word);
  cues.augment = detectAugment(word);
  cues.reduplication = detectReduplication(orig);

  return { orig, normalized: word, matches, cues };
}
