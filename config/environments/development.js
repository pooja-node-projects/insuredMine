module.exports = {
    "server": {
        port: 8082,
        host: '0.0.0.0',
        urlPrefix: 'https://',
        apiDomain: 'http://127.0.0.1:8081'
    },
    "v3-server": {
        port: 8087,
        host: '0.0.0.0',
        urlPrefix: 'https://',
        apiDomain: 'http://127.0.0.1:8087',
        internalClusterApiDomain: 'http://127.0.0.1:8087'
    },
    "mongo": {
        host: 'localhost',
        port: 27017,
        db: 'insured-mine-2', //jshint ignore: line
        username: '',
        password: ''
    },
    "nodeQueue": {
        host: 'localhost',
        port: 27017,
        db_name: 'insured-mine', //jshint ignore: line
        username: 'root',
        password: 'root'
    }
};