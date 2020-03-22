"use strict";

const sender = require('./bot');
const users = require('./users');

module.exports = {
  async send(userIds, message) {
    await this._sendToUsers(userIds, message);
  },

  async _sendToUsers(userIds, message) {
    for (let userId of userIds) {
      await this._sendToUser(userId, message);
    }
  },

  async _sendToUser(userId, message) {
    try {
      await sender.sendToUser(userId, message);
    } catch (err) {
      await errorHandler(userId, err);
    }
  },

  async sendMany(userIds, messages) {
    for (let message of messages) {
      await this._sendToUsers(userIds, message);
    }
  },
};

async function errorHandler(userId, err) {
  if (err.message === 'userBlocked') {
    await users.remove(userId);
  }
}
