const {parentPort, workerData} = require("worker_threads");
const _ = require('lodash');

parentPort.on("message", (userRecord) => {
    const objectToAdd = getDataToInsert(userRecord);
    parentPort.postMessage(objectToAdd);
});

function getDataToInsert(collectionName) {
    switch(collectionName){
        case 'Agent':
            return getAgents();
            break;
        case 'User':
            return getUser();
            break;
        case 'UsersAccount':
            return getUsersAccount();
            break;
        case 'Carrier':
            return getCarrier();
            break;
        case 'Lob':
            return getLob();
            break;
        case 'Policy':
            return getPolicies();
            break;
    }
}

function getAgents(){
    let agents = _.uniqBy(_.map(workerData, _.partialRight(_.pick, ['agent'])), 'agent');
    return {agent: agents};
}

function getUser(){
    const allRecords = _.uniqBy(workerData, 'firstname')
    let users = [];
    _.forEach(allRecords, (record)=>{
        users.push({
            "firstname" : record['firstname'],
            "dob" : record['dob'],
            "address" : record['address'],
            "phone" : record['phone'],
            "state" : record['state'],
            "zip" : record['zip'],
            "email" : record['email'],
            "gender" : record['gender'],
            "userType" : record['userType']
        })
    });
    return {user: users};
}

function getUsersAccount(){
    const allRecords = _.uniqBy(workerData, 'account_name')
    let usersAccount = [];
    _.forEach(allRecords, (record)=>{
        usersAccount.push({
            "accountName" : record['account_name'],
        })
    });
    return {usersAccount: usersAccount};
}

function getCarrier(){
    const allRecords = _.uniqBy(workerData, 'company_name')
    let carriers = [];
    _.forEach(allRecords, (record)=>{
        carriers.push({
            "companyName" : record['company_name'],
        })
    });
    return {carrier: carriers};
}

function getLob(){
    const allRecords = _.uniqBy(workerData, 'category_name')
    let lobs = [];
    _.forEach(allRecords, (record)=>{
        lobs.push({
            "categoryName" : record['category_name'],
        })
    });
    return {lob: lobs};
}

function getPolicies(){
    const allRecords = _.uniqBy(workerData, 'policy_number')
    let policies = [];
    _.forEach(allRecords, (record)=>{
        policies.push({
            "policyNumber" : record['policy_number'],
            "policyStartDate" : record['policy_start_date'],
            "policyEndDate" : record['policy_end_date'],
            "policyType" : record['policy_type'],
            "carrierId" : record['carrier_id'] || null,
            "userId" : record['user_id'] || null,
            "userFirstName": record['firstname'],
            "companyName": record['company_name']
        })
    });
    return {policy: policies};
}