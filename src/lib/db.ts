import { resolveResource } from "@tauri-apps/api/path";
import Database from "@tauri-apps/plugin-sql";

const dbPath = await resolveResource("resources/greek-mor.db");
const db = await Database.load(`sqlite:${dbPath}`);

export async function getWord(query: string) {
  const res: any = await db.select(
    "SELECT * FROM word WHERE id IN (SELECT id FROM alt WHERE w = $1 OR w = $2)",
    [query, query[0]?.toUpperCase() + query.slice(1)],
  );
  return res;
}
