"use strict";

const sheets = require('@googleapis/sheets');

let client;

module.exports = {
  async init(config) {
    const auth = new sheets.auth.GoogleAuth({
      keyFilename: config.key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const authClient = await auth.getClient();
    client = await sheets.sheets({
      version: 'v4',
      auth: authClient
    });
  },

  async getDocData(spreadsheetId, range) {
    const result = await client.spreadsheets.values.get({
      spreadsheetId, // spreadsheet id
      range, //range of cells to read from.
    });
    if (result.status !== 200) throw new Error(result.statusText);

    return result.data.values;
  },
};
