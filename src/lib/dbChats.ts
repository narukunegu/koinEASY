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

export async function postChat(chat: any) {
  const chatId = await db.execute(
    "INSERT INTO chats (title, messages) VALUES ($1, $2)",
    [chat.title, JSON.stringify(chat.messages)],
  );
  return chatId.lastInsertId;
}

export async function updateChat(request: any) {
  const chat = await getChat(request.chatId);
  const newMessages = JSON.parse(chat.messages).push(request.message);
  const newWords = JSON.parse(chat.words).push(request.word);
  return await db.execute(
    "UPDATE chats SET messages = $1, words = $2 WHERE id = $3",
    [JSON.stringify(newMessages), JSON.stringify(newWords), request.chatId],
  );
}

export async function deleteChat(chatId: number) {
  return await db.execute("DELETE FROM chats WHERE id = $1", [chatId]);
}

export async function getTitles() {
  const res: any[] = await db.select("SELECT id, title FROM chats");
  if (res.length === 0) {
    let initChat: any = {
      title: "untitled",
      messages: [{ type: "response", content: "Χαῖρε!" }],
    };
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
