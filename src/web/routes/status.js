const async = require('async');
const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager.js');

router.get('/', (req, res, next) => {
  async.parallel({
    seriesCount: Manager.getSeriesesCount,
    episodesCount: Manager.getEpisodesCount,
    loopsCount: Manager.getLoopsCount,
  }, (err, status) => {
    if (err) {
      next();
      return;
    }
    res.render('status', {
      pageType: 'status',
      status,
    });
  });
});

module.exports = router;

