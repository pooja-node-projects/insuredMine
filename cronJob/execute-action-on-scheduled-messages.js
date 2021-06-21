global.CONFIG = require('../config/environments');
global.__lodash = require('lodash');
const moment = require('moment');
const path = require('path');
global.ROOT_PATH = path.join(__dirname, '..');

const Mongo = require('../helper/mongo');
global.mongoConnect = new Mongo();
global.mongoConnect.createConnection();
global.mongoConnect.__loadCollections();

class ExecuteActionOnScheduledMessages {
    async init() {
        try {
            let scheduledMessages = await global.mongoConnection.models['ScheduledMessages'].find({
                scheduledAt: {
                    '$lte': moment().unix()
                }
            });
            for(let scheduledMessage of scheduledMessages){
                await global.mongoConnection.models['Messages'].create({
                    scheduledTime: scheduledMessage.scheduledAt,
                    message: scheduledMessage.message
                });
                await scheduledMessage.delete();
            }
            await global.Mongoose.connection.close();
        } catch (error) {
            console.error(error);
        }
        this.exitProcess();
    }

    exitProcess() {
        process.exit(0);
    }
}

const executeActionOnScheduledMessagesInstance = new ExecuteActionOnScheduledMessages();
executeActionOnScheduledMessagesInstance.init();
