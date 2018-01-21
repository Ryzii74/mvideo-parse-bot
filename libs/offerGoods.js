"use strict";

const db = require('./db');
const config = require('../config');

module.exports = {
    async getNew() {
        const collection = db.get().collection(config.collections.newOfferGoods);
        return collection.find().toArray();
    },

    async clearNew() {
        const collection = db.get().collection(config.collections.newOfferGoods);
        return collection.deleteMany({});
    },

    async clearOld() {
        const collection = db.get().collection(config.collections.offerGoods);
        return collection.deleteMany({});
    },

    async getAll() {
        const collection = db.get().collection(config.collections.offerGoods);
        return collection.find({}, { _id: 0 }).toArray();
    },

    async updateOne({ name, price }) {
        const collection = db.get().collection(config.collections.offerGoods);
        return collection.updateOne({ name }, { $set: { price } }, { upsert: true });
    },
};