const express = require('express');
const jwt = require('jwt-simple');
const _ = require('lodash');

const router = express.Router();
const Database = require('../../core/database.js');
const Response = require('../utils/response.js');
const config = require('../../../config.js');
const recaptcha = require('../middleware/google-recaptcha.js');
const sessionValidate = require('../middleware/session-validate.js');
const userValidate = require('../middleware/user-validate.js');
const passwordHash = require('../utils/password-hash.js');
const email = require('../utils/email.js');
const { isEmail, isPassword, isUsername } = require('../utils/field-validation.js');
/*
*
* Login/Logout
*
* */
router.post('/login', recaptcha, userValidate, (req, res) => {
  const data = _.pick(req.user, ['username', 'email', 'uid']);
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

      sendEmail(doc, () => {});
      res.json(Response.returnSuccess(1120001, 'register successfully.', {}));
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

  sendEmail(user, (err) => {
    if (err) {
      res.json(Response.returnError(1450301, 'mail smtp server error.'));
      return;
    }

    res.json(Response.returnSuccess(1420002, 'send verification email successfully.', {}));
  });
});


/*
*
* Token
*
* */

router.get('/token', sessionValidate, (req, res) => {
  const user = req.user;
  console.log(user.uid);
  Database.UserTokenModel.find({
    userid: user.uid,
  }, (err, docs) => {
    if (err) {
      res.json(Response.returnError(1950301, 'internal server error, database error.'));
      return;
    }
    const data = docs.map(doc => _.pick(doc, ['_id', 'name', 'token']));
    res.json(Response.returnSuccess(1320001, 'get token success.', data));
  });
});

router.post('/token/new', sessionValidate, (req, res) => {
  const user = req.user;
  const { name } = req.body;

  const token = jwt.encode({
    uid: user.uid,
    username: user.username,
    date: new Date(),
  }, config.auth.secret);

  Database.UserTokenModel.create({
    name,
    token,
    userid: user.uid,
  }, (err, doc) => {
    if (err) {
      res.json(Response.returnError(1950301, 'internal server error, database error.'));
      return;
    }
    const data = _.pick(doc, ['_id', 'name', 'token']);
    res.json(Response.returnSuccess(1320002, 'create a new token success.', data));
  });
});


router.post('/token/revoke', sessionValidate, (req, res) => {
  const { id } = req.body;

  Database.UserTokenModel.remove({
    _id: id,
  }, (err) => {
    if (err) {
      console.log(err);
      res.json(Response.returnError(1950301, 'internal server error, database error.'));
      return;
    }
    res.json(Response.returnSuccess(1320003, 'revoke the token success.'));
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

module.exports = router;
