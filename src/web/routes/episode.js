const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');

router.get('/:id', (req, res) => {
  const id = req.params.id;

  Manager.getLoopsByEpisode(id, (err, data) => {
    if (err) {
      res.status(404).render('404');
      return;
    }

    if (data.episode === undefined) {
      res.status(404).render('404');
      return;
    }

    res.render('episode', {
      data,
    });
  });
});

module.exports = router;

