class usersAccount {
    constructor() {
        try {
            this.model = global.mongoConnection.model('UsersAccount');
        } catch (e) {
            const UsersAccountSchema = new global.Mongoose.Schema({
                accountName: { type: String }
            }, {
                collection: 'usersAccount',
                versionKey: false
            });
            this.model = global.mongoConnection.model('UsersAccount', UsersAccountSchema);
        }
    }
}

module.exports = usersAccount;
