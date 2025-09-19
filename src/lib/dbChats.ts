import Database from "@tauri-apps/plugin-sql";

const db = await Database.load("sqlite:chats.db");

export async function getChat(id: number) {
  const res: any[] = await db.select("SELECT * FROM chats WHERE id = $1", [id]);
  return res[0];
}

export async function postChat(chat: any) {
  const chatId = Math.round(Math.random() * 100000);
  await db.execute(
    "INSERT INTO chats (id, title, messages) VALUES ($1, $2, $3)",
    [chatId, chat.title, chat.messages],
  );
  return chatId;
}

export async function updateChat(chat: any) {
  return await db.execute(
    "UPDATE chats SET title = $1, messages = $2 WHERE id = $3",
    [chat.title, chat.messages, chat.id],
  );
}

export async function deleteChat(chatId: number) {
  return await db.execute("DELETE FROM chats WHERE id = $1", [chatId]);
}

export async function getTitles() {
  const res: any[] = await db.select("SELECT id, title FROM chats");
  if (res.length === 0) {
    let initChat: any = { title: "untitled", messages: "" };
    const newId = await postChat(initChat);
    initChat = { id: newId, ...initChat };
    res.push(initChat);
  }
  return res.reverse();
}

export async function updateTitle(chat: any) {
  return await db.execute("UPDATE chats SET title = $1 WHERE id = $2", [
    chat.title,
    chat.id,
  ]);
}
