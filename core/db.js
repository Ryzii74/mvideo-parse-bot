'use strict';

const mongodb = require('mongodb').MongoClient;

let db = null;

module.exports = {
    get() {
        return db;
    },

    async init(connection) {
        const url = `mongodb://${connection.host}:${connection.port}/${connection.database}`;
        db = await mongodb.connect(url);
    },
};
