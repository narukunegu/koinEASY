import { normalizeGreek } from "./helpers.ts";
import Database from "@tauri-apps/plugin-sql";

const db = await Database.load("sqlite:greek-mor.db");

export async function getWords(query: string) {
  const nQuery = normalizeGreek(query);
  const res: any = await db.select(
    "SELECT * FROM word WHERE id IN (SELECT id FROM alt WHERE w = $1 OR w = $2)",
    [nQuery, nQuery[0]?.toUpperCase() + nQuery.slice(1)],
  );

  return res;
}

export async function getWord(query: string) {
  const res: any[] = await db.select("SELECT * FROM word WHERE w = $1", [
    query,
  ]);

  return res[0];
}
