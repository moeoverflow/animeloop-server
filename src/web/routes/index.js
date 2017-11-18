const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');

router.get('/', (req, res) => {
  Manager.getRandomFullLoops(12, (err, results) => {
    const loops = err ? [] : results;

    res.render('index', {
      pageType: 'home',
      loops,
    });
  });
});

module.exports = router;
