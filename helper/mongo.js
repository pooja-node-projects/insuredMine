const mongoose = require('mongoose');
// const TenantModel = require('../modules/tenant/tenant.model.generic');
const fs = require('fs');
// const allowedAPIsWithoutTenantLink = require('../config/api-map.json').allowedAPIsWithoutTenantLink;
// const msSQLConnection = require('../sql/mssql/connection');
class MongoConnect {
    constructor() {
        this.mongoConnections = {};
        // this.sqlConnections = {};
    }

    createConnection() {
        const mongoConfig = global.CONFIG['mongo'];
        const username = mongoConfig['username'];
        const password = mongoConfig['password'];
        const hosts = mongoConfig.host;
        const database = mongoConfig.db;

        this.uri = 'mongodb://';

        if (username !== '' && password !== '') {
            this.uri += `${username}:${password}@`;
        }

        this.uri += `${hosts}/${database}?authSource=admin`;

        const options = {
            autoIndex: false, // Don't build indexes
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 500, // Reconnect every 500ms
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0
        };
        global.Mongoose = mongoose;
        const client = mongoose.createConnection(this.uri, options);
        client.on('connected', () => {
            console.info(`Worker ${global.process.pid} connected to Mongo Database ${database}`);
        });

        // When the connection is disconnected
        client.on('disconnected', () => {
            console.info(`Worker ${global.process.pid} disconnected to Mongo Database ${database}`);
        });
        global.mongoConnection = client;
    }

    connectMaster() {
        const mongoConfig = global.CONFIG['mongo'];
        const username = mongoConfig['username'];
        const password = mongoConfig['password'];
        const hosts = mongoConfig['host'][0].host;
        const database = mongoConfig['db_name'];
        const debug = mongoConfig['debug'] || false;

        this.uri = 'mongodb://';

        if (username !== '' && password !== '') {
            this.uri += `${username}:${password}@`;
        }

        this.uri += `${hosts}/${database}?authSource=admin`;

        const options = {
            autoIndex: false, // Don't build indexes
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 500, // Reconnect every 500ms
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0
        };
        mongoose.set('debug', debug);
        global.Mongoose = mongoose;
        mongoose
            .connect(this.uri, options)
            .then(
                () => {
                    console.info(`Worker ${process.pid} connected to Mongo Database`);
                },
                err => {
                    console.error(`Worker ${process.pid} failed connecting to Mongo Database: ${err}`);
                }
            );
    }

    __getDBConnection(database) {
        if(this.mongoConnections[database]) {
            return this.mongoConnections[database];
        }
        let uri = 'mongodb://';
        const mongoConfig = global.CONFIG['mongo'];
        const username = mongoConfig['username'];
        const password = mongoConfig['password'];
        const hosts = mongoConfig['host'][0].host;
        if (username !== '' && password !== '') {
            uri += `${username}:${password}@`;
        }

        uri += `${hosts}/${database}?authSource=admin`;

        const options = {
            autoIndex: false, // Don't build indexes
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 500, // Reconnect every 500ms
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0
        };
        const client = mongoose.createConnection(uri, options);
        this.__loadCollections(client);
        client.on('connected', () => {
            console.info(`Worker ${global.process.pid} connected to Mongo Database ${database}`);
        });

        // When the connection is disconnected
        client.on('disconnected', () => {
            console.info(`Worker ${global.process.pid} disconnected to Mongo Database ${database}`);
        });
        this.mongoConnections[database] = client;
        return client;
    }

    __loadCollections(client) {
        fs.readdirSync(`${global.ROOT_PATH}/mongo-models`)
            .filter((moduleDirectory) => {
                /*const foundFileObj = fs.statSync(`${global.ROOT_PATH}/mongo-models/${moduleDirectory}`);
                return (moduleDirectory.indexOf('.') !== 0 && foundFileObj.isDirectory());*/
                const Model = require(`${global.ROOT_PATH}/mongo-models/${moduleDirectory}`);
                new Model(client);
                /*fs.readdirSync(`../mongo-models/${moduleDirectory}`)
                    .filter((foundFileObj)=>{
                        return (foundFileObj.indexOf('.') !== 0 && foundFileObj.endsWith('.model.js'));
                    })
                    .forEach((file) => {
                        const Model = require(`${global.ROOT_PATH}/modules/${moduleDirectory}/${file}`);
                        new Model(client);
                    });*/
            })
            /*.forEach((moduleDirectory)=>{
                fs.readdirSync(`${global.ROOT_PATH}/modules/${moduleDirectory}`)
                    .filter((foundFileObj)=>{
                        return (foundFileObj.indexOf('.') !== 0 && foundFileObj.endsWith('.model.js'));
                    })
                    .forEach((file) => {
                        const Model = require(`${global.ROOT_PATH}/modules/${moduleDirectory}/${file}`);
                        new Model(client);
                    });
            });*/
    }

    connectAMS() {
        const mongoConfig = global.CONFIG['amsmongo'];
        const username = mongoConfig['username'];
        const password = mongoConfig['password'];
        const hosts = mongoConfig['host'][0].host;
        const database = mongoConfig['db_name'];

        this.uri = 'mongodb://';

        if (username !== '' && password !== '') {
            this.uri += `${username}:${password}@`;
        }

        this.uri += `${hosts}/${database}?authSource=admin`;

        const options = {
            autoIndex: false, // Don't build indexes
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 500, // Reconnect every 500ms
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0
        };
        global.Mongoose = mongoose;
        const client = mongoose.createConnection(this.uri, options);
        client.on('connected', () => {
            console.info(`Worker ${global.process.pid} connected to Mongo Database ${database}`);
        });

        // When the connection is disconnected
        client.on('disconnected', () => {
            console.info(`Worker ${global.process.pid} disconnected to Mongo Database ${database}`);
        });
        global.AMSDB = client;
    }

    static async setIndexes({ collection, indexes }) {
        global.AMSDB.collection(collection, function (err, collection) {
            collection.indexes()
                .then((existingIndexes)=>{
                    for(const index of indexes) {
                        if (!existingIndexes.find(filterObj=> filterObj.name === index.indexName)) { // If no such index is found, create new index
                            const indexObj = {};
                            indexObj[index.indexFor] = 1;
                            collection.createIndex(indexObj, index.options || {});
                        }
                    }
                });
        });
    }

}

module.exports = MongoConnect;
