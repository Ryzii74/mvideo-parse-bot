"use strict";

const goodsListStorage = require("../storages/goodListStorage");
const goodsDataStorage = require('../storages/goodDataStorage');
const parser = require("./parser");
const notifier = require('../core/notifier');

module.exports = {
  async checkGoods(cityCode) {
    const links = await goodsListStorage.getAllLinks();
    console.log('links to check', links);

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      try {
        const goodData = await parser.get(link, cityCode);
        const currentGoodData = await goodsDataStorage.getByLink(link);

        const diff = getGoodDiff(goodData, currentGoodData);
        if (diff) {
          await goodsDataStorage.save(goodData);
          await notifier.sendAll(diff);
        }
      } catch (err) {
        console.error(err);
        await notifier.sendAll(err.message);
      }
    }
  }
};

function getGoodDiff(updated, current) {
  if (updated.price === current.price
    && updated.isAvailable === current.isAvailable
    && updated.isExisted === current.isExisted) {
    return null;
  }

  if (updated.isExisted === false) {
    return `Товар ${updated.link} пропал из магазина`;
  }

  let message = `Изменения в товаре: ${updated.link}`;
  message += `\nЦена - ${current.price || '?'} -> ${updated.price}`;
  message += `\nДоступность - ${flagToMessage(current.isAvailable)} -> ${flagToMessage(updated.isAvailable)}`;
  return message;
}

function flagToMessage(value) {
  if (value === undefined) return '?';
  return value ? 'да' : 'нет';
}
