import { getWord } from "./dbDict";

import normalizeGreek from "./normalize";

async function analyzeWord(query: string) {
  const result = await getWord(query);

  let text = "";
  const queryG = normalizeGreek(query);

  result.forEach((word: any) => {
    const meaning = word.m || "";

    let start = meaning.indexOf(`<li class="morph-grc-li" k="${queryG}"`);
    let end = meaning.indexOf(`</li>`, start);
    let res = "";
    while (start !== -1) {
      res += meaning.substring(start, end + 5);
      start = meaning.indexOf(`<li class="morph-grc-li" k="${queryG}"`, end);
      end = meaning.indexOf(`</li>`, start);
    }
    res = `<div class="mb-2">${meaning.substring(0, meaning.indexOf("<ul>"))}<ul class="pl-10">${res}</ul></div>`;
    res = res.replace(/k="/g, `data-word="`);
    res = res.replace(
      `"lemma"`,
      `"lemma" data-word="${res.substring(res.indexOf(`"lemma"`) + 8, res.indexOf(`</span>`))}"`,
    );
    text += res;
  });
  return text;
}
export async function requestProcess(request: string) {
  // analyze each word CASE
  let response = "";
  if (request.includes("/sentence")) {
    const _wordSet = [...new Set(request.split(/[,.\s]+/))].filter(
      (item) => ![" ", "", "\n", ["/sentence"]].includes(item),
    );
  } else {
    const wordSet = [...new Set(request.split(/[,.\s]+/))].filter(
      (item) => ![" ", "", "\n"].includes(item),
    );
    const res = [];
    wordSet.forEach(async (word, index) => {
      res[index] = await analyzeWord(word);
    });
    response = res.join("");
  }
  return response;
}
