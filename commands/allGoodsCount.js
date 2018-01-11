"use strict";

const goods = require('../libs/goods');

module.exports = async function () {
    const count = await goods.getCount();
    return `Количество товаров - ${count}` ;
};
