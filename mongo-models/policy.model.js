class policy {
    constructor() {
        try {
            this.model = global.mongoConnection.model('Policy');
        } catch (e) {
            const UserSchema = new global.Mongoose.Schema({
                policyNumber: { type: String },
                policyStartDate: { type: Date },
                policyEndDate: { type: Date },
                policyType: { type: String },
                carrierId: { type: global.Mongoose.Schema.Types.ObjectId, ref: 'carrier' },
                userId: { type: global.Mongoose.Schema.Types.ObjectId, ref: 'user' },
            }, {
                collection: 'policy',
                versionKey: false
            });
            this.model = global.mongoConnection.model('Policy', UserSchema);
        }
    }
}

module.exports = policy;
