const jwt = require('jwt-simple');

const config = require('../../../config.js');
const Database = require('../../core/database.js');

module.exports = (token, callback) => {
  try {
    const decoded = jwt.decode(token, config.auth.secret);
    Database.UserModel.findOne({ uid: decoded.uid, username: decoded.username }, (err) => {
      if (err) {
        callback('unauthorized.');
        return;
      }

      callback(null, decoded);
    });
  } catch (err) {
    callback('token is invalid, please provide a correct token string.');
  }
};
