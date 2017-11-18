const express = require('express');

const router = express.Router();

router.use('/:id', (req, res, next) => {
  const id = req.params.id;
  const ua = req.get('User-Agent');

  if (ua.indexOf('TelegramBot') > -1) {
    const fileName = `/home/shin/animeloop_library/mp4_720p/${id}.mp4`;
    res.type('video/mp4');
    res.sendFile(fileName, next);
  } else {
    next();
  }
});

module.exports = router;
