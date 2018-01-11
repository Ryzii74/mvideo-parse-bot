"use strict";

const TelegramBot = require('node-telegram-bot-api');

let bot;

module.exports = {
    init(config) {
        bot = new TelegramBot(config.token, { polling: true });
        this.initHandlers(config.handlers);
        this.logAllMessages();
    },

    initHandlers(handlers) {
        handlers.forEach(command => {
            const regexp = new RegExp(`${command.substr}`);
            bot.onText(regexp, async (msg, match) => {
                try {
                    const exec = require(`../commands/${command.name}`);
                    const result = await exec(msg, command);
                    if (result) this.sendResult(msg.chat.id, result)
                } catch (err) {
                    console.error('commandError', err);
                    bot.sendMessage(msg.chat.id, err.message);
                }
            });
        });
    },

    logAllMessages() {
        bot.on('message', (msg) => {
            console.log(msg);
        });
    },

    sendToUser(userId, message) {
        bot.sendMessage(userId, message);
    },

    sendToUsers(users, message) {
        console.log('sendToUsers', users, message);
        users.forEach(user => this.sendToUser(user, message));
    },

    sendResult(chatId, result) {
        if (Array.isArray(result)) {
            result.forEach(message => {
                bot.sendMessage(chatId, message);
            });
            return;
        }

        bot.sendMessage(chatId, result);
    }
};
