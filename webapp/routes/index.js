const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  alManager.getRandomLoops(12, (err, results) => {
    var loops = [];
    if (!err) {
      loops = results;
    }

    res.render('index', {
      activeMenu: 'home',
      loops
    });
  })


});

module.exports = router;
