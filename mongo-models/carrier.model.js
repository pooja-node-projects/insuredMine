class carrier {
    constructor() {
        try {
            this.model = global.mongoConnection.model('Carrier');
        } catch (e) {
            const CarrierSchema = new global.Mongoose.Schema({
                companyName: { type: String }
            }, {
                collection: 'carrier',
                versionKey: false
            });
            this.model = global.mongoConnection.model('Carrier', CarrierSchema);
        }
    }
}

module.exports = carrier;
