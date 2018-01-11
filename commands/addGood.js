"use strict";

const config = require('../config');
const parser = require('../libs/parser');
const goods = require('../libs/goods');

module.exports = async function (msg, command) {
    const link = msg.text
        .replace(command.substr, '')
        .trim()
        .replace(/http[s]?:\/\//, '');
    if (!link) return 'Вы не указали ссылку в качестве аргумента';

    let goodData;
    try {
        goodData = await parser.get(link);
        if (goodData.existed === false) {
            throw new Error('noData');
        }
    } catch (err) {
        throw new Error('Не удалось получить данные по ссылке!');
    }

    await goods.add(goodData);
    return ['Товар успешно добавлен', goods.getData(goodData)];
};
