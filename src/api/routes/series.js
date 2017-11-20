const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');
const Response = require('../utils/response.js');

/**
 * @api {get} /series/count Request count of all series
 * @apiName GetSeriesCount
 * @apiDescription get count of all series
 * @apiGroup Series
 *
 * @apiSampleRequest /series/count
 */
router.get('/count', (req, res) => {
  Manager.getSeriesesCount(Response.handleResponse(res));
});

/**
 * @api {get} /series/page/count Request count of page of all series
 * @apiName GetSeriesPageCount
 * @apiDescription get count of page of all series
 * @apiGroup Series
 *
 * @apiSampleRequest /series/page/count
 */
router.get('/page/count', (req, res) => {
  Manager.getSeriesesGroupCount(Response.handleResponse(res));
});

/**
 * @api {get} /series/:id Request a series by id
 * @apiName GetSeries
 * @apiDescription get a series by id
 * @apiGroup Series
 *
 * @apiSampleRequest /loop/59edf04f6658ad05762276dd
 */
router.get('/:id', (req, res) => {
  const id = req.params.id;
  Manager.getSeries(id, Response.handleResponse(res));
});

/**
 * @api {get} /series?page=:n Request series in page n
 * @apiName GetSeriesInPage
 * @apiDescription get all series in page n
 * @apiGroup Series
 *
 * @apiSampleRequest /loop?page=3
 */

/**
 * @api {get} /series Request series in first page
 * @apiName GetSeriesInFirstPage
 * @apiDescription get all series in first page
 * @apiGroup Series
 *
 * @apiSampleRequest /loop
 */
router.get('/', (req, res, next) => {
  const queryLength = Object.keys(req.query).length;
  const pageNo = req.query.page;

  if (queryLength === 0) {
    Manager.getSeriesesbyGroup(1, Response.handleResponse(res));
  } else if (queryLength === 1 && pageNo) {
    const no = parseInt(pageNo, 10);
    if (isNaN(no)) {
      res.json(Response.returnError(400, 'Invalid page no'));
      return;
    }
    Manager.getSeriesesbyGroup(no, Response.handleResponse(res));
  } else {
    next();
  }
});

module.exports = router;
