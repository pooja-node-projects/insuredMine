const app = require('./app');
const config = require('./config/environments');
// eslint-disable-next-line new-cap
const server = require('http').Server(app);
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; //Remove the ssl certificate error for SOAP APIs
server.listen(config.server.port, config.server.host, function () {
  console.log('------------- App running on port', config.server.port);
});
