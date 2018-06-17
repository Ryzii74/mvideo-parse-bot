"use strict";

const goods = require('./goods');
const parser = require('./parser');
const bot = require('./bot');
const users = require('./users');
const OfferGoods = require('./offerGoods');

const HOSTS = {
    mvideo: 'http://mvideo.ru',
    dns: 'http://dns-shop.ru',
};

function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function checkProducts() {
    const links = await goods.getAllLinks();
    console.log(new Date(), `${links.length} товаров в базе`);

    for (let i = 0; i < links.length; i++) {
        const good = links[i];
        console.log(new Date(), 'проверка товара', good.link);
        try {
            const goodData = await parser.get(good.link);
            const { compare, exist } = await goods.compareAndUpdate(goodData);
            if (compare) {
                const userIds = await users.getAllIds();
                let message = `Изменения в товаре: ${good.link}`;
                message += `\nСтарая цена Чел - ${compare.chelPriceBefore}`;
                message += `\nНовая цена Чел - ${compare.chelPriceAfter}`;
                message += `\nСтарая доступность Чел - ${compare.chelAvailableBefore}`;
                message += `\nНовая доступность Чел - ${compare.chelAvailableAfter}`;
                message += `\nСтарая цена Екб - ${compare.ekbPriceBefore}`;
                message += `\nНовая цена Екб - ${compare.ekbPriceAfter}`;
                message += `\nСтарая доступность Екб - ${compare.ekbAvailableBefore}`;
                message += `\nНовая доступность Екб - ${compare.ekbAvailableAfter}`;
                bot.sendToUsers(userIds, message);
            }
            if (exist) {
                let message = `Изменения в товаре: ${good.link}`;
                if (exist.isExisted) {
                    message += 'Товар пропал из магазина!';
                } else {
                    message += 'Товар появился в магазине!';
                }
            }
        } catch (err) {
            console.error(err);
        }

        await wait(Math.floor((Math.random() + 1) * 60 * 1000));
    }
}

async function getOfferProducts(shop) {
    const goods = await OfferGoods.getNew(shop);
    console.log(`Текущие предложения в ${shop}`, goods);
    const currentGoods = await OfferGoods.getAll(shop);
    await OfferGoods.clearNew(shop);
    await OfferGoods.clearOld(shop);

    const changedGoods = [];
    const addedGoods = [];
    for (let i = 0; i < goods.length; i++) {
        const good = goods[i];
        if (!good.price) continue;

        const goodData = currentGoods.find(el => el.name === good.name);
        await OfferGoods.updateOne(shop, good);
        if (goodData && goodData.price == good.price) continue;

        console.log(`Обновление товара в ${shop}`, good);
        if (!goodData) {
            addedGoods.push(good);
        } else {
            changedGoods.push(good);
        }
    }

    if (!addedGoods.length && !changedGoods.length) return;

    let message = '';
    message += goodsMessagePart(shop, addedGoods, `Добавленные товары в ${shop}`);
    message += goodsMessagePart(shop, changedGoods, `Измененные товары в ${shop}`);
    console.log(`Сообщение об обновлении товаров в ${shop}`, message);
    const userIds = await users.getAllIds();
    bot.sendToUsers(userIds, message);
}

function goodsMessagePart(shop, array, baseName) {
    let message = '';
    if (!array || !array.length) return message;

    const host = HOSTS[shop];
    message += `${baseName}:\n`;
    message += array
        .map(good => `${good.name} - ${good.price}\n${host}${good.url}\n`)
        .join('\n');

    return message + '\n';
}

module.exports = {
    init() {
        checkProducts();
        getOfferProducts('mvideo');
        getOfferProducts('dns');
        setInterval(checkProducts, 4 * 60 * 60 * 1000);
        setInterval(getOfferProducts.bind(null, 'mvideo'), 60 * 60 * 1000);
        setTimeout(() => setInterval(getOfferProducts.bind(null, 'dns'), 60 * 60 * 1000), 300000);
    }
};
