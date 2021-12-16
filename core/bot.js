"use strict";

const config = require('../config');
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
                    if (!config.bot.allowedUsers.includes(msg.from.id)) {
                        return this.sendResult(msg.chat.id, 'Я так не умею!');
                    }

                    const exec = require(`../commands/${command.name}`);
                    const result = await exec(msg, command);
                    if (result) await bot.sendMessage(msg.chat.id, result);
                } catch (err) {
                    console.error('commandError', err);
                    this.sendToUser(msg.chat.id, err.message);
                }
            });
        });
    },

    logAllMessages() {
        bot.on('message', (msg) => {
            console.log(msg);
        });
    },

    async sendToUser(userId, message) {
      try {
        await bot.sendMessage(userId, message);
      } catch (err) {
        console.error('sendToUserError', err.message);
        if (err.message === 'ETELEGRAM: 403 Forbidden: bot was blocked by the user') {
            throw new Error('userBlocked');
        }
      }
    },
};
