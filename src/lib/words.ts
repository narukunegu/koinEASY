import { getWord, getWords } from "./dbDict.ts";

import { normalizeGreek } from "./helpers.ts";

export async function analyzeWord(query: string) {
  let response: string[] = [];
  const queryG = normalizeGreek(query);

  await getWords(query).then((result) => {
    result.forEach((word: any) => {
      const meaning = word.m || "";

      let start = meaning.indexOf(`<li class="morph-grc-li" k="${queryG}"`);
      let end = meaning.indexOf(`</li>`, start);
      let res = "";
      let resG = "";
      while (start !== -1) {
        res += meaning
          .substring(start, end + 5)
          .toLowerCase()
          .normalize("NFC")
          .includes(query.toLowerCase().normalize("NFC"))
          ? meaning.substring(start, end + 5)
          : "";
        resG += meaning.substring(start, end + 5);
        start = meaning.indexOf(`<li class="morph-grc-li" k="${queryG}"`, end);
        end = meaning.indexOf(`</li>`, start);
      }
      res = res === "" ? resG : res;
      res = `${meaning.substring(0, meaning.indexOf("<ul"))}<ul class="pl-10">${res}</ul>`;
      response.push(res);
    });

    let filter = response.filter((res) =>
      res
        .toLowerCase()
        .normalize("NFC")
        .includes(query.toLowerCase().normalize("NFC")),
    );
    if (filter.length === 0) {
      filter = response.filter((res) => {
        return normalizeGreek(res.substring(0, res.indexOf("<ul"))).includes(
          queryG,
        );
      });
    }
    response = filter.length > 0 ? filter : response;
  });

  return Promise.resolve(response);
}

