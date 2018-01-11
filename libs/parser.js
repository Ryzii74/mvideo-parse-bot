"use strict";

const got = require('got');
const cheerio = require('cheerio');

async function getCity(url, cityCode) {
    const { body } = await got(`${url}?cityId=CityCZ_${cityCode}`);
    const $ = cheerio.load(body);

    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const priceFieldText = $('.sel-product-tile-price').first().text();
    const price = priceFieldText
        .trim()
        .split('')
        .filter(letter => numbers.indexOf(letter) !== -1)
        .join('');

    const notification = $('.c-notifications__title').first().text() || "";

    return {
        price: price,
        isAvailable: notification.trim() !== 'Товар временно отсутствует в продаже',
    };
}

module.exports = {
    async get(url) {
        try {
            const chelData = await getCity(url, '1216');
            const ekbData = await getCity(url, '2030');

            return {
                link: url,
                chelPrice: chelData.price,
                ekbPrice: ekbData.price,
                chelAvailable: (!chelData.price) ? false : chelData.isAvailable,
                ekbAvailable: (!ekbData.price) ? false : ekbData.isAvailable,
                existed: true,
            };
        } catch (err) {
            return {
                existed: false,
            }
        }
    },
};
