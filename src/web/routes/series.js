const express = require('express');
const async = require('async');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');

router.get('/:id', (req, res) => {
  const id = req.params.id;

  async.series({
    series: (callback) => {
      Manager.getSeries(id, callback);
    },
    episodes: (callback) => {
      Manager.getEpisodesBySeries(id, callback);
    },
  }, (err, data) => {
    if (err) {
      res.status(404).render('404');
      return;
    }

    res.render('series', {
      data,
    });
  });
});

module.exports = router;

