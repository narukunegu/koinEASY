import Database from "@tauri-apps/plugin-sql";

const db = await Database.load("sqlite:user.db");

export interface MessageType {
  type: "request" | "response";
  content: string;
}

export async function getChat(id: number) {
  const res: any[] = await db.select("SELECT * FROM chats WHERE id = $1", [id]);
  return res[0];
}

export async function newChat() {
  const chatId = await db.execute(
    "INSERT INTO chats (title, messages, words) VALUES ($1, $2, $3)",
    [
      "untitled",
      JSON.stringify([{ type: "response", content: "Χαῖρε!" }]),
      `[]`,
    ],
  );
  return chatId.lastInsertId;
}

export async function updateChat(request: any) {
  const chat = await getChat(request.chatId);
  const messages = JSON.parse(chat.messages);
  const words: any[] = JSON.parse(chat.words);
  words.push(request.word);
  messages[1] = {
    type: "response",
    content: `<p><strong>Statistics</strong></p><p>- Words Count: ${words.length}</p>`,
  };

  return await db.execute(
    "UPDATE chats SET messages = $1, words = $2 WHERE id = $3",
    [JSON.stringify(messages), JSON.stringify(words), request.chatId],
  );
}

export async function deleteChat(chatId: number) {
  return await db.execute("DELETE FROM chats WHERE id = $1", [chatId]);
}

export async function getTitles() {
  const res: any[] = await db.select("SELECT id, title FROM chats");
  if (res.length === 0) {
    const newId = await newChat();
    res.push({ id: newId, title: "untitled" });
  }
  return res.reverse();
}

export async function getMessages(chatId: number) {
  return (
    await db.select("SELECT messages FROM chats WHERE id = $1", [chatId])
  )[0].messages;
}

export async function updateTitle(chat: any) {
  return await db.execute("UPDATE chats SET title = $1 WHERE id = $2", [
    chat.title,
    chat.id,
  ]);
}

export async function getWords(chatId: number) {
  return (await db.select("SELECT words FROM chats WHERE id = $1", [chatId]))[0]
    .words;
}
