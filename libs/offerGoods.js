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

    async getOne(name) {
        const collection = db.get().collection(config.collections.offerGoods);
        return collection.findOne({ name }, { _id: 0 });
    },

    async updateOne({ name, price }) {
        const collection = db.get().collection(config.collections.offerGoods);
        return collection.updateOne({ name }, { $set: { price } }, { upsert: true });
    },
};