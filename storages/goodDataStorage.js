"use strict";

const db = require('../core/db');
const config = require('../config');

function getCollection() {
  return db.get().collection(config.db.collections.goods);
}

module.exports = {
  async save(goodData) {
    await getCollection().updateOne({ link: goodData.link }, { $set: goodData }, { upsert: true });
  },

  async getByLink(link) {
    const good = (await getCollection().findOne({ link })) || {};
    return good;
  },
};
