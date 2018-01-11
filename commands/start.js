"use strict";

const users = require('../libs/users');

module.exports = async function (msg) {
    await users.add(msg.from);
    return 'Рад знакомству!';
};
