"use strict";

const cheerio = require('cheerio');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getCity(url, cityCode) {
    let body;
    try {
        const { stdout } = await exec(`curl -m 10 -A "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1" https://${url}?cityId=City${cityCode}`, {maxBuffer: 1024 * 5000});
        body = stdout;
    } catch (err) {
        const errorMessage = `Ошибка загрузки товара ${url} в городе ${cityCode}`;
        console.log(errorMessage, err);
        throw new Error(errorMessage);
    }
    const $ = cheerio.load(body);

    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const priceFieldText = $('.sel-product-tile-price').first().text();
    const price = priceFieldText
        .trim()
        .split('')
        .filter(letter => numbers.indexOf(letter) !== -1)
        .join('');
    const isTradeIn = $('.o-pay__trade-toggle').length > 0;
    const isBonusExtended = $('.u-color-red wrapper-text__rouble').length > 2;

    const notification = $('.c-notifications__title').first().text() || "";

    return {
        price: price,
        isAvailable: notification.trim() !== 'Товар временно отсутствует в продаже',
        isTradeIn,
        isBonusExtended,
    };
}

module.exports = {
    async get(url) {
        const chelData = await getCity(url, 'CZ_1216');
        if (!chelData.price) {
            return {
                link: url,
                chelPrice: chelData.price,
                chelAvailable: false,
                checlIsTradeIn: false,
                checlIsBonusExtended: false,
                existed: false,
            };
        }

        return {
            link: url,
            chelPrice: chelData.price,
            chelAvailable: chelData.isAvailable,
            chelIsTradeIn: chelData.isAvailable,
            chelIsBonusExtended: chelData.isBonusExtended,
            existed: true,
        };
    },
};
