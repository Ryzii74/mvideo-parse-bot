"use strict";

const db = require('./db');
const config = require('../config');

const PAGE_SIZE = 25;

module.exports = {
    async compareAndUpdate(good) {
        const collection = db.get().collection(config.collections.goods);
        let goodDocument = await collection.findOne({ link: good.link });
        if (!goodDocument) goodDocument = {};

        if (good.existed !== goodDocument.existed) {
            return { exist: { isExisted: good.existed } };
        }

        if (good.chelPrice === goodDocument.chelPrice
            && good.ekbPrice === goodDocument.ekbPrice
            && good.chelAvailable === goodDocument.chelAvailable
            && good.ekbAvailable === goodDocument.ekbAvailable) {
            return {};
        }

        await collection.updateOne({ link: good.link }, { $set: good }, { upsert: true });
        return {
            compare: {
                chelPriceBefore: goodDocument.chelPrice || 'Неизвестно',
                chelPriceAfter: good.chelPrice,
                chelAvailableBefore: goodDocument.chelAvailable,
                chelAvailableAfter: good.chelAvailable,
                ekbPriceBefore: goodDocument.ekbPrice || 'Неизвестно',
                ekbPriceAfter: good.ekbPrice,
                ekbAvailableBefore: goodDocument.ekbAvailable,
                ekbAvailableAfter: good.ekbAvailable,
            },
        };
    },

    async getCount() {
        const collection = db.get().collection(config.collections.goods);
        return collection.count({});
    },

    async add(good) {
        const collection = db.get().collection(config.collections.goods);
        const goodDocument = await collection.findOne({ link: good.link });
        if (goodDocument) return null;

        let lastNumber = await collection
                .find({}, { number: 1 })
                .limit(1)
                .sort({ _id: -1 })
                .toArray();
        lastNumber = (lastNumber[0] && lastNumber[0].number) || 0;

        good.createdAt = new Date();
        good.number = lastNumber + 1;
        await collection.insertOne(good);
    },

    getData(data) {
        return `Цена Екб: ${data.ekbPrice}\nДоступен Екб: ${data.ekbAvailable ? 'Да' : 'Нет'}\nЦена Чел: ${data.chelPrice}\nДоступен Чел: ${data.chelAvailable ? 'Да' : 'Нет'}`;
    },

    async getAllLinks() {
        const collection = db.get().collection(config.collections.goods);
        return collection.find({}, { link: 1, number: 1 }).toArray();
    },

    async getLinksPage(pageNumber) {
        if (pageNumber < 1) pageNumber = 1;

        const collection = db.get().collection(config.collections.goods);
        return collection
            .find({}, { link: 1, number: 1 })
            .skip((pageNumber - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .toArray();
    },

    async remove(number) {
        const collection = db.get().collection(config.collections.goods);
        await collection.removeOne({ number });
    }
};
