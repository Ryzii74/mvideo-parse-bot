"use strict";

const db = require('./db');
const config = require('../config');

function getCollection(shop, type) {
    return db.get().collection(`${shop}_${type}`);
}

module.exports = {
    async getNew(shop) {
        const collection = getCollection(shop, 'new');
        return collection.find().toArray();
    },

    async clearNew(shop) {
        const collection = getCollection(shop, 'new');
        return collection.deleteMany({});
    },

    async clearOld(shop) {
        const collection = getCollection(shop, 'current');
        return collection.deleteMany({});
    },

    async getAll(shop) {
        const collection = getCollection(shop, 'current');
        return collection.find({}, { _id: 0 }).toArray();
    },

    async updateOne(shop, { name, price }) {
        const collection = getCollection(shop, 'current');
        return collection.updateOne({ name }, { $set: { price } }, { upsert: true });
    },
};