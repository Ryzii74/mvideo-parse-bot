"use strict";

const config = require('./config');

const bot = require('./core/bot');
const googleDocs = require('./core/googleDocs');
const db = require('./core/db');
const cron = require('./libs/cron');

(async function startApp() {
    try {
        await db.init(config.db.connection);
        await googleDocs.init(config.googleDocs.connection);
        bot.init(config.bot);
        cron.init();
    } catch (err) {
        console.error('initAppError', err);
    }
})();

process.on('unhandledRejection', function(err) {
    console.log(err)
});
