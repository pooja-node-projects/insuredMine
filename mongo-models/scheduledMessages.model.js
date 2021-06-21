class lob {
    constructor() {
        try {
            this.model = global.mongoConnection.model('ScheduledMessages');
        } catch (e) {
            const ScheduledMessagesSchema = new global.Mongoose.Schema({
                message: { type: String },
                createdAt: { type: Number, default: Math.floor(Date.now() / 1000) },
                scheduledAt: { type: Number },
            }, {
                collection: 'scheduledMessages',
                versionKey: false
            });
            this.model = global.mongoConnection.model('ScheduledMessages', ScheduledMessagesSchema);
        }
    }
}

module.exports = lob;
