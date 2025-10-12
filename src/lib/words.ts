import { getForms, getLexemes, randomLex } from "./data.ts";

export async function parseDict(query: string) {
  const response: any[] = [];
  const nuy = `${
    query[query.length - 1] === "ν" ? query.slice(0, query.length - 1) : query
  }(ν)`;

  let res: string;
  const forms = await getForms(query);

  for (const item of forms) {
    const lex: any = await getLexemes(item.lemma);
    if (lex) {
      res = `<p class="lemma">${lex["dodson-entry"] || lex["mounce-headword"]}: <span class="tr-lang">en</span> ${lex.gloss}</p><ul class="list-disc pl-5">`;
      Object.entries(item.forms).forEach(([key, value]) => {
        if (value === query || value === nuy) {
          res += `<li class="font-medium">${query}: ${key}</li>`;
        }
      });
      res += "</ul>";
      response.push({ content: res, lemma: query });
    }
  }
  return Promise.resolve(response);
}

export function parseWordList(request: string) {
  return [...new Set(request.split(/[;:,.\s]+/))].filter(
    (item) => ![" ", "", "\n"].includes(item),
  );
}

export function parseLemma(request: string) {
  return request.substring(
    request.indexOf(`lemma">`) + 7,
    request.indexOf(`</span>`),
  );
}

export async function parseWordData(lemma: string) {
  const res = await getForms(lemma);
  return { lemma, stats: { rating: [1, 1] }, extras: res[0].forms };
}

function parseDeclension(forms: any, gen: string) {
  let table = `<thead><tr><th class="w-10"></th><th class="w-20">Sg</th><th class="w-20">Pl</th></tr></thead>`;
  let tr = `<tr><td>Nom.</td><td>${forms[`${gen}.NS`]}</td><td>${forms[`${gen}.NP`] || ""}</td><tr>`;
  tr += `<tr><td>Gen.</td><td>${forms[`${gen}.GS`] || ""}</td><td>${forms[`${gen}.GP`] || ""}</td><tr>`;
  tr += `<tr><td>Dat.</td><td>${forms[`${gen}.DS`] || ""}</td><td>${forms[`${gen}.DP`] || ""}</td><tr>`;
  tr += `<tr><td>Acc.</td><td>${forms[`${gen}.AS`] || ""}</td><td>${forms[`${gen}.AP`] || ""}</td><tr>`;
  table += `<tbody>${tr}</tbody>`;
  return table;
}

export async function parseMorph(query: string) {
  const tables = [];
  const lex = await getLexemes(query, 0);
  if (!lex) {
    return;
  }
  const forms = (await getForms(query))[0].forms;
  switch (lex["dodson-pos"]) {
    case "N:M":
      tables.push(
        `<table><caption>Masc</caption>${parseDeclension(forms, "M")}</table>`,
      );
      break;

    case "N:F":
      tables.push(
        `<table><caption>Fem</caption>${parseDeclension(forms, "F")}</table>`,
      );
      break;

    case "N:N":
      tables.push(
        `<table><caption>Neut</caption>${parseDeclension(forms, "N")}</table>`,
      );
      break;

    default:
      break;
  }
  return tables as string[];
}

function shuffle(arr: any[]) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomInt(num: number) {
  return Math.floor(Math.random() * num);
}

export async function parseQuiz(nQuest: number, words: any[]) {
  if (words.length === 0) {
    return;
  }

  const wordPool = words
    .map((w) => {
      const calc =
        11 - Math.floor((w.stats.rating[0] / w.stats.rating[1] || 1) * 10);
      return Array.from({ length: calc }, () => w);
    })
    .flat();
  const questions = [];
  const qTypes = ["Declension", "ToGreek", "FromGreek"];
  let question: string = "";
  let answer: string[];
  let choices = [];

  const limitGeneration = 100000;
  let i = 0;
  let j = 0;
  while (i < nQuest && j < limitGeneration) {
    const word = wordPool[randomInt(wordPool.length)];
    const lex: any = await getLexemes(word.lemma, 0);
    const pick = { ...word, lex };
    const pool = Object.keys(pick.extras);
    const gramm = pool[randomInt(pool.length)];
    j++;
    switch (qTypes[randomInt(qTypes.length)]) {
      case "ToGreek":
        if (!lex.gloss) {
          continue;
        }
        question = `<p>What is Koine word for <strong>${lex.gloss}</strong>?</p>`;
        if (questions.find((q) => q.question.includes(question))) {
          continue;
        }
        answer = [pick.lemma];
        break;

      case "FromGreek":
        if (!lex.gloss) {
          continue;
        }
        question = `<p>What does <strong>${pick.lemma}</strong> mean?</p>`;
        if (questions.find((q) => q.question.includes(question))) {
          continue;
        }

        choices = [pick];
        for (let c = 0; c < 3; c++) {
          let ban = randomLex();
          while (!ban.lex.gloss) ban = randomLex();
          choices.push(ban);
        }
        choices = shuffle(choices);
        choices.forEach((choice, index) => {
          question += `<p>${index + 1}. ${choice.lex.gloss}</p>`;
          if (choice.lemma === pick.lemma) {
            answer = [(index + 1).toString()];
          }
        });
        break;

      default:
        // Declension
        question = `<p>What is <span class="gramm"><strong>${gramm}</strong></span> of <strong>${pick.lemma}</strong>?</p>`;
        if (questions.find((q) => q.question.includes(question))) {
          continue;
        }
        answer = pick.extras[gramm];
        break;
    }
    questions.push({ question, answer, lemma: pick.lemma });
    i++;
  }
  return Promise.resolve(questions);
}

export async function parseForm(word: string) {
  const list = await getForms(word);
  const res = [];
  const nuy =
    word.slice(0, word.length - 1) + word[word.length - 1] === "ν"
      ? "(ν)"
      : "ν";

  list.forEach((item) => {
    Object.entries(item.forms).forEach((v) => {
      if (v[1] === word || v[1] === nuy) {
        res.push(`<p>${v[0]}</p>`);
      }
    });
  });
  return res;
}
