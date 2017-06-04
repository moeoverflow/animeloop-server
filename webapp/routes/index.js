const express = require('express');
const router = express.Router();
const log4js = require('log4js');
const logger = log4js.getLogger('router');

router.get('/', (req, res, next) => {
  alManager.getRandomLoops(12, (err, results) => {
    var loops = [];
    if (!err) {
      loops = results;
    }

    loops = loops.filter((loop) => {
      if (loop.series != undefined && loop.episode != undefined) {
        return true;
      } else {
        logger.debug(`loop ${loop._id} series == undefined`);
        return false;
      }
    });

    res.render('index', {
      pageType: 'home',
      loops
    });
  })


});

module.exports = router;
