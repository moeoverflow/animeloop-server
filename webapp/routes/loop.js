const express = require('express');

const router = express.Router();
const async = require('async');
const Manager = require('../../manager/manager.js');

router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  // temp fix - Telegram url quick look
  const ua = req.get('User-Agent');
  if (ua.indexOf('TelegramBot') > -1) {
    const fileName = `/home/shin/animeloop_library/mp4_720p/${id}.mp4`;
    res.type('video/mp4');
    res.sendFile(fileName, (err) => {
      if (err) {
        next(err);
      } else {
        console.log('Sent:', fileName);
      }
    });
    return;
  }

  async.series({
    loop: (callback) => {
      Manager.getLoopById(id, callback);
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
      loop: data.loop,
      tags: data.tags,
      tagsType: data.tagsType,
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
