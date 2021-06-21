const moment = require('moment');

class ScheduledMessage {
    constructor(app){
        const router = global.express.Router();
        router.post('/', this.scheduleMessage);
        app.use('/scheduled-message', router);
    }

    async scheduleMessage(req, res){
        try {
            if (!req.body.message) {
                throw 'Please provide message';
            }
            if (!req.body.date) {
                throw 'Please provide date';
            }
            if (!req.body.time) {
                throw 'Please provide time';
            }
            const timestamp = moment(`${req.body.date} ${req.body.time}`).format('X')
            await global.mongoConnection.models['ScheduledMessages']
                .create({
                    message: req.body.message,
                    scheduledAt: timestamp
                });
            res.send('Message scheduled')
        } catch (e) {
            res.send(e);
        }
    }

}

module.exports = ScheduledMessage;