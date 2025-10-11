import forms from "@/assets/forms.json";
import lexemes from "@/assets/lexemes.json";
import { flatten, normalizeGreek } from "@/lib/helpers";

function randomInt(num: number) {
  return Math.floor(Math.random() * num);
}

export async function getLexemes(query: string) {
  const lemma = Object.keys(lexemes).find((k) => k === query);
  if (lemma) {
    return lexemes[lemma];
  }
  return Object.keys(lexemes).find(
    (k) => normalizeGreek(k) === normalizeGreek(query),
  );
}

export async function getForms(query: string) {
  const res = [];
  query = query.replace(/[;:,.]/g, "");
  const nuy = `${
    query[query.length - 1] === "ν" ? query.slice(0, query.length - 1) : query
  }(ν)`;

  for (const [key, value] of Object.entries(forms)) {
    const flatObj = flatten(value);
    if (
      Object.values(flatObj).find(
        (v: string) =>
          normalizeGreek(v) === normalizeGreek(query) ||
          normalizeGreek(v) === normalizeGreek(nuy),
      )
    ) {
      res.push({
        lemma: key,
        forms: Object.fromEntries(
          Object.entries(flatObj).map(([k, v]) => {
            let newKey = k.replace("forms[0].form", "");
            if (newKey === "") {
              newKey = lexemes[key]["dodson-pos"];
            }
            return [newKey, v as string];
          }),
        ),
      });
    }
  }

  return res;
}

export function randomLex() {
  const lemmas = Object.keys(lexemes);
  const lemma = lemmas[randomInt(lemmas.length)];
  return { lemma, lex: lexemes[lemma] };
}
