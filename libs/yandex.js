"use strict";

const got = require('got');
const cheerio = require('cheerio');

const HOST = 'http://market.yandex.ru';

async function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function getInfoOne(name) {
    const encodedName = encodeURIComponent(name);
    const url = `${HOST}/search?text=${encodedName}`;

    try {
        const { body } = await got(url);
        const $ = cheerio.load(body);
        const yandexPrice = $('.n-snippet-card2__main-price').first().text();
        const yandexUrlPart = $('.n-snippet-card2__title .link').first().attr('href');
        const yandexUrl = `${HOST}${yandexUrlPart}`;
        return { yandexPrice, yandexUrl };
    } catch (err) {
        console.error('yandexGetOneError', err);
    }
}

module.exports = {
    async getInfoMany(array) {
        for (let i = 0; i < array.length; i++) {
            const el = array[i];
            const info = await getInfoOne(el.name);
            await wait(1563);
            if (!info) continue;

            Object.assign(el, info);
        }
    },

    getInfoOne,
};

(async function() {
    const data = await getInfoOne('Монитор Samsung C34F791WQI');
    console.log(data);
})();