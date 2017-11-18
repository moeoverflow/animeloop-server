const express = require('express');
const async = require('async');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');

router.get('/:id', (req, res) => {
  const id = req.params.id;

  async.series({
    episode: (callback) => {
      Manager.getFullEpisode(id, callback);
    },
    loops: (callback) => {
      Manager.getLoopsByEpisode(id, callback);
    },
  }, (err, data) => {
    if (err) {
      res.status(404).render('404');
      return;
    }

    res.render('episode', {
      data,
    });
  });
});

module.exports = router;

