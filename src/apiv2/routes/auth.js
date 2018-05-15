const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');

const router = express.Router();
const Database = require('../../core/database.js');
const Response = require('../utils/response.js');
const config = require('../../../config.js');
const recaptcha = require('../middleware/google-recaptcha.js');
const sessionValidate = require('../middleware/session-validate');

const email = require('../utils/email.js');

/*
*
* Login/Logout API
*
* */
router.post('/login', recaptcha, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  validateUser(username, password, (err, doc) => {
    if (err) {
      res.json(err);
      return;
    }

    const data = {
      username: doc.username,
      email: doc.email,
    };

    req.session.authUser = data;
    res.json(Response.returnSuccess(1220001, 'login successfully.', data));
  });
});

router.post('/logout', sessionValidate, (req, res) => {
  req.session.destroy();
  res.json(Response.returnSuccess(1220002, 'logout successfully.'));
});

/*
*
* Register API
*
* */
router.post('/register', recaptcha, (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username) {
    res.json(Response.returnError(1140001, '[username] is empty, please provide a correct one.'));
    return;
  } else if (!isUsername(username)) {
    res.json(Response.returnError(1140002, '[username] must be at least 5 at most 15 characters long, please try another.'));
    return;
  }

  if (!password) {
    res.json(Response.returnError(1140003, '[password] is empty, please provide a correct one.'));
    return;
  } else if (!isPassword(password)) {
    res.json(Response.returnError(1140004, '[password] must be at least 6 at most 17 characters long, please try another.'));
    return;
  }

  if (!email) {
    res.json(Response.returnError(1140005, '[email] is empty, please provide a correct one.'));
    return;
  } else if (!isEmail(email)) {
    res.json(Response.returnError(1140006, '[email] is not in correct format, please try another.'));
    return;
  }

  Database.UserModel.findOne({ username }, (err, doc) => {
    if (err) {
      res.json(Response.returnError(1950301, 'internal server error, database error.'));
      return;
    }

    if (doc) {
      res.send(Response.returnError(1140901, 'this username has been registered.'));
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    Database.UserModel.create({
      username,
      email,
      password: hash,
    }, (err, doc) => {
      if (err) {
        res.json(Response.returnError(1950301, 'internal server error, database error.'));
        return;
      }

      sendEmail(doc, () => {
        res.json(Response.returnSuccess(1120001, 'register successfully.', {}));
      });
    });
  });
});

/*
*
* Email verification API
*
* */
router.get('/verify', (req, res) => {
  const code = req.query.code;

  if (!code) {
    res.json(Response.returnError(1440001, '[code] is empty, please provide a correct one.'));
    return;
  }

  const { action, username } = jwt.decode(code, config.auth.secret);

  if (action === 'verify') {
    Database.UserModel.update({ username }, { $set: { verified: true } }, (err, doc) => {
      if (err) {
        res.json(Response.returnError(1950301, 'internal server error, database error.'));
        return;
      }

      res.json(Response.returnSuccess(1420001, 'verify account successfully.', {
        uid: doc.uid,
        username: doc.username,
      }));
    });
  } else {
    res.json(Response.returnError(1440002, '[code] is invalid, please provide a correct one.'));
  }
});

router.post('/verify/sendemail', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === null || username === undefined) {
    res.json(Response.returnError(1440003, 'empty username or password.'));
    return;
  }
  if (password === null || password === undefined) {
    res.json(Response.returnError(1440003, 'empty username or password.'));
    return;
  }

  validateUser(username, password, (err, doc) => {
    if (err) {
      res.json(Response.returnError(1950301, 'internal server error, database error.'));
      return;
    }

    if (doc.verified === true) {
      res.json(Response.returnSuccess(1420003, 'this account has already been verified', {}));
      return;
    }

    sendEmail(doc, () => {});
    res.json(Response.returnSuccess(1420002, 'send verification email successfully.', {}));
  });
});

function sendEmail(doc, callback) {
  const verifyToken = jwt.encode({
    action: 'verify',
    username: doc.username,
    date: new Date(),
  }, config.auth.secret);
  const verifyUrl = `${config.app.url}/api/v2/auth/verify?code=${verifyToken}`;
  email(doc.email, doc.username, verifyUrl, callback);
}


/*
*
* Token API
*
* */
router.post('/token', sessionValidate, tokenAction('get'));

router.post('/token/new', sessionValidate, tokenAction('new'));

router.post('/token/revoke', sessionValidate, tokenAction('revoke'));


/*
*
* Tool function
*
* */
function validateUser(username, password, callback) {
  Database.UserModel.findOne({ username }, (err, user) => {
    if (err) {
      callback(Response.returnError(1950301, 'service unavailable, database error.'));
      return;
    }

    if (!user) {
      callback(Response.returnError(1240101, 'incorrect username or password.'));
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      callback(Response.returnError(1240101, 'incorrect username or password.'));
      return;
    }

    if (!user.verified) {
      callback(Response.returnError(1240102, 'this account has not yet verified.'));
      return;
    }

    callback(null, user);
  });
}

function tokenAction(type) {
  return (req, res) => {
    const user = req.user;


    if (type === 'get') {
      if (user.token) {
        res.json(Response.returnSuccess(1320001, 'request token successfully.', { token: user.token }));
      } else {
        res.json(Response.returnError(1340401, 'request token failed. token doesn\'t exist.'));
      }
      return;
    }

    let token = null;
    if (type === 'new') {
      token = jwt.encode({
        uid: user.uid,
        username: user.username,
        date: new Date(),
      }, config.auth.secret);
    }

    const username = user.username;
    Database.UserModel.update({ username }, { $set: { token } }, (err) => {
      if (err) {
        res.json(Response.returnError(1950301, 'internal server error, database error.'));
        return;
      }

      const message = (type === 'new') ?
        Response.returnSuccess(1320002, 'request a new token successfully.', { token }) :
        Response.returnSuccess(1320003, 'revoke the token successfully.', {});

      res.json(message);
    });
  };
}

function isUsername(username) {
  const pattern = /^[a-zA-Z0-9_-]{5,15}$/;
  return pattern.test(username);
}

function isPassword(password) {
  const pattern = /^\w{8,32}$/;
  return pattern.test(password);
}

function isEmail(email) {
  const pattern = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;
  return pattern.test(email);
}

module.exports = router;
