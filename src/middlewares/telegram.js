const path = require('path');
const express = require('express');

const router = express.Router();
const config = require('../../config.js');

router.use('/:id', (req, res, next) => {
  const id = req.params.id;
  const ua = req.get('User-Agent');

  if (ua.indexOf('TelegramBot') > -1) {
    const fileName = path.join(config.storage.dir.data, 'mp4_720p', `${id}.mp4`);
    res.type('video/mp4');
    res.sendFile(fileName, next);
  } else {
    next();
  }
});

module.exports = router;
