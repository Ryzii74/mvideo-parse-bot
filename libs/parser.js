"use strict";

const cheerio = require('cheerio');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getCity(url, cityCode) {
    const { stdout: body } = await exec(`curl -m 5 -A "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1" https://${url}?cityId=City${cityCode}`, {maxBuffer: 1024 * 5000});
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
            const chelData = await getCity(url, 'CZ_1216');
            const ekbData = await getCity(url, 'CZ_2030');
            const mgnData = await getCity(url, 'R_27');

            return {
                link: url,
                chelPrice: chelData.price,
                mgnPrice: mgnData.price,
                ekbPrice: ekbData.price,
                chelAvailable: (!chelData.price) ? false : chelData.isAvailable,
                ekbAvailable: (!ekbData.price) ? false : ekbData.isAvailable,
                mgnAvailable: (!mgnData.price) ? false : mgnData.isAvailable,
                existed: true,
            };
        } catch (err) {
            console.log(err);
            return {
                existed: false,
            }
        }
    },
};
