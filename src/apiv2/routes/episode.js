const express = require('express');

const router = express.Router();
const Response = require('../utils/response.js');
const DBView = require('../utils/dbview.js');
const Query = require('../utils/query.js');


router.get('/', (req, res) => {
  const queryLength = Object.keys(req.query).length;
  const id = req.query.id;
  if (queryLength === 1 && id) {
    DBView.findEpisode({
      _id: id,
    }, {
      full: true,
    }, (err, result) => {
      if (err) {
        res.json(err);
        return;
      }
      Response.handleResponse(res)(err, result[0]);
    });
    return;
  }

  Query.episode(req, (err, data) => {
    if (err) {
      res.json(err);
      return;
    }
    DBView.findEpisode(data.query, data.opts, Response.handleResponse(res));
  });
});

module.exports = router;
