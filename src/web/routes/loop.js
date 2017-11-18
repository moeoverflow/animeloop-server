const express = require('express');
const async = require('async');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');
const telegram = require('../../middlewares/telegram.js');

router.get('/:id', telegram, (req, res) => {
  const id = req.params.id;

  async.series({
    loop: (callback) => {
      Manager.getFullLoop(id, callback);
    },
    tags: (callback) => {
      Manager.getTagsByLoop(id, callback);
    },
  }, (err, data) => {
    if (err) {
      res.status(404).render('404');
      return;
    }

    data.tags = data.tags.map((tag) => {
      tag.confidence = Math.ceil(tag.confidence * 100);
      return tag;
    });

    res.render('loop', {
      series: data.loop.series,
      episode: data.loop.episode,
      loop: data.loop,
      tags: data.tags,
    });
  });
});

router.get('/:id/twitter', (req, res) => {
  const id = req.params.id;

  Manager.getLoopById(id, (err, loop) => {
    if (err) {
      res.status(404);
      return;
    }

    res.render('partials/twitter-card-video-container', {
      loop,
    });
  });
});

module.exports = router;
