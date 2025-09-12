import { resolveResource } from "@tauri-apps/api/path";
import Database from "@tauri-apps/plugin-sql";

// export async function modifyDb(id: number) {
//   const res: any = await db.select(
//     `SELECT * FROM word WHERE id = ${id} LIMIT 1`,
//   );
//
//   await db.execute("UPDATE word SET m = $1 WHERE id = $2", [
//     res[0].m.replace("</div>", ""),
//     id,
//   ]);
// }
const dbPath = await resolveResource("resources/greek-mor.db");
const db = await Database.load(`sqlite:${dbPath}`);

export async function getWord(query: string) {
  const index: any = await db.select("SELECT * FROM alt WHERE w = $1", [query]);
  if (index.length === 0) {
    return null;
  }
  const res: any = await db.select("SELECT * FROM word WHERE id = $1", [
    index[0].id,
  ]);
  return res[0];
}
