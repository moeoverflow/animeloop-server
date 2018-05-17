const express = require('express');

const router = express.Router();
const Database = require('../../core/database.js');
const Response = require('../utils/response.js');


router.use((req, res, next) => {
  if (req.session && req.session.authUser) {
    const username = req.session.authUser.username;
    Database.UserModel.findOne({ username }, (err, user) => {
      if (err) {
        res.json(Response.returnError(1950301, 'internal server error, database error.'));
        return;
      }

      if (!user) {
        res.json(Response.returnError(1940102, 'cookie session validation failed.'));
        return;
      }

      req.user = user;
      next();
    });
  } else {
    res.json(Response.returnError(1940102, 'cookie session validation failed.'));
  }
});

module.exports = router;
