"use strict";

const goods = require('./goods');
const parser = require('./parser');
const bot = require('./bot');
const users = require('./users');
const OfferGoods = require('./offerGoods');

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

async function getOfferProducts() {
    const goods = await OfferGoods.getNew();
    await OfferGoods.clearNew();
    const changedGoods = [];
    const addedGoods = [];
    for (let i = 0; i < goods.length; i++) {
        const good = goods[i];
        const goodData = await OfferGoods.getOne(good.name);
        if (goodData && goodData.price == good.price) continue;

        await OfferGoods.updateOne(good);
        if (!goodData) {
            addedGoods.push(good);
        } else {
            changedGoods.push(good);
        }
    }

    let message = '';
    message += goodsMessagePart(addedGoods, 'Добавленные товары');
    message += goodsMessagePart(changedGoods, 'Измененные товары');
    if (!message) return;

    const userIds = await users.getAllIds();
    bot.sendToUsers(userIds, message);
}

function goodsMessagePart(array, baseName) {
    let message = '';
    if (!array || array.length) return message;

    message += `${baseName}:\n`;
    message += array
        .map(good => `${good.name} - ${good.price}`)
        .join('\n');

    return message + '\n';
}

module.exports = {
    init() {
        checkProducts();
        getOfferProducts();
        setInterval(checkProducts, 4 * 60 * 60 * 1000);
        setInterval(getOfferProducts, 60 * 60 * 1000);
    }
};
