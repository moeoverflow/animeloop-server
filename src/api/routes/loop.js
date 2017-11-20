const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');
const Response = require('../utils/response.js');

/**
 * @api {get} /loop/count Request count of all loops
 * @apiName GetLoopCount
 * @apiDescription get count of all loops
 * @apiGroup Loop
 *
 * @apiSampleRequest /loop/count
 */
router.get('/count', (req, res) => {
  Manager.getLoopsCount(Response.handleResponse(res));
});

/**
 * @api {get} /loop/page/count Request count of page of all loops
 * @apiName GetLoopPageCount
 * @apiDescription get count of page of all loops
 * @apiGroup Loop
 *
 * @apiSampleRequest /loop/page/count
 */
router.get('/page/count', (req, res) => {
  Manager.getLoopsGroupCount(Response.handleResponse(res));
});

/**
 * @api {get} /loop/:id Request a loop by id
 * @apiName GetLoop
 * @apiDescription get a loop with seriesid and episodeid by id
 * @apiGroup Loop
 *
 * @apiSampleRequest /loop/59edf04f6658ad05762276dd
 */
router.get('/:id', (req, res) => {
  const id = req.params.id;
  Manager.getLoop(id, Response.handleResponse(res));
});

/**
 * @api {get} /loop/:id Request a full loop by id
 * @apiName GetLoop
 * @apiDescription get a full loop with full series and episode objects by id
 * @apiGroup Loop
 *
 * @apiSampleRequest /loop/59edf04f6658ad05762276dd
 */
router.get('/:id/full', (req, res) => {
  const id = req.params.id;
  Manager.getFullLoop(id, Response.handleResponse(res));
});

/**
 * @api {get} /loop?episode=:id Request loops by episodeid
 * @apiName GetLoopsByEpisode
 * @apiDescription get all loops in specific episode
 * @apiGroup Loop
 *
 * @apiSampleRequest /loop?episode=59b6f3e29be5ab05f5261fb2
 */

/**
 * @api {get} /loop?series=:id Request loops by seriesid
 * @apiName GetLoopsBySeries
 * @apiDescription get all loops in specific series
 * @apiGroup Loop
 *
 * @apiSampleRequest /loop?series=598dc3f5d5956c77fbebb841
 */

/**
 * @api {get} /loop?page=:n Request loops in page n
 * @apiName GetLoopsInPage
 * @apiDescription get all loops in page n
 * @apiGroup Loop
 *
 * @apiSampleRequest /loop?page=3
 */

/**
 * @api {get} /loop Request loops in first page
 * @apiName GetLoopsInFirstPage
 * @apiDescription get all loops in first page
 * @apiGroup Loop
 *
 * @apiSampleRequest /loop
 */
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
