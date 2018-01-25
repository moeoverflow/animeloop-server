const express = require('express');

const router = express.Router();
const Response = require('../utils/response.js');
const DBView = require('../utils/dbview.js');
const Query = require('../utils/query.js');


router.get('/', (req, res) => {
  const queryLength = Object.keys(req.query).length;
  const id = req.query.id;
  if (queryLength === 1 && id) {
    DBView.findSeries({
      _id: id,
    }, {}, (err, result) => {
      if (err) {
        res.json(err);
        return;
      }
      Response.handleResponse(res)(null, result[0]);
    });
    return;
  }

  Query.series(req, (err, data) => {
    if (err) {
      res.json(err);
      return;
    }
    DBView.findSeries(data.query, data.opts, Response.handleResponse(res));
  });
});

router.get('/season', (req, res) => {
  DBView.findSeriesSeason(Response.handleResponse(res));
})

module.exports = router;
