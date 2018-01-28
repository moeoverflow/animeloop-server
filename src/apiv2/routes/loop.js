const express = require('express');

const router = express.Router();
const Response = require('../utils/response.js');
const DBView = require('../utils/dbview.js');
const Query = require('../utils/query.js');

router.get('/', (req, res) => {
  const queryLength = Object.keys(req.query).length;
  const id = req.query.id;
  if (queryLength === 1) {
    const query = {};

    if (!Query.paramObjectId(id, '_id', query)) {
      res.json(Response.returnError(400, 'query parameter [id] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }

    DBView.findLoop(query, { full: true }, (err, result) => {
      if (err) {
        res.json(err);
        return;
      }
      Response.handleResponse(res)(err, result[0]);
    });
    return;
  }

  Query.loop(req, (err, data) => {
    if (err) {
      res.json(err);
      return;
    }

    DBView.findLoop(data.query, data.opts, Response.handleResponse(res));
  });
});

module.exports = router;
