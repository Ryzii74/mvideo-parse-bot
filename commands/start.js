"use strict";

const users = require('../core/users');

module.exports = async function (msg) {
    await users.add(msg.from);
    return 'Рад знакомству!';
};
