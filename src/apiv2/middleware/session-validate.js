const Database = require('../../core/database.js');
const Response = require('../utils/response.js');

/**
 * validate session
 * @param returnDirect return response if validation failed.
 */
module.exports = ({ returnDirect } = { returnDirect: true }) => async (req, res, next) => {
  if (req.session && req.session.authUser) {
    const username = req.session.authUser.username;
    try {
      const user = await Database.UserModel.findOne({ username });
      if (user) {
        req.user = user;
        next();
      } else if (returnDirect) {
        res.json(Response.returnError(1940102, 'cookie session validation failed.'));
      } else {
        next();
      }
    } catch (e) {
      if (returnDirect) {
        res.json(Response.returnError(1950301, 'internal server error, database error.'));
      } else {
        next();
      }
    }
  } else if (returnDirect) {
    res.json(Response.returnError(1940103, 'cookie session doesn\'t exist.'));
  } else {
    next();
  }
};