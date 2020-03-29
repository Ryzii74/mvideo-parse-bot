"use strict";

const db = require('./db');
const config = require('../config');

function getCollection() {
    return db.get().collection(config.collections.users);
}

const ALLOWED_USERS_TO_SEND = [
    491345376,
    59745477,
    29222755,
];

module.exports = {
    async add(user) {
        const userDocument = await getCollection().findOne({ id: user.id });
        if (userDocument) return null;

        user.createdAt = new Date();
        await getCollection().insertOne(user);
    },

    async remove(user) {
        await getCollection().removeOne({ id: user.id });
    },

    async getAllIds() {
        const users = await getCollection().find({}, { id: 1, _id: 0 }).toArray();
        return users.map(el => el.id);
    },

    async getAllIdsToSend() {
        const ids = await this.getAllIds();
        return ids.filter(id => ALLOWED_USERS_TO_SEND.includes(id));
    }
};
