const TelegramBot = require("node-telegram-bot-api");
const { Client } = require("@threadsjs/threads.js");
const express = require("express");
const cors = require("cors");

const token = "5988809850:AAGykNyaV9r7dYDa871Ivg-ERSnhZ9MGG9Q";
const webAppUrl = "https://musical-pasca-6a0bee.netlify.app/";

const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(express.json());
app.use(cors());
let login = "";
let password = "";
let newMessage = "";
let newTimer = 0;

const publishTimer = async (cancel, chatID) => {
    // if (cancel) {
    //     clearTimeout(timer);
    // }
    // const timer = setTimeout(async () => {
    //     const threadsAPI = new ThreadsAPI({
    //         username: login,
    //         password: password,
    //         deviceID,
    //     });
    //     await threadsAPI.login();
    //     await threadsAPI.publish({
    //         text: "Пост опубликован",
    //     });
    //     newTimer = 0;
    //     console.log("Пост опубликован");
    //     bot.sendMessage(chatID, "Пост успешно опубликован!");
    // }, newTimer * 1000 * 60 * 60);
};

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") {
        await bot.sendMessage(
            chatId,
            "Привет! Я помогу тебе публиковать посты в Threads в нужное тебе время ⏰ Просто напиши мне текст публикации и время, в которое он должен появится в Threads, а я всё сделаю сам 😉. Но давай сначала пройдем простую авторизацию. Не переживай, твои логин и пароль я не храню у себя, а отправляю напрямую в Meta 🔐. Нажми на кнопку 'Авторизоваться'",
            {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: "Авторизоваться",
                                web_app: { url: webAppUrl },
                            },
                        ],
                    ],
                    one_time_keyboard: true,
                },
            }
        );
        const client = new Client();
        // You can also specify a token: const client = new Client({ token: 'token' });
        await client.login("fondumik", "LeaveMeInInst05061912");
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        await client.posts.create(1, { contents: "Hello World!" });
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);
            await bot.sendMessage(chatId, "Подключаемся к Threads ⏳");
            login = data?.login;
            password = data?.password;

            await bot.sendMessage(
                chatId,
                "Теперь можно отправить отложенный пост в Threads! Нажми на кнопку 'Новый пост'",
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Новый пост",
                                    callback_data: "newPost",
                                },
                            ],
                        ],
                    },
                }
            );
        } catch (e) {
            await bot.sendMessage(
                chatId,
                "Что-то пошло не так 😢 Попробуй чуть позже! /start"
            );
        }
    }
});

bot.on("callback_query", (query) => {
    let id = query.message.chat.id;

    switch (query.data) {
        case "newPost":
            if (!login || !password) {
                bot.sendMessage(
                    id,
                    "Нужно еще раз пройти авторизацию. Напиши еще раз \\/start"
                );
            }
            bot.sendMessage(
                id,
                "Напиши следующим сообщением текст своего поста 🖊"
            );
            bot.addListener("message", (message) => {
                if (newMessage !== "") {
                    bot.removeAllListeners();
                    return;
                }

                newMessage = message.text;
                bot.sendMessage(
                    id,
                    "Теперь напиши, через сколько часов ⏰ опубликовать пост. Например, 4"
                );
                bot.addListener("message", (message) => {
                    newTimer = Number(message.text);
                    bot.sendMessage(
                        id,
                        `Отлично, через ${newTimer.toFixed(
                            0
                        )} часов твой новый пост появится в Threads!`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: "Отменить публикацию",
                                            callback_data: "cancelPublish",
                                        },
                                    ],
                                ],
                            },
                        }
                    );
                    publishTimer(false, id);
                    // bot.removeAllListeners();
                });
            });
            break;
        case "cancelPublish":
            publishTimer(true, id);
            bot.sendMessage(id, "Публикация отменена", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Новый пост",
                                callback_data: "newPost",
                            },
                        ],
                    ],
                },
            });
            break;
    }
});

const PORT = 8000;
app.listen(PORT, () => console.log("server started on PORT " + PORT));