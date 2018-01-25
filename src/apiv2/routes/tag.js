const express = require('express');

const router = express.Router();
const Response = require('../utils/response.js');
const DBView = require('../utils/dbview.js');
const Query = require('../utils/query.js');

router.get('/', (req, res) => {
  Query.tag(req, (err, data) => {
    if (err) {
      res.json(err);
      return;
    }
    DBView.findTag(data.query, data.opts, Response.handleResponse(res));
  });
});

module.exports = router;
