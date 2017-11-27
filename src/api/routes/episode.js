const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager.js');
const Response = require('../utils/response.js');

/**
 * @api {get} /episode/count Request count of all episodes
 * @apiName GetEpisodeCount
 * @apiDescription get count of all episodes
 * @apiGroup Episode
 *
 * @apiSampleRequest /episode/count
 */
router.get('/count', (req, res) => {
  Manager.getEpisodesCount(Response.handleResponse(res));
});

/**
 * @api {get} /episode/page/count Request count of page of all episodes
 * @apiName GetEpisodePageCount
 * @apiDescription get count of page of all episodes
 * @apiGroup Episode
 *
 * @apiSampleRequest /episode/page/count
 */
router.get('/page/count', (req, res) => {
  Manager.getEpisodesGroupCount(Response.handleResponse(res));
});

/**
 * @api {get} /episode/:id Request a episode by id
 * @apiName GetEpisode
 * @apiDescription get a episode with seriesid by id
 * @apiGroup Episode
 *
 * @apiSampleRequest /episode/598dc3f5d5956c77fbebb842
 */
router.get('/:id', (req, res) => {
  const id = req.params.id;
  Manager.getEpisode(id, Response.handleResponse(res));
});

/**
 * @api {get} /episode/:id Request a full episode by id
 * @apiName GetFullEpisode
 * @apiDescription get a full loop with full series objects by id
 * @apiGroup Episode
 *
 * @apiSampleRequest /episode/598dc3f5d5956c77fbebb842/full
 */
router.get('/:id/full', (req, res) => {
  const id = req.params.id;
  Manager.getFullEpisode(id, Response.handleResponse(res));
});

/**
 * @api {get} /episode?series=:id Request episodes by seriesid
 * @apiName GetEpisodesBySeries
 * @apiDescription get all episodes in specific series
 * @apiGroup Episode
 *
 * @apiSampleRequest /episode?series=598dc3f5d5956c77fbebb841
 */

/**
 * @api {get} /episode?page=:n Request episodes in page n
 * @apiName GetLoopsInPage
 * @apiDescription get all episodes in page n
 * @apiGroup Episode
 *
 * @apiSampleRequest /episode?page=3
 */

/**
 * @api {get} /episode Request episodes in first page
 * @apiName GetLoopsInFirstPage
 * @apiDescription get all episodes in first page
 * @apiGroup Episode
 *
 * @apiSampleRequest /episode
 */
router.get('/', (req, res, next) => {
  const queryLength = Object.keys(req.query).length;
  const seriesId = req.query.series;
  const pageNo = req.query.page;

  if (queryLength === 0) {
    Manager.getEpisodesByGroup(1, Response.handleResponse(res));
  } else if (queryLength === 1 && seriesId) {
    Manager.getEpisodesBySeries(seriesId, Response.handleResponse(res));
  } else if (queryLength === 1 && pageNo) {
    const no = parseInt(pageNo, 10);
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
