"use strict";

const {checkGoods} = require('./goods');
const notifier = require('../core/notifier');
const cron = require('node-cron');

const CITY_CODES = {
    CHEL: {
        id: 'CZ_1216',
        name: 'Челябинск',
    },
    VLDVSTK: {
        id: 'DE_31146',
        name: 'Владивосток',
    },
    MSK: {
        id: 'CZ_975',
        name: 'Москва',
    },
};

async function checkCity(cityData) {
    try {
        await notifier.sendAll(`Проверка города ${cityData.name} начата!`);
        await checkGoods(cityData.id);
        await notifier.sendAll(`Проверка города ${cityData.name} закончена!`);
    } catch (err) {
        console.error('checkCity', err);
        await notifier.sendAll(`Проверка города ${cityData.name} завершилась ошибкой :(`);
    }
}

module.exports = {
    init() {
        cron.schedule('0 14 * * *', () => {
            checkCity(CITY_CODES.VLDVSTK);
        });
        cron.schedule('0 21 * * *', () => {
            checkCity(CITY_CODES.MSK);
        });
    }
};
