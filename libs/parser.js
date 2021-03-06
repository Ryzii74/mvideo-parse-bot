"use strict";

const cheerio = require('cheerio');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function getNumber(text) {
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    return text
      .trim()
      .split('')
      .filter(letter => numbers.indexOf(letter) !== -1)
      .join('');
}

async function getCity(url, cityCode) {
    let body;
    try {
        const { stdout } = await exec(`curl -m 30 -A "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1" https://${url}?cityId=City${cityCode}`, {maxBuffer: 1024 * 5000});
        body = stdout;
    } catch (err) {
        const errorMessage = `Ошибка загрузки товара ${url} в городе ${cityCode}`;
        console.error(errorMessage, err);
        throw new Error(errorMessage);
    }
    const $ = cheerio.load(body);

    const priceFieldText = $('.fl-pdp-price__current').first().text();
    const price = getNumber(priceFieldText);
    const isTradeIn = $('.o-pay__trade-toggle').get().length > 0;
    const bonus = getNumber($('.u-color-red.wrapper-text__rouble').first().text());

    const notification = $('.c-notifications__title').first().text() || "";

    console.log(url, price, bonus, notification.trim());
    return {
        price: price,
        isAvailable: notification.trim() !== 'Товар временно отсутствует в продаже',
        isTradeIn,
        bonus,
    };
}

module.exports = {
    async get(url) {
        const getCityWithRetry = retry(getCity, 3);
        const chelData = await getCityWithRetry(url, 'CZ_1216');
        if (!chelData.price) {
            return {
                link: url,
                chelPrice: chelData.price,
                chelAvailable: false,
                checlIsTradeIn: false,
                chelBonus: 0,
                existed: false,
            };
        }

        return {
            link: url,
            chelPrice: chelData.price,
            chelAvailable: chelData.isAvailable,
            chelIsTradeIn: chelData.isTradeIn,
            chelBonus: chelData.bonus,
            existed: true,
        };
    },
};

function retry(func, retryCount) {
    return async function (...args) {
        let triesCount = 0;
        let error = null;
        while (triesCount < retryCount) {
            try {
                return await func(...args);
            } catch (err) {
                console.error(err.message);
                error = err;
                triesCount++;
            }
        }

        throw error;
    }
}
