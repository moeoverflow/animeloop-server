const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');

router.get('/loop', (req, res) => {
  Manager.getRandomLoops(1, (err, loops) => {
    if (err) {
      res.json({
        error: err,
      });
      return;
    }
    res.json(loops[0]);
  });
});

router.get('/loop/:n', (req, res) => {
  const n = req.params.n;

  Manager.getRandomLoops(n, (err, loops) => {
    if (err) {
      res.json({
        error: err,
      });
      return;
    }
    res.json(loops);
  });
});




module.exports = router;
