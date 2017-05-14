const express = require('express');
const router = express.Router();

router.get('/:id', (req, res, next) => {
  let id = req.params.id;

  alManager.getLoopById(id, (err, loop) => {
    if (err) {
      res.json({error: err});
      return;
    }

    res.json(loop);
  });
});

module.exports = router;
