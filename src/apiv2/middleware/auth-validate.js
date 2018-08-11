const express = require('express');

const router = express.Router();
const Response = require('../utils/response.js');
const sessionValidate = require('./session-validate.js');
const tokenValidate = require('./token-validate.js');

/**
 * validate cookie session or token
 */
router.use(
  sessionValidate({ returnDirect: false }),
  tokenValidate({ returnDirect: false }),
  (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.json(Response.returnError(1940106, 'session or token validation failed.'));
    }
  },
);

module.exports = router;
