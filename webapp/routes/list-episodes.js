const async = require('async');
const express = require('express');
const router = express.Router();

router.get('/episodes', (req, res, next) => {
  alManager.getSeries((err, results) => {
    var series = [];
    if (!err) {
      series = results;
    }

    series = series.map((ser) => {
      if (ser.title == 'DEFAULT SERIES') {
        ser.start_date_fuzzy = 0;
      }
      return ser;
    });

    series.sort((prev, next) => {
      return (next.start_date_fuzzy - prev.start_date_fuzzy);
    });

    async.parallelLimit(series.map((ser) => {
      return (callback) => {
        alManager.getEpisodesBySeries(ser._id, callback);
      }
    }), 3, (err, datas) => {
      if (err) {
        datas = [];
      }

      res.render('list-episodes', {
        pageType: 'list-episodes',
        datas
      });
    });
  });
});

module.exports = router;
