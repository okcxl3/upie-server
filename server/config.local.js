'use strict';
const {REST_API_ROOT,HOST,PORT,getEnvironment} = require("../globalConfig");
const env = getEnvironment(process.env.NODE_ENV);
const p = require('../package.json');
const version = p.version.split('.').shift();

module.exports = {
  restApiRoot : REST_API_ROOT[env] + (version > 0 ? '/v' + version : ''),
  host : HOST[env],
  port : PORT[env]
};
