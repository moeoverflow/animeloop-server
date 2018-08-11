const express = require('express');
const _ = require('lodash');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const async = require('async');
const mkdirp = require('mkdirp');

const router = express.Router();
const Database = require('../../core/database.js');
const Response = require('../utils/response.js');
const sessionValidate = require('../middleware/session-validate');
const passwordHash = require('../utils/password-hash.js');
const { isEmail, isPassword } = require('../utils/field-validation.js');
const config = require('../../../config.js');

router.get('/get-userinfo', sessionValidate(), (req, res) => {
  const { username } = req.user;
  Database.UserModel.findOne({ username }, (err, doc) => {
    if (err) {
      res.json(Response.returnError(1950301, 'internal server error, database error.'));
      return;
    }
    const data = _.pick(doc, ['uid', 'username', 'email', 'avatar', 'admin', 'verified']);
    res.json(Response.returnSuccess(1520001, 'fetch userinfo success', data));
  });
});

router.post('/update-userinfo', sessionValidate(), (req, res) => {
  const { username } = req.user;

  const email = req.body.email;
  const password = req.body.newPassword;

  const update = {};
  if (password.length !== 0 && isPassword(password)) {
    update.password = passwordHash(password);
  }
  if (email.length !== 0 && isEmail(email)) {
    update.email = email;
  }

  Database.UserModel.update({ username }, { $set: update }, (err) => {
    if (err) {
      res.json(Response.returnError(1950301, 'internal server error, database error.'));
      return;
    }

    res.json(Response.returnSuccess(1520002, 'update userinfo success'));
  });
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-new-avatar', sessionValidate(), upload.single('avatar'), (req, res) => {
  const user = req.user;
  const { uid } = user;
  const { originalname, buffer } = req.file;

  const extname = path.extname(originalname);

  const savePath = `/users/uid-${uid}/avatar${extname}`;
  const filename = path.join(config.storage.dir.data, savePath);
  const filePath = path.dirname(filename);
  async.series([
    (callback) => {
      if (!fs.existsSync(filePath)) {
        mkdirp.sync(filePath);
      }

      fs.writeFile(filename, buffer, callback);
    },
    (callback) => {
      user.update({
        $set: {
          avatar: savePath,
        },
      }, callback);
    },
  ], (err) => {
    if (err) {
      res.json(Response.returnError(1950301, 'internal server error, database error.'));
      return;
    }

    res.json(Response.returnSuccess(1520003, 'upload new avatar success.', { avatar: savePath }));
  });
});

module.exports = router;
