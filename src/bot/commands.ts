import type { Env } from "../types";
import { sendMessage } from "./telegram";
import type { TelegramUpdate } from "./index";

type CommandHandler = (
  chatId: number,
  message: TelegramUpdate["message"],
  env: Env["Bindings"]
) => Promise<void>;

const commands: Record<string, CommandHandler> = {
  "/start": async (chatId, message, env) => {
    const name = message?.from.first_name || "Bro";
    await sendMessage(env.TELEGRAM_TOKEN, chatId, `Halo bro ${name}! 👋\nWelcome.`);
  },

  "/help": async (chatId, _message, env) => {
    const helpText = `tanya disini bro @brogrammerID`.trim();
    await sendMessage(env.TELEGRAM_TOKEN, chatId, helpText);
  },
};

export async function handleCommand(
  text: string,
  chatId: number,
  message: TelegramUpdate["message"],
  env: Env["Bindings"]
) {
  if (!text) {
    await sendMessage(env.TELEGRAM_TOKEN, chatId, "Hah kosong?");
    return;
  }
  const textSafe = text ?? "";
  const textSplit = textSafe.split(" ");
  const firstWord = (textSplit[0] ?? "").toLowerCase();
  const command = firstWord;
  const handler = commands[command];
 
  if (handler) {
    await handler(chatId, message, env);
  } else {
    await sendMessage(env.TELEGRAM_TOKEN, chatId, "Perintah tidak dikenal. Ketik /help untuk bantuan.");
  }
}
