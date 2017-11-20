const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');
const Response = require('../utils/response.js');

router.get('/count', (req, res) => {
  Manager.getEpisodesCount(Response.handleResponse(res));
});

router.get('/page/count', (req, res) => {
  Manager.getEpisodesGroupCount(Response.handleResponse(res));
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  Manager.getEpisode(id, Response.handleResponse(res));
});

router.get('/:id/full', (req, res) => {
  const id = req.params.id;
  Manager.getFullEpisode(id, Response.handleResponse(res));
});

router.get('/', (req, res, next) => {
  const queryLength = Object.keys(req.query).length;
  const seriesId = req.query.series;
  const groupNo = req.query.group;

  if (queryLength === 0) {
    Manager.getEpisodesByGroup(1, Response.handleResponse(res));
  } else if (queryLength === 1 && seriesId) {
    Manager.getEpisodesBySeries(seriesId, Response.handleResponse(res));
  } else if (queryLength === 1 && groupNo) {
    const no = parseInt(groupNo, 10);
    if (isNaN(no)) {
      res.json(Response.returnError(400, 'Invalid page no'));
      return;
    }
    Manager.getEpisodesByGroup(no, Response.handleResponse(res));
  } else {
    next();
  }
});

module.exports = router;
