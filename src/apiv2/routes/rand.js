const path = require('path');
const express = require('express');

const router = express.Router();
const config = require('../../../config.js');
const File = require('../../core/file.js');
const Response = require('../utils/response.js');
const DBView = require('../utils/dbview.js');
const Query = require('../utils/query.js');

router.get('/loop', (req, res) => {
  Query.loop(req, (err, data) => {
    if (err) {
      res.json(err);
      return;
    }
    data.opts.random = true;
    DBView.findLoop(data.query, data.opts, Response.handleResponse(res));
  });
});

router.get('/loop-:size.:type', (req, res, next) => {
  const size = req.params.size;
  const type = req.params.type;

  Query.loop(req, (err, data) => {
    if (err) {
      res.json(err);
      return;
    }
    data.opts.random = true;
    data.opts.limit = 1;
    DBView.findLoop(data.query, data.opts, (err, result) => {
      if (err) {
        Response.handleResponse(res)(err);
        return;
      }

      if (result.length === 0) {
        res.sendStatus(404);
        return;
      }

      const loop = result[0];
      const fileName = path.join(config.storage.dir.data, `${type}_${size}`, `${loop.id}.${type}`);
      res.type(File.contentType[`${type}_${size}`]);
      res.sendFile(fileName, next);
    });
  });
});

module.exports = router;
