const async = require('async');
const express = require('express');
const request = require('request');

const router = express.Router();
const config = require('../../config');
const Manager = require('../../manager/manager.js');


router.get('/', (req, res, next) => {
  async.series({
    seriesCount: Manager.getSeriesCount,
    episodesCount: Manager.getEpisodesCount,
    loopsCount: Manager.getLoopsCount,
    jobs: (callback) => {
      const app = config.automator.app;
      request(`http://${app.auth.username}:${app.auth.password}@${app.host}:${app.port}${app.url}/jobs/0..100/desc`, (error, response, body) => {
        if (error) {
          callback(error, []);
          return;
        }
        const jobs = JSON.parse(body);

        callback(null, {
          active: jobs.filter(job => job.state === 'active').slice(0, 10),
          completed: jobs.filter(job => job.state === 'complete' && job.type === 'upload').slice(0, 10),
        });
      });
    },
  }, (err, status) => {
    if (err) {
      next();
      return;
    }
    res.render('status', {
      status,
    });
  });
});

module.exports = router;

