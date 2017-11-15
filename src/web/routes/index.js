const express = require('express');
const router = express.Router();
const log4js = require('log4js');

const logger = log4js.getLogger('router');
const Manager = require('../../core/manager/manager.js');

router.get('/', (req, res) => {
  Manager.getRandomLoops(12, (err, results) => {
    let loops = [];
    if (!err) {
      loops = results;
    }

    loops = loops.filter((loop) => {
      if (loop.series !== undefined && loop.episode !== undefined) {
        return true;
      }

      // eslint-disable-next-line no-underscore-dangle
      logger.debug(`loop ${loop._id} series == undefined`);
      return false;
    });

    res.render('index', {
      pageType: 'home',
      loops,
    });
  });
});

module.exports = router;
