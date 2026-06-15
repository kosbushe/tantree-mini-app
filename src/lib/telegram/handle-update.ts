import { sendTelegramMessage } from "@/lib/telegram/bot-api";
import {
  buildStartInlineKeyboard,
  getMiniAppUrl,
  START_MESSAGE_HTML,
} from "@/lib/telegram/start-message";

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
}

interface TelegramChat {
  id: number;
  type: string;
}

interface TelegramMessage {
  message_id: number;
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

function isStartCommand(text: string | undefined): boolean {
  if (!text) {
    return false;
  }

  return text.trim().split(/\s+/)[0] === "/start";
}

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  if (!message || !isStartCommand(message.text)) {
    return;
  }

  const webAppUrl = getMiniAppUrl();

  await sendTelegramMessage({
    chatId: message.chat.id,
    text: START_MESSAGE_HTML,
    parseMode: "HTML",
    replyMarkup: buildStartInlineKeyboard(webAppUrl),
  });
}
