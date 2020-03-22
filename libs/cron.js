"use strict";

const goods = require('./goods');
const parser = require('./parser');
const users = require('./users');
const OfferGoods = require('./offerGoods');
const notifier = require('./notifier');

const HOSTS = {
    mvideo: 'http://mvideo.ru',
    dns: 'http://dns-shop.ru',
};

function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function flagToMessage(value) {
    if (value === undefined) return 'неизвестно';
    return value ? 'да' : 'нет';
}

async function checkProducts() {
    const links = await goods.getAllLinks();
    const userIds = await users.getAllIds();

    for (let i = 0; i < links.length; i++) {
        const good = links[i];
        try {
            const goodData = await parser.get(good.link);
            const { compare, exist } = await goods.compareAndUpdate(goodData);
            if (compare) {
                let message = `Изменения в товаре: ${good.link}`;
                message += `\nЦена - ${compare.chelPriceBefore} -> ${compare.chelPriceAfter}`;
                message += `\nДоступность - ${flagToMessage(compare.chelAvailableBefore)} -> ${flagToMessage(compare.chelAvailableAfter)}`;
                message += `\nTrade-in - ${flagToMessage(compare.chelIsTradeInBefore)} -> ${flagToMessage(compare.chelIsTradeInAfter)}`;
                message += `\nБонусные рубли - ${compare.chelBonusBefore} -> ${compare.chelBonusAfter}`;
                await notifier.send(userIds, message);
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
            await notifier.send(userIds, err.message);
        }

        await wait(Math.floor((Math.random() + 1) * 5 * 1000));
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

    const messagesAdded = goodsMessagePart(shop, addedGoods, `Добавленный товар в ${shop}`);
    const messagesChanged = goodsMessagePart(shop, changedGoods, `Измененный товар в ${shop}`);
    const userIds = await users.getAllIds();
    await notifier.sendMany(userIds, messagesAdded);
    await notifier.sendMany(userIds, messagesChanged);
}

function goodsMessagePart(shop, array, baseName) {
    if (!array || !array.length) return [];

    const host = HOSTS[shop];
    return array.map(good => `${baseName}:\n${good.name} - ${good.price}\n${host}${good.url}`);
}

module.exports = {
    init() {
        checkProducts();
        getOfferProducts('mvideo');
        getOfferProducts('dns');
        setInterval(checkProducts, 60 * 60 * 1000);
        setInterval(getOfferProducts.bind(null, 'mvideo'), 60 * 60 * 1000);
        setTimeout(() => setInterval(getOfferProducts.bind(null, 'dns'), 60 * 60 * 1000), 300000);
    }
};
