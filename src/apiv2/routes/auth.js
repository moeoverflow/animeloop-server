const express = require('express');
const jwt = require('jwt-simple');

const router = express.Router();
const Database = require('../../core/database.js');
const Response = require('../utils/response.js');
const config = require('../../../config.js');
const recaptcha = require('../middleware/google-recaptcha.js');
const sessionValidate = require('../middleware/session-validate.js');
const userValidate = require('../middleware/user-validate.js');
const passwordHash = require('../utils/password-hash.js');
const email = require('../utils/email.js');

/*
*
* Login/Logout
*
* */
router.post('/login', recaptcha, userValidate, (req, res) => {
  const user = req.user;
  const data = {
    username: user.username,
    email: user.email,
  };

  req.session.authUser = data;
  res.json(Response.returnSuccess(1220001, 'login successfully.', data));
});

router.post('/logout', sessionValidate, (req, res) => {
  req.session.destroy();
  res.json(Response.returnSuccess(1220002, 'logout successfully.'));
});

/*
*
* Register
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

    const hash = passwordHash(password);

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
* Email verification
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

/*
*
* Send verification email
*
* */
router.post('/verify/sendemail', userValidate, (req, res) => {
  const user = req.user;
  if (user.verified === true) {
    res.json(Response.returnSuccess(1420003, 'this account has already been verified', {}));
    return;
  }

  sendEmail(user, () => {});
  res.json(Response.returnSuccess(1420002, 'send verification email successfully.', {}));
});


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

function sendEmail(doc, callback) {
  const verifyToken = jwt.encode({
    action: 'verify',
    username: doc.username,
    date: new Date(),
  }, config.auth.secret);
  const verifyUrl = `${config.app.url}/api/v2/auth/verify?code=${verifyToken}`;
  email(doc.email, doc.username, verifyUrl, callback);
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
