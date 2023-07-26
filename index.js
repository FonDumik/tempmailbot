require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const webAppUrl = process.env.TEMPMAIL_URL;
const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });
const helloMessage =
    "Привет! Я помогу тебе воспользоваться сервисом временной почты Mail.tm. Просто нажми кнопку 'Открыть приложение'";

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(chatId, helloMessage, {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: "Открыть приложение",
                        web_app: { url: webAppUrl },
                    },
                ],
            ],
        },
    });
});
