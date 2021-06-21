class lob {
    constructor() {
        try {
            this.model = global.mongoConnection.model('LOB');
        } catch (e) {
            const LobSchema = new global.Mongoose.Schema({
                categoryName: { type: String }
            }, {
                collection: 'lob',
                versionKey: false
            });
            this.model = global.mongoConnection.model('LOB', LobSchema);
        }
    }
}

module.exports = lob;
