const ENV = process.env.NODE_ENV_SA || process.env.NODE_ENV || 'development';
const config = require('./' + ENV);
global.NODE_ENV = ENV;
module.exports = config;
