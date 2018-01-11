"use strict";

const goods = require('../libs/goods');

module.exports = async function (msg, command) {
    const text = msg.text.replace(command.substr, '').trim();
    if (!text) return 'Вы не указали номер ссылки из списка в качестве аргумента';

    console.log(text);
    const number = Number(text);
    if (number < 0 || isNaN(number)) return 'Аргументом команды должен быть номер ссылки из списка!';

    await goods.remove(number);
    return 'Ссылка успешно удалена из вашего списка!';
};
