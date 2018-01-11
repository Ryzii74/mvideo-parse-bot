"use strict";

const nconf = require('nconf');
const path = require('path');

nconf.argv()
    .env();

const env = nconf.get('NODE_ENV');
if (env) {
    nconf.file(env, path.join(__dirname, `./configs/${env}.json`));
}

nconf.file('default', path.join(__dirname, './configs/default.json'));

module.exports = nconf.get();