export function parseWordList(request: string) {
  return [...new Set(request.split(/[,.\s]+/))].filter(
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
  const word = await getWord(lemma);
  if (!word) {
    return;
  }
  // gramma
  const langEn = `<span class="tr-lang">en</span> <span class="tr-text">`;
  const langFr = `<span class="tr-lang">fr</span> <span class="tr-text">`;
  const langDe = `<span class="tr-lang">de</span> <span class="tr-text">`;

  let meaning: any;
  if (word.m.includes(langEn)) {
    meaning = {
      en: word.m.substring(
        word.m.indexOf(langEn) + langEn.length,
        word.m.indexOf("</span>", word.m.indexOf(langEn) + langEn.length),
      ),
      fr: word.m.substring(
        word.m.indexOf(langFr) + langFr.length,
        word.m.indexOf("</span>", word.m.indexOf(langFr) + langFr.length),
      ),
      de: word.m.substring(
        word.m.indexOf(langDe) + langDe.length,
        word.m.indexOf("</span>", word.m.indexOf(langDe) + langDe.length),
      ),
    };
  }

  const extras = {};
  let start = word.m.indexOf(`<li class="morph-grc-li"`);
  let end = word.m.indexOf(`</li>`, start);
  while (start !== -1) {
    const sub = word.m.substring(start, end + 5);
    const morph = sub.substring(sub.indexOf(">") + 1, sub.indexOf(":"));
    const gramm = sub.substring(
      sub.indexOf(`amm">`) + 5,
      sub.indexOf("</span>"),
    );

    if (extras[gramm]) {
      extras[gramm].push(morph);
    } else {
      extras[gramm] = [morph];
    }
    start = word.m.indexOf(`<li class="morph-grc-li"`, end);
    end = word.m.indexOf(`</li>`, start);
  }
  return {
    lemma,
    meaning,
    extras,
    rating: [0, 0],
  };
}

function parseDeclension(lemma: string, extras: any, arr: string[]) {
  let table = `<thead><tr><th></th><th>N</th><th>V</th><th>G</th><th>D</th><th>A</th></tr></thead>`;
  const sg = arr.filter((s) => s.includes("sg"));
  let nom = sg
    .filter((n) => n.includes("nom"))
    .reduce((a, b) => (a.length < b.length ? a : b));
  let voc = sg
    .filter((n) => n.includes("voc"))
    .reduce((a, b) => (a.length < b.length ? a : b));
  let gen = sg
    .filter((n) => n.includes("gen"))
    .reduce((a, b) => (a.length < b.length ? a : b));
  let dat = sg
    .filter((n) => n.includes("dat"))
    .reduce((a, b) => (a.length < b.length ? a : b));
  let acc = sg
    .filter((n) => n.includes("acc"))
    .reduce((a, b) => (a.length < b.length ? a : b));

  let rNom = extras[nom].join(", ");
  let rVoc = extras[voc].join(", ");
  let rGen = extras[gen].join(", ");
  let rDat = extras[dat].join(", ");
  let rAcc = extras[acc].join(", ");
  let tr = `<tr><td>Sg</td><td>${rNom}</td><td>${rVoc}</td><td>${rGen}</td><td>${rDat}</td><td>${rAcc}</td><tr>`;

  const pl = arr.filter((s) => s.includes("pl"));
  nom = pl
    .filter((n) => n.includes("nom"))
    .reduce((a, b) => (a.length < b.length ? a : b));
  voc = pl
    .filter((n) => n.includes("voc"))
    .reduce((a, b) => (a.length < b.length ? a : b));
  gen = pl
    .filter((n) => n.includes("gen"))
    .reduce((a, b) => (a.length < b.length ? a : b));
  dat = pl
    .filter((n) => n.includes("dat"))
    .reduce((a, b) => (a.length < b.length ? a : b));
  acc = pl
    .filter((n) => n.includes("acc"))
    .reduce((a, b) => (a.length < b.length ? a : b));
  rNom = extras[nom].join(", ");
  rVoc = extras[voc].join(", ");
  rGen = extras[gen].join(", ");
  rDat = extras[dat].join(", ");
  rAcc = extras[acc].join(", ");
  tr += `<tr><td>Pl</td><td>${rNom}</td><td>${rVoc}</td><td>${rGen}</td><td>${rDat}</td><td>${rAcc}</td><tr>`;
  table += `<tbody>${tr}</tbody>`;
  return table;
}

export function parseTableMorph(lemma: string, extras: any) {
  const tables = [];
  const keys = Object.keys(extras);
  const masc = keys.filter((k) => k.includes("masc"));
  if (masc.length) {
    console.error(masc);
    tables.push(
      `<table><caption>Masc</caption>${parseDeclension(lemma, extras, masc)}</table>`,
    );
  }

  const fem = keys.filter((k) => k.includes("fem"));
  if (fem.length) {
    tables.push(
      `<table><caption>Fem</caption>${parseDeclension(lemma, extras, fem)}</table>`,
    );
  }

  const neut = keys.filter((k) => k.includes("neut"));
  if (neut.length) {
    tables.push(
      `<table><caption>Neut</caption>${parseDeclension(lemma, extras, neut)}</table>`,
    );
  }
  return tables as string[];
}

function randomInt(num: number) {
  return Math.floor(Math.random() * num);
}
export async function parseQuiz(nQuest: number, words: any[]) {
  if (words.length === 0) {
    return;
  }
  const grammars = words
    .map((w) => Object.keys(w.extras))
    .flat()
    .filter(
      (g) =>
        ![
          "comp",
          "dual",
          "superl",
          "attic",
          "doric",
          "epic",
          "ionic",
          "aeolic",
        ].reduce((p, c) => {
          return p || g.includes(c);
        }, false),
    );
  const questions = [];
  const qTypes = ["Declension", "ToGreek", "FromGreek"];
  let question: string = "";
  let answer: string[];
  let choices = [];
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  let word: any;
  let gramm: any;
  const poolWords: any[] = words
    .map((w) =>
      Array.from(
        { length: 11 - Math.floor((w.rating[0] / w.rating[1] || 1) * 10) },
        () => w,
      ),
    )
    .flat();
  const possibleChoices = words.filter((w) => w.meaning !== undefined).length;
  const limitGeneration = 100000;
  let i = 0;
  let j = 0;
  while (i < nQuest && j < limitGeneration) {
    switch (qTypes[randomInt(qTypes.length)]) {
      case "ToGreek":
        word = poolWords[randomInt(poolWords.length)];
        if (!word.meaning) {
          j++;
          continue;
        }
        question = `<p>What is Koine word for <strong>${word.meaning.en} | ${word.meaning.fr}</strong>?</p>`;
        if (questions.find((q) => q.question.includes(question))) {
          j++;
          continue;
        }
        answer = [word.lemma];
        break;

      case "FromGreek":
        word = poolWords[randomInt(poolWords.length)];
        if (!word.meaning || possibleChoices < 4) {
          j++;
          continue;
        }
        question = `<p>What does <strong>${word.lemma}</strong> mean?</p>`;
        if (questions.find((q) => q.question.includes(question))) {
          j++;
          continue;
        }

        choices = [word];
        for (let c = 0; c < 3; c++) {
          let w = poolWords[randomInt(poolWords.length)];
          while (!w.meaning || choices.includes(w))
            w = poolWords[randomInt(poolWords.length)];
          choices.push(w);
        }
        choices = shuffle(choices);
        choices.forEach((choice, index) => {
          question += `<p>${index + 1}. ${choice.meaning.en} | ${choice.meaning.fr}</p>`;
          if (choice.lemma === word.lemma) {
            answer = [(index + 1).toString()];
          }
        });
        break;

      default:
        // Declension
        while (true) {
          word = poolWords[randomInt(poolWords.length)];
          gramm = grammars[randomInt(grammars.length)];
          let count = 0;
          while (!word.extras[gramm] && count < 10) {
            gramm = grammars[randomInt(grammars.length)];
            count++;
          }
          if (count < 10) {
            break;
          }
        }
        question = `<p>What is <span class="gramm"><strong>${gramm}</strong></span> of <strong>${word.lemma}</strong>?</p>`;
        if (questions.find((q) => q.question.includes(question))) {
          j++;
          continue;
        }
        answer = word.extras[gramm];
        break;
    }
    questions.push({ question, answer, lemma: word.lemma });
    i++;
  }
  if (j >= limitGeneration) {
    return;
  }
  return Promise.resolve(questions);
}
