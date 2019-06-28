'use strict';
const {getEnvironment,MONGODB_CONFIG,STORAGE_CONFIG} = require("../globalConfig");
const env = getEnvironment(process.env.NODE_ENV);

module.exports = {
  mongodb : MONGODB_CONFIG[env],
  storage : STORAGE_CONFIG[env]
};
