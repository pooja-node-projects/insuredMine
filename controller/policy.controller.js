const Multer = require('multer');
const fs = require('fs');
const parse = require('csv-parse');
const _ = require('lodash');

class Policy {
    constructor(app){
        const router = global.express.Router();
        router.get('/test', async (req, res)=>{
            let agent = await global.mongoConnection.models['Agent'].findOne({agent: 'Alex Watson'});
            console.log(agent);
            res.send(agent);
        });
        router.get('/fibo/:num', async (req, res)=>{
            const num = parseInt(req.params.num);
            console.log(num);
            const fibo = Policy.getFibo(num);
            console.log(`Calculated Fibo - ${fibo}`)
            res.send(`fibo - ${fibo}`);
        });
        router.get('/', this.getPolicies);
        router.get('/user', this.getPoliciesByUser);
        router.post('/import', Multer({dest:'./uploads'}).single('file'), this.uploadCsv);
        app.use('/policy', router);
    }

    static getFibo(n){
        if (n < 2)
            return 1;
        else   return Policy.getFibo(n - 2) + Policy.getFibo(n - 1);
    }

    async uploadCsv(req, res){
        try {
            const filePath = req.file.path;
            let data = await Policy.readCsvFile({filePath});
            const dataToAdd = await Policy.getCsvDataToAddInMongo(data);
            await Policy.addDataToDatabase(dataToAdd);
            res.send('CSV Uploaded');
        } catch (e) {
            res.send(e);
        }
    }

    static async readCsvFile({filePath}){
        return new Promise((resolve, reject)=>{
            let finalJson = [];
            fs.createReadStream(`${global.ROOT_PATH}/${filePath}`)
                .pipe(parse({columns:true,relax:true}))
                .on('data',(csvrow)=>{
                    let newRow={}; /*create new row from file json*/
                    _.forEach(csvrow,(value,key)=>{
                        newRow[_.trim(key,' ')]=value; /*trim key name to map data with header name*/
                    });
                    csvrow=newRow;
                    finalJson.push(csvrow);
                })
                .on('end', (data)=>{
                    //read headers from file
                    fs.readFile(`${global.ROOT_PATH}/${filePath}`, (err, fileData) =>{
                        parse(fileData, {headers: true}, (err, headers) =>{
                            // fs.unlinkSync(filePath);
                            headers[0] = _.map(headers[0], (header)=>{
                                return _.trim(header,' ');
                            });
                            resolve({
                                headers:headers[0],
                                rows:finalJson
                            });
                        });
                    });
                })
                .on('error',(err) =>{
                    console.error('CSV parsing error => '+err);
                    reject('File is invalid.');
                });
        })
    }

    static async getCsvDataToAddInMongo(data){
        const {Worker} = require("worker_threads");
        return new Promise((resolve, reject)=>{
            const worker = new Worker(`${global.ROOT_PATH}/controller/get-data-to-insert.js`, { workerData: data.rows});
            let dbDataToCreate = {
                agent: [], carrier: [], lob: [], policy: [], user: [], usersAccount: []
            };
            worker.on("message", result => {
                if(result.agent){
                    dbDataToCreate.agent = result.agent;
                }
                if(result.carrier){
                    dbDataToCreate.carrier = result.carrier;
                }
                if(result.lob){
                    dbDataToCreate.lob = result.lob;
                }
                if(result.user){
                    dbDataToCreate.user = result.user;
                }
                if(result.usersAccount){
                    dbDataToCreate.usersAccount = result.usersAccount;
                }
                if(result.policy){
                    dbDataToCreate.policy = result.policy;
                }
                console.log(`Data Added for ${Object.keys(result)}`);
                if(dbDataToCreate.policy.length &&
                    dbDataToCreate.user.length &&
                    dbDataToCreate.usersAccount.length &&
                    dbDataToCreate.carrier.length &&
                    dbDataToCreate.lob.length &&
                    dbDataToCreate.agent.length){
                    console.log('===============================================')
                    console.log('All Completed');
                    console.log(`Total Policies - ${dbDataToCreate.policy.length}`)
                    console.log(`Total Agents - ${dbDataToCreate.agent.length}`)
                    console.log(`Total Users - ${dbDataToCreate.user.length}`)
                    console.log(`Total Users Account - ${dbDataToCreate.usersAccount.length}`)
                    console.log(`Total Carrier - ${dbDataToCreate.carrier.length}`)
                    console.log(`Total Lob - ${dbDataToCreate.lob.length}`)
                    console.log('===============================================')
                    resolve(dbDataToCreate);
                }
            });
            worker.on("error", reject);
            worker.postMessage('Agent');
            worker.postMessage('User');
            worker.postMessage('UsersAccount');
            worker.postMessage('Carrier');
            worker.postMessage('Lob');
            worker.postMessage('Policy');
        })
    }

