const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');
const Response = require('../utils/response.js');

router.get('/count', (req, res) => {
  Manager.getLoopsCount(Response.handleResponse(res));
});

router.get('/page/count', (req, res) => {
  Manager.getLoopsGroupCount(Response.handleResponse(res));
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  Manager.getLoop(id, Response.handleResponse(res));
});

router.get('/:id/full', (req, res) => {
  const id = req.params.id;
  Manager.getFullLoop(id, Response.handleResponse(res));
});

router.get('/', (req, res, next) => {
  const queryLength = Object.keys(req.query).length;
  const episodeId = req.query.episode;
  const seriesId = req.query.series;
  const pageNo = req.query.page;

  if (queryLength === 0) {
    Manager.getLoopsByGroup(1, Response.handleResponse(res));
  } else if (queryLength === 1 && episodeId) {
    Manager.getLoopsByEpisode(episodeId, Response.handleResponse(res));
  } else if (queryLength === 1 && seriesId) {
    Manager.getLoopsBySeries(seriesId, Response.handleResponse(res));
  } else if (queryLength === 1 && pageNo) {
    const no = parseInt(pageNo, 10);
    if (isNaN(no)) {
      res.json(Response.returnError(400, 'Invalid page no'));
      return;
    }
    Manager.getLoopsByGroup(no, Response.handleResponse(res));
  } else {
    next();
  }
});

module.exports = router;
