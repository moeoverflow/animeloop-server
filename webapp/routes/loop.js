const express = require('express');
const router = express.Router();

router.get('/:id', (req, res, next) => {
  let id = req.params.id;

  alManager.getLoopById(id, (err, loop) => {
    if (err) {
      res.status(404).render('404');
      return;
    }

    res.render('loop', {
      loop
    });
  });
});

router.get('/:id/twitter', (req, res, next) => {
  let id = req.params.id;

  alManager.getLoopById(id, (err, loop) => {
    if (err) {
      res.status(404);
      return;
    }

    res.render('partials/twitter-card-video-container', {
      loop
    });
  });
});

module.exports = router;
