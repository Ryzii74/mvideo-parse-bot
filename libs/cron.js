"use strict";

const {checkGoods} = require('./goods');
const notifier = require('../core/notifier');

const CITY_CODES = {
    CHEL: {
        id: 'CZ_1216',
        name: 'Челябинск',
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
        checkCity(CITY_CODES.CHEL);
        setInterval(() => checkCity(CITY_CODES.CHEL), 6 * 60 * 60 * 1000);
    }
};
