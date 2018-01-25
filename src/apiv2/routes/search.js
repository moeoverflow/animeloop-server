const express = require('express');

const router = express.Router();
const Response = require('../utils/response.js');
const DBView = require('../utils/dbview.js');
const Query = require('../utils/query.js');

router.get('/series', (req, res) => {
  const value = req.query.value;

  Query.series(req, (err, data) => {
    if (err) {
      res.json(err);
      return;
    }

    const queries = value
      .split(' ')
      .map((q) => {
        q = q.replace(' ', '');
        return [
          'title',
          'title_romaji',
          'title_english',
          'title_japanese',
          'description',
          'season',
          'genres',
          'type',
        ].map((item) => {
          const obj = {};
          obj[item] = { $regex: q, $options: 'i' };
          return obj;
        });
      });

    data.query.$and = queries
      .map(q => ({
        $or: q,
      }));
    DBView.findSeries(data.query, data.opts, Response.handleResponse(res));
  });
});

module.exports = router;
