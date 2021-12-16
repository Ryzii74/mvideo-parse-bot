"use strict";

const googleDocs = require('../core/googleDocs');
const config = require('../config');

const TTL = 1000 * 60 * 2;

const cache = new Map();
let lastCacheClearingTime = 0;

module.exports = {
  async getAllLinks() {
    this.clearCache();
    const doc = config.googleDocs.docs.goodsList;

    const dataFromCache = cache.get(doc.id);
    if (dataFromCache) return dataFromCache;

    const docData = await googleDocs.getDocData(doc.id, doc.range);
    const data = docData.map(row => row[0]);
    cache.set(doc.id, data);
    return data;
  },

  clearCache() {
    const now = Date.now();
    if (now - lastCacheClearingTime < TTL) return;

    lastCacheClearingTime = now;
    cache.clear();
  }
};
