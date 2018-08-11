const Database = require('../../core/database.js');
const Response = require('../utils/response.js');

/**
 * validate token
 * @param returnDirect return response if validation failed.
 */
module.exports = ({ returnDirect } = { returnDirect: true }) => async (req, res, next) => {
  const token = req.body.token || req.query.token;

  if (token) {
    try {
      const userToken = await Database.UserTokenModel.findOne({ token });
      if (userToken) {
        const user = await Database.UserModel.findById(userToken.userid);
        if (user) {
          req.user = user;
          next();
        } else if (returnDirect) {
          res.json(Response.returnError(1940105, 'token validation failed.'));
        } else {
          next();
        }

      }
    } catch (e) {
      if (returnDirect) {
        res.json(Response.returnError(1950301, 'internal server error, database error.'));
      } else {
        next();
      }
    }
  } else if (returnDirect) {
    res.json(Response.returnError(1940104, 'token doesn\'t exist.'));
  } else {
    next();
  }
};
