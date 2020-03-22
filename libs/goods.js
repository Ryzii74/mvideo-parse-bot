"use strict";

const db = require('./db');
const config = require('../config');

const PAGE_SIZE = 25;

function getCollection() {
    return db.get().collection(config.collections.goods);
}

module.exports = {
    async compareAndUpdate(good) {
        let goodDocument = await this.getByLink(good.link);
        if (!goodDocument) goodDocument = {};

        if (good.existed !== goodDocument.existed) {
            return { exist: { isExisted: good.existed } };
        }

        if (good.chelPrice === goodDocument.chelPrice
            && good.chelAvailable === goodDocument.chelAvailable
            && good.chelIsTradeIn === goodDocument.chelIsTradeIn
            && good.chelIsBonusExtended === goodDocument.chelIsBonusExtended) {
            return {};
        }

        await getCollection().updateOne({ link: good.link }, { $set: good }, { upsert: true });
        return {
            compare: {
                chelPriceBefore: goodDocument.chelPrice || 'Неизвестно',
                chelPriceAfter: good.chelPrice,
                chelAvailableBefore: goodDocument.chelAvailable,
                chelAvailableAfter: good.chelAvailable,
                chelIsTradeInBefore: goodDocument.chelIsTradeIn,
                chelIsTradeInAfter: good.chelIsTradeIn,
                chelIsBonusExtendedBefore: goodDocument.chelIsBonusExtended,
                chelIsBonusExtendedAfter: good.chelIsBonusExtended,
            },
        };
    },

    async getCount() {
        return getCollection().count({});
    },

    async getLastNumber() {
        const lastCreatedDocument = await getCollection()
          .find({}, { number: 1 })
          .limit(1)
          .sort({ _id: -1 })
          .toArray();
        return (lastCreatedDocument[0] && lastCreatedDocument[0].number) || 0;
    },

    async getByLink(link) {
        return getCollection().findOne({ link });
    },

    async add(good) {
        const goodDocument = await this.getByLink(good.link);
        if (goodDocument) return;

        let lastNumber = await this.getLastNumber();
        await getCollection().insertOne({
            ...good,
            createdAt: new Date(),
            number: lastNumber + 1,
        });
    },

    getData(data) {
        return `Цена: ${data.chelPrice}\nДоступность: ${data.chelAvailable ? 'Да' : 'Нет'}\nTrade-in: ${data.chelIsTradeIn ? 'Да' : 'Нет'}\nБольше бонусных рублей: ${data.chelIsBonusExtended ? 'Да' : 'Нет'}`;
    },

    async getAllLinks() {
        return getCollection().find({}, { link: 1, number: 1 }).toArray();
    },

    async getLinksPage(pageNumber) {
        if (pageNumber < 1) pageNumber = 1;

        return getCollection()
            .find({}, { link: 1, number: 1 })
            .skip((pageNumber - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .toArray();
    },

    async remove(number) {
        await getCollection().removeOne({ number });
    }
};
