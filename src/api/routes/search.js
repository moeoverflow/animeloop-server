const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager/manager.js');
const Response = require('../utils/response.js');

/**
 * @api {get} /search/series?value=:value Request search resutls of series
 * @apiName SearchSeries
 * @apiDescription
 * get search results of series by single multiple value.
 *
 * @apiGroup Search
 *
 * @apiParam {String} value value can be multiple items splited by blankspace.
 *
 * search items contain:
 *
 * - title in Chinese, Romaji, English, Japanese,
 *
 * - description in English
 *
 * - genres in English,
 *
 * - season (example: 2014-1)
 *
 * @apiSampleRequest /search/series
 */
router.get('/series', (req, res, next) => {
  const queryLength = Object.keys(req.query).length;
  const value = req.query.value;


  if (queryLength === 0) {
    res.json(Response.returnError(400, 'please specific a search value'));
  } else if (queryLength === 1 && value) {
    Manager.searchSeries(value, Response.handleResponse(res));
  } else {
    next();
  }
});

module.exports = router;
