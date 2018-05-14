const async = require('async');
const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const request = require('request');

const router = express.Router();
const Database = require('../../core/database.js');
const Response = require('../utils/response.js');
const config = require('../../../config.js');
const email = require('../utils/email.js');


router.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  async.series({
    recaptcha: (callback) => {
      recaptchaValidate(req, res, callback);
    },
    user: (callback) => {
      validateUser(username, password, callback);
    },
  }, (err, results) => {
    if (err) {
      res.json(err);
      return;
    }

    const { user } = results;
    const data = {
      username: user.username,
      email: user.email,
    };
    req.session.authUser = data;
    res.json(Response.returnSuccess('login successfully.', data));
  });
});

router.post('/register', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username) {
    res.json(Response.returnError(40001, '[username] is empty, please provide a correct one.'));
    return;
  } else if (!isUsername(username)) {
    res.json(Response.returnError(40002, '[username] must be at least 5 at most 15 characters long, please try another.'));
    return;
  }

  if (!password) {
    res.json(Response.returnError(40003, '[password] is empty, please provide a correct one.'));
    return;
  } else if (!isPassword(password)) {
    res.json(Response.returnError(40004, '[password] must be at least 6 at most 17 characters long, please try another.'));
    return;
  }

  if (!email) {
    res.json(Response.returnError(400, '[email] is empty, please provide a correct one.'));
    return;
  } else if (!isEmail(email)) {
    res.json(Response.returnError(400, '[email] is not in correct format, please try another.'));
    return;
  }

  async.series({
    recaptcha: (callback) => {
      recaptchaValidate(req, res, callback);
    },
    database: (callback) => {
      Database.UserModel.findOne({ username }, (err, doc) => {
        if (err) {
          res.send(Response.returnError(500, err));
          return;
        }

        if (doc) {
          res.send(Response.returnError(409, 'this username has been registered.'));
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
            res.json(Response.returnError(500, 'database error.'));
            return;
          }
          callback(null, doc);
        });
      });
    },
  }, (err, results) => {
    if (results.database && results.recaptcha) {
      const doc = results.recaptcha;
      sendEmail(doc, () => {});
      res.json(Response.returnSuccess('register successfully.', {}));
    }
  });
});

router.get('/verify', (req, res) => {
  const code = req.query.code;

  if (!code) {
    res.json(Response.returnError(400, '[code] is empty, please provide a correct one.'));
    return;
  }

  const { action, username } = jwt.decode(code, config.auth.secret);

  if (action === 'verify') {
    Database.UserModel.update({ username }, { $set: { verified: true } }, (err, doc) => {
      if (err) {
        res.json(Response.returnError(500, 'database error.'));
        return;
      }

      res.json(Response.returnSuccess('verify successfully.', {
        uid: doc.uid,
        username: doc.username,
      }));
    });
  }
});

router.post('/verify/sendemail', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  Database.UserModel.findOne({ username }, (err, doc) => {
    if (err) {
      res.json(Response.returnError(500, 'database error.'));
      return;
    }

    if (bcrypt.compareSync(password, doc.password)) {
      sendEmail(doc, () => {});
      res.json(Response.returnSuccess('send email successfully.', {}));
    }
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

router.post('/token', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  async.series({
    recaptcha: (callback) => {
      recaptchaValidate(req, res, callback);
    },
    tokenAction: () => {
      tokenAction(username, password, 'get', res);
    },
  });
});

router.post('/token/new', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  async.series({
    recaptcha: (callback) => {
      recaptchaValidate(req, res, callback);
    },
    tokenAction: () => {
      tokenAction(username, password, 'new', res);
    },
  });
});

router.post('/token/revoke', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  async.series({
    recaptcha: (callback) => {
      recaptchaValidate(req, res, callback);
    },
    tokenAction: () => {
      tokenAction(username, password, 'revoke', res);
    },
  });
});

function validateUser(username, password, callback) {
  Database.UserModel.findOne({ username }, (err, user) => {
    if (err) {
      callback(Response.returnError(500, 'database error.'));
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      callback(Response.returnError(401, 'unauthorized.'));
      return;
    }

    if (!user.verified) {
      callback(Response.returnError(401, 'unverified.'));
      return;
    }

    callback(null, user);
  });
}

function tokenAction(username, password, type, res) {
  async.waterfall([
    (callback) => {
      validateUser(username, password, callback);
    },
    (user, callback) => {
      if (type === 'get') {
        callback(null, Response.returnSuccess('request the token successfully.', { token: user.token ? user.token : null }));
        return;
      }

      let token = null;
      if (type === 'new') {
        token = jwt.encode({
          uid: user.uid,
          username: user.username,
        }, config.auth.secret);
      }

      Database.UserModel.update({ username }, { $set: { token } }, (err) => {
        if (err) {
          callback(Response.returnError(500, 'database error.'));
          return;
        }

        const message = (type === 'new') ?
          Response.returnSuccess('request a new token successfully.', { token }) :
          Response.returnSuccess('revoke the token successfully.', {});

        callback(null, message);
      });
    },
  ], (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
}

function recaptchaValidate(req, res, callback) {
  const url = config.recaptcha.url;
  const form = {
    secret: config.recaptcha.secret,
    response: req.body['g-recaptcha-response'],
    remoteip: req.connection.remoteAddress,
  };

  request.post(url, { form }, (err, httpResponse, body) => {
    if (err) {
      callback(err);
      return;
    }
    const data = JSON.parse(body);
    if (!data.success) {
      res.json(Response.returnError(400, 'Google ReCaptcha validation failed.'));
      return;
    }

    callback(null, data);
  });
}

function isUsername(username) {
  const pattern = /^[a-zA-Z0-9_-]{5,15}$/;
  return pattern.test(username);
}

function isPassword(password) {
  const pattern = /^[a-zA-Z]\w{6,17}$/;
  return pattern.test(password);
}

function isEmail(email) {
  const pattern = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;
  return pattern.test(email);
}

module.exports = router;
