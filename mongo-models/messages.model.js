class lob {
    constructor() {
        try {
            this.model = global.mongoConnection.model('Messages');
        } catch (e) {
            const ScheduledMessagesSchema = new global.Mongoose.Schema({
                message: { type: String },
                createdAt: { type: Number, default: Math.floor(Date.now() / 1000) },
                scheduledTime: { type: Number },
            }, {
                collection: 'messages',
                versionKey: false
            });
            this.model = global.mongoConnection.model('Messages', ScheduledMessagesSchema);
        }
    }
}

module.exports = lob;
