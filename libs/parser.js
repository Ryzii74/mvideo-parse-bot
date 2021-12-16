"use strict";

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

function getNumber(text) {
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    return text
      .trim()
      .split('')
      .filter(letter => numbers.indexOf(letter) !== -1)
      .join('');
}

async function getGoodDataInCity(goodUrl, cityCode) {
    const body = await getPageBody(goodUrl, cityCode);
    const $ = cheerio.load(body);

    let price = 0;
    let bonus = 0;

    const isSoldOut = $('.product-sold-out-text').get().length > 0;
    if (!isSoldOut) {
        price = getNumber($('.price__main-value').first().text());
        bonus = getNumber($('.mbonus-block__value').first().text());
    }

    console.log(goodUrl, price);
    return {
        price,
        isAvailable: !isSoldOut,
        bonus,
    };
}

module.exports = {
    async get(url, cityCode) {
        const goodData = await getGoodDataInCity(url, cityCode);
        if (!goodData || !goodData.price) {
            return {
                link: url,
                isExisted: false,
            };
        }

        return {
            link: url,
            price: goodData.price,
            isAvailable: goodData.isAvailable,
            bonus: goodData.bonus,
            isExisted: true,
        };
    },
};

async function getPageBody(url, cityCode) {
    const args = [
        '--no-sandbox',
        '--disable-gpu',

        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ];

    const options = {
        args,
        headless: true,
        ignoreHTTPSErrors: true,
        acceptInsecureCerts: true,
    };

    try {
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setCookie({
            name: 'MVID_CITY_ID',
            value: `City${cityCode}`,
            domain: 'mvideo.ru',
            expires: Math.floor((Date.now() + 86400000) / 1000),
        });
        await page.goto(url, {
            waitUntil: 'networkidle2'
        });
        await page.waitForTimeout(60000);
        const body = await page.content();
        await browser.close();
        console.log(body);
        return body;
    } catch (err) {
        const errorMessage = `Ошибка загрузки товара ${url}`;
        console.error(errorMessage, err);
        throw new Error(errorMessage);
    }
}
