global.express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/environments');
const fs = require('fs');
const path=require('path');
global.ROOT_PATH =  __dirname;
console.log(global.ROOT_PATH)
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

global.__lodash = require('lodash');
global.CONFIG = config;
global.ROOT_PATH = __dirname;

async function init() {

  const Mongo = require('./helper/mongo');

  global.mongoConnect = new Mongo();
  global.mongoConnect.createConnection();
  global.mongoConnect.__loadCollections();

  app.use(cors());
  app.use(cookieParser());

  app.use((req, res, next)=>{
    const path = req.originalUrl;
    next();
  });
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  fs.readdirSync(`./controller`).filter((file) => {
    let stats = fs.statSync(path.join(global.ROOT_PATH,`./controller`,file));
    return (file.indexOf('.controller.js') !== -1 && !stats.isDirectory());
  }).forEach((file) => {
    const Controller = require(path.join(global.ROOT_PATH,`./controller`,file));
    new Controller(app);
  });

  app.get('/api',function(req, res, next) {
    console.log(req.originalUrl);
    res.json({ message: ' welcome to our api!(server1)' });
  });
}

init();


module.exports = app;
