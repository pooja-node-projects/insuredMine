class agent {
    constructor() {
        try {
            this.model = global.mongoConnection.model('Agent');
        } catch (e) {
            const AgentSchema = new global.Mongoose.Schema({
                agent: { type: String }
            }, {
                collection: 'agent',
                versionKey: false
            });
            this.model = global.mongoConnection.model('Agent', AgentSchema);
        }
    }
}

module.exports = agent;
