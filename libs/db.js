'use strict';

const mongodb = require('mongodb').MongoClient;

let db = null;

module.exports = {
    get() {
        return db;
    },

    async init(config) {
        const url = `mongodb://${config.host}:${config.port}/${config.database}`;
        db = await mongodb.connect(url);
    },
};
