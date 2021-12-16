"use strict";

const sender = require('./bot');
const users = require('./users');

module.exports = {
  async sendAll(message) {
    const userIds = await users.getAllIdsToSend();
    return this.send(userIds, message);
  },

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
};

async function errorHandler(userId, err) {
  if (err.message === 'userBlocked') {
    await users.remove(userId);
  }
}
