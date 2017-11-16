const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');
const Response = require('../utils/response.js');

router.get('/', (req, res) => {
  if (Object.keys(req.query).length === 0 && req.query.constructor === Object) {
    Manager.getLoopsByGroup(1, Response.handleResponse(res));
  } else if (Object.keys(req.query).length === 1 && req.query.constructor === Object) {
    const episodeId = req.query.episode;
    const seriesId = req.query.series;
    const groupNo = req.query.group;

    if (episodeId !== undefined) {
      Manager.getLoopsByEpisode(episodeId, Response.handleResponse(res));
    } else if (seriesId !== undefined) {
      Manager.getLoopsBySeries(seriesId, Response.handleResponse(res));
    } else if (groupNo !== undefined) {
      const no = parseInt(groupNo, 10);

      if (isNaN(no)) {
        res.json(Response.returnError(400, 'Wrong group no'));
        return;
      }

      Manager.getLoopsByGroup(groupNo, Response.handleResponse(res));
    }
  }
});

router.get('/count', (req, res) => {
  Manager.getLoopsCount((err, count) => {
    if (err) {
      res.json(Response.returnError(404, err.message));
      return;
    }

    res.json(Response.returnSuccess(200, 'success', { count }));
  });
});


module.exports = router;
