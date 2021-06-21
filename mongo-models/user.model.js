class user {
    constructor() {
        try {
            this.model = global.mongoConnection.model('User');
        } catch (e) {
            const UserSchema = new global.Mongoose.Schema({
                firstname: { type: String },
                dob: { type: Date },
                address: { type: String },
                phone: { type: String },
                state: { type: String },
                zip: { type: String },
                email: { type: String },
                gender: { type: String },
                userType: { type: String }
            }, {
                collection: 'user',
                versionKey: false
            });
            this.model = global.mongoConnection.model('User', UserSchema);
        }
    }
}

module.exports = user;
