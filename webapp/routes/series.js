const express = require('express');
const router = express.Router();

router.get('/:id', (req, res, next) => {
  let id = req.params.id;

  alManager.getEpisodesBySeries(id, (err, data) => {
    if (err) {
      res.status(404).render('404');
      return;
    }

    if (data.series == undefined) {
      res.status(404).render('404');
      return;
    }

    res.render('series', {
      data
    });
  });
});

module.exports = router;

