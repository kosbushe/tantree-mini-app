const TELEGRAM_API_BASE = "https://api.telegram.org";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }
  return token;
}

interface TelegramApiResponse<T = unknown> {
  ok: boolean;
  result?: T;
  description?: string;
}

async function callTelegramApi<T>(
  method: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(
    `${TELEGRAM_API_BASE}/bot${getBotToken()}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const data = (await response.json()) as TelegramApiResponse<T>;

  if (!response.ok || !data.ok) {
    throw new Error(data.description ?? `Telegram API ${method} failed`);
  }

  return data.result as T;
}

export async function sendTelegramMessage(params: {
  chatId: number;
  text: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  replyMarkup?: Record<string, unknown>;
}) {
  return callTelegramApi("sendMessage", {
    chat_id: params.chatId,
    text: params.text,
    parse_mode: params.parseMode ?? "HTML",
    reply_markup: params.replyMarkup,
  });
}
