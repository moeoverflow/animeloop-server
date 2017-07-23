const async = require('async');
const express = require('express');
const router = express.Router();
const request = require('request');

const config = require('../../config');

router.get('/', (req, res, next) => {
  async.series({
    seriesCount: alManager.getSeriesCount,
    episodesCount: alManager.getEpisodesCount,
    loopsCount: alManager.getLoopsCount,
    jobs: (callback) => {
      let app = config.automator.app;
      request(`http://${app.auth.username}:${app.auth.password}@${app.host}:${app.port}${app.url}/jobs/0..100/desc`, (error, response, body) => {
        if (error) {
          callback(error, []);
          return;
        }
        var jobs = JSON.parse(body);

        callback(null, {
          active: jobs.filter((job) => {
            return job.state == 'active';
          }).slice(0, 10),
          completed: jobs.filter((job) => {
            return job.state == 'complete' && job.type == 'upload';
          }).slice(0, 10)
        });
      });
    }
  }, (err, status) => {
    if (err) {
      next();
      return;
    }
    res.render('status', {
      status
    });
  });
});

module.exports = router;

