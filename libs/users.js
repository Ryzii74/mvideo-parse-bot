"use strict";

const db = require('./db');
const config = require('../config');

module.exports = {
    async add(user) {
        const collection = db.get().collection(config.collections.users);

        const userDocument = await collection.findOne({ id: user.id });
        if (userDocument) return null;

        user.createdAt = new Date();
        await collection.insertOne(user);
    },

    async getAllIds() {
        const users = await db.get().collection(config.collections.users)
            .find({}, { id: 1, _id: 0 }).toArray();
        return users.map(el => el.id);
    },
};