    static async addDataToDatabase(data){
        let collectionNames = ['Agent', 'User', 'UsersAccount', 'Carrier', 'Lob', 'Policy'];
        for(let key of collectionNames){
            switch(key){
                case 'Agent':
                    await global.mongoConnection.models['Agent'].insertMany(
                        data.agent
                    );
                    break;
                case 'User':
                    await global.mongoConnection.models['User'].insertMany(
                        data.user
                    );
                    break;
                case 'UsersAccount':
                    await global.mongoConnection.models['UsersAccount'].insertMany(
                        data.usersAccount
                    );
                    break;
                case 'Carrier':
                    await global.mongoConnection.models['Carrier'].insertMany(
                        data.carrier
                    );
                    break;
                case 'Lob':
                    await global.mongoConnection.models['LOB'].insertMany(
                        data.lob
                    );
                    break;
                case 'Policy':
                    await Policy.addPolicyForUser(data.policy);
                    break;
            }
        }
    }

    static async addPolicyForUser(data){
        for(let policy of data){
            const associatedUser = await global.mongoConnection.models['User'].findOne({
                firstname: policy.userFirstName
            });
            const associatedCarrier = await global.mongoConnection.models['Carrier'].findOne({
                companyName: policy.companyName
            });
            policy.userId = global.Mongoose.Types.ObjectId(associatedUser['_id']);
            policy.carrierId = global.Mongoose.Types.ObjectId(associatedCarrier['_id']);
            delete policy.userFirstName;
            delete policy.companyName;
            await global.mongoConnection.models['Policy'].create(policy);
        }
    }

    async getPolicies(req, res){
        let pageNo = 1;
        let rows = 25;
        let conditionObj = {};
        try {
            if (req.query.pageNo && !_.isNumber(req.query.pageNo)) {
                pageNo = parseInt(req.query.pageNo);
            }
            if (req.query.rows && !_.isNumber(req.query.rows)) {
                rows = parseInt(req.query.rows);
            }
            if (req.query.user) {
                const matchedUsers = await global.mongoConnection.models['User'].find({
                    '$or':[
                        {
                            'firstname': new RegExp(req.query.user, 'i')
                        },
                        {
                            'email': new RegExp(req.query.user, 'i')
                        }
                    ]
                });
                conditionObj.userId = {
                    $in: _.map(matchedUsers, '_id')
                };
            }
            let policies = await global.mongoConnection.models['Policy']
                .find(conditionObj)
                .populate({
                    path: 'userId',
                    model: global.mongoConnection.models['User'],
                })
                .skip((pageNo - 1) * rows)
                .limit(rows)
                .exec();
            res.send(policies)
        } catch (e) {
            res.send(e);
        }
    }

    async getPoliciesByUser(req, res){
        let pageNo = 1;
        let rows = 25;
        try {
            if (req.query.pageNo && !_.isNumber(req.query.pageNo)) {
                pageNo = parseInt(req.query.pageNo);
            }
            if (req.query.rows && !_.isNumber(req.query.rows)) {
                rows = parseInt(req.query.rows);
            }
            let policies = await global.mongoConnection.models['User']
                .aggregate([{
                    $lookup: {
                        from: "policy",
                        localField: "_id",
                        foreignField: "userId",
                        as: "policy"
                    }
                }])
                .skip((pageNo - 1) * rows)
                .limit(rows)
                .exec();
            res.send(policies);
        } catch (e) {
            res.send(e);
        }
    }
}

module.exports = Policy;