const DEV = "development";
const PROD = "production";
const STAG = "staging";
const NODE_ENV_ARR = [DEV,PROD,STAG];

function getEnvironment(mode){
  if (!NODE_ENV_ARR.includes(mode)) mode = DEV;
  return mode;
}

/**
 * =========================
 * ==   other constants   ==
 * =========================
 */

const X_API_TOKEN = {
  [DEV] : "",
  [PROD] : "",
  [STAG] : ""
};

const IOS_PUSH_URL = {
  [DEV] : "",
  [PROD] : "",
  [STAG] : ""
};

const ANDROID_PUSH_URL = {
  [DEV] : "",
  [PROD] : "",
  [STAG] : ""
};


/**
 * =====================
 * ==   config.json   ==
 * =====================
 */

const REST_API_ROOT = {
  [DEV] : "/api",
  [PROD] : "/api",
  [STAG] : "/api"
};

const HOST = {
  [DEV] : "0.0.0.0",
  [PROD] : "0.0.0.0",
  [STAG] : "0.0.0.0"
};

const PORT = {
  [DEV] : 3000,
  [PROD] : 3000,
  [STAG] : 3000
};

/**
 * ======================
 * == datasources.json ==
 * ======================
 */

const MONGODB_CONFIG = {
  [DEV] : {
      host: "209.97.158.119",
      port: 27017,
      database: "upie",
      password: "password",
      user: "root",
      authSource: "admin",
  },
  [PROD] : {
      host: "localhost",
      port: 27017,
      database: "upie",
      password: "password",
      user: "root",
      authSource: "admin",
  },
  [STAG] : {
      host: "localhost",
      port: 27017,
      database: "upie",
      password: "password",
      user: "root",
      authSource: "admin",
  }
};

const STORAGE_CONFIG = {
  [DEV] : {
    provider: "filesystem",
    root: "./files",           //The ./ there refers to the root of the LoopBack project, not the root of the server directory as you may think. ?????,
    maxFileSize:  "10485763",
    nameConflict: "makeUnique"
  },
  [PROD] : {
    provider: "filesystem",
    root: "./files"
  },
  [STAG] : {
    provider: "filesystem",
    root: "./files"
  }
};

/**
 * =====================
 * == middleware.json ==
 * =====================
 */

const FILES = {
  [DEV] : {

  },
  [PROD] : {

  },
  [STAG] : {

  }
};

module.exports = {
  getEnvironment,REST_API_ROOT,HOST,PORT,MONGODB_CONFIG,STORAGE_CONFIG,FILES,X_API_TOKEN,IOS_PUSH_URL,ANDROID_PUSH_URL
};




