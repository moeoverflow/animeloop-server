const express = require('express');

const router = express.Router();
const Manager = require('../../core/manager.js');
const Response = require('../utils/response.js');

/**
 * @api {get} /tag?loop=:id Request tags of loop id
 * @apiName GetSeriesInFirstPage
 * @apiDescription get tags of loop id
 * @apiGroup Tag
 *
 * @apiSampleRequest /tag?loop=5983fce1ed0b995c09a26d07
 */
router.get('/', (req, res, next) => {
  const queryLength = Object.keys(req.query).length;
  const loopId = req.query.loop;

  if (queryLength === 0) {
    res.json(Response.returnError(400, 'please specific a loop id'));
  } else if (queryLength === 1 && loopId) {
    Manager.getTagsByLoop(loopId, Response.handleResponse(res));
  } else {
    next();
  }
});

module.exports = router;
