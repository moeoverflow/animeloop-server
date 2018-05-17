const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();
const Database = require('../../core/database.js');
const Response = require('../utils/response.js');


router.use((req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === null || username === undefined || username.length === 0) {
    res.json(Response.returnError(1940104, 'username is empty.'));
    return;
  }
  if (password === null || password === undefined || password.length === 0) {
    res.json(Response.returnError(1940105, 'password is empty.'));
    return;
  }

  Database.UserModel.findOne({ username }, (err, user) => {
    if (err) {
      res.json(Response.returnError(1950301, 'internal server error, database error.'));
      return;
    }

    if (!user) {
      res.json(Response.returnError(1940106, 'incorrect username or password.'));
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.json(Response.returnError(1940106, 'incorrect username or password.'));
      return;
    }

    req.user = user;
    next();
  });
});

module.exports = router;
