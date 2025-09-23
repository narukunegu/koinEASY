import { getWord } from "./dbDict";

import normalizeGreek from "./normalize";

export async function analyzeWord(query: string) {
  let response: string[] = [];
  await getWord(query).then((result) => {
    const queryG = normalizeGreek(query);

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
