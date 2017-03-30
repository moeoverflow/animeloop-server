var DBManager = require('./dbmanager');
var config = require('../config');

var manager = new DBManager(config.database);

// var connection = manager.getConnection();

module.exports = manager;