"use strict";

const goods = require('../libs/goods');

module.exports = async function (msg, command) {
    const argument = Number(msg.text
        .replace(command.substr, '')
        .trim());
    const pageNumber = isNaN(argument) ? 1 : argument;

    const list = await goods.getLinksPage(pageNumber);
    const result = list.map(({link, number}) => `${number}) ${link}`).join('\n');
    if (result) {
        return 'Список товаров:\n' + result;
    } else {
        return 'Список пуст';
    }
};
