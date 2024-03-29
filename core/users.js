"use strict";

const db = require('./db');
const config = require('../config');

function getCollection() {
    return db.get().collection(config.db.collections.users);
}

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
        return ids.filter(id => config.bot.allowedUsers.includes(id));
    }
};
