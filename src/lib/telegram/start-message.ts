export const TANTREE_CHANNEL_URL = "https://t.me/Tan_Tree";

export const START_MESSAGE_HTML = [
  "🪐 <b>Пространство Силы TANTREE приветствует тебя!</b>",
  "",
  "Твой инструмент сонастройки с собой уже готов к работе. Помни: случайности не случайны. Карта, которую ты вытянешь сегодня, несёт в себе именно то послание, в котором сейчас нуждается твоё сердце.",
  "",
  "Чтобы практика работала глубже, интегрируйся в наше сообщество.",
].join("\n");

export function getMiniAppUrl(): string {
  const configured =
    process.env.TELEGRAM_WEBAPP_URL ?? process.env.NEXT_PUBLIC_APP_URL;

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  throw new Error(
    "Mini App URL is not configured. Set TELEGRAM_WEBAPP_URL or NEXT_PUBLIC_APP_URL.",
  );
}

export function buildStartInlineKeyboard(webAppUrl: string) {
  return {
    inline_keyboard: [
      [
        {
          text: "🌿 Войти в Канал",
          url: TANTREE_CHANNEL_URL,
        },
        {
          text: "🃏 Начать Практику",
          web_app: { url: webAppUrl },
        },
      ],
    ],
  };
}